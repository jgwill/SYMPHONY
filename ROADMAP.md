# SYMPHONY: Project Roadmap

This document outlines the planned development phases and features for the **SYMPHONY (Symbiotic Yielding Multi-agent Platform for Human Orchestrated Natural Yielding)** platform.

## Unique Value Propositions

*   **Creative Partnership Over Tool Usage:** The platform enables co-creation rather than task automation.
*   **Natural Language as Primary Interface:** SpecLang bridges human intent and machine execution.
*   **Advancing Pattern Architecture:** Systems naturally progress toward desired outcomes.
*   **Narrative-Driven Development:** Code stories preserve creative consciousness.

---

## Foundation Layer

*   **Objective:** Build the core libraries and frameworks that enable the platform's unique creative and analytical capabilities.
*   **Key Features & Tasks:**
    *   [*] **Agent Registry & Orchestration:**
        *   [x] Implemented `AgentSelectionPanel` for multi-agent collaboration.
        *   [x] Core state management for agents in `App.tsx` and `AppContext`.
        *   [ ] Enhance orchestration to support more complex, multi-agent workflows.
    *   [*] **SpecLang Parser & Generator:**
        *   [x] Core NL-to-SpecLang functionality implemented in `geminiService`.
        *   [ ] Develop into a more robust, standalone internal library.
    *   [ ] **RISE Framework Integration Module:**
        *   [ ] Implement "Creative Archaeology Service" for deep understanding of existing codebases.
    *   [ ] **Structural Tension Analytics:**
        *   [ ] Develop a "Tension Resolution Engine" to track progress from current reality to desired outcomes.

---

## Service Layer

*   **Objective:** Integrate and manage services that power the platform's AI, version control, and validation capabilities.
*   **Key Features & Tasks:**
    *   [*] **Gemini Integration Service:**
        *   [x] Core service refactored into `RealGeminiServiceImpl` and `MockGeminiServiceImpl`.
        *   [ ] Continuously refine prompts and integrate new Gemini capabilities.
    *   [*] **GitHub Integration Service:**
        *   [x] Implemented live read-only file tree fetching.
        *   [x] Commit/PR functionalities are currently mocked.
        *   [ ] Implement real branch creation and commit capabilities.
    *   [*] **Creative Validation Engine:**
        *   [x] Nyro agent provides conceptual validation for syntax and logic.
        *   [ ] Enhance with more sophisticated quality assurance for advancing patterns.
    *   [ ] **Knowledge Graph Service:**
        *   [ ] Implement semantic relationship mapping for deeper context understanding.

---

## UI/Experience Layer

*   **Objective:** Create an intuitive and immersive user interface that facilitates the creative partnership between human and AI agents.
*   **Key Features & Tasks:**
    *   [*] **Symphony Conductor Dashboard:**
        *   [x] The main application shell with the `AgentSelectionPanel` serves as the primary orchestration interface.
        *   [ ] Evolve into a more dynamic dashboard reflecting project state and agent activities.
    *   [*] **SpecLang Editor with Creative Validation:**
        *   [x] `MiaAgentView` provides an editor for SpecLang.
        *   [x] Integrated on-demand validation feedback via Mia -> Nyro agent handoff.
        *   [ ] Implement real-time intent refinement and suggestions.
    *   [*] **Agent Persona Interfaces:**
        *   [x] Dedicated views for each agent (Mia, Aetherial, Nyro, etc.) are implemented.
        *   [ ] Enhance interfaces to better reflect agent-specific character archetypes.
    *   [ ] **Collaborative Canvas:**
        *   [ ] Develop a visual representation of structural tension dynamics and project flow.

---

## Export & Integration Layer

*   **Objective:** Enable seamless integration with external tools and provide versatile ways to export project artifacts.
*   **Key Features & Tasks:**
    *   [*] **Multi-Context Export Engine:**
        *   [x] Mia's "Export Spec" feature provides a prototype for exporting to LLM, Agent, and Human-readable formats.
        *   [ ] Mature into a full-featured engine for various contexts (technical, stakeholder, UX).
    *   [ ] **Creative Advancement Scenario Generator:**
        *   [ ] Develop a BDD alternative focusing on narrative and desired outcomes.
    *   [ ] **Documentation Narrative Remixer:**
        *   [ ] Create a tool to transform technical specs into engaging, story-driven documentation.
    *   [ ] **Flowise Agent Flow Generator:**
        *   [ ] Explore automated workflow creation from successful, recurring patterns.

## Ongoing Considerations

*   **Performance:** Continuously monitor and optimize application speed and responsiveness.
*   **Security:** Ensure all integrations and data handling follow security best practices.
*   **User Feedback:** Actively collect and incorporate user feedback.
*   **Accessibility (WCAG):** Maintain and improve accessibility standards.
*   **Ledger System & "SpecLang Consciousness":** Continuously archive rituals, lessons, and the evolving philosophy of SpecLang to ensure project memory and alignment.