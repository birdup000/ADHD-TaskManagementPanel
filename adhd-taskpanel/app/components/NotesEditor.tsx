import React, { useState, useRef, useEffect, useCallback } from 'react';
import debounce from 'lodash/debounce';
import { 
  FaPlus, 
  FaEllipsisH, 
  FaChevronDown, 
  FaChevronRight,
  FaTrash,
  FaCopy,
  FaLink,
  FaClock,
  FaStar,
  FaComment,
  FaFile,
  FaFileAlt,
  FaEllipsisV
} from 'react-icons/fa';

interface Block {
  id: string;
  type: 'text' | 'heading1' | 'heading2' | 'heading3' | 'bulletList' | 'numberList' | 'todo' | 'code' | 'quote' | 'divider' | 'callout' | 'toggle';
  content: string;
  checked?: boolean;
  properties?: {
    color?: string;
    icon?: string;
    collapsed?: boolean;
  };
}

interface Document {
  id: string;
  title: string;
  icon?: string;
  cover?: string;
  emoji?: string;
  favorite?: boolean;
  blocks: Block[];
  children: Document[];
  createdAt: Date;
  updatedAt: Date;
  lastOpenedAt?: Date;
  parent?: string;
}

interface ContextMenu {
  x: number;
  y: number;
  documentId: string;
  type: 'document' | 'editor';
}

