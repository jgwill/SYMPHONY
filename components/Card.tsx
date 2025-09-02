import React from 'react';
import { cn } from '../lib/utils';

interface CardProps {
  title?: string;
  titleClassName?: string;
  headerContent?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

const Card: React.FC<CardProps> = ({ 
  title, 
  titleClassName = "text-xl font-semibold text-slate-200", 
  headerContent, 
  children, 
  className,
  bodyClassName 
}) => {
  const hasHeader = title || headerContent;

  return (
    <div className={cn("bg-slate-800 rounded-lg shadow-lg", className)}>
      {hasHeader && (
        <div className="flex justify-between items-center p-4 border-b border-slate-700/50">
          {title && <h2 className={cn(titleClassName)}>{title}</h2>}
          {headerContent && <div>{headerContent}</div>}
        </div>
      )}
      <div className={cn("p-4", bodyClassName)}>
        {children}
      </div>
    </div>
  );
};
Card.displayName = 'Card';

export default Card;
