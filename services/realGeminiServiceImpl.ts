
import {
  GoogleGenAI,
  GenerateContentResponse,
  Content,
} from "@google/genai";
import { GEMINI_MODEL_NAME, IMAGEN_MODEL_NAME } from '../constants';
import { ChatMessage, PlanFile, GroundingChunk, PlanAction, IGeminiService, DevelopmentPlan, StructuredComponentIdea, ConceptualUIElement } from "../types";
import { parseJsonFromMarkdown, sanitizeMarkdownContent } from '../lib/utils'; // Added sanitizeMarkdownContent
import {
  CONCEPTUALIZE_SYSTEM_INSTRUCTION,
  ASK_QUESTION_SYSTEM_INSTRUCTION,
  GENERATE_PLAN_FROM_SPECLANG_SYSTEM_INSTRUCTION, // Renamed prompt
  IMPLEMENT_FILE_SYSTEM_INSTRUCTION,
  GENERATE_DIAGRAM_SYNTAX_SYSTEM_INSTRUCTION,
  NL_TO_SPEC_SYSTEM_INSTRUCTION,
  GENERATE_COMPONENT_IDEAS_SYSTEM_INSTRUCTION,
  MAP_SPEC_TO_CONCEPTUAL_UI_SYSTEM_INSTRUCTION,
  NYRO_VALIDATE_SYNTAX_LOGIC_SYSTEM_INSTRUCTION,
  NYRO_SUGGEST_REFINEMENTS_SYSTEM_INSTRUCTION,
  ANALYZE_CODEBASE_FOR_SPEC_SYSTEM_INSTRUCTION,
  REFINE_SPEC_WITH_BDD_SYSTEM_INSTRUCTION,
  EXPORT_SPEC_SYSTEM_INSTRUCTION
} from './geminiPrompts';

const INVALID_API_KEY_ERROR_MESSAGE = "Critical API Key Error: The Gemini API rejected the API key as invalid. This key is sourced from the 'process.env.API_KEY' environment variable. Please urgently verify that 'process.env.API_KEY' is correctly set to a valid Google Gemini API key in your local development environment. The application cannot function with AI features without a valid key. Mock data cannot be used if an invalid key is actively provided.";
const PROXY_STREAM_ERROR_MESSAGE = "Operation failed: The current environment or network proxy appears to not support required data streaming capabilities for this request. This can sometimes happen with specific proxy configurations. Please check your network setup or contact support if this issue persists.";

const isInvalidApiKeyError = (errorMessage: string): boolean => {
    const lowerMessage = errorMessage.toLowerCase();
    return (
        (lowerMessage.includes("status: 400") || lowerMessage.includes('"code":400')) &&
        (lowerMessage.includes("api key not valid") || lowerMessage.includes("api_key_invalid")  || lowerMessage.includes("api key is invalid")) &&
        lowerMessage.includes("invalid_argument")
    );
};

const isProxyStreamError = (errorMessage: string): boolean => {
    return errorMessage.includes("ReadableStream uploading is not supported") && 
           (errorMessage.includes("502") || errorMessage.toLowerCase().includes("proxying failed"));
};


class RealGeminiServiceImpl implements Omit<IGeminiService, 'getCapabilities'> {
  private ai: GoogleGenAI;

  constructor(aiInstance: GoogleGenAI) {
    this.ai = aiInstance;
  }

  private async _handleApiCall<T>(
    apiCall: () => Promise<T>, 
    errorMessagePrefix: string,
    isChatContinuation: boolean = false
  ): Promise<T> {
    try {
      return await apiCall();
    } catch (error) {
      console.error(`Gemini API error during ${errorMessagePrefix}:`, error);
      const errorMessage = (error as Error).message;
      if (isInvalidApiKeyError(errorMessage)) {
        if (isChatContinuation) throw error; 
        throw new Error(INVALID_API_KEY_ERROR_MESSAGE);
      }
      if (isProxyStreamError(errorMessage)) {
        if (isChatContinuation) throw error;
        throw new Error(PROXY_STREAM_ERROR_MESSAGE);
      }
      if (isChatContinuation) throw error; 
      throw new Error(`Failed to ${errorMessagePrefix}: ${errorMessage}. Please try again or check your connection/API key.`);
    }
  }

