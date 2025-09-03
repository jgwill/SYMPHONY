

import { GoogleGenAI } from "@google/genai";
import { API_KEY_PLACEHOLDER } from '../constants';
import RealGeminiServiceImpl from './realGeminiServiceImpl';
import { MockGeminiServiceImpl } from './mockGeminiServiceImpl';
import { IGeminiService } from "../types";

const API_KEY = process.env.API_KEY;

let serviceImplementation: Omit<IGeminiService, 'getCapabilities'>;

if (API_KEY && API_KEY !== API_KEY_PLACEHOLDER && API_KEY !== "YOUR_GEMINI_API_KEY") {
  try {
    const aiInstance = new GoogleGenAI({ apiKey: API_KEY });
    const realServiceInstance = new RealGeminiServiceImpl(aiInstance);
    serviceImplementation = {
      conceptualize: realServiceInstance.conceptualize.bind(realServiceInstance),
      askQuestion: realServiceInstance.askQuestion.bind(realServiceInstance),
      nlToSpec: realServiceInstance.nlToSpec.bind(realServiceInstance),
      generatePlanFromSpec: realServiceInstance.generatePlanFromSpec.bind(realServiceInstance),
      implementFile: realServiceInstance.implementFile.bind(realServiceInstance),
      generateImage: realServiceInstance.generateImage.bind(realServiceInstance),
      generateDiagramSyntax: realServiceInstance.generateDiagramSyntax.bind(realServiceInstance),
      generateUIComponentIdeas: realServiceInstance.generateUIComponentIdeas.bind(realServiceInstance),
      mapSpecToConceptualUI: realServiceInstance.mapSpecToConceptualUI.bind(realServiceInstance),
      validateSyntaxAndLogic: realServiceInstance.validateSyntaxAndLogic.bind(realServiceInstance),
      suggestRefinements: realServiceInstance.suggestRefinements.bind(realServiceInstance),
      analyzeCodebaseForSpec: realServiceInstance.analyzeCodebaseForSpec.bind(realServiceInstance),
      refineSpecWithBdd: realServiceInstance.refineSpecWithBdd.bind(realServiceInstance),
      exportSpec: realServiceInstance.exportSpec.bind(realServiceInstance),
      elaborateUserStory: realServiceInstance.elaborateUserStory.bind(realServiceInstance),
      explainWithMetaphor: realServiceInstance.explainWithMetaphor.bind(realServiceInstance),
      generateEmpathyPrompts: realServiceInstance.generateEmpathyPrompts.bind(realServiceInstance),
    };
    console.info("Gemini API service initialized with real API key.");
  } catch (e) {
    console.error("Failed to initialize RealGeminiServiceImpl, falling back to mock. Error:", (e as Error).message);
    serviceImplementation = MockGeminiServiceImpl;
    let reason = "initialization error";
    console.warn(
        `Gemini API key (sourced from process.env.API_KEY) caused an ${reason}. ` +
        `Current value: '${API_KEY === undefined ? "undefined" : API_KEY}'. Mock responses will be used for AI features. ` +
        `Ensure 'process.env.API_KEY' is correctly set in your environment for live AI capabilities.`
    );
  }
} else {
  let reason = "not found or is undefined";
  if (API_KEY === API_KEY_PLACEHOLDER) reason = `the placeholder value "${API_KEY_PLACEHOLDER}"`;
  else if (API_KEY === "YOUR_GEMINI_API_KEY") reason = `the placeholder value "YOUR_GEMINI_API_KEY"`;
  else if (API_KEY === "") reason = "an empty string";
  
  console.warn(
    `Gemini API key (sourced from process.env.API_KEY) was ${reason}. ` +
    `Current value: '${API_KEY === undefined ? "undefined" : API_KEY}'. Mock responses will be used for AI features. ` +
    `Ensure 'process.env.API_KEY' is correctly set in your environment for live AI capabilities.`
  );
  serviceImplementation = MockGeminiServiceImpl;
}

export const geminiService: IGeminiService = {
  ...serviceImplementation,
  getCapabilities: () => {
    return [
      "🧠 AI-Assisted Conceptualization (Initial Analysis)",
      "📝 NL-to-SpecLang Document Generation",
      "💬 Interactive Q&A (Contextual)",
      "📋 Automated Development Planning (from SpecLang)",
      "🛠️ AI-Powered Code Implementation (from Plan/Spec)",
      "🖼️ Artistic Image Generation",
      "📊 Visual Diagram Image Generation",
      "📈 Mermaid.js Syntax Generation for Diagrams",
      "💡 UI Component Idea Generation (from SpecLang)",
      "🧩 SpecLang to Conceptual UI Mapping",
      "♠️ Syntax & Logic Validation (Nyro)",
      "♠️ Text Refinement Suggestions (Nyro)",
      "🔄 GitHub Integration (Mocked - via separate service)" 
    ];
  }
};