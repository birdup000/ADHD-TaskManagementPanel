import { useState, useEffect } from 'react';
import { Workspace, Repository, WorkspaceSettings } from '../types/workspace';

const STORAGE_KEY = 'workspaces';

export const useWorkspaces = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<string | null>(null);

  useEffect(() => {
    // Load workspaces from localStorage on mount
    const storedWorkspaces = localStorage.getItem(STORAGE_KEY);
    if (storedWorkspaces) {
      const parsed = JSON.parse(storedWorkspaces);
      setWorkspaces(parsed);
      if (parsed.length > 0) {
        setCurrentWorkspace(parsed[0].id);
      }
    }
  }, []);

  useEffect(() => {
    // Save workspaces to localStorage when they change
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaces));
  }, [workspaces]);

  const createWorkspace = (workspace: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newWorkspace: Workspace = {
      ...workspace,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: {
        ...workspace.settings,
        lastAccessed: new Date(),
        visibility: workspace.settings?.visibility || 'private'
      },
    };
    setWorkspaces([...workspaces, newWorkspace]);
    return newWorkspace;
  };

  const updateWorkspace = (id: string, updates: Partial<Workspace>) => {
    setWorkspaces(workspaces.map(workspace => 
      workspace.id === id 
        ? { ...workspace, ...updates, updatedAt: new Date() }
        : workspace
    ));
  };

  const deleteWorkspace = (id: string) => {
    setWorkspaces(workspaces.filter(workspace => workspace.id !== id));
    if (currentWorkspace === id) {
      setCurrentWorkspace(workspaces[0]?.id ?? null);
    }
  };

  const addRepository = (workspaceId: string, repository: Omit<Repository, 'id' | 'addedAt'>) => {
    const newRepository: Repository = {
      ...repository,
      id: crypto.randomUUID(),
      addedAt: new Date(),
    };

    updateWorkspace(workspaceId, {
      repositories: [
        ...(workspaces.find(w => w.id === workspaceId)?.repositories || []),
        newRepository
      ]
    });

    return newRepository;
  };

  const removeRepository = (workspaceId: string, repositoryId: string) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (workspace) {
      updateWorkspace(workspaceId, {
        repositories: workspace.repositories.filter(r => r.id !== repositoryId)
      });
    }
  };

  const updateRepositorySettings = (
    workspaceId: string,
    repositoryId: string,
    settings: Partial<Repository>
  ) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (workspace) {
      updateWorkspace(workspaceId, {
        repositories: workspace.repositories.map(repo =>
          repo.id === repositoryId ? { ...repo, ...settings } : repo
        )
      });
    }
  };

  const updateWorkspaceSettings = (workspaceId: string, settings: Partial<WorkspaceSettings>) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (workspace) {
      updateWorkspace(workspaceId, {
        settings: { ...workspace.settings, ...settings }
      });
    }
  };

  return {
    workspaces,
    currentWorkspace,
    setCurrentWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    addRepository,
    removeRepository,
    updateRepositorySettings,
    updateWorkspaceSettings,
  };
};
