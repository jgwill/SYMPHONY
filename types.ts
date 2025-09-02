

export interface Repository {
  id: string;
  name: string;
  description?: string;
  owner: string;
  lastUpdated?: string;
}

export interface Issue {
  id: string;
  title: string;
  repoName: string;
  number: number;
  assignee?: string;
  body?: string;
}

export interface RecentSession { 
  id:string;
  title: string;
  repoName: string;
  issueNumber?: number;
  lastUpdated: string;
  bookmarked?: boolean;
  completed?: boolean;
}

export interface PlanAction {
  id: string;
  text: string;
  completed: boolean;
  subActions: PlanAction[];
}

export interface PlanFile {
  id: string;
  path: string;
  actions: PlanAction[];
  status: 'planned' | 'implementing' | 'implemented' | 'revised';
  content?: string; 
  diff?: string; 
  newContent?: string; 
}

// Simplified Plan for now, could be part of SpecLang or a more structured object
export interface DevelopmentPlan {
  id: string;
  title: string;
  sourceSpecLangId?: string; // Link back to the SpecLang doc it was derived from
  files: PlanFile[];
  // Overall status, notes, etc.
}


export interface ChatMessage {
  id:string;
  sender: 'user' | 'ai';
  text: string;
  relevantFiles?: string[];
  suggestedQuestions?: string[];
  groundingChunks?: GroundingChunk[];
}

export enum AppStep {
  COMMIT,
  AGENT_WORKSPACE, // Default view for agents
  VISUALS_TOOL, // Dedicated step for image/diagram generation tool
}

export interface ConceptualizationState { // May be simplified or absorbed
  text: string; // User's initial NL input
  initialQueryElements?: string; 
  specLangDocument?: string | null; 
}

export interface FileChange {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  retrievedContext?: {
    uri:string;
    title: string;
  };
}

export interface PlanningIdea { // Kept for potential Q&A context gathering
  id: string;
  text: string;
}

export interface AgentUIMetadata {
  panelComponentPath?: string; 
  iconGlyph?: string; 
  settingsComponentPath?: string; 
}

export interface AgentDefinition {
  id: string; 
  name: string; 
  glyph?: string; 
  description: string; 
  capabilities: string[]; 
  defaultPrompt?: string; 
  ui?: AgentUIMetadata; 
  mainViewComponent: React.ComponentType<any> | string; // Now mandatory, WorkspaceAgent will have one
}

export interface LedgerEntry {
  id: string;
  timestamp: number;
  type: 'manual_ritual' | 'session_snapshot' | 'automated_event'; // Extend as needed
  title: string;
  description: string;
  relatedArtifacts?: Array<{ type: string, id: string, path?: string }>; // e.g., { type: 'specLang', id: 'spec123' }
}

export interface AgentSpecificState {
  lastResponse?: any;
  internalState?: Record<string, any> & { ledgerEntries?: LedgerEntry[] }; // Made more flexible for Seraphine
}

export interface SharedAgentContext {
  initialConceptualizationText?: string | null; // Raw NL input from user
  initialAnalysisMarkdown?: string | null; // Structured analysis from Workspace Agent
  specLangDocument?: string | null; // The primary SpecLang artifact
  currentPlan?: DevelopmentPlan | null; // Plan derived from SpecLang
  // other shared items can be added here
  activeFileForImplementation?: PlanFile | null; // File being actively worked on
  chatMessages?: ChatMessage[]; // Global or workspace-level chat
  planningIdeas?: PlanningIdea[]; // Still useful for capturing ad-hoc ideas
  promptForVisualsAgent?: string | null; // Added for passing prompts to VisualsAgent
}

export interface AgentMemory {
  agents: { 
    [agentId: string]: AgentSpecificState;
  };
  sharedContext: SharedAgentContext; 
}


export interface SavedSessionData {
  id: string; 
  title: string; 
  timestamp: number; 
  
  selectedRepoId: string | null; // Can be null if session starts without repo
  // conceptualization: ConceptualizationState; // Replaced by agentMemory.sharedContext
  // chatMessages: ChatMessage[]; // Moved to agentMemory.sharedContext
  // plan: PlanFile[]; // Replaced by agentMemory.sharedContext.currentPlan
  // planningIdeas: PlanningIdea[]; // Moved to agentMemory.sharedContext
  currentSessionDisplayTitle: string; 
  appStepAtSave?: AppStep; // Which "modal" like step if any, or implies agent view

  activeAgentId: string | null; 
  agentMemory: AgentMemory; 
  sessionAgentRegistry?: AgentDefinition[]; 
}

export interface AppContextType {
  currentStep: AppStep; // Still useful for modal-like views (Commit, VisualsTool)
  setCurrentStep: (step: AppStep) => void;
  selectedRepo: Repository | null;
  setSelectedRepo: (repo: Repository | null) => void;
  
