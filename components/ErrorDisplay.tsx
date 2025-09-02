
import React from 'react';
import { XMarkIcon } from './index';

interface ErrorDisplayProps {
  error: string | null;
  onDismiss: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onDismiss }) => {
  if (!error) {
    return null;
  }

  return (
    <div 
      className="bg-red-600 text-white p-3 flex justify-between items-center text-sm sticky top-0 z-[60]"
      role="alert"
      aria-live="assertive"
    >
      <span>{error}</span>
      <button 
        onClick={onDismiss} 
        className="ml-4 p-1 rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="Dismiss error"
      >
        <XMarkIcon className="w-5 h-5" />
      </button>
    </div>
  );
};
ErrorDisplay.displayName = 'ErrorDisplay';

export default ErrorDisplay;