export interface Workspace {
  id: string;
  name: string;
  description?: string;
  repositories: Repository[];
  settings: WorkspaceSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface Repository {
  id: string;
  name: string;
  url: string;
  description?: string;
  defaultBranch: string;
  settings?: RepositorySettings;
  addedAt: Date;
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
