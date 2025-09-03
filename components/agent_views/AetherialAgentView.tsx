
import React, { useContext, useState, useCallback, useEffect } from 'react';
import { AppContext } from '../../App'; 
import { AppContextType, PlanFile, PlanAction, AppStep, StructuredComponentIdea, SharedAgentContext } from '../../types';
import { SparklesIcon, PaperAirplaneIcon, DocumentIcon, PhotoIcon, CheckIcon as CheckIconSmall, PlusIcon, ArrowPathIcon as RegenerateIcon, ArrowPathIcon } from '../icons'; 
import { cn } from '../../lib/utils';
import { geminiService } from '../../services/geminiService'; 
import { MarkdownEditorPreview } from '../MarkdownEditorPreview'; 
import SampleDropdown from '../SampleDropdown';
import { AETHERIAL_IDEATION_SAMPLES, AETHERIAL_REVISE_SAMPLES } from '../../constants/samples';

// Re-using ActionChecklistItem for this view
const ActionChecklistItem: React.FC<{action: PlanAction, onToggle: (actionId: string) => void, pathPrefix?: string}> = ({action, onToggle, pathPrefix = ''}) => {
  const fullActionId = `${pathPrefix}${action.id}`;
  return (
    <div className="ml-1 my-0.5">
        <button
            type="button"
            onClick={() => onToggle(action.id)}
            className="flex items-start space-x-1.5 py-0.5 hover:bg-slate-750 rounded px-1 cursor-pointer w-full text-left group focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500"
            aria-label={action.completed ? `Mark '${action.text}' as incomplete` : `Mark '${action.text}' as complete`}
        >
            <div className={cn(
            "w-3 h-3 border rounded-sm flex items-center justify-center flex-shrink-0 transition-colors mt-0.5",
            action.completed ? 'bg-cyan-500 border-cyan-500' : 'border-slate-500 group-hover:border-cyan-400'
            )}>
            {action.completed && <CheckIconSmall className="w-2 h-2 text-white" />}
            </div>
            <span className={cn("text-xs transition-colors break-words text-left", action.completed ? 'line-through text-slate-500' : 'text-slate-300 group-hover:text-slate-100')}>{action.text.split(" AC:")[0]}</span>
        </button>
        {action.subActions && action.subActions.length > 0 && (
            <div className="ml-2 pl-1 border-l border-slate-700">
            {action.subActions.map(sub => (
                <ActionChecklistItem key={sub.id} action={sub} onToggle={onToggle} pathPrefix={`${fullActionId}.`} />
            ))}
            </div>
        )}
    </div>
  );
}
ActionChecklistItem.displayName = 'ActionChecklistItem';

const DiffLineDisplay: React.FC<{ line: string }> = ({ line }) => {
  const firstChar = line[0];
  let style = 'text-slate-400';
  let prefix = '  '; 

  if (firstChar === '+') {
    style = 'bg-green-800/30 text-green-300';
    prefix = '+ ';
  } else if (firstChar === '-') {
    style = 'bg-red-800/30 text-red-300';
    prefix = '- ';
  } else if (line.startsWith('@@') || line.startsWith('---') || line.startsWith('+++')) {
    style = 'text-purple-400';
    prefix = '';
     return <div className={cn('py-0.5 px-1 text-xs font-mono', style)}>{line}</div>;
  }
  return (
    <div className={cn('py-0.5 px-1 text-xs font-mono', style)}>
      <span className="select-none">{prefix}</span>
      <span>{firstChar === '+' || firstChar === '-' ? line.substring(1) : line}</span>
    </div>
  );
};
DiffLineDisplay.displayName = 'DiffLineDisplay';

