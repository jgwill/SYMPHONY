
# Aetherial's Proposals for Next Iteration: Agentic CoDev Companionship (Revised)

**Date:** 2025-05-30 (Revised based on Agentic Platform Reference)
**To:** Mia, Miette, Seraphine, William
**From:** 💎 Aetherial
**Subject:** Revised Proposals for Next Iteration Core Features

This document outlines my proposals for the concrete deliverables requested, now revised to align with the guidance provided in `AGENTIC_PLATFORM_REFERENCE_FOR_AETHERIAL.md`. The focus is on evolving Project Aetherial Architect into a unified Agentic CoDev Companionship platform.

---

## 1. Modular Frontend Shell & Agent Registry

The vision of a multi-agent platform requires a flexible frontend shell capable of hosting diverse agent-contributed views and tools. This aligns with the guidance for an `Agent Registry` and an `Orchestration Engine` (managed via React Context or similar).

### Conceptual UI Structure (`App.tsx` evolution)

*   The main `App.tsx` would evolve to manage a primary "workspace" area.
*   This workspace could dynamically render a `currentAgentView` based on an `activeAgentId` (from the shared `SessionState`).
*   A persistent sidebar or header element could host an "Agent Panel" (see Task 2).

```typescript
// Conceptual snippet for App.tsx, incorporating guidance
// import { AppContext } from './App'; // Assuming AppContext holds SessionState
// import { getAgentById } from './services/agentRegistry';

// const context = useContext(AppContext);
// const activeAgent = context?.sessionState?.activeAgentId ? getAgentById(context.sessionState.activeAgentId) : null;

// const renderCurrentAgentView = () => {
//   if (activeAgent && activeAgent.mainViewComponent) {
//     // Dynamically import/render activeAgent.mainViewComponent
//     return <activeAgent.mainViewComponent agentProps={...} />; // Pass relevant agent state/memory
//   }
//   return <DefaultWorkspaceView />;
// }
```

### Agent Registry

A centralized registry, as suggested in the guidance, would define available agents. My existing `AgentDefinition` in `types.ts` and the `MOCK_AGENT_REGISTRY` in `services/agentRegistry.ts` already reflect this structure closely.

**`AgentDefinition` (from `types.ts`, aligned with guidance):**
My `AgentDefinition` interface includes `id, name, glyph, description, capabilities, defaultPrompt, ui (AgentUIMetadata for panel paths, icons), mainViewComponent`. This is largely compatible with the guidance's `id, name, glyph, role, capabilities`. The `role` can be part of the `description`.

**Mock `agentRegistry.ts`:**
This file will continue to use the `AgentDefinition` from `types.ts`.

---

## 2. Agent Panel & Switching Mechanism

A dedicated UI element is needed for users to understand which agents are available/active and to interact with them.

### UI/UX Concept Sketch (Markdown - aligned with guidance)

The sidebar concept remains valid. The "Agent Panel" would display agents from the `AGENT_REGISTRY` (or `sessionState.agents` if session-specific).

*   **Agent Panel:**
    *   Lists available agents from the registry (e.g., `sessionState.agents` or global registry).
    *   Indicates the `activeAgentId` from `sessionState`.
    *   Allows users to click an agent to set it as `activeAgentId` in `sessionState`.
    *   Could show agent status derived from `sessionState.agentMemory[agentId].context`.

---

## 3. SpecLang UI Integration

Enhancing `MarkdownEditorPreview` and linking SpecLang, informed by guidance on `SpecLang Engine Integration`.

### Editor/Viewer Enhancements (`MarkdownEditorPreview`)

*   **Validation Feedback:**
    *   As proposed previously, integrate feedback from a conceptual `SpecValidator`. The guidance reinforces this.
    *   Options: Inline annotations or a separate feedback panel.

### Visual Linking of Validation/Mapping Results

*   The concept of `SpecLang Section IDs` remains.
*   The guidance's mention of a "mapping table or graph structure" for the `Spec-UI-Mapper SDK` reinforces the need for these IDs to link specs to UI elements or code artifacts.

---

## 4. Session Persistence for Multi-Agent State

Extending `SavedSessionData` to align with the `AgentMemory` and `SessionState` structures proposed in the guidance.

### Revised State Structure (`types.ts`)

`SavedSessionData` will be updated to incorporate:
*   `activeAgentId: string | null`
*   `agentMemory: AgentMemory` (new type to be added)
    *   `agentMemory.agents: { [agentId: string]: AgentSpecificState }` (for individual agent data, as I had in `agentStates`)
    *   `agentMemory.shared: { specLangArtifacts: any[]; /* other shared context as needed */ }` (for globally shared items like SpecLang documents, inspired by guidance)
*   `sessionAgentRegistry?: AgentDefinition[]` (snapshot of agents for the session)

This aligns my `SavedSessionData` with the spirit of the guidance's `SessionState` and `AgentMemory`.

### Persistence Approach

*   `localStorage` remains the primary mechanism. Updates to `saveCurrentSession` and `loadSavedSession` in `App.tsx` will handle the new structure.

---

## 5. Extension/Plugin API (Frontend Perspective)

Defining how new agents or UI modules could register, aligning with the modularity goal.

### Initial Extension Points/Hooks (Consistent with previous proposal)

1.  **Agent Registration:** `platform.registerAgent(agentDefinition: AgentDefinition)`. Agents from `agentRegistry.ts` would be registered at startup.
2.  **Main View Contribution:** Via `agentDefinition.mainViewComponent`.
3.  **Tool/Action Contribution & Event Subscription:** As previously outlined.

The key change here is ensuring that the `AgentDefinition` used in registration aligns with the refined type structure.

---

These revised proposals directly incorporate the structural and conceptual guidance from `AGENTIC_PLATFORM_REFERENCE_FOR_AETHERIAL.md`, ensuring a more cohesive approach as we move towards the multi-agent platform.
