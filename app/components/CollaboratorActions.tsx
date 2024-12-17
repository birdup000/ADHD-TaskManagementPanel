import React, { useState } from 'react';
import { Collaborator } from '../types/collaboration';

interface CollaboratorActionsProps {
  collaborator: Collaborator;
  canManageCollaborators: boolean;
  onUpdateRole: (role: Collaborator['role']) => void;
  onRemove: () => void;
}

const CollaboratorActions: React.FC<CollaboratorActionsProps> = ({
  collaborator,
  canManageCollaborators,
  onUpdateRole,
  onRemove,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  if (!canManageCollaborators) return null;

  return (
    <div className="relative ml-2">
      <button
        onClick={() => setShowRoleMenu(!showRoleMenu)}
        className="text-gray-400 hover:text-white"
      >
        ⋮
      </button>
      {showRoleMenu && (
        <div className="absolute right-0 mt-1 w-48 bg-[#333333] rounded-md shadow-lg z-50">
          <div className="py-1">
            <button
              onClick={() => {
                onUpdateRole('viewer');
                setShowRoleMenu(false);
              }}
              className={`block w-full text-left px-4 py-2 text-sm ${
                collaborator.role === 'viewer'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-300 hover:bg-[#444444]'
              }`}
            >
              👀 Viewer
            </button>
            <button
              onClick={() => {
                onUpdateRole('editor');
                setShowRoleMenu(false);
              }}
              className={`block w-full text-left px-4 py-2 text-sm ${
                collaborator.role === 'editor'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-300 hover:bg-[#444444]'
              }`}
            >
              ✏️ Editor
            </button>
            <button
              onClick={() => {
                onUpdateRole('owner');
                setShowRoleMenu(false);
              }}
              className={`block w-full text-left px-4 py-2 text-sm ${
                collaborator.role === 'owner'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-300 hover:bg-[#444444]'
              }`}
            >
              👑 Owner
            </button>
            <div className="border-t border-gray-700 my-1"></div>
            <button
              onClick={() => {
                onRemove();
                setShowRoleMenu(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#444444]"
            >
              🗑 Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaboratorActions;