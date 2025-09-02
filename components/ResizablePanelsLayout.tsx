
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';

interface ResizablePanelsLayoutProps {
  leftPanelContent: React.ReactNode;
  rightPanelContent: React.ReactNode;
  initialLeftPanelWidth?: number;
  minLeftPanelWidth?: number;
  maxLeftPanelWidth?: number;
  showLeftPanel?: boolean;
  className?: string;
  leftPanelClassName?: string;
  rightPanelClassName?: string;
  handleClassName?: string;
}

const ResizablePanelsLayout: React.FC<ResizablePanelsLayoutProps> = ({
  leftPanelContent,
  rightPanelContent,
  initialLeftPanelWidth = 256,
  minLeftPanelWidth = 150,
  maxLeftPanelWidth = 500,
  showLeftPanel = true,
  className,
  leftPanelClassName,
  rightPanelClassName,
  handleClassName,
}) => {
  const [currentLeftPanelWidth, setCurrentLeftPanelWidth] = useState(initialLeftPanelWidth);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = currentLeftPanelWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [currentLeftPanelWidth]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    
    const deltaX = e.clientX - startXRef.current;
    let newWidth = startWidthRef.current + deltaX;

    const constrainedWidth = Math.max(minLeftPanelWidth, Math.min(newWidth, maxLeftPanelWidth));
    setCurrentLeftPanelWidth(constrainedWidth);
  }, [minLeftPanelWidth, maxLeftPanelWidth]);

  const handleMouseUp = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    if (isDraggingRef.current) { 
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (document.body.style.cursor === 'col-resize') { 
        document.body.style.cursor = '';
      }
      if (document.body.style.userSelect === 'none') {
        document.body.style.userSelect = '';
      }
    };
  }, [handleMouseMove, handleMouseUp]);
  
  useEffect(() => {
    // Adjust width when initialLeftPanelWidth or constraints change, respecting showLeftPanel
    if (showLeftPanel) {
      setCurrentLeftPanelWidth(Math.max(minLeftPanelWidth, Math.min(initialLeftPanelWidth, maxLeftPanelWidth)));
    }
  }, [initialLeftPanelWidth, minLeftPanelWidth, maxLeftPanelWidth, showLeftPanel]);


  return (
    <div className={cn("flex h-full", className)}> {/* Ensure h-full if parent dictates height */}
      <div
        style={{ width: showLeftPanel ? `${currentLeftPanelWidth}px` : '0px' }}
        className={cn(
          "flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden",
          leftPanelClassName
        )}
      >
        {/* The content (e.g. FileTreePanel) should handle its own internal scrolling */}
        {leftPanelContent}
      </div>
      {showLeftPanel && currentLeftPanelWidth > 0 && (
        <div
          onMouseDown={handleMouseDown}
          className={cn(
            "w-1.5 h-full bg-slate-700 hover:bg-cyan-500 active:bg-cyan-400 cursor-col-resize flex-shrink-0 transition-colors duration-150 ease-in-out z-10",
            handleClassName
          )}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize panel"
          tabIndex={0}
        />
      )}
      <div className={cn("flex-grow overflow-y-auto custom-scrollbar", rightPanelClassName)}>
        {rightPanelContent}
      </div>
    </div>
  );
};
ResizablePanelsLayout.displayName = 'ResizablePanelsLayout';

export default ResizablePanelsLayout;
