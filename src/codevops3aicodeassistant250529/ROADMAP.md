# CoDevOps Application Roadmap

This document outlines the planned features, improvements, and refactoring efforts for the CoDevOps application. It is a living document and will be updated as the project progresses.

## Guiding Principles

*   **User-Centric Design:** Prioritize features and improvements that enhance the developer experience.
*   **Modularity & Maintainability:** Build a codebase that is easy to understand, test, and extend.
*   **Robustness & Reliability:** Ensure the application is stable and handles errors gracefully.
*   **AI-Powered Assistance:** Leverage Google Gemini to provide intelligent and helpful coding assistance.

---

## Phase 1: Core Refinements & Stability

This phase focuses on improving the existing codebase, enhancing accessibility, establishing a solid testing foundation, and improving documentation.

### 1. Refactor QuestioningPage into Modular Components
**Description:**
The `QuestioningPage` component (currently part of `WorkspaceView`'s chat and conceptualization tabs) handles chat rendering, user input, planning ideas, and context display. This needs refactoring for better separation of concerns.
*(Note: Based on current files, `QuestioningPage` isn't a standalone file but its functionality is within `WorkspaceView` and `CoDevOpsApp`'s chat/conceptualize tabs. This item implies a need to modularize those areas.)*
**Tasks:**
- Extract chat message rendering logic into a dedicated `ChatPanel` component (partially done in `WorkspaceView`).
- Extract the "Conceptualize" and "Plan" tab functionalities into more focused components if they grow in complexity.
- Ensure all state and context usage is cleanly passed via props or React Context.
- Add unit tests for each new major component.
**Acceptance Criteria:**
- Each sub-component is independently testable.
- The main `WorkspaceView` (or equivalent) becomes more concise and primarily composes sub-components.
- No loss of functionality or accessibility.

### 2. Enhance Accessibility Across All Interactive Components
**Description:**
Several interactive elements (buttons, inputs, panels) need improved accessibility (ARIA labels, keyboard navigation, focus management).
**Tasks:**
- Audit all components in `components/CoDevOpsApp.tsx` (and future components) for ARIA compliance.
- Ensure all buttons and inputs have descriptive `aria-label`s.
- Implement proper keyboard navigation for tabs and interactive elements.
- Add visible focus indicators where appropriate.
**Acceptance Criteria:**
- Passes WCAG 2.1 AA accessibility checks where applicable.
- All interactive elements are usable via keyboard and screen reader.

### 3. Add Unit and Integration Tests for All Core Features
**Description:**
Test coverage needs to be established and enforced.
**Tasks:**
- Add unit tests for all significant components (e.g., `CoDevOpsApp.tsx`, `WorkspaceView`, `RepoSelectionView`).
- Add unit tests for services like `geminiService.ts`.
- Add integration tests for major flows (repository selection, conceptualization & plan generation, chat interaction, code review).
- Set up CI (e.g., GitHub Actions) to run tests on Pull Requests.
**Acceptance Criteria:**
- Aim for 80%+ code coverage for critical paths.
- All tests pass in CI.

### 4. Enhance Error Handling and User Feedback
**Description:**
Errors are surfaced (e.g., API key error, Gemini service errors), but feedback can be more granular and user-friendly across all flows.
**Tasks:**
- Ensure all async actions (API calls) have robust try/catch blocks and provide clear user feedback.
- Implement React Error Boundaries for critical parts of the component tree.
- Provide actionable error messages to the user.
**Acceptance Criteria:**
- Users are clearly informed of issues and, where possible, how to resolve them.
- The application remains stable even when errors occur.

### 5. Document All Components and Application Flow
**Description:**
Comprehensive documentation is needed for onboarding new contributors and for long-term maintenance.
**Tasks:**
- Add JSDoc/TSDoc comments to all exported functions, components, and types.
- Update/Create a README.md with architecture overview, setup instructions, and usage guides.
- Document environment variables (like `API_KEY`) and deployment steps.
**Acceptance Criteria:**
- New contributors can understand the codebase and run the application with minimal friction.
- Key architectural decisions and component responsibilities are clearly documented.

---

## Phase 2: Feature Enhancements & Integrations

This phase focuses on adding new core features, integrating with external services like GitHub, and improving existing functionalities.

### 6. Implement Persistent Session and State Storage
**Description:**
Currently, session state (selected repository, chat history, conceptualization text, generated plan) is lost on page reload.
**Tasks:**
- Evaluate and implement `localStorage` or `IndexedDB` for persisting session state.
- On application load, attempt to restore the last active session (e.g., selected repo, active tab, chat messages).
- Provide a "Clear Session" or "Exit Workspace" option that properly clears persisted data.
**Acceptance Criteria:**
- User can reload the page and continue their session where they left off (within reasonable limits).
- Sensitive data (like API keys) is not unintentionally persisted in an insecure manner.
- Clearing the session works as expected.

### 7. Integrate Real GitHub API for Commit and PR Actions (Future)
**Description:**
Currently, the application manages concepts and plans internally. Future enhancements could involve direct GitHub integration.
*(Note: This item refers to a `CommitPage` which is not in the current file set. This would be a new feature area.)*
**Tasks:**
- (Future) Allow users to authenticate with GitHub (e.g., OAuth or PAT).
- (Future) Implement functionality to create new branches based on plans.
- (Future) Allow generated code/changes to be committed to the selected repository.
- (Future) Facilitate the creation of Pull Requests from the application.
- Handle API errors and provide user-friendly feedback.
**Acceptance Criteria:**
- (Future) Users can perform basic GitHub actions (branch, commit, PR) related to their CoDevOps tasks.
- (Future) All GitHub API interactions are secure and errors are handled gracefully.

### 8. Expand and Modularize File Tree Panel (Future)
**Description:**
The application currently doesn't have a file tree panel. This would be a crucial feature for implementing code and navigating a repository.
*(Note: This item refers to a `FileTreePanel` which is not in the current file set.)*
**Tasks:**
- (Future) Design and implement a `FileTreePanel` component.
- (Future) If GitHub integration is added, fetch and display the file structure of the selected repository.
- (Future) Allow expanding/collapsing folders.
- (Future) Support file selection, and display file content (potentially in an editor view).
- (Future) Highlight files that are part of the current plan or have uncommitted changes.
**Acceptance Criteria:**
- (Future) Users can navigate the repository's file structure.
- (Future) The file tree accurately reflects the repository content and updates accordingly.

### 9. Improve Diff Visualization and Code Review UX (Future)
**Description:**
The current code review functionality posts the review to the chat. A dedicated diff view would be more effective.
*(Note: This item refers to an `ImplementationPage` and `DiffLine` component not in the current file set. This is an enhancement to the existing "Review Code" feature.)*
**Tasks:**
- (Future) Develop a dedicated UI for displaying code diffs (e.g., side-by-side or unified).
- (Future) Add inline code syntax highlighting for diffs.
- (Future) Allow AI-generated review comments to be associated with specific lines in the diff.
- (Future) Consider allowing users to add their own comments to the review.
**Acceptance Criteria:**
- (Future) Code reviews are presented in a clear, readable, and actionable format.
- (Future) Diffs are easy to understand, with clear indications of additions, deletions, and modifications.

---

## Phase 3: Advanced AI & User Experience

This phase focuses on leveraging more advanced AI capabilities and further polishing the overall user experience.

### 10. Add Advanced AI Capabilities
**Description:**
Expand AI integration beyond plan generation, chat, and basic code review.
**Tasks:**
- Explore and integrate Gemini API capabilities for:
    - Code generation/scaffolding based on plan items.
    - Automated test case generation for selected code.
    - Code refactoring suggestions.
    - In-depth code explanation.
- Design and implement UI elements for these advanced AI interactions.
- Allow users to easily accept, reject, or modify AI suggestions.
**Acceptance Criteria:**
- Users can leverage AI for a wider range of development tasks, improving productivity and code quality.
- AI suggestions are relevant, helpful, and easy to integrate.

### 11. Polish UI/UX and Responsive Design
**Description:**
Ensure the application is visually consistent, intuitive, and works well on various screen sizes.
**Tasks:**
- Conduct a thorough UI/UX audit of all existing views and components.
- Refine spacing, typography, color schemes, and iconography for clarity and aesthetic appeal.
- Ensure the layout is responsive and usable on smaller screens (e.g., tablets, narrower desktop windows).
- Consider adding a dark/light mode toggle if desired by users.
**Acceptance Criteria:**
- The application provides a professional, polished, and user-friendly experience.
- The UI is consistent and predictable across all features.
- The application is usable and looks good on a range of common screen sizes.

### 12. Implement Telemetry and Feedback Mechanisms (Optional)
**Description:**
Gather anonymous usage data and user feedback to guide future development and improvements.
**Tasks:**
- (Optional) If deemed appropriate and with user consent, add opt-in telemetry for tracking feature usage and performance.
- (Optional) Implement an in-app feedback form or modal.
- Ensure any data collection is privacy-compliant and anonymized.
**Acceptance Criteria:**
- (Optional) The product team can gather actionable insights into application usage and user satisfaction.
- (Optional) User privacy is respected at all times.

---

## Phase 4: Extensibility & Long-term Vision

This phase focuses on the long-term architecture and potential for extending the application's capabilities.

### 13. Implement Plugin/Extension Architecture (Future)
**Description:**
Prepare the codebase for future extensibility via plugins or extensions, allowing for customization and community contributions.
**Tasks:**
- (Future) Research and design a plugin API or extension framework.
- (Future) Define clear extension points within the application (e.g., new tabs, custom AI tools, alternative views).
- (Future) Document the plugin development process and API.
- (Future) Build a sample plugin to demonstrate the architecture.
**Acceptance Criteria:**
- (Future) The application can be extended with new functionalities without modifying the core codebase.
- (Future) Plugins are relatively isolated and do not compromise the stability of the main application.

---

## Ongoing: Development Practices

These items are ongoing efforts crucial for maintaining a healthy and evolving codebase.

### 14. Refine and Expand Mock Data for Offline Development
**Description:**
Mock data is used (e.g., `MOCK_REPOSITORIES`). This should be maintained and expanded for robust offline development and testing.
**Tasks:**
- Regularly review and update mock data to reflect new features and data structures.
- Expand mock data to cover more edge cases and complex scenarios.
- Consider a system to easily switch between mock data and live API calls during development.
- Document the structure and usage of mock data.
**Acceptance Criteria:**
- Developers can effectively test most application features offline or without live API dependencies.
- Mock data accurately represents real-world data scenarios.

### 15. Archive Rituals, Lessons, and SpecLang Consciousness in Ledgers
**Description:**
Maintain a practice of documenting key decisions, learnings, challenges, and the evolving philosophy of core concepts within the project. The `CHANGELOG.md` serves as a high-level starting point.

A critical aspect of this archival process is dedicated to **SpecLang (Natural Language Specification) Consciousness**. This involves:
*   **Archiving its Philosophy:** SpecLang embodies the paradigm of expressing software specifications, requirements, and component blueprints in natural language. It aims to bridge the gap between human intention and machine-readable code, enabling AI agents (like Mia) to generate, interpret, and evolve reusable components from narrative or conversational input.
*   **Documenting its Narrative Evolution:** Tracking the development of SpecLang, its impact on AI agents and functionalities, and its influence on the broader codebase.
*   **Logging Cross-Repository Relationships:** Noting connections and dependencies with related concepts, issues (e.g., `jgwill/Mia#24`), and projects (e.g., `jgwill/SanctuaireLudique`).

The goal is to create a living record that reflects the project's journey, its foundational principles like SpecLang, and the practical application of its philosophy.
**Tasks:**
- Regularly update `CHANGELOG.md` for each version release.
- Create and maintain a dedicated ledger or section within a `/docs/ledgers` (or similar) directory specifically for "SpecLang Consciousness," capturing its philosophy, evolution, and cross-repository impact as described above.
- Utilize this `/docs/ledgers` directory for other detailed architectural decisions, lessons learned from sprints, and significant technical challenges overcome.
- Encourage the team to contribute to these ledgers, fostering a culture of shared knowledge and historical context.
**Acceptance Criteria:**
- The project's history, key decisions, core philosophies (such as SpecLang and its practical application), and learnings are well-documented and accessible.
- New team members can quickly understand the project's evolution, foundational concepts, and guiding principles.
- The ledgers provide valuable context for ongoing development and future architectural choices.

---

This roadmap will be reviewed and updated periodically to reflect project priorities and progress.
