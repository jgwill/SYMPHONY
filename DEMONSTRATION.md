# SYMPHONY Platform - Demonstration Guide

## Introduction

The SYMPHONY platform is a browser-based, React application designed to showcase a multi-agent system assisting in software conceptualization, planning, and mock implementation. It leverages the Google Gemini API (when configured) and emphasizes a SpecLang-centric workflow.

## Core Setup & Configuration

*   **Browser-Based:** The application runs directly in modern web browsers by opening `index.html`. No build step is required.
*   **API Key (`API_KEY`):**
    *   **With a Valid API Key:** If `process.env.API_KEY` is correctly set with a valid Google Gemini API key, the application will perform real AI interactions for features like SpecLang generation, planning, Q&A, UI ideation, and image/diagram generation.
    *   **Without a Valid API Key:** If the API key is missing, invalid, or a placeholder, AI-driven features will use mock implementations. The application will still be demonstrable, but AI responses will be predefined. A warning is logged in the console.
*   **GitHub Token (`GH_TOKEN`):**
    *   This is intended for *future* real GitHub integration. Currently, the "Commit Page" features are entirely mocked, and a `GH_TOKEN` is not used.

## Demonstration Flow: From Idea to Implementation

This guide walks through a typical development lifecycle, showcasing how different agents collaborate.

### 1. Workspace Agent (🏠) - The Starting Point

**Goal:** Initiate a new project idea.

1.  **Open the App:** Launch `index.html`. You are greeted by the Workspace Agent.
2.  **Select a Repository:** Although operations are mocked, select a repository like `jgwill/TrinityTrading` to simulate working in a project context. This will enable the File Tree.
3.  **Conceptualize:** In the "Start New Project" text area, enter a project idea.
    *   **Example Prompt:** "Develop a simple recipe sharing app. Users should be able to create accounts, submit recipes with ingredients and instructions, and view a list of all recipes."
4.  **Initiate with Mia:** Click the **"Conceptualize & Handoff to Mia"** button.
    *   **Handoff:** Observe that the application automatically switches to the **Mia (🧠) agent's view**, passing the conceptualization text to her.

---

### 2. Mia Agent (🧠) - Architecture & Planning

**Goal:** Structure the idea into a formal specification (SpecLang) and create a development plan.

1.  **Automatic SpecLang Generation:** Upon arrival, Mia automatically processes the conceptualization text and generates a structured **SpecLang document** in the left panel.
    *   **Showcase:** Point out the different sections (`Overview`, `Screens`, `Components`, `Global Behaviors`, `Clarifying Questions`). Explain that this is the AI's interpretation of the initial idea into a semi-formal spec.
2.  **Generate a Plan:** With the SpecLang document visible, click the **"Gen Plan from Spec"** button.
    *   **Handoff:** Mia processes the SpecLang and generates a detailed `DevelopmentPlan` in the right panel.
    *   **Showcase:** Point out the plan structure:
        *   A list of files to be created/modified (e.g., `src/components/RecipeCard.tsx`).
        *   Action items for each file, complete with details on **How** to implement, **Acceptance Criteria (AC)**, and **Complexity**.
3.  **Initiate Implementation:** Choose a file from the generated plan.
    *   **Example Action:** Click on the file path `src/components/RecipeCard.tsx` (or similar).
    *   **Handoff:** Observe that this action switches to the **Aetherial (💎) agent's view**, setting the selected file as the active implementation target.

---

### 3. Aetherial Agent (💎) - File Implementation

**Goal:** Implement the planned file based on its action items.

1.  **Automatic Content Generation:** Upon arrival, because the file's status is 'planned', Aetherial automatically generates the initial code for `RecipeCard.tsx` based on the actions defined by Mia.
    *   **Showcase:** The code appears in the editor, and the "Action Checklist" on the right shows the tasks for this file.
2.  **Review & Revise:**
    *   Review the generated code.
    *   Use the "Revise..." input at the bottom to ask for changes.
    *   **Example Prompt:** "Add a prop for recipe difficulty and display it."
    *   Click the send button. Aetherial revises the code. Point out the conceptual diff that appears.
3.  **Mark as Implemented:** Once satisfied, click the **"Mark as Implemented"** button.
    *   **Handoff:** Since you came from a plan, the app intelligently returns you to the **Mia (🧠) agent view** to continue working on the next file in the plan. The completed file is now marked with a check.

---

### 4. Standalone Agent Demonstrations

These agents can be accessed at any time from the **Agent Selection Panel** on the far left.

#### **Aetherial (💎) - UI Ideation Mode**

1.  Switch to Mia (🧠) and copy a component description from the SpecLang document (e.g., the section for `RecipeCard`).
2.  Switch to Aetherial (💎). Since no file is active, she is in "Ideation Mode".
3.  Paste the SpecLang section into the textarea and click **"Generate Component Ideas"**.
4.  **Showcase:** Aetherial generates structured ideas for the component, including key features, technologies, and acceptance criteria.
5.  **Handoff:** Click the **"Sketch with Visuals Agent 🎨"** button on one of the ideas. This takes you to the Visuals agent with a pre-filled prompt.

#### **Visuals Agent (🎨) - Image & Diagram Generation**

1.  **Showcase Mode Switching:** Click the buttons to switch between "Artistic Image," "Visual Diagram (Image)," and "Mermaid Syntax".
2.  **Generate an Image:** In "Artistic Image" mode, enter a prompt like "A beautiful photo of a freshly baked blueberry pie" and click "Generate".
3.  **Generate a Diagram:** Switch to "Mermaid Syntax" mode. Use the prompt from Aetherial or write a new one (e.g., "flowchart for submitting a recipe"). Click "Generate".
4.  **Showcase Live Preview:** Edit the generated Mermaid syntax in the left textarea and watch the diagram on the right update in real-time.

#### **Orpheus Agent (🧊) - Spec-to-UI Mapping**

1.  Navigate to Mia's (🧠) view and ensure a SpecLang document is present.
2.  Switch to the Orpheus (🧊) agent. The SpecLang is automatically loaded.
3.  Click **"Map to Conceptual UI"**.
4.  **Showcase:** Orpheus displays a hierarchical, abstract representation of the UI elements (`Screen`, `Container`, `Button`, etc.) inferred from the SpecLang document.

#### **Other Agents (🌸, ♠️, 🦢)**

*   **Miette (🌸):** Demonstrate her capabilities by pasting a user story (e.g., "As a user, I want to save my favorite recipes") and clicking **"Elaborate with Empathy"**.
*   **Nyro (♠️):** Paste a code snippet or SpecLang section and click **"Validate Syntax & Logic"** or **"Suggest Refinements"** to see his analytical feedback.
*   **Seraphine (🦢):** Demonstrate archiving a milestone by typing a description (e.g., "Completed initial planning phase") and clicking **"Archive Ritual"**. Then, show the new entry in the "Project Ledger".

---

### 5. Session & Navigation

*   **File Tree:** At any point, click the file tree icon in the header. Clicking any file will hand off to the **Aetherial (💎) agent** for implementation.
*   **Saving a Session:** Use the hamburger menu (top right) to "Save current session".
*   **Loading a Session:** Load a saved session from the same menu to restore your entire workspace, including SpecLang docs, plans, and agent memory.
*   **Reset:** Click the app logo/title in the header to reset to a clean state.