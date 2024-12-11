"use client";

import React from 'react';

interface TaskCardProps {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  dueDate?: Date;
  assignees?: string[];
  tags?: string[];
}

const TaskCard: React.FC<TaskCardProps & { onClick?: () => void }> = ({
  title,
  description,
  priority,
  dueDate,
  tags = [],
  assignees = [],
  onClick,
}) => {
  const priorityColors = {
    low: 'bg-green-600',
    medium: 'bg-yellow-600',
    high: 'bg-red-600',
  };

  return (
    <div
      className="bg-[#333333] p-4 rounded-lg mb-4 hover:bg-[#383838] transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <span className={`${priorityColors[priority]} px-2 py-1 rounded text-xs text-white`}>
          {priority}
        </span>
      </div>
      <p className="text-gray-300 text-sm mb-3">{description}</p>
      {dueDate && (
        <div className="text-xs text-gray-400 mb-2">
          Due: {dueDate.toLocaleDateString()}
        </div>
      )}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="bg-indigo-600/30 text-indigo-200 px-2 py-0.5 rounded-full text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      {assignees.length > 0 && (
        <div className="flex -space-x-2">
          {assignees.map((assignee) => (
            <div
              key={assignee}
              className="w-6 h-6 rounded-full bg-gray-500 border-2 border-[#333333] flex items-center justify-center text-xs text-white"
              title={assignee}
            >
              {assignee[0]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskCard;