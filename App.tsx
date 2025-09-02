
import React, { useState, useCallback, useEffect } from 'react';
import { 
    AppStep, Repository, ConceptualizationState, PlanFile, ChatMessage, 
    PlanningIdea, AppContextType, SavedSessionData, AgentMemory, AgentDefinition, 
    SharedAgentContext, DevelopmentPlan 
} from './types';
import { CommitPage } from './pages'; 
import { Header, ErrorDisplay, FileTreePanel, ResizablePanelsLayout, AgentSelectionPanel } from './components';
import { getAgentById, MOCK_AGENT_REGISTRY } from './services/agentRegistry';
import { cn } from './lib/utils';
import { MOCK_REPOSITORIES } from './constants'; 

// Default active agent is WorkspaceAgent
const DEFAULT_AGENT_ID = 'workspace.default.v1';

export const AppContext = React.createContext<AppContextType | null>(null);

const DEFAULT_MAIN_PANEL_WIDTH = 256; 
const MOBILE_FILE_PANEL_WIDTH = 240; 
const LOCAL_STORAGE_SESSIONS_KEY = 'aicodops_sessions_v2'; 

const initialAgentMemory: AgentMemory = {
  agents: {},
  sharedContext: {
    initialConceptualizationText: null,
    specLangDocument: null,
    currentPlan: null,
    activeFileForImplementation: null,
    chatMessages: [],
    planningIdeas: [],
    promptForVisualsAgent: null, // Added initialization
  },
};

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.AGENT_WORKSPACE); 
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [currentSessionTitle, setCurrentSessionTitle] = useState<string>('New Session');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [appError, setAppError] = useState<string | null>(null);
  const [isFileTreeOpen, setIsFileTreeOpen] = useState<boolean>(false); 

  const [savedSessions, setSavedSessions] = useState<SavedSessionData[]>([]);
  const [currentLoadedSessionId, setCurrentLoadedSessionId] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  const [agentRegistry] = useState<AgentDefinition[]>(MOCK_AGENT_REGISTRY);
  const [activeAgentId, setActiveAgentIdInternal] = useState<string | null>(DEFAULT_AGENT_ID); 
  const [agentMemory, setAgentMemory] = useState<AgentMemory>(initialAgentMemory);
  const [isAgentPanelOpen, setIsAgentPanelOpen] = useState<boolean>(!isMobileView);

  const updateSharedContext = useCallback((updates: Partial<SharedAgentContext>) => {
    setAgentMemory(prev => ({
      ...prev,
      sharedContext: {
        ...prev.sharedContext,
        ...updates,
      },
    }));
  }, []);

  const setActiveAgentId = useCallback((agentId: string | null) => {
    setActiveAgentIdInternal(agentId);
    // If returning to workspace (null) or switching to an agent not specifically for file implementation,
    // and a file was active (likely from Aetherial), clear it to avoid confusion.
    if (agentId === null || (agentId && agentId !== 'aetherial.gemini.v1' && agentId !== 'some.other.file.agent.v1')) {
        if(agentMemory.sharedContext.activeFileForImplementation){
            updateSharedContext({ activeFileForImplementation: null });
        }
    }
    // Clear promptForVisualsAgent if not switching TO VisualsAgent
    if (agentId !== 'visuals.tool.v1' && agentMemory.sharedContext.promptForVisualsAgent) {
        updateSharedContext({ promptForVisualsAgent: null });
    }

    if (agentId !== null && currentStep !== AppStep.AGENT_WORKSPACE && currentStep !== AppStep.COMMIT && currentStep !== AppStep.VISUALS_TOOL) {
        // If an agent is selected, ensure we are in the agent workspace view
        // unless it's a modal-like step like Commit or Visuals.
        setCurrentStep(AppStep.AGENT_WORKSPACE);
    }
  }, [currentStep, agentMemory.sharedContext.activeFileForImplementation, agentMemory.sharedContext.promptForVisualsAgent, updateSharedContext]);


  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileView(mobile);
      if (!mobile && !isAgentPanelOpen) setIsAgentPanelOpen(true); 
      if (mobile && isAgentPanelOpen) setIsAgentPanelOpen(false); 
    };
    window.addEventListener('resize', handleResize);
    handleResize(); 
    return () => window.removeEventListener('resize', handleResize);
  }, [isAgentPanelOpen]);


  const resetToStartSession = useCallback(() => {
    setSelectedRepo(null);
    setAgentMemory(prev => ({ // Preserve agent-specific states if desired, but reset shared context
        ...prev,
        sharedContext: { ...initialAgentMemory.sharedContext }
    }));
    setCurrentSessionTitle('New Session');
    setAppError(null);
    setIsFileTreeOpen(false);
    setCurrentLoadedSessionId(null);
    setActiveAgentIdInternal(DEFAULT_AGENT_ID); // Use internal setter
    setCurrentStep(AppStep.AGENT_WORKSPACE);
    setIsAgentPanelOpen(!isMobileView);
    if (window.location.hash) {
        window.history.pushState("", document.title, window.location.pathname + window.location.search);
    }
  }, [isMobileView]);

  const handleSelectRepository = useCallback((repo: Repository) => {
    setSelectedRepo(repo);
    setCurrentSessionTitle(`Session for ${repo.owner}/${repo.name}`);
    setAgentMemory(prev => ({ // Preserve agent-specific states, reset shared
      ...prev,
      sharedContext: {
        ...initialAgentMemory.sharedContext,
      }
    }));
    setAppError(null);
    setIsFileTreeOpen(!isMobileView); 
    setCurrentLoadedSessionId(null); 
    setActiveAgentIdInternal(DEFAULT_AGENT_ID); // Use internal setter
    setCurrentStep(AppStep.AGENT_WORKSPACE);
    if (window.location.hash) window.history.pushState("", document.title, window.location.pathname + window.location.search); 
  }, [isMobileView]);
  
  useEffect(() => {
    const storedSessions = localStorage.getItem(LOCAL_STORAGE_SESSIONS_KEY);
    if (storedSessions) {
      try {
        const parsedSessions = JSON.parse(storedSessions) as Partial<SavedSessionData>[]; 
        
        const validatedSessions = parsedSessions.map(s => {
          const loadedAgentMemory = s.agentMemory || initialAgentMemory;
          return {
            id: s.id || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: s.title || "Untitled Session",
            timestamp: s.timestamp || Date.now(),
            selectedRepoId: s.selectedRepoId || null, 
            currentSessionDisplayTitle: s.currentSessionDisplayTitle || s.title || "Loaded Session",
            appStepAtSave: s.appStepAtSave ?? AppStep.AGENT_WORKSPACE,
            agentMemory: { 
                ...initialAgentMemory, // Start with default structure
                ...(loadedAgentMemory || {}), // Spread loaded memory
                sharedContext: {
                    ...initialAgentMemory.sharedContext, // Ensure all shared fields are present
                    ...(loadedAgentMemory.sharedContext || {}), 
                }
            },
            activeAgentId: s.activeAgentId || DEFAULT_AGENT_ID,
            sessionAgentRegistry: s.sessionAgentRegistry || MOCK_AGENT_REGISTRY, 
          } as SavedSessionData;
        }).filter(s => !!s.id); 

        setSavedSessions(validatedSessions);

      } catch (e) {
        console.error("Failed to parse or validate saved sessions from localStorage:", e);
        localStorage.removeItem(LOCAL_STORAGE_SESSIONS_KEY); 
      }
    }
  }, []);

  useEffect(() => {
    if (savedSessions.length > 0 || localStorage.getItem(LOCAL_STORAGE_SESSIONS_KEY)) { 
      localStorage.setItem(LOCAL_STORAGE_SESSIONS_KEY, JSON.stringify(savedSessions));
    }
  }, [savedSessions]);


  const saveCurrentSession = useCallback((userGivenTitle?: string): string | null => {
    let sessionTitleToSave = userGivenTitle?.trim() || '';
    if (!sessionTitleToSave) {
      sessionTitleToSave = prompt("Enter a title for this session:", currentSessionTitle) || '';
    }

    if (!sessionTitleToSave.trim()) { 
      return null; 
    }
    
    const newSessionId = `session_${Date.now()}`;
    const newSessionData: SavedSessionData = {
      id: newSessionId,
      title: sessionTitleToSave.trim(),
      timestamp: Date.now(),
      selectedRepoId: selectedRepo?.id || null,
      currentSessionDisplayTitle: currentSessionTitle,
      appStepAtSave: currentStep, 
      activeAgentId: activeAgentId, 
      agentMemory: agentMemory,
      sessionAgentRegistry: agentRegistry 
    };

    setSavedSessions(prev => {
      const existingIndex = prev.findIndex(s => s.id === currentLoadedSessionId);
      if (existingIndex !== -1) { 
        const updatedSessions = [...prev];
        updatedSessions[existingIndex] = {...newSessionData, id: currentLoadedSessionId! }; 
        return updatedSessions;
      }
      return [...prev, newSessionData];
    });
    
    const finalSessionId = currentLoadedSessionId && (savedSessions.find(s => s.id === currentLoadedSessionId)) ? currentLoadedSessionId : newSessionId;

    setCurrentLoadedSessionId(finalSessionId);
    window.location.hash = `sessionId=${finalSessionId}`;
    setAppError(null); 
    alert(`Session "${sessionTitleToSave.trim()}" saved!`);
    return finalSessionId;
  }, [selectedRepo, currentSessionTitle, currentStep, currentLoadedSessionId, savedSessions, activeAgentId, agentMemory, agentRegistry]);


  const loadSavedSession = useCallback((sessionId: string): boolean => {
    const sessionToLoad = savedSessions.find(s => s.id === sessionId);
    if (!sessionToLoad) {
      setAppError(`Session with ID ${sessionId} not found.`);
      return false;
    }

    const repoToLoad = sessionToLoad.selectedRepoId ? MOCK_REPOSITORIES.find(r => r.id === sessionToLoad.selectedRepoId) : null;
    
    setIsLoading(true);
    setTimeout(() => {
      try {
        setSelectedRepo(repoToLoad);
        setAgentMemory({ 
            ...initialAgentMemory, 
            ...sessionToLoad.agentMemory,
            sharedContext: { // Deep merge shared context ensuring all initial fields are present
                ...initialAgentMemory.sharedContext,
                ...(sessionToLoad.agentMemory.sharedContext || {}),
            }
        });
        setCurrentSessionTitle(sessionToLoad.currentSessionDisplayTitle);
        setCurrentStep(sessionToLoad.appStepAtSave || AppStep.AGENT_WORKSPACE); 
        setActiveAgentIdInternal(sessionToLoad.activeAgentId || DEFAULT_AGENT_ID); 
        setCurrentLoadedSessionId(sessionId);
        setIsFileTreeOpen(!isMobileView && !!repoToLoad); 
        setIsAgentPanelOpen(!isMobileView);
        window.location.hash = `sessionId=${sessionId}`;
        setAppError(null);
      } catch (e) {
        console.error("Error applying loaded session state:", e);
        setAppError("Failed to load session state. Please reset.");
      } finally {
        setIsLoading(false);
      }
    }, 100);
    return true;
  }, [savedSessions, isMobileView]);

  const deleteSavedSession = useCallback((sessionId: string) => {
    setSavedSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentLoadedSessionId === sessionId) {
      resetToStartSession(); 
    }
    alert("Session deleted.");
  }, [currentLoadedSessionId, resetToStartSession]);
  
  const dispatchAgentAction = useCallback(async (agentIdToAction: string, actionType: string, payload?: any): Promise<any> => {
    console.log(`Dispatching action to ${agentIdToAction}: ${actionType}`, payload);
    
    // Mock implementation:
    if (agentIdToAction === 'mia.architect.v1' && actionType === 'generateSpecFromConceptualization') {
      if (!agentMemory.sharedContext.initialConceptualizationText) {
        setAppError("Mia cannot generate SpecLang: Initial conceptualization text is missing.");
        return Promise.reject("Missing conceptualization text");
      }
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        const mockSpecDoc = `## Mock SpecLang from Mia for:\n${agentMemory.sharedContext.initialConceptualizationText.substring(0,50)}...`;
        updateSharedContext({ specLangDocument: mockSpecDoc });
        setIsLoading(false);
        return Promise.resolve(mockSpecDoc);
      } catch (err) {
        setAppError((err as Error).message);
        setIsLoading(false);
        return Promise.reject(err);
      }
    }
    
    setAppError(`Action ${actionType} for agent ${agentIdToAction} not yet implemented.`);
    return Promise.reject(`Action ${actionType} not implemented for ${agentIdToAction}`);
  }, [agentMemory.sharedContext.initialConceptualizationText, updateSharedContext]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const sessionIdFromUrl = params.get('sessionId');

    if (sessionIdFromUrl && savedSessions.length > 0) { 
        // Prevent re-loading if this session is already loaded.
        if (currentLoadedSessionId === sessionIdFromUrl) {
            return; 
        }
        const sessionExistsInSaved = savedSessions.find(s => s.id === sessionIdFromUrl);
        if (sessionExistsInSaved) {
            loadSavedSession(sessionIdFromUrl);
        } else {
          setAppError(`Session with ID ${sessionIdFromUrl} not found in saved sessions.`);
           window.history.pushState("", document.title, window.location.pathname + window.location.search);
        }
    }
  // Added loadSavedSession and currentLoadedSessionId to dependency array for correctness
  }, [savedSessions, loadSavedSession, currentLoadedSessionId]); 


  const handleSelectFileFromTree = useCallback((filePath: string) => {
    setAppError(null);
    const existingFileInPlan = agentMemory.sharedContext.currentPlan?.files.find(f => f.path === filePath);

    const fileToView: PlanFile = existingFileInPlan || {
        id: `tree_view_${Date.now()}`,
        path: filePath,
        status: 'planned', 
        actions: [{ id: 'view_action_1', text: `Review content of ${filePath}. How: Open and read. AC: Content understood. Complexity: Low`, completed: false, subActions: [] }],
        content: `// Content for ${filePath} would be fetched or displayed here.`,
        newContent: `// Content for ${filePath} would be fetched or displayed here.`,
    };
    
    // Update shared context with the file
    updateSharedContext({ activeFileForImplementation: fileToView });
    
    // Always switch to Aetherial agent for implementation tasks from the file tree
    setActiveAgentId('aetherial.gemini.v1');
    setCurrentStep(AppStep.AGENT_WORKSPACE); // Ensure we are in the main agent workspace

    if (isMobileView) { 
      setIsFileTreeOpen(false);
    }
  }, [agentMemory.sharedContext.currentPlan, isMobileView, updateSharedContext, setActiveAgentId]);


  const appContextValue: AppContextType = {
    currentStep, setCurrentStep,
    selectedRepo, setSelectedRepo: handleSelectRepository,
    currentSessionTitle, setCurrentSessionTitle,
    isLoading, setIsLoading,
    appError, setAppError,
    resetToStartSession,
    isFileTreeOpen, setIsFileTreeOpen,
    handleSelectFileFromTree,
    savedSessions, setSavedSessions,
    currentLoadedSessionId, setCurrentLoadedSessionId,
    saveCurrentSession,
    loadSavedSession,
    deleteSavedSession,
    agentRegistry,
    activeAgentId, setActiveAgentId, // Use the new wrapper setActiveAgentId
    agentMemory, setAgentMemory,
    isAgentPanelOpen, setIsAgentPanelOpen,
    updateSharedContext,
    dispatchAgentAction,
  };

  const renderMainContent = () => {
    const currentAgentDef = getAgentById(activeAgentId);
    
    // Prioritize active agent's main view for AGENT_WORKSPACE step
    if (currentStep === AppStep.AGENT_WORKSPACE && currentAgentDef?.mainViewComponent) {
      const AgentViewComponent = currentAgentDef.mainViewComponent;
      if (typeof AgentViewComponent === 'function') { 
        return <AgentViewComponent />;
      } else {
         console.error("Agent mainViewComponent is a string, dynamic import not set up in this version.");
         return <div>Error: Agent view component not loaded.</div>;
      }
    }
    
    // Fallback to other step-based views
    switch (currentStep) {
      case AppStep.COMMIT:
        return <CommitPage />;
      case AppStep.VISUALS_TOOL:
        const VisualsAgentDef = getAgentById('visuals.tool.v1');
        const VisualsComponent = VisualsAgentDef?.mainViewComponent as React.ComponentType<any> | undefined;
        return VisualsComponent ? <VisualsComponent /> : <div>Visuals Tool Not Found</div>;
      
      case AppStep.AGENT_WORKSPACE: 
      default:
        // This fallback ensures WorkspaceAgentView is shown if no specific agent view is active for AGENT_WORKSPACE
        const WorkspaceAgentDef = getAgentById(DEFAULT_AGENT_ID);
        const WorkspaceComponent = WorkspaceAgentDef?.mainViewComponent as React.ComponentType<any> | undefined;
        // If activeAgentId is something else but doesn't have a view, we might be in an inconsistent state.
        // For safety, ensure WorkspaceAgent is active if we reach here.
        if (WorkspaceComponent && activeAgentId !== DEFAULT_AGENT_ID && !currentAgentDef?.mainViewComponent) {
             setActiveAgentIdInternal(DEFAULT_AGENT_ID); // Use internal setter to avoid clearing activeFile
        }
        return WorkspaceComponent ? <WorkspaceComponent /> : <div>Workspace Agent Not Found. Critical Error.</div>;
    }
  };
  
  const showFileTreePanel = isFileTreeOpen && !!selectedRepo;

  return (
    <AppContext.Provider value={appContextValue}>
      <div className="flex flex-col h-screen bg-slate-900 text-slate-100 overflow-hidden">
        <Header />
        <div className="flex flex-grow overflow-hidden">
          {isAgentPanelOpen && <AgentSelectionPanel />}
          <div className="flex-grow flex flex-col overflow-hidden"> 
            <ErrorDisplay error={appError} onDismiss={() => setAppError(null)} />
            {isLoading && currentStep === AppStep.AGENT_WORKSPACE && !getAgentById(activeAgentId)?.mainViewComponent && (
                 <div className="flex flex-col items-center justify-center h-full p-4 sm:p-8">
                    <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 border-cyan-500"></div>
                    <p className="mt-4 text-base sm:text-lg text-slate-300">Loading Agent Workspace...</p>
                </div>
            )}
            {!(isLoading && currentStep === AppStep.AGENT_WORKSPACE && !getAgentById(activeAgentId)?.mainViewComponent) && (
              <ResizablePanelsLayout
                  leftPanelContent={<FileTreePanel />}
                  rightPanelContent={renderMainContent()}
                  showLeftPanel={showFileTreePanel}
                  initialLeftPanelWidth={isMobileView ? MOBILE_FILE_PANEL_WIDTH : DEFAULT_MAIN_PANEL_WIDTH}
                  minLeftPanelWidth={isMobileView ? 180 : 150}
                  maxLeftPanelWidth={isMobileView ? window.innerWidth * 0.8 : 500}
                  className="flex-grow" 
                  leftPanelClassName="bg-slate-800 border-r border-slate-700"
              />
            )}
          </div>
        </div>
      </div>
    </AppContext.Provider>
  );
};
App.displayName = 'App';

export default App;
