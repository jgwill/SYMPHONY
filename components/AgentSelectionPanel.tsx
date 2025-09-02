
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
        <button
          key={agent.id}
          onClick={() => setActiveAgentId(agent.id)}
          title={agent.name}
          aria-label={`Select agent: ${agent.name}`}
          aria-pressed={activeAgentId === agent.id}
          className={cn(
            "p-2 sm:p-2.5 rounded-md w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center transition-colors duration-150 ease-in-out",
            activeAgentId === agent.id
              ? 'bg-cyan-500 text-white shadow-lg'
              : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
          )}
        >
          {getAgentIcon(agent)}
        </button>
      ))}
    </div>
  );
};
AgentSelectionPanel.displayName = 'AgentSelectionPanel';

export default AgentSelectionPanel;
