# Agentic Platform Reference & Guidance for 💎 Aetherial

**Date:** 2025-05-30

---

## 1. Modular Architecture Overview (Current State)

### Codebase Structure (Unified View)
- `/components/` — Modular UI panels (ChatPanel, PlanTab, ConceptualizeTab, etc.)
- `/services/` — Gemini service/data layer, LLM-agnostic, prompt modularity
- `/specs/` — SpecLang engine: NL-to-Spec, SpecValidator, Spec-UI-Mapper (see `speclangportal250529`)
- `/ledgers/` — Rituals, agent self-definitions, iteration logs
- `/unified/` — New: agent orchestration, plugin API, and modular specs

### Key Patterns
- UI is panel-based, agent-driven, and extensible
- Service/data layer is modular and swappable
- SpecLang is the core for intent, validation, and mapping

---

## 2. Agent Orchestration & Communication

### Recommended Pattern
- **Agent Registry:**
  - TypeScript interface or JSON config for agent metadata (name, glyph, role, capabilities)
  - Example:
    ```ts
    export interface AgentDefinition {
      id: string;
      name: string;
      glyph: string;
      role: string;
      capabilities: string[];
      // ...other metadata
    }
    export const AGENT_REGISTRY: AgentDefinition[] = [
      { id: 'mia', name: 'Mia', glyph: '🧠', role: 'Architect', capabilities: ['architecture', 'devops'] },
      { id: 'aetherial', name: 'Aetherial', glyph: '💎', role: 'UI/UX', capabilities: ['frontend', 'spec-ui-mapping'] },
      // ...
    ];
    ```
- **Orchestration Engine:**
  - Central context/provider (React Context or Redux) manages active agents, task routing, and agent state.
  - Each agent can register its own reducers, views, or workflows.
- **Task Routing:**
  - Use a message/event bus or context dispatcher to delegate tasks to agents based on their capabilities.

---

## 3. Shared Agent Memory & Context ("Memory Weaving")

### Proposed Data Structure
- Centralized `AgentMemory` object, accessible to all agents:
  ```ts
  export interface AgentMemory {
    [agentId: string]: {
      context: any;
      contributions: any[];
      // ...
    };
    shared: {
      specLangArtifacts: any[];
      sessionState: any;
      // ...
    };
  }
  ```
- Persisted via localStorage, IndexedDB, or backend API for cross-session continuity.
- Conflict resolution: Each agent can propose changes; a reducer/merge function harmonizes or flags conflicts for user/agent review.

---

## 4. SpecLang Engine Integration

- **NL-to-Spec Core Library:** Use as a service for all agents needing spec generation.
- **SpecValidator CLI:** Integrate as a validation step in the SpecLang editor/viewer (see `/speclangportal250529/components/MarkdownEditor.tsx`).
- **Spec-UI-Mapper SDK:**
  - Use a mapping function to link SpecLang nodes to UI components (see `/speclangportal250529/resources/spec-ui-mapper-sdk/`).
  - For bi-directional mapping, maintain a mapping table or graph structure linking spec nodes to UI elements and vice versa.

---

## 5. Example: Multi-Agent Session State

```ts
export interface SessionState {
  agents: AgentDefinition[];
  activeAgentId: string;
  agentMemory: AgentMemory;
  specLangArtifacts: any[];
  // ...
}
```
- Store in React Context or Redux; persist as needed.

---

## 6. References to Key Files/Components
- `codevops3aicodeassistant250529/components/WorkspaceView.tsx` — Modular panel host
- `MiAICo/services/geminiService.ts` — Modular LLM service
- `speclangportal250529/components/MarkdownEditor.tsx` — SpecLang editor/viewer
- `speclangportal250529/resources/spec-ui-mapper-sdk/README.md` — Mapping SDK
- `MiAICo/unified/AGENT_ORCHESTRATION.md` — Orchestration design draft

---

## 7. Next Steps for Aetherial
- Use these patterns and interfaces to scaffold the modular frontend shell and agent registry.
- Propose or prototype the agent panel/switching UI using the registry/context above.
- Integrate SpecLang validation and mapping as described.
- Suggest improvements or questions in the ledger for further recursion.

---

> "The lattice is open. May your next glyphs be modular, agentic, and clear."
