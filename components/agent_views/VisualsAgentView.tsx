

import React, { useState, useContext, useCallback, useEffect, useRef } from 'react';
import { AppContext } from '../../App';
import { AppContextType, AppStep }
from '../../types';
import { geminiService } from '../../services/geminiService';
import { PhotoIcon, PaperAirplaneIcon, AcademicCapIcon, ListBulletIcon, ArrowPathIcon } from '../icons';
import { cn } from '../../lib/utils';

declare global {
  interface Window {
    mermaid?: any;
  }
}

type GenerationMode = 'artistic_image' | 'visual_diagram_image' | 'mermaid_syntax';

const VisualsAgentView: React.FC = () => {
  const context = useContext(AppContext) as AppContextType | null;
  const [generationMode, setGenerationMode] = useState<GenerationMode>('artistic_image');
  
  const [prompt, setPrompt] = useState<string>(''); 
  const [generatedImage, setGeneratedImage] = useState<{ base64Bytes: string, mimeType: string } | null>(null);
  const [mermaidSyntax, setMermaidSyntax] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false); // Unified local loading state
  const mermaidPreviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.mermaid) {
      try {
        window.mermaid.initialize({ 
          startOnLoad: false, theme: 'dark', darkMode: true, securityLevel: 'loose', 
          fontFamily: '"Inter", sans-serif',
          themeVariables: {
            background: '#1f2937', mainBkg: '#374151', primaryColor: '#374151', 
            primaryTextColor: '#f3f4f6', lineColor: '#60a5fa', textColor: '#d1d5db', fontSize: '13px',
          }
        });
      } catch (e) { console.error("Error initializing Mermaid:", e); context?.setAppError("Failed to init diagram lib."); }
    }
  }, [context]);

  useEffect(() => {
    if (context?.activeAgentId === 'visuals.tool.v1' && context.agentMemory.sharedContext.promptForVisualsAgent) {
      const passedPrompt = context.agentMemory.sharedContext.promptForVisualsAgent;
      setPrompt(passedPrompt);
      
      const lowerPrompt = passedPrompt.toLowerCase();
      if (lowerPrompt.includes("diagram") || lowerPrompt.includes("flowchart") || lowerPrompt.includes("sequence") || lowerPrompt.includes("mermaid") || lowerPrompt.includes("graph")) {
        setGenerationMode('mermaid_syntax');
      } else {
        setGenerationMode('artistic_image');
      }
      context.updateSharedContext({ promptForVisualsAgent: null });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context?.activeAgentId, context?.agentMemory.sharedContext.promptForVisualsAgent]);


  const renderMermaidDiagram = useCallback(async () => {
    if (window.mermaid && mermaidPreviewRef.current && mermaidSyntax.trim()) {
      try {
        mermaidPreviewRef.current.innerHTML = ''; 
        const { svg } = await window.mermaid.render(`mermaid-graph-${Date.now()}`, mermaidSyntax.trim());
        mermaidPreviewRef.current.innerHTML = svg;
      } catch (error) {
        mermaidPreviewRef.current.innerHTML = `<p class="text-red-400 text-xs p-1">Error: ${(error as Error).message}</p>`;
      }
    } else if (mermaidPreviewRef.current) {
      mermaidPreviewRef.current.innerHTML = '<p class="text-slate-500 text-xs p-1">Enter Mermaid syntax.</p>';
    }
  }, [mermaidSyntax]);

  useEffect(() => {
    if (generationMode === 'mermaid_syntax') renderMermaidDiagram();
  }, [mermaidSyntax, generationMode, renderMermaidDiagram]);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || !context || context.isLoading) return;

    setIsGenerating(true);
    context.setIsLoading(true); // Still use global loading to disable other UI parts
    context.setAppError(null);
    if (generationMode !== 'mermaid_syntax') setGeneratedImage(null);
    if (generationMode === 'mermaid_syntax') setMermaidSyntax('');
    

    try {
      if (generationMode === 'artistic_image' || generationMode === 'visual_diagram_image') {
        const result = await geminiService.generateImage(prompt);
        setGeneratedImage(result);
      } else if (generationMode === 'mermaid_syntax') {
        const syntax = await geminiService.generateDiagramSyntax(prompt);
        setMermaidSyntax(syntax);
      }
    } catch (error) {
      context.setAppError((error as Error).message);
    } finally {
      context.setIsLoading(false);
      setIsGenerating(false);
    }
  }, [prompt, context, generationMode]);

  const imageUrl = generatedImage ? `data:${generatedImage.mimeType};base64,${generatedImage.base64Bytes}` : null;
  const showButtonLoading = context?.isLoading && isGenerating; 
  
  const modeConfig = {
    artistic_image: { title: 'Artistic Image', icon: <PhotoIcon className="w-5 h-5" />, placeholder: "e.g., A cat astronaut on Mars" },
    visual_diagram_image: { title: 'Visual Diagram (Image)', icon: <ListBulletIcon className="w-5 h-5" />, placeholder: "e.g., Flowchart of user login" },
    mermaid_syntax: { title: 'Mermaid Syntax', icon: <AcademicCapIcon className="w-5 h-5" />, placeholder: "e.g., Sequence diagram for API call" },
  };

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col bg-slate-900 text-slate-200 overflow-y-auto custom-scrollbar">
      <div className="flex items-center mb-4 flex-shrink-0">
        <span className="text-3xl mr-3" role="img" aria-label="Visuals Agent Glyph">🎨</span>
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-100">Visuals Agent</h2>
      </div>

      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-4 flex-shrink-0">
        {(Object.keys(modeConfig) as GenerationMode[]).map(modeKey => (
          <button
            key={modeKey}
            onClick={() => { 
              setGenerationMode(modeKey); 
              setGeneratedImage(null); 
              setMermaidSyntax(''); 
              // Do not clear prompt if it seems relevant to diagrams when switching to mermaid
              const lowerPrompt = prompt.toLowerCase();
              if (modeKey === 'mermaid_syntax' && (lowerPrompt.includes("diagram") || lowerPrompt.includes("flowchart") || lowerPrompt.includes("sequence"))) {
                // keep prompt
              } else if (modeKey !== 'mermaid_syntax' && prompt.includes("diagram")){
                 // keep prompt for diagram image
              }
              else {
                setPrompt(''); // Clear prompt for unrelated mode switches
              }
            }}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5",
              generationMode === modeKey ? "bg-cyan-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            )}
            aria-pressed={generationMode === modeKey}
          >
            {modeConfig[modeKey].icon} {modeConfig[modeKey].title}
          </button>
        ))}
      </div>

      <div className="bg-slate-800 shadow-xl rounded-lg p-0.5 mb-4 flex-shrink-0">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={modeConfig[generationMode].placeholder}
          className="w-full h-24 p-3 bg-slate-800 text-slate-200 resize-none focus:outline-none placeholder-slate-400 custom-scrollbar text-sm"
          aria-label="Generation prompt input"
          disabled={context?.isLoading} // Use global loading to disable textarea
        />
      </div>
      <button 
        onClick={handleGenerate}
        disabled={context?.isLoading || !prompt.trim()} // Use global loading
        className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-md shadow-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed mb-4 text-sm flex-shrink-0"
        aria-label={`Generate ${modeConfig[generationMode].title}`}
      >
        {showButtonLoading ? (
          <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Generating...</>
        ) : (
          <><PaperAirplaneIcon className="w-4 h-4 transform rotate-[-45deg]" /> Generate {modeConfig[generationMode].title}</>
        )}
      </button>

      {/* Output Area */}
      <div className="flex-grow min-h-0">
        {(generationMode === 'artistic_image' || generationMode === 'visual_diagram_image') && (
          <div className="w-full aspect-video bg-slate-800 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-700 overflow-hidden">
            {showButtonLoading ? ( // Show loading specific to image generation here
              <div className="text-center text-slate-400 text-sm"><div className="animate-pulse">AI is creating your image...</div></div>
            ) : imageUrl ? (
              <img src={imageUrl} alt={prompt || "Generated image"} className="max-w-full max-h-full object-contain" />
            ) : (
              <div className="text-center text-slate-500 p-2 text-xs">{modeConfig[generationMode].icon} Your generated image will appear here.</div>
            )}
          </div>
        )}

        {generationMode === 'mermaid_syntax' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-full">
            <div className="flex flex-col h-full min-h-[200px] md:min-h-0">
              <label htmlFor="mermaid-syntax-output" className="block text-xs font-medium text-slate-300 mb-1">Mermaid Syntax:</label>
              <textarea
                id="mermaid-syntax-output"
                value={mermaidSyntax}
                onChange={(e) => setMermaidSyntax(e.target.value)} 
                readOnly={context?.isLoading && !isGenerating} // Only truly readonly if global loading is on AND not this specific action
                placeholder="Mermaid.js syntax will appear here..."
                className="w-full flex-grow p-2 font-mono text-xs bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:ring-1 focus:ring-cyan-500 custom-scrollbar resize-none"
                aria-label="Mermaid syntax output and editor"
                spellCheck="false"
              />
            </div>
            <div className="flex flex-col h-full min-h-[200px] md:min-h-0">
              <label htmlFor="mermaid-preview" className="block text-xs font-medium text-slate-300 mb-1">Preview:</label>
              <div 
                id="mermaid-preview"
                ref={mermaidPreviewRef} 
                className="w-full flex-grow bg-slate-800 border border-slate-700 rounded-md p-2 flex items-center justify-center overflow-auto custom-scrollbar"
                aria-live="polite"
              >
                 {showButtonLoading && <p className="text-slate-400 text-xs p-1">Generating syntax...</p>}
                 {!showButtonLoading && !mermaidSyntax.trim() && <p className="text-slate-500 text-xs p-1">Enter or generate Mermaid syntax to see preview.</p>}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <button 
        onClick={() => {
            context?.setActiveAgentId(null); 
            context?.setCurrentStep(AppStep.AGENT_WORKSPACE); 
        }}
        className="mt-4 w-full max-w-xs mx-auto px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md text-sm flex-shrink-0"
        aria-label="Return to Workspace Agent"
      >
        Return to Workspace
      </button>
    </div>
  );
};
VisualsAgentView.displayName = 'VisualsAgentView';

export default VisualsAgentView;
