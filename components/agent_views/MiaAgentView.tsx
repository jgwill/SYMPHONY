

import React, { useContext, useCallback, useEffect, useState } from 'react';
import { AppContext } from '../../App';
import { AppContextType, AppStep, PlanFile, DevelopmentPlan, PlanAction } from '../../types';
import { Cog6ToothIcon, AcademicCapIcon, ListBulletIcon, CheckIcon, ArrowRightIcon, ArrowPathIcon, SparklesIcon, XMarkIcon, CodeBracketIcon, DocumentIcon, ChevronDownIcon } from '../icons';
import { MarkdownEditorPreview } from '../MarkdownEditorPreview';
import { geminiService } from '../../services/geminiService';
import { cn } from '../../lib/utils';
import Card from '../Card';
import { marked } from 'marked'; 
declare var DOMPurify: any; 


const ActionDisplayItem: React.FC<{ action: PlanAction; level: number }> = ({ action, level }) => {
  return (
    <div style={{ paddingLeft: `${level * 1}rem` }} className="my-0.5">
      <div className="flex items-start">
        <div className={cn("w-3 h-3 border rounded-sm flex items-center justify-center mr-1.5 flex-shrink-0 mt-0.5", action.completed ? 'bg-green-500 border-green-500' : 'border-slate-500')}>
          {action.completed && <CheckIcon className="w-2 h-2 text-white" />}
        </div>
        <span className={cn("text-xs break-words", action.completed ? 'line-through text-slate-500' : 'text-slate-300')}>
          {action.text.split(" AC:")[0]}
        </span>
      </div>
      {action.subActions.map(sub => <ActionDisplayItem key={sub.id} action={sub} level={level + 1} />)}
    </div>
  );
};
ActionDisplayItem.displayName = 'ActionDisplayItem';

