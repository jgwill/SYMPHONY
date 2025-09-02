
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { marked } from 'marked';
import { cn } from '../lib/utils';
import { BoldIcon, ItalicIcon, ListUnorderedIcon, CodeBracketIcon, LinkIcon, HeadingIcon, BackspaceIcon, ClipboardDocumentListIcon } from './icons';

interface MarkdownEditorPreviewProps {
  initialContent: string;
  onContentChange?: (newContent: string) => void;
  readOnly?: boolean;
  viewerHeight?: string;
  ariaLabelledBy?: string;
  initialMode?: 'edit' | 'preview';
}

type ToolbarAction = 'bold' | 'italic' | 'ul' | 'codeblock' | 'link' | 'heading' | 'clear' | 'template';

const TASK_TEMPLATE = `
- Task Description: [Enter task details here]
  - How: [Describe implementation approach or steps]
  - AC:
    1. [Acceptance Criterion 1]
    2. [Acceptance Criterion 2]
  - Complexity: [Low/Medium/High]
`;

export const MarkdownEditorPreview: React.FC<MarkdownEditorPreviewProps> = ({
  initialContent,
  onContentChange,
  readOnly = false,
  viewerHeight = 'h-96', 
  ariaLabelledBy,
  initialMode,
}) => {
  const [mode, setMode] = useState<'edit' | 'preview'>(initialMode || (readOnly ? 'preview' : 'edit'));
  const [content, setContent] = useState(initialContent);
  const [previewHtml, setPreviewHtml] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  useEffect(() => {
    if (mode === 'preview') {
      try {
        if (typeof marked !== 'undefined' && typeof marked.parse === 'function') {
          const html = marked.parse(content || '') as string;
          setPreviewHtml(html);
        } else {
          console.warn("Marked library or marked.parse function is not available.");
          setPreviewHtml("<p>Markdown library not loaded or initialized correctly.</p>");
        }
      } catch (error) {
        console.error("Error parsing markdown:", error);
        setPreviewHtml("<p>Error rendering Markdown preview.</p>");
      }
    }
  }, [content, mode]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setContent(newText);
    if (onContentChange) {
      onContentChange(newText);
    }
  };

  const insertTextAtCursor = (textToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);
    
    const fullNewText = `${before}${textToInsert}${after}`;
    setContent(fullNewText);
    if (onContentChange) {
      onContentChange(fullNewText);
    }

    textarea.focus();
    // Position cursor after the inserted text, specifically targeting the first placeholder
    const placeholderMatch = textToInsert.match(/\[.*?\]/);
    let cursorPosition = start + textToInsert.length;
    if (placeholderMatch && placeholderMatch.index !== undefined) {
        cursorPosition = start + placeholderMatch.index + 1; // Position after the opening bracket of the first placeholder
    }
    
    setTimeout(() => {
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    }, 0);
  };

  const applyMarkdownSyntax = (syntaxStart: string, syntaxEnd: string = syntaxStart, isBlock: boolean = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let newText;

    if (isBlock) {
      const lineStart = textarea.value.lastIndexOf('\n', start -1) + 1;
      // const lineEnd = textarea.value.indexOf('\n', end); // This might be incorrect for multi-line selections
      // const actualEnd = lineEnd === -1 ? textarea.value.length : lineEnd;
      
      // Handle multi-line block selection correctly
      const textBeforeSelection = textarea.value.substring(0, start);
      const textAfterSelection = textarea.value.substring(end);

      if (selectedText.includes('\n')) { // Multi-line selection for code block
        newText = `${syntaxStart}\n${selectedText}\n${syntaxEnd}`;
      } else { // Single line or no selection for heading or list item
        const currentLineText = textarea.value.substring(lineStart, textarea.value.indexOf('\n', start) === -1 ? textarea.value.length : textarea.value.indexOf('\n', start));
        const prefix = syntaxStart; 
        newText = `${prefix}${currentLineText}`;
        
        const before = textarea.value.substring(0, lineStart);
        const after = textarea.value.substring(textarea.value.indexOf('\n', start) === -1 ? textarea.value.length : textarea.value.indexOf('\n', start));
        const fullNewText = `${before}${newText}${after}`;

        setContent(fullNewText);
        if (onContentChange) onContentChange(fullNewText);
        textarea.focus();
        setTimeout(() => textarea.setSelectionRange(lineStart + newText.length, lineStart + newText.length), 0);
        return;
      }
       const fullNewText = `${textBeforeSelection}${newText}${textAfterSelection}`;
       setContent(fullNewText);
       if (onContentChange) onContentChange(fullNewText);
       textarea.focus();
       setTimeout(() => {
         textarea.setSelectionRange(start + syntaxStart.length + (selectedText.includes('\n') ? 1:0) , start + syntaxStart.length + (selectedText.includes('\n') ? 1:0) + selectedText.length);
       },0);
       return;

    } else { // Inline syntax
        newText = `${syntaxStart}${selectedText}${syntaxEnd}`;
    }
    
    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);
    const fullNewText = `${before}${newText}${after}`;

    setContent(fullNewText);
    if (onContentChange) {
      onContentChange(fullNewText);
    }
    
    textarea.focus();
    setTimeout(() => {
      if (selectedText) {
        textarea.setSelectionRange(start + syntaxStart.length, start + syntaxStart.length + selectedText.length);
      } else { // If no text selected, place cursor in the middle of the syntax
        textarea.setSelectionRange(start + syntaxStart.length, start + syntaxStart.length);
      }
    }, 0);
  };

  const handleClearContent = () => {
    setContent('');
    if (onContentChange) {
      onContentChange('');
    }
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleToolbarAction = (action: ToolbarAction) => {
    switch (action) {
      case 'bold':
        applyMarkdownSyntax('**');
        break;
      case 'italic':
        applyMarkdownSyntax('*');
        break;
      case 'ul':
        applyMarkdownSyntax('- ', '', true); 
        break;
      case 'codeblock':
        applyMarkdownSyntax('```', '```', true); // Simplified for block elements
        break;
      case 'link':
        applyMarkdownSyntax('[', '](url)');
        break;
      case 'heading':
        applyMarkdownSyntax('## ', '', true); 
        break;
      case 'template':
        insertTextAtCursor(TASK_TEMPLATE);
        break;
      case 'clear':
        handleClearContent();
        break;
    }
  };
  
  const toolbarButtons: { action: ToolbarAction; label: string; icon: React.ReactNode }[] = [
    { action: 'bold', label: 'Bold', icon: <BoldIcon className="w-4 h-4" /> },
    { action: 'italic', label: 'Italic', icon: <ItalicIcon className="w-4 h-4" /> },
    { action: 'heading', label: 'Heading 2', icon: <HeadingIcon className="w-4 h-4" /> },
    { action: 'ul', label: 'Unordered List', icon: <ListUnorderedIcon className="w-4 h-4" /> },
    { action: 'link', label: 'Insert Link', icon: <LinkIcon className="w-4 h-4" /> },
    { action: 'codeblock', label: 'Code Block', icon: <CodeBracketIcon className="w-4 h-4" /> },
    { action: 'template', label: 'Insert Task Template', icon: <ClipboardDocumentListIcon className="w-4 h-4" /> },
    { action: 'clear', label: 'Clear Content', icon: <BackspaceIcon className="w-4 h-4" /> },
  ];


  return (
    <div className="bg-slate-800 rounded-lg shadow-lg flex flex-col h-full">
      {!readOnly && (
        <div className="flex items-center border-b border-slate-700 flex-shrink-0">
          <button
            onClick={() => setMode('edit')}
            className={cn(
              "px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800",
              mode === 'edit'
                ? "bg-slate-700 text-cyan-400 border-b-2 border-cyan-400"
                : "text-slate-400 hover:bg-slate-750 hover:text-slate-200"
            )}
            aria-pressed={mode === 'edit'}
          >
            Edit
          </button>
          <button
            onClick={() => setMode('preview')}
            className={cn(
              "px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800",
              mode === 'preview'
                ? "bg-slate-700 text-cyan-400 border-b-2 border-cyan-400"
                : "text-slate-400 hover:bg-slate-750 hover:text-slate-200"
            )}
            aria-pressed={mode === 'preview'}
          >
            Preview
          </button>
        </div>
      )}
       {!readOnly && mode === 'edit' && (
        <div className="p-1.5 sm:p-2 border-b border-slate-700 flex space-x-1 flex-wrap flex-shrink-0">
          {toolbarButtons.map(btn => (
            <button
              key={btn.action}
              onClick={() => handleToolbarAction(btn.action)}
              title={btn.label}
              aria-label={btn.label}
              className="p-1.5 sm:p-2 text-slate-400 hover:bg-slate-700 hover:text-slate-100 rounded-md focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500"
            >
              {btn.icon}
            </button>
          ))}
        </div>
      )}


      <div className={cn("p-0.5 flex-grow overflow-hidden", viewerHeight)} style={{minHeight: 0}}>
        {mode === 'edit' && !readOnly ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextChange}
            className="w-full h-full p-2 sm:p-3 bg-slate-800 text-slate-200 resize-none focus:outline-none placeholder-slate-500 custom-scrollbar font-mono text-xs sm:text-sm"
            placeholder="Enter Markdown content..."
            aria-label="Markdown editor"
            aria-labelledby={ariaLabelledBy}
            spellCheck="false"
          />
        ) : (
          <div
            className="markdown-preview-content max-w-none p-2 sm:p-3 overflow-y-auto custom-scrollbar h-full"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
            aria-label="Markdown preview"
            aria-labelledby={ariaLabelledBy}
          />
        )}
      </div>
    </div>
  );
};
MarkdownEditorPreview.displayName = 'MarkdownEditorPreview';

export default MarkdownEditorPreview;
