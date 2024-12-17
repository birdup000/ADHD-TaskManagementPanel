"use client";

import React, { useState, useEffect } from 'react';
import RichTextEditor from './RichTextEditor';
import { TaskList } from '../types/task';

interface TaskFormProps {
  onSubmit: (task: any) => void;
  onCancel: () => void;
  lists: TaskList[];
}

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, onCancel, lists }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [assignee, setAssignee] = useState('');
  const [assignees, setAssignees] = useState<string[]>([]);
  const [tag, setTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [subtask, setSubtask] = useState('');
  const [subtasks, setSubtasks] = useState<{ title: string; completed: boolean }[]>([]);
    const [editingSubtaskIndex, setEditingSubtaskIndex] = useState<number | null>(null);
    const [editedSubtaskTitle, setEditedSubtaskTitle] = useState('');
  const [selectedListId, setSelectedListId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (lists.length > 0) {
            setSelectedListId(lists[0].id);
            setErrorMessage('');
        } else {
            setErrorMessage('Please create a task list before creating a task.');
        }
    }, [lists]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListId) {
        setErrorMessage('Please select a task list before creating a task.');
        return;
    }
    setErrorMessage('');
    onSubmit({
      id: Date.now().toString(), // Generate ID on client side
      title,
      description,
      priority,
      status: 'todo',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      assignees,
      tags,
      subtasks,
      listId: selectedListId,
    });
  };

  const addAssignee = () => {
    if (assignee && !assignees.includes(assignee)) {
      setAssignees([...assignees, assignee]);
      setAssignee('');
    }
  };

  const addTag = () => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTag('');
    }
  };

  const addSubtask = () => {
    if (subtask) {
      setSubtasks([...subtasks, { title: subtask, completed: false }]);
      setSubtask('');
    }
  };

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
      if (editingSubtaskIndex === index) {
          setEditingSubtaskIndex(null);
      }
  };

    const toggleSubtask = (index: number) => {
        setSubtasks(
            subtasks.map((st, i) =>
                i === index ? { ...st, completed: !st.completed } : st
            )
        );
    };

    const handleEditSubtask = (index: number) => {
        setEditingSubtaskIndex(index);
        setEditedSubtaskTitle(subtasks[index].title);
    };

    const handleSaveSubtask = (index: number) => {
        setSubtasks(
            subtasks.map((st, i) =>
                i === index ? { ...st, title: editedSubtaskTitle } : st
            )
        );
        setEditingSubtaskIndex(null);
    };


  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-[#222222] rounded-xl shadow-lg max-h-[90vh] overflow-y-auto">
        {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{errorMessage}</span>
            </div>
        )}
      <fieldset className="border border-gray-700 rounded-lg p-4">
        <legend className="text-sm font-medium text-gray-200">Basic Information</legend>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#333333] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Task title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Description
            </label>
            <RichTextEditor
              placeholder="Task description..."
              onChange={setDescription}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="border border-gray-700 rounded-lg p-4">
        <legend className="text-sm font-medium text-gray-200">Details</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="w-full px-3 py-2 bg-[#333333] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#333333] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Schedule For
            </label>
            <input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              className="w-full px-3 py-2 bg-[#333333] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="border border-gray-700 rounded-lg p-4">
        <legend className="text-sm font-medium text-gray-200">Assignees</legend>
        <div>
          <div className="flex gap-2">
            <input
              type="text"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="flex-1 px-3 py-2 bg-[#333333] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Add assignee"
            />
            <button
              type="button"
              onClick={addAssignee}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {assignees.map((a) => (
              <span
                key={a}
                className="px-2 py-1 bg-[#444444] rounded-full text-sm flex items-center gap-1"
              >
                {a}
                <button
                  type="button"
                  onClick={() => setAssignees(assignees.filter((x) => x !== a))}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </fieldset>

      <fieldset className="border border-gray-700 rounded-lg p-4">
        <legend className="text-sm font-medium text-gray-200">Tags</legend>
        <div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="flex-1 px-3 py-2 bg-[#333333] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Add tag"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((t) => (
              <span
                key={t}
                className="px-2 py-1 bg-indigo-600/30 rounded-full text-sm flex items-center gap-1"
              >
                {t}
                <button
                  type="button"
                  onClick={() => setTags(tags.filter((x) => x !== t))}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </fieldset>

      <fieldset className="border border-gray-700 rounded-lg p-4">
        <legend className="text-sm font-medium text-gray-200">Subtasks</legend>
        <div>
          <div className="flex gap-2">
            <input
              type="text"
              value={subtask}
              onChange={(e) => setSubtask(e.target.value)}
              className="flex-1 px-3 py-2 bg-[#333333] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Add subtask"
            />
            <button
              type="button"
              onClick={addSubtask}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            {subtasks.map((st, index) => (
              <div
                key={index}
                className="px-2 py-1 bg-[#444444] rounded-md text-sm flex items-center justify-between"
              >
                  <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={st.completed}
                        onChange={() => toggleSubtask(index)}
                        className="rounded-sm text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                      {editingSubtaskIndex === index ? (
                          <input
                              type="text"
                              value={editedSubtaskTitle}
                              onChange={(e) => setEditedSubtaskTitle(e.target.value)}
                              onBlur={() => handleSaveSubtask(index)}
                              className="flex-1 px-2 py-1 bg-[#333333] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                      ) : (
                          <span onClick={() => handleEditSubtask(index)} style={{cursor: 'pointer'}}>{st.title}</span>
                      )}
                  </div>
                <button
                  type="button"
                  onClick={() => removeSubtask(index)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </fieldset>

      <div>
        <label className="block text-sm font-medium text-gray-200 mb-1">
          List
        </label>
        <select
          value={selectedListId}
          onChange={(e) => setSelectedListId(e.target.value)}
          className="w-full px-3 py-2 bg-[#333333] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {lists.map((list) => (
            <option key={list.id} value={list.id}>{list.name}</option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          Create Task
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
