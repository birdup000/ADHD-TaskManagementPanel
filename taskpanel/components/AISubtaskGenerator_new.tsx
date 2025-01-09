"use client";

import { useState } from "react";

declare global {
  interface Window {
    puter: {
      ai: {
        chat: (
          prompt: string | { role: string; content: string }[],
          options?: {
            model?: string;
            stream?: boolean;
            testMode?: boolean;
            imageURL?: string;
            imageURLArray?: string[];
            messages?: { role: string; content: string }[];
          }
        ) => Promise<string>;
      };
    };
  }
}

const puter = typeof window !== 'undefined' ? window.puter : null;

if (!puter) {
 throw new Error("Puter is not available.");
}

export interface SubTask {
 : number;
  text: string;
  completed: boolean;
}

const GENERATE_SUBTASKS_PROMPT = `
Given the following task details:
Task Name: {taskName}
Description: {taskDescription}
Due Date: {dueDate}
Priority: {priority}
Additional Context: {additionalContext}

Generate a list of 3-5 subtasks that break down this main task into smaller, actionable items. Each subtask should be specific, measurable, and contribute to the completion of the main task. 

Format the response as a JSON array of objects, where each object has the following properties:
- id: A unique identifier (you can use numbers starting from 1)
- text: The description of the subtask
- completed: Boolean value (set to false for new subtasks)

Example format:
[
  {
    "id": 1,
    "text": "Subtask description here",
    "completed": false
  },
  ...
]
`;

export const useAISubtaskGenerator = () => {
  const [loading, set] = useState(false);
  const [error, setError] = useState<string | null>(null);

  generateSubtasks = async (
    taskName: string,
    taskDescription: string,
    dueDate: string,
    priority: string,
    additionalContext: string
  ): Promise<SubTask[]> => {
    setLoading(true);
    setError(null);

    try {
      const prompt = GENERATE_SUBTASKS_PROMPT
        .replace('{taskName}', taskName)
        .replace('{taskDescription}', taskDescription)
        .replace('{dueDate}', dueDate)
        .replace('{priority}', priority)
        .replace('{additionalContext}', additionalContext);

      const response = await puter.ai.chat(prompt, {
        model:gpt-4oi",
        stream: false,
        testMode: process.env.NODE_ENV === 'development',
      });

      try {
        const subtasks = JSON.parse(response) as SubTask[];
        if (!Array.isArray(subtasks)) {
          throw new Error("Invalid subtask format");
        }
        return subtasks;
      } catch (parseError) {
        throw new Error("Failed to parse AI response");
      }
    } catch (err) {
      setError("Failed to generate subtasks. Please try again.");
      console.error("AI Subtask Generation Error:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { generateSubtasks, loading, error };
};