  async conceptualize(prompt: string): Promise<string> {
    return this._handleApiCall(async () => {
      const userContent: Content = { role: 'user', parts: [{ text: prompt }] };
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: [userContent],
        config: { systemInstruction: CONCEPTUALIZE_SYSTEM_INSTRUCTION }
      });
      return sanitizeMarkdownContent(response.text); // Sanitize here
    }, "conceptualize initial idea");
  }

  async askQuestion(question: string, contextMessages?: ChatMessage[]): Promise<ChatMessage> {
    const history: Content[] = (contextMessages || []).map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    const currentTurnContent: Content = { role: 'user', parts: [{ text: question }] };
    const fullHistory: Content[] = [...history, currentTurnContent];
    
    try {
      const response: GenerateContentResponse = await this._handleApiCall(async () => 
         this.ai.models.generateContent({
          model: GEMINI_MODEL_NAME,
          contents: fullHistory, 
          config: {
             tools: [{googleSearch: {}}],
             systemInstruction: ASK_QUESTION_SYSTEM_INSTRUCTION, 
          }
        }), "askQuestion", true); 
      
      const responseText = response.text;
      let mainAnswer = responseText;
      let relevantFilesFromAI: string[] = [];
      let suggestedQuestionsFromAI: string[] = [];

      const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/;
      const match = responseText.match(jsonBlockRegex);

      if (match && match[1]) {
        mainAnswer = responseText.substring(0, match.index).trim(); 
        try {
          const parsedJson = JSON.parse(match[1]);
          if (parsedJson.relevantFiles && Array.isArray(parsedJson.relevantFiles)) {
            relevantFilesFromAI = parsedJson.relevantFiles.filter((rf: any) => typeof rf === 'string');
          }
          if (parsedJson.suggestedQuestions && Array.isArray(parsedJson.suggestedQuestions)) {
            suggestedQuestionsFromAI = parsedJson.suggestedQuestions.filter((sq: any) => typeof sq === 'string');
          }
        } catch (e) {
          console.warn("AI response included a JSON block, but it failed to parse:", e);
        }
      }
      
      if (relevantFilesFromAI.length === 0) relevantFilesFromAI = ['docs/README.md'];
      if (suggestedQuestionsFromAI.length === 0) suggestedQuestionsFromAI = ["What's next?"];

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] | undefined;
      const sanitizedMainAnswer = sanitizeMarkdownContent(mainAnswer); // Sanitize main answer part

      return {
        id: Date.now().toString(),
        sender: 'ai' as 'ai',
        text: sanitizedMainAnswer || "I'm sorry, I couldn't formulate a response to that.", 
        relevantFiles: relevantFilesFromAI, 
        suggestedQuestions: suggestedQuestionsFromAI, 
        groundingChunks: groundingChunks,
      };
    } catch (error) {
        const errorMessage = (error as Error).message;
        let messageToUser = `Sorry, I encountered an error: ${errorMessage}. Please try again.`;
        if (isInvalidApiKeyError(errorMessage)) messageToUser = INVALID_API_KEY_ERROR_MESSAGE;
        else if (isProxyStreamError(errorMessage)) messageToUser = PROXY_STREAM_ERROR_MESSAGE;
        return {
            id: Date.now().toString(),
            sender: 'ai' as 'ai',
            text: messageToUser, // This is an error message, not Markdown from AI
            relevantFiles: ['docs/README.md'], 
            suggestedQuestions: ["What's next?"],
        };
    }
  }

  async generatePlanFromSpec(specLangDocument: string, chatHistory?: ChatMessage[], planningIdeasText?: string): Promise<DevelopmentPlan> {
    let userContentText = `SpecLang Document:
---
${specLangDocument}
---
`;

    if (planningIdeasText && planningIdeasText.trim()) {
      userContentText += `
Key Discussion Points & Ideas for Plan (from Q&A and user curation):
${planningIdeasText}
`;
    }

    if (chatHistory && chatHistory.length > 0) {
        userContentText += `
Full Discussion History (for deeper context, if needed):
${chatHistory.map(msg => `${msg.sender}: ${msg.text}`).join("\n")}
`;
    }
    userContentText += `
---
Generate the development plan now based on the SpecLang document.
If 'Key Discussion Points & Ideas' or 'Full Discussion History' were provided, use them to refine and prioritize the plan.
Ensure output is a single JSON object matching the DevelopmentPlan structure.`;

    const response: GenerateContentResponse = await this._handleApiCall(async () => 
      this.ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: [{ role: 'user', parts: [{ text: userContentText }] }],
        config: { 
          systemInstruction: GENERATE_PLAN_FROM_SPECLANG_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json" 
        }
      }), "generate plan from SpecLang");

    const responseText = response.text;
    // parseJsonFromMarkdown will throw if JSON is malformed.
    // This error will be caught by _handleApiCall and re-thrown with context.
    const parsedPlanData = parseJsonFromMarkdown<DevelopmentPlan>(responseText);

    // If parseJsonFromMarkdown did NOT throw, but the data is still not what we expect:
    if (!parsedPlanData || !parsedPlanData.id || !parsedPlanData.title || !Array.isArray(parsedPlanData.files)) {
      // This error indicates that the JSON was syntactically valid but semantically incorrect for a DevelopmentPlan.
      console.error("AI returned valid JSON, but it's not a valid plan structure. Raw response:", responseText);
      throw new Error("AI returned a JSON structure that is not a valid DevelopmentPlan. Please try regenerating.");
    }
    
    // Basic validation of structure
    const validatedFiles: PlanFile[] = parsedPlanData.files.map((file, fileIndex) => ({
      ...file,
      id: file.id || `gen_pf${fileIndex + 1}_${Date.now()}`,
      status: 'planned' as PlanFile['status'], 
      actions: (file.actions || []).map((action, actionIndex) => {
        const mainActionId = action.id || `gen_a${fileIndex}_${actionIndex + 1}_${Date.now()}`;
        return {
          ...action,
          id: mainActionId,
          completed: action.completed || false,
          subActions: (action.subActions || []).map((subAction, subActionIndex) => ({
            ...subAction,
            id: subAction.id || `gen_sa${fileIndex}_${actionIndex}_${subActionIndex + 1}_${Date.now()}`,
            completed: subAction.completed || false,
            subActions: subAction.subActions || [] 
          }))
        };
      })
    }));
    return { ...parsedPlanData, files: validatedFiles };
  }

  async implementFile(filePath: string, actions: string[], currentContent?: string, specLangContext?: string): Promise<{ newContent: string, diff: string }> {
    const actionText = actions.join(", ");
    let userContentText = `File Path: ${filePath}\nActions to implement in this file: ${actionText}\n`;
    if (specLangContext && specLangContext.trim()) {
      userContentText += `\nRelevant SpecLang Context for "${filePath}":\n---\n${specLangContext}\n---\n`;
    }
    if (currentContent) {
      userContentText += `\nCurrent content of ${filePath}:\n\`\`\`\n${currentContent}\n\`\`\`\n`;
    } else {
      userContentText += `\nThis is a new file. Generate its initial content based on the actions and SpecLang context.\n`;
    }
    userContentText += `\nOutput only the new, complete file content.`;


    const response: GenerateContentResponse = await this._handleApiCall(async () =>
      this.ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: [{ role: 'user', parts: [{ text: userContentText }] }],
        config: { systemInstruction: IMPLEMENT_FILE_SYSTEM_INSTRUCTION }
      }), `implement file "${filePath}"`);
      
    const newContent = response.text; // Expected to be raw code, no sanitization needed for Markdown fences
    let diff = `--- a/${filePath}\n+++ b/${filePath}\n`;
    if (currentContent && newContent) {
      const oldLines = currentContent.split('\n');
      const newLines = newContent.split('\n');
      // This is a simplified diff, a real diff library would be better
      diff += `@@ -1,${oldLines.length} +1,${newLines.length} @@\n`;
      oldLines.forEach(line => diff += `-${line}\n`);
      newLines.forEach(line => diff += `+${line}\n`);
    } else if (newContent) {
       diff += `@@ -0,0 +1,${newContent.split('\n').length} @@\n${newContent.split('\n').map(line => `+${line}`).join('\n')}`;
    } else {
      diff += `No changes detected or new content is empty.`;
    }
    return { newContent, diff };
  }

  async generateImage(prompt: string): Promise<{ base64Bytes: string, mimeType: string }> {
    const response = await this._handleApiCall(async () => 
      this.ai.models.generateImages({
        model: IMAGEN_MODEL_NAME,
        prompt: prompt,
        config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
      }), "generate image");

    if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image) {
      return {
        base64Bytes: response.generatedImages[0].image.imageBytes,
        mimeType: response.generatedImages[0].image.mimeType || 'image/jpeg' 
      };
    }
    throw new Error("No image generated or unexpected response structure from Imagen API.");
  }
  
  async generateDiagramSyntax(description: string): Promise<string> {
    const userContentText = `Description: "${description}"

Generate the Mermaid.js syntax for this description.`;

    const response: GenerateContentResponse = await this._handleApiCall(async () =>
      this.ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: [{ role: 'user', parts: [{ text: userContentText }] }],
        config: { systemInstruction: GENERATE_DIAGRAM_SYNTAX_SYSTEM_INSTRUCTION }
      }), "generate diagram syntax");
      
    let syntaxStr = response.text.trim();
    // This specific fence removal is for Mermaid, can be kept or adapted
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = syntaxStr.match(fenceRegex);
    if (match && match[2]) {
      syntaxStr = match[2].trim(); 
    }
    if (syntaxStr.toLowerCase().startsWith('mermaid')) { // Mermaid specific keyword removal
      syntaxStr = syntaxStr.substring('mermaid'.length).trim();
    }
    return syntaxStr;
  }

  async nlToSpec(naturalLanguageInput: string): Promise<string> {
    const userContent: Content = { role: 'user', parts: [{ text: naturalLanguageInput }] };
    const response: GenerateContentResponse = await this._handleApiCall( async () => 
      this.ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: [userContent],
        config: { systemInstruction: NL_TO_SPEC_SYSTEM_INSTRUCTION }
      }), "convert NL to SpecLang");
    return sanitizeMarkdownContent(response.text); // Sanitize here
  }

  async generateUIComponentIdeas(specLangSection: string): Promise<StructuredComponentIdea[]> {
    const userContentText = `SpecLang Document Section:
---
${specLangSection}
---
Generate UI component ideas based on this section.`;

    const response: GenerateContentResponse = await this._handleApiCall(async () =>
      this.ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: [{ role: 'user', parts: [{ text: userContentText }] }],
        config: {
          systemInstruction: GENERATE_COMPONENT_IDEAS_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json"
        }
      }), "generate UI component ideas");

    const responseText = response.text;
    const parsedIdeas = parseJsonFromMarkdown<StructuredComponentIdea[]>(responseText);

    if (parsedIdeas && Array.isArray(parsedIdeas) && parsedIdeas.every(idea =>
        typeof idea.name === 'string' &&
        typeof idea.description === 'string' &&
        Array.isArray(idea.keyFeatures) &&
        Array.isArray(idea.technologies) &&
        Array.isArray(idea.acceptanceCriteria) &&
        idea.keyFeatures.every(item => typeof item === 'string') &&
        idea.technologies.every(item => typeof item === 'string') &&
        idea.acceptanceCriteria.every(item => typeof item === 'string')
      )) {
      return parsedIdeas;
    } else {
      console.error("Failed to parse component ideas from AI or AI returned invalid structure. Raw response:", responseText);
      let errorMsg = "AI generated invalid component ideas structure. Please try again or refine your SpecLang section.";
      if (responseText && responseText.length < 200) { // Avoid logging huge invalid responses
        errorMsg += ` Raw Response (partial): ${responseText.substring(0,200)}`;
      }
      throw new Error(errorMsg);
    }
  }

  async mapSpecToConceptualUI(specLangDocument: string): Promise<ConceptualUIElement[]> {
    const userContentText = `SpecLang Document to Map:
---
${specLangDocument}
---
Generate the conceptual UI elements based on this SpecLang document.
Ensure output is a single JSON array matching the ConceptualUIElement structure.`;

    const response: GenerateContentResponse = await this._handleApiCall(async () =>
      this.ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: [{ role: 'user', parts: [{ text: userContentText }] }],
        config: {
          systemInstruction: MAP_SPEC_TO_CONCEPTUAL_UI_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json"
        }
      }), "map SpecLang to conceptual UI");

    const responseText = response.text;
    const parsedElements = parseJsonFromMarkdown<ConceptualUIElement[]>(responseText);

    const validateElements = (elements: any[]): elements is ConceptualUIElement[] => {
        return Array.isArray(elements) && elements.every(el => 
            typeof el.id === 'string' &&
            typeof el.type === 'string' &&
            (el.name === undefined || typeof el.name === 'string') &&
            (el.properties === undefined || typeof el.properties === 'object') &&
            (el.specLangSourceId === undefined || typeof el.specLangSourceId === 'string') &&
            (el.children === undefined || validateElements(el.children)) // Recursive validation for children
        );
    };
    
    if (parsedElements && validateElements(parsedElements)) {
      return parsedElements;
    } else {
      console.error("Failed to parse conceptual UI elements from AI or AI returned invalid structure. Raw response:", responseText);
      let errorMsg = "AI generated invalid conceptual UI structure. Please try again or refine your SpecLang document.";
       if (responseText && responseText.length < 200) {
        errorMsg += ` Raw Response (partial): ${responseText.substring(0,200)}`;
      }
      throw new Error(errorMsg);
    }
  }

  async validateSyntaxAndLogic(text: string): Promise<string> {
    const userContent: Content = { role: 'user', parts: [{ text }] };
    const response: GenerateContentResponse = await this._handleApiCall(async () =>
      this.ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: [userContent],
        config: { systemInstruction: NYRO_VALIDATE_SYNTAX_LOGIC_SYSTEM_INSTRUCTION }
      }), "validate syntax and logic with Nyro");
    return sanitizeMarkdownContent(response.text);
  }

  async suggestRefinements(text: string): Promise<string> {
    const userContent: Content = { role: 'user', parts: [{ text }] };
    const response: GenerateContentResponse = await this._handleApiCall(async () =>
      this.ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: [userContent],
        config: { systemInstruction: NYRO_SUGGEST_REFINEMENTS_SYSTEM_INSTRUCTION }
      }), "suggest refinements with Nyro");
    return sanitizeMarkdownContent(response.text);
  }

  async analyzeCodebaseForSpec(contextSummary: string): Promise<string> {
    const userContent: Content = { role: 'user', parts: [{ text: contextSummary }] };
    const response: GenerateContentResponse = await this._handleApiCall(async () =>
      this.ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: [userContent],
        config: { systemInstruction: ANALYZE_CODEBASE_FOR_SPEC_SYSTEM_INSTRUCTION }
      }), "analyze context for SpecLang");
    return sanitizeMarkdownContent(response.text);
  }

  async refineSpecWithBdd(specLang: string): Promise<string> {
    const userContent: Content = { role: 'user', parts: [{ text: specLang }] };
    const response: GenerateContentResponse = await this._handleApiCall(async () =>
      this.ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: [userContent],
        config: { systemInstruction: REFINE_SPEC_WITH_BDD_SYSTEM_INSTRUCTION }
      }), "refine spec with BDD");
    return sanitizeMarkdownContent(response.text);
  }

  async exportSpec(specLang: string): Promise<{ llm: string; agent: string; human: string }> {
    const userContent: Content = { role: 'user', parts: [{ text: specLang }] };
    const response: GenerateContentResponse = await this._handleApiCall(async () =>
      this.ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: [userContent],
        config: { 
            systemInstruction: EXPORT_SPEC_SYSTEM_INSTRUCTION,
            responseMimeType: "application/json"
        }
      }), "export spec");
      
    const parsedExports = parseJsonFromMarkdown<{ llm: string; agent: string; human: string }>(response.text);
    if (parsedExports && parsedExports.llm && parsedExports.agent && parsedExports.human) {
        return parsedExports;
    }
    throw new Error("AI returned an invalid structure for spec exports.");
  }
}

export default RealGeminiServiceImpl;