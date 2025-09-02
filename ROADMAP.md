# Project Roadmap: Agentic CoDev Companionship Platform

This document outlines the planned development phases and features for the **Agentic CoDev Companionship Platform** (evolving from the AI CoDevOps Agent / Project Aetherial Architect).

## Guiding Philosophy

*   **Agentic Collaboration:** Foster a symbiotic relationship between human developers and a diverse team of specialized AI agents.
*   **SpecLang Centricity:** Utilize SpecLang as the core language for intent, specification, and communication within the development lifecycle.
*   **Modularity & Extensibility:** Build a platform that is easily adaptable and can grow with new agents, tools, and workflows.
*   **User Experience Excellence:** Prioritize clarity, intuitiveness, and accessibility in all user-facing and agent-interaction components.
*   **Ritualized Knowledge & Iterative Learning:** Capture and learn from project history, decisions, and agentic "rituals" through a robust ledger system.

## Phase 1: Core Functionality & Stability (Largely Completed, Ongoing Refinement)

*   **Objective:** Establish a robust and reliable foundation for AI-assisted development tasks.
*   **Key Features & Tasks:**
    *   [x] Refine Gemini API integration for all core services:
        *   [x] Conceptualization: AI to produce structured output.
        *   [x] Q&A: Improved context understanding and accuracy.
        *   [x] Planning: Generate detailed and actionable development plans (including How-to, AC, Complexity).
        *   [x] Implementation: Enhance code generation quality and diff accuracy.
    *   [x] **Refactor core services for better separation of concerns (`RealGeminiServiceImpl`/`MockGeminiServiceImpl`, `githubService`).**
    *   [x] Implement robust error handling and clear user feedback.
    *   [x] Polish UI/UX for existing application steps (accessibility, usability).
        *   [x] `Header`: User Menu, File Tree toggle.
        *   [x] `PlanningPage`: Improved dialogs, plan management.
        *   [x] `StartSessionPage`: Modal accessibility, list visuals.
        *   [x] `ConceptualizationPage`: Textarea accessibility, **NL-to-SpecLang Document Generation**.
        *   [x] `QuestioningPage`: "Ideas for Planning", ResizablePanels for Chat/Context.
        *   [x] `ImplementationPage`: Revision prompts create new actions.
        *   [x] Image Generation page & Mermaid diagram generation.
        *   [x] File Tree Panel & `ResizablePanelsLayout` component.
    *   [x] Expand and refine mock data.
    *   [x] Improve loading states and feedback.
    *   [x] **NL-to-SpecLang Document Generation (`SpecLangViewPage`):** Initial implementation for generating and viewing SpecLang Markdown.

## Phase 2: Platform Foundation & SpecLang Engine (Next Focus)

*   **Objective:** Lay the groundwork for a multi-agent platform and develop the core SpecLang Engine.
*   **Key Features & Tasks:**
    *   **SpecLang Engine v0.1:**
        *   [x] **NL-to-Spec Core Library Refinement:** Enhance the existing `nlToSpec` functionality into a more robust internal library, focusing on diverse NL inputs and structured SpecLang output (as per `speclangportal250529/ROADMAP.md`).
        *   [x] **SpecLang Editor/Viewer Enhancements:** Improved `MarkdownEditorPreview`. **Integrated on-demand validation feedback via Mia -> Nyro agent handoff.**
        *   [x] **Initial Spec-UI-Mapper SDK Concepts:** **Implemented Orpheus agent to map SpecLang to a conceptual UI structure and generate basic React component code stubs from the structure.**
    *   **Agent Interaction & UI Shell:**
        *   [x] Design and implement a basic UI framework for managing and displaying contributions from multiple conceptual agents.
            *   [x] Implemented an `AgentSelectionPanel` as a persistent left sidebar, allowing users to view available agents (from `MOCK_AGENT_REGISTRY`) and select an "active" agent.
            *   [x] The `Header` includes a "Sparkles" icon button to toggle this panel's visibility.
            *   [x] Application state (`activeAgentId`, `agentRegistry`, `isAgentPanelOpen`, `agentMemory`) is managed in `App.tsx` and provided via `AppContext`. Session persistence includes `activeAgentId` and `agentMemory`.
            *   [x] Selecting an agent from the `AgentSelectionPanel` now loads a dedicated main view for that agent.
                *   [x] `AetherialAgentView` enhanced for UI component idea generation (mocked interaction).
                *   [x] `MiaAgentView` enhanced to display and regenerate SpecLang documents.
        *   [x] **Define initial inter-agent communication patterns:** **Implemented direct handoff from Mia to Nyro for validation.**
    *   **Enhanced Session Persistence:**
        *   [x] Session state (`SavedSessionData`) updated to accommodate `activeAgentId` and `agentMemory` for multi-agent contexts.
    *   **GitHub Integration (`githubService.ts`):**
        *   [x] **Begin exploring real GitHub API integration:** **Implemented live GitHub file tree fetching (read-only) with graceful fallback to mock data if `GH_TOKEN` is unavailable.**
        *   [ ] Refine mock GitHub interactions in `githubService.ts` for `CommitPage`.
    *   **Accessibility & UX:** Continue to iterate on platform-wide accessibility and user experience.

