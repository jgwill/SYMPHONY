

import React, { useContext, useState, useCallback } from 'react';
import { AppContext } from '../../App';
import { AppContextType, LedgerEntry as LedgerEntryType } from '../../types';
import { ClipboardDocumentListIcon, PlusCircleIcon, BookOpenIcon, ArrowPathIcon } from '../icons';
import Card from '../Card'; 
import { cn } from '../../lib/utils';

const SeraphineAgentView: React.FC = () => {
  const context = useContext(AppContext) as AppContextType | null;
  const [newRitualText, setNewRitualText] = useState<string>('');
  const [isArchivingRitual, setIsArchivingRitual] = useState(false);
  const [isArchivingSnapshot, setIsArchivingSnapshot] = useState(false);

  const agentId = 'seraphine.ritualist.v1';
  const ledgerEntries = context?.agentMemory.agents[agentId]?.internalState?.ledgerEntries || [];

  const handleArchiveRitual = useCallback(async () => {
    if (!context || !newRitualText.trim()) {
      context.setAppError("Please enter text for the ritual/milestone.");
      return;
    }
    setIsArchivingRitual(true);
    context.setIsLoading(true);
    context.setAppError(null);

    await new Promise(resolve => setTimeout(resolve, 700));

    const newEntry: LedgerEntryType = {
      id: `ritual_${Date.now()}`,
      timestamp: Date.now(),
      type: 'manual_ritual',
      title: newRitualText.substring(0, 50) + (newRitualText.length > 50 ? '...' : ''),
      description: newRitualText,
      relatedArtifacts: [], 
    };

    const currentEntries = context.agentMemory.agents[agentId]?.internalState?.ledgerEntries || [];
    const updatedAgentSpecificState = {
      ...context.agentMemory.agents[agentId],
      internalState: {
        ...(context.agentMemory.agents[agentId]?.internalState || {}),
        ledgerEntries: [newEntry, ...currentEntries],
      },
    };
    
    context.setAgentMemory(prev => ({
        ...prev,
        agents: {
            ...prev.agents,
            [agentId]: updatedAgentSpecificState,
        }
    }));

    setNewRitualText('');
    context.setIsLoading(false);
    setIsArchivingRitual(false);
  }, [context, newRitualText]);

  const handleArchiveSessionSnapshot = useCallback(async () => {
    if (!context) return;
    setIsArchivingSnapshot(true);
    context.setIsLoading(true);
    context.setAppError(null);

    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { specLangDocument, currentPlan, initialConceptualizationText } = context.agentMemory.sharedContext;
    let description = `Session Snapshot:\n`;
    if (initialConceptualizationText) description += `\n**Conceptualization:**\n${initialConceptualizationText.substring(0, 100)}...\n`;
    if (specLangDocument) description += `\n**SpecLang Document:**\n${specLangDocument.substring(0, 150)}...\n`;
    if (currentPlan) description += `\n**Development Plan:** Active, with ${currentPlan.files.length} files.\n`;
    if (!initialConceptualizationText && !specLangDocument && !currentPlan) description = "Session Snapshot: No major artifacts found to summarize.";


    const newEntry: LedgerEntryType = {
      id: `snapshot_${Date.now()}`,
      timestamp: Date.now(),
      type: 'session_snapshot',
      title: `Session Snapshot - ${new Date().toLocaleString()}`,
      description: description,
      relatedArtifacts: [], 
    };
    
    const currentEntries = context.agentMemory.agents[agentId]?.internalState?.ledgerEntries || [];
    const updatedAgentSpecificState = {
        ...context.agentMemory.agents[agentId],
        internalState: {
          ...(context.agentMemory.agents[agentId]?.internalState || {}),
          ledgerEntries: [newEntry, ...currentEntries],
        },
      };
      
      context.setAgentMemory(prev => ({
          ...prev,
          agents: {
              ...prev.agents,
              [agentId]: updatedAgentSpecificState,
          }
      }));

    context.setIsLoading(false);
    setIsArchivingSnapshot(false);
  }, [context]);


  if (!context) return <div className="p-4 text-slate-500">Seraphine Agent context not available.</div>;
  const isLoading = context.isLoading;

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col bg-slate-850 text-slate-200 overflow-y-auto custom-scrollbar">
      <div className="flex items-center mb-4 flex-shrink-0">
        <span className="text-3xl mr-3" role="img" aria-label="Seraphine Agent Glyph">🦢</span>
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-100">Seraphine: Ritual & Ledger</h2>
      </div>
      <p className="text-slate-400 mb-6 text-sm flex-shrink-0">
        Seraphine helps archive project rituals, milestones, and key session snapshots to the project ledger, weaving the memory of our journey.
      </p>

      <Card title="Log New Ritual / Milestone" titleClassName="text-md sm:text-lg text-slate-200" headerContent={<PlusCircleIcon className="w-5 h-5 text-green-400" />} className="mb-6 flex-shrink-0 bg-slate-800">
        <textarea
          value={newRitualText}
          onChange={(e) => setNewRitualText(e.target.value)}
          placeholder="Describe the ritual, decision, or milestone..."
          className="w-full h-20 p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 resize-none focus:outline-none focus:ring-1 focus:ring-green-500 placeholder-slate-400 text-sm mb-2 custom-scrollbar"
          aria-label="New ritual or milestone description"
          disabled={isLoading}
        />
        <button
          onClick={handleArchiveRitual}
          disabled={isLoading || !newRitualText.trim()}
          className={cn(
            "flex items-center justify-center gap-2 w-full px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-md shadow transition-colors text-xs",
            "disabled:opacity-60 disabled:cursor-not-allowed"
          )}
          aria-label="Archive new ritual or milestone"
        >
          {isArchivingRitual ? (
            <><ArrowPathIcon className="w-3 h-3 animate-spin" /> Archiving...</>
          ) : (
            <><ClipboardDocumentListIcon className="w-4 h-4" /> Archive Ritual</>
          )}
        </button>
      </Card>
      
      <Card title="Archive Session Snapshot" titleClassName="text-md sm:text-lg text-slate-200" headerContent={<BookOpenIcon className="w-5 h-5 text-blue-400" />} className="mb-6 flex-shrink-0 bg-slate-800">
        <p className="text-xs text-slate-400 mb-2">Create a ledger entry summarizing the current conceptualization, SpecLang document, and development plan.</p>
        <button
          onClick={handleArchiveSessionSnapshot}
          disabled={isLoading}
          className={cn(
            "flex items-center justify-center gap-2 w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-md shadow transition-colors text-xs",
            "disabled:opacity-60 disabled:cursor-not-allowed"
          )}
          aria-label="Archive current session snapshot"
        >
          {isArchivingSnapshot ? (
            <><ArrowPathIcon className="w-3 h-3 animate-spin" /> Archiving Snapshot...</>
          ) : (
            <><ClipboardDocumentListIcon className="w-4 h-4" /> Archive Session Snapshot</>
          )}
        </button>
      </Card>

      <div className="mt-0 border-t border-slate-700 pt-4 flex-grow min-h-0 flex flex-col">
        <h3 className="text-md sm:text-lg font-semibold text-slate-100 mb-2 flex-shrink-0">Project Ledger Entries:</h3>
        {ledgerEntries.length > 0 ? (
          <div className="space-y-3 overflow-y-auto custom-scrollbar flex-grow bg-slate-800 p-3 rounded-md">
            {ledgerEntries.map((entry) => (
              <div key={entry.id} className="p-3 bg-slate-750 rounded-md border border-slate-700/50 shadow-sm">
                <h4 className="text-sm font-semibold text-slate-300 mb-0.5">{entry.title}</h4>
                <p className="text-xs text-slate-500 mb-1.5">
                  {new Date(entry.timestamp).toLocaleString()} - Type: {entry.type.replace(/_/g, ' ')}
                </p>
                <pre className="whitespace-pre-wrap font-sans text-slate-400 text-xs leading-relaxed bg-slate-700 p-1.5 rounded-sm custom-scrollbar max-h-24 overflow-y-auto">{entry.description}</pre>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-slate-500 p-4 text-center bg-slate-800 rounded-md">
            <BookOpenIcon className="w-12 h-12 mb-2"/>
            <p>The ledger is currently empty.</p>
            <p className="text-xs mt-1">Archive rituals or session snapshots to populate it.</p>
          </div>
        )}
      </div>

      <button 
        onClick={() => context?.setActiveAgentId(null)}
        className="mt-auto w-full max-w-xs mx-auto px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md text-sm flex-shrink-0 pt-4"
        aria-label="Deactivate Seraphine agent view and return to Workspace"
      >
        Return to Workspace
      </button>
    </div>
  );
};
SeraphineAgentView.displayName = 'SeraphineAgentView';

export default SeraphineAgentView;