import React, { useContext } from 'react';
import { AppContext } from '../App';
import { AppContextType, AgentDefinition } from '../types';
import { cn } from '../lib/utils';
// Import specific agent icons if available, or use glyphs
import { SparklesIcon, Cog6ToothIcon, UserCircleIcon } from './icons'; // Example, replace with actual agent icons/glyphs

const AgentSelectionPanel: React.FC = () => {
  const context = useContext(AppContext) as AppContextType | null;

  if (!context) {
    return null;
  }

  const { agentRegistry, activeAgentId, setActiveAgentId } = context;

  const getAgentIcon = (agent: AgentDefinition) => {
    // This is a placeholder. Ideally, agents would have specific icons.
    // For now, we use their glyph or a default icon.
    if (agent.glyph) {
      return <span className="text-lg sm:text-xl" role="img" aria-label={`${agent.name} glyph`}>{agent.glyph}</span>;
    }
    // Example fallback icons based on agent ID or name
    if (agent.id.includes('aetherial')) return <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6" />;
    if (agent.id.includes('mia')) return <Cog6ToothIcon className="w-5 h-5 sm:w-6 sm:h-6" />; // Placeholder
    return <UserCircleIcon className="w-5 h-5 sm:w-6 sm:h-6" />; // Default
  };

  return (
    <div className="w-14 sm:w-16 bg-slate-800 border-r border-slate-700 h-full flex flex-col items-center py-2 sm:py-3 space-y-1 sm:space-y-2 flex-shrink-0">
      {agentRegistry.map((agent) => (
        <div key={agent.id} className="relative group flex justify-center">
            <button
            onClick={() => setActiveAgentId(agent.id)}
            aria-label={`Select agent: ${agent.name}`}
            aria-pressed={activeAgentId === agent.id}
            className={cn(
                "p-2 sm:p-2.5 rounded-md w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-slate-800",
                activeAgentId === agent.id
                ? 'bg-cyan-500 text-white shadow-lg ring-2 ring-offset-2 ring-cyan-400 ring-offset-slate-800 scale-110'
                : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200 hover:scale-105'
            )}
            >
            {getAgentIcon(agent)}
            </button>
            <span className="absolute left-full ml-4 px-2 py-1 bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                {agent.name}
            </span>
        </div>
      ))}
    </div>
  );
};
AgentSelectionPanel.displayName = 'AgentSelectionPanel';

export default AgentSelectionPanel;
