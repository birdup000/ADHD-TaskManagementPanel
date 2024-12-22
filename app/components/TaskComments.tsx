"use client";

import React, { useState } from 'react';
import { Task } from '../types/task';
import { ActivityLog, Comment } from '../types/collaboration';

interface TaskCommentsProps {
  task: Task;
  onUpdateTask: (task: Task) => void;
  className?: string;
}

const TaskComments: React.FC<TaskCommentsProps> = ({
  task,
  onUpdateTask,
  className = '',
}) => {
  const [newComment, setNewComment] = useState('');

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      taskId: task.id,
      userId: 'current-user', // Replace with actual user ID from auth
      content: newComment.trim(),
      createdAt: new Date(),
    };

    const activityLogEntry: ActivityLog = {
      id: Date.now().toString(),
      taskId: task.id,
      userId: 'current-user', // Replace with actual user ID from auth
      action: 'commented',
      timestamp: new Date(),
    };

    const updatedTask = {
      ...task,
      comments: [...(task.comments || []), comment],
      activityLog: [...(task.activityLog || []), activityLogEntry],
    };

    onUpdateTask(updatedTask);
    setNewComment('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const handleDeleteComment = (commentId: string) => {
    const updatedTask = {
      ...task,
      comments: task.comments?.filter(comment => comment.id !== commentId) || [],
    };
    onUpdateTask(updatedTask);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-300">Comments</h4>
        <span className="text-xs text-gray-400">
          {task.comments?.length || 0} comments
        </span>
      </div>

      {/* Comment input */}
      <div className="space-y-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a comment... (Press Enter to submit)"
          className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          rows={3}
        />
        <div className="flex justify-end">
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 rounded-lg transition-colors text-sm"
          >
            Add Comment
          </button>
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        {task.comments?.map((comment) => (
          <div
            key={comment.id}
            className="bg-gray-700 rounded-lg p-4 space-y-2 hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                  <span className="text-sm">{comment.userId[0]}</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{comment.userId}</p>
                  <p className="text-xs text-gray-400">
                    {formatDate(comment.createdAt)}
                  </p>
                </div>
              </div>
              <div className="relative group">
                <button className="text-gray-400 hover:text-white p-1">
                  •••
                </button>
                <div className="absolute right-0 mt-1 w-32 bg-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700 rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
            <div className="pl-10">
              <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
            </div>
          </div>
        ))}

        {(!task.comments || task.comments.length === 0) && (
          <div className="text-center py-6 text-gray-400">
            <p>No comments yet</p>
            <p className="text-sm">Be the first to add a comment!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskComments;