  // conceptualization: ConceptualizationState; // Replaced by agentMemory
  // setConceptualization: React.Dispatch<React.SetStateAction<ConceptualizationState>>;
  // chatMessages: ChatMessage[]; // Replaced by agentMemory
  // setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  // plan: PlanFile[]; // Replaced by agentMemory
  // setPlan: React.Dispatch<React.SetStateAction<PlanFile[]>>;
  // planningIdeas: PlanningIdea[]; // Replaced by agentMemory
  // setPlanningIdeas: React.Dispatch<React.SetStateAction<PlanningIdea[]>>;

  currentSessionTitle: string;
  setCurrentSessionTitle: (title: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // selectedFileForView: PlanFile | null; // Replaced by agentMemory.sharedContext.activeFileForImplementation
  // setSelectedFileForView: (file: PlanFile | null) => void;
  
  appError: string | null;
  setAppError: (error: string | null) => void;
  resetToStartSession: () => void; // Will reset to WorkspaceAgent view
  
  isFileTreeOpen: boolean;
  setIsFileTreeOpen: (isOpen: boolean) => void;
  handleSelectFileFromTree: (filePath: string) => void; // Might open in a generic file viewer or an agent's context

  savedSessions: SavedSessionData[];
  setSavedSessions: React.Dispatch<React.SetStateAction<SavedSessionData[]>>;
  currentLoadedSessionId: string | null;
  setCurrentLoadedSessionId: React.Dispatch<React.SetStateAction<string | null>>;
  saveCurrentSession: (userGivenTitle?: string) => string | null; 
  loadSavedSession: (sessionId: string) => boolean; 
  deleteSavedSession: (sessionId: string) => void;

  agentRegistry: AgentDefinition[]; 
  activeAgentId: string | null; 
  setActiveAgentId: (agentId: string | null) => void; 
  agentMemory: AgentMemory;
  setAgentMemory: React.Dispatch<React.SetStateAction<AgentMemory>>;
  isAgentPanelOpen: boolean;
  setIsAgentPanelOpen: (isOpen: boolean) => void;

  // New function to update only shared context within agentMemory
  updateSharedContext: (updates: Partial<SharedAgentContext>) => void;
  
  // New function to handle actions within an agent context, potentially returning a promise
  dispatchAgentAction: (agentId: string, actionType: string, payload?: any) => Promise<any>;
}

export interface StructuredComponentIdea {
  name: string;
  description: string;
  keyFeatures: string[];
  technologies: string[];
  acceptanceCriteria: string[];
}

export interface ConceptualUIElement {
  id: string;
  type: 'Screen' | 'Container' | 'Text' | 'Button' | 'Input' | 'ImagePlaceholder' | 'CustomComponent' | 'Unknown';
  name?: string;
  properties?: Record<string, any>;
  children?: ConceptualUIElement[];
  specLangSourceId?: string;
}

export interface IGeminiService {
  conceptualize: (prompt: string) => Promise<string>; // For initial AI analysis of NL
  askQuestion: (question: string, contextMessages?: ChatMessage[]) => Promise<ChatMessage>; // For general Q&A
  nlToSpec: (naturalLanguageInput: string) => Promise<string>; // Generates SpecLang from NL
  generatePlanFromSpec: (specLangDocument: string, chatHistory?: ChatMessage[], planningIdeasText?: string) => Promise<DevelopmentPlan>; // Generates a plan from SpecLang
  implementFile: (filePath: string, actions: string[], currentContent?: string, specLangContext?: string) => Promise<{ newContent: string, diff: string }>; // Takes SpecLang section for context
  generateImage: (prompt: string) => Promise<{ base64Bytes: string, mimeType: string }>;
  generateDiagramSyntax: (description: string) => Promise<string>; // Mermaid syntax
  generateUIComponentIdeas: (specLangSection: string) => Promise<StructuredComponentIdea[]>;
  mapSpecToConceptualUI: (specLangDocument: string) => Promise<ConceptualUIElement[]>; 
  validateSyntaxAndLogic: (text: string) => Promise<string>; // For Nyro
  suggestRefinements: (text: string) => Promise<string>; // For Nyro
  
  // SpecLang Reverse-Engineering Framework
  analyzeCodebaseForSpec: (contextSummary: string) => Promise<string>;
  refineSpecWithBdd: (specLang: string) => Promise<string>;
  exportSpec: (specLang: string) => Promise<{ llm: string; agent: string; human: string }>;

  getCapabilities: () => string[];
}

export interface GithubTreeFile {
    path: string;
    mode: string;
    type: 'tree' | 'blob';
    sha: string;
    size?: number;
    url: string;
}