"use client";

import React, { useState } from 'react';
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
  const [assignee, setAssignee] = useState('');
  const [assignees, setAssignees] = useState<string[]>([]);
  const [tag, setTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [subtask, setSubtask] = useState('');
  const [subtasks, setSubtasks] = useState<{ title: string; completed: boolean }[]>([]);
  const [selectedListId, setSelectedListId] = useState(lists.length > 0 ? lists[0].id : '');


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: Date.now().toString(), // Generate ID on client side
      title,
      description,
      priority,
      status: 'todo',
      dueDate: dueDate ? new Date(dueDate) : undefined,
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
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-[#222222] rounded-xl shadow-lg max-h-[90vh] overflow-y-auto">
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
                <span>{st.title}</span>
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
