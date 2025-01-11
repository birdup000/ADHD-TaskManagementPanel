"use client";

import { useState } from "react";
import { loadPuter } from "../lib/puter";
import { SubTask } from "../types/SubTask";
import { taskTemplates, taskTips, makeTaskConcrete } from "../lib/task-templates";
import { GENERATE_SINGLE_SUBTASK_PROMPT } from "../lib/prompt-templates";

/// <reference path="../types/puter.d.ts" />

The response MUST be a valid JSON object conforming to this schema.
`;

// Dependencies Prompt
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

        // Make task more concrete and get context from templates
        const concreteTaskName = makeTaskConcrete(taskName);
        const concreteDescription = makeTaskConcrete(taskDescription);
        const allTemplates = Object.values(taskTemplates).flat();
        const allTips = Object.values(taskTips).flat();

        // Make task more concrete and add context
        const concreteTaskName = makeTaskConcrete(taskName);
        const concreteDescription = makeTaskConcrete(taskDescription);
        const allTemplates = Object.values(taskTemplates).flat();
        const allTips = Object.values(taskTips).flat();

        const prompt = GENERATE_SINGLE_SUBTASK_PROMPT
          .replace('{taskName}', concreteTaskName)
          .replace('{taskDescription}', concreteDescription)
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
            parsedSubtask = JSON.parse(response.toString()) as SubTask;
            // Validate subtask
            if (
              typeof parsedSubtask.id !== 'number' ||
              typeof parsedSubtask.title !== 'string' ||
              typeof parsedSubtask.description !== 'string' ||
              typeof parsedSubtask.estimatedTime !== 'number' ||
              typeof parsedSubtask.completed !== 'boolean' ||
              !Array.isArray(parsedSubtask.tips) ||
              !Array.isArray(parsedSubtask.prerequisites)
            ) {
              setError('Invalid subtask format from AI. Please try again.');
              parsedSubtask = null;
            }
          } catch (parseError) {
            console.error('JSON Parse Error:', parseError, 'AI Response:', response);
            setError('Invalid JSON format from AI. Please try again.');
            retries++;
          }
        }
        if (parsedSubtask) {
          generatedSubtasks.push(parsedSubtask);
        } else {
          console.error('Failed to parse subtask after multiple retries, skipping to next subtask.');
          setError('Failed to parse subtask after multiple retries. Please try again.');
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
      return response.toString();
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
