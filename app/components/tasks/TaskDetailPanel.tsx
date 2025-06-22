"use client";

import React from 'react';
import { Task } from '../../types/task';
import { Category } from '../../types/category';
import { useCategories } from '../../hooks/useCategories';
import CategoryModal from '../categories/CategoryModal';
import { debounce } from 'lodash';

interface TaskDetailPanelProps {
  task: Task | null;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const TaskDetailPanel: React.FC<TaskDetailPanelProps> = ({
  task,
  onClose,
  onSave,
  onDelete,
}) => {
  // Add confirmation dialog when closing with unsaved changes
  const handleClose = () => {
    if (isDirty) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to close?'
      );
      if (!confirmed) {
        return;
      }
      // Reset form data to original state
      if (originalTaskRef.current) {
        setFormData(originalTaskRef.current);
      }
    }
    onClose();
  };
  const [formData, setFormData] = React.useState<Partial<Task>>(task || {});
  const [isDirty, setIsDirty] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState<'saved' | 'error' | null>(null);
  const [newTag, setNewTag] = React.useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = React.useState(false);
  const { categories, addCategory } = useCategories();
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  
  // Create a ref to store the original task data
  const originalTaskRef = React.useRef<Task | null>(null);

  // Update form data when task changes
  React.useEffect(() => {
    if (task) {
      setFormData(task);
      originalTaskRef.current = task;
      setIsDirty(false);
      setErrors({});
      setSaveStatus(null);
    }
  }, [task]);

  // Implement auto-save functionality
  const debouncedSave = React.useMemo(
    () =>
      debounce(async (data: Task) => {
        try {
          setIsSaving(true);
          await onSave(data);
          setSaveStatus('saved');
          setIsDirty(false);
        } catch (error) {
          console.error('Error saving task:', error);
          setSaveStatus('error');
        } finally {
          setIsSaving(false);
        }
      }, 1000),
    [onSave]
  );

  // Cleanup debounced function
  React.useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      // Only trigger auto-save if the form is valid
      // Always save as draft if validation fails to prevent data loss
      if (task) {
        if (validateForm(newData)) {
          debouncedSave({ ...task, ...newData });
        } else {
          // Save as draft to local storage or notify user
          localStorage.setItem(`draft_task_${task.id}`, JSON.stringify(newData));
          setSaveStatus('error'); // Changed to 'error' as a temporary status to notify user
        }
      }
      return newData;
    });
    setIsDirty(true);
    setSaveStatus(null);
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (data: Partial<Task> = formData): boolean => {
    const newErrors: Record<string, string> = {};

    if (!data.title?.trim()) {
      newErrors.title = 'Title is required';
    }

    if (data.startDate && data.dueDate) {
      const start = new Date(data.startDate);
      const due = new Date(data.dueDate);
      if (due < start) {
        newErrors.dueDate = 'Due date cannot be before start date';
      }
    }

    // Add validation for progress
    if (data.progress !== undefined && (data.progress < 0 || data.progress > 100)) {
      newErrors.progress = 'Progress must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData((prev) => {
        const newData = {
          ...prev,
          tags: [...(prev.tags || []), newTag.trim()],
        };
        if (task && validateForm(newData)) {
          debouncedSave({ ...task, ...newData });
        }
        return newData;
      });
      setNewTag('');
      setIsDirty(true);
      setSaveStatus(null);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        tags: prev.tags?.filter((tag) => tag !== tagToRemove),
      };
      if (task && validateForm(newData)) {
        debouncedSave({ ...task, ...newData });
      }
      return newData;
    });
    setIsDirty(true);
    setSaveStatus(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() && task) {
      try {
        setIsSaving(true);
        await onSave({ ...task, ...formData });
        setSaveStatus('saved');
        setIsDirty(false);
      } catch (error) {
        console.error('Error saving task:', error);
        setSaveStatus('error');
        // Display detailed error message to user
        // Note: Adding a state for error message is needed, but for now, we'll just set status
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleNewCategory = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newCategory = await addCategory(categoryData);
      setFormData(prev => {
        const newData = { ...prev, category: newCategory.id };
        if (task && validateForm(newData)) {
          debouncedSave({ ...task, ...newData });
        }
        return newData;
      });
      setIsDirty(true);
      setSaveStatus(null);
      setIsCategoryModalOpen(false);
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  if (!task) {
    return (
      <div className="h-full flex items-center justify-center text-text-secondary p-6 text-center">
        <div>
          <svg className="w-16 h-16 mx-auto mb-4 text-text-disabled" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-lg mb-2">No Task Selected</p>
          <p className="text-sm">Select a task from the list to view and edit its details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" role="dialog" aria-labelledby="task-details-title">
      {/* Header - Improved hierarchy and status indication */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-border-default bg-bg-secondary">
        <div className="space-y-2">
          <h1 id="task-details-title" className="heading-primary">Task Details</h1>
          <div className="flex items-center gap-3">
            {isSaving && (
              <div className="flex items-center gap-2 text-text-secondary">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm">Saving...</span>
              </div>
            )}
            {saveStatus === 'saved' && (
              <div className="flex items-center gap-2 text-status-success">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm">All changes saved</span>
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="flex items-center gap-2 text-status-error">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">Error saving changes</span>
              </div>
            )}
            {isDirty && !isSaving && !saveStatus && (
              <div className="flex items-center gap-2 text-status-warning">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">Unsaved changes</span>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={handleClose}
          className="p-3 hover:bg-accent-muted rounded-lg text-text-secondary
                   hover:text-text-primary transition-colors duration-200
                   focus:outline-none focus:ring-2 focus:ring-accent-focus focus:ring-offset-1 focus:ring-offset-bg-secondary"
          aria-label="Close task details panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      {/* Task Form */}
      <main className="flex-1 overflow-y-auto p-6">
        <form className="max-w-4xl mx-auto space-y-8 p-4 sm:p-6" onSubmit={handleSubmit} role="form" aria-labelledby="task-details-title">
          
          {/* Primary Information Section */}
          <section className="space-y-6">
            <h2 className="heading-tertiary border-b border-border-default pb-3">Primary Information</h2>
            
            {/* Title */}
            <div className="space-y-3">
              <label htmlFor="title" className="label-primary">
                Task Title <span className="text-status-error ml-1">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title || ''}
                onChange={handleChange}
                className={`input-base w-full text-lg font-medium ${
                  errors.title ? 'input-error' : ''
                } focus:ring-2 focus:ring-accent-focus`}
                placeholder="Enter a clear, descriptive task title"
                aria-required="true"
                aria-invalid={errors.title ? 'true' : 'false'}
                aria-describedby={errors.title ? 'title-error' : undefined}
              />
              {errors.title && (
                <p id="title-error" className="text-sm text-status-error flex items-center gap-2" role="alert">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.title}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-3">
              <label htmlFor="description" className="label-primary">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={5}
                className="input-base w-full resize-none min-h-[140px] focus:ring-2 focus:ring-accent-focus"
                placeholder="Add a detailed description to help you remember what this task involves..."
                aria-describedby="description-help"
              />
              <p id="description-help" className="text-sm text-text-tertiary">
                A clear description helps with task completion and reduces cognitive load.
              </p>
            </div>
          </section>

          {/* Category, Priority and Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="category" className="block text-sm font-medium text-text-primary">
                  Category
                </label>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="text-sm font-medium text-accent-primary hover:text-accent-primary/80 
                         flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  + New Category
                </button>
              </div>
              <select
                id="category"
                name="category"
                value={formData.category || ''}
                onChange={handleChange}
                className="w-full bg-bg-tertiary border border-border-default rounded-md px-4 py-2.5
                       text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer"
              >
                <option value="">No Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium text-text-secondary">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status || 'todo'}
                onChange={handleChange}
                className="w-full bg-bg-tertiary border border-border-default rounded-md px-4 py-2.5
                       text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Priority and Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <label htmlFor="priority" className="text-sm font-medium text-text-secondary">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority || 'medium'}
                onChange={handleChange}
                className="w-full bg-bg-tertiary border border-border-default rounded-md px-4 py-2.5
                       text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <label htmlFor="startDate" className="text-sm font-medium text-text-secondary">
                Start Date
              </label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate || ''}
                onChange={handleChange}
                className="w-full bg-bg-tertiary border border-border-default rounded-md px-4 py-2.5
                       text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="dueDate" className="text-sm font-medium text-text-secondary">
                Due Date
              </label>
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                value={formData.dueDate || ''}
                onChange={handleChange}
                className={`w-full bg-bg-tertiary border ${
                  errors.dueDate ? 'border-priority-high' : 'border-border-default'
                } rounded-md px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer`}
              />
              {errors.dueDate && (
                <p className="text-sm text-priority-high">{errors.dueDate}</p>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <label htmlFor="progress" className="text-sm font-medium text-text-secondary">
              Progress
            </label>
            <div className="flex items-center gap-4">
              <input
                id="progress"
                name="progress"
                type="range"
                min="0"
                max="100"
                value={formData.progress || 0}
                onChange={handleChange}
                className="flex-1 h-3 rounded-full bg-bg-tertiary accent-accent-primary"
              />
              <div className="relative w-full h-2 bg-bg-tertiary rounded-full overflow-hidden">
                <div 
                  className="absolute h-full transition-all duration-300" 
                  style={{ 
                    width: `${formData.progress || 0}%`,
                    backgroundColor: `hsl(${(formData.progress || 0) * 1.2}, 80%, 50%)`
                  }}
                />
              </div>
              <span className="text-sm text-text-secondary w-12">
                {formData.progress || 0}%
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-full bg-accent-primary/10 text-accent-primary text-sm flex items-center gap-2 group border border-accent-primary/20 hover:border-accent-primary/40 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5a2 2 0 011.585.379l5 4A2 2 0 0119 9v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
                  </svg>
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-text-secondary opacity-50 group-hover:opacity-100 hover:text-priority-high"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                className="flex-1 bg-bg-tertiary border border-border-default rounded-md px-4 py-2.5
                       text-text-primary focus:outline-none focus:border-accent-primary text-sm min-w-0"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2.5 rounded-md bg-bg-tertiary border border-border-default
                       text-text-secondary hover:text-text-primary hover:border-accent-primary
                       focus:outline-none focus:border-accent-primary text-sm"
              >
                Add
              </button>
            </div>
          </div>
        </form>
      </main>

      {/* Action Buttons */}
      <div className="sticky bottom-0 px-6 py-4 border-t border-border-default bg-bg-secondary/80 backdrop-blur-sm">
        <div className="flex items-center gap-4 max-w-3xl mx-auto">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={!isDirty || isSaving}
            className={`flex-1 py-2.5 px-6 rounded-md text-sm font-medium ${
              isDirty && !isSaving
                ? 'bg-accent-primary text-white hover:bg-opacity-90'
                : 'bg-bg-tertiary text-text-disabled cursor-not-allowed'
            } transition-colors duration-200`}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => {
              if (task?.id && window.confirm('Are you sure you want to delete this task?')) {
                onDelete(task.id);
                onClose();
              }
            }}
            className="py-2.5 px-6 rounded-md border border-priority-high/20 text-priority-high text-sm font-medium hover:bg-priority-high/10 transition-colors duration-200"
          >
            Delete Task
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="py-2.5 px-6 rounded-md border border-border-default text-text-secondary text-sm font-medium
                   hover:bg-hover transition-colors duration-200"
          >
            Close
          </button>
        </div>
        
        {/* Category Modal */}
        <CategoryModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          onSave={handleNewCategory}
          initialData={{}}
        />
      </div>
    </div>
  );
};

export default TaskDetailPanel;