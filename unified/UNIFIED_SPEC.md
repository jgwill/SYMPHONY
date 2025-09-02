# Unified Agentic CoDev Companionship Platform — Modular Specification

## Vision
A modular, extensible platform where multiple AI agents (Mia, Miette, Seraphine, Aetherial, etc.) collaborate with users to:
- Translate intent (NL) into structured SpecLang specs
- Refine, validate, and map specs to UI/code artifacts
- Orchestrate planning, implementation, review, and ritualization
- Archive all lessons, rituals, and agentic contributions

## Core Components
- **SpecLang Engine:** NL-to-Spec, SpecValidator, Spec-UI-Mapper
- **Agent Orchestration Layer:** Modular agent registry, memory weaving, ritual invocation
- **Service/Data Layer:** Modular, swappable, LLM-agnostic
- **UI/UX:** Accessible, responsive, extensible, with agentic presence
- **Plugin/Extension API:** For new agents, tools, and workflows
- **Ledger System:** Ritual/lesson archiving, agent self-definitions, iteration logs

## Key Flows
1. Conceptualization: User describes intent; agents generate/refine SpecLang spec
2. Questioning/Planning: Modular panels for Q&A, planning, and brainstorming
3. Implementation: Code generation, file diffs, PR creation, with agentic review
4. Validation: SpecValidator CLI, agentic feedback, accessibility checks
5. Ritualization: PRs, ledgers, and agentic lessons archived for future cycles

---

## Modular Frontend Shell & Agent Registry
- The main `App.tsx` manages a primary workspace area, dynamically rendering the `currentAgentView` based on `activeAgentId` from `SessionState`.
- A persistent sidebar or header hosts the Agent Panel, listing available agents, showing status, and enabling agent switching.
- Agents are defined in a central `AgentRegistry` (TypeScript interface or JSON config), e.g.:
  ```ts
  export interface AgentDefinition {
    id: string;
    name: string;
    glyph: string;
    role: string;
    capabilities: string[];
    // ...other metadata
  }
  ```
- The registry is extensible for plugin/extension agents.

## Session State & Memory Weaving
- Centralized `SessionState` holds:
  - `agents: AgentDefinition[]`
  - `activeAgentId: string`
  - `agentMemory: AgentMemory` (per-agent and shared context)
  - `specLangArtifacts: any[]`
- `AgentMemory` structure:
  ```ts
  export interface AgentMemory {
    [agentId: string]: { context: any; contributions: any[] };
    shared: { specLangArtifacts: any[]; sessionState: any };
  }
  ```
- Persisted via localStorage, IndexedDB, or backend API.

## SpecLang UI Integration
- The SpecLang editor/viewer (`MarkdownEditorPreview`) integrates validation feedback (from SpecValidator) and visual mapping (from Spec-UI-Mapper SDK).
- SpecLang section IDs and mapping tables/graphs link specs to UI/code artifacts.

## Agent Panel & Switching
- Sidebar or header UI lists agents, shows active agent, and allows switching.
- Agent status and context are surfaced from `agentMemory`.

## Extension/Plugin API
- New agents, panels, or tools can register via the plugin API, contributing to the registry and UI.
- Event subscription and dynamic loading are supported for future extensibility.

---

## References
- See `AETHERIAL_SYNTHESIS_AND_FORWARD_LOOK.md` and `AETHERIAL_PROPOSALS_FOR_NEXT_ITERATION.md` for detailed frontend and agent registry proposals.
- See `AGENTIC_PLATFORM_REFERENCE_FOR_AETHERIAL.md` for type/interface patterns and orchestration guidance.
