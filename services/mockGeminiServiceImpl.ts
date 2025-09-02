
import { ChatMessage, PlanFile, GroundingChunk, PlanningIdea, IGeminiService, DevelopmentPlan, PlanAction, StructuredComponentIdea, ConceptualUIElement } from "../types";
import { delay } from '../lib/utils';
import { 
  MOCK_SUGGESTED_QUESTIONS, 
  MOCK_PLAN_FILES, // This will be used inside the mock DevelopmentPlan
  mockGenerateContentResponse 
} from './geminiMockData';

const mockConceptualize = async (prompt: string): Promise<string> => {
  const mockResponseText = `## Overview
This is a mock conceptualization for: "${prompt.substring(0, 60)}..."
The AI would typically provide a brief summary of the core idea here.

## Current Behavior
- Current system lacks feature X.
- Users report difficulty with Y.

## Proposed Solution / How AI Can Assist
- AI can help design feature X.
- AI can generate user stories for improving Y.
- AI can draft API specs for Z.

## Clarifying Questions for User
1. What is the primary goal of feature X?
2. Can you provide examples of current user difficulties with Y?

This structured analysis provides a foundation for further discussion and planning.`;
  
  const mockResponse = mockGenerateContentResponse(mockResponseText);
  return delay(mockResponse.text);
};

const mockAskQuestion = async (question: string, contextMessages?: ChatMessage[]): Promise<ChatMessage> => {
  const previousContextSummary = contextMessages && contextMessages.length > 0 
      ? ` (building on context)` 
      : '';
  
  const mockGroundingChunks: GroundingChunk[] = [{web: {uri: "https://example.com/mock-source", title: "Mock Source Document"}}];
  const aiMockResponseText = `Regarding "${question}"${previousContextSummary}: Based on 'Mock Source Document' (example.com), the answer is likely 42. This is a mock.`;
      
  const mockResponse = mockGenerateContentResponse(aiMockResponseText, mockGroundingChunks);
  const responseText = mockResponse.text; 
  return delay({
    id: Date.now().toString(),
    sender: 'ai' as 'ai',
    text: responseText,
    relevantFiles: ['docs/MOCK_API.md', `src/utils/mockHelper.ts`],
    suggestedQuestions: MOCK_SUGGESTED_QUESTIONS.slice(0,2),
    groundingChunks: mockResponse.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] | undefined,
  });
};

const mockGeneratePlanFromSpec = async (specLangDocument: string, chatHistory?: ChatMessage[], planningIdeasText?: string): Promise<DevelopmentPlan> => {
  console.warn("AI service not available, returning mock plan from SpecLang:", specLangDocument.substring(0,50)+ "...");
  if (planningIdeasText) console.warn("Planning ideas provided to mock:", planningIdeasText.substring(0,50) + "...");
  
  // Construct a mock DevelopmentPlan using MOCK_PLAN_FILES
  const mockPlan: DevelopmentPlan = {
    id: `plan_${Date.now()}`,
    title: `Mock Plan from SpecLang: ${specLangDocument.substring(0,30)}...`,
    sourceSpecLangId: `spec_${Date.now()}`,
    files: MOCK_PLAN_FILES.map((pf, pfIndex) => ({
      ...pf,
      id: pf.id || `mock_pf_${pfIndex}_${Date.now()}`, // Ensure IDs
      actions: pf.actions.map((act, actIndex) => ({
        ...act,
        id: act.id || `mock_act_${pfIndex}_${actIndex}_${Date.now()}`,
        completed: false, // Ensure default
        subActions: (act.subActions || []).map((subAct, subActIndex) => ({
          ...subAct,
          id: subAct.id || `mock_sub_${pfIndex}_${actIndex}_${subActIndex}_${Date.now()}`,
          completed: false,
          subActions: subAct.subActions || []
        })) as PlanAction[]
      })) as PlanAction[]
    }))
  };
  return delay(mockPlan);
};

