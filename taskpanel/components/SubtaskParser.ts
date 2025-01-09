interface Subtask {
  id: number;
  title: string;
  description: string;
  estimatedTime: number;
  completed: boolean;
}

export const parseSubtasks = (jsonString: string): Subtask[] => {
  try {
    const subtasks: Subtask[] = JSON.parse(jsonString);
    
    // Validate the parsed subtasks
    if (!Array.isArray(subtasks)) {
      throw new Error('Subtasks must be an array');
    }

    return subtasks.map(subtask => {
      if (typeof subtask.id !== 'number') {
        throw new Error('Subtask id must be a number');
      }
      if (typeof subtask.title !== 'string') {
        throw new Error('Subtask title must be a string');
      }
      if (typeof subtask.description !== 'string') {
        throw new Error('Subtask description must be a string');
      }
       if (typeof subtask.estimatedTime !== 'number') {
        throw new Error('Subtask estimatedTime must be a number');
      }
      if (typeof subtask.completed !== 'boolean') {
         throw new Error('Subtask completed must be a boolean');
      }
      return {
        id: subtask.id,
        title: subtask.title,
        description: subtask.description,
        estimatedTime: subtask.estimatedTime,
        completed: subtask.completed
      }
    });
  } catch (error) {
    console.error('Error parsing subtasks:', error);
    return [];
  }
};