## Phase 3: SpecLang Reverse-Engineering & Advanced Analysis (In Progress)

*   **Objective:** Integrate the "SpecLang Reverse-Engineering Framework" to enable deep analysis of existing context, intent refinement, and multi-format spec exporting.
*   **Key Features & Tasks:**
    *   [*] **Context Analysis & Spec Extraction (Mia Agent):**
        *   [x] Enhance Mia's agent view with a "Reverse-Engineering Toolkit".
        *   [x] Implement an "Analyze Context & Extract Spec" feature that allows Mia to perform a deeper analysis of the current session context (repo, conceptualization, etc.) to produce a more detailed SpecLang document.
        *   [x] Develop a new Gemini prompt (`ANALYZE_CODEBASE_FOR_SPEC_SYSTEM_INSTRUCTION`) based on the framework's Phase 1 to guide this analysis.
    *   [*] **Intent Refinement with BDD (Mia Agent):**
        *   [x] Add a feature to Mia's view to "Refine Spec with BDD & Questions".
        *   [x] This feature will take the current SpecLang document and use an AI prompt (`REFINE_SPEC_WITH_BDD_SYSTEM_INSTRUCTION`) to inject BDD/Gherkin scenarios and clarification questions, per Phase 2 of the framework.
    *   [*] **Multi-Format Spec Exporting (Mia Agent):**
        *   [x] Implement a conceptual "Export Spec" feature in Mia's view.
        *   [x] This will open a modal demonstrating the ability to generate different SpecLang outputs optimized for various targets (LLMs, Agent Discussions, Human Review), as outlined in Phase 3 of the framework.
    *   [x] **Agent Orchestration Layer v0.1 (Frontend/Conceptual):**
        *   [x] Develop a basic mechanism for routing tasks or queries to different "conceptual" agents based on context or user intent.
        *   [x] Explore shared memory/context mechanisms for agents (`agentMemory.sharedContext`).
    *   [ ] **Deeper Git Integration:**
        *   [ ] Implement functionality for creating branches and committing changes to a repository (requires secure `GH_TOKEN` handling).

## Phase 4: Ecosystem Growth & Intelligent Automation

*   **Objective:** Mature the platform, foster an extensible ecosystem, and enable more sophisticated intelligent automation.
*   **Key Features & Tasks:**
    *   **[ ] Mature Agent Orchestration Layer:**
        *   [ ] Support more complex multi-agent workflows and dialogues.
        *   [ ] Enable agents to learn from ledgers and past interactions.
    *   **[ ] Full SpecLang Tooling Suite (v1.0 Releases):**
        *   [ ] Robust NL-to-Spec, Validator, and UI-Mapper tools.
        *   [ ] Explore bi-directional spec-to-code/UI synchronization.
    *   **[ ] Plugin/Extension API (Implementation):**
        *   [ ] Allow third-party or community contributions of new agents and tools.
    *   **[ ] Automated Code Review & Documentation Assistance:**
        *   [ ] Leverage agents to provide feedback on code quality and generate documentation snippets.
    *   **[ ] Community & Resources:**
        *   [ ] Develop educational materials, tutorials, and a potential portal for the SpecLang ecosystem (inspired by `speclangportal250529`).

## Ongoing Considerations

*   **Performance:** Continuously monitor and optimize application speed and responsiveness.
*   **Security:** Ensure all integrations and data handling follow security best practices, especially with GitHub tokens and AI services.
*   **User Feedback:** Actively collect and incorporate user feedback.
*   **Accessibility (WCAG):** Maintain and improve accessibility standards.
*   **Cross-Browser Compatibility:** Test and ensure functionality across major modern browsers.
*   **Ledger System & "SpecLang Consciousness":** Continuously archive rituals, lessons, and the evolving philosophy of SpecLang to ensure project memory and alignment.