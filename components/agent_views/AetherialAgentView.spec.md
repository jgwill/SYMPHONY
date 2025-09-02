# Component Name: AetherialAgentView

## Purpose
The `AetherialAgentView` component provides a user interface for interacting with the Aetherial agent (💎). Aetherial specializes in UI/UX design, frontend component ideation from SpecLang, expert Gemini API interactions, and direct file implementation tasks (content generation and revision). This view serves as Aetherial's primary workspace.

## Key Features

### 1. UI/Component Ideation Mode (when no file is actively being implemented)
*   **SpecLang Section Input:** Allows users to paste a section from a SpecLang document (e.g., a component description from MiaAgentView) to serve as context for idea generation.
*   **AI-Powered Component Idea Generation:**
    *   Users can trigger Aetherial (via a real AI call to `geminiService.generateUIComponentIdeas`) to generate UI component ideas based on the provided SpecLang section.
    *   The AI is expected to return an array of `StructuredComponentIdea` objects, where each object contains:
        *   `name`: Name of the component.
        *   `description`: Purpose and function.
        *   `keyFeatures`: Array of key features/elements.
        *   `technologies`: Array of suggested technologies.
        *   `acceptanceCriteria`: Array of acceptance criteria.
*   **Display Generated Component Ideas:** Shows the list of structured component ideas, detailing their name, description, features, technologies, and acceptance criteria.
*   **Handoff to Visuals Agent:** Each generated idea includes a button to send a pre-formatted prompt to the Visuals Agent (🎨) for sketching, enabling a seamless handoff from ideation to visualization.

### 2. File Implementation Mode (when `activeFileForImplementation` is set in shared context)
*   **Active File Context Display:** Prominently displays the path of the file currently being implemented.
*   **File Content Editor/Viewer:**
    *   Displays the current content (`newContent` or original `content`) of the active file.
    *   Uses `MarkdownEditorPreview` for editing, allowing users to manually change content (if it's a text-based file).
*   **Action Checklist:**
    *   Displays the `PlanAction` checklist associated with the active file.
    *   Allows users to toggle the completion status of actions and sub-actions.
*   **AI-Powered Content Generation/Revision:**
    *   **Initial Generation:** If the file is new or marked for 'implementing' without existing `newContent`, Aetherial can generate the initial content based on its actions and SpecLang context.
    *   **Revision:** Users can provide a natural language prompt (e.g., "add error handling," "refactor this function") to instruct Aetherial to revise the current file content.
*   **Diff Display:** Shows a conceptual diff between the previous and new content after AI revisions.
*   **Mark as Implemented:** Allows the user to mark the file's planned actions as completed and update its status to 'implemented'. This also clears `activeFileForImplementation` and typically returns the user to the Workspace or Mia agent view.
*   **Regenerate Content:** Option to re-trigger AI generation for the entire file based on its actions.

## Inputs
*   **SpecLang Section for Ideation (Text Area):** User-provided text when in ideation mode.
*   **Revise Prompt (Text Input):** User's natural language instruction for revising file content.
*   **Shared Context (`agentMemory.sharedContext`):**
    *   `activeFileForImplementation: PlanFile | null`: Determines if the view is in file implementation mode and which file to operate on.
    *   `specLangDocument: string | null`: Used as context for AI operations, especially for file generation/revision and ideation.
    *   `currentPlan: DevelopmentPlan | null`: Used to update the status of files and actions.
*   **User Edits to File Content:** Direct modifications made by the user in the content editor.

## Outputs
*   **Generated UI Component Ideas:** Displayed as a list of `StructuredComponentIdea` objects, showing details for each.
*   **File Content Display:** Shows the active file's content in an editor.
*   **Diff Display:** Shows changes made by AI revisions.
*   **Updated `activeFileForImplementation`:** Changes to file content, status, and action completion are reflected back into the shared context.
*   **Updated `currentPlan`:** File status and action completion are synced with the overall development plan in shared context.
*   **Updated `sharedContext.promptForVisualsAgent`**: Can be set if other UI elements (not part of the current AI-generated component ideas loop) trigger sending a prompt to the VisualsAgent.
*   **Change in `activeAgentId`**: Set to `'visuals.tool.v1'` if sending a prompt to VisualsAgent, or another agent ID when exiting file implementation mode.

## User Interactions
*   **Mode Switching:** Implicitly switches between Ideation and File Implementation mode based on `activeFileForImplementation`.
*   **Button Clicks:**
    *   "Generate Component Ideas" (triggers live AI call).
    *   "Regenerate Content" (for active file)
    *   "Revise" (with AI, for active file)
    *   "Mark as Implemented" (for active file)
    *   Toggle action item checkboxes.
    *   "Add Action" (to manually add a `PlanAction` to the active file's checklist).
    *   "Sketch with Visuals Agent" (on component ideas).
*   **Text Input:** For SpecLang sections, revision prompts.
*   **Content Editing:** Direct manipulation of file content in the editor.
*   "Return to Workspace" button deactivates Aetherial, clears `activeFileForImplementation` and returns to the default workspace agent.

## Visual Appearance
*   Header with Aetherial's glyph (💎) and title.
*   Clear distinction between ideation mode and file implementation mode sections.
*   If in file implementation mode:
    *   File path is prominent.
    *   Layout includes areas for content editor, action checklist, and diff display.
*   Ideation mode: Text area for SpecLang input, button to generate, area to display structured component ideas.
*   Consistent use of icons and styling with the application theme.

## Error Handling & Loading States
*   Buttons and inputs are disabled during AI operations (`isLoading` from global context).
*   Loading indicators are displayed during AI processing.
*   Errors from AI services are displayed via the global `ErrorDisplay` component (by setting `appError` in context).

## Accessibility
*   Inputs and buttons have appropriate `aria-label` attributes.
*   Interactive elements are keyboard navigable.
*   Semantic HTML is used for structuring content.
*   Focus management is handled for modals or dynamic content changes.