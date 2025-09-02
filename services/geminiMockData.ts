
import {
  GenerateContentResponse,
  Content,
  FinishReason,
  SafetyRating,
  HarmCategory,
  HarmProbability,
  HarmSeverity,
  GroundingMetadata
} from "@google/genai";
import { PlanFile, GroundingChunk } from "../types";

// Moved from constants.ts
export const MOCK_SUGGESTED_QUESTIONS: string[] = [
  "How do we share embodiment artefacts with MiaNar?",
  "What are the steps for importing new patterns?",
  "How do we propose a recurring Bridgefire Ceremony?",
  "What are the guidelines for reciprocal contributions?",
  "More ideas about cross-repo propagation",
  "Learn about secure API integration"
];

export const MOCK_PLAN_FILES: PlanFile[] = [
  {
    id: 'pf1',
    path: 'app/api/ledger/route.ts',
    status: 'planned',
    actions: [
      { id: 'a1', text: 'Add endpoints for Bridgefire Exchange Actions. How: Define GET for retrieving actions and POST for creating new actions. Ensure proper request validation and response formatting for both. AC: 1. GET /api/ledger returns a list of actions. 2. POST /api/ledger creates a new action and returns it. Complexity: Medium', completed: false, subActions: [
        { id: 'sa1', text: 'Define GET endpoint for all actions. How: Implement logic to fetch all ledger actions from a data service. Include query parameters for filtering (e.g., by status, date). Serialize data to JSON. AC: 1. Endpoint returns 200 OK with an array of actions on success. 2. Filtering parameters work as expected. Complexity: Medium', completed: false, subActions: [
            {id: 'ssa1-1', text: 'Implement request validation for GET. How: Use a library like Zod or manual checks for query parameters (e.g., page, limit, status). Ensure type safety and handle invalid inputs gracefully. AC: 1. Valid query parameters are processed correctly. 2. Invalid parameters result in a 400 Bad Request error with a descriptive message. Complexity: Low', completed: false, subActions: []},
            {id: 'ssa1-2', text: 'Fetch data from service layer for GET. How: Call `ledgerService.getAllActions(filters)` passing validated filter parameters. Handle potential errors from the service layer. AC: 1. `ledgerService.getAllActions` is called with correct filters. 2. Data returned by the service is correctly serialized as JSON. Complexity: Low', completed: false, subActions: []},
        ]},
        { id: 'sa2', text: 'Define POST endpoint to create a new action. How: Parse the request body for action details. Validate the payload against a defined schema. Call a service method to persist the new action. Return the created action with a 201 status. AC: 1. Valid payload creates a new action in the data store. 2. Endpoint returns 201 Created with the new action data. Complexity: Medium', completed: false, subActions: [
            {id: 'ssa2-1', text: 'Implement request body parsing for POST. How: Use `NextRequest.json()` or equivalent to parse the incoming JSON payload. Handle potential parsing errors. AC: 1. JSON body is successfully parsed into an object. 2. Errors during parsing return a 400 Bad Request. Complexity: Low', completed: false, subActions: []},
            {id: 'ssa2-2', text: 'Call service to persist action. How: Invoke `ledgerService.createAction(actionData)` ensuring `actionData` is validated against a schema (e.g., using Zod) before calling. The service method should handle database insertion and return the persisted action. AC: 1. `ledgerService.createAction` is called with valid data. 2. Action is successfully saved to the data store. Complexity: Medium', completed: false, subActions: []},
        ]},
      ]},
      { id: 'a2', text: 'Include cross-repo propagation logic. How: Identify target repositories based on action type or metadata. Implement an API client to interact with the target repository (e.g., GitHub API to create an issue or file). Securely manage credentials for target repos. AC: 1. Propagation is triggered for relevant actions. 2. A corresponding item (e.g., issue) is successfully created in a mock target repository. Complexity: High', completed: false, subActions: [
        {id: 'sa2-1', text: 'Identify target repositories for propagation. How: This could be based on rules in a configuration file, action metadata (e.g., tags), or dynamic lookup. The logic should resolve to a list of target repository URLs or identifiers. AC: 1. For a given action, the correct list of target repositories is identified. Complexity: Medium', completed: false, subActions: []},
        {id: 'sa2-2', text: 'Implement API call for propagation. How: Use a library like `octokit` for GitHub or a generic `fetch` for other APIs. Construct the payload for the target system (e.g., new issue content). Handle API responses and errors. AC: 1. Successful API call is made to a mock endpoint representing the target repository. 2. Request payload is correctly formatted. Complexity: High', completed: false, subActions: []},
      ] },
       { id: 'a2-b', text: 'Implement import and ceremony actions. How: For \'import\', develop a parser for the external data format (e.g., CSV, JSON from another system) and a mapper to our internal action model. For \'ceremony\', define a state machine or workflow (e.g., using a simple switch statement or a more formal library) to manage the ceremony steps and participant notifications. AC: 1. Import function successfully processes a sample external file and creates corresponding actions. 2. Ceremony mock successfully transitions through all defined states based on inputs. Complexity: High', completed: false, subActions: [] },
    ]
  },
  {
    id: 'pf2',
    path: 'SCENARIOS.md',
    status: 'planned',
    actions: [
      { id: 'a3', text: 'Draft possible scenarios for the Bridgefire Exchange actions. How: Write detailed user stories in the format "As a [type of user], I want [an action] so that [a benefit/value]". Cover at least 3 key use cases like sharing, importing, and ceremony initiation. AC: 1. At least 3 distinct user stories are created. 2. Each story is clear, concise, and describes a valuable user interaction. Complexity: Medium', completed: false, subActions: [
        { id: 'sa3', text: 'Detail user story: Sharing artefacts with MiaNar. How: Define what an "artefact" constitutes (e.g., specific data structures, file types). Design the sharing mechanism (e.g., an API endpoint for MiaNar to pull, or a push mechanism from this system). Write the user story following the standard format. AC: 1. \'Artefact\' type (structure and content) is documented. 2. Chosen sharing mechanism and its basic data flow are described. 3. User story for sharing is written and clear. Complexity: Medium', completed: false, subActions: [
            { id: 'ssa3-1', text: 'Define "artefact" type for MiaNar. How: Specify structure (e.g., JSON schema fields: id, title, content, author, project_source, metadata_tags) and allowed content types (e.g., text, markdown, image URL, code snippet). AC: 1. Artefact JSON schema is drafted and documented. 2. Allowed content types and their constraints are listed. Complexity: Low', completed: false, subActions: [] },
            { id: 'ssa3-2', text: 'Describe sharing mechanism (e.g., API, Git submodule). How: Evaluate pros/cons of an API endpoint (REST/GraphQL) vs. Git submodule for sharing artefacts. Document the chosen approach and its key interactions (e.g., authentication, data format). AC: 1. Evaluation of at least two sharing options is documented. 2. Chosen mechanism and its basic operational flow (e.g., request/response for API) are described. Complexity: Medium', completed: false, subActions: [] }
        ]},
        { id: 'sa4', text: 'Detail user story: Importing patterns from MiaNar. How: Describe the import process (e.g., triggered by a webhook from MiaNar, a scheduled job, or a manual user action). Specify data transformation steps if MiaNar patterns differ from the internal format. Write the user story. AC: 1. Import process steps (trigger, fetch, transform, store) are outlined. 2. User story for importing patterns is clear and actionable. Complexity: Medium', completed: false, subActions: []},
        { id: 'sa5', text: 'Detail user story: Proposing Bridgefire Ceremony. How: Outline the steps involved in proposing (e.g., selecting participants, setting agenda) and conducting the ceremony (e.g., phases, expected outcomes). Identify key participants and their roles. Write the user story. AC: 1. Ceremony proposal and execution steps, along with participant roles, are listed. 2. User story for initiating and managing the ceremony is complete. Complexity: Medium', completed: false, subActions: []},
      ]},
    ]
  },
  {
    id: 'pf3',
    path: 'CAPABILITIES.md',
    status: 'planned',
    actions: [
        { id: 'a4', text: 'Update CAPABILITIES.md with new features. How: Add new sections for "Bridgefire Exchange Actions API", "Cross-Repository Data Propagation", and "Pattern Import & Ceremony Management". Briefly describe the purpose and core functionality of each. AC: 1. CAPABILITIES.md contains new H2 or H3 sections for all listed features. 2. Descriptions are concise (1-2 sentences each) and accurately reflect the capabilities. Complexity: Low', completed: false, subActions: [
            { id: 'sa6', text: 'Document Bridgefire Exchange Actions endpoint. How: Describe the API contract including base URL, specific endpoints (e.g., GET /actions, POST /actions), HTTP methods, expected request payloads (for POST), and example response structures for each. Mention authentication if applicable. AC: 1. API contract details (URL, methods, payload, response) are fully documented for key endpoints. 2. A simple example request/response pair is provided. Complexity: Low', completed: false, subActions: []},
            { id: 'sa7', text: 'Document cross-repo propagation capability. How: Explain the mechanism (e.g., event-driven, manual trigger via API). Detail how target repositories are configured/discovered. Mention any security considerations or required permissions. AC: 1. Propagation mechanism, configuration, and triggers are clearly explained. 2. Potential limitations or security notes are included. Complexity: Medium', completed: false, subActions: []},
            { id: 'sa8', text: 'Document import/ceremony features. How: For "Pattern Import", describe what types of patterns can be imported, the source systems (e.g., MiaNar), and how users initiate or manage the import process. For "Ceremony Management", explain its purpose, typical workflow steps, and expected outcomes/artefacts. AC: 1. Purpose, initiation, and core usage for both import and ceremony features are clearly documented for a user. Complexity: Medium', completed: false, subActions: []},
        ]}
    ]
  }
];


