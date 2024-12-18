export interface Workspace {
  id: string;
  name: string;
  description?: string;
  repositories: Repository[];
  groups: Group[];
  settings: WorkspaceSettings;
  createdAt: Date;
  updatedAt: Date;
  isDefault?: boolean;
}

export interface Group {
  id: string;
  name: string;
  repositoryIds: string[]; // Array to store IDs of repositories in the group
}

export interface Repository {
  id: string;
  name: string;
  url: string;
  description?: string;
  defaultBranch: string;
  settings?: RepositorySettings;
  addedAt: Date;
  groupId?: string; // Optional group ID for the repository
}

export interface WorkspaceSettings {
  defaultBranch?: string;
  buildConfiguration?: BuildConfig;
  deploymentTargets?: DeploymentTarget[];
  collaborators?: string[];
  description?: string;
  visibility?: 'private' | 'public' | 'team';
  lastAccessed?: Date;
}

export interface RepositorySettings {
  buildConfiguration?: BuildConfig;
  deploymentTargets?: DeploymentTarget[];
}

export interface BuildConfig {
  script: string;
  environment: Record<string, string>;
}

export interface DeploymentTarget {
  name: string;
  type: 'development' | 'staging' | 'production';
  url: string;
  settings: Record<string, string>;
}
