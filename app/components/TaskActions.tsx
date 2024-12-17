"use client";

import React from 'react';
import { Task } from '../types/task';

interface TaskActionsProps {
  task: Task;
  onUpdateTask: (task: Task) => void;
  onDelete: () => void;
}

const TaskActions: React.FC<TaskActionsProps> = ({ task, onUpdateTask, onDelete }) => {
  const [showMenu, setShowMenu] = React.useState(false);

  const handleAddSubtask = () => {
    const title = prompt('Enter subtask title:');
    if (title) {
      const subtask = {
        id: crypto.randomUUID(),
        title,
        completed: false,
        createdAt: new Date()
      };
      onUpdateTask({
        ...task,
        subtasks: [...(task.subtasks || []), subtask]
      });
    }
  };

  const menuItems = [
    {
      label: task.status === 'todo' ? 'Start Task' : task.status === 'in-progress' ? 'Complete Task' : 'Reopen Task',
      icon: task.status === 'done' ? '✓' : task.status === 'in-progress' ? '►' : '○',
      onClick: () => {
        const nextStatus = task.status === 'todo' 
          ? 'in-progress' 
          : task.status === 'in-progress' 
            ? 'done' 
            : 'todo';
        onUpdateTask({ ...task, status: nextStatus });
      }
    },
    {
      label: 'Set Priority',
      icon: '⚡',
      children: [
        {
          label: 'High',
          icon: '🔴',
          onClick: () => onUpdateTask({ ...task, priority: 'high' })
        },
        {
          label: 'Medium',
          icon: '🟡',
          onClick: () => onUpdateTask({ ...task, priority: 'medium' })
        },
        {
          label: 'Low',
          icon: '🟢',
          onClick: () => onUpdateTask({ ...task, priority: 'low' })
        }
      ]
    },
    {
      label: 'Set Category',
      icon: '📑',
      onClick: () => {
        const category = prompt('Enter category name:');
        if (category) {
          onUpdateTask({ ...task, category });
        }
      }
    },
    {
      label: 'Add Subtask',
      icon: '📝',
      onClick: handleAddSubtask
    },
    {
      label: 'Make Recurring',
      icon: '🔄',
      children: [
        {
          label: 'Daily',
          onClick: () => onUpdateTask({
            ...task,
            recurring: { frequency: 'daily' }
          })
        },
        {
          label: 'Weekly',
          onClick: () => onUpdateTask({
            ...task,
            recurring: { frequency: 'weekly' }
          })
        },
        {
          label: 'Monthly',
          onClick: () => onUpdateTask({
            ...task,
            recurring: { frequency: 'monthly' }
          })
        }
      ]
    },
    {
      label: 'Delete Task',
      icon: '🗑',
      onClick: onDelete,
      className: 'text-red-400 hover:bg-red-400/10'
    }
  ];

  return (
    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <div className="relative">
        <button
          className="p-1 hover:bg-white/10 rounded"
          onClick={(e) => {
            e.stopPropagation();
            // Toggle menu
          }}
        >
          ⋮
        </button>
        <div className={`absolute right-0 mt-1 w-48 bg-[#212121] rounded-lg shadow-lg overflow-hidden transform scale-95 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-hover:scale-100 transition-all duration-200`}>
          {menuItems.map((item) => (
            <div key={item.label}>
              {item.children ? (
                <div className="relative group/submenu">
                  <button
                    className="w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-white/5 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </span>
                    <span>▶</span>
                  </button>
                  <div className="absolute left-full top-0 w-48 bg-[#212121] rounded-lg shadow-lg overflow-hidden opacity-0 pointer-events-none group-hover/submenu:opacity-100 group-hover/submenu:pointer-events-auto">
                    {item.children.map((child) => (
                      <button
                        key={child.label}
                        onClick={child.onClick}
                        className="w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-white/5 flex items-center gap-2"
                      >
                        <span>{child.icon}</span>
                        <span>{child.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <button
                  onClick={item.onClick}
                  className={`w-full px-4 py-2 text-sm text-left hover:bg-white/5 flex items-center gap-2 ${item.className || 'text-gray-300'}`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskActions;