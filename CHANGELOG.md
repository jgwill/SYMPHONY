# Changelog

## Version 0.1.4 - 2025-05-31 (Projected)

### New Features

*   **Agent Selection Panel & UI Framework Foundation:**
    *   Introduced an `AgentSelectionPanel` component (`components/AgentSelectionPanel.tsx`), displayed as a new, fixed-width sidebar on the far left of the application.
    *   This panel lists available agents (from `MOCK_AGENT_REGISTRY` in `services/agentRegistry.ts`) using their glyphs/icons and allows users to select an "active" agent.
    *   The active agent is visually highlighted, and tooltips display agent names on hover for better UX.
    *   The `Header` (`components/Header.tsx`) now includes a "Sparkles" icon button (`components/icons.tsx`) to toggle the visibility of the `AgentSelectionPanel`.
    *   Core application state in `App.tsx` (`activeAgentId`, `agentRegistry`, `isAgentPanelOpen`) and `AppContextType` in `types.ts` were updated to manage and expose agent selection capabilities.
    *   Session persistence (`SavedSessionData` in `types.ts`) now includes `activeAgentId` and `agentMemory` to support multi-agent contexts.
    *   This feature lays the groundwork for a multi-agent UI, enabling future functionalities where different agents can contribute to the user's workflow.

## Version 0.1.3 - 2025-05-30 (Projected)

### New Features

*   **Natural Language to SpecLang Document Generation:**
    *   Integrated a new AI capability to transform natural language conceptualization input into a structured SpecLang document.
    *   The `services/geminiService.ts` now includes an `nlToSpec` function. This function uses a dedicated prompt to guide the Gemini model in generating Markdown output with standard SpecLang sections: "Overview," "Screens," "Components," "Global Behaviors," and "Clarifying Questions."
    *   Added a new "Generate SpecLang Document" button on the `ConceptualizationPage`. This button uses the text area input to call the `nlToSpec` service.
    *   Introduced a new `AppStep.SPECLANG_VIEW` and a corresponding `SpecLangViewPage.tsx`. This page displays the generated SpecLang document with basic Markdown-like formatting and provides an option to return to the conceptualization step.
    *   Updated application state (`AppContextType`, `ConceptualizationState`) to manage and store the generated SpecLang document.

### Supporting Resources & Tools

*   **SpecLang Context Documents:**
    *   Added `ISSUE_08.md`: Describes the concept and goals for an "NL-to-Spec Core Library."
    *   Added `ISSUE_10.md`: Provides a specification for a "SpecValidator CLI" tool.
*   **SpecValidator CLI Tool (Prototype):**
    *   Added `cli/specValidator.ts`: A prototype command-line tool for validating SpecLang documents based on structure, clarity, and completeness.
    *   Added `tests/specValidator.test.ts`: Basic tests for the SpecValidator CLI.
    *   Note: This CLI tool is not integrated into the frontend UI but serves as a related tool in the SpecLang ecosystem.
*   The `services/geminiService.SpecLangVersion.ts` file, which was a source for the `nlToSpec` function, has had its core functionality merged into the main `geminiService.ts`.

### Enhancements

*   Updated `types.ts` to include the new `SPECLANG_VIEW` app step and modify `ConceptualizationState`.
*   Modified `App.tsx` to handle the new app step, state for the SpecLang document, and the `handleGenerateSpecLang` logic.
*   Adjusted `pages/ConceptualizationPage.tsx` to include the new button and pass the corresponding handler.
*   The `README.md` and `ROADMAP.md` have been updated to reflect this new capability and the broader SpecLang tooling context.

## Version 0.1.2 - 2025-05-29

### New Components

*   **`Card` Component (`components/Card.tsx`):**
    *   Introduced a new reusable `Card` component to provide a consistent visual structure for content sections.
    *   The `Card` supports an optional `title`, `headerContent` (for actions/buttons in the header), and custom `className` props.
    *   Styled with `bg-slate-800`, `rounded-lg`, `shadow-lg`, and internal padding.
    *   Exported from `components/index.ts`.

