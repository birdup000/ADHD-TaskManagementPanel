import { useState, useEffect } from 'react';
import { loadPuter } from "../lib/puter";

const CHECK_IN_PROMPT = `
Given the following task details:
Task Title: {taskTitle}
Description: {taskDescription}
Due Date: {dueDate}
Last Update: {lastUpdate}
Progress: {progress}%

Generate a natural follow-up question to check on the task's progress. Consider:
1. The time elapsed since the last update
2. The current progress percentage
3. The proximity to the due date
4. Any previously identified blockers

Format the response as a conversational question that encourages a detailed update.
`;

export const useAITaskCheckin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateCheckinPrompt = async (
    taskTitle: string,
    taskDescription: string,
    dueDate: Date | undefined,
    lastUpdate: Date,
    progress: number
  ): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      const puter = await loadPuter();
      const prompt = CHECK_IN_PROMPT
        .replace('{taskTitle}', taskTitle)
        .replace('{taskDescription}', taskDescription)
        .replace('{dueDate}', dueDate ? dueDate.toISOString() : 'Not set')
        .replace('{lastUpdate}', lastUpdate.toISOString())
        .replace('{progress}', progress.toString());

      const response = await puter.ai.chat(prompt, {
        model: 'gpt-4o-mini',
        stream: false,
      });

      return response;
    } catch (err: any) {
      setError('Failed to generate check-in prompt. Please try again.');
      console.error('AI Check-in Generation Error:', err);
      return 'How is the task progressing?';
    } finally {
      setLoading(false);
    }
  };

  const analyzeResponse = async (
    taskTitle: string,
    response: string
  ): Promise<{
    progress: number;
    blockers: string[];
    nextSteps: string[];
  }> => {
    try {
      const puter = await loadPuter();
      const analysisPrompt = `
        Analyze the following task update response:
        Task: ${taskTitle}
        Update: ${response}

        Extract and provide the following in JSON format:
        {
          "progress": number (0-100),
          "blockers": string[],
          "nextSteps": string[]
        }
      `;

      const analysisResponse = await puter.ai.chat(analysisPrompt, {
        model: 'gpt-4o-mini',
        stream: false,
      });

      return JSON.parse(analysisResponse);
    } catch (err) {
      console.error('Response Analysis Error:', err);
      return {
        progress: 0,
        blockers: [],
        nextSteps: [],
      };
    }
  };

  return {
    generateCheckinPrompt,
    analyzeResponse,
    loading,
    error,
  };
};

export default function AITaskCheckin({ task, onProgressUpdate }: {
  task: {
    id: string;
    title: string;
    description: string;
    dueDate?: Date;
    lastUpdate: Date;
    progress: number;
  };
  onProgressUpdate: (progress: number, blockers: string[], nextSteps: string[]) => void;
}) {
  const { generateCheckinPrompt, analyzeResponse, loading, error } = useAITaskCheckin();
  const [checkInMessage, setCheckInMessage] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    const generateInitialPrompt = async () => {
      const prompt = await generateCheckinPrompt(
        task.title,
        task.description,
        task.dueDate,
        task.lastUpdate,
        task.progress
      );
      setCheckInMessage(prompt);
    };
    generateInitialPrompt();
  }, [task]);

  const handleResponseSubmit = async () => {
    if (!response.trim()) return;

    const analysis = await analyzeResponse(task.title, response);
    onProgressUpdate(analysis.progress, analysis.blockers, analysis.nextSteps);
    setShowInput(false);
    setResponse('');
  };

  return (
    <div className="space-y-4">
      {checkInMessage && (
        <div className="p-4 bg-accent/10 rounded-lg">
          <p className="text-sm text-foreground">{checkInMessage}</p>
          {!showInput && (
            <button
              onClick={() => setShowInput(true)}
              className="mt-2 text-sm text-accent hover:text-accent/80"
            >
              Respond
            </button>
          )}
        </div>
      )}

      {showInput && (
        <div className="space-y-2">
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Type your update here..."
            className="w-full h-24 p-2 bg-background border border-border rounded-lg resize-none"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowInput(false)}
              className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={handleResponseSubmit}
              disabled={loading}
              className="px-3 py-1 text-sm bg-accent text-white rounded-lg hover:bg-accent/80"
            >
              Submit Update
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}