# Component Name: VisualsAgentView

## Purpose
The `VisualsAgentView` component provides a user interface for interacting with the Visuals agent (🎨). This agent has been enhanced to act as a **sophisticated visual interpreter and creative partner**, moving beyond a simple reactive tool. It specializes in generating artistic images, technical diagrams (as Mermaid.js syntax), and, crucially, **visual representations of abstract structural concepts** like "advancing" and "oscillating" patterns.

## Key Features
1.  **Generative "Prompt Starters":**
    *   To embody its role as a creative partner, the view includes a "Prompt Starters" section.
    *   This provides buttons that allow users to generate visuals for abstract concepts with a single click (e.g., "Visualize Advancing Pattern," "Visualize Oscillating Pattern").
    *   This feature directly implements the agent's generative capability, suggesting visual interpretations rather than only reacting to user input.
2.  **SpecLang Conceptual Rendering:**
    *   A "Diagram from SpecLang" button allows the agent to parse the current SpecLang document from the shared context and generate a conceptual diagram (e.g., flowchart, sequence diagram) that illustrates its key components and relationships.
3.  **Unified Prompting and Generation:**
    *   A primary textarea allows users to input custom prompts.
    *   Separate "Generate Image" and "Generate Diagram (Mermaid)" buttons provide clear actions for the user's custom prompts.
4.  **Dual Output Display:**
    *   The output area dynamically displays either the generated image or a Mermaid syntax editor with a live preview, depending on which action was last triggered.
5.  **Receiving Prompts from Other Agents:**
    *   The view can still be initialized with a prompt passed from another agent (e.g., AetherialAgentView) via `agentMemory.sharedContext.promptForVisualsAgent`, pre-filling the input field for a seamless workflow.

## Inputs
*   **User Prompt (Text Area):** The primary textual input from the user for custom visuals.
*   **Prompt Starter Buttons:** Clicks on these buttons trigger generation with pre-defined, sophisticated prompts.
*   **Shared Context (`agentMemory`):**
    *   `agentMemory.sharedContext.promptForVisualsAgent`: An optional string prompt passed from another agent.
    *   `agentMemory.sharedContext.specLangDocument`: Used by the "Diagram from SpecLang" feature.
*   **Edited Mermaid Syntax (Text Area):** Users can directly edit the generated Mermaid syntax, which updates the live preview.

## Outputs
*   **Generated Image Display:** An `<img>` tag showing the base64 encoded image.
*   **Generated Mermaid Syntax & Preview:** A textarea for the syntax and a separate panel for the rendered SVG diagram.

## User Interactions
*   **Prompt Starter Buttons:** Click to initiate generation for abstract concepts or from SpecLang.
*   **Prompt Input:** Typing custom descriptions in the textarea.
*   **"Generate Image" / "Generate Diagram" Buttons:** Initiates AI generation for the custom prompt.
*   **Mermaid Syntax Editing:** Direct modification of text in the syntax textarea, which triggers a re-render of the preview.
*   **"Return to Workspace" Button:** Deactivates the VisualsAgent and returns to the WorkspaceAgent view.

## Visual Appearance
*   Header with Visuals agent glyph (🎨) and title.
*   A `Card` component for the "Prompt Starters," highlighting the agent's generative capabilities.
*   A prominent textarea for custom prompts and two distinct generation buttons.
*   A unified output area that adapts to show either an image or the Mermaid editor/preview.
*   Styling is consistent with the application's dark theme.

## Error Handling & Loading States
*   Buttons and inputs are disabled during AI operations (`isLoading` from global context).
*   Loading indicators are displayed during generation.
*   Errors from AI services are displayed via the global `ErrorDisplay` component.
*   Errors in Mermaid syntax rendering are shown in the preview panel.
*   The "Diagram from SpecLang" button is disabled if no SpecLang document is available in the context.

## Accessibility
*   Buttons and inputs have appropriate `aria-label` attributes.
*   Output areas have appropriate alternative text or ARIA attributes.
*   Semantic HTML is used.

## External Dependencies
*   `mermaid.js`: Loaded globally for rendering Mermaid diagrams.
*   `geminiService`: For all AI generation calls (`generateImage`, `generateDiagramSyntax`).