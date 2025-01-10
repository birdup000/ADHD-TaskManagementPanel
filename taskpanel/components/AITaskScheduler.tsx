import { useState } from 'react';
import { loadPuter } from '../lib/puter';
import { Task } from './TaskPanel';
import { SubTask } from './TaskDetailsDrawer';

const SCHEDULE_ANALYSIS_PROMPT = `
Given the following tasks and their details:
{tasks}

Please analyze the tasks and suggest an optimal schedule considering:
1. Task priorities
2. Due dates
3. Dependencies
4. Time estimates
5. Current progress


Respond with a valid JSON object in the following format, without any markdown formatting:
{
    {
      "taskId": string,
      "suggestedStartDate": string (ISO date),
      "suggestedEndDate": string (ISO date),
      "rationale": string
    }
  ],
  "conflicts": [
    {
      "taskIds": string[],
      "reason": string,
      "suggestion": string
    }
  ],
  "recommendations": string[]
}
`;

export const useAITaskScheduler = (): {
  generateSchedule: (tasks: Task[]) => Promise<{
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
  }>;
  loading: boolean;
  error: string | null;
} => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSchedule = async (tasks: Task[]): Promise<{
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
  }> => {
    setLoading(true);
    setError(null);

    try {
      const puter = await loadPuter();
      const tasksContext = tasks.map(task => `
        Task ID: ${task.id}
        Title: ${task.title}
        Description: ${task.description}
        Priority: ${task.priority}
        Due Date: ${task.dueDate?.toISOString() || 'Not set'}
        Progress: ${task.subtasks ?
          Math.round((task.subtasks.filter((st: SubTask) => st.completed).length / task.subtasks.length) * 100) : 0}%
        Completed: ${task.completed}
      `).join('\n\n');

      const prompt = SCHEDULE_ANALYSIS_PROMPT.replace('{tasks}', tasksContext);
      const response = await puter.ai.chat(prompt, {
        model: 'gpt-4o-mini',
        stream: false,
      });

      try {
        return JSON.parse(response.toString());
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        throw new Error('Failed to parse schedule data from AI response');
      }
    } catch (err) {
      setError('Failed to generate schedule. Please try again.');
      console.error('AI Schedule Generation Error:', err);
      return {
        schedule: [],
        conflicts: [],
        recommendations: []
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    generateSchedule,
    loading,
    error
  };
};

interface AITaskSchedulerProps {
  tasks: Task[];
  onScheduleUpdate: (schedule: {
    taskId: string;
    suggestedStartDate: string;
    suggestedEndDate: string;
  }[]) => void;
}

export function AITaskScheduler({ tasks, onScheduleUpdate }: AITaskSchedulerProps) {
  const { generateSchedule, loading, error } = useAITaskScheduler();
  const [schedule, setSchedule] = useState<{
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
  } | null>(null);

  const handleGenerateSchedule = async () => {
    console.log('Tasks before generateSchedule:', tasks);
    const newSchedule = await generateSchedule(tasks);
    console.log('New Schedule:', newSchedule);
    setSchedule(newSchedule);
    onScheduleUpdate(newSchedule.schedule);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">AI Task Scheduler</h3>
        <button
          onClick={handleGenerateSchedule}
          disabled={loading || tasks.length === 0}
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Generate Schedule'}
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {schedule && (
        <div className="space-y-4">
          <pre>{JSON.stringify(schedule, null, 2)}</pre>
          <div className="space-y-2">
            <h4 className="font-medium">Suggested Schedule</h4>
            {schedule.schedule.map((item) => (
              <div key={item.taskId} className="p-3 bg-background/50 rounded-lg border border-border/20">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">
                      {tasks.find(t => t.id === item.taskId)?.title}
                    </div>
                    <div className="text-sm text-muted-foreground">{item.rationale}</div>
                  </div>
                  <div className="text-sm text-right">
                    <div>Start: {new Date(item.suggestedStartDate).toLocaleDateString()}</div>
                    <div>End: {new Date(item.suggestedEndDate).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {schedule.conflicts.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Conflicts</h4>
              {schedule.conflicts.map((conflict, index) => (
                <div key={index} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="font-medium text-red-700 dark:text-red-300">
                    {conflict.taskIds.map(id => tasks.find(t => t.id === id)?.title).join(', ')}
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-400">{conflict.reason}</div>
                  <div className="text-sm text-red-500 dark:text-red-300 mt-1">
                    Suggestion: {conflict.suggestion}
                  </div>
                </div>
              ))}
            </div>
          )}

          {schedule.recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Recommendations</h4>
              <ul className="list-disc list-inside space-y-1">
                {schedule.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-muted-foreground">{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}