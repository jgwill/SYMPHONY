# Application Scenarios & Validation (Agent-Centric Flow)

This document outlines key user scenarios to demonstrate and validate the functionality of the agent-centric platform.

### Scenario 1: Full-Stack Feature Development (The Core Loop)

**Goal:** To conceptualize, plan, and implement a new feature from start to finish, showcasing agent handoffs.

1.  **Workspace (🏠): Conceptualization**
    *   **Action:** User opens the app, selects a repository (e.g., `jgwill/TrinityTrading`), and enters a high-level feature idea into the "Start New Project" text area.
    *   **Prompt:** "I want to add a feature that tracks user portfolio performance over time, with a chart showing daily, weekly, and monthly gains."
    *   **Action:** User clicks "Conceptualize & Create SpecLang (with Mia)".
    *   **Expected:** The app transitions to the Mia (🧠) agent view.

2.  **Mia (🧠): Architecture & Planning**
    *   **Action (Automatic):** Upon arrival, Mia generates a SpecLang document based on the conceptualization text.
    *   **Action (User):** User reviews the SpecLang document. They then click "Gen Plan from Spec".
    *   **Expected:** Mia generates a detailed development plan, listing files like `src/services/portfolioService.ts` and `src/components/PerformanceChart.tsx`, each with specific action items.
    *   **Action (User):** User clicks on the file path for `src/components/PerformanceChart.tsx` in the plan.
    *   **Expected:** The app transitions to the Aetherial (💎) agent view, with `PerformanceChart.tsx` as the active file.

3.  **Aetherial (💎): Implementation & Refinement**
    *   **Action (Automatic):** Aetherial generates the initial React code for the `PerformanceChart.tsx` component based on the plan's actions.
    *   **Action (User):** User reviews the code and uses the "Revise..." input to request a change. **Prompt:** "Use a bar chart instead of a line chart."
    *   **Expected:** Aetherial revises the code to use a bar chart library/style.
    *   **Action (User):** User is satisfied and clicks "Mark as Implemented".
    *   **Expected:** The app transitions back to Mia's (🧠) view, showing the plan with `PerformanceChart.tsx` marked as complete. The user can now select the next file to implement.

### Scenario 2: UI/UX Ideation & Visualization

**Goal:** To brainstorm UI components from a spec and create a visual sketch.

1.  **Mia (🧠): Get Context**
    *   **Action:** In Mia's view, the user copies a component description from the SpecLang document.
2.  **Aetherial (💎): Ideation**
    *   **Action:** User switches to the Aetherial (💎) agent. Since no file is active, it's in ideation mode. The user pastes the SpecLang text into the textarea and clicks "Generate Component Ideas".
    *   **Expected:** Aetherial displays several structured component ideas (name, description, features, etc.).
3.  **Visuals (🎨): Sketching**
    *   **Action:** User clicks the "Sketch with Visuals Agent 🎨" button on one of the generated ideas.
    *   **Expected:** The app transitions to the Visuals (🎨) agent view. The prompt is pre-filled with a detailed description for generating a wireframe or sketch.
    *   **Action (User):** User clicks "Generate Visual Diagram (Image)".
    *   **Expected:** The Visuals agent displays a generated image of the UI component concept.

### Scenario 3: Code/Spec Validation

**Goal:** To use a specialized agent to review and improve a piece of code or text.

1.  **Anywhere:** The user has a piece of code or a SpecLang section they are unsure about.
2.  **Nyro (♠️): Analysis**
    *   **Action:** User switches to the Nyro (♠️) agent. They paste the text into the analysis textarea.
    *   **Action:** User clicks "Validate Syntax & Logic".
    *   **Expected:** Nyro provides feedback on the structural soundness and logical consistency of the text.
    *   **Action:** User then clicks "Suggest Refinements".
    *   **Expected:** Nyro provides actionable suggestions for improving the clarity and conciseness of the text.

### Scenario 4: Project Memory & Rituals

**Goal:** To archive a key decision or session state for future reference.

1.  **Context:** The user has just completed a major planning session with Mia and Aetherial.
2.  **Seraphine (🦢): Archiving**
    *   **Action:** User switches to the Seraphine (🦢) agent.
    *   **Action:** User clicks "Archive Session Snapshot".
    *   **Expected:** A new entry appears in the "Project Ledger Entries" list, containing a summary of the conceptualization text, SpecLang doc, and plan that were active during the session.
    *   **Action:** User types "Decision: We will use a serverless architecture for the backend." into the "Log New Ritual" textarea and clicks "Archive Ritual".
    *   **Expected:** A second new entry appears in the ledger with the user's manual note.

### Scenario 5: User-Centric Refinement

**Goal:** To ensure a feature is designed with user empathy.

1.  **Context:** A developer is about to start work on the "Recipe Submission Form".
2.  **Miette (🌸): Empathy Mapping**
    *   **Action:** User switches to the Miette (🌸) agent.
    *   **Action:** In the "Empathy Map Prompts" card, they type "A form for users to submit new recipes" and click "Get Empathy Prompts".
    *   **Expected:** Miette generates a set of questions to guide the developer's thinking about the user's experience (e.g., "What might a user be thinking before, during, and after submitting a recipe?"). This helps in building a more user-friendly feature.