const mockImplementFile = async (filePath: string, actions: string[], currentContent?: string, specLangContext?: string): Promise<{ newContent: string, diff: string }> => {
  const actionText = actions.join(", ");
  let mockNewContent = `${currentContent || `// Mock new file: ${filePath}`}\n// AI mock implemented: ${actionText}\n`;
  if (specLangContext) {
    mockNewContent += `// Based on SpecLang context: ${specLangContext.substring(0,50)}...\n`;
  }
  mockNewContent += `export const mockFeature = () => "done";`;

  const mockDiff = `--- a/${filePath}\n+++ b/${filePath}\n@@ -1 +1,3 @@\n${currentContent ? `- ${currentContent.split('\n')[0]}...` : `- (File empty)`}\n+ // AI mock implemented: ${actionText}\n+ export const mockFeature = () => "done";`;
  
  const mockResponse = mockGenerateContentResponse(mockNewContent);
  return delay({ newContent: mockResponse.text, diff: mockDiff });
};

const mockGenerateImage = async (prompt: string): Promise<{ base64Bytes: string, mimeType: string }> => {
  console.warn("AI service not available, returning mock image for prompt:", prompt.substring(0,50)+"...");
  const mockSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="#4A5568"/><text x="50%" y="50%" dy=".3em" dominant-baseline="middle" text-anchor="middle" fill="#E2E8F0" font-size="12" font-family="sans-serif">Mock: ${prompt.substring(0,25)}...</text></svg>`;
  return delay({ base64Bytes: btoa(mockSvg), mimeType: 'image/svg+xml' }, 1000);
};

const mockGenerateDiagramSyntax = async (description: string): Promise<string> => {
  console.warn("AI service not available, returning mock Mermaid syntax for:", description.substring(0,50)+"...");
  const mockSyntax = `graph TD\nA["Input: ${description.substring(0,15)}..."] --> B(Process Mock);\nB --> C{Decision Point};\nC -->|Yes| D[Outcome 1];\nC -->|No| E[Outcome 2];`;
  return delay(mockSyntax, 800);
};

const mockNlToSpec = async (naturalLanguageInput: string): Promise<string> => {
  const mockResponseText = `## Overview
This is a mock SpecLang document for: "${naturalLanguageInput.substring(0, 60)}..."
It outlines the basic structure.

## Screens
- Screen: Main Dashboard
  - Purpose: Display key information and provide navigation.
  - Key Elements: Summary widgets, Navigation menu.

## Components
- Component: InfoCard
  - Function: Display a piece of information with a title.
  - Properties: title (string), content (string).

## Global Behaviors & Data
- Behavior: Theme Switching
  - Explanation: Allow users to switch between light and dark themes.
- Data: UserPreferences
  - Explanation: Stores user-specific settings like theme choice.

## Clarifying Questions for User
1. What specific metrics should the Main Dashboard display?
2. Should the InfoCard component support an icon?
`;
  const mockResponse = mockGenerateContentResponse(mockResponseText);
  return delay(mockResponse.text, 1000);
};

const mockGenerateUIComponentIdeas = async (specLangSection: string): Promise<StructuredComponentIdea[]> => {
  console.warn("AI service (generateUIComponentIdeas) not available, returning mock component ideas for spec section:", specLangSection.substring(0, 50) + "...");
  const mockIdeas: StructuredComponentIdea[] = [
    {
      name: "Configurable Dashboard Widget",
      description: "A reusable widget for dashboards that users can configure to display different data sets or visualizations from the provided SpecLang section.",
      keyFeatures: ["Dynamic data source binding (based on spec)", "User-selectable chart types (bar, line, pie)", "Draggable and resizable interface", "Settings panel for configuration"],
      technologies: ["React", "D3.js (for charts)", "TailwindCSS"],
      acceptanceCriteria: ["Widget renders correctly with default settings.", "User can change data source and chart type based on spec details.", "Configuration changes are persisted."]
    },
    {
      name: "Real-time NotificationItem",
      description: "Displays a single notification item within a notification feed, with support for different states (read/unread) and actions, derived from SpecLang events.",
      keyFeatures: ["Icon indicating notification type", "Timestamp and brief message", "Mark as read/unread functionality", "Action buttons (e.g., 'View Details', 'Dismiss')"],
      technologies: ["TypeScript", "React", "CSS-in-JS"],
      acceptanceCriteria: ["Displays notification content accurately as per spec.", "Mark as read updates visual state.", "Action buttons trigger correct callbacks defined in spec."]
    }
  ];
  return delay(mockIdeas, 1200);
};

const mockMapSpecToConceptualUI = async (specLangDocument: string): Promise<ConceptualUIElement[]> => {
  console.warn("AI service (mapSpecToConceptualUI) not available, returning mock conceptual UI elements for spec:", specLangDocument.substring(0, 50) + "...");
  const mockUIElements: ConceptualUIElement[] = [
    {
      id: `ui_mock_screen_${Date.now()}`,
      type: 'Screen',
      name: 'Main Application Screen (Mock)',
      specLangSourceId: 'Overview',
      children: [
        {
          id: `ui_mock_container_header_${Date.now()}`,
          type: 'Container',
          name: 'Header Area',
          children: [
            { id: `ui_mock_text_title_${Date.now()}`, type: 'Text', name: 'Application Title Text', properties: { content: 'My Mock App' } }
          ]
        },
        {
          id: `ui_mock_container_body_${Date.now()}`,
          type: 'Container',
          name: 'Main Content Area',
          children: [
            { id: `ui_mock_input_search_${Date.now()}`, type: 'Input', name: 'Search Input', properties: { placeholder: 'Search items...' } },
            { id: `ui_mock_button_submit_${Date.now()}`, type: 'Button', name: 'Submit Button', properties: { label: 'Search' } }
          ]
        }
      ]
    },
    {
      id: `ui_mock_comp_sidebar_${Date.now()}`,
      type: 'CustomComponent',
      name: 'NavigationSidebar (Mock)',
      specLangSourceId: 'Components:NavigationSidebar',
      properties: { defaultOpen: true },
      children: [
         { id: `ui_mock_text_nav_item1_${Date.now()}`, type: 'Text', name: 'Nav Item 1', properties: { content: 'Dashboard' } },
         { id: `ui_mock_text_nav_item2_${Date.now()}`, type: 'Text', name: 'Nav Item 2', properties: { content: 'Settings' } }
      ]
    }
  ];
  return delay(mockUIElements, 1100);
};

const mockValidateSyntaxAndLogic = async (text: string): Promise<string> => {
  console.warn("AI service (validateSyntaxAndLogic) not available, returning mock validation for:", text.substring(0, 50) + "...");
  const mockOutput = `### Mock Syntax & Structure Assessment:
For input: "${text.substring(0, 40)}..."
- Conceptual Syntax: Appears plausible.
- Structure: Seems consistent if this is a prose block.

### Mock Logic Analysis:
- Inferred Purpose: To describe [mock inferred purpose based on text snippet].
- Key Entities/Concepts: [mock_entity_1, mock_entity_2].

### Mock Potential Improvements/Edge Cases:
- Ambiguity: The term "[mock_ambiguous_term]" could be clarified.
- Edge Case: Consider what happens if [mock_condition_not_met].`;
  return delay(mockOutput, 900);
};

const mockSuggestRefinements = async (text: string): Promise<string> => {
  console.warn("AI service (suggestRefinements) not available, returning mock refinements for:", text.substring(0, 50) + "...");
  const mockOutput = `### Mock Refinement Suggestions:
For input: "${text.substring(0, 40)}..."

- **Clarity:** The phrase "[mock_phrase_to_clarify]" could be reworded to "[mock_clearer_phrase]" for better understanding.
- **Conciseness:** The sentence starting with "[mock_long_sentence_start]..." might be more impactful if shortened. Try removing redundant words.
- **Structure:** If this is part of a larger document, consider using bullet points for the list starting with "[mock_list_start]..." to improve readability.`;
  return delay(mockOutput, 800);
};

const mockAnalyzeCodebaseForSpec = async (contextSummary: string): Promise<string> => {
    console.warn("AI service (analyzeCodebaseForSpec) not available, returning mock analysis.");
    const mockSpec = `
# Mock Analysis of Context
Context provided: "${contextSummary.substring(0, 80)}..."

## Overview
This is a mock reverse-engineered SpecLang document. It outlines a more detailed structure based on the initial context provided.

## User Experience Flows
- User starts at the main dashboard.
- User interacts with a primary component to achieve a core task.
- System provides feedback and updates the view.

## Feature Inventory
- **Core Features**:
    - Primary Data Display
    - User Input Form
- **Supporting Features**:
    - State Persistence
    - Error Handling Notifications

## Aspirational & Creative Goals
- The application aims to feel "intuitive" and "responsive".
- A key interaction is the "seamless update" after user input.

## SpecLang Specification
### Screens
- **Screen**: MainAppView
  - **Purpose**: To provide the main interaction surface for the user.
  - **Key Elements**: Header, Main Content Area, Footer.

### Components
- **Component**: DataForm
  - **Function**: To capture user input for the core task.
  - **Properties**: \`onSubmit\`, \`initialData\`.
- **Component**: DataTable
  - **Function**: To display results from the core task.
  - **Properties**: \`dataRows\`, \`isLoading\`.

### Global Behaviors & Data
- **Behavior**: Data Caching
  - **Explanation**: User inputs and results should be cached locally to improve performance on subsequent visits.
- **Data**: AppState
  - **Explanation**: A central store for managing UI state, user data, and API results.

### Clarifying Questions
1. What is the expected data schema for the DataTable component?
2. How should the application behave on network failure during form submission?
`;
    return delay(mockSpec, 1500);
};

