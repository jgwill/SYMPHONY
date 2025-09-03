

import React, { useContext, useState, useCallback, useEffect } from 'react';
import { AppContext } from '../../App'; 
import { AppContextType, AppStep, ChatMessage, StructuredComponentIdea, ConceptualUIElement } from '../../types';
// Fix: Added ChatBubbleLeftEllipsisIcon to the import list.
import { FolderIcon, PlusCircleIcon, TicketIcon, PhotoIcon, CodeBracketIcon, ArrowUpOnSquareIcon, LightBulbIcon, PaperAirplaneIcon, ArrowPathIcon, SparklesIcon, CubeTransparentIcon, CircleStackIcon, MusicalNoteIcon, AcademicCapIcon, ChatBubbleLeftEllipsisIcon } from '../icons';
import { cn } from '../../lib/utils';
import { geminiService } from '../../services/geminiService'; 
import Card from '../Card';

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
  const [workflowResults, setWorkflowResults] = useState<{ miaSpec: string; aetherialIdeas: StructuredComponentIdea[]; orpheusMap: ConceptualUIElement[] } | null>(null);
  const [workflowImageResult, setWorkflowImageResult] = useState<{ base64Bytes: string, mimeType: string } | null>(null);


  useEffect(() => {
    const conceptualizationTextFromContext = context?.agentMemory.sharedContext.initialConceptualizationText || '';
    if (initialPrompt !== conceptualizationTextFromContext) {
      setInitialPrompt(conceptualizationTextFromContext);
    }
  }, [context?.agentMemory.sharedContext.initialConceptualizationText, initialPrompt]);


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
    setWorkflowImageResult(null); 

    try {
      const specDoc = await geminiService.nlToSpec(initialPrompt.trim());
      context.updateSharedContext({ specLangDocument: specDoc });

      const [ideas, map] = await Promise.all([
        geminiService.generateUIComponentIdeas(specDoc),
        geminiService.mapSpecToConceptualUI(specDoc)
      ]);

      setWorkflowResults({
        miaSpec: specDoc,
        aetherialIdeas: ideas,
        orpheusMap: map
      });
      
      if (ideas && ideas.length > 0) {
        const firstIdea = ideas[0];
        const visualsPrompt = `Create a UI wireframe sketch for a component named "${firstIdea.name}". Description: "${firstIdea.description}". Key features to represent: ${firstIdea.keyFeatures.join(', ')}.`;
        const imageResult = await geminiService.generateImage(visualsPrompt);
        setWorkflowImageResult(imageResult);
      }

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
  const { initialConceptualizationText, currentPlan, specLangDocument } = agentMemory.sharedContext;

  const implementedFilesCount = currentPlan?.files.filter(f => f.status === 'implemented').length || 0;

  return (
    <div className="h-full flex flex-col bg-slate-900 text-slate-200">
      <div className="flex items-center mb-4 flex-shrink-0 px-4 sm:px-6 pt-4 sm:pt-6">
        <span className="text-3xl mr-3" role="img" aria-label="Workspace Agent Glyph">🏠</span>
        <h2 className="text-2xl sm:text-3xl font-semibold text-slate-100">Symphony Conductor</h2>
      </div>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-6 pb-4 sm:pb-6 overflow-y-auto custom-scrollbar">
        {/* Left Column: Main Workflow */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {feedbackMessage && <div className="p-2 bg-green-600/20 text-green-300 border border-green-500 rounded-md text-xs text-center">{feedbackMessage}</div>}
          
          <Card 
            title="Stage 1: Conceptualize" 
            titleClassName="text-lg font-semibold text-cyan-400" 
            headerContent={<LightBulbIcon className="w-6 h-6 text-cyan-400" />} 
            className="bg-slate-800 shadow-md"
          >
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
                  {isConceptualizing ? <><ArrowPathIcon className="w-4 h-4 animate-spin"/> Processing...</> : "Start Symphony (Handoff to Mia 🧠)"}
                </button>
                <button onClick={handleRunWorkflow} disabled={isLoading || !initialPrompt.trim()} className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-md shadow transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2">
                  {isWorkflowRunning ? <><ArrowPathIcon className="w-4 h-4 animate-spin"/> Running...</> : <><MusicalNoteIcon className="w-4 h-4"/> Run Spec-to-Sketch Symphony</>}
                </button>
            </div>
          </Card>
          
          <Card 
            title="Stage 2: Architect & Plan" 
            titleClassName={cn("text-lg font-semibold", initialConceptualizationText ? "text-indigo-400" : "text-slate-500")} 
            headerContent={<AcademicCapIcon className={cn("w-6 h-6", initialConceptualizationText ? "text-indigo-400" : "text-slate-600")} />} 
            className={cn("bg-slate-800 shadow-md", !initialConceptualizationText && "opacity-60")}
          >
            {!initialConceptualizationText ? (
              <p className="text-sm text-slate-500 text-center py-4">Complete Stage 1 to unlock.</p>
            ) : (
              <div className="text-sm">
                <p className="text-slate-400 mb-2">A SpecLang document has been {specLangDocument ? 'generated' : 'requested'}. Mia will architect the solution and create a development plan.</p>
                <button onClick={() => context.setActiveAgentId('mia.architect.v1')} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-md shadow">
                  Go to Mia's Hub 🧠
                </button>
              </div>
            )}
          </Card>

           <Card 
            title="Stage 3: Implement & Refine" 
            titleClassName={cn("text-lg font-semibold", currentPlan ? "text-teal-400" : "text-slate-500")} 
            headerContent={<CodeBracketIcon className={cn("w-6 h-6", currentPlan ? "text-teal-400" : "text-slate-600")} />} 
            className={cn("bg-slate-800 shadow-md", !currentPlan && "opacity-60")}
          >
            {!currentPlan ? (
              <p className="text-sm text-slate-500 text-center py-4">Generate a plan with Mia in Stage 2 to unlock.</p>
            ) : (
              <div className="text-sm">
                <p className="text-slate-400 mb-2">Plan is ready. {currentPlan.files.length} files to create/modify. {implementedFilesCount} completed.</p>
                <button onClick={() => context.setActiveAgentId('mia.architect.v1')} className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-md shadow">
                  Implement with Aetherial 💎
                </button>
              </div>
            )}
          </Card>

          <Card 
            title="Stage 4: Finalize" 
            titleClassName={cn("text-lg font-semibold", implementedFilesCount > 0 ? "text-green-400" : "text-slate-500")} 
            headerContent={<ArrowUpOnSquareIcon className={cn("w-6 h-6", implementedFilesCount > 0 ? "text-green-400" : "text-slate-600")} />} 
            className={cn("bg-slate-800 shadow-md", implementedFilesCount === 0 && "opacity-60")}
          >
             {implementedFilesCount === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Implement files in Stage 3 to unlock.</p>
            ) : (
              <div className="text-sm">
                <p className="text-slate-400 mb-2">{implementedFilesCount} file(s) implemented and ready to be committed.</p>
                <button onClick={() => context.setCurrentStep(AppStep.COMMIT)} className="w-full py-2 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-md shadow">
                  Go to Commit Page
                </button>
              </div>
            )}
          </Card>

        </div>

        {/* Right Column: Info and Tools */}
        <div className="flex flex-col gap-4">
           {savedSessions && savedSessions.length > 0 && (
            <Card title="Session State" titleClassName="text-lg font-semibold" headerContent={<CircleStackIcon className="w-6 h-6" />} className="bg-slate-800 shadow-md">
              <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1 pr-1">
                {savedSessions.map(session => (
                  <button key={session.id} onClick={() => context?.loadSavedSession(session.id)} className="w-full text-left p-2 bg-slate-700 hover:bg-slate-650 rounded-md text-sm text-slate-300 truncate" title={session.title} disabled={isLoading}>
                    {session.title} <span className="text-xs text-slate-400">({new Date(session.timestamp).toLocaleDateString()})</span>
                  </button>
                ))}
              </div>
            </Card>
          )}

           <Card title="General Q&A" titleClassName="text-lg font-semibold" headerContent={<ChatBubbleLeftEllipsisIcon className="w-6 h-6" />} className="bg-slate-800 shadow-md flex-grow flex flex-col min-h-[300px]">
              <div className="flex-grow overflow-y-auto mb-2 pr-1 space-y-2 custom-scrollbar p-2 rounded-md min-h-[100px]">
                {agentMemory.sharedContext.chatMessages?.map((msg) => (
                  <div key={msg.id} className={cn("flex items-start", msg.sender === 'user' ? 'justify-end' : 'justify-start', 'chat-message-fade-in')}>
                    <div className={cn("max-w-md p-2 rounded-lg shadow text-xs", msg.sender === 'user' ? 'bg-cyan-700 text-white' : 'bg-slate-700 text-slate-200')}>
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    </div>
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
              <div className="relative mt-auto">
                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()} placeholder="Ask the Workspace Agent..." className="w-full p-2 pl-3 pr-10 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:ring-1 focus:ring-cyan-500 disabled:opacity-50 text-sm" disabled={isLoading} aria-label="Chat input with Workspace Agent"/>
                <button type="button" onClick={() => !isLoading && chatInput.trim() && handleSendMessage()} disabled={isLoading || !chatInput.trim()} className={cn("absolute right-2 top-1/2 -translate-y-1/2 p-1 text-cyan-400 hover:text-cyan-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400", (isLoading || !chatInput.trim()) && "opacity-50 cursor-not-allowed")} aria-label="Send chat message">
                  {isSendingMessage ? <ArrowPathIcon className="w-4 h-4 animate-spin"/> : <PaperAirplaneIcon className="w-4 h-4" />}
                </button>
              </div>
           </Card>

        </div>
      </div>
    </div>
  );
};
WorkspaceAgentView.displayName = 'WorkspaceAgentView';

export default WorkspaceAgentView;