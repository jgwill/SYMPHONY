
# Service Name: MockGeminiServiceImpl

## Purpose
The `MockGeminiServiceImpl` module provides mock implementations for all methods defined in the `IGeminiService` interface (excluding `getCapabilities`). Its primary purpose is to allow for frontend development, testing, and demonstration of the application's AI-driven features without requiring a live connection to the Google Gemini API or consuming API quotas. It simulates AI responses with predefined or procedurally generated mock data.

## Key Methods & Functions
This module exports an object that structurally matches `Omit<IGeminiService, 'getCapabilities'>` from `types.ts`.

1.  **`async conceptualize(prompt: string): Promise<string>`**
    *   **Description:** Simulates the AI's analysis of an initial natural language prompt.
    *   **Inputs:** `prompt` (user's initial idea as a string).
    *   **Outputs:** A `Promise` resolving to a predefined Markdown string mimicking the structured analysis (Overview, Current Behavior, etc.) an AI would provide. The output includes parts of the input `prompt` for context.
    *   **Behavior:** Returns a hardcoded, structured Markdown string after a short delay (using `delay` utility).

2.  **`async askQuestion(question: string, contextMessages?: ChatMessage[]): Promise<ChatMessage>`**
    *   **Description:** Simulates an AI response to a user's question within a chat context.
    *   **Inputs:**
        *   `question` (user's current question).
        *   `contextMessages` (optional array of previous `ChatMessage` objects, used to adjust the mock response slightly).
    *   **Outputs:** A `Promise` resolving to a mock `ChatMessage` object from the AI, including mock text, plausible relevant files, and suggested follow-up questions from `MOCK_SUGGESTED_QUESTIONS`. It also includes mock grounding chunks.
    *   **Behavior:** Constructs a response string incorporating the input `question` and a note about context if `contextMessages` are present. Uses `mockGenerateContentResponse` to structure the output and `delay` for simulation.

3.  **`async nlToSpec(naturalLanguageInput: string): Promise<string>`**
    *   **Description:** Simulates the conversion of natural language input into a SpecLang Markdown document.
    *   **Inputs:** `naturalLanguageInput` (user's description).
    *   **Outputs:** A `Promise` resolving to a predefined Markdown string representing a mock SpecLang document. The output includes parts of the input `naturalLanguageInput`.
    *   **Behavior:** Returns a hardcoded, structured SpecLang Markdown string after a short delay.

4.  **`async generatePlanFromSpec(specLangDocument: string, chatHistory?: ChatMessage[], planningIdeasText?: string): Promise<DevelopmentPlan>`**
    *   **Description:** Simulates the generation of a development plan from a SpecLang document.
    *   **Inputs:**
        *   `specLangDocument` (the SpecLang Markdown).
        *   `chatHistory` (optional, logged to console if provided).
        *   `planningIdeasText` (optional, logged to console if provided).
    *   **Outputs:** A `Promise` resolving to a mock `DevelopmentPlan` object, structured using data from `MOCK_PLAN_FILES`.
    *   **Behavior:** Logs a warning about using mock data. Constructs a `DevelopmentPlan` with a dynamic title based on the input `specLangDocument` and populates files and actions from `MOCK_PLAN_FILES`, ensuring unique IDs and default states. Uses `delay`.

5.  **`async implementFile(filePath: string, actions: string[], currentContent?: string, specLangContext?: string): Promise<{ newContent: string, diff: string }>`**
    *   **Description:** Simulates AI-driven file content generation or modification.
    *   **Inputs:**
        *   `filePath` (path of the file).
        *   `actions` (array of task descriptions).
        *   `currentContent` (optional existing file content).
        *   `specLangContext` (optional relevant SpecLang section).
    *   **Outputs:** A `Promise` resolving to an object with `newContent` (mock generated content including references to inputs) and a `diff` string (a simplified mock diff).
    *   **Behavior:** Generates mock file content by appending comments about the implemented actions and SpecLang context to the `currentContent` (or a placeholder). Creates a very basic mock diff. Uses `delay`.

6.  **`async generateImage(prompt: string): Promise<{ base64Bytes: string, mimeType: string }>`**
    *   **Description:** Simulates image generation.
    *   **Inputs:** `prompt` (text description for the image).
    *   **Outputs:** A `Promise` resolving to an object with `base64Bytes` (a base64 encoded mock SVG image containing part of the prompt) and `mimeType: 'image/svg+xml'`.
    *   **Behavior:** Logs a warning. Generates a simple SVG as a string, base64 encodes it, and returns after a delay.

7.  **`async generateDiagramSyntax(description: string): Promise<string>`**
    *   **Description:** Simulates Mermaid.js diagram syntax generation.
    *   **Inputs:** `description` (text description of the diagram).
    *   **Outputs:** A `Promise` resolving to a string containing mock Mermaid.js syntax (a simple graph).
    *   **Behavior:** Logs a warning. Returns a hardcoded, simple Mermaid graph definition incorporating part of the input `description`. Uses `delay`.

8.  **`async generateUIComponentIdeas(specLangSection: string): Promise<StructuredComponentIdea[]>`**
    *   **Description:** Simulates the generation of UI component ideas from a SpecLang section.
    *   **Inputs:** `specLangSection` (Markdown text of the SpecLang section).
    *   **Outputs:** A `Promise` resolving to a predefined array of mock `StructuredComponentIdea` objects.
    *   **Behavior:** Logs a warning. Returns a hardcoded array of 2-3 `StructuredComponentIdea` objects after a delay.

9.  **`async mapSpecToConceptualUI(specLangDocument: string): Promise<ConceptualUIElement[]>`**
    *   **Description:** Simulates mapping a SpecLang document to conceptual UI elements.
    *   **Inputs:** `specLangDocument` (the SpecLang Markdown).
    *   **Outputs:** A `Promise` resolving to a predefined array of mock `ConceptualUIElement` objects, forming a small, hierarchical UI structure.
    *   **Behavior:** Logs a warning. Returns a hardcoded array of `ConceptualUIElement` objects representing a simple screen with some nested components. Uses `delay`.

10. **`async validateSyntaxAndLogic(text: string): Promise<string>`**
    *   **Description:** Simulates Nyro's syntax and logic validation.
    *   **Inputs:** `text` (string to analyze).
    *   **Outputs:** A `Promise` resolving to a mock Markdown string containing validation feedback.
    *   **Behavior:** Logs a warning. Returns a hardcoded Markdown string with mock validation details, referencing the input `text`. Uses `delay`.

11. **`async suggestRefinements(text: string): Promise<string>`**
    *   **Description:** Simulates Nyro's text refinement suggestions.
    *   **Inputs:** `text` (string to analyze).
    *   **Outputs:** A `Promise` resolving to a mock Markdown string containing refinement suggestions.
    *   **Behavior:** Logs a warning. Returns a hardcoded Markdown string with mock refinement suggestions, referencing the input `text`. Uses `delay`.

## General Behavior
*   All methods use the `delay` utility to simulate network latency, making the mock interactions feel more realistic.
*   Methods that would typically involve significant AI processing (e.g., `generatePlanFromSpec`, `generateImage`) log a warning to the console indicating that mock data is being used.
*   The mock data returned is generally simple but aims to match the expected structure of real AI responses.
*   It relies on `geminiMockData.ts` for some shared mock data structures (like `MOCK_SUGGESTED_QUESTIONS`, `MOCK_PLAN_FILES`, `mockGenerateContentResponse`).

## Dependencies
*   `../types`: For various data type interfaces (`ChatMessage`, `PlanFile`, `DevelopmentPlan`, etc.).
*   `../lib/utils`: For the `delay` utility function.
*   `./geminiMockData`: For shared mock data arrays and response structuring utilities.