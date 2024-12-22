"use client";

import React, { useState } from 'react';
import { Task } from '../types/task';

interface TaskLabelsProps {
  task: Task;
  onUpdateTask: (task: Task) => void;
  className?: string;
}

const TaskLabels: React.FC<TaskLabelsProps> = ({
  task,
  onUpdateTask,
  className = '',
}) => {
  const [newTag, setNewTag] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const handleAddTag = () => {
    if (!newTag.trim()) return;

    const updatedTags = [...(task.tags || [])];
    if (!updatedTags.includes(newTag.trim())) {
      updatedTags.push(newTag.trim());

      onUpdateTask({
        ...task,
        tags: updatedTags,
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
    }

    setNewTag('');
    setIsAddingTag(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = (task.tags || []).filter(tag => tag !== tagToRemove);

    onUpdateTask({
      ...task,
      tags: updatedTags,
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

  const handleUpdateCategory = () => {
    if (!newCategory.trim()) return;

    onUpdateTask({
      ...task,
      category: newCategory.trim(),
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

    setNewCategory('');
    setIsAddingCategory(false);
  };

  const handleRemoveCategory = () => {
    onUpdateTask({
      ...task,
      category: undefined,
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

  const handleKeyPress = (
    e: React.KeyboardEvent,
    action: () => void
  ) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      action();
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tags Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-300">Tags</h4>
          <button
            onClick={() => setIsAddingTag(true)}
            className="text-sm text-indigo-400 hover:text-indigo-300"
          >
            Add Tag
          </button>
        </div>

        {isAddingTag ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, handleAddTag)}
              placeholder="Enter tag name"
              className="flex-1 px-3 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
            <button
              onClick={handleAddTag}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => setIsAddingTag(false)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {task.tags?.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-700 rounded-full text-sm group flex items-center gap-2"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </span>
            ))}
            {(!task.tags || task.tags.length === 0) && (
              <span className="text-sm text-gray-400">No tags added</span>
            )}
          </div>
        )}
      </div>

      {/* Category Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-300">Category</h4>
          <button
            onClick={() => setIsAddingCategory(true)}
            className="text-sm text-indigo-400 hover:text-indigo-300"
          >
            {task.category ? 'Change' : 'Add'} Category
          </button>
        </div>

        {isAddingCategory ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, handleUpdateCategory)}
              placeholder="Enter category name"
              className="flex-1 px-3 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
            <button
              onClick={handleUpdateCategory}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setIsAddingCategory(false)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {task.category ? (
              <>
                <span className="px-3 py-1 bg-gray-700 rounded-lg text-sm">
                  {task.category}
                </span>
                <button
                  onClick={handleRemoveCategory}
                  className="text-gray-400 hover:text-red-400"
                >
                  ×
                </button>
              </>
            ) : (
              <span className="text-sm text-gray-400">No category set</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskLabels;
