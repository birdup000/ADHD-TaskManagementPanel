"use client";

import { useState } from "react";
import { loadPuter } from "../lib/puter";

/// <reference path="../types/puter.d.ts" />

export interface SubTask {
  id: number;
  title: string; // New property
  description: string; // New property
  estimatedTime: number; // New property
  completed: boolean;
}

const GENERATE_SINGLE_SUBTASK_PROMPT = `
Given the following task details:
Task Name: {taskName}
Description: {taskDescription}
Due Date: {dueDate}
Priority: {priority}
Additional Context: {additionalContext}

Previous Subtasks:
{previousSubtasks}

Generate the next subtask that breaks down this main task into smaller, actionable items. This subtask should be specific, measurable, and contribute to the completion of the main task.

The response MUST be a valid JSON object conforming to the following schema:
{
 "type": "object",
 "properties": {
   "id": { "type": "number", "description": "A unique identifier (starting from 1)" },
   "title": { "type": "string", "description": "The title of the subtask" },
   "description": { "type": "string", "description": "The description of the subtask" },
   "estimatedTime": { "type": "number", "description": "The estimated time to complete the subtask in minutes" },
   "completed": { "type": "boolean", "description": "Boolean value (always false for new subtasks)" }
 },
 "required": ["id", "title", "description", "estimatedTime", "completed"],
 "description": "The response MUST be a valid JSON object conforming to this schema. Do not include any additional text or formatting."
}
`;

const IDENTIFY_DEPENDENCIES_PROMPT = `
Given the following task details:
Task Name: {taskName}
Description: {taskDescription}

Identify any dependencies this task has on other tasks, projects, people, or resources. Please provide a brief explanation for each dependency.

Format the response as a string.
`;

export const useAISubtaskGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);

  const generateSubtasks = async (
    taskName: string,
    taskDescription: string,
    dueDate?: string,
    priority?: string,
    additionalContext?: string
  ): Promise<SubTask[] | undefined> => {
    setLoading(true);
    setError(null);

    let generatedSubtasks: SubTask[] = [];

    try {
      const puter = await loadPuter();

      for (let i = 0; i < 5; i++) {
        let retries = 0;
        const previousSubtasksContext = generatedSubtasks
          .map((subtask) => `- ${subtask.title}: ${subtask.description}`)
          .join('\n');

        const prompt = GENERATE_SINGLE_SUBTASK_PROMPT
          .replace('{taskName}', taskName)
          .replace('{taskDescription}', taskDescription)
          .replace('{dueDate}', dueDate || 'N/A')
          .replace('{priority}', priority || 'N/A')
          .replace('{additionalContext}', additionalContext || 'N/A')
          .replace('{previousSubtasks}', previousSubtasksContext);

        const response = await puter.ai.chat(prompt, {
          model: 'gpt-4o-mini',
          stream: false,
        });
        console.log('AI Subtask Response:', response);

        let parsedSubtask: SubTask | null = null;
        while (parsedSubtask === null && retries < 3) {
          try {
            parsedSubtask = JSON.parse(response) as SubTask;
            // Validate subtask
            if (
              typeof parsedSubtask.id !== 'number' ||
              typeof parsedSubtask.title !== 'string' ||
              typeof parsedSubtask.description !== 'string' ||
              typeof parsedSubtask.estimatedTime !== 'number' ||
              typeof parsedSubtask.completed !== 'boolean'
            ) {
              setError('Invalid subtask format from AI.');
              parsedSubtask = null;
            }
          } catch (parseError) {
            console.error('JSON Parse Error:', parseError, 'AI Response:', response);
            setError('Invalid JSON format from AI.');
            retries++;
          }
        }
        if (parsedSubtask) {
          generatedSubtasks.push(parsedSubtask);
        } else {
          console.error('Failed to parse subtask after multiple retries, skipping to next subtask.');
        }
      }
      setSubtasks(generatedSubtasks);
      return generatedSubtasks;
    } catch (err: any) {
      setError('Failed to generate subtasks. Please try again.');
      console.error('AI Subtask Generation Error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const identifyDependencies = async (
    taskName: string,
    taskDescription: string
  ): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const puter = await loadPuter();
      const prompt = IDENTIFY_DEPENDENCIES_PROMPT
        .replace('{taskName}', taskName)
        .replace('{taskDescription}', taskDescription);

      const response = await puter.ai.chat(prompt, {
        model: "gpt-4o-mini",
        stream: false,
      });
      console.log("AI Dependency Analysis Response:", response);
      return response;
    } catch (err: any) {
      setError("Failed to identify dependencies. Please try again.");
      console.error("AI Dependency Analysis Error:", err);
      return "Error identifying dependencies.";
    } finally {
      setLoading(false);
    }
  };

  return { generateSubtasks, identifyDependencies, loading, error, subtasks };
};
