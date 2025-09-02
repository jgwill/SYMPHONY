

import React, { useContext, useState, useCallback, useEffect } from 'react';
import { AppContext } from '../../App'; 
import { AppContextType, AppStep, ChatMessage, StructuredComponentIdea, ConceptualUIElement } from '../../types';
import { FolderIcon, PlusCircleIcon, TicketIcon, PhotoIcon, CodeBracketIcon, ArrowUpOnSquareIcon, LightBulbIcon, PaperAirplaneIcon, ArrowPathIcon, SparklesIcon, CubeTransparentIcon } from '../icons';
import { MOCK_REPOSITORIES } from '../../constants';
import { cn } from '../../lib/utils';
import { geminiService } from '../../services/geminiService'; 
import Card from '../Card';

interface WorkflowResult {
    miaSpec: string;
    aetherialIdeas: StructuredComponentIdea[];
    orpheusMap: ConceptualUIElement[];
}

const OrpheusMapDisplay: React.FC<{ elements: ConceptualUIElement[], level?: number }> = ({ elements, level = 0 }) => (
    <div style={{ marginLeft: `${level * 1}rem` }}>
      {elements.map(el => (
        <div key={el.id} className="text-xs p-1 my-1 bg-slate-700/50 rounded">
          <span className="font-semibold text-purple-300">{el.type}:</span> <span className="italic text-slate-300">{el.name || ''}</span>
          {el.children && <OrpheusMapDisplay elements={el.children} level={level + 1} />}
        </div>
      ))}
    </div>
);
OrpheusMapDisplay.displayName = 'OrpheusMapDisplay';

const AetherialIdeasDisplay: React.FC<{ ideas: StructuredComponentIdea[] }> = ({ ideas }) => (
    <div className="space-y-2">
      {ideas.map((idea, index) => (
        <div key={index} className="p-2 bg-slate-700/50 rounded">
          <h5 className="text-sm font-semibold text-cyan-300">{idea.name}</h5>
          <p className="text-xs text-slate-400">{idea.description}</p>
          <ul className="list-disc list-inside text-xs text-slate-400 pl-2 mt-1">
              {idea.keyFeatures.slice(0, 2).map(f => <li key={f}>{f}</li>)}
          </ul>
        </div>
      ))}
    </div>
);
AetherialIdeasDisplay.displayName = 'AetherialIdeasDisplay';


