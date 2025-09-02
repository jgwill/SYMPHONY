# Component Name: SeraphineAgentView

## Purpose
The `SeraphineAgentView` component provides a user interface for interacting with the Seraphine agent (🦢). Seraphine's role is to manage project memory by archiving significant events, decisions ("rituals"), milestones, and snapshots of the current session state (like conceptualization, SpecLang, plan) into a project ledger. This view allows users to contribute to this ledger and view its contents.

## Key Features
1.  **Log New Ritual/Milestone:**
    *   A textarea allows users to describe a significant project event, decision, achieved milestone, or any noteworthy "ritual."
    *   An "Archive Ritual" button saves this description as a new entry in the project ledger. This is a mock operation that updates Seraphine's `internalState` within the `agentMemory`.
2.  **Archive Session Snapshot:**
    *   A button "Archive Session Snapshot" creates a ledger entry summarizing the current state of key development artifacts:
        *   Initial Conceptualization Text (if available)
        *   Current SpecLang Document (if available)
        *   Current Development Plan (summary, e.g., number of files, if available)
    *   This provides a quick way to log the state of the project at a point in time. This is also a mock operation updating Seraphine's `internalState`.
3.  **View Project Ledger:**
    *   Displays a list of all archived entries (rituals, snapshots).
    *   Each entry shows its title, timestamp, type (e.g., 'manual_ritual', 'session_snapshot'), and full description.
    *   The list is scrollable if it exceeds the display area.

## Inputs
*   **New Ritual Text (Text Area):** User-provided text for manually logging a new ritual or milestone.
*   **Implicit Context (`agentMemory`):**
    *   `agentMemory.sharedContext`: Used when archiving a session snapshot to retrieve `initialConceptualizationText`, `specLangDocument`, and `currentPlan`.
    *   `agentMemory.agents['seraphine.ritualist.v1'].internalState.ledgerEntries`: Read to display existing ledger entries and updated when new entries are added.

## Outputs
*   **Ledger Display:** The primary output is the visual representation of the project ledger, showing all entries.
*   **Updated `agentMemory`:** New ledger entries are added to `agentMemory.agents['seraphine.ritualist.v1'].internalState.ledgerEntries`.

## User Interactions
*   **Typing:** Users type descriptions into the "New Ritual/Milestone" textarea.
*   **Button Clicks:**
    *   "Archive Ritual": Saves the content of the textarea as a new ledger entry.
    *   "Archive Session Snapshot": Creates and saves a summary of the current session's key artifacts.
    *   "Return to Workspace": Deactivates Seraphine's view and returns to the default Workspace agent.
*   **Scrolling:** Users can scroll through the list of ledger entries if it's long.

## Visual Appearance
*   The view includes a header with Seraphine's glyph (🦢) and title.
*   A brief introductory text explains Seraphine's purpose.
*   Uses `Card` components to group:
    *   The "Log New Ritual / Milestone" input area and button.
    *   The "Archive Session Snapshot" button and description.
*   The "Project Ledger Entries" section displays entries in a clear, list-like format, potentially with alternating background colors or borders for readability. Each entry shows its metadata and description.
*   Styling is consistent with the overall application's dark theme, potentially using accent colors associated with Seraphine (e.g., soft blues or greens).
*   Loading indicators are shown on buttons during mock processing.

## Error Handling & Loading States
*   Buttons and input fields are disabled when a mock archiving operation is in progress (`isLoading` from global context).
*   User feedback (e.g., "Please enter text...") is provided if required inputs are missing.
*   Global application errors (via `appError` from context) are displayed by the main `ErrorDisplay` component.

## Accessibility
*   Inputs have `aria-label` attributes.
*   Buttons have descriptive `aria-label` attributes.
*   Semantic HTML is used (e.g., `h2`, `h3` for titles, `ul`/`li` for lists if applicable).
*   Focus management adheres to standard web practices.
