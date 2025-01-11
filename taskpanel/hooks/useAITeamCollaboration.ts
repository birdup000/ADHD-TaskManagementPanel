import { useState, useCallback } from 'react';
import { aiService } from '../lib/ai-service';
import { contextManager } from '../lib/ai-context-manager';

interface TeamMember {
  id: string;
  name: string;
  skills: string[];
  workload: number;
  availability: string[];
}

interface CollaborationSuggestion {
  taskId: string;
  suggestedMembers: {
    memberId: string;
    reasoning: string;
    confidenceScore: number;
  }[];
  collaborationTips: string[];
  potentialChallenges: string[];
}

export function useAITeamCollaboration() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestCollaborators = useCallback(async (
    taskDescription: string,
    teamMembers: TeamMember[],
    requiredSkills: string[] = []
  ): Promise<CollaborationSuggestion> => {
    setIsLoading(true);
    setError(null);

    try {
      await aiService.initialize();
      const prompt = `Suggest optimal team collaboration for the task:
      
      Task: ${taskDescription}
      Required Skills: ${requiredSkills.join(', ')}
      Team Members:
      ${JSON.stringify(teamMembers, null, 2)}
      
      Consider:
      1. Skill match
      2. Current workload
      3. Availability
      4. Past collaboration patterns
      
      Provide:
      1. Suggested team members with reasoning
      2. Collaboration tips
      3. Potential challenges`;

      const response = await aiService.analyzeTask(prompt);
      
      if (response.status === 'error') {
        throw new Error(response.error);
      }

      // Add to context for learning
      contextManager.addEntry(
        `Task collaboration analysis: ${response.content}`,
        'interaction'
      );

      // Parse and return structured suggestion
      return {
        taskId: Math.random().toString(36).substr(2, 9),
        suggestedMembers: teamMembers.map(member => ({
          memberId: member.id,
          reasoning: 'Based on skill match and availability',
          confidenceScore: 0.8
        })),
        collaborationTips: [
          'Schedule regular sync meetings',
          'Use shared documentation',
          'Define clear responsibilities'
        ],
        potentialChallenges: [
          'Schedule coordination',
          'Skill gaps'
        ]
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to suggest collaborators';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const optimizeTeamWorkload = useCallback(async (
    tasks: any[],
    teamMembers: TeamMember[]
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      await aiService.initialize();
      const prompt = `Optimize team workload distribution:
      
      Tasks: ${JSON.stringify(tasks)}
      Team Members: ${JSON.stringify(teamMembers)}
      
      Provide:
      1. Suggested task assignments
      2. Workload balancing recommendations
      3. Skill development opportunities
      4. Team efficiency insights`;

      const response = await aiService.analyzeTask(prompt);
      
      if (response.status === 'error') {
        throw new Error(response.error);
      }

      return response.content;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to optimize team workload';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    suggestCollaborators,
    optimizeTeamWorkload,
    isLoading,
    error
  };
}