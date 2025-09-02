import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../App';
import { AppContextType, GithubTreeFile } from '../types';
import { FolderIcon, DocumentIcon, ChevronDownIcon, ChevronRightIcon, ArrowPathIcon } from './icons';
import { cn } from '../lib/utils';
import { githubService } from '../services/githubService';

interface FileSystemNode {
  id: string;
  name: string;
  path: string;
  type: 'folder' | 'file';
  children: FileSystemNode[];
}

const mockFileTreeData: FileSystemNode[] = [
  { 
    id: '1', name: 'src', path: 'src', type: 'folder', 
    children: [
      { 
        id: '1-1', name: 'components', path: 'src/components', type: 'folder', 
        children: [
          { id: '1-1-1', name: 'Header.tsx', path: 'src/components/Header.tsx', type: 'file', children: [] },
        ]
      },
      { id: '1-3', name: 'App.tsx', path: 'src/App.tsx', type: 'file', children: [] },
    ]
  },
  { id: '3', name: 'README.md', path: 'README.md', type: 'file', children: [] },
];

const buildTree = (files: GithubTreeFile[]): FileSystemNode[] => {
    const root: FileSystemNode = { id: 'root', name: 'root', path: '', type: 'folder', children: [] };
    const nodeMap = new Map<string, FileSystemNode>();
    nodeMap.set('', root);

    files.forEach(file => {
        const parts = file.path.split('/');
        parts.forEach((part, index) => {
            const currentPath = parts.slice(0, index + 1).join('/');
            if (!nodeMap.has(currentPath)) {
                const parentPath = parts.slice(0, index).join('/');
                const parentNode = nodeMap.get(parentPath)!;
                const isFolder = index < parts.length - 1 || file.type === 'tree';

                const newNode: FileSystemNode = {
                    id: file.sha,
                    name: part,
                    path: currentPath,
                    type: isFolder ? 'folder' : 'file',
                    children: [],
                };
                parentNode.children.push(newNode);
                if (isFolder) {
                    nodeMap.set(currentPath, newNode);
                }
            }
        });
    });

    // Sort children: folders first, then files, alphabetically
    const sortNodes = (nodes: FileSystemNode[]) => {
        nodes.sort((a, b) => {
            if (a.type === 'folder' && b.type === 'file') return -1;
            if (a.type === 'file' && b.type === 'folder') return 1;
            return a.name.localeCompare(b.name);
        });
        nodes.forEach(node => sortNodes(node.children));
    };
    sortNodes(root.children);

    return root.children;
};


interface FileTreeItemProps {
  node: FileSystemNode;
  level: number;
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({ node, level }) => {
  const [isOpen, setIsOpen] = useState(node.type === 'folder' && level < 1);
  const context = useContext(AppContext) as AppContextType | null;

  const handleToggle = () => {
    if (node.type === 'folder') {
      setIsOpen(!isOpen);
    } else if (context?.handleSelectFileFromTree) {
      context.handleSelectFileFromTree(node.path);
    }
  };

  const indentStyle = { paddingLeft: `${level * 0.75 + (node.type === 'file' ? 1.25 : 0)}rem` };

  return (
    <li className="text-xs sm:text-sm">
      <button 
        onClick={handleToggle} 
        className="flex items-center w-full py-1 px-1.5 sm:px-2 hover:bg-slate-700 rounded focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500"
        style={indentStyle}
        aria-expanded={node.type === 'folder' ? isOpen : undefined}
        aria-label={node.type === 'folder' ? `${isOpen ? 'Collapse' : 'Expand'} ${node.name}` : `Open file ${node.name}`}
      >
        {node.type === 'folder' && (
          isOpen ? <ChevronDownIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 text-slate-400 flex-shrink-0" /> 
                 : <ChevronRightIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 text-slate-400 flex-shrink-0" />
        )}
        {node.type === 'folder' ? 
          <FolderIcon className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 flex-shrink-0", isOpen ? "text-cyan-400" : "text-slate-400")} /> : 
          <DocumentIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 text-slate-400 flex-shrink-0" />
        }
        <span className={cn("truncate", node.type === 'folder' ? 'text-slate-300' : 'text-slate-400')}>{node.name}</span>
      </button>
      {node.type === 'folder' && isOpen && node.children && node.children.length > 0 && (
        <ul className="pl-0">
          {node.children.map(child => (
            <FileTreeItem key={child.path} node={child} level={level + 1} />
          ))}
        </ul>
      )}
    </li>
  );
};
FileTreeItem.displayName = 'FileTreeItem';


const FileTreePanel: React.FC = () => {
    const context = useContext(AppContext) as AppContextType | null;
    const [fileTree, setFileTree] = useState<FileSystemNode[]>(mockFileTreeData);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTree = async () => {
            if (!context || !context.selectedRepo) {
                setFileTree(mockFileTreeData);
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                const repoFullName = `${context.selectedRepo.owner}/${context.selectedRepo.name}`;
                const files = await githubService.getRepoFileTree(repoFullName);
                const tree = buildTree(files);
                setFileTree(tree);
            } catch (err) {
                console.warn("Failed to fetch GitHub file tree:", (err as Error).message, "Falling back to mock data.");
                setError("Could not load repository files. Using mock data. (Is GH_TOKEN set?)");
                setFileTree(mockFileTreeData);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTree();
    }, [context?.selectedRepo]);


  return (
    <div className="bg-slate-800 border-r border-slate-700 h-full flex flex-col overflow-y-auto custom-scrollbar flex-shrink-0">
      <div className="p-2 sm:p-3 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
        <h3 className="text-xs sm:text-sm font-semibold text-slate-200">Explorer</h3>
        {error && <p className="text-xxs text-yellow-400 mt-1">{error}</p>}
      </div>
       {isLoading ? (
        <div className="flex items-center justify-center p-4">
            <ArrowPathIcon className="w-5 h-5 animate-spin text-slate-400"/>
        </div>
       ) : (
        <ul className="p-0.5 sm:p-1 space-y-0">
            {fileTree.map(node => (
            <FileTreeItem key={node.path} node={node} level={0} />
            ))}
        </ul>
       )}
    </div>
  );
};
FileTreePanel.displayName = 'FileTreePanel';

export default FileTreePanel;