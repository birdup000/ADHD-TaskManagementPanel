import React from 'react';
import { useWorkspaces } from '../hooks/useWorkspaces';
import { Workspace, Repository } from '../types/workspace';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export const WorkspacePanel: React.FC = () => {
  const {
    workspaces,
    currentWorkspace,
    setCurrentWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    addRepository,
    removeRepository,
    updateRepositorySettings,
  } = useWorkspaces();

  const [showNewWorkspace, setShowNewWorkspace] = React.useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = React.useState('');
  const [showNewRepo, setShowNewRepo] = React.useState(false);
  const [newRepoData, setNewRepoData] = React.useState({
    name: '',
    url: '',
    description: '',
    defaultBranch: 'main'
  });

  const handleCreateWorkspace = () => {
    if (newWorkspaceName.trim()) {
      createWorkspace({
        name: newWorkspaceName,
        description: '',
        repositories: [],
        settings: {}
      });
      setNewWorkspaceName('');
      setShowNewWorkspace(false);
    }
  };

  const handleAddRepository = () => {
    if (currentWorkspace && newRepoData.name && newRepoData.url) {
      addRepository(currentWorkspace, newRepoData);
      setNewRepoData({
        name: '',
        url: '',
        description: '',
        defaultBranch: 'main'
      });
      setShowNewRepo(false);
    }
  };

  const currentWorkspaceData = workspaces.find(w => w.id === currentWorkspace);

  return (
    <div className="bg-[#2A2A2A] rounded-lg p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Workspaces</h2>
        <button
          onClick={() => setShowNewWorkspace(true)}
          className="px-3 py-1.5 rounded text-sm bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          New Workspace
        </button>
      </div>

      <div className="space-y-4">
        {workspaces.map(workspace => (
          <div
            key={workspace.id}
            className={`p-4 rounded-lg ${
              workspace.id === currentWorkspace
                ? 'bg-indigo-600/20 border border-indigo-500/30'
                : 'bg-[#333333] hover:bg-[#3A3A3A]'
            } transition-colors cursor-pointer`}
            onClick={() => setCurrentWorkspace(workspace.id)}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium">{workspace.name}</h3>
                {workspace.description && (
                  <p className="text-sm text-gray-400">{workspace.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateWorkspace(workspace.id, {
                      name: prompt('New workspace name:', workspace.name) || workspace.name
                    });
                  }}
                  className="p-1 rounded hover:bg-[#444444] transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Are you sure you want to delete this workspace?')) {
                      deleteWorkspace(workspace.id);
                    }
                  }}
                  className="p-1 rounded hover:bg-[#444444] transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              {workspace.repositories.length} repositories
            </div>
          </div>
        ))}
      </div>

      {currentWorkspaceData && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Repositories</h3>
            <button
              onClick={() => setShowNewRepo(true)}
              className="px-3 py-1.5 rounded text-sm bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              Add Repository
            </button>
          </div>
          <div className="space-y-4">
            {currentWorkspaceData.repositories.map(repo => (
              <div
                key={repo.id}
                className="p-4 rounded-lg bg-[#333333] hover:bg-[#3A3A3A] transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{repo.name}</h4>
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-400 hover:text-indigo-300"
                    >
                      {repo.url}
                    </a>
                    {repo.description && (
                      <p className="text-sm text-gray-400 mt-1">{repo.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const newSettings = prompt('Update repository settings:', JSON.stringify(repo.settings || {}));
                        if (newSettings) {
                          try {
                            updateRepositorySettings(
                              currentWorkspaceData.id,
                              repo.id,
                              { settings: JSON.parse(newSettings) }
                            );
                          } catch (e) {
                            alert('Invalid JSON format');
                          }
                        }
                      }}
                      className="p-1 rounded hover:bg-[#444444] transition-colors"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to remove this repository?')) {
                          removeRepository(currentWorkspaceData.id, repo.id);
                        }
                      }}
                      className="p-1 rounded hover:bg-[#444444] transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Workspace Modal */}
      {showNewWorkspace && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#212121] p-6 rounded-lg w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">Create New Workspace</h2>
            <input
              type="text"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              placeholder="Workspace name"
              className="w-full p-2 rounded bg-[#333333] text-white mb-4"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowNewWorkspace(false)}
                className="px-4 py-2 rounded bg-[#444444] hover:bg-[#555555] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWorkspace}
                className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Repository Modal */}
      {showNewRepo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#212121] p-6 rounded-lg w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">Add New Repository</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={newRepoData.name}
                onChange={(e) => setNewRepoData({ ...newRepoData, name: e.target.value })}
                placeholder="Repository name"
                className="w-full p-2 rounded bg-[#333333] text-white"
              />
              <input
                type="text"
                value={newRepoData.url}
                onChange={(e) => setNewRepoData({ ...newRepoData, url: e.target.value })}
                placeholder="Repository URL"
                className="w-full p-2 rounded bg-[#333333] text-white"
              />
              <input
                type="text"
                value={newRepoData.description}
                onChange={(e) => setNewRepoData({ ...newRepoData, description: e.target.value })}
                placeholder="Description (optional)"
                className="w-full p-2 rounded bg-[#333333] text-white"
              />
              <input
                type="text"
                value={newRepoData.defaultBranch}
                onChange={(e) => setNewRepoData({ ...newRepoData, defaultBranch: e.target.value })}
                placeholder="Default branch"
                className="w-full p-2 rounded bg-[#333333] text-white"
              />
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowNewRepo(false)}
                className="px-4 py-2 rounded bg-[#444444] hover:bg-[#555555] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRepository}
                className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};