import React, { useState, useCallback } from 'react';
import { TaskList } from '../types/task';

interface TaskListManagerProps {
  lists: TaskList[];
  onCreateList: (list: TaskList) => void;
  onDeleteList: (listId: string) => void;
  onUpdateList: (list: TaskList) => void;
}

export const TaskListManager: React.FC<TaskListManagerProps> = ({
  lists,
  onCreateList,
  onDeleteList,
  onUpdateList,
}) => {
  const [newListName, setNewListName] = useState('');
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editedListName, setEditedListName] = useState('');

  const handleCreateList = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim()) {
      const newList: TaskList = {
        id: Date.now().toString(),
        name: newListName.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
        tasks: [],
      };
      onCreateList(newList);
      setNewListName('');
    }
  }, [newListName, onCreateList]);

  const handleStartEdit = useCallback((list: TaskList) => {
    setEditingListId(list.id);
    setEditedListName(list.name);
  }, []);

  const handleSaveEdit = useCallback((list: TaskList) => {
    if (editedListName.trim() && editedListName !== list.name) {
      onUpdateList({
        ...list,
        name: editedListName.trim(),
        updatedAt: new Date(),
      });
    }
    setEditingListId(null);
  }, [editedListName, onUpdateList]);

  return (
    <div className="space-y-4 p-4 bg-[#222222] rounded-xl">
      <h2 className="text-xl font-semibold text-white mb-4">Task Lists</h2>
      
      {/* Create new list form */}
      <form onSubmit={handleCreateList} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder="New list name"
          className="flex-1 px-3 py-2 bg-[#333333] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors text-white"
        >
          Create List
        </button>
      </form>

      {/* List of existing lists */}
      <div className="space-y-2">
        {lists.map((list) => (
          <div
            key={list.id}
            className="flex items-center justify-between p-3 bg-[#333333] rounded-lg"
          >
            {editingListId === list.id ? (
              <input
                type="text"
                value={editedListName}
                onChange={(e) => setEditedListName(e.target.value)}
                onBlur={() => handleSaveEdit(list)}
                onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(list)}
                className="flex-1 px-2 py-1 bg-[#444444] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 mr-2"
                autoFocus
              />
            ) : (
              <span
                className="text-white cursor-pointer hover:text-gray-300"
                onClick={() => handleStartEdit(list)}
              >
                {list.name}
              </span>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">
                {list.tasks.length} tasks
              </span>
              <button
                onClick={() => onDeleteList(list.id)}
                className="text-red-500 hover:text-red-400 p-1"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {lists.length === 0 && (
        <div className="text-center text-gray-400 py-4">
          No task lists yet. Create one to get started!
        </div>
      )}
    </div>
  );
};

export default TaskListManager;