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

const GENERATE_SUBTASKS_PROMPT = `
Given the following task details:
Task Name: {taskName}
Description: {taskDescription}
Due Date: {dueDate}
Priority: {priority}
Additional Context: {additionalContext}

Generate a list of 3-5 subtasks that break down this main task into smaller, actionable items. Each subtask should be specific, measurable, and contribute to the completion of the main task. 

Format the response as a JSON array of objects, where each object has the following properties:
- id: A unique identifier (you can use numbers starting from 1- text: The description of the subtask
- completed: Boolean value (set to false for new subtasks)
`;

export const useAISubtaskGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSubtasks = async (
    taskName: string,
    taskDescription: string,
    dueDate?: string,
    priority?: string,
    additionalContext?: string
  ): Promise<SubTask[]> => {
    setLoading(true);
    setError(null);

    try {
      const puter = await loadPuter();
      const prompt = GENERATE_SUBTASKS_PROMPT
        .replace('{taskName}', taskName)
        .replace('{taskDescription}', taskDescription)
        .replace('{dueDate}', dueDate || 'N/A')
        .replace('{priority}', priority || 'N/A')
        .replace('{additionalContext}', additionalContext || 'N/A');

      const response = await puter.ai.chat(prompt, {
        model: "gpt-4o-mini",
        stream: false,
      });

      // Parse the JSON response
      const subtasks = JSON.parse(response) as SubTask[];
      return subtasks;
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
