
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from './icons';
import { cn } from '../lib/utils';

interface Sample {
  label: string;
  value: string;
}

interface SampleDropdownProps {
  samples: Sample[];
  onSelect: (value: string) => void;
  className?: string;
  buttonText?: string;
}

const SampleDropdown: React.FC<SampleDropdownProps> = ({ samples, onSelect, className, buttonText = "Samples" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    onSelect(value);
    setIsOpen(false);
  };

  if (!samples || samples.length === 0) {
    return null;
  }

  return (
    <div className={cn("relative inline-block text-left", className)} ref={dropdownRef}>
      <div>
        <button
          type="button"
          className="inline-flex justify-center w-full rounded-md border border-slate-600 shadow-sm px-2 py-1 bg-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-600 focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500"
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="true"
          aria-expanded={isOpen}
          title="Load a sample prompt"
        >
          {buttonText}
          <ChevronDownIcon className="-mr-1 ml-1 h-4 w-4" />
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-slate-800 border border-slate-700 ring-1 ring-black ring-opacity-5 z-20">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {samples.map((sample, index) => (
              <button
                key={index}
                onClick={() => handleSelect(sample.value)}
                className="w-full text-left block px-4 py-2 text-xs text-slate-300 hover:bg-slate-700"
                role="menuitem"
                title={sample.label}
              >
                <span className="truncate block">{sample.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
SampleDropdown.displayName = 'SampleDropdown';

export default SampleDropdown;
