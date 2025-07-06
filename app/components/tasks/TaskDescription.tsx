"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Task } from '../../types/task';
import { debounce } from 'lodash';

interface TaskDescriptionProps {
  task: Task;
  onUpdateTask: (updatedFields: Partial<Task>) => Promise<void>;
}

const TaskDescription: React.FC<TaskDescriptionProps> = ({ task, onUpdateTask }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(task.description || '');

  useEffect(() => {
    setDescription(task.description || '');
  }, [task.description]);

  const debouncedUpdateDescription = useCallback(
    debounce(async (newDescription: string) => {
      await onUpdateTask({ description: newDescription });
    }, 750), // Adjusted debounce time for description
    [onUpdateTask]
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    debouncedUpdateDescription(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    // Ensure final update if debounced function hasn't fired and description has changed
    if (description !== task.description) {
        debouncedUpdateDescription.flush();
    }
  };

  return (
    <section aria-labelledby="task-description-heading" className="space-y-3 py-4 md:py-6">
      <div className="flex items-center justify-between">
        <h3 id="task-description-heading" className="heading-tertiary text-text-primary">
          Description
        </h3>
        {/* Optional: Edit button if not using click-to-edit on the text itself */}
        {!isEditing && (
            <button
                onClick={() => setIsEditing(true)}
                className="btn btn-ghost btn-sm text-xs"
                aria-label="Edit description"
            >
                Edit
            </button>
        )}
      </div>
      {isEditing ? (
        <textarea
          value={description}
          onChange={handleChange}
          onBlur={handleBlur}
          rows={6}
          className="input-base w-full resize-y min-h-[120px] p-3 text-base bg-bg-secondary border-border-default rounded-md focus:border-accent-primary focus:ring-accent-focus"
          placeholder="Add a detailed description..."
          autoFocus
          aria-label="Task description text area"
        />
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className={`prose prose-sm md:prose-base max-w-none text-text-secondary hover:text-text-primary min-h-[60px] p-3 rounded-md cursor-text transition-colors hover:bg-bg-tertiary ${description ? 'whitespace-pre-wrap' : 'italic text-text-disabled'}`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsEditing(true);}}
          aria-label={description ? "Task description" : "Add a description"}
        >
          {description || 'Click to add a description...'}
        </div>
      )}
      <div className="pt-2 flex items-center gap-2">
        <button
          className="btn btn-secondary btn-sm text-xs inline-flex items-center gap-1.5"
          onClick={() => alert("Attach file clicked - integrate with file upload service.")}
          aria-label="Attach file to description"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.122 2.122l7.81-7.81" />
            </svg>
          Attach File
        </button>
        {/* Add more quick actions related to description if needed */}
      </div>
    </section>
  );
};

export default TaskDescription;