const NotesEditor: React.FC<{
  initialContent?: string;
  onChange: (content: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
}> = ({ initialContent = '', onChange, readOnly = false, placeholder, className = '' }) => {
  // State
  const [documents, setDocuments] = useState<Document[]>([]);
  const mounted = useRef(false);
  const [activeDocument, setActiveDocument] = useState<Document | null>(null);
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [commandMenuPosition, setCommandMenuPosition] = useState({ x: 0, y: 0 });
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);

  // Effects
  useEffect(() => {
    mounted.current = true;

    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenu && !e.defaultPrevented) {
        setContextMenu(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    
    return () => {
      mounted.current = false;
      document.removeEventListener('click', handleClickOutside);
    };
  }, [contextMenu]);

  // Save content when component unmounts or when activeDocument changes
  useEffect(() => {
    if (!mounted.current) return;
    
    const handleBeforeUnload = () => {
      if (editorRef.current) {
        const content = editorRef.current.innerHTML;
        // Force immediate save without debounce on unload
        onChange(content);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (editorRef.current) {
        const content = editorRef.current.innerHTML;
        onChange(content);
      }
    };
  }, [onChange, mounted]);

  // Handlers
  const createNewDocument = useCallback((parentId?: string) => {
    if (!mounted.current) return;
    const newDoc: Document = {
      id: Date.now().toString(),
      title: 'Untitled',
      blocks: [{ id: '1', type: 'text', content: '' }],
      children: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      parent: parentId
    };

    if (parentId) {
      setDocuments(prev => prev.map(doc => 
        doc.id === parentId
          ? { ...doc, children: [...doc.children, newDoc] }
          : doc
      ));
    } else {
      setDocuments(prev => [...prev, newDoc]);
    }
    setActiveDocument(newDoc);
  }, []);

  const duplicateDocument = (docId: string) => {
    const docToDuplicate = documents.find(d => d.id === docId);
    if (!docToDuplicate) return;

    const duplicate: Document = {
      ...docToDuplicate,
      id: Date.now().toString(),
      title: `${docToDuplicate.title} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      children: []
    };

    setDocuments(prev => [...prev, duplicate]);
  };

  const deleteDocument = (docId: string) => {
    setDocuments(prev => {
      const removeDoc = (docs: Document[]): Document[] => {
        return docs.filter(doc => {
          if (doc.id === docId) return false;
          if (doc.children.length) {
            doc.children = removeDoc(doc.children);
          }
          return true;
        });
      };
      return removeDoc(prev);
    });

    if (activeDocument?.id === docId) {
      setActiveDocument(null);
    }
  };

  const toggleFavorite = (docId: string) => {
    setFavorites(prev => 
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const copyLink = (docId: string) => {
    // In a real app, this would generate a shareable link
    navigator.clipboard.writeText(`app://document/${docId}`);
  };

  // Debounce content updates
const debouncedOnChange = useCallback(
  debounce((content: string) => {
    if (mounted.current) {
      onChange(content);
    }
  }, 500),
  [onChange]
);

const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle special keys
    if (e.key === '/' && !showCommandMenu) {
      e.preventDefault();
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setCommandMenuPosition({
          x: rect.left,
          y: rect.bottom
        });
        setShowCommandMenu(true);
      }
    }
  };

  const handleContextMenu = (e: React.MouseEvent, docId: string, type: 'document' | 'editor') => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      documentId: docId,
      type
    });
  };

  const DocumentTree: React.FC<{
    docs: Document[];
    level?: number;
  }> = ({ docs, level = 0 }) => {
    return (
      <div className="space-y-0.5">
        {docs.map(doc => (
          <div key={doc.id} style={{ paddingLeft: level * 12 + 'px' }}>
            <div
              className={`group flex items-center px-2 py-1 rounded-sm cursor-pointer hover:bg-gray-700 transition-colors duration-150 ${
                activeDocument?.id === doc.id ? 'bg-gray-700' : ''
              }`}
              onClick={() => setActiveDocument(doc)}
              onContextMenu={(e) => handleContextMenu(e, doc.id, 'document')}
            >
              <div className="flex items-center flex-1 min-w-0">
                {doc.children.length > 0 ? (
                  <FaChevronDown className="w-3 h-3 mr-1 text-gray-500 flex-shrink-0" />
                ) : (
                  <FaChevronRight className="w-3 h-3 mr-1 text-gray-500 flex-shrink-0" />
                )}
                {doc.emoji && <span className="mr-2">{doc.emoji}</span>}
                {doc.icon && <FaFileAlt className="w-3 h-3 mr-2 text-gray-400" />}
                <span className="text-sm truncate text-gray-300">{doc.title || 'Untitled'}</span>
                {favorites.includes(doc.id) && (
                  <FaStar className="w-3 h-3 ml-2 text-yellow-500" />
                )}
              </div>
              <button 
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#3D3D3D] rounded transition-all duration-150"
                onClick={(e) => {
                  e.stopPropagation();
                  handleContextMenu(e, doc.id, 'document');
                }}
              >
                <FaEllipsisV className="w-3 h-3 text-gray-400" />
              </button>
            </div>
            {doc.children.length > 0 && (
              <DocumentTree docs={doc.children} level={level + 1} />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full flex bg-transparent text-inherit">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-700/50 bg-gray-800/30">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-400/80 text-xs uppercase tracking-wide">Notes</h3>
            <button
              onClick={() => createNewDocument()}
              className="p-1.5 hover:bg-gray-700 rounded-md transition-colors"
            >
              <FaPlus className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full bg-gray-700/50 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 border border-gray-600/30"
            />
          </div>
        </div>
        
        {/* Favorites Section */}
        {favorites.length > 0 && (
          <div className="py-2 border-b border-[#2D2D2D]">
            <h4 className="px-4 text-xs font-medium text-gray-500 mb-1">FAVORITES</h4>
            <DocumentTree 
              docs={documents.filter(doc => favorites.includes(doc.id))} 
            />
          </div>
        )}

        {/* Recent Section */}
        {recentDocuments.length > 0 && (
          <div className="py-2 border-b border-[#2D2D2D]">
            <h4 className="px-4 text-xs font-medium text-gray-500 mb-1">RECENT</h4>
            <div className="space-y-0.5">
              {recentDocuments.map(doc => (
                <div
                  key={doc.id}
                  className="px-4 py-1 hover:bg-[#2D2D2D] cursor-pointer flex items-center"
                  onClick={() => setActiveDocument(doc)}
                >
                  <FaClock className="w-3 h-3 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-400 truncate">{doc.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Document Tree */}
        <div className="overflow-y-auto" style={{ height: 'calc(100vh - 89px)' }}>
          <DocumentTree docs={documents.filter(doc => !doc.parent)} />
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col bg-transparent">
        {activeDocument ? (
          <>
            {/* Editor Header */}
            <div className="px-6 py-4 border-b border-gray-700/30">
              <div className="flex items-center gap-2 mb-4">
                {activeDocument.emoji && (
                  <span className="text-2xl">{activeDocument.emoji}</span>
                )}
                <input
                  type="text"
                  value={activeDocument.title}
                  onChange={(e) => {
                    const updatedDoc = {
                      ...activeDocument,
                      title: e.target.value,
                      updatedAt: new Date()
                    };
                    setDocuments(prev => 
                      prev.map(doc => doc.id === activeDocument.id ? updatedDoc : doc)
                    );
                    setActiveDocument(updatedDoc);
                  }}
                  className="w-full bg-transparent border-none text-3xl font-bold focus:outline-none placeholder-gray-500"
                  placeholder="Untitled"
                />
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <FaClock className="w-3 h-3" />
                  {new Date(activeDocument.updatedAt).toLocaleDateString()} •{' '}
                  {new Date(activeDocument.updatedAt).toLocaleTimeString()}
                </span>
                <button
                  onClick={() => toggleFavorite(activeDocument.id)}
                  className="flex items-center gap-1 hover:text-gray-300"
                >
                  <FaStar className={`w-3 h-3 ${favorites.includes(activeDocument.id) ? 'text-yellow-500' : ''}`} />
                  {favorites.includes(activeDocument.id) ? 'Favorited' : 'Add to favorites'}
                </button>
              </div>
            </div>

            {/* Editor Content */}
            <div className={`flex-1 overflow-y-auto ${className}`}>
              <div className="max-w-3xl mx-auto w-full">
                <div
                  ref={editorRef}
                  className="prose prose-invert max-w-none focus:outline-none bg-transparent border-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none rounded-lg"
                  style={{
                  minHeight: '100%',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: 'inherit',
                  padding: '0.5rem'
                }}
                contentEditable={!readOnly}
                onKeyDown={handleKeyDown}
                onContextMenu={(e) => handleContextMenu(e, activeDocument.id, 'editor')}
                onInput={(e) => {
                  if (readOnly || !mounted.current) return;

                  // Store selection state before any updates
                  const selection = window.getSelection();
                  const range = selection?.getRangeAt(0);
                  const storedContainer = range?.startContainer;
                  const storedOffset = range?.startOffset || 0;
                  
                  // Get content and create updated document
                  const contentElement = e.currentTarget;
                  const content = contentElement.innerHTML;
                  const updatedDoc = {
                    ...activeDocument,
                    blocks: [{ ...activeDocument.blocks[0], content }],
                    updatedAt: new Date()
                  };

                  // Batch state updates
                  setDocuments(prev => 
                    prev.map(doc => doc.id === activeDocument.id ? updatedDoc : doc)
                  );
                  setActiveDocument(updatedDoc);
                  debouncedOnChange(content);
                  
                  // Restore cursor position after state update
                  if (selection && storedContainer && contentElement.isConnected) {
                    requestAnimationFrame(() => {
                      try {
                        const newRange = document.createRange();
                        
                        if (contentElement.contains(storedContainer)) {
                          newRange.setStart(storedContainer, storedOffset);
                          newRange.setEnd(storedContainer, storedOffset);
                        } else {
                          const fallbackNode = contentElement.firstChild || contentElement;
                          const maxOffset = Math.min(storedOffset, fallbackNode.textContent?.length || 0);
                          newRange.setStart(fallbackNode, maxOffset);
                          newRange.setEnd(fallbackNode, maxOffset);
                        }
                        
                        selection.removeAllRanges();
                        selection.addRange(newRange);
                      } catch (err) {
                        console.warn('Failed to restore cursor position:', err);
                      }
                    });
                  }
                }}
                dangerouslySetInnerHTML={{ __html: activeDocument.blocks[0].content }}
                  data-placeholder={placeholder || "Type '/' for commands"}
                ></div>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <p className="text-xl font-medium mb-2">No note selected</p>
            <p className="text-sm">Select a note or create a new one to get started</p>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-gray-800 rounded-lg shadow-xl py-1 min-w-[180px] z-50"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          {contextMenu.type === 'document' ? (
            <>
              <button
                className="w-full px-3 py-1.5 text-left hover:bg-[#3D3D3D] flex items-center gap-2"
                onClick={() => createNewDocument(contextMenu.documentId)}
              >
                <FaPlus className="w-3.5 h-3.5" />
                <span>Add subpage</span>
              </button>
              <button
                className="w-full px-3 py-1.5 text-left hover:bg-[#3D3D3D] flex items-center gap-2"
                onClick={() => duplicateDocument(contextMenu.documentId)}
              >
                <FaCopy className="w-3.5 h-3.5" />
                <span>Duplicate</span>
              </button>
              <button
                className="w-full px-3 py-1.5 text-left hover:bg-[#3D3D3D] flex items-center gap-2"
                onClick={() => toggleFavorite(contextMenu.documentId)}
              >
                <FaStar className="w-3.5 h-3.5" />
                <span>{favorites.includes(contextMenu.documentId) ? 'Remove from favorites' : 'Add to favorites'}</span>
              </button>
              <button
                className="w-full px-3 py-1.5 text-left hover:bg-[#3D3D3D] flex items-center gap-2"
                onClick={() => copyLink(contextMenu.documentId)}
              >
                <FaLink className="w-3.5 h-3.5" />
                <span>Copy link</span>
              </button>
              <div className="border-t border-gray-700 my-1" />
              <button
                className="w-full px-3 py-1.5 text-left hover:bg-gray-700 flex items-center gap-2 text-red-500"
                onClick={() => deleteDocument(contextMenu.documentId)}
              >
                <FaTrash className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </>
          ) : (
            <>
              <button
                className="w-full px-3 py-1.5 text-left hover:bg-[#3D3D3D] flex items-center gap-2"
                onClick={() => {
                  if (editorRef.current) {
                    document.execCommand('copy');
                  }
                }}
              >
                <FaCopy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </button>
              <button
                className="w-full px-3 py-1.5 text-left hover:bg-[#3D3D3D] flex items-center gap-2"
                onClick={() => {
                  if (editorRef.current) {
                    document.execCommand('paste');
                  }
                }}
              >
                <FaFileAlt className="w-3.5 h-3.5" />
                <span>Paste</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Command Menu */}
      {showCommandMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-32">
          <div className="bg-gray-800 rounded-lg shadow-xl w-96 overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <input
                type="text"
                placeholder="Type a command..."
                className="w-full bg-transparent text-sm focus:outline-none"
                autoFocus
              />
            </div>
            <div className="max-h-96 overflow-y-auto">
              {[
                { icon: 'T', label: 'Text', description: 'Just start writing with plain text' },
                { icon: 'H1', label: 'Heading 1', description: 'Big section heading' },
                { icon: 'H2', label: 'Heading 2', description: 'Medium section heading' },
                { icon: '•', label: 'Bullet List', description: 'Create a simple bullet list' },
                { icon: '1.', label: 'Numbered List', description: 'Create a list with numbering' },
                { icon: '[]', label: 'To-do List', description: 'Track tasks with a to-do list' },
                { icon: '{}', label: 'Code', description: 'Capture a code snippet' },
                { icon: '>', label: 'Quote', description: 'Capture a quote' },
                { icon: '---', label: 'Divider', description: 'Add a dividing line' },
                { icon: 'i', label: 'Callout', description: 'Add a colored callout block' },
                { icon: '▾', label: 'Toggle List', description: 'Expandable content' }
              ].map((item, index) => (
                <div
                  key={index}
                  className="px-4 py-3 flex items-center gap-3 hover:bg-gray-700 cursor-pointer"
                  onClick={() => setShowCommandMenu(false)}
                >
                  <div className="w-8 h-8 flex items-center justify-center bg-gray-600 rounded">
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-sm text-gray-400">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesEditor;
