import { Task } from '../types/task';

interface Change {
  field: string;
  oldValue: any;
  newValue: any;
}

export const findChanges = (oldTask: Task, newTask: Task): Change[] => {
  const changes: Change[] = [];
  const skipFields = ['updatedAt', 'version', 'activityLog', 'lastViewed'];

  Object.keys(newTask).forEach(key => {
    if (skipFields.includes(key)) return;
    
    const oldValue = oldTask[key];
    const newValue = newTask[key];
    
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes.push({
        field: key,
        oldValue,
        newValue
      });
    }
  });

  return changes;
};

export const mergeTaskChanges = (baseTask: Task, incomingTask: Task): Task => {
  // If versions are too far apart, require manual merge
  if (incomingTask.version < baseTask.version - 1) {
    throw new Error('Task versions too far apart. Manual merge required.');
  }

  // If incoming changes are newer, accept them
  if (incomingTask.version > baseTask.version) {
    return incomingTask;
  }

  // If versions are equal, merge changes
  return {
    ...baseTask,
    ...incomingTask,
    version: baseTask.version + 1,
    activityLog: [...baseTask.activityLog, ...incomingTask.activityLog],
    lastViewed: { ...baseTask.lastViewed, ...incomingTask.lastViewed }
  };
};
