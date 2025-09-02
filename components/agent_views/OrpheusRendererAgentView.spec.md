
# Component Name: OrpheusRendererAgentView

## Purpose
The `OrpheusRendererAgentView` component provides a user interface for interacting with the Orpheus agent (🧊). Orpheus's role is to act as a "Spec-UI-Mapper," taking a SpecLang document as input and generating a conceptual, abstract representation of the UI structure described within that document. This helps visualize the potential UI layout and components before actual implementation.

## Key Features
1.  **SpecLang Input Area:**
    *   A multi-line textarea where users can paste a SpecLang document or edit the one pre-filled from the shared context (`agentMemory.sharedContext.specLangDocument`).
    *   The placeholder text guides the user or indicates if existing SpecLang content is loaded.
2.  **Conceptual UI Mapping:**
    *   A "Map to Conceptual UI" button triggers an AI process (via `geminiService.mapSpecToConceptualUI`).
    *   The AI is expected to parse the SpecLang and return an array of `ConceptualUIElement` objects.
    *   Each `ConceptualUIElement` can have a `type` (e.g., 'Screen', 'Container', 'Button'), a `name`, `properties`, `children` (for hierarchy), and a `specLangSourceId` linking back to the spec.
3.  **Conceptual UI Display:**
    *   Displays the generated array of `ConceptualUIElement` objects in a hierarchical, readable format (e.g., a nested list).
    *   Each element shows its type, name (if any), properties, and source ID from the SpecLang.
    *   Child elements are indented to show nesting.

## Inputs
*   **SpecLang Document (Text Area):** User-pasted or pre-filled text from `agentMemory.sharedContext.specLangDocument`.
*   **Implicit Context (`agentMemory`):**
    *   `agentMemory.sharedContext.specLangDocument`: Used as default input for the textarea.

## Outputs
*   **Conceptual UI Structure Display:** The primary output is the visual representation of the `ConceptualUIElement` array.
*   (No direct updates to shared context like `specLangDocument` are made by Orpheus's actions, as it's primarily analytical.)

## User Interactions
*   **Typing/Pasting:** Users input or edit SpecLang text in the textarea.
*   **Button Clicks:**
    *   "Map to Conceptual UI": Submits the current SpecLang text for conceptual UI mapping.
    *   "Return to Workspace": Deactivates Orpheus's view and returns to the default Workspace agent.
*   **Scrolling:** Users can scroll through the displayed conceptual UI structure if it's long.

## Visual Appearance
*   The view has a header with Orpheus's glyph (🧊) and title.
*   An introductory text explains Orpheus's capabilities.
*   A `Card` component groups the SpecLang input textarea and the "Map to Conceptual UI" button.
*   The "Conceptual UI Structure" section displays the mapped elements. Styling clearly differentiates element types (e.g., color-coding for 'Screen', 'Container', 'Button') and shows hierarchy through indentation.
*   Styling is consistent with the application's dark theme, with accent colors suitable for Orpheus (e.g., purples or deep blues).
*   Loading indicators are shown during the mapping process.

## Error Handling & Loading States
*   The "Map to Conceptual UI" button and textarea are disabled during AI operations (`isLoading` from global context).
*   User feedback (e.g., "Please provide SpecLang...") is shown if the input textarea is empty.
*   Global application errors (via `appError` from context) are displayed by the main `ErrorDisplay` component.
*   A loading state message is displayed while Orpheus is "interpreting the spec."
*   If no UI elements are generated or an error occurs, an appropriate placeholder message is shown in the output area.

## Accessibility
*   The textarea and buttons have appropriate `aria-label` attributes.
*   Semantic HTML is used for structuring content.
*   Focus management follows standard web practices.
*   The conceptual UI display should be structured to be navigable by assistive technologies, even if it's a visual representation.
