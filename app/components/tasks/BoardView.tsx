"use client";

import React from 'react';
import { Task } from '../../types/task';

interface BoardViewProps {
  tasks: Task[];
  onTaskSelect: (taskId: string) => void;
  onTaskStatusChange: (taskId: string, status: Task['status']) => void;
}

const BoardView: React.FC<BoardViewProps> = ({
  tasks,
  onTaskSelect,
  onTaskStatusChange,
}) => {
  const columns = [
    { id: 'todo', label: 'To Do' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
  ];

  const tasksByStatus = tasks.reduce((acc, task) => {
    if (!acc[task.status]) {
      acc[task.status] = [];
    }
    acc[task.status].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, status: Task['status']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    onTaskStatusChange(taskId, status);
  };

  return (
    <div className="h-full flex flex-col bg-bg-primary">
      {/* Board Header */}
      <div className="p-4 border-b border-border-default">
        <h2 className="text-xl font-semibold">Board View</h2>
      </div>

      {/* Board Columns */}
      <div className="flex-1 overflow-x-auto p-4">
        <div className="flex gap-4 h-full min-w-fit">
          {columns.map((column) => (
            <div
              key={column.id}
              className="flex-1 min-w-[300px] bg-bg-secondary rounded-lg p-4"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id as Task['status'])}
            >
              <h3 className="text-lg font-medium mb-4">{column.label}</h3>
              <div className="space-y-2">
                {(tasksByStatus[column.id] || []).map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={() => onTaskSelect(task.id)}
                    className="bg-bg-tertiary p-4 rounded-lg cursor-pointer hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        task.priority === 'high' ? 'bg-priority-high' :
                        task.priority === 'medium' ? 'bg-priority-medium' :
                        'bg-priority-low'
                      }`} />
                      <div className="flex-1">
                        <h4 className="font-medium mb-2">{task.title}</h4>
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {task.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 rounded-full bg-bg-secondary text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {task.dueDate && (
                          <div className="text-sm text-text-secondary">
                            Due {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BoardView;