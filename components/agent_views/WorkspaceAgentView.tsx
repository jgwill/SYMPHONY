

import React, { useContext, useState, useCallback, useEffect } from 'react';
import { AppContext } from '../../App'; 
import { AppContextType, AppStep, ChatMessage } from '../../types';
import { FolderIcon, PlusCircleIcon, TicketIcon, PhotoIcon, CodeBracketIcon, ArrowUpOnSquareIcon, LightBulbIcon, PaperAirplaneIcon, ArrowPathIcon } from '../icons';
import { MOCK_REPOSITORIES } from '../../constants';
import { cn } from '../../lib/utils';
import { geminiService } from '../../services/geminiService'; 

const WorkspaceAgentView: React.FC = () => {
  const context = useContext(AppContext) as AppContextType | null;
  const [initialPrompt, setInitialPrompt] = useState<string>('');
  const [chatInput, setChatInput] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isConceptualizing, setIsConceptualizing] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);


  useEffect(() => {
    // This effect syncs the local input with the global context.
    // It should run ONLY when the global context changes.
    const conceptualizationTextFromContext = context?.agentMemory.sharedContext.initialConceptualizationText || '';
    if (initialPrompt !== conceptualizationTextFromContext) {
      setInitialPrompt(conceptualizationTextFromContext);
    }
    // DO NOT add initialPrompt to dependency array, it causes an infinite loop that erases user input.
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
      // The Workspace agent now performs its own analysis first.
      const analysisMarkdown = await geminiService.conceptualize(initialPrompt.trim());
      
      // Update context with both raw text and the new analysis
      context.updateSharedContext({ 
        initialConceptualizationText: initialPrompt.trim(),
        initialAnalysisMarkdown: analysisMarkdown,
        specLangDocument: null, 
        currentPlan: null, 
        chatMessages: [], 
        planningIdeas: []
      });

      // Provide feedback and handoff to Mia
      setFeedbackMessage("Initial analysis complete. Handing off to Mia (🧠)...");
      await new Promise(resolve => setTimeout(resolve, 1500)); // Wait for user to see message
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

  const handleLoadSession = (sessionId: string) => {
    context?.loadSavedSession(sessionId);
  };

  const handleOpenVisualsTool = () => {
    context?.setCurrentStep(AppStep.VISUALS_TOOL);
  };

  const handleCommitChanges = () => {
    if (!context?.selectedRepo) {
        context?.setAppError("Please select a repository first or ensure your current plan is tied to one.");
        return;
    }
    if (!context?.agentMemory.sharedContext.currentPlan && !context?.agentMemory.sharedContext.specLangDocument){
        context?.setAppError("No active plan or SpecLang document to commit from.");
        return;
    }
    context?.setCurrentStep(AppStep.COMMIT);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !context || context.isLoading) return;

    const newUserMessage: ChatMessage = { id: Date.now().toString(), sender: 'user', text: chatInput };
    const currentChatInputText = chatInput;
    
    // Update UI immediately with user message
    context.updateSharedContext({
        chatMessages: [...(context.agentMemory.sharedContext.chatMessages || []), newUserMessage]
    });
    setChatInput('');
    
    setIsSendingMessage(true);
    context.setIsLoading(true); // Global loading
    context.setAppError(null);

    try {
      // Use the state *before* adding AI response for history
      const historyForAI = [...(context.agentMemory.sharedContext.chatMessages || [])]; 
      const aiResponse = await geminiService.askQuestion(currentChatInputText, historyForAI);
      // Update context with AI response
      context.updateSharedContext({
        chatMessages: [...historyForAI, aiResponse] 
      });
    } catch (error) {
      context.setAppError((error as Error).message);
       // Optionally add error message to chat
       const errorMsg: ChatMessage = {id: Date.now().toString(), sender:'ai', text: `Error: ${(error as Error).message}`};
       context.updateSharedContext({
         chatMessages: [...(context.agentMemory.sharedContext.chatMessages || []), errorMsg]
       });
    } finally {
      context.setIsLoading(false);
      setIsSendingMessage(false);
    }
  };

  const handleAddInsightToConceptualization = (insightText: string) => {
    if (!context) return;
    const currentConceptualization = context.agentMemory.sharedContext.initialConceptualizationText || "";
    const newConceptualization = 
      `${currentConceptualization}${currentConceptualization.trim() ? '\n\n' : ''}--- Insight from Workspace Chat ---\n${insightText.trim()}\n---`;

    context.updateSharedContext({
      initialConceptualizationText: newConceptualization,
      specLangDocument: null, 
      currentPlan: null,      
    });

    setFeedbackMessage("Insight added! Switch to Mia (🧠) to update SpecLang & Plan.");
    setTimeout(() => setFeedbackMessage(null), 4000);
  };


  if (!context) return <div className="p-4 text-slate-500">Workspace Agent context not available.</div>;
  const { isLoading, agentMemory, savedSessions } = context;

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col bg-slate-900 text-slate-200 overflow-y-auto custom-scrollbar">
      <div className="flex items-center mb-6 flex-shrink-0">
        <span className="text-3xl mr-3" role="img" aria-label="Workspace Agent Glyph">🏠</span>
        <h2 className="text-2xl sm:text-3xl font-semibold text-slate-100">Workspace Agent</h2>
      </div>

      {feedbackMessage && (
        <div className="mb-4 p-2 bg-green-600/20 text-green-300 border border-green-500 rounded-md text-xs text-center">
          {feedbackMessage}
        </div>
      )}

      {/* Start New Project */}
      <div className="mb-6 p-4 bg-slate-800 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center">
          <PlusCircleIcon className="w-6 h-6 mr-2" /> Start New Project
        </h3>
        <textarea
          value={initialPrompt}
          onChange={(e) => setInitialPrompt(e.target.value)}
          placeholder="Describe your project idea or the main task..."
          className="w-full h-24 p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 resize-none focus:outline-none focus:ring-1 focus:ring-cyan-500 placeholder-slate-400 text-sm mb-2"
          aria-label="Initial project conceptualization prompt"
          disabled={isLoading}
        />
        <button
          onClick={handleStartNewProject}
          disabled={isLoading || !initialPrompt.trim()}
          className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-md shadow transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
        >
          {isConceptualizing ? (
            <><ArrowPathIcon className="w-4 h-4 animate-spin"/> Conceptualizing...</>
          ) : "Conceptualize & Handoff to Mia"}
        </button>
      </div>

      {/* Saved Sessions */}
      {savedSessions && savedSessions.length > 0 && (
        <div className="mb-6 p-4 bg-slate-800 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-slate-300 mb-3 flex items-center">
            <FolderIcon className="w-6 h-6 mr-2" /> Load Saved Session
          </h3>
          <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1 pr-1">
            {savedSessions.map(session => (
              <button
                key={session.id}
                onClick={() => handleLoadSession(session.id)}
                className="w-full text-left p-2 bg-slate-700 hover:bg-slate-650 rounded-md text-sm text-slate-300 truncate"
                title={session.title}
                disabled={isLoading}
              >
                {session.title} <span className="text-xs text-slate-400">({new Date(session.timestamp).toLocaleDateString()})</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Tools & Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <button
            onClick={handleOpenVisualsTool}
            disabled={isLoading}
            className="p-4 bg-slate-800 hover:bg-slate-750 rounded-lg shadow-md flex flex-col items-center justify-center text-center transition-colors disabled:opacity-60"
        >
            <PhotoIcon className="w-8 h-8 mb-2 text-purple-400"/>
            <span className="text-sm font-medium text-slate-200">Open Visuals Tool</span>
            <span className="text-xs text-slate-400">Images & Diagrams</span>
        </button>
        <button
            onClick={handleCommitChanges}
            disabled={isLoading || !context.selectedRepo}
            className="p-4 bg-slate-800 hover:bg-slate-750 rounded-lg shadow-md flex flex-col items-center justify-center text-center transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            title={!context.selectedRepo ? "Select a repository first" : "Commit current changes"}
        >
            <ArrowUpOnSquareIcon className="w-8 h-8 mb-2 text-green-400"/>
            <span className="text-sm font-medium text-slate-200">Commit Changes</span>
            <span className="text-xs text-slate-400">Finalize & Push</span>
        </button>
      </div>


      {/* General Q&A Chat Section */}
      <div className="mt-auto pt-4 border-t border-slate-700 flex-grow flex flex-col min-h-0">
        <h3 className="text-md font-semibold text-slate-300 mb-2 flex items-center">
          <LightBulbIcon className="w-5 h-5 mr-2 text-yellow-400" /> General Q&A with Workspace Agent
        </h3>
        <div className="flex-grow overflow-y-auto mb-2 pr-1 space-y-2 custom-scrollbar bg-slate-800 p-2 rounded-md min-h-[100px]">
          {agentMemory.sharedContext.chatMessages?.map((msg) => (
            <div key={msg.id} className={cn("flex items-start", msg.sender === 'user' ? 'justify-end' : 'justify-start', 'chat-message-fade-in')}>
              <div className={cn(
                "max-w-md p-2 rounded-lg shadow text-xs",
                msg.sender === 'user' ? 'bg-cyan-700 text-white' : 'bg-slate-700 text-slate-200'
              )}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              </div>
              {msg.sender === 'ai' && !isLoading && !isSendingMessage && (
                <button
                  onClick={() => handleAddInsightToConceptualization(msg.text)}
                  className="ml-1.5 p-1 text-yellow-400 hover:text-yellow-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-yellow-400 rounded-full"
                  title="Add this insight to conceptualization text (for Mia to process)"
                  aria-label="Add insight to conceptualization"
                >
                  <LightBulbIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
          {isSendingMessage && ( // Show loading indicator for AI response specifically
            <div className="flex justify-start chat-message-fade-in">
                 <div className="max-w-md p-2 rounded-lg shadow bg-slate-700 text-slate-200 flex items-center text-xs">
                    <ArrowPathIcon className="w-3 h-3 animate-spin mr-1.5"/>
                    Thinking...
                 </div>
            </div>
           )}
        </div>
        <div className="relative">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
            placeholder="Ask the Workspace Agent anything..."
            className="w-full p-2 pl-3 pr-10 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:ring-1 focus:ring-cyan-500 disabled:opacity-50 text-sm"
            disabled={isLoading}
            aria-label="Chat input with Workspace Agent"
          />
          <button
            type="button"
            onClick={() => !isLoading && chatInput.trim() && handleSendMessage()}
            disabled={isLoading || !chatInput.trim()}
            className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 p-1 text-cyan-400 hover:text-cyan-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400",
                (isLoading || !chatInput.trim()) && "opacity-50 cursor-not-allowed"
            )}
            aria-label="Send chat message"
          >
            {isSendingMessage ? <ArrowPathIcon className="w-4 h-4 animate-spin"/> : <PaperAirplaneIcon className="w-4 h-4" />}
          </button>
        </div>
      </div>

    </div>
  );
};
WorkspaceAgentView.displayName = 'WorkspaceAgentView';

export default WorkspaceAgentView;