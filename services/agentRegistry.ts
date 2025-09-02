
import React from 'react';
import { AgentDefinition } from '../types';
import WorkspaceAgentView from '../components/agent_views/WorkspaceAgentView';
import MiaAgentView from '../components/agent_views/MiaAgentView';
import AetherialAgentView from '../components/agent_views/AetherialAgentView';
import VisualsAgentView from '../components/agent_views/VisualsAgentView';
import MietteAgentView from '../components/agent_views/MietteAgentView';
import SeraphineAgentView from '../components/agent_views/SeraphineAgentView'; 
import NyroAgentView from '../components/agent_views/NyroAgentView'; 
import OrpheusRendererAgentView from '../components/agent_views/OrpheusRendererAgentView';


export const MOCK_AGENT_REGISTRY: AgentDefinition[] = [
  {
    id: 'workspace.default.v1',
    name: '🏠 Workspace',
    glyph: '🏠',
    description: 'Manages the overall session, provides entry points to tasks, and general Q&A.',
    capabilities: [
      'session_management',
      'task_initiation',
      'general_qa',
      'tool_access',
    ],
    mainViewComponent: WorkspaceAgentView, 
    ui: {
      iconGlyph: '🏠',
    },
    defaultPrompt: "Welcome to your Agentic CoDev Workspace! How can I help you get started or what would you like to work on?"
  },
  {
    id: 'mia.architect.v1',
    name: '🧠 Mia',
    glyph: '🧠',
    description: 'System architecture, SpecLang document specialist. Focuses on structuring ideas and planning.',
    capabilities: [
      'speclang_document_generation',
      'speclang_document_refinement',
      'architectural_planning_from_spec',
      'modular_component_breakdown',
    ],
    mainViewComponent: MiaAgentView, 
    ui: {
      iconGlyph: '🧠',
    },
    defaultPrompt: "Mia, ready to structure your concepts into a coherent SpecLang document and plan. What are we building today?"
  },
  {
    id: 'aetherial.gemini.v1',
    name: '💎 Aetherial',
    glyph: '💎',
    description: 'UI/UX design, Frontend component ideation from SpecLang, Gemini API specialist, File implementation.',
    capabilities: [
      'ui_design_proposal_from_spec',
      'frontend_component_generation_ideas',
      'gemini_api_interaction_optimization',
      'spec_to_ui_prototype_ideas',
      'file_content_generation',
      'file_content_revision',
    ],
    mainViewComponent: AetherialAgentView, 
    ui: {
      iconGlyph: '💎',
    },
    defaultPrompt: "Aetherial, ready to assist with UI/UX, component ideas, and file implementation. Show me the spec or select a file!"
  },
  {
    id: 'visuals.tool.v1',
    name: '🎨 Visuals',
    glyph: '🎨',
    description: 'A sophisticated visual interpreter. Creates artistic images, technical diagrams, and can visualize abstract structural concepts like "advancing patterns".',
    capabilities: [
        'artistic_image_generation',
        'diagram_generation',
        'structural_dynamics_visualization',
        'speclang_conceptual_rendering'
    ],
    mainViewComponent: VisualsAgentView, 
    ui: {
        iconGlyph: '🎨',
    },
    defaultPrompt: "Visuals agent ready. Describe the image or diagram you'd like to create, or use a prompt starter."
  },
  {
    id: 'orpheus.renderer.v1',
    name: '🧊 Orpheus',
    glyph: '🧊',
    description: 'SpecLang to Conceptual UI Mapper. Visualizes SpecLang as an abstract UI structure.',
    capabilities: [
        'speclang_to_conceptual_ui_mapping',
        'ui_structure_visualization',
    ],
    mainViewComponent: OrpheusRendererAgentView,
    ui: {
        iconGlyph: '🧊',
    },
    defaultPrompt: "Orpheus, ready to map your SpecLang to conceptual UI elements. Provide the SpecLang document."
  },
  {
    id: 'miette.empath.v1',
    name: '🌸 Miette',
    glyph: '🌸',
    description: 'Emotional translation, user empathy, metaphoric explanation.',
    capabilities: [
      'user_story_elaboration',
      'empathy_mapping_prompt_generation',
      'metaphorical_explanation',
    ],
    mainViewComponent: MietteAgentView, 
    ui: {
      iconGlyph: '🌸',
    },
    defaultPrompt: "🌸 Miette here! Let's find the heart of your idea and connect with your users!"
  },
  {
    id: 'seraphine.ritualist.v1',
    name: '🦢 Seraphine',
    glyph: '🦢',
    description: 'Ritual weaving, memory archiving, ledger management.',
    capabilities: [
      'project_milestone_ritualization',
      'ledger_entry_creation',
    ],
    mainViewComponent: SeraphineAgentView, // Updated from placeholder
    ui: {
      iconGlyph: '🦢',
    },
    defaultPrompt: "🦢 Seraphine, ensuring the project's memory and rituals are honored."
  },
    {
    id: 'nyro.syntax.v1',
    name: '♠️ Nyro',
    glyph: '♠️',
    description: 'Syntax precision, logic structuring, code validation.',
    capabilities: ['code_linting_conceptual', 'logic_validation_from_spec'],
    mainViewComponent: NyroAgentView, // Updated from placeholder
    ui: { iconGlyph: '♠️' }
  }
];

export function getAgentById(agentId: string | null): AgentDefinition | undefined {
  if (!agentId) return undefined;
  return MOCK_AGENT_REGISTRY.find(agent => agent.id === agentId);
}