const FilePlanCard: React.FC<{ file: PlanFile, onImplement: (file: PlanFile) => void }> = ({ file, onImplement }) => {
  const [isOpen, setIsOpen] = useState(file.status !== 'implemented');

  return (
    <Card className="mb-2 bg-slate-800" bodyClassName="p-0">
      <div className="flex justify-between items-center p-2 cursor-pointer hover:bg-slate-700/50" onClick={() => setIsOpen(!isOpen)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setIsOpen(!isOpen)} aria-expanded={isOpen}>
        <div className="flex items-center overflow-hidden">
          <DocumentIcon className="w-4 h-4 mr-2 text-indigo-400 flex-shrink-0"/>
          <span className="text-xs font-semibold text-indigo-300 truncate" title={file.path}>{file.path}</span>
        </div>
        <div className="flex items-center flex-shrink-0 ml-2">
          <span className={`text-xs px-1.5 py-0.5 rounded-full capitalize ${file.status === 'implemented' ? 'bg-green-600 text-white' : 'bg-slate-600 text-slate-300'}`}>{file.status}</span>
          <ChevronDownIcon className={`w-4 h-4 ml-2 text-slate-400 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
        </div>
      </div>
      {isOpen && (
        <div className="p-2 border-t border-slate-700">
          <div className="space-y-1 mb-2">
            {file.actions.map(action => <ActionDisplayItem key={action.id} action={action} level={0} />)}
          </div>
           {file.status !== 'implemented' && (
            <button
                onClick={() => onImplement(file)}
                className="w-full text-center text-xs py-1 bg-slate-700 hover:bg-slate-600 text-cyan-300 rounded-md transition-colors font-medium flex items-center justify-center gap-1"
                >
                {file.status === 'revised' ? 'Continue Implementing' : 'Implement'} with Aetherial <ArrowRightIcon className="w-3 h-3"/>
            </button>
           )}
        </div>
      )}
    </Card>
  );
};
FilePlanCard.displayName = 'FilePlanCard';


const MiaAgentView: React.FC = () => {
  const context = useContext(AppContext) as AppContextType | null;
  const [isGeneratingSpec, setIsGeneratingSpec] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportContent, setExportContent] = useState<{ llm: string; agent: string; human: string } | null>(null);
  const [nyroFeedback, setNyroFeedback] = useState<{ type: string; content: string } | null>(null);
  const [isProcessingWithNyro, setIsProcessingWithNyro] = useState<false | 'validation' | 'refinement'>(false);
  const [isAutoValidating, setIsAutoValidating] = useState(false);
  const [lastValidatedSpec, setLastValidatedSpec] = useState<string | null>(null);


  const handleGenerateSpecDoc = useCallback(async () => {
    if (!context || !context.agentMemory.sharedContext.initialConceptualizationText) {
      context?.setAppError("Cannot generate SpecLang: Initial conceptualization text is missing. Start via Workspace Agent.");
      return;
    }
    setIsGeneratingSpec(true);
    context.setIsLoading(true);
    context.setAppError(null);
    try {
      const { initialConceptualizationText, initialAnalysisMarkdown } = context.agentMemory.sharedContext;
      let promptForSpec = initialConceptualizationText;
      if (initialAnalysisMarkdown) {
        promptForSpec = `Based on the user's initial text AND the preliminary AI analysis below, generate a comprehensive SpecLang document.

### User's Initial Text:
${initialConceptualizationText}

### Preliminary AI Analysis:
${initialAnalysisMarkdown}
---
Now, create the full SpecLang document.`;
      }
      const specDoc = await geminiService.nlToSpec(promptForSpec);
      context.updateSharedContext({ specLangDocument: specDoc, currentPlan: null }); 
    } catch (error) {
      const errorMessage = (error as Error).message;
      context.setAppError(errorMessage);
      context.updateSharedContext({ specLangDocument: `Error generating SpecLang: ${errorMessage}` });
    } finally {
      context.setIsLoading(false);
      setIsGeneratingSpec(false);
    }
  }, [context]);

  const handleGeneratePlanFromSpec = useCallback(async () => {
    if (!context || !context.agentMemory.sharedContext.specLangDocument) {
      context?.setAppError("Cannot generate Plan: SpecLang document is missing. Generate one first.");
      return;
    }
    setIsGeneratingPlan(true);
    context.setIsLoading(true);
    context.setAppError(null);
    try {
      const plan = await geminiService.generatePlanFromSpec(
        context.agentMemory.sharedContext.specLangDocument,
        context.agentMemory.sharedContext.chatMessages, 
        context.agentMemory.sharedContext.planningIdeas?.map(p=>p.text).join('\n') 
      );
      context.updateSharedContext({ currentPlan: plan });
    } catch (error) {
      const errorMessage = (error as Error).message;
      context.setAppError(errorMessage);
      context.updateSharedContext({ currentPlan: null });
    } finally {
      context.setIsLoading(false);
      setIsGeneratingPlan(false);
    }
  }, [context]);
  
  const handleSpecLangChange = useCallback((newContent: string) => {
    context?.updateSharedContext({ specLangDocument: newContent, currentPlan: null }); 
  }, [context]);

  const handleImplementFileFromPlan = (file: PlanFile) => {
    if (!context) return;
    context.updateSharedContext({ activeFileForImplementation: file });
    context.setActiveAgentId('aetherial.gemini.v1'); 
  };

  const handleAnalyzeContext = async () => {
    if (!context) return;
    const contextSummary = `Repository: ${context.selectedRepo?.name || 'N/A'}\nConceptualization: ${context.agentMemory.sharedContext.initialConceptualizationText || 'N/A'}`;
    setIsAnalyzing(true);
    context.setIsLoading(true);
    context.setAppError(null);
    try {
        const specDoc = await geminiService.analyzeCodebaseForSpec(contextSummary);
        context.updateSharedContext({ specLangDocument: specDoc, currentPlan: null });
    } catch (error) {
        context.setAppError((error as Error).message);
    } finally {
        context.setIsLoading(false);
        setIsAnalyzing(false);
    }
  };

  const handleRefineSpec = async () => {
      if (!context || !context.agentMemory.sharedContext.specLangDocument) {
          context.setAppError("No SpecLang document to refine.");
          return;
      }
      setIsRefining(true);
      context.setIsLoading(true);
      context.setAppError(null);
      try {
          const refinedSpec = await geminiService.refineSpecWithBdd(context.agentMemory.sharedContext.specLangDocument);
          context.updateSharedContext({ specLangDocument: refinedSpec });
      } catch (error) {
          context.setAppError((error as Error).message);
      } finally {
          context.setIsLoading(false);
          setIsRefining(false);
      }
  };

  const handleOpenExportModal = async () => {
    if (!context || !context.agentMemory.sharedContext.specLangDocument) {
      context.setAppError("No SpecLang document to export.");
      return;
    }
    context.setIsLoading(true);
    setExportContent(null);
    setIsExportModalOpen(true);
    try {
        const exports = await geminiService.exportSpec(context.agentMemory.sharedContext.specLangDocument);
        setExportContent(exports);
    } catch (error) {
        context.setAppError((error as Error).message);
        setExportContent({llm: "Error generating export.", agent: "Error generating export.", human: "Error generating export."});
    } finally {
        context.setIsLoading(false);
    }
  };

 const handleNyroProcessing = useCallback(async (type: 'validation' | 'refinement', isAuto: boolean = false) => {
    if (!context || !context.agentMemory.sharedContext.specLangDocument) {
      if (!isAuto) context.setAppError("No SpecLang document to process.");
      return;
    }

    if (isAuto) {
      setIsAutoValidating(true);
    } else {
      setIsProcessingWithNyro(type);
      context.setIsLoading(true);
    }
    
    setNyroFeedback(null);
    if (!isAuto) context.setAppError(null);

    try {
      const specDoc = context.agentMemory.sharedContext.specLangDocument;
      let result = '';
      if (type === 'validation') {
        result = await geminiService.validateSyntaxAndLogic(specDoc);
        setNyroFeedback({ type: 'Validation Feedback', content: result });
      } else {
        result = await geminiService.suggestRefinements(specDoc);
        setNyroFeedback({ type: 'Refinement Suggestion', content: result });
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      if (!isAuto) context.setAppError(errorMessage);
      setNyroFeedback({ type: 'Error', content: errorMessage });
    } finally {
      if (isAuto) {
        setIsAutoValidating(false);
      } else {
        context.setIsLoading(false);
        setIsProcessingWithNyro(false);
      }
    }
  }, [context]);

  const { specLangDocument, currentPlan, initialConceptualizationText } = context?.agentMemory.sharedContext || {};

  useEffect(() => {
    const handler = setTimeout(() => {
      if (specLangDocument && specLangDocument.trim() && specLangDocument !== lastValidatedSpec && !isProcessingWithNyro && !isAutoValidating) {
        handleNyroProcessing('validation', true);
        setLastValidatedSpec(specLangDocument);
      }
    }, 1500);

    return () => clearTimeout(handler);
  }, [specLangDocument, lastValidatedSpec, isProcessingWithNyro, isAutoValidating, handleNyroProcessing]);


  useEffect(() => {
    if (context?.activeAgentId === 'mia.architect.v1' && 
        initialConceptualizationText && 
        !specLangDocument &&
        !context.isLoading && !isGeneratingSpec) { 
      handleGenerateSpecDoc();
    }
  }, [context?.activeAgentId, initialConceptualizationText, specLangDocument, context?.isLoading, isGeneratingSpec, handleGenerateSpecDoc]);


  if (!context) return <div className="p-4 text-slate-500">Mia Agent context not available.</div>;

  const { isLoading, appError } = context; 

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col bg-slate-850 text-slate-200 overflow-hidden">
      <div className="flex items-center mb-4 flex-shrink-0">
        <span className="text-3xl mr-3" role="img" aria-label="Mia Agent Glyph">🧠</span>
        <h2 id="miaPageTitle" className="text-xl sm:text-2xl font-semibold text-slate-100">Mia: Architecture & SpecLang Hub</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4 flex-shrink-0">
        <button 
          onClick={handleGenerateSpecDoc}
          disabled={isLoading || !initialConceptualizationText?.trim()}
          className={cn(
            "flex items-center justify-center gap-2 w-full px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-md shadow-md transition-colors text-xs sm:text-sm",
            "disabled:opacity-60 disabled:cursor-not-allowed"
          )}
          title={!initialConceptualizationText?.trim() ? "Enter initial conceptualization in Workspace Agent first" : "Generate or refresh SpecLang document"}
        >
          {isGeneratingSpec ? (
            <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Generating Spec...</>
          ) : (
            <><AcademicCapIcon className="w-4 h-4" /> Gen/Refresh SpecLang</>
          )}
        </button>
        <button 
          onClick={handleGeneratePlanFromSpec}
          disabled={isLoading || !specLangDocument?.trim() || specLangDocument.startsWith("Error")}
          className={cn(
            "flex items-center justify-center gap-2 w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-md shadow-md transition-colors text-xs sm:text-sm",
            "disabled:opacity-60 disabled:cursor-not-allowed"
          )}
          title={!specLangDocument?.trim() || specLangDocument.startsWith("Error") ? "Generate SpecLang document first" : "Generate development plan from current SpecLang"}
        >
          {isGeneratingPlan ? ( 
            <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Generating Plan...</>
          ) : (
            <><ListBulletIcon className="w-4 h-4" /> Gen Plan from Spec</>
          )}
        </button>
      </div>

      <Card title="Reverse-Engineering Toolkit" titleClassName="text-base" headerContent={<CodeBracketIcon className="w-5 h-5 text-green-400"/>} className="mb-4 flex-shrink-0 bg-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button onClick={handleAnalyzeContext} disabled={isLoading} className="flex items-center justify-center gap-1.5 w-full px-2 py-1.5 bg-green-700 hover:bg-green-600 text-white font-semibold rounded-md shadow transition-colors text-xs disabled:opacity-60">
                {isAnalyzing ? <><ArrowPathIcon className="w-3.5 h-3.5 animate-spin"/> Analyzing...</> : "Analyze Context & Extract Spec"}
            </button>
            <button onClick={() => handleRefineSpec()} disabled={isLoading || !specLangDocument} className="flex items-center justify-center gap-1.5 w-full px-2 py-1.5 bg-green-700 hover:bg-green-600 text-white font-semibold rounded-md shadow transition-colors text-xs disabled:opacity-60">
                {isRefining ? <><ArrowPathIcon className="w-3.5 h-3.5 animate-spin"/> Refining...</> : "Refine Spec with BDD"}
            </button>
            <button onClick={handleOpenExportModal} disabled={isLoading || !specLangDocument} className="flex items-center justify-center gap-1.5 w-full px-2 py-1.5 bg-green-700 hover:bg-green-600 text-white font-semibold rounded-md shadow transition-colors text-xs disabled:opacity-60">
                Export Spec...
            </button>
        </div>
      </Card>
      
      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 overflow-hidden min-h-0">
        
        <div className="flex flex-col overflow-hidden rounded-md border border-slate-700">
            <div className="text-sm sm:text-base font-medium text-slate-300 bg-slate-750 p-2 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center">
                    <AcademicCapIcon className="w-4 h-4 mr-2 text-sky-400"/> SpecLang Document
                    {isAutoValidating && <span className="text-xs text-slate-400 animate-pulse ml-2">(Nyro is analyzing...)</span>}
                </div>
                <div className="flex items-center gap-1.5">
                    <button 
                        onClick={() => handleNyroProcessing('refinement')} 
                        disabled={isLoading || !specLangDocument}
                        className="text-xs text-teal-300 hover:text-teal-200 bg-slate-700 px-2 py-1 rounded-md flex items-center gap-1.5 disabled:opacity-50"
                        title="Get refinement suggestions from Nyro Agent"
                    >
                       {isProcessingWithNyro === 'refinement' ? <ArrowPathIcon className="w-3 h-3 animate-spin"/> : <SparklesIcon className="w-3 h-3" />} Refine
                    </button>
                    <button 
                        onClick={() => handleNyroProcessing('validation')} 
                        disabled={isLoading || !specLangDocument}
                        className="text-xs text-purple-300 hover:text-purple-200 bg-slate-700 px-2 py-1 rounded-md flex items-center gap-1.5 disabled:opacity-50"
                        title="Validate SpecLang with Nyro Agent"
                    >
                       {isProcessingWithNyro === 'validation' ? <ArrowPathIcon className="w-3 h-3 animate-spin"/> : '♠️'} Validate
                    </button>
                </div>
            </div>
            <div className="flex-grow overflow-hidden min-h-0 bg-slate-800 flex flex-col">
                <div className="flex-grow min-h-0">
                    {(isLoading && !specLangDocument && initialConceptualizationText && !isGeneratingSpec) && <div className="h-full flex items-center justify-center text-slate-400 text-xs">Loading SpecLang...</div>}
                    {(isGeneratingSpec || isAnalyzing || isRefining) && <div className="h-full flex items-center justify-center text-slate-400 text-xs"><ArrowPathIcon className="w-5 h-5 animate-spin mr-2"/>Mia is crafting the SpecLang...</div>}
                    {(!isLoading && !isGeneratingSpec && !isAnalyzing && !isRefining) && appError && specLangDocument?.startsWith("Error") && (
                        <div className="p-2 bg-red-700/10 text-red-400 h-full text-xs"><p className="font-semibold mb-1">Error:</p><p className="whitespace-pre-wrap">{specLangDocument || appError}</p></div>
                    )}
                    {specLangDocument && !specLangDocument.startsWith("Error") && !isGeneratingSpec && !isAnalyzing && !isRefining ? (
                    <MarkdownEditorPreview
                        initialContent={specLangDocument}
                        onContentChange={handleSpecLangChange}
                        readOnly={isLoading}
                        viewerHeight="h-full"
                        ariaLabelledBy="miaPageTitle" 
                    />
                    ) : (!isLoading && !isGeneratingSpec && !isAnalyzing && !isRefining && !appError && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 p-2 text-xs text-center">
                        <AcademicCapIcon className="w-10 h-10 mb-1" />
                        <p>No SpecLang document.</p>
                        <p className="mt-0.5">Use "Gen/Refresh SpecLang" or provide initial text in Workspace.</p>
                    </div>
                    ))}
                </div>

                {nyroFeedback && (
                    <div className="flex-shrink-0 border-t border-slate-700 p-2 mt-2">
                        <div className="flex justify-between items-center mb-1">
                            <h4 className={cn("text-sm font-semibold capitalize flex items-center gap-2", nyroFeedback.type === 'Validation Feedback' ? "text-purple-300" : nyroFeedback.type === 'Refinement Suggestion' ? "text-teal-300" : "text-red-400")}>
                                {nyroFeedback.type === 'Validation Feedback' && <CodeBracketIcon className="w-4 h-4" />}
                                {nyroFeedback.type === 'Refinement Suggestion' && <SparklesIcon className="w-4 h-4" />}
                                ♠️ Nyro's {nyroFeedback.type}
                            </h4>
                            <button onClick={() => setNyroFeedback(null)} className="p-1 text-slate-400 hover:text-white" aria-label="Close feedback panel">
                                <XMarkIcon className="w-4 h-4"/>
                            </button>
                        </div>
                        <div 
                            className="whitespace-pre-wrap font-sans text-slate-300 text-xs leading-relaxed bg-slate-850 p-2 rounded-sm custom-scrollbar max-h-32 overflow-y-auto markdown-preview-content"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(nyroFeedback.content) as string) }}
                        ></div>
                    </div>
                )}
            </div>
        </div>

        
        <div className="flex flex-col overflow-hidden rounded-md border border-slate-700">
            <div className="bg-slate-750 p-2 flex-shrink-0 border-b border-slate-700/50">
              <h3 className="text-sm sm:text-base font-medium text-slate-300 flex items-center">
                  <ListBulletIcon className="w-4 h-4 mr-2 text-indigo-400"/> Development Plan
              </h3>
            </div>
            <div className="flex-grow overflow-y-auto custom-scrollbar p-2 min-h-0 bg-slate-800">
                {isGeneratingPlan && <div className="h-full flex items-center justify-center text-slate-400 text-xs"><ArrowPathIcon className="w-5 h-5 animate-spin mr-2"/>Mia is structuring the plan...</div>}
                {!isGeneratingPlan && currentPlan ? (
                    currentPlan.files.map(file => (
                        <FilePlanCard key={file.id} file={file} onImplement={handleImplementFileFromPlan} />
                    ))
                ) : !isGeneratingPlan && (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 p-2 text-xs text-center">
                    <ListBulletIcon className="w-10 h-10 mb-1" />
                    <p>{specLangDocument && !specLangDocument.startsWith("Error") ? "No plan generated from current SpecLang." : "Generate SpecLang first, then a plan."}</p>
                     <p className="mt-0.5">Use "Gen Plan from Spec".</p>
                </div>
                )}
                 {appError && !isLoading && !isGeneratingPlan && currentPlan === null && (
                    <div className="p-2 bg-red-700/10 text-red-400 h-full text-xs"><p className="font-semibold mb-1">Error loading plan:</p><p className="whitespace-pre-wrap">{appError}</p></div>
                 )}
            </div>
        </div>
      </div>
      
      <button 
        onClick={() => context?.setActiveAgentId('workspace.default.v1')}
        className="mt-3 sm:mt-4 w-full max-w-xs mx-auto px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md text-sm flex-shrink-0"
        aria-label="Deactivate Mia agent view and return to main flow"
      >
        Return to Workspace
      </button>

      {isExportModalOpen && <ExportModal content={exportContent} onClose={() => setIsExportModalOpen(false)} />}
    </div>
  );
};
MiaAgentView.displayName = 'MiaAgentView';


// Simple inline modal component for export view
const ExportModal: React.FC<{ content: { llm: string; agent: string; human: string } | null, onClose: () => void }> = ({ content, onClose }) => {
    const [activeTab, setActiveTab] = useState<'human' | 'agent' | 'llm'>('human');
    const tabs = [
        { id: 'human', label: 'Human Review' },
        { id: 'agent', label: 'Agent Discussion' },
        { id: 'llm', label: 'LLM Export (YAML)' }
    ];

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="export-modal-title">
            <div className="bg-slate-800 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-slate-700 flex-shrink-0">
                    <h2 id="export-modal-title" className="text-lg font-semibold text-slate-200">Export SpecLang</h2>
                    <button onClick={onClose} className="p-1 text-slate-400 hover:text-white"><XMarkIcon className="w-5 h-5"/></button>
                </div>
                <div className="flex-shrink-0 border-b border-slate-700">
                    <nav className="flex space-x-2 p-2">
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={cn(
                                'px-3 py-1.5 rounded-md text-sm font-medium',
                                activeTab === tab.id ? 'bg-slate-700 text-cyan-300' : 'text-slate-400 hover:bg-slate-750'
                            )}>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="flex-grow p-4 overflow-y-auto custom-scrollbar">
                    {!content ? (
                        <div className="flex items-center justify-center h-full text-slate-400">
                            <ArrowPathIcon className="w-8 h-8 animate-spin mr-3"/>
                            Generating export formats...
                        </div>
                    ) : (
                        <div className="markdown-preview-content">
                            <pre className="whitespace-pre-wrap font-sans text-sm bg-slate-900 p-3 rounded-md">
                                {content[activeTab]}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
ExportModal.displayName = 'ExportModal';


export default MiaAgentView;