// Internal mock interfaces for structures whose types are not directly exported by @google/genai
// or to ensure structural compatibility for mocking.
interface InternalMockPromptFeedback {
  blockReason?: string;
  blockReasonMessage?: string;
  safetyRatings: SafetyRating[];
}

interface InternalMockCandidate {
  index: number;
  content: Content;
  finishReason: FinishReason | null;
  finishMessage?: string;
  safetyRatings: SafetyRating[];
  citationMetadata?: { citationSources: Array<{ startIndex?: number; endIndex?: number; uri: string; license?: string; }> };
  groundingMetadata?: GroundingMetadata;
}

const createMockSafetyRating = (rating?: Partial<SafetyRating>): SafetyRating => ({
  category: rating?.category || HarmCategory.HARM_CATEGORY_UNSPECIFIED,
  probability: rating?.probability || HarmProbability.NEGLIGIBLE,
  probabilityScore: rating?.probabilityScore || 0.0,
  severity: rating?.severity || HarmSeverity.HARM_SEVERITY_UNSPECIFIED,
  severityScore: rating?.severityScore || 0.0,
});

const createMockPromptFeedbackStructure = (feedback?: Partial<InternalMockPromptFeedback>): InternalMockPromptFeedback => ({
  blockReason: feedback?.blockReason || undefined,
  blockReasonMessage: feedback?.blockReasonMessage || undefined,
  safetyRatings: feedback?.safetyRatings || [createMockSafetyRating()],
});

