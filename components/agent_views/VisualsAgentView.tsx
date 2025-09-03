

import React, { useState, useContext, useCallback, useEffect, useRef } from 'react';
import { AppContext } from '../../App';
import { AppContextType, AppStep } from '../../types';
import { geminiService } from '../../services/geminiService';
import { PhotoIcon, PaperAirplaneIcon, ListBulletIcon, ArrowPathIcon, SparklesIcon } from '../icons';
import { cn } from '../../lib/utils';
import Card from '../Card';

declare global {
  interface Window {
    mermaid?: any;
  }
}

const VisualsAgentView: React.FC = () => {
  const context = useContext(AppContext) as AppContextType | null;
  const [prompt, setPrompt] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<{ base64Bytes: string; mimeType: string } | null>(null);
  const [mermaidSyntax, setMermaidSyntax] = useState<string>('');
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [isGeneratingDiagram, setIsGeneratingDiagram] = useState<boolean>(false);
  const mermaidPreviewRef = useRef<HTMLDivElement>(null);
  
  const clearOutputs = () => {
      setGeneratedImage(null);
      setMermaidSyntax('');
  };

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
      context.updateSharedContext({ promptForVisualsAgent: null });
    }
  }, [context]);

  const renderMermaidDiagram = useCallback(async () => {
    if (window.mermaid && mermaidPreviewRef.current && mermaidSyntax.trim()) {
      try {
        mermaidPreviewRef.current.innerHTML = '';
        const { svg } = await window.mermaid.render(`mermaid-graph-${Date.now()}`, mermaidSyntax.trim());
        mermaidPreviewRef.current.innerHTML = svg;
      } catch (error) {
        mermaidPreviewRef.current.innerHTML = `<p class="text-red-400 text-xs p-1">Error: ${(error as Error).message}</p>`;
      }
    }
  }, [mermaidSyntax]);

  useEffect(() => {
    renderMermaidDiagram();
  }, [mermaidSyntax, renderMermaidDiagram]);

  const handleGenerateImage = useCallback(async (imagePrompt: string) => {
    if (!imagePrompt.trim() || !context) return;
    setIsGeneratingImage(true);
    context.setIsLoading(true);
    context.setAppError(null);
    clearOutputs();

    try {
      const result = await geminiService.generateImage(imagePrompt);
      setGeneratedImage(result);
    } catch (error) {
      context.setAppError((error as Error).message);
    } finally {
      context.setIsLoading(false);
      setIsGeneratingImage(false);
    }
  }, [context]);

  const handleGenerateDiagram = useCallback(async (diagramPrompt: string) => {
    if (!diagramPrompt.trim() || !context) return;
    setIsGeneratingDiagram(true);
    context.setIsLoading(true);
    context.setAppError(null);
    clearOutputs();

    try {
      const syntax = await geminiService.generateDiagramSyntax(diagramPrompt);
      setMermaidSyntax(syntax);
    } catch (error) {
      context.setAppError((error as Error).message);
    } finally {
      context.setIsLoading(false);
      setIsGeneratingDiagram(false);
    }
  }, [context]);
  
  const handleDiagramFromSpec = () => {
      if (context?.agentMemory.sharedContext.specLangDocument) {
          const spec = context.agentMemory.sharedContext.specLangDocument;
          const diagramPrompt = `Generate a Mermaid.js diagram (flowchart or sequence) that visually summarizes the key components, screens, and user flows described in the following SpecLang document:\n\n---\n${spec}`;
          setPrompt(diagramPrompt);
          handleGenerateDiagram(diagramPrompt);
      } else {
          context?.setAppError("No SpecLang document found in the current context to generate a diagram from.");
      }
  };

  const imageUrl = generatedImage ? `data:${generatedImage.mimeType};base64,${generatedImage.base64Bytes}` : null;
  const isLoading = context?.isLoading ?? false;

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col bg-slate-900 text-slate-200 overflow-y-auto custom-scrollbar">
      <div className="flex items-center mb-4 flex-shrink-0">
        <span className="text-3xl mr-3" role="img" aria-label="Visuals Agent Glyph">🎨</span>
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-100">Visuals Agent: Creative Partner</h2>
      </div>

      <Card title="Prompt Starters" titleClassName="text-base font-semibold text-slate-300" headerContent={<SparklesIcon className="w-5 h-5 text-yellow-400"/>} className="mb-4 flex-shrink-0 bg-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button onClick={() => handleGenerateImage("A visually compelling, artistic representation of an 'advancing pattern'. This should evoke feelings of progress, clarity, and forward momentum. Think of unfolding spirals, clear arrows moving forward, or a bridge being built towards a clear goal.")} disabled={isLoading} className="text-xs p-2 bg-slate-700 hover:bg-slate-600 rounded-md disabled:opacity-50">Visualize Advancing Pattern</button>
            <button onClick={() => handleGenerateImage("An artistic visual metaphor for an 'oscillating pattern'. This should represent cycles of effort without progress. Think of a pendulum swinging back and forth, tangled loops, or a hamster wheel.")} disabled={isLoading} className="text-xs p-2 bg-slate-700 hover:bg-slate-600 rounded-md disabled:opacity-50">Visualize Oscillating Pattern</button>
            <button onClick={handleDiagramFromSpec} disabled={isLoading || !context?.agentMemory.sharedContext.specLangDocument} className="text-xs p-2 bg-slate-700 hover:bg-slate-600 rounded-md disabled:opacity-50" title={!context?.agentMemory.sharedContext.specLangDocument ? "No SpecLang document loaded" : "Generate diagram from current SpecLang"}>Diagram from SpecLang</button>
        </div>
      </Card>

      <div className="bg-slate-800 shadow-xl rounded-lg p-0.5 mb-2 flex-shrink-0">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe an image, diagram, or concept..."
          className="w-full h-24 p-3 bg-slate-800 text-slate-200 resize-none focus:outline-none placeholder-slate-400 custom-scrollbar text-sm"
          aria-label="Generation prompt input"
          disabled={isLoading}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 flex-shrink-0">
          <button onClick={() => handleGenerateImage(prompt)} disabled={isLoading || !prompt.trim()} className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-md shadow-md transition-colors disabled:opacity-60 text-sm">
            {isGeneratingImage ? <><ArrowPathIcon className="w-4 h-4 animate-spin"/> Creating Image...</> : <><PhotoIcon className="w-4 h-4"/> Generate Image</>}
          </button>
           <button onClick={() => handleGenerateDiagram(prompt)} disabled={isLoading || !prompt.trim()} className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-md shadow-md transition-colors disabled:opacity-60 text-sm">
            {isGeneratingDiagram ? <><ArrowPathIcon className="w-4 h-4 animate-spin"/> Creating Diagram...</> : <><ListBulletIcon className="w-4 h-4"/> Generate Diagram (Mermaid)</>}
          </button>
      </div>

      <div className="flex-grow min-h-0">
        {generatedImage && (
          <div className="w-full aspect-video bg-slate-800 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-700 overflow-hidden">
            <img src={imageUrl!} alt={prompt || "Generated image"} className="max-w-full max-h-full object-contain" />
          </div>
        )}
        {mermaidSyntax && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-full">
            <div className="flex flex-col h-full min-h-[200px] md:min-h-0">
              <label htmlFor="mermaid-syntax-output" className="block text-xs font-medium text-slate-300 mb-1">Mermaid Syntax:</label>
              <textarea
                id="mermaid-syntax-output" value={mermaidSyntax} onChange={(e) => setMermaidSyntax(e.target.value)}
                className="w-full flex-grow p-2 font-mono text-xs bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:ring-1 focus:ring-cyan-500 custom-scrollbar resize-none"
              />
            </div>
            <div className="flex flex-col h-full min-h-[200px] md:min-h-0">
              <label htmlFor="mermaid-preview" className="block text-xs font-medium text-slate-300 mb-1">Preview:</label>
              <div ref={mermaidPreviewRef} className="w-full flex-grow bg-slate-800 border border-slate-700 rounded-md p-2 flex items-center justify-center overflow-auto custom-scrollbar" />
            </div>
          </div>
        )}
        {isLoading && !generatedImage && !mermaidSyntax && (
            <div className="w-full aspect-video bg-slate-800 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-700">
                <div className="text-center text-slate-400 text-sm animate-pulse">AI is creating your visual...</div>
            </div>
        )}
         {!isLoading && !generatedImage && !mermaidSyntax && (
             <div className="w-full aspect-video bg-slate-800 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-700">
                <div className="text-center text-slate-500 p-2 text-xs">Your generated visual will appear here.</div>
            </div>
         )}
      </div>

      <button
        onClick={() => context?.setCurrentStep(AppStep.AGENT_WORKSPACE)}
        className="mt-4 w-full max-w-xs mx-auto px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md text-sm flex-shrink-0"
      >
        Return to Workspace
      </button>
    </div>
  );
};
VisualsAgentView.displayName = 'VisualsAgentView';

export default VisualsAgentView;
