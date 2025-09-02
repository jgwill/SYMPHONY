
import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { AppStep } from '../types';
import { FolderIcon, PlusCircleIcon, ArrowPathIcon as SpinnerIcon } from '../components'; // Using ArrowPathIcon as a spinner for consistency
import { githubService } from '../services/githubService'; // Updated import
import { cn } from '../lib/utils';

type SubmitStatus = {
  type: 'success' | 'error';
  message: string;
} | null;

const CommitPage: React.FC = () => {
  const context = useContext(AppContext);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>(null);

  const repoFullName = context?.selectedRepo ? `${context.selectedRepo.owner}/${context.selectedRepo.name}` : 'your-org/your-repo';
  const defaultCommitTitle = `AI-assisted changes for ${context?.currentSessionTitle || 'current task'}`;
  const conceptualizationText = context?.agentMemory.sharedContext.initialConceptualizationText || "";
  const defaultCommitBody = `This commit includes changes implemented with the AI CoDevOps Agent.\nBased on conceptualization: ${conceptualizationText.substring(0,100)}...`;


  const handleGitAction = async (actionType: 'createPR' | 'pushToNew' | 'pushToCurrent') => {
    if (!context || !context.selectedRepo) {
      setSubmitStatus({ type: 'error', message: "Repository context is missing." });
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus(null);

    const newBranchName = `ai-generated-${Date.now().toString().slice(-5)}`;
    const currentBranchName = 'main'; // Placeholder, ideally this would come from repo context

    try {
      let resultMessage = '';
      if (actionType === 'createPR') {
        const pr = await githubService.createPullRequest(repoFullName, newBranchName, defaultCommitTitle, defaultCommitBody, currentBranchName);
        resultMessage = pr.message || `Pull request created: ${pr.html_url}`;
      } else if (actionType === 'pushToNew') {
        const push = await githubService.pushToBranch(repoFullName, newBranchName, defaultCommitTitle);
        resultMessage = push.message || `Changes pushed to new branch ${newBranchName}: ${push.commit_url}`;
      } else if (actionType === 'pushToCurrent') {
         const push = await githubService.pushToBranch(repoFullName, currentBranchName, defaultCommitTitle);
        resultMessage = push.message || `Changes pushed to current branch ${currentBranchName}: ${push.commit_url}`;
      }
      
      setSubmitStatus({ type: 'success', message: resultMessage });
      setTimeout(() => {
        context.resetToStartSession();
      }, 3000); // Show success message for 3 seconds then reset

    } catch (error) {
      setSubmitStatus({ type: 'error', message: (error as Error).message });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderButtonContent = (text: string, defaultIcon: React.ReactNode) => {
    if (isSubmitting) {
      return (
        <>
          <SpinnerIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
          Submitting...
        </>
      );
    }
    return <>{defaultIcon} {text}</>;
  };


  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-5 sm:mb-6 text-center">Finalize & Commit Changes</h1>
      
      {submitStatus && (
        <div 
          className={cn(
            "w-full p-3 mb-4 rounded-md text-sm text-center",
            submitStatus.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          )}
          role={submitStatus.type === 'error' ? 'alert' : 'status'}
        >
          {submitStatus.message}
        </div>
      )}

      <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-xl w-full space-y-4">
        <button 
          onClick={() => handleGitAction('createPR')}
          disabled={isSubmitting || !context?.selectedRepo}
          className="w-full flex items-center justify-center space-x-2 sm:space-x-3 p-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md transition-colors text-sm sm:text-base text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 focus-visible:ring-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {renderButtonContent("Create Pull Request (new branch)", <PlusCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />)}
        </button>
        <p className="text-xs text-slate-400 px-1 -mt-2">Recommended. Creates 'ai-generated-xxxxx' branch and opens a PR.</p>


        <button 
          onClick={() => handleGitAction('pushToCurrent')}
          disabled={isSubmitting || !context?.selectedRepo}
          className="w-full flex items-center justify-center space-x-2 sm:space-x-3 p-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md transition-colors text-sm sm:text-base text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 focus-visible:ring-slate-500 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {renderButtonContent("Push to current branch (main)", <FolderIcon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />)}
        </button>
         <p className="text-xs text-slate-400 px-1 -mt-2">Pushes changes directly to the 'main' branch (or current primary).</p>


        <button 
          onClick={() => handleGitAction('pushToNew')}
          disabled={isSubmitting || !context?.selectedRepo}
          className="w-full flex items-center justify-center space-x-2 sm:space-x-3 p-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md transition-colors text-sm sm:text-base text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 focus-visible:ring-slate-500 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {renderButtonContent("Push to new branch", <FolderIcon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />)}
        </button>
        <p className="text-xs text-slate-400 px-1 -mt-2">Creates a new branch and pushes changes, no automatic PR.</p>
        
        <div className="pt-2">
            <button 
              disabled 
              aria-disabled="true"
              className="w-full flex items-center space-x-2 sm:space-x-3 p-3 bg-slate-700 text-slate-500 rounded-md text-left cursor-not-allowed"
            >
              <PlusCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm sm:text-base">Create draft pull request</p>
                <p className="text-xs sm:text-sm">Often disabled by repository policy or needs specific token permissions.</p>
              </div>
            </button>
        </div>
      </div>
      {!isSubmitting && !submitStatus && context && !context.selectedRepo && (
         <p className="text-yellow-400 text-sm mt-4 text-center">
            Warning: No repository selected. Please start a new session.
          </p>
      )}
    </div>
  );
};
CommitPage.displayName = 'CommitPage';

export default CommitPage;
