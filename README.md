# Codename: SYMPHONY
### Symbiotic Yielding Multi-agent Platform for Human Orchestrated Natural Yielding

Symphony captures the essence of a creative partnership, where human developers and AI agents collaborate harmoniously, progressing naturally toward desired outcomes. It transforms development from reactive problem-solving into a manifestation of creative intent through a symbiotic human-AI relationship.

## Unique Value Propositions

*   **Creative Partnership Over Tool Usage:** The platform enables co-creation rather than mere task automation.
*   **Natural Language as Primary Interface:** SpecLang serves as the bridge between human intent and machine execution.
*   **Advancing Pattern Architecture:** Systems are designed to naturally progress toward desired outcomes through creative patterns.
*   **Narrative-Driven Development:** "Code stories" and ledgers preserve the creative consciousness and history of the project.

## Platform Architecture Components

SYMPHONY is built upon several core creative enablement services:

*   **SpecLang Engine:** Enables users to create natural language specifications that bridge human intent and machine execution.
*   **Agent Orchestra:** Allows users to create specialized AI partnerships for different development phases, leveraging a diverse roster of agents.
*   **Creative Archaeology Service:** Empowers users to create deep understanding from existing codebases through the RISE (Read, Interpret, Synthesize, Explain) methodology.
*   **Tension Resolution Engine:** Facilitates the natural progression from the current reality of a project to its desired future state.

---

### Platform Libraries/Components Breakdown

#### Foundation Layer
*   **RISE Framework Integration Module:** For creative archaeology and intent extraction.
*   **SpecLang Parser & Generator:** Handles the transformation from natural language to structured specifications.
*   **Structural Tension Analytics:** Tracks progress through creative advancement patterns.
*   **Agent Registry & Orchestration:** Coordinates the multi-agent collaboration.

#### Service Layer
*   **Gemini Integration Service:** Provides the core AI-powered creative assistance.
*   **GitHub Integration Service:** Manages version control with a focus on narrative and collaborative history.
*   **Knowledge Graph Service:** Maps semantic relationships for deeper contextual understanding.
*   **Creative Validation Engine:** Ensures quality and coherence of advancing patterns.

#### UI/Experience Layer
*   **Symphony Conductor Dashboard:** The main interface for orchestrating the multi-agent collaboration.
*   **SpecLang Editor with Creative Validation:** A real-time environment for intent refinement.
*   **Collaborative Canvas:** A visual representation of the project's structural tension dynamics.
*   **Agent Persona Interfaces:** Unique UIs tailored to each agent's character archetype.

---

## Technology Stack

*   **Frontend:** React 19, TypeScript
*   **Styling:** Tailwind CSS
*   **AI Integration:** Google Gemini API (`@google/genai`)
*   **Module Loading:** ES Modules via `esm.sh` for browser-based imports.
*   **Diagramming:** Mermaid.js for rendering generated diagrams.

## Getting Started / Running the App

1.  **No Build Step Required:** This application is designed to run directly in a modern browser that supports ES Modules.
2.  **Open `index.html`:** Simply open the `index.html` file in your web browser.

### Environment Variables

This application requires certain environment variables to be available in its execution context for full functionality.

*   **`API_KEY` (Google Gemini API Key):**
    *   The application is hard-coded to expect the API key from an environment variable named `API_KEY` (i.e., `process.env.API_KEY`). This variable **must** be accessible in the execution context where the client JavaScript is initialized.
    *   If you are serving these files through a local development server, that server needs to be configured to inject or make `process.env.API_KEY` available to the client-side code.
    *   If this variable is not found or is a placeholder, the application will fall back to using mock data for AI features, and a warning will be logged in the browser console.
    *   **Addressing "Missing Modules" or `process.env` errors:** If your deployment environment reports errors related to `process.env` when loading `services/geminiService.ts`, it means `process.env.API_KEY` is not defined in the browser's JavaScript environment. The application code strictly adheres to sourcing the API key from `process.env.API_KEY` and **must not** be modified to include UI elements for key input. The key's availability is an external requirement for your deployment setup.

*   **`GH_TOKEN` (GitHub Token):**
    *   For future GitHub integration features (like performing real Git operations as outlined in the [ROADMAP.md](ROADMAP.md)), the application will expect a GitHub token to be available via `process.env.GH_TOKEN`.
    *   This token will be necessary for interacting with the GitHub API (e.g., creating branches, pull requests).
    *   Ensure this variable is set in your deployment environment when these features are implemented.

## Project Structure

*   `index.html`: The main entry point for the application.
*   `index.tsx`: Initializes the React application.
*   `App.tsx`: The root React component, managing state and orchestrating the agent views.
*   `components/`: Contains reusable UI components, including the agent-specific views.
*   `services/`: Contains modules for interacting with external APIs (Gemini, GitHub).
*   `ROADMAP.md`: Outlines the future development plans for the SYMPHONY platform.
*   `book/_/ledgers/`: Directory for storing detailed agentic ritual logs and specialized ledger entries.

## Roadmap

See the [ROADMAP.md](ROADMAP.md) file for an overview of planned features and development phases for the SYMPHONY platform.
