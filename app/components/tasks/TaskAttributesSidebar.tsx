"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Task } from '../../types/task';
import { Category } from '../../types/category'; // Assuming Category type
import { useCategories } from '../../hooks/useCategories'; // Assuming a hook for categories
import TaskAssignment from './TaskAssignment'; // Re-using the assignment component
import { debounce } from 'lodash';

interface TaskAttributesSidebarProps {
  task: Task;
  onUpdateTask: (updatedFields: Partial<Task>) => Promise<void>;
  onClose?: () => void; // Optional: For a close button on the sidebar itself (mobile)
}

// Helper to format date for input type="date"
const formatDateForInput = (dateString?: string): string => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toISOString().split('T')[0];
  } catch (e) {
    return ''; // Invalid date
  }
};

const TaskAttributesSidebar: React.FC<TaskAttributesSidebarProps> = ({ task, onUpdateTask, onClose }) => {
  const { categories, addCategory } = useCategories(); // Example, may need adjustment
  const [localTask, setLocalTask] = useState<Task>(task);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    setLocalTask(task);
  }, [task]);

  const debouncedUpdateTask = useCallback(
    debounce(async (updatedFields: Partial<Task>) => {
      await onUpdateTask(updatedFields);
    }, 750),
    [onUpdateTask]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedTask = { ...localTask, [name]: value };
    setLocalTask(updatedTask); // Optimistic local update
    debouncedUpdateTask({ [name]: value });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Ensure date is stored correctly, potentially as ISO string or just YYYY-MM-DD
    const updatedValue = value ? new Date(value).toISOString().split('T')[0] : undefined;
    const updatedTask = { ...localTask, [name]: updatedValue };
    setLocalTask(updatedTask);
    debouncedUpdateTask({ [name]: updatedValue });
  };


  const handleAddTag = () => {
    if (newTag.trim() && !localTask.tags?.includes(newTag.trim())) {
      const updatedTags = [...(localTask.tags || []), newTag.trim()];
      setLocalTask(prev => ({ ...prev, tags: updatedTags }));
      debouncedUpdateTask({ tags: updatedTags });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = localTask.tags?.filter(tag => tag !== tagToRemove);
    setLocalTask(prev => ({ ...prev, tags: updatedTags }));
    debouncedUpdateTask({ tags: updatedTags });
  };

  // Priority color mapping (example)
  const priorityClasses = (priority: 'low' | 'medium' | 'high' | undefined) => {
    switch (priority) {
      case 'high': return 'text-priority-high border-priority-high focus:border-priority-high focus:ring-priority-high/30';
      case 'medium': return 'text-priority-medium border-priority-medium focus:border-priority-medium focus:ring-priority-medium/30';
      case 'low': return 'text-priority-low border-priority-low focus:border-priority-low focus:ring-priority-low/30';
      default: return 'text-text-primary border-border-default focus:border-accent-primary';
    }
  };

  const statusClasses = (status: 'todo' | 'in_progress' | 'completed' | undefined) => {
    switch (status) {
      case 'completed': return 'text-priority-completed border-priority-completed focus:border-priority-completed focus:ring-priority-completed/30';
      case 'in_progress': return 'text-status-info border-status-info focus:border-status-info focus:ring-status-info/30';
      case 'todo': return 'text-text-secondary border-border-light focus:border-accent-primary';
      default: return 'text-text-primary border-border-default focus:border-accent-primary';
    }
  };


  return (
    <aside className="w-full md:w-[320px] lg:w-[360px] bg-bg-secondary border-l border-border-default h-full overflow-y-auto custom-scrollbar" role="complementary" aria-labelledby="task-attributes-heading">
      <div className="p-5 space-y-5"> {/* Adjusted padding and spacing */}
        <div className="flex items-center justify-between mb-2">
          <h2 id="task-attributes-heading" className="heading-secondary">
            Details
          </h2>
          {onClose && ( // Typically for mobile view where sidebar might overlay
            <button onClick={onClose} className="md:hidden p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-tertiary focus-ring" aria-label="Close details">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Assignee */}
        <TaskAssignment task={localTask} onUpdateTask={onUpdateTask} />

        {/* Due Date */}
        <div className="space-y-1.5">
          <label htmlFor="dueDate" className="label-secondary text-xs font-medium">Due Date</label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={formatDateForInput(localTask.dueDate)}
            onChange={handleDateChange}
            className="input-base w-full text-sm py-2" // Adjusted padding for date input
            aria-label="Task due date"
          />
        </div>

        {/* Priority */}
        <div className="space-y-1.5">
          <label htmlFor="priority" className="label-secondary text-xs font-medium">Priority</label>
          <select
            id="priority"
            name="priority"
            value={localTask.priority}
            onChange={handleChange}
            className={`input-base w-full text-sm py-2 ${priorityClasses(localTask.priority)}`}
            aria-label="Task priority"
          >
            <option value="low" className="text-priority-low">Low</option>
            <option value="medium" className="text-priority-medium">Medium</option>
            <option value="high" className="text-priority-high">High</option>
          </select>
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <label htmlFor="status" className="label-secondary text-xs font-medium">Status</label>
          <select
            id="status"
            name="status"
            value={localTask.status}
            onChange={handleChange}
            className={`input-base w-full text-sm py-2 ${statusClasses(localTask.status)}`}
            aria-label="Task status"
          >
            <option value="todo" className="text-text-secondary">To Do</option>
            <option value="in_progress" className="text-status-info">In Progress</option>
            <option value="completed" className="text-priority-completed">Completed</option>
          </select>
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label htmlFor="category" className="label-secondary text-xs font-medium">Category</label>
          <select
            id="category"
            name="category"
            value={localTask.category || ''}
            onChange={handleChange}
            className="input-base w-full text-sm py-2"
            aria-label="Task category"
          >
            <option value="" className="text-text-tertiary">No Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id} className="text-text-primary">{cat.name}</option>
            ))}
            {/* TODO: Option to add new category could be here, triggering a modal */}
          </select>
        </div>

        {/* Tags */}
        <div className="space-y-2.5">
            <label htmlFor="tags-input" className="label-secondary text-xs font-medium">Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2 empty:mb-0"> {/* Hide margin if no tags */}
                {localTask.tags?.map(tag => (
                    <span key={tag} className="flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full bg-accent-muted text-accent-primary text-xs font-medium border border-accent-primary/20 group">
                        {tag}
                        <button
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 text-accent-primary/60 hover:text-accent-primary opacity-70 group-hover:opacity-100 transition-opacity focus-ring rounded-full p-0.5"
                            aria-label={`Remove tag ${tag}`}
                            title={`Remove tag ${tag}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </span>
                ))}
            </div>
            <div className="flex gap-2">
                <input
                    type="text"
                    id="tags-input" // Changed ID to avoid conflict if 'tags' is used elsewhere
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag();}}}
                    placeholder="Add a tag..."
                    className="input-base w-full text-sm py-1.5 px-2.5 flex-1" // Adjusted padding
                    aria-label="New tag input"
                />
                <button onClick={handleAddTag} className="btn btn-secondary btn-sm text-xs py-1.5 px-3" aria-label="Add tag">Add</button>
            </div>
        </div>

        {/* Reminders (Placeholder) */}
        <div className="space-y-1.5">
            <label className="label-secondary text-xs font-medium">Reminders</label>
            <button className="btn btn-outline btn-sm w-full text-xs py-2 text-text-tertiary border-dashed hover:text-text-secondary hover:border-border-light">
                + Add Reminder (Soon)
            </button>
            {/* <p className="text-xs text-text-disabled italic text-center pt-1">Reminder functionality coming soon.</p> */}
        </div>

      </div>
    </aside>
  );
};

export default TaskAttributesSidebar;
