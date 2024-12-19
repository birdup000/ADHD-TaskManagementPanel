import { useState, useEffect } from 'react';
import { Workspace, Repository, WorkspaceSettings, Group } from '../types/workspace';

const STORAGE_KEY = 'workspaces';

export const useWorkspaces = () => {
const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<string | null>(null);

useEffect(() =>{
    // Load workspaces from localStorage on mount
    const storedWorkspaces = localStorage.getItem(STORAGE_KEY);
    if (storedWorkspaces) {
      const parsed = JSON.parse(storedWorkspaces);
      setWorkspaces(parsed);
      if (parsed.length >0) {
        setCurrentWorkspace(parsed.find((w: Workspace) =>w.isDefault)?.id || parsed[0].id);
      } else {
        // Create a default workspace if none exists
        const defaultWorkspace: Workspace = {
          id: crypto.randomUUID(),
          name: 'Default Workspace',
          description: 'Your default workspace',
          repositories: [],
          settings: {
            visibility: 'private',
            collaborators: [],
            lastAccessed: new Date(),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          isDefault: true,
          groups: [],
        };
        setWorkspaces([defaultWorkspace]);
        setCurrentWorkspace(defaultWorkspace.id);
      }
    } else {
      // Create a default workspace if none exists
      const defaultWorkspace: Workspace = {
        id: crypto.randomUUID(),
        name: 'Default Workspace',
        description: 'Your default workspace',
        repositories: [],
        settings: {
          visibility: 'private',
          collaborators: [],
          lastAccessed: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        isDefault: true,
        groups: [],
      };
      setWorkspaces([defaultWorkspace]);
      setCurrentWorkspace(defaultWorkspace.id);
    }
  }, []);

const getWorkspace = (workspaceId: string): Workspace | undefined =>{
    return workspaces.find((w) =>w.id === workspaceId);
  };

  const getGroup = (workspaceId: string, groupId: string): Group | undefined =>{
    const workspace = getWorkspace(workspaceId);
    if (!workspace) return undefined;
    return workspace.groups.find((g) =>g.id === groupId);
  };

  const createGroup = (workspaceId: string, groupName: string): Group =>{
    const newGroup: Group = {
      id: crypto.randomUUID(),
      name: groupName,
      repositoryIds: [],
    };

    setWorkspaces(
      workspaces.map((workspace) =>workspace.id === workspaceId
          ? { ...workspace, groups: [...workspace.groups, newGroup] }
          : workspace
      )
    );

    return newGroup;
  };

  const updateGroup = (
    workspaceId: string,
    groupId: string,
    updates: Partial<Group>
  ) =>{
    setWorkspaces(
      workspaces.map((workspace) =>workspace.id === workspaceId
          ? {
              ...workspace,
              groups: workspace.groups.map((group) =>group.id === groupId ? { ...group, ...updates } : group
              ),
            }
          : workspace
      )
    );
  };

  const deleteGroup = (workspaceId: string, groupId: string) =>{
    setWorkspaces(
      workspaces.map((workspace) =>workspace.id === workspaceId
          ? {
              ...workspace,
              groups: workspace.groups.filter((group) =>group.id !== groupId),
            }
          : workspace
      )
    );
  };

  useEffect(() => {
    // Save workspaces to localStorage when they change
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaces));
  }, [workspaces]);

const createWorkspace = (
    workspace: Omit<Workspace, "id" | "createdAt" | "updatedAt" | "groups">
  ) =>{
    const newWorkspace: Workspace = {
      ...workspace,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      groups: [],
      settings: {
        ...workspace.settings,
        lastAccessed: new Date(),
        visibility: workspace.settings?.visibility || "private",
      },
    };

    const defaultGroup: Group = {
      id: crypto.randomUUID(),
      name: "Default Group",
      repositoryIds: [],
    };

    newWorkspace.groups.push(defaultGroup);

    if (workspaces.length === 0) {
      newWorkspace.isDefault = true;
    }

    setWorkspaces([...workspaces, newWorkspace]);
    setCurrentWorkspace(newWorkspace.id);
    return newWorkspace;
  };

  const updateWorkspace = (id: string, updates: Partial<Workspace>) => {
    setWorkspaces(workspaces.map(workspace => 
      workspace.id === id 
        ? { ...workspace, ...updates, updatedAt: new Date() }
        : workspace
    ));
  };

const deleteWorkspace = (id: string) =>{
    const updatedWorkspaces = workspaces.filter(workspace =>workspace.id !== id);
    setWorkspaces(updatedWorkspaces);
    if (currentWorkspace === id) {
      setCurrentWorkspace(
        updatedWorkspaces.find(w =>w.isDefault)?.id ||
        updatedWorkspaces[0]?.id ||
        null
      );
    }
  };

const addRepository = (
    workspaceId: string,
    repository: Omit<Repository, "id" | "addedAt">,
    groupId?: string
  ) =>{
    const workspace = getWorkspace(workspaceId);
    if (!workspace) {
      throw new Error(`Workspace not found: ${workspaceId}`);
    }

    const newRepository: Repository = {
      ...repository,
      id: crypto.randomUUID(),
      addedAt: new Date(),
      groupId: groupId || workspace.groups[0]?.id, // Add to the specified group or the first group by default
    };

    updateWorkspace(workspaceId, {
      repositories: [...workspace.repositories, newRepository],
    });

    // Add the repository ID to the group's repositoryIds array
    if (groupId) {
      updateGroup(workspaceId, groupId, {
        repositoryIds: [
          ...(workspace.groups.find((g) =>g.id === groupId)?.repositoryIds ||
            []),
          newRepository.id,
        ],
      });
    }

    return newRepository;
  };

const removeRepository = (workspaceId: string, repositoryId: string) =>{
    const workspace = getWorkspace(workspaceId);
    if (!workspace) return;

    const repository = workspace.repositories.find((r) =>r.id === repositoryId);
    if (!repository) return;

    // Remove the repository from its group
    if (repository.groupId) {
      const group = getGroup(workspaceId, repository.groupId);
      if (group) {
        updateGroup(workspaceId, repository.groupId, {
          repositoryIds: group.repositoryIds.filter((id) =>id !== repositoryId),
        });
      }
    }

    // Remove the repository from the workspace
    updateWorkspace(workspaceId, {
      repositories: workspace.repositories.filter((r) =>r.id !== repositoryId),
    });
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
    createGroup,
    updateGroup,
    deleteGroup,
    getGroup,
  };
};