const WorkspaceAgentView: React.FC = () => {
  const context = useContext(AppContext) as AppContextType | null;
  const [initialPrompt, setInitialPrompt] = useState<string>('');
  const [chatInput, setChatInput] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isConceptualizing, setIsConceptualizing] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isWorkflowRunning, setIsWorkflowRunning] = useState(false);
  const [workflowResults, setWorkflowResults] = useState<WorkflowResult | null>(null);


  useEffect(() => {
    const conceptualizationTextFromContext = context?.agentMemory.sharedContext.initialConceptualizationText || '';
    if (initialPrompt !== conceptualizationTextFromContext) {
      setInitialPrompt(conceptualizationTextFromContext);
    }
  }, [context?.agentMemory.sharedContext.initialConceptualizationText]);


  const handleStartNewProject = useCallback(async () => {
    if (!context || !initialPrompt.trim()) {
      context?.setAppError("Please enter an initial conceptualization prompt.");
      return;
    }
    setIsConceptualizing(true);
    context.setIsLoading(true);
    context.setAppError(null);

    try {
      const analysisMarkdown = await geminiService.conceptualize(initialPrompt.trim());
      
      context.updateSharedContext({ 
        initialConceptualizationText: initialPrompt.trim(),
        initialAnalysisMarkdown: analysisMarkdown,
        specLangDocument: null, 
        currentPlan: null, 
        chatMessages: [], 
        planningIdeas: []
      });

      setFeedbackMessage("Initial analysis complete. Handing off to Mia (🧠)...");
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      context.setActiveAgentId('mia.architect.v1'); 
      setFeedbackMessage(null);

    } catch (error) {
       context.setAppError((error as Error).message || "Failed to initiate conceptualization.");
       console.error("Conceptualization error:", error);
    } finally {
      context.setIsLoading(false);
      setIsConceptualizing(false);
    }
  }, [context, initialPrompt]);

  const handleRunWorkflow = useCallback(async () => {
    if (!context || !initialPrompt.trim()) {
      context?.setAppError("Please enter an initial conceptualization prompt to run the workflow.");
      return;
    }
    setIsWorkflowRunning(true);
    context.setIsLoading(true);
    context.setAppError(null);
    setWorkflowResults(null);

    try {
      // Step 1: Mia generates the SpecLang document
      const specDoc = await geminiService.nlToSpec(initialPrompt.trim());
      context.updateSharedContext({ specLangDocument: specDoc });

      // Step 2 & 3: Aetherial and Orpheus process the spec in parallel
      const [ideas, map] = await Promise.all([
        geminiService.generateUIComponentIdeas(specDoc),
        geminiService.mapSpecToConceptualUI(specDoc)
      ]);

      setWorkflowResults({
        miaSpec: specDoc,
        aetherialIdeas: ideas,
        orpheusMap: map
      });

    } catch (error) {
       context.setAppError((error as Error).message || "Workflow failed.");
    } finally {
      context.setIsLoading(false);
      setIsWorkflowRunning(false);
    }
  }, [context, initialPrompt]);


  const handleSendMessage = async () => {
    if (!chatInput.trim() || !context || context.isLoading) return;
    const newUserMessage: ChatMessage = { id: Date.now().toString(), sender: 'user', text: chatInput };
    const currentChatInputText = chatInput;
    context.updateSharedContext({ chatMessages: [...(context.agentMemory.sharedContext.chatMessages || []), newUserMessage] });
    setChatInput('');
    setIsSendingMessage(true);
    context.setIsLoading(true);
    context.setAppError(null);
    try {
      const historyForAI = [...(context.agentMemory.sharedContext.chatMessages || [])]; 
      const aiResponse = await geminiService.askQuestion(currentChatInputText, historyForAI);
      context.updateSharedContext({ chatMessages: [...historyForAI, aiResponse] });
    } catch (error) {
      context.setAppError((error as Error).message);
       const errorMsg: ChatMessage = {id: Date.now().toString(), sender:'ai', text: `Error: ${(error as Error).message}`};
       context.updateSharedContext({ chatMessages: [...(context.agentMemory.sharedContext.chatMessages || []), errorMsg] });
    } finally {
      context.setIsLoading(false);
      setIsSendingMessage(false);
    }
  };

  if (!context) return <div className="p-4 text-slate-500">Workspace Agent context not available.</div>;
  const { isLoading, agentMemory, savedSessions } = context;

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col bg-slate-900 text-slate-200 overflow-y-auto custom-scrollbar">
      <div className="flex items-center mb-6 flex-shrink-0">
        <span className="text-3xl mr-3" role="img" aria-label="Workspace Agent Glyph">🏠</span>
        <h2 className="text-2xl sm:text-3xl font-semibold text-slate-100">Workspace Agent</h2>
      </div>

      {feedbackMessage && <div className="mb-4 p-2 bg-green-600/20 text-green-300 border border-green-500 rounded-md text-xs text-center">{feedbackMessage}</div>}

      <Card title="Start New Project" titleClassName="text-lg font-semibold text-cyan-400" headerContent={<PlusCircleIcon className="w-6 h-6" />} className="mb-6 bg-slate-800 shadow-md">
        <textarea
          value={initialPrompt}
          onChange={(e) => setInitialPrompt(e.target.value)}
          placeholder="Describe your project idea or the main task..."
          className="w-full h-24 p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 resize-none focus:outline-none focus:ring-1 focus:ring-cyan-500 placeholder-slate-400 text-sm mb-2"
          aria-label="Initial project conceptualization prompt"
          disabled={isLoading}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button onClick={handleStartNewProject} disabled={isLoading || !initialPrompt.trim()} className="w-full px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-md shadow transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2">
              {isConceptualizing ? <><ArrowPathIcon className="w-4 h-4 animate-spin"/> Conceptualizing...</> : "Conceptualize & Handoff to Mia"}
            </button>
            <button onClick={handleRunWorkflow} disabled={isLoading || !initialPrompt.trim()} className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-md shadow transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2">
              {isWorkflowRunning ? <><ArrowPathIcon className="w-4 h-4 animate-spin"/> Running...</> : <><SparklesIcon className="w-4 h-4"/> Spec-to-UI Concept Workflow</>}
            </button>
        </div>
      </Card>

      {workflowResults && (
        <Card title="Automated Workflow Results" titleClassName="text-lg font-semibold text-indigo-400" className="mb-6 bg-slate-800 shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h4 className="text-base font-semibold text-slate-300 mb-2 flex items-center"><SparklesIcon className="w-5 h-5 mr-2 text-cyan-400"/>Aetherial's UI Ideas (💎)</h4>
                    <AetherialIdeasDisplay ideas={workflowResults.aetherialIdeas} />
                </div>
                 <div>
                    <h4 className="text-base font-semibold text-slate-300 mb-2 flex items-center"><CubeTransparentIcon className="w-5 h-5 mr-2 text-purple-400"/>Orpheus's Conceptual Map (🧊)</h4>
                    <OrpheusMapDisplay elements={workflowResults.orpheusMap} />
                </div>
            </div>
            <div className="mt-4 border-t border-slate-700 pt-2">
                <p className="text-xs text-slate-400">The full SpecLang document generated by Mia (🧠) has been saved to the shared context and can be viewed in her agent panel.</p>
            </div>
        </Card>
      )}

      {savedSessions && savedSessions.length > 0 && (
        <Card title="Load Saved Session" titleClassName="text-lg font-semibold text-slate-300" headerContent={<FolderIcon className="w-6 h-6" />} className="mb-6 bg-slate-800 shadow-md">
          <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1 pr-1">
            {savedSessions.map(session => (
              <button key={session.id} onClick={() => context?.loadSavedSession(session.id)} className="w-full text-left p-2 bg-slate-700 hover:bg-slate-650 rounded-md text-sm text-slate-300 truncate" title={session.title} disabled={isLoading}>
                {session.title} <span className="text-xs text-slate-400">({new Date(session.timestamp).toLocaleDateString()})</span>
              </button>
            ))}
          </div>
        </Card>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <button onClick={() => context?.setCurrentStep(AppStep.VISUALS_TOOL)} disabled={isLoading} className="p-4 bg-slate-800 hover:bg-slate-750 rounded-lg shadow-md flex flex-col items-center justify-center text-center transition-colors disabled:opacity-60">
            <PhotoIcon className="w-8 h-8 mb-2 text-purple-400"/>
            <span className="text-sm font-medium text-slate-200">Open Visuals Tool</span>
            <span className="text-xs text-slate-400">Images & Diagrams</span>
        </button>
        <button onClick={() => context.selectedRepo && (context.agentMemory.sharedContext.currentPlan || context.agentMemory.sharedContext.specLangDocument) ? context?.setCurrentStep(AppStep.COMMIT) : context?.setAppError("Select a repo and have an active plan/spec.")} disabled={isLoading || !context.selectedRepo} className="p-4 bg-slate-800 hover:bg-slate-750 rounded-lg shadow-md flex flex-col items-center justify-center text-center transition-colors disabled:opacity-60 disabled:cursor-not-allowed" title={!context.selectedRepo ? "Select a repository first" : "Commit current changes"}>
            <ArrowUpOnSquareIcon className="w-8 h-8 mb-2 text-green-400"/>
            <span className="text-sm font-medium text-slate-200">Commit Changes</span>
            <span className="text-xs text-slate-400">Finalize & Push</span>
        </button>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-700 flex-grow flex flex-col min-h-0">
        <h3 className="text-md font-semibold text-slate-300 mb-2 flex items-center">
          <LightBulbIcon className="w-5 h-5 mr-2 text-yellow-400" /> General Q&A with Workspace Agent
        </h3>
        <div className="flex-grow overflow-y-auto mb-2 pr-1 space-y-2 custom-scrollbar bg-slate-800 p-2 rounded-md min-h-[100px]">
          {agentMemory.sharedContext.chatMessages?.map((msg) => (
            <div key={msg.id} className={cn("flex items-start", msg.sender === 'user' ? 'justify-end' : 'justify-start', 'chat-message-fade-in')}>
              <div className={cn("max-w-md p-2 rounded-lg shadow text-xs", msg.sender === 'user' ? 'bg-cyan-700 text-white' : 'bg-slate-700 text-slate-200')}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              </div>
              {msg.sender === 'ai' && !isLoading && !isSendingMessage && (
                <button onClick={() => { if(context) { const current = context.agentMemory.sharedContext.initialConceptualizationText || ""; context.updateSharedContext({ initialConceptualizationText: `${current}\n\n--- Insight from Chat ---\n${msg.text}` }); setFeedbackMessage("Insight added! Switch to Mia (🧠) to update SpecLang & Plan."); setTimeout(() => setFeedbackMessage(null), 4000); } }} className="ml-1.5 p-1 text-yellow-400 hover:text-yellow-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-yellow-400 rounded-full" title="Add this insight to conceptualization text (for Mia to process)" aria-label="Add insight to conceptualization">
                  <LightBulbIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
          {isSendingMessage && (
            <div className="flex justify-start chat-message-fade-in">
                 <div className="max-w-md p-2 rounded-lg shadow bg-slate-700 text-slate-200 flex items-center text-xs">
                    <ArrowPathIcon className="w-3 h-3 animate-spin mr-1.5"/> Thinking...
                 </div>
            </div>
           )}
        </div>
        <div className="relative">
          <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()} placeholder="Ask the Workspace Agent anything..." className="w-full p-2 pl-3 pr-10 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:ring-1 focus:ring-cyan-500 disabled:opacity-50 text-sm" disabled={isLoading} aria-label="Chat input with Workspace Agent"/>
          <button type="button" onClick={() => !isLoading && chatInput.trim() && handleSendMessage()} disabled={isLoading || !chatInput.trim()} className={cn("absolute right-2 top-1/2 -translate-y-1/2 p-1 text-cyan-400 hover:text-cyan-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400", (isLoading || !chatInput.trim()) && "opacity-50 cursor-not-allowed")} aria-label="Send chat message">
            {isSendingMessage ? <ArrowPathIcon className="w-4 h-4 animate-spin"/> : <PaperAirplaneIcon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
WorkspaceAgentView.displayName = 'WorkspaceAgentView';

export default WorkspaceAgentView;