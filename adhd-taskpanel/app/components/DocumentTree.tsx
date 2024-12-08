import React from 'react';
import { Document } from '../types';
import { FaChevronDown, FaChevronRight, FaFileAlt, FaStar, FaEllipsisV } from 'react-icons/fa';

interface DocumentTreeProps {
  docs: Document[];
  level?: number;
  onDocumentClick: (doc: Document) => void;
  onContextMenu: (e: React.MouseEvent, docId: string, type: 'document' | 'editor') => void;
  activeDocumentId?: string;
  favorites: string[];
}

export const DocumentTree = React.memo(function DocumentTree({ 
  docs, 
  level = 0, 
  onDocumentClick, 
  onContextMenu, 
  activeDocumentId, 
  favorites 
}: DocumentTreeProps) {
  return (
    <div className="space-y-0.5">
      {docs.map(doc => (
        <div key={doc.id} style={{ paddingLeft: level * 12 + 'px' }}>
          <div
            className={`group flex items-center px-2 py-1 rounded-sm cursor-pointer hover:bg-gray-700 transition-colors duration-150 ${
              activeDocumentId === doc.id ? 'bg-gray-700' : ''
            }`}
            onClick={() => onDocumentClick(doc)}
            onContextMenu={(e) => onContextMenu(e, doc.id, 'document')}
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
                onContextMenu(e, doc.id, 'document');
              }}
            >
              <FaEllipsisV className="w-3 h-3 text-gray-400" />
            </button>
          </div>
          {doc.children.length > 0 && (
            <DocumentTree 
              docs={doc.children} 
              level={level + 1}
              onDocumentClick={onDocumentClick}
              onContextMenu={onContextMenu}
              activeDocumentId={activeDocumentId}
              favorites={favorites}
            />
          )}
        </div>
      ))}
    </div>
  );
});