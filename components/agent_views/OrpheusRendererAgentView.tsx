import React, { useContext, useState, useCallback, useEffect } from 'react';
import { AppContext } from '../../App';
import { AppContextType, ConceptualUIElement } from '../../types';
import { CubeTransparentIcon, SparklesIcon, ArrowPathIcon, ClipboardDocumentListIcon, CodeBracketIcon } from '../icons';
import Card from '../Card';
import { cn } from '../../lib/utils';
import { geminiService } from '../../services/geminiService';
import SampleDropdown from '../SampleDropdown';
import { SPECLANG_SAMPLES } from '../../constants/samples';

const generateCodeStub = (element: ConceptualUIElement): string => {
    const componentName = element.name?.replace(/\s+/g, '') || `${element.type}${element.id.slice(-4)}`;
    const propsString = element.properties ? `/* Props: ${JSON.stringify(element.properties)} */` : '';

    return `import React from 'react';

const ${componentName}: React.FC = (props) => {
  ${propsString}
  
  return (
    <div className="p-4 border rounded-md">
      {/* TODO: Implement ${element.name || componentName} component */}
      <p className="text-sm text-gray-500">${componentName}</p>
    </div>
  );
};

export default ${componentName};
`;
};


// Fix: Pass selectedElement state down for recursive check instead of isSelected boolean
const ConceptualUIElementDisplay: React.FC<{ element: ConceptualUIElement; level: number; onSelect: (element: ConceptualUIElement) => void; selectedElement: ConceptualUIElement | null }> = ({ element, level, onSelect, selectedElement }) => {
  const isSelected = selectedElement?.id === element.id;
  return (
    <div 
      style={{ marginLeft: `${level * 1.25}rem` }} 
      className={cn(
          "my-1 p-1.5 bg-slate-700 rounded-sm border-l-2 cursor-pointer transition-all",
          isSelected ? "border-purple-300 bg-slate-600 shadow-md" : "border-purple-500 hover:border-purple-400 hover:bg-slate-650"
      )}
      onClick={() => onSelect(element)}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(element)}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
    >
      <div className="flex items-center">
        <span className={`text-xs font-semibold ${element.type === 'Screen' ? 'text-purple-300' : element.type === 'Container' ? 'text-sky-300' : 'text-teal-300'}`}>
          {element.type}:
        </span>
        {element.name && <span className="ml-1.5 text-xs text-slate-300 italic">"{element.name}"</span>}
        {element.specLangSourceId && <span className="ml-auto text-xxs text-slate-500">(src: {element.specLangSourceId})</span>}
      </div>
      {element.properties && Object.keys(element.properties).length > 0 && (
        <div className="ml-2 mt-0.5 text-xxs text-slate-400">
          {Object.entries(element.properties).map(([key, value]) => (
            <div key={key}>
              <span className="font-medium">{key}:</span> {JSON.stringify(value)}
            </div>
          ))}
        </div>
      )}
      {element.children && element.children.length > 0 && (
        <div className="mt-1">
          {element.children.map(child => (
            <ConceptualUIElementDisplay key={child.id} element={child} level={level + 1} onSelect={onSelect} selectedElement={selectedElement} />
          ))}
        </div>
      )}
    </div>
  );
};
ConceptualUIElementDisplay.displayName = 'ConceptualUIElementDisplay';


