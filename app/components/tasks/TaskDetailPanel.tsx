"use client";

import React from 'react';
import { Task } from '../../types/task';
import { Category } from '../../types/category';
import { useCategories } from '../../hooks/useCategories';
import CategoryModal from '../categories/CategoryModal';

interface TaskDetailPanelProps {
  task: Task | null;
  onClose: () => void;
  onSave: (task: Task) => void;
}

const TaskDetailPanel: React.FC<TaskDetailPanelProps> = ({
  task,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = React.useState<Partial<Task>>(task || {});
  const [isDirty, setIsDirty] = React.useState(false);
  const [newTag, setNewTag] = React.useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = React.useState(false);
  const { categories, addCategory } = useCategories();
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Update form data when task changes
  React.useEffect(() => {
    if (task) {
      setFormData(task);
      setIsDirty(false);
      setErrors({});
    }
  }, [task]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
    // Clear error when field is modified
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }

    if (formData.startDate && formData.dueDate) {
      const start = new Date(formData.startDate);
      const due = new Date(formData.dueDate);
      if (due < start) {
        newErrors.dueDate = 'Due date cannot be before start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()],
      }));
      setNewTag('');
      setIsDirty(true);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove),
    }));
    setIsDirty(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() && task) {
      onSave({ ...task, ...formData });
    }
  };

  const handleNewCategory = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newCategory = await addCategory(categoryData);
      setFormData(prev => ({ ...prev, category: newCategory.id }));
      setIsDirty(true);
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border-default bg-bg-secondary">
        <div>
          <h2 className="text-xl font-semibold">Task Details</h2>
          {isDirty && <p className="text-xs text-text-secondary mt-1">You have unsaved changes</p>}
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-hover rounded-md text-text-secondary 
                   hover:text-text-primary transition-colors duration-200"
          aria-label="Close panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Task Form */}
      <div className="flex-1 overflow-y-auto">
        <form className="p-6 space-y-6" onSubmit={handleSubmit}>
          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-text-secondary">
              Title <span className="text-priority-high">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title || ''}
              onChange={handleChange}
              className={`w-full bg-bg-tertiary border ${
                errors.title ? 'border-priority-high' : 'border-border-default'
              } rounded-md px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent-primary`}
              placeholder="Task title"
            />
            {errors.title && (
              <p className="text-sm text-priority-high">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-text-secondary">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={4}
              className="w-full bg-bg-tertiary border border-border-default rounded-md px-4 py-2.5
                     text-text-primary focus:outline-none focus:border-accent-primary resize-none min-h-[120px]"
              placeholder="Add a detailed description..."
            />
          </div>

          {/* Category, Priority and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="category" className="text-sm font-medium text-text-secondary">
                  Category
                </label>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="text-accent-primary hover:text-accent-primary/80 text-sm"
                >
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

          {/* Priority and Progress */}
          <div className="grid grid-cols-2 gap-4">
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
          <div className="grid grid-cols-2 gap-4">
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
                className="flex-1 accent-accent-primary h-2 rounded-full bg-bg-tertiary"
              />
              <span className="text-sm text-text-secondary w-12">
                {formData.progress || 0}%
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-full bg-bg-tertiary text-sm flex items-center gap-2 group border border-border-default"
                >
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
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-4 border-t border-border-default bg-bg-secondary">
        <div className="flex items-center gap-4">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={!isDirty}
            className={`flex-1 py-2.5 px-6 rounded-md text-sm font-medium ${
              isDirty
                ? 'bg-accent-primary text-white hover:bg-opacity-90'
                : 'bg-bg-tertiary text-text-disabled cursor-not-allowed'
            } transition-colors duration-200`}
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={onClose}
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