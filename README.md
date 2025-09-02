# MiAICo (Agentic CoDev Companionship Platform)

The Agentic CoDev Companionship Platform aims to revolutionize software development by creating a symbiotic environment where human developers and a team of specialized AI agents collaborate seamlessly. Using Natural Language Specifications (SpecLang) as the bridge between human intent and machine execution, it fosters a more intuitive, efficient, and accessible workflow. The ultimate goal is to transform the development process into a creative partnership, accelerating innovation from concept to code.

## Core Philosophy

*   **Agentic Collaboration:** Multiple AI agents, each with unique roles (e.g., architecture, UI/UX, code generation, validation), assist the user and each other.
*   **SpecLang Centricity:** Natural Language Specifications (SpecLang) serve as the primary medium for capturing intent, driving AI understanding, and bridging the gap between ideas and implementation.
*   **Iterative Development:** The platform supports an iterative workflow, from conceptualization and Q&A to planning, implementation, and review, with AI assistance at each step.

## Core Features

*   **AI-Assisted Conceptualization:** Define your goals, and AI agents help break down initial thoughts into structured elements.
*   **Natural Language to SpecLang Document Generation:** Convert conceptualization text into a structured Markdown document using SpecLang principles (e.g., Overview, Screens, Components, Global Behaviors).
*   **Interactive Multi-Agent Q&A:** Ask questions about your project, and relevant AI agents provide answers, potentially referencing existing files or web sources.
*   **Automated Development Planning:** Generate structured development plans, including files to be modified and detailed action items, driven by SpecLang.
*   **AI-Powered Code Implementation & Review:** Let AI agents generate or revise code based on the development plan and assist in reviewing changes.
*   **Image & Diagram Generation:** Create artistic images or Mermaid.js diagrams from textual prompts.
*   **Streamlined Commit Flow:** Prepare for committing your changes with a clear overview of implemented tasks.
*   **Extensible Architecture (Future):** Designed to support a plugin system for adding new agents and tools.

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

*   **Direct Code Modification for API_KEY (Not Recommended for `API_KEY`):**
    For quick, isolated local testing *without* a proper environment variable setup for `API_KEY`, you *could* temporarily modify `services/geminiService.ts` by replacing `process.env.API_KEY` directly with your API key string:
    ```typescript
    // In services/geminiService.ts
    // const API_KEY = process.env.API_KEY; // Default line
    const API_KEY = "YOUR_ACTUAL_GEMINI_API_KEY_HERE"; // Replace with your key for temporary local testing
    ```
    **This is strongly discouraged for any shared, production, or version-controlled scenarios due to security risks.** Always prefer a proper environment variable setup. For `GH_TOKEN`, direct code modification should also be avoided for similar security reasons.

## Project Structure

*   `index.html`: The main entry point for the application.
*   `index.tsx`: Initializes the React application.
*   `App.tsx`: The root React component, managing state and routing between different application steps.
*   `metadata.json`: Contains application metadata, including permissions.
*   `constants.ts`: Holds mock data and constant values.
*   `types.ts`: Defines TypeScript interfaces for data structures.
*   `components/`: Contains reusable UI components.
*   `pages/`: Contains components for each step/page of the application flow.
*   `services/`: Contains modules for interacting with external APIs.
*   `cli/`: Contains command-line interface tools related to the project (e.g., `specValidator.ts`).
*   `tests/`: Contains tests for CLI tools or other non-React parts.
*   `ROADMAP.md`: Outlines the future development plans for the application.
*   `CHANGELOG.md`: Tracks application versions and changes.
*   `PROJECT_AETHERIAL_ARCHITECT_LEDGER.md`: Documents key decisions, refactorings, and milestones for Project Aetherial Architect.
*   `AETHERIAL_SYNTHESIS_AND_FORWARD_LOOK.md`: Aetherial agent's perspective on the unified platform vision.
*   `RESEARCH_REQUEST.md`: Queries for further research to support platform development.
*   `book/_/ledgers/`: Directory for storing detailed agentic ritual logs and specialized ledger entries.
*   `ISSUE_08.md`, `ISSUE_10.md`: Supporting documents related to SpecLang and its tooling.

## SpecLang Ecosystem

This application is part of a broader exploration into SpecLang, a structured language for software specifications.
*   **NL-to-Spec Generation:** The app can generate SpecLang documents from natural language.
*   **SpecValidator CLI (`cli/specValidator.ts`):** A separate command-line tool (prototype) for validating SpecLang documents.

## Roadmap

See the [ROADMAP.md](ROADMAP.md) file for an overview of planned features and development phases for the Agentic CoDev Companionship Platform.

## Capabilities

The platform leverages various services, primarily through `services/geminiService.ts` (for AI tasks) and `services/githubService.ts` (for GitHub interactions), to provide its capabilities. These include conceptualization analysis, Q&A, development planning, code implementation, image/diagram generation, and (mocked) GitHub operations.

## Contributing

Contributions are welcome! Please open an issue first to discuss any potential changes or feature requests.