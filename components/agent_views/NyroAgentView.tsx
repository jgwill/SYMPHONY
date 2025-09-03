import React, { useContext, useState, useCallback, useEffect } from 'react';
import { AppContext } from '../../App';
import { AppContextType, PlanFile } from '../../types';
import { CodeBracketIcon, SparklesIcon, DocumentIcon, ArrowPathIcon } from '../icons'; 
import Card from '../Card'; 
import { cn } from '../../lib/utils';
import { geminiService } from '../../services/geminiService'; 
import SampleDropdown from '../SampleDropdown';
import { NYRO_SAMPLES } from '../../constants/samples';

interface NyroFeedback {
  id: string;
  type: 'validation' | 'refinement_suggestion';
  inputTextSample: string;
  outputText: string;
  timestamp: number;
}

const NyroAgentView: React.FC = () => {
  const context = useContext(AppContext) as AppContextType | null;
  
  const [inputText, setInputText] = useState<string>('');
  const [feedbackItems, setFeedbackItems] = useState<NyroFeedback[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const activeFile = context?.agentMemory.sharedContext.activeFileForImplementation;

  useEffect(() => {
    if (activeFile) { 
      setInputText(activeFile.newContent || activeFile.content || `// File: ${activeFile.path} (content not available)`);
    } else if (context?.agentMemory.sharedContext.specLangDocument) { 
      setInputText(context.agentMemory.sharedContext.specLangDocument);
    } else {
        setInputText(''); 
    }
  }, [activeFile, context?.agentMemory.sharedContext.specLangDocument]);


  const handleProcessText = useCallback(async (processingType: 'validation' | 'refinement_suggestion') => {
    if (!context || !inputText.trim()) {
      context.setAppError(`Please provide text for ${processingType}.`);
      return;
    }

    if (processingType === 'validation') setIsValidating(true);
    else setIsSuggesting(true);
    context.setIsLoading(true); // Keep global loading
    context.setAppError(null);
    
    let generatedOutputText = '';
    try {
      if (processingType === 'validation') {
        generatedOutputText = await geminiService.validateSyntaxAndLogic(inputText);
      } else { 
        generatedOutputText = await geminiService.suggestRefinements(inputText);
      }

      const newFeedback: NyroFeedback = {
        id: `nyro_${processingType}_${Date.now()}`,
        type: processingType,
        inputTextSample: inputText.substring(0, 100) + (inputText.length > 100 ? '...' : ''),
        outputText: generatedOutputText,
        timestamp: Date.now(),
      };
      setFeedbackItems(prev => [newFeedback, ...prev]);

    } catch (error) {
      context.setAppError((error as Error).message);
      const errorFeedback: NyroFeedback = {
        id: `nyro_error_${Date.now()}`,
        type: processingType,
        inputTextSample: inputText.substring(0, 100) + (inputText.length > 100 ? '...' : ''),
        outputText: `Error during ${processingType}: ${(error as Error).message}`,
        timestamp: Date.now(),
      };
      setFeedbackItems(prev => [errorFeedback, ...prev]);
    } finally {
      context.setIsLoading(false);
      if (processingType === 'validation') setIsValidating(false);
      else setIsSuggesting(false);
    }
  }, [context, inputText]);


  if (!context) return <div className="p-4 text-slate-500">Nyro Agent context not available.</div>;
  const isLoading = context.isLoading; // Global loading state

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col bg-slate-850 text-slate-200 overflow-y-auto custom-scrollbar">
      <div className="flex items-center mb-4 flex-shrink-0">
        <span className="text-3xl mr-3" role="img" aria-label="Nyro Agent Glyph">♠️</span>
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-100">Nyro: Syntax & Logic</h2>
      </div>
      <p className="text-slate-400 mb-6 text-sm flex-shrink-0">
        Nyro assists with ensuring syntax precision, logical structuring, and validation of your code or SpecLang documents. Paste text below or it will use content from an active file or SpecLang.
      </p>

      <Card title="Analyze Text / Code" titleClassName="text-md sm:text-lg text-slate-200" headerContent={<DocumentIcon className="w-5 h-5 text-purple-400" />} className="mb-6 flex-shrink-0 bg-slate-800">
        <div className="flex justify-end mb-1">
            <SampleDropdown samples={NYRO_SAMPLES} onSelect={setInputText} />
        </div>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            activeFile?.path 
            ? `Content for ${activeFile.path} (or paste other text/code)...` 
            : context.agentMemory.sharedContext.specLangDocument
            ? `Current SpecLang document content (or paste other text/code)...`
            : "Paste code or SpecLang text here for analysis..."
          }
          className="w-full h-32 p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 resize-y focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder-slate-400 text-sm mb-2 custom-scrollbar"
          aria-label="Text input for syntax and logic analysis"
          disabled={isLoading}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={() => handleProcessText('validation')}
            disabled={isLoading || !inputText.trim()}
            className={cn(
              "flex items-center justify-center gap-2 w-full px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-md shadow transition-colors text-xs",
              "disabled:opacity-60 disabled:cursor-not-allowed"
            )}
            aria-label="Validate syntax and logic"
          >
            {isValidating ? ( 
              <><ArrowPathIcon className="w-3 h-3 animate-spin" /> Validating...</>
            ) : (
              <><CodeBracketIcon className="w-4 h-4" /> Validate Syntax & Logic</>
            )}
          </button>
          <button
            onClick={() => handleProcessText('refinement_suggestion')}
            disabled={isLoading || !inputText.trim()}
            className={cn(
              "flex items-center justify-center gap-2 w-full px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-md shadow transition-colors text-xs",
              "disabled:opacity-60 disabled:cursor-not-allowed"
            )}
            aria-label="Suggest refinements"
          >
            {isSuggesting ? ( 
              <><ArrowPathIcon className="w-3 h-3 animate-spin" /> Suggesting...</>
            ) : (
              <><SparklesIcon className="w-4 h-4" /> Suggest Refinements</>
            )}
          </button>
        </div>
      </Card>
      
      <div className="mt-0 border-t border-slate-700 pt-4 flex-grow min-h-0 flex flex-col">
        <h3 className="text-md sm:text-lg font-semibold text-slate-100 mb-2 flex-shrink-0">Nyro's Feedback:</h3>
        {feedbackItems.length > 0 ? (
          <div className="space-y-3 overflow-y-auto custom-scrollbar flex-grow bg-slate-800 p-3 rounded-md">
            {feedbackItems.map((item) => {
              const isValidation = item.type === 'validation';
              const isError = item.outputText.startsWith('Error');
              return (
                <div key={item.id} className={cn(
                  "p-3 bg-slate-800 rounded-md border-l-4 shadow-md",
                  isError ? "border-red-500" : (isValidation ? "border-purple-500" : "border-teal-500")
                )}>
                  <div className="flex justify-between items-center mb-1">
                    <h4 className={cn(
                      "text-sm font-semibold capitalize",
                      isError ? "text-red-400" : (isValidation ? "text-purple-300" : "text-teal-300")
                    )}>
                      {isError ? "Processing Error" : (isValidation ? 'Validation Feedback' : 'Refinement Suggestion')}
                    </h4>
                    <span className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2 italic border-t border-slate-700 pt-2 mt-1">
                    Analyzed: "{item.inputTextSample}"
                  </p>
                  <div 
                    className="whitespace-pre-wrap font-sans text-slate-300 text-sm leading-relaxed bg-slate-850 p-2 rounded-sm custom-scrollbar max-h-48 overflow-y-auto markdown-preview-content"
                    dangerouslySetInnerHTML={{ __html: isError ? item.outputText : DOMPurify.sanitize(marked.parse(item.outputText) as string) }}
                  ></div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-slate-500 p-4 text-center bg-slate-800 rounded-md">
            <CodeBracketIcon className="w-12 h-12 mb-2"/>
            <p>No feedback from Nyro yet.</p>
            <p className="text-xs mt-1">Analyze some text to see feedback here.</p>
          </div>
        )}
      </div>

      <button 
        onClick={() => context?.setActiveAgentId('workspace.default.v1')}
        className="mt-auto w-full max-w-xs mx-auto px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md text-sm flex-shrink-0 pt-4"
        aria-label="Deactivate Nyro agent view and return to Workspace"
      >
        Return to Workspace
      </button>
    </div>
  );
};
NyroAgentView.displayName = 'NyroAgentView';

declare var DOMPurify: any; 
import { marked } from 'marked'; 

export default NyroAgentView;