### Enhancements

*   **`StartSessionPage.tsx` Layout Refactor:**
    *   Refactored the "Repositories," "Recently assigned issues," and "Recent sessions" sections to use the new `Card` component.
    *   This change standardizes the appearance of these sections, improving the overall layout and visual consistency of the page.
    *   Adjusted internal paddings and margins to align with the `Card` component's structure.
    *   Improved empty state messages for "Recently assigned issues" and "Recent sessions" when no data is available.

## Version 0.1.1 - 2025-05-29

### Enhancements

*   **Questioning Page Restructure (`pages/QuestioningPage.tsx`, `App.tsx`):**
    *   The "Initial Analysis Overview" (AI's response to the user's conceptualization) is now consistently treated as the first message in the chat history. This message is identified by `id: 'init'` and `sender: 'ai'` within `chatMessages`, ensuring it persists throughout the Q&A session.
    *   The `QuestioningPage` layout has been reconfigured using `ResizablePanelsLayout`:
        *   **Left Panel ("Questioning"):** This panel now hosts the primary chat interface. It displays the full chat history, beginning with the initial AI analysis, followed by user questions and AI responses. The chat input field, send button, and suggested questions are all part of this panel.
        *   **Right Panel ("Context & Planning"):** This panel provides supporting information. It displays the "User's Initial Input" (the original conceptualization text) and the "Ideas for Planning" list. The "Add to task" button is located in the header of this panel.
    *   The "Add to task" button functionality in the right panel has been updated. It captures a summary of the latest Q&A interaction (or the initial AI analysis if no other interaction has occurred) from the left panel and adds it to the "Ideas for Planning" list in the right panel.
    *   In `App.tsx`, the `handleStartConceptualization` function ensures that `conceptualization.initialQueryElements` (the AI's initial analysis) is set as the first message in the `chatMessages` state.
    *   Specialized rendering logic within `QuestioningPage.tsx` (`renderInitialAnalysisMessage`) is used to format and display the initial AI analysis message distinctly, parsing its structured Markdown content.
    *   Panel titles and styling have been adjusted to reflect this new layout and functionality.

## Version 0.1.0 - 2024-07-03

### New

*   **CHANGELOG.md**: Initialized to track application versions and changes.

### Implemented & Verified

*   **Resizable Panel Animation (`components/ResizablePanelsLayout.tsx`):**
    *   Verified and ensured smooth open/close animation for the left panel.
    *   The left panel container's width is animated using CSS transitions (`transition-all duration-300 ease-in-out`).
    *   `overflow-hidden` is applied to the container for clean animation.
    *   The resize handle (`<div onMouseDown={handleMouseDown}...>`) is conditionally rendered, appearing only when the panel is open and has a non-zero width (`showLeftPanel && currentLeftPanelWidth > 0`). This prevents interaction with a zero-width handle.

*   **Enhanced Diff View (`pages/ImplementationPage.tsx`):**
    *   Improved the display of file differences with a structured, line-by-line, color-coded representation.
    *   Added lines are highlighted in green (`bg-green-800/30 text-green-300`).
    *   Deleted lines are highlighted in red (`bg-red-800/30 text-red-300`).
    *   Diff hunk headers (`@@ ... @@`) and file headers (`--- a/...`, `+++ b/...`) are styled distinctly (e.g., `text-purple-400`).
    *   Context lines are displayed with neutral styling.
    *   Uses a monospaced font for improved readability of code changes.
    *   The `DiffLine` component handles the rendering of individual diff lines.

### General UI/UX

*   **Application Layout (`App.tsx` & `pages/QuestioningPage.tsx`):**
    *   Ensured main content areas and `ResizablePanelsLayout` instances (like in `QuestioningPage`) correctly utilize available height, accounting for the fixed header. This uses `h-full` with `flex-grow` and `calc(100vh - var(--header-height))` where appropriate.