
import React, { useContext, useState, useRef, useEffect } from 'react';
import { AppContext } from '../App';
import { AppStep, AppContextType, SavedSessionData } from '../types';
import { Bars3Icon, UserCircleIcon, Cog6ToothIcon, ChevronRightIcon, CodeBracketIcon, PhotoIcon, ListBulletIcon, XMarkIcon, TrashIcon, BookmarkSquareIcon, DocumentIcon as DocIconMenuItem, FolderIcon, SparklesIcon } from './index'; // Added SparklesIcon
import { cn } from '../lib/utils';
import { useModalAccessibility } from '../hooks/useModalAccessibility';

interface MenuItemAction {
  type: 'action';
  label: string;
  action: () => void;
  icon?: React.ReactNode;
  destructive?: boolean;
}

interface MenuItemDivider {
  type: 'divider';
}

interface MenuHeader {
  type: 'header';
  label: string;
}

type UserMenuItem = MenuItemAction | MenuItemDivider | MenuHeader;


const Header: React.FC = () => {
  const context = useContext(AppContext) as AppContextType | null;
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userMenuButtonRef = useRef<HTMLButtonElement>(null);

  useModalAccessibility({
    isOpen: isUserMenuOpen,
    onClose: () => setIsUserMenuOpen(false),
    modalRef: userMenuRef,
    initialFocusRef: userMenuRef, 
  });

  const handleNavigateToImageGeneration = () => {
    if (context) {
      context.setCurrentStep(AppStep.VISUALS_TOOL); // Changed from IMAGE_GENERATION
      context.setAppError(null); 
      setIsUserMenuOpen(false);
    }
  };

  const handleSaveCurrentSession = () => {
    if (context) {
      context.saveCurrentSession();
      setIsUserMenuOpen(false);
    }
  };

  const userMenuItems: UserMenuItem[] = [
    { 
      type: 'action', 
      label: "Save current session", 
      action: handleSaveCurrentSession,
      icon: <BookmarkSquareIcon className="w-4 h-4 mr-2" />
    },
    { type: 'divider' },
    { type: 'header', label: "Your Sessions" },
    ...(context?.savedSessions && context.savedSessions.length > 0 
      ? context.savedSessions.map((session: SavedSessionData) => ({
          type: 'action' as 'action', 
          label: session.title,
          action: () => {
            if (context) {
              context.loadSavedSession(session.id);
              setIsUserMenuOpen(false);
            }
          },
          // Add a nested button for delete to avoid entire row click deleting
          icon: (
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent parent action (load)
                if (window.confirm(`Are you sure you want to delete session "${session.title}"?`)) {
                  context?.deleteSavedSession(session.id);
                }
              }}
              className="ml-auto p-1 text-slate-500 hover:text-red-400 opacity-50 hover:opacity-100 focus:opacity-100"
              aria-label={`Delete session ${session.title}`}
            >
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          )
        }))
      : [{ type: 'action' as 'action', label: "No saved sessions yet", action: () => {}, icon: <span className="text-xs text-slate-500 italic">No sessions</span> }]
    ),
    { type: 'divider' },
    // Removed Application Documentation and Browse Project Files links
    { type: 'action', label: "Token usage (mock)", action: () => {console.log("Navigate to Token Usage"); setIsUserMenuOpen(false);} },
    { type: 'action', label: "Settings (mock)", action: () => {console.log("Navigate to Settings"); setIsUserMenuOpen(false);} },
    { type: 'divider' },
    { type: 'action', label: "Sign out (mock)", action: () => {console.log("Sign Out"); setIsUserMenuOpen(false);} },
  ];


  const showFileTreeToggleButton = context?.selectedRepo;

  return (
    <header className="bg-slate-800/50 backdrop-blur-md border-b border-slate-700 p-2 sm:p-3 flex items-center justify-between text-sm sticky top-0 z-50 h-16 flex-shrink-0">
      <div className="flex items-center space-x-1 sm:space-x-3">
        {context && (
            <button
                type="button"
                title={context.isAgentPanelOpen ? "Hide agent panel" : "Show agent panel"}
                aria-label={context.isAgentPanelOpen ? "Hide agent panel" : "Show agent panel"}
                aria-expanded={context.isAgentPanelOpen}
                onClick={() => context.setIsAgentPanelOpen(!context.isAgentPanelOpen)}
                className="p-1 sm:p-1.5 rounded-full text-slate-400 hover:bg-slate-700 hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
            >
                <SparklesIcon className="w-5 h-5" />
            </button>
        )}
        <button 
          type="button" 
          onClick={() => context?.resetToStartSession()} 
          aria-label="Go to Start Session / Reset"
          className="flex items-center space-x-1 sm:space-x-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 rounded-md p-1"
        >
          <CodeBracketIcon className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400" />
          <div className="flex flex-col">
              <h1 className="font-semibold text-sm sm:text-base text-cyan-400">SYMPHONY</h1>
              <h2 className="text-xs text-slate-400 hidden sm:block">Creative Partnership Platform</h2>
          </div>
        </button>
        {showFileTreeToggleButton && (
          <button
              type="button"
              title={context?.isFileTreeOpen ? "Hide file tree" : "Show file tree"}
              aria-label={context?.isFileTreeOpen ? "Hide file tree" : "Show file tree"}
              aria-expanded={context?.isFileTreeOpen}
              onClick={() => context?.setIsFileTreeOpen(!context.isFileTreeOpen)}
              className="p-1 sm:p-1.5 rounded-full text-slate-400 hover:bg-slate-700 hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
          >
              <ListBulletIcon className="w-5 h-5" />
          </button>
        )}
        {context?.selectedRepo && ( 
          <>
            <ChevronRightIcon className="w-4 h-4 text-slate-500 hidden sm:block" />
            <span className="text-slate-300 truncate max-w-[80px] xs:max-w-[120px] sm:max-w-xs">{context.selectedRepo.owner}/{context.selectedRepo.name}</span>
          </>
        )}
         {context?.currentSessionTitle && context?.selectedRepo && context.currentSessionTitle.toLowerCase().includes(context.selectedRepo.name.toLowerCase()) && (
            <>
                <ChevronRightIcon className="w-4 h-4 text-slate-500" />
                <span className="text-slate-400 font-medium truncate max-w-[80px] xs:max-w-[120px] sm:max-w-xs" title={context.currentSessionTitle}>{context.currentSessionTitle.replace(`Session for ${context.selectedRepo.owner}/${context.selectedRepo.name}`, '').trim() || 'Current Task'}</span>
            </>
        )}
      </div>
      <div className="flex items-center space-x-1 sm:space-x-2">
        <button
          type="button"
          title="Generate Image"
          aria-label="Open image generation tool"
          onClick={handleNavigateToImageGeneration}
          className="p-1 sm:p-1.5 rounded-full text-slate-400 hover:bg-slate-700 hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
        >
          <PhotoIcon className="w-5 h-5" />
        </button>
        <button
          type="button"
          title="Settings (coming soon)"
          aria-label="Open settings"
          className="p-1 sm:p-1.5 rounded-full text-slate-400 hover:bg-slate-700 hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
        >
          <Cog6ToothIcon className="w-5 h-5" />
        </button>
        <button
          type="button"
          title="User Profile (coming soon)"
          aria-label="User profile"
          className="p-1 sm:p-1.5 rounded-full text-slate-400 hover:bg-slate-700 hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 hidden sm:block"
        >
          <UserCircleIcon className="w-6 h-6" />
        </button>
        <div className="relative">
            <button
                ref={userMenuButtonRef}
                type="button"
                aria-label="Toggle user menu"
                aria-expanded={isUserMenuOpen}
                aria-controls="user-menu"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="p-1 sm:p-1.5 rounded-full text-slate-400 hover:bg-slate-700 hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
            >
                <Bars3Icon className="w-6 h-6" />
            </button>
            {isUserMenuOpen && (
                <div
                    id="user-menu"
                    ref={userMenuRef}
                    role="menu"
                    className="absolute right-0 mt-2 w-full min-w-[280px] sm:w-72 origin-top-right bg-slate-800 border border-slate-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none py-1 z-50 max-h-[70vh] overflow-y-auto custom-scrollbar"
                    tabIndex={-1}
                >
                    {userMenuItems.map((item, index) => {
                        if (item.type === 'divider') {
                            return <div key={`divider-${index}`} className="my-1 h-px bg-slate-700" role="separator"></div>;
                        }
                        if (item.type === 'header') {
                            return <div key={`header-${index}`} className="px-3 sm:px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">{item.label}</div>;
                        }
                        return ( 
                        <button
                            key={item.label + index} 
                            onClick={() => { item.action(); }}
                            className={cn(
                                "flex items-center w-full text-left px-3 sm:px-4 py-2 text-sm",
                                item.destructive ? "text-red-400 hover:bg-red-700/20 hover:text-red-300" : "text-slate-300 hover:bg-slate-700 hover:text-slate-100",
                                item.label === "No saved sessions yet" ? "text-slate-500 italic pointer-events-none" : ""
                            )}
                            role="menuitem"
                            disabled={item.label === "No saved sessions yet"}
                        >
                            {item.icon && item.label !== "No saved sessions yet" && <span className="flex-shrink-0">{item.icon}</span>}
                            <span className="truncate flex-grow">{item.label}</span>
                            {item.icon && item.label === "No saved sessions yet" && <span className="ml-auto">{item.icon}</span>}
                        </button>
                        );
                    })}
                </div>
            )}
        </div>
      </div>
    </header>
  );
};
Header.displayName = 'Header';

export default Header;