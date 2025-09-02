
# Service Name: RealGeminiServiceImpl

## Purpose
The `RealGeminiServiceImpl` class is responsible for handling all live interactions with the Google Gemini API. It encapsulates the logic for constructing API requests, sending them to the appropriate Gemini models, parsing the responses, and performing necessary error handling. It implements the `IGeminiService` interface (excluding `getCapabilities`, which is handled by the `geminiService.ts` factory).

## Key Methods & Functions
This service implements all methods defined in `Omit<IGeminiService, 'getCapabilities'>` from `types.ts`.

1.  **`constructor(aiInstance: GoogleGenAI)`**
    *   **Description:** Initializes the service with an instance of the `GoogleGenAI` client.
    *   **Inputs:** `aiInstance` (an initialized `@google/genai` client).
    *   **Behavior:** Stores the `aiInstance` for use by other methods.

2.  **`async conceptualize(prompt: string): Promise<string>`**
    *   **Description:** Analyzes an initial natural language prompt to break down a software idea.
    *   **Inputs:** `prompt` (user's initial idea as a string).
    *   **Outputs:** A `Promise` resolving to a Markdown string containing the AI's analysis (Overview, Current Behavior, Proposed Solution, Clarifying Questions).
    *   **Interactions:**
        *   Calls `this.ai.models.generateContent` with `GEMINI_MODEL_NAME`.
        *   Uses `CONCEPTUALIZE_SYSTEM_INSTRUCTION` as the system prompt.
        *   Sanitizes the Markdown output.
    *   **Error Handling:** Uses private `_handleApiCall` for common API error management.

3.  **`async askQuestion(question: string, contextMessages?: ChatMessage[]): Promise<ChatMessage>`**
    *   **Description:** Answers a user's question, maintaining context from previous chat messages and leveraging Google Search grounding if available.
    *   **Inputs:**
        *   `question` (user's current question).
        *   `contextMessages` (optional array of previous `ChatMessage` objects).
    *   **Outputs:** A `Promise` resolving to a `ChatMessage` object from the AI, including the main text, suggested files, suggested follow-up questions, and grounding chunks.
    *   **Interactions:**
        *   Constructs a history of `Content` objects from `contextMessages`.
        *   Calls `this.ai.models.generateContent` with `GEMINI_MODEL_NAME`.
        *   Uses `ASK_QUESTION_SYSTEM_INSTRUCTION` as the system prompt.
        *   Includes `tools: [{googleSearch: {}}]` in the config.
        *   Parses the AI's response to separate main text from the JSON block containing `relevantFiles` and `suggestedQuestions`.
        *   Sanitizes the main answer part of the response.
    *   **Error Handling:** Uses `_handleApiCall`, with special handling for chat continuation errors.

4.  **`async nlToSpec(naturalLanguageInput: string): Promise<string>`**
    *   **Description:** Converts a natural language description into a structured SpecLang Markdown document.
    *   **Inputs:** `naturalLanguageInput` (user's description).
    *   **Outputs:** A `Promise` resolving to a Markdown string representing the SpecLang document.
    *   **Interactions:**
        *   Calls `this.ai.models.generateContent` with `GEMINI_MODEL_NAME`.
        *   Uses `NL_TO_SPEC_SYSTEM_INSTRUCTION` as the system prompt.
        *   Sanitizes the Markdown output.
    *   **Error Handling:** Uses `_handleApiCall`.

5.  **`async generatePlanFromSpec(specLangDocument: string, chatHistory?: ChatMessage[], planningIdeasText?: string): Promise<DevelopmentPlan>`**
    *   **Description:** Generates a structured development plan (JSON) from a SpecLang document, optionally using chat history and planning ideas for context.
    *   **Inputs:**
        *   `specLangDocument` (the SpecLang Markdown).
        *   `chatHistory` (optional array of `ChatMessage`).
        *   `planningIdeasText` (optional string of curated ideas).
    *   **Outputs:** A `Promise` resolving to a `DevelopmentPlan` object.
    *   **Interactions:**
        *   Constructs a detailed prompt including the SpecLang, and optionally chat history and ideas.
        *   Calls `this.ai.models.generateContent` with `GEMINI_MODEL_NAME`.
        *   Uses `GENERATE_PLAN_FROM_SPECLANG_SYSTEM_INSTRUCTION` as the system prompt.
        *   Sets `responseMimeType: "application/json"` in the config.
        *   Parses the JSON response into a `DevelopmentPlan` object, performing basic validation.
    *   **Error Handling:** Uses `_handleApiCall`. Throws an error if the AI returns an invalid plan structure.

6.  **`async implementFile(filePath: string, actions: string[], currentContent?: string, specLangContext?: string): Promise<{ newContent: string, diff: string }>`**
    *   **Description:** Generates or modifies file content based on a list of actions and optional existing content/SpecLang context.
    *   **Inputs:**
        *   `filePath` (path of the file).
        *   `actions` (array of task descriptions).
        *   `currentContent` (optional existing file content).
        *   `specLangContext` (optional relevant SpecLang section).
    *   **Outputs:** A `Promise` resolving to an object with `newContent` (the complete new file content) and a simplified `diff` string.
    *   **Interactions:**
        *   Constructs a prompt detailing the file path, actions, current content (if any), and SpecLang context (if any).
        *   Calls `this.ai.models.generateContent` with `GEMINI_MODEL_NAME`.
        *   Uses `IMPLEMENT_FILE_SYSTEM_INSTRUCTION` as the system prompt.
        *   Generates a simplified diff string based on the old and new content.
    *   **Error Handling:** Uses `_handleApiCall`.

7.  **`async generateImage(prompt: string): Promise<{ base64Bytes: string, mimeType: string }>`**
    *   **Description:** Generates an image using the Imagen model.
    *   **Inputs:** `prompt` (text description for the image).
    *   **Outputs:** A `Promise` resolving to an object with `base64Bytes` (the image data) and `mimeType`.
    *   **Interactions:**
        *   Calls `this.ai.models.generateImages` with `IMAGEN_MODEL_NAME`.
        *   Requests 1 image and `image/jpeg` MIME type.
    *   **Error Handling:** Uses `_handleApiCall`. Throws an error if no image is generated.

8.  **`async generateDiagramSyntax(description: string): Promise<string>`**
    *   **Description:** Generates Mermaid.js diagram syntax from a textual description.
    *   **Inputs:** `description` (text description of the diagram).
    *   **Outputs:** A `Promise` resolving to a string containing the Mermaid.js syntax.
    *   **Interactions:**
        *   Calls `this.ai.models.generateContent` with `GEMINI_MODEL_NAME`.
        *   Uses `GENERATE_DIAGRAM_SYNTAX_SYSTEM_INSTRUCTION` as the system prompt.
        *   Trims and cleans the AI's response to extract raw Mermaid syntax.
    *   **Error Handling:** Uses `_handleApiCall`.

9.  **`async generateUIComponentIdeas(specLangSection: string): Promise<StructuredComponentIdea[]>`**
    *   **Description:** Generates a list of structured UI component ideas from a section of a SpecLang document.
    *   **Inputs:** `specLangSection` (Markdown text of the SpecLang section).
    *   **Outputs:** A `Promise` resolving to an array of `StructuredComponentIdea` objects.
    *   **Interactions:**
        *   Calls `this.ai.models.generateContent` with `GEMINI_MODEL_NAME`.
        *   Uses `GENERATE_COMPONENT_IDEAS_SYSTEM_INSTRUCTION` as the system prompt.
        *   Sets `responseMimeType: "application/json"` in the config.
        *   Parses the JSON response into `StructuredComponentIdea[]`, performing validation.
    *   **Error Handling:** Uses `_handleApiCall`. Throws an error if the AI returns an invalid structure.

10. **`async mapSpecToConceptualUI(specLangDocument: string): Promise<ConceptualUIElement[]>`**
    *   **Description:** Maps a SpecLang document to an array of conceptual UI elements.
    *   **Inputs:** `specLangDocument` (the SpecLang Markdown).
    *   **Outputs:** A `Promise` resolving to an array of `ConceptualUIElement` objects.
    *   **Interactions:**
        *   Calls `this.ai.models.generateContent` with `GEMINI_MODEL_NAME`.
        *   Uses `MAP_SPEC_TO_CONCEPTUAL_UI_SYSTEM_INSTRUCTION` as the system prompt.
        *   Sets `responseMimeType: "application/json"` in the config.
        *   Parses the JSON response into `ConceptualUIElement[]`, performing validation.
    *   **Error Handling:** Uses `_handleApiCall`. Throws an error if the AI returns an invalid structure.

11. **`async validateSyntaxAndLogic(text: string): Promise<string>`**
    *   **Description:** Analyzes a given text snippet for conceptual syntax validity and logical structure, intended for the Nyro agent.
    *   **Inputs:** `text` (string to analyze, could be code, SpecLang, etc.).
    *   **Outputs:** A `Promise` resolving to a Markdown string containing Nyro's analysis.
    *   **Interactions:**
        *   Calls `this.ai.models.generateContent` with `GEMINI_MODEL_NAME`.
        *   Uses `NYRO_VALIDATE_SYNTAX_LOGIC_SYSTEM_INSTRUCTION` as the system prompt.
        *   Sanitizes the Markdown output from the AI.
    *   **Error Handling:** Uses `_handleApiCall`.

12. **`async suggestRefinements(text: string): Promise<string>`**
    *   **Description:** Provides suggestions for refining a given text snippet for clarity, conciseness, and structure, intended for the Nyro agent.
    *   **Inputs:** `text` (string to analyze).
    *   **Outputs:** A `Promise` resolving to a Markdown string containing Nyro's refinement suggestions.
    *   **Interactions:**
        *   Calls `this.ai.models.generateContent` with `GEMINI_MODEL_NAME`.
        *   Uses `NYRO_SUGGEST_REFINEMENTS_SYSTEM_INSTRUCTION` as the system prompt.
        *   Sanitizes the Markdown output from the AI.
    *   **Error Handling:** Uses `_handleApiCall`.

## Private Methods

*   **`_handleApiCall<T>(apiCall: () => Promise<T>, errorMessagePrefix: string, isChatContinuation: boolean = false): Promise<T>`**
    *   **Description:** A generic wrapper for making API calls to Gemini, providing centralized error handling.
    *   **Behavior:**
        *   Executes the `apiCall` function.
        *   Catches errors and logs them.
        *   Checks for specific error types (invalid API key, proxy/streaming issues) and throws more user-friendly/specific errors.
        *   Rethrows other errors with a prefix.
        *   Handles `isChatContinuation` to decide whether to throw generic error messages or allow specific chat error handling.

## Error Handling Philosophy
*   The service aims to catch API-specific errors and transform them into more generic or user-actionable error messages.
*   Critical errors like an invalid API key are highlighted with specific messages.
*   Proxy or network-related streaming errors are also specifically identified.
*   For other errors, a general failure message is provided.
*   For chat (`askQuestion`), errors are handled to return an error `ChatMessage` rather than always throwing and halting the flow.

## Dependencies
*   `@google/genai`: The Google GenAI SDK.
*   `../constants`: For model names (`GEMINI_MODEL_NAME`, `IMAGEN_MODEL_NAME`).
*   `../types`: For various data type interfaces.
*   `../lib/utils`: For `parseJsonFromMarkdown` and `sanitizeMarkdownContent`.
*   `./geminiPrompts`: For system instruction strings.