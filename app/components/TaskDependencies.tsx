"use client";

import React, { useState } from 'react';
import { Task } from '../types/task';

interface TaskDependenciesProps {
  task: Task;
  allTasks: Task[];
  onUpdateTask: (task: Task) => void;
  className?: string;
}

const TaskDependencies: React.FC<TaskDependenciesProps> = ({
  task,
  allTasks,
  onUpdateTask,
  className = '',
}) => {
  const [isAddingDependency, setIsAddingDependency] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');

  const availableTasks = allTasks.filter(t => 
    t.id !== task.id && 
    !task.dependsOn?.includes(t.id) &&
    !hasCyclicDependency(t.id)
  );

  function hasCyclicDependency(taskId: string, visited = new Set<string>()): boolean {
    if (visited.has(taskId)) return true;
    visited.add(taskId);

    const dependentTask = allTasks.find(t => t.id === taskId);
    if (!dependentTask?.dependsOn) return false;

    return dependentTask.dependsOn.some(depId => hasCyclicDependency(depId, new Set(visited)));
  }

  const handleAddDependency = () => {
    if (!selectedTaskId) return;

    const updatedDependencies = [...(task.dependsOn || []), selectedTaskId];

    onUpdateTask({
      ...task,
      dependsOn: updatedDependencies,
      activityLog: [
        ...task.activityLog,
        {
          id: Date.now().toString(),
          taskId: task.id,
          userId: 'current-user',
          action: 'updated',
          timestamp: new Date(),
        },
      ],
    });

    setSelectedTaskId('');
    setIsAddingDependency(false);
  };

  const handleRemoveDependency = (dependencyId: string) => {
    const updatedDependencies = (task.dependsOn || []).filter(id => id !== dependencyId);

    onUpdateTask({
      ...task,
      dependsOn: updatedDependencies,
      activityLog: [
        ...task.activityLog,
        {
          id: Date.now().toString(),
          taskId: task.id,
          userId: 'current-user',
          action: 'updated',
          timestamp: new Date(),
        },
      ],
    });
  };

  const getDependentTaskTitle = (taskId: string) => {
    const dependentTask = allTasks.find(t => t.id === taskId);
    return dependentTask?.title || 'Unknown Task';
  };

  const getDependentTaskStatus = (taskId: string): Task['status'] => {
    const dependentTask = allTasks.find(t => t.id === taskId);
    return dependentTask?.status || 'todo';
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'done':
        return 'bg-green-600';
      case 'in-progress':
        return 'bg-yellow-600';
      case 'todo':
        return 'bg-gray-600';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-300">Dependencies</h4>
        <button
          onClick={() => setIsAddingDependency(true)}
          className="text-sm text-indigo-400 hover:text-indigo-300"
          disabled={availableTasks.length === 0}
        >
          Add Dependency
        </button>
      </div>

      {isAddingDependency && (
        <div className="space-y-3 bg-gray-700 rounded-lg p-4">
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select a task...</option>
            {availableTasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsAddingDependency(false)}
              className="px-3 py-1 text-sm text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleAddDependency}
              disabled={!selectedTaskId}
              className="px-3 py-1 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 rounded-lg"
            >
              Add
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {task.dependsOn?.map((dependencyId) => (
          <div
            key={dependencyId}
            className="flex items-center justify-between p-3 bg-gray-700 rounded-lg group"
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(getDependentTaskStatus(dependencyId))}`} />
              <span className="text-sm">{getDependentTaskTitle(dependencyId)}</span>
            </div>
            <button
              onClick={() => handleRemoveDependency(dependencyId)}
              className="text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        ))}

        {(!task.dependsOn || task.dependsOn.length === 0) && (
          <div className="text-center py-6 text-gray-400">
            <p>No dependencies</p>
            <p className="text-sm">Add tasks that need to be completed first</p>
          </div>
        )}
      </div>

      {task.dependsOn && task.dependsOn.length > 0 && (
        <div className="mt-4">
          <div className="text-xs text-gray-400">
            Progress of Dependencies:
            <div className="mt-2 w-full bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-indigo-600 rounded-full h-1.5 transition-all duration-300"
                style={{
                  width: `${
                    (task.dependsOn.filter(id => 
                      getDependentTaskStatus(id) === 'done'
                    ).length / task.dependsOn.length) * 100
                  }%`
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDependencies;
