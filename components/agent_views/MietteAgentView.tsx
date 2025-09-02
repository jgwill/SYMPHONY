
import React, { useContext, useState, useCallback } from 'react';
import { AppContext } from '../../App'; 
import { AppContextType } from '../../types';
import { LightBulbIcon, ChatBubbleLeftEllipsisIcon, UserGroupIcon, PaperAirplaneIcon } from '../icons';
import Card from '../Card'; // Updated import
import { cn } from '../../lib/utils';

interface MietteInteractionResult {
  type: 'story' | 'metaphor' | 'empathy_prompts';
  originalText: string;
  outputText: string;
}

const MietteAgentView: React.FC = () => {
  const context = useContext(AppContext) as AppContextType | null;
  
  const [userStoryInput, setUserStoryInput] = useState<string>('');
  const [conceptInput, setConceptInput] = useState<string>('');
  const [featureForEmpathy, setFeatureForEmpathy] = useState<string>('');

  const [results, setResults] = useState<MietteInteractionResult[]>([]);
  
  const handleElaborateStory = useCallback(async () => {
    if (!context || !userStoryInput.trim()) {
      context?.setAppError("Please enter a user story to elaborate.");
      return;
    }
    context.setIsLoading(true);
    context.setAppError(null);
    // Simulate AI call
    await new Promise(resolve => setTimeout(resolve, 1200));
    const mockElaboratedStory = `🌸 Regarding your story: "${userStoryInput.substring(0, 70)}..."

Let's delve deeper. Imagine the user encountering this. What are they truly seeking? 
Perhaps they're feeling a touch overwhelmed, and this story hints at a solution that could bring them clarity and a sense of control. 
This isn't just about fulfilling a task; it's about acknowledging their journey and making their experience smoother, more intuitive. 
How can we ensure this story translates into an interaction that feels supportive and empowering for them?`;
    setResults(prev => [...prev, { type: 'story', originalText: userStoryInput, outputText: mockElaboratedStory }]);
    setUserStoryInput('');
    context.setIsLoading(false);
  }, [context, userStoryInput]);

  const handleExplainMetaphor = useCallback(async () => {
    if (!context || !conceptInput.trim()) {
      context?.setAppError("Please enter a concept to explain.");
      return;
    }
    context.setIsLoading(true);
    context.setAppError(null);
    // Simulate AI call
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockMetaphor = `Let's re-imagine "${conceptInput.substring(0, 70)}...". 
Think of it as a friendly librarian for your project's information. 📚
Instead of a dusty, complex archive, it's a bright, intuitive space where related ideas are neatly shelved together. 
When you need a specific piece of knowledge related to "${conceptInput.substring(0, 30)}...", this 'librarian' guides you right to it, perhaps even suggesting a few related 'books' you might find helpful! 
It's about making complex things feel approachable and interconnected.`;
    setResults(prev => [...prev, { type: 'metaphor', originalText: conceptInput, outputText: mockMetaphor }]);
    setConceptInput('');
    context.setIsLoading(false);
  }, [context, conceptInput]);

  const handleGenerateEmpathyPrompts = useCallback(async () => {
    if (!context || !featureForEmpathy.trim()) {
      context?.setAppError("Please describe the feature for empathy mapping.");
      return;
    }
    context.setIsLoading(true);
    context.setAppError(null);
    // Simulate AI call
    await new Promise(resolve => setTimeout(resolve, 800));
    const mockPrompts = `For your feature: "${featureForEmpathy.substring(0, 70)}...", let's explore the user's perspective with these prompts:

**Before engaging with "${featureForEmpathy.substring(0,30)}...":**
*   What problem are they trying to solve or what goal are they hoping to achieve?
*   What are their current frustrations or workarounds related to this?
*   What are their expectations or hopes for a feature like this?

**While using "${featureForEmpathy.substring(0,30)}...":**
*   What might they be thinking? Is it intuitive? Confusing?
*   How are they feeling? (e.g., confident, anxious, efficient, delighted)
*   What actions are they taking, and are there any obstacles?

**After using "${featureForEmpathy.substring(0,30)}...":**
*   Did it solve their problem or help achieve their goal? How effectively?
*   How do they feel now? (e.g., relieved, satisfied, still unsure)
*   What would they tell a colleague about this feature?

Consider these to build a deeper connection with your user's experience!`;
    setResults(prev => [...prev, { type: 'empathy_prompts', originalText: featureForEmpathy, outputText: mockPrompts }]);
    setFeatureForEmpathy('');
    context.setIsLoading(false);
  }, [context, featureForEmpathy]);

  if (!context) return <div className="p-4 text-slate-500">Miette Agent context not available.</div>;

  const isLoading = context.isLoading;

  const interactionSections = [
    {
      title: "Elaborate User Story",
      icon: <ChatBubbleLeftEllipsisIcon className="w-5 h-5 mr-2 text-pink-400" />,
      inputState: userStoryInput,
      setInputState: setUserStoryInput,
      placeholder: "Paste a user story here...",
      action: handleElaborateStory,
      buttonText: "Elaborate with Empathy",
      ariaLabel: "Elaborate user story with empathy",
    },
    {
      title: "Metaphorical Explanation",
      icon: <LightBulbIcon className="w-5 h-5 mr-2 text-yellow-400" />,
      inputState: conceptInput,
      setInputState: setConceptInput,
      placeholder: "Enter a technical concept...",
      action: handleExplainMetaphor,
      buttonText: "Explain with Metaphor",
      ariaLabel: "Explain concept with metaphor",
    },
    {
      title: "Empathy Map Prompts",
      icon: <UserGroupIcon className="w-5 h-5 mr-2 text-teal-400" />,
      inputState: featureForEmpathy,
      setInputState: setFeatureForEmpathy,
      placeholder: "Describe the feature/product...",
      action: handleGenerateEmpathyPrompts,
      buttonText: "Get Empathy Prompts",
      ariaLabel: "Generate empathy map prompts",
    },
  ];

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col bg-slate-850 text-slate-200 overflow-y-auto custom-scrollbar">
      <div className="flex items-center mb-4 flex-shrink-0">
        <span className="text-3xl mr-3" role="img" aria-label="Miette Agent Glyph">🌸</span>
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-100">Miette: Empathy & Metaphor</h2>
      </div>
      <p className="text-slate-400 mb-6 text-sm flex-shrink-0">
        Miette helps weave empathy and understanding into your project. Use her to elaborate user stories, explain complex ideas metaphorically, or generate prompts for empathy mapping.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6 flex-shrink-0">
        {interactionSections.map((section) => (
          <Card key={section.title} title={section.title} titleClassName="text-md sm:text-lg text-slate-200" headerContent={section.icon} className="bg-slate-800">
            <textarea
              value={section.inputState}
              onChange={(e) => section.setInputState(e.target.value)}
              placeholder={section.placeholder}
              className="w-full h-20 p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 resize-none focus:outline-none focus:ring-1 focus:ring-pink-500 placeholder-slate-400 text-sm mb-2 custom-scrollbar"
              aria-label={section.placeholder}
              disabled={isLoading}
            />
            <button
              onClick={section.action}
              disabled={isLoading || !section.inputState.trim()}
              className={cn(
                "flex items-center justify-center gap-2 w-full px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-white font-semibold rounded-md shadow transition-colors text-xs",
                "disabled:opacity-60 disabled:cursor-not-allowed"
              )}
              aria-label={section.ariaLabel}
            >
              {isLoading && context.isLoading && section.inputState.trim() ? ( // Ensure loading state is for this specific action
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>
                  Working...
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="w-3 h-3 transform rotate-[-45deg]" />
                  {section.buttonText}
                </>
              )}
            </button>
          </Card>
        ))}
      </div>
      
      {results.length > 0 && (
        <div className="mt-4 border-t border-slate-700 pt-4 flex-grow min-h-0">
          <h3 className="text-md sm:text-lg font-semibold text-slate-100 mb-2">Miette's Musings:</h3>
          <div className="space-y-3 overflow-y-auto custom-scrollbar h-full bg-slate-800 p-3 rounded-md">
            {results.map((result, index) => (
              <div key={index} className="p-3 bg-slate-750 rounded-md border border-slate-700/50 shadow-sm">
                <p className="text-xs text-pink-300 mb-1">Original: <span className="text-slate-400 italic">"{result.originalText.substring(0,50)}..."</span> ({result.type.replace('_', ' ')})</p>
                <pre className="whitespace-pre-wrap font-sans text-slate-300 text-sm leading-relaxed">{result.outputText}</pre>
              </div>
            ))}
          </div>
        </div>
      )}

      <button 
        onClick={() => context?.setActiveAgentId(null)}
        className="mt-auto w-full max-w-xs mx-auto px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md text-sm flex-shrink-0 pt-4"
        aria-label="Deactivate Miette agent view and return to Workspace"
      >
        Return to Workspace
      </button>
    </div>
  );
};
MietteAgentView.displayName = 'MietteAgentView';

export default MietteAgentView;