const mockRefineSpecWithBdd = async (specLang: string): Promise<string> => {
    console.warn("AI service (refineSpecWithBdd) not available, returning mock refinement.");
    const refinement = `
[Clarification Needed: What is the acceptable performance budget for the main data query?]

\`\`\`gherkin
Feature: Core Application Task
  Scenario: Successful data submission
    Given the user is on the MainAppView
    When they fill out the DataForm correctly
    And they click the "Submit" button
    Then the DataTable should update with the new results
\`\`\`

[BDD Scenario Needed: A scenario describing what happens when the user submits the form with invalid data.]

${specLang}
`;
    return delay(refinement, 1000);
};

const mockExportSpec = async (specLang: string): Promise<{ llm: string; agent: string; human: string }> => {
    console.warn("AI service (exportSpec) not available, returning mock exports.");
    const exports = {
        llm: `\`\`\`yaml
# Mock LLM Export
module: "CoreApp"
functional_requirements:
  - Display primary data view.
  - Accept user input via a form.
aspirational_goals:
  - "Provide a responsive and intuitive user experience."
parameters:
  - api_endpoint: "/api/data"
open_questions:
  - "[Clarification Needed] What are the specific validation rules for the input form?"
\`\`\``,
        agent: `## Mock Agent Discussion Export
### Feature: Data Submission
\`\`\`gherkin
Scenario: Successful data submission
  Given the user is on the MainAppView
  When they submit valid data
  Then the view should update with results
\`\`\`
**Discussion Points:**
- Error Handling: [Alternative A: Inline validation messages.] [Alternative B: A global toast notification.]
`,
        human: `## Mock Human Review Export
### Executive Summary of Open Questions:
- What is the desired user experience when data submission fails due to a network error?
- How should the data be sorted in the main view by default?

### Core User Journey
The user opens the app, sees a data view, fills out a form, and submits it to see updated results.
... (rest of spec for human review) ...
`
    };
    return delay(exports, 800);
};


export const MockGeminiServiceImpl: Omit<IGeminiService, 'getCapabilities'> = {
  conceptualize: mockConceptualize,
  askQuestion: mockAskQuestion,
  nlToSpec: mockNlToSpec,
  generatePlanFromSpec: mockGeneratePlanFromSpec,
  implementFile: mockImplementFile,
  generateImage: mockGenerateImage,
  generateDiagramSyntax: mockGenerateDiagramSyntax,
  generateUIComponentIdeas: mockGenerateUIComponentIdeas,
  mapSpecToConceptualUI: mockMapSpecToConceptualUI,
  validateSyntaxAndLogic: mockValidateSyntaxAndLogic,
  suggestRefinements: mockSuggestRefinements,
  analyzeCodebaseForSpec: mockAnalyzeCodebaseForSpec,
  refineSpecWithBdd: mockRefineSpecWithBdd,
  exportSpec: mockExportSpec,
};