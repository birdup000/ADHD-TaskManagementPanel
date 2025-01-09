interface Subtask {
  id: number;
  text: string;
  completed: boolean;
}

export const parseSubtasks = (jsonString: string): Subtask[] => {
  try {
    const subtasks: Subtask[] = JSON.parse(jsonString);
    
    // Validate the parsed subtasks
    if (!Array.isArray(subtasks)) {
      throw new Error('Subtasks must be an array');
    }

    return subtasks.map(subtask => ({
      id: subtask.id || Date.now() + Math.random(),
      text: subtask.text || '',
      completed: subtask.completed || false
    }));
  } catch (error) {
    console.error('Error parsing subtasks:', error);
    return [];
  }
};