const OrpheusRendererAgentView: React.FC = () => {
  const context = useContext(AppContext) as AppContextType | null;
  const [specLangInput, setSpecLangInput] = useState<string>('');
  const [conceptualUI, setConceptualUI] = useState<ConceptualUIElement[]>([]);
  const [isMapping, setIsMapping] = useState(false);
  const [selectedElement, setSelectedElement] = useState<ConceptualUIElement | null>(null);
  const [codeStub, setCodeStub] = useState<string>('');

  useEffect(() => {
    if (context?.agentMemory.sharedContext.specLangDocument) {
      setSpecLangInput(context.agentMemory.sharedContext.specLangDocument);
    } else {
      setSpecLangInput('');
    }
  }, [context?.agentMemory.sharedContext.specLangDocument]);

  const handleSelectElement = (element: ConceptualUIElement) => {
    setSelectedElement(element);
    setCodeStub(generateCodeStub(element));
  };
  
  const handleMapSpecToUI = useCallback(async () => {
    if (!context || !specLangInput.trim()) {
      context.setAppError("Please provide SpecLang document text for UI mapping.");
      return;
    }
    setIsMapping(true);
    context.setIsLoading(true);
    context.setAppError(null);
    setConceptualUI([]);
    setSelectedElement(null);
    setCodeStub('');

    try {
      const result = await geminiService.mapSpecToConceptualUI(specLangInput);
      setConceptualUI(result);
    } catch (error) {
      context.setAppError((error as Error).message);
    } finally {
      context.setIsLoading(false);
      setIsMapping(false);
    }
  }, [context, specLangInput]);

  if (!context) return <div className="p-4 text-slate-500">Orpheus Agent context not available.</div>;
  const isLoading = context.isLoading;

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col bg-slate-850 text-slate-200 overflow-y-auto custom-scrollbar">
      <div className="flex items-center mb-4 flex-shrink-0">
        <CubeTransparentIcon className="w-8 h-8 mr-3 text-purple-400" />
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-100">Orpheus: Spec-to-UI Mapper</h2>
      </div>
      <p className="text-slate-400 mb-6 text-sm flex-shrink-0">
        Orpheus maps your SpecLang document into an abstract UI structure. Select an element to generate a code stub.
      </p>

      <Card title="SpecLang Input" titleClassName="text-md sm:text-lg text-slate-200" className="mb-6 flex-shrink-0 bg-slate-800">
        <div className="flex justify-end mb-1">
            <SampleDropdown samples={SPECLANG_SAMPLES} onSelect={setSpecLangInput} />
        </div>
        <textarea
          value={specLangInput}
          onChange={(e) => setSpecLangInput(e.target.value)}
          placeholder={
            context.agentMemory.sharedContext.specLangDocument
            ? "Current SpecLang document (edit or paste new)..."
            : "Paste SpecLang document here..."
          }
          className="w-full h-32 p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 resize-y focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder-slate-400 text-sm mb-2 custom-scrollbar"
          aria-label="SpecLang input for UI mapping"
          disabled={isLoading}
        />
        <button
          onClick={handleMapSpecToUI}
          disabled={isLoading || !specLangInput.trim()}
          className={cn(
            "flex items-center justify-center gap-2 w-full px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-md shadow transition-colors text-xs",
            "disabled:opacity-60 disabled:cursor-not-allowed"
          )}
          aria-label="Map SpecLang to Conceptual UI"
        >
          {isMapping ? (
            <><ArrowPathIcon className="w-3 h-3 animate-spin" /> Mapping...</>
          ) : (
            <><SparklesIcon className="w-4 h-4" /> Map to Conceptual UI</>
          )}
        </button>
      </Card>
      
      <div className="mt-0 border-t border-slate-700 pt-4 flex-grow min-h-0 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
            <h3 className="text-md sm:text-lg font-semibold text-slate-100 mb-2 flex-shrink-0">Conceptual UI Structure:</h3>
            {isMapping && conceptualUI.length === 0 && ( 
                <div className="flex-grow flex items-center justify-center text-slate-400">
                    <ArrowPathIcon className="w-8 h-8 animate-spin mr-2 text-purple-400"/>
                    Orpheus is interpreting...
                </div>
            )}
            {!isMapping && conceptualUI.length > 0 ? (
            <div className="space-y-1 overflow-y-auto custom-scrollbar flex-grow bg-slate-800 p-3 rounded-md">
                {conceptualUI.map((element) => (
                <ConceptualUIElementDisplay key={element.id} element={element} level={0} onSelect={handleSelectElement} selectedElement={selectedElement} />
                ))}
            </div>
            ) : !isMapping && (
            <div className="flex-grow flex flex-col items-center justify-center text-slate-500 p-4 text-center bg-slate-800 rounded-md">
                <CubeTransparentIcon className="w-12 h-12 mb-2 opacity-50"/>
                <p>No conceptual UI structure.</p>
                <p className="text-xs mt-1">Provide SpecLang and click "Map".</p>
            </div>
            )}
        </div>
        <div className="flex flex-col">
            <h3 className="text-md sm:text-lg font-semibold text-slate-100 mb-2 flex-shrink-0">Generated Code Stub:</h3>
            {selectedElement ? (
                 <div className="flex-grow flex flex-col bg-slate-800 p-3 rounded-md overflow-hidden">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-xs text-slate-400">Stub for: <span className="font-semibold text-teal-300">{selectedElement.name || selectedElement.type}</span></p>
                        <button onClick={() => navigator.clipboard.writeText(codeStub)} className="text-xs flex items-center gap-1 bg-slate-700 px-2 py-1 rounded-md text-slate-300 hover:bg-slate-600">
                            <ClipboardDocumentListIcon className="w-3 h-3"/> Copy
                        </button>
                    </div>
                    <pre className="text-xs bg-slate-900 rounded p-2 overflow-auto custom-scrollbar flex-grow">
                        <code className="language-javascript">{codeStub}</code>
                    </pre>
                 </div>
            ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-slate-500 p-4 text-center bg-slate-800 rounded-md">
                    <CodeBracketIcon className="w-12 h-12 mb-2 opacity-50"/>
                    <p>Select a UI element from the structure on the left to generate a code stub.</p>
                </div>
            )}
        </div>

      </div>

      <button 
        onClick={() => context?.setActiveAgentId(null)}
        className="mt-auto w-full max-w-xs mx-auto px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md text-sm flex-shrink-0 pt-4"
        aria-label="Deactivate Orpheus agent view and return to Workspace"
      >
        Return to Workspace
      </button>
    </div>
  );
};
OrpheusRendererAgentView.displayName = 'OrpheusRendererAgentView';

export default OrpheusRendererAgentView;
