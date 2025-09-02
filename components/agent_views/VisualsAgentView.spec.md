
# Component Name: VisualsAgentView

## Purpose
The `VisualsAgentView` component provides a user interface for interacting with the Visuals agent (🎨). This agent specializes in generating various visual outputs based on user prompts: artistic images, visual diagrams (as images), and Mermaid.js syntax for diagrams. It serves as a dedicated tool for these visual generation tasks.

## Key Features
1.  **Mode Selection:**
    *   Users can switch between three generation modes:
        *   **Artistic Image:** For creative, non-diagrammatic images.
        *   **Visual Diagram (Image):** For generating diagrams like flowcharts or mind maps directly as images.
        *   **Mermaid Syntax:** For generating text-based Mermaid.js syntax that can be rendered into diagrams.
2.  **Prompt Input:**
    *   A unified textarea allows users to input their textual description or prompt for the desired visual.
    *   The placeholder text changes based on the selected mode to guide the user.
3.  **Content Generation:**
    *   A "Generate" button triggers the AI call to `geminiService` based on the active mode and prompt.
    *   Uses `geminiService.generateImage` for artistic images and visual diagram images.
    *   Uses `geminiService.generateDiagramSyntax` for Mermaid syntax.
4.  **Output Display:**
    *   **Image Modes:** Displays the generated image directly in the view. Shows a placeholder or loading state while generating.
    *   **Mermaid Syntax Mode:**
        *   Displays the generated Mermaid syntax in a textarea, allowing users to view and edit it.
        *   Provides a live preview area where the Mermaid syntax is rendered into a diagram using the `mermaid.js` library.
5.  **Receiving Prompts from Other Agents:**
    *   The view can be initialized with a prompt passed from another agent (e.g., AetherialAgentView) via `agentMemory.sharedContext.promptForVisualsAgent`.
    *   When activated with such a prompt, it pre-fills its input field and may adjust its mode accordingly (e.g., to 'mermaid_syntax' if the prompt suggests a diagram).
    *   Clears the shared context prompt after use.

## Inputs
*   **User Prompt (Text Area):** The primary textual input from the user describing the desired visual.
*   **Selected Mode:** User's choice of 'artistic_image', 'visual_diagram_image', or 'mermaid_syntax'.
*   **Shared Context (`agentMemory.sharedContext.promptForVisualsAgent`):** An optional string prompt passed from another agent.
*   **Edited Mermaid Syntax (Text Area):** Users can directly edit the generated Mermaid syntax.

## Outputs
*   **Generated Image Display:** An `<img>` tag showing the base64 encoded image for image modes.
*   **Generated Mermaid Syntax:** Displayed in a textarea.
*   **Rendered Mermaid Diagram:** SVG output from `mermaid.js` displayed in a preview panel.

## User Interactions
*   **Mode Selection Buttons:** Click to switch between generation modes. This also clears previous outputs and may clear the prompt.
*   **Prompt Input:** Typing in the textarea.
*   **"Generate" Button:** Initiates the AI generation process for the current mode and prompt.
*   **Mermaid Syntax Editing:** Direct modification of text in the Mermaid syntax textarea, which triggers a re-render of the preview.
*   **"Return to Workspace" Button:** Deactivates the VisualsAgent and returns to the WorkspaceAgent view.

## Visual Appearance
*   Header with Visuals agent glyph (🎨) and title.
*   Clear mode selection buttons.
*   A prominent textarea for prompt input.
*   A large "Generate" button.
*   Output area dynamically changes based on the mode:
    *   Image modes: Shows an image placeholder or the generated image.
    *   Mermaid mode: Shows a split view with a syntax editor on one side and a diagram preview on the other.
*   Styling is consistent with the application's dark theme.

## Error Handling & Loading States
*   "Generate" button and prompt input are disabled during AI operations (`isLoading` from global context or internal `isGeneratingSyntax`).
*   Loading indicators (spinners, text messages like "AI is creating...") are displayed during generation.
*   Errors from AI services are displayed via the global `ErrorDisplay` component.
*   Errors in Mermaid syntax rendering are shown in the preview panel.
*   Mermaid library initialization errors are handled.

## Accessibility
*   Buttons and inputs have appropriate `aria-label` attributes.
*   Mode selection buttons use `aria-pressed`.
*   Output areas (image, preview) have appropriate alternative text or ARIA attributes for live regions if content updates dynamically.
*   Semantic HTML is used.

## External Dependencies
*   `mermaid.js`: Loaded globally for rendering Mermaid diagrams. The component initializes and uses `window.mermaid`.
*   `geminiService`: For all AI generation calls.
