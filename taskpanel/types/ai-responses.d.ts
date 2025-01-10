export interface AIScheduleResponse {
  schedule: Array<{
    taskId: string;
    suggestedStartDate: string;
    suggestedEndDate: string;
    rationale: string;
  }>;
  conflicts: Array<{
    taskIds: string[];
    reason: string;
    suggestion: string;
  }>;
  recommendations: string[];
}

export interface AISubtaskResponse {
  id: number;
  title: string;
  description: string;
  estimatedTime: number;
  completed: boolean;
}

export interface AIDependencyAnalysisResponse {
  progress: number;
  blockers: string[];
  nextSteps: string[];
}