const AetherialAgentView: React.FC = () => {
  const context = useContext(AppContext) as AppContextType | null;
  const [specLangSectionForIdeation, setSpecLangSectionForIdeation] = useState<string>('');
  const [generatedIdeas, setGeneratedIdeas] = useState<StructuredComponentIdea[]>([]); 
  const [activeFile, setActiveFile] = useState<PlanFile | null>(null);
  const [revisePrompt, setRevisePrompt] = useState<string>('');
  const [fileContentForEdit, setFileContentForEdit] = useState<string>('');
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [isRevisingFile, setIsRevisingFile] = useState(false);
  const [isGeneratingInitialFile, setIsGeneratingInitialFile] = useState(false);


  useEffect(() => {
    if (context?.agentMemory.sharedContext.activeFileForImplementation) {
        const currentActiveFile = context.agentMemory.sharedContext.activeFileForImplementation;
        setActiveFile(currentActiveFile);
        setFileContentForEdit(currentActiveFile.newContent || currentActiveFile.content || `// Content for ${currentActiveFile.path}`);
        
        if (currentActiveFile.status === 'planned' && !currentActiveFile.newContent && !context.isLoading && !isGeneratingInitialFile) {
            handleInitialFileGeneration(currentActiveFile);
        }
    } else {
        setActiveFile(null);
        setFileContentForEdit('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context?.agentMemory.sharedContext.activeFileForImplementation, context?.isLoading]);


  const handleInitialFileGeneration = useCallback(async (fileToGenerate: PlanFile) => {
    if (!context) return;
    setIsGeneratingInitialFile(true);
    context.setIsLoading(true);
    context.setAppError(null);
    try {
      const relevantSpecSection = context.agentMemory.sharedContext.specLangDocument || `Mock SpecLang section for ${fileToGenerate.path}`;
      const result = await geminiService.implementFile(fileToGenerate.path, fileToGenerate.actions.map(a => a.text), fileToGenerate.content, relevantSpecSection);
      const updatedFile = {...fileToGenerate, newContent: result.newContent, diff: result.diff, status: 'revised' as PlanFile['status']};
      context.updateSharedContext({ activeFileForImplementation: updatedFile });
      if (context.agentMemory.sharedContext.currentPlan) {
        context.updateSharedContext({
            currentPlan: {
                ...context.agentMemory.sharedContext.currentPlan,
                files: context.agentMemory.sharedContext.currentPlan.files.map(f => f.id === fileToGenerate.id ? updatedFile : f)
            }
        });
      }
      setFileContentForEdit(result.newContent);
    } catch (error) {
      context.setAppError((error as Error).message);
    } finally {
      context.setIsLoading(false);
      setIsGeneratingInitialFile(false);
    }
  }, [context]);

  const handleReviseFile = async () => {
    if (!activeFile || !revisePrompt.trim() || !context || context.isLoading) return;
    
    setIsRevisingFile(true);
    context.setIsLoading(true);
    context.setAppError(null);
    try {
      const relevantSpecSection = context.agentMemory.sharedContext.specLangDocument || `Mock SpecLang context for revision of ${activeFile.path}`;
      const currentFileContentForRevision = activeFile.newContent || activeFile.content;
      const result = await geminiService.implementFile(activeFile.path, [revisePrompt.trim()], currentFileContentForRevision, relevantSpecSection);
      const updatedFileAfterRevision = { ...activeFile, newContent: result.newContent, diff: result.diff, status: 'revised' as PlanFile['status'] };
      
      context.updateSharedContext({ activeFileForImplementation: updatedFileAfterRevision });
      if (context.agentMemory.sharedContext.currentPlan) {
        context.updateSharedContext({
            currentPlan: {
                ...context.agentMemory.sharedContext.currentPlan,
                files: context.agentMemory.sharedContext.currentPlan.files.map(f => f.id === activeFile.id ? updatedFileAfterRevision : f)
            }
        });
      }
      setFileContentForEdit(result.newContent);
      setRevisePrompt('');
    } catch (error) {
        context.setAppError((error as Error).message);
    } finally {
        context.setIsLoading(false);
        setIsRevisingFile(false);
    }
  };

  const handleToggleActionInFile = (actionId: string) => {
    if (!activeFile || !context) return;
    const toggleRecursive = (actions: PlanAction[]): PlanAction[] => {
      return actions.map(act => {
        if (act.id === actionId) return {...act, completed: !act.completed};
        return {...act, subActions: toggleRecursive(act.subActions)};
      });
    };
    const updatedActiveFile = {...activeFile, actions: toggleRecursive(activeFile.actions)};
    context.updateSharedContext({ activeFileForImplementation: updatedActiveFile });
    if (context.agentMemory.sharedContext.currentPlan) {
        context.updateSharedContext({
            currentPlan: {
                ...context.agentMemory.sharedContext.currentPlan,
                files: context.agentMemory.sharedContext.currentPlan.files.map(f => f.id === activeFile.id ? updatedActiveFile : f)
            }
        });
      }
  };
  
  const handleMarkAsImplemented = () => {
    if (!activeFile || !context) return;
    const finalContent = fileContentForEdit;
    const updatedFile: PlanFile = { ...activeFile, status: 'implemented', content: finalContent, newContent: finalContent, diff: '' };

    const hasPlan = !!context.agentMemory.sharedContext.currentPlan;

    const updates: Partial<SharedAgentContext> = {
        activeFileForImplementation: null,
    };

    if (hasPlan) {
        const currentPlan = context.agentMemory.sharedContext.currentPlan!;
        updates.currentPlan = {
            ...currentPlan,
            files: currentPlan.files.map(f => (f.id === activeFile.id ? updatedFile : f)),
        };
    }
    
    context.updateSharedContext(updates);
    
    alert(`${activeFile.path} marked as implemented.`);
    
    context.setActiveAgentId(hasPlan ? 'mia.architect.v1' : 'workspace.default.v1');
  };

  const handleGenerateComponentIdeas = useCallback(async () => {
    if (!context || !specLangSectionForIdeation.trim()) {
        context?.setAppError("Please provide a SpecLang section for component ideation context.");
        return;
    }
    setIsGeneratingIdeas(true);
    context.setIsLoading(true);
    setGeneratedIdeas([]); 
    context.setAppError(null);
    
    try {
      const ideas = await geminiService.generateUIComponentIdeas(specLangSectionForIdeation);
      setGeneratedIdeas(ideas);
    } catch (error) {
      context.setAppError((error as Error).message);
    } finally {
      context.setIsLoading(false);
      setIsGeneratingIdeas(false);
    }
  }, [context, specLangSectionForIdeation]);
  
  const handleFileContentEditorChange = (newCode: string) => {
    setFileContentForEdit(newCode);
    if (activeFile && context) {
        
        const updatedFile = { ...activeFile, newContent: newCode, status: 'revised' as PlanFile['status'] };
        context.updateSharedContext({ activeFileForImplementation: updatedFile });
    }
  };

  const handleSendToVisualsAgent = (idea: StructuredComponentIdea) => {
    if (!context) return;
    const promptText = `Create a visual sketch or wireframe for a UI component named "${idea.name}".
Description: "${idea.description}".
Key features that must be visually represented if possible:
- ${idea.keyFeatures.join('\n- ')}
Consider these technologies if they influence the visual style: ${idea.technologies.join(', ')}.
The sketch should help visualize how users would interact with these acceptance criteria:
- ${idea.acceptanceCriteria.join('\n- ')}`;
    context.updateSharedContext({ promptForVisualsAgent: promptText });
    context.setActiveAgentId('visuals.tool.v1');
  };


  if (!context) return <div className="p-4 text-slate-500">Aetherial Agent context not available.</div>;
  const isLoading = context.isLoading;

  return (
    <div className="p-3 sm:p-4 h-full flex flex-col bg-slate-850 text-slate-200 overflow-y-auto custom-scrollbar">
      <div className="flex items-center mb-3 flex-shrink-0">
        <span className="text-3xl mr-2" role="img" aria-label="Aetherial Agent Glyph">💎</span>
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-100">Aetherial: UI Ideation & File Implementation</h2>
      </div>
      
      {!activeFile ? (
        <>
          <p className="text-slate-400 mb-1 text-sm flex-shrink-0">
            Aetherial helps generate UI component ideas from your SpecLang document.
          </p>
          <p className="text-slate-400 mb-3 text-xs flex-shrink-0">
            Paste a relevant section from the SpecLang document below (e.g., from Mia's view). Or, select a file from the File Tree to work on its implementation.
          </p>
          <div className="flex justify-end mb-1">
            <SampleDropdown samples={AETHERIAL_IDEATION_SAMPLES} onSelect={setSpecLangSectionForIdeation} />
          </div>
          <textarea
            value={specLangSectionForIdeation}
            onChange={(e) => setSpecLangSectionForIdeation(e.target.value)}
            placeholder="Paste a section from your SpecLang document for component ideation..."
            className="w-full h-20 p-2 sm:p-3 bg-slate-800 border border-slate-700 rounded-md text-slate-200 resize-none focus:outline-none focus:ring-1 focus:ring-cyan-500 placeholder-slate-500 custom-scrollbar text-sm mb-3 flex-shrink-0"
            aria-label="SpecLang section input for component ideation"
            disabled={isLoading}
          />
          <button 
            onClick={handleGenerateComponentIdeas}
            disabled={isLoading || !specLangSectionForIdeation.trim()}
            className={cn(
              "flex items-center justify-center gap-2 w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-md shadow-md transition-colors text-sm mb-4 flex-shrink-0",
              "disabled:opacity-60 disabled:cursor-not-allowed"
            )}
            aria-label="Generate UI component ideas from SpecLang section"
          >
            {isGeneratingIdeas ? <><ArrowPathIcon className="w-4 h-4 animate-spin" />Generating Ideas...</> : <><SparklesIcon className="w-4 h-4" />Generate Component Ideas</> }
          </button>
          {generatedIdeas.length > 0 && ( 
            <div className="mt-3 border-t border-slate-700 pt-3 flex-grow min-h-0">
              <h3 className="text-md sm:text-lg font-semibold text-slate-100 mb-2">Generated Component Ideas:</h3>
              <div className="space-y-3 overflow-y-auto custom-scrollbar h-full"> 
                {generatedIdeas.map((idea, index) => (
                  <div key={index} className="p-3 bg-slate-800 rounded-md border border-slate-700/50 shadow-md">
                    <div className="flex justify-between items-start mb-1.5">
                        <h4 className="text-sm sm:text-base font-semibold text-cyan-300 flex items-center">
                            <SparklesIcon className="w-4 h-4 mr-2 text-yellow-400 flex-shrink-0"/>
                            {idea.name}
                        </h4>
                        <button
                            onClick={() => handleSendToVisualsAgent(idea)}
                            className="text-xs text-purple-300 hover:text-purple-200 bg-purple-600 hover:bg-purple-500 px-2 py-1 rounded-md flex items-center gap-1.5 transition-colors"
                            title="Sketch this component with Visuals Agent"
                            aria-label={`Send ${idea.name} to Visuals Agent for sketch`}
                        >
                           <PhotoIcon className="w-3.5 h-3.5"/> Sketch with Visuals Agent 🎨
                        </button>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{idea.description}</p>
                    
                    <strong className="text-xs text-slate-300 block mt-2">Key Features:</strong>
                    <ul className="list-disc list-inside text-xs text-slate-400 pl-2">
                      {idea.keyFeatures.map((feature, i) => <li key={`kf-${index}-${i}`}>{feature}</li>)}
                    </ul>
            
                    <strong className="text-xs text-slate-300 block mt-2">Technologies:</strong>
                    <ul className="list-disc list-inside text-xs text-slate-400 pl-2">
                      {idea.technologies.map((tech, i) => <li key={`tech-${index}-${i}`}>{tech}</li>)}
                    </ul>
            
                    <strong className="text-xs text-slate-300 block mt-2">Acceptance Criteria:</strong>
                    <ul className="list-disc list-inside text-xs text-slate-400 pl-2">
                      {idea.acceptanceCriteria.map((ac, i) => <li key={`ac-${index}-${i}`}>{ac}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        // File Implementation Mode
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex items-center mb-2 flex-shrink-0">
                <DocumentIcon className="w-5 h-5 mr-2 text-cyan-400 flex-shrink-0" />
                <h3 className="text-lg sm:text-xl font-semibold text-slate-100 truncate">{activeFile.path}</h3>
                <button 
                    title="Regenerate content for this file"
                    onClick={() => handleInitialFileGeneration(activeFile)} 
                    disabled={isLoading || isGeneratingInitialFile}
                    className="ml-auto p-1 text-slate-400 hover:text-cyan-400 disabled:opacity-50"
                > { isGeneratingInitialFile ? <ArrowPathIcon className="w-4 h-4 animate-spin"/> : <RegenerateIcon className="w-4 h-4"/> } </button>
            </div>
            {isGeneratingInitialFile && <div className="flex-grow flex items-center justify-center text-slate-400"><ArrowPathIcon className="w-8 h-8 animate-spin mr-2 text-cyan-500"/>Aetherial is crafting {activeFile.path}...</div>}
            
            {!isGeneratingInitialFile && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-grow min-h-0 overflow-hidden">
                <div className="md:col-span-2 bg-slate-800 rounded-lg flex flex-col overflow-auto custom-scrollbar">
                    <MarkdownEditorPreview
                        initialContent={fileContentForEdit}
                        onContentChange={handleFileContentEditorChange}
                        readOnly={isLoading}
                        viewerHeight="h-full"
                        ariaLabelledBy={`file-content-editor-${activeFile.id}`}
                        initialMode="edit"
                    />
                </div>
                <div className="bg-slate-800 rounded-lg p-2 flex flex-col overflow-y-auto custom-scrollbar">
                    <h4 className="text-sm font-semibold text-slate-200 mb-1 flex-shrink-0">Actions Checklist</h4>
                    <div className="space-y-0.5 flex-grow">
                        {activeFile.actions.map(action => (
                            <ActionChecklistItem key={action.id} action={action} onToggle={() => handleToggleActionInFile(action.id)} />
                        ))}
                    </div>
                     <button 
                        onClick={() => { 
                            if (!context || !activeFile) return;
                            const newAct: PlanAction = {id:`man_${Date.now()}`,text:"New manual task. How: Manually. AC: Task done. Comp: Low",completed:false,subActions:[]};
                            const updatedFile = {...activeFile, actions: [...activeFile.actions, newAct]};
                            context.updateSharedContext({ activeFileForImplementation: updatedFile });
                         }}
                        className="mt-1 flex items-center text-xs text-cyan-400 hover:text-cyan-300 py-0.5"
                    ><PlusIcon className="w-3 h-3 mr-1"/> Add Action</button>

                    {activeFile.diff && (
                        <div className="mt-2 border-t border-slate-700 pt-2 flex-shrink-0">
                            <h4 className="text-xs font-semibold text-slate-500 mb-1">Diff:</h4>
                            <div className="bg-slate-850 rounded p-1 text-xs max-h-28 overflow-y-auto custom-scrollbar">
                                {activeFile.diff.split('\n').map((line, index) => (
                                <DiffLineDisplay key={`${activeFile.id}-diff-${index}`} line={line} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            )}

            {!isGeneratingInitialFile && (
            <div className="mt-3 border-t border-slate-700 pt-3 flex-shrink-0 space-y-3">
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label htmlFor="revise-prompt-input" className="text-xs font-semibold text-slate-400 block ml-1">Revise with AI</label>
                        <SampleDropdown samples={AETHERIAL_REVISE_SAMPLES} onSelect={setRevisePrompt} />
                    </div>
                    <div className="relative">
                      <input id="revise-prompt-input" type="text" value={revisePrompt} onChange={(e) => setRevisePrompt(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleReviseFile()}
                          placeholder={`e.g., "Add error handling to the main function"`}
                          className="w-full p-2 pl-3 pr-10 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:ring-1 focus:ring-cyan-500 disabled:opacity-50 text-sm"
                          disabled={isLoading || isRevisingFile} />
                      <button type="button" onClick={handleReviseFile} disabled={isLoading || isRevisingFile || !revisePrompt.trim()}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-cyan-400 hover:text-cyan-300 disabled:opacity-50"
                          aria-label="Revise file content with AI">
                          {isRevisingFile ? <ArrowPathIcon className="w-4 h-4 animate-spin"/> : <PaperAirplaneIcon className="w-4 h-4" />}
                      </button>
                    </div>
                </div>
                <button onClick={handleMarkAsImplemented}
                    disabled={isLoading || activeFile.status === 'implemented'}
                    className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-1.5 px-3 rounded-md transition-colors disabled:bg-slate-600 text-sm">
                    {activeFile.status === 'implemented' ? 'Implemented' : 'Mark as Implemented'}
                </button>
            </div>
            )}
        </div>
      )}
      
      <button 
        onClick={() => {
            if(context) {
                context.setActiveAgentId('workspace.default.v1'); 
                context.updateSharedContext({ activeFileForImplementation: null }); 
            }
        }}
        className="mt-auto w-full max-w-xs mx-auto px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md text-sm flex-shrink-0 pt-4"
        aria-label="Deactivate Aetherial agent view and return to Workspace"
      >
        Return to Workspace
      </button>
    </div>
  );
};
AetherialAgentView.displayName = 'AetherialAgentView';

export default AetherialAgentView;