const createMockCandidateStructure = (text: string, groundingChunksData?: GroundingChunk[]): InternalMockCandidate => ({
  index: 0,
  content: {
    parts: [{ text }],
    role: "model"
  },
  finishReason: FinishReason.STOP,
  finishMessage: undefined,
  safetyRatings: [createMockSafetyRating()],
  citationMetadata: undefined,
  groundingMetadata: groundingChunksData ? { groundingChunks: groundingChunksData, webSearchQueries: [], retrievalQueries: [] } : undefined,
});

export const mockGenerateContentResponse = (text: string, groundingChunks?: GroundingChunk[]): GenerateContentResponse => {
  const candidatesMock: InternalMockCandidate[] = [createMockCandidateStructure(text, groundingChunks)];
  const promptFeedbackMock: InternalMockPromptFeedback = createMockPromptFeedbackStructure();
  
  return {
    text: text,
    data: text, 
    functionCalls: undefined,
    candidates: candidatesMock as any,
    promptFeedback: promptFeedbackMock as any,
    usageMetadata: { 
        promptTokenCount: 10, 
        candidatesTokenCount: Math.ceil(text.length / 4), 
        totalTokenCount: 10 + Math.ceil(text.length / 4) 
    },
    executableCode: undefined,
    codeExecutionResult: undefined,
  };
};
