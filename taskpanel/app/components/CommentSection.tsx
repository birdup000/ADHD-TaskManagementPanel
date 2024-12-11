"use client";


import React, { useState } from 'react';

export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: Date;
}

interface CommentSectionProps {
  taskId: string;
  comments: Comment[];
  onAddComment: (taskId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  taskId,
  comments,
  onAddComment,
}) => {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    onAddComment(taskId, {
      author: 'Current User', // Replace with actual user
      content: newComment,
    });
    setNewComment('');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Comments</h3>
      <div className="space-y-4 mb-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="bg-[#333333] p-4 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{comment.author}</span>
              <span className="text-sm text-gray-400">
                {comment.createdAt.toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-300">{comment.content}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 px-3 py-2 bg-[#333333] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
        >
          Comment
        </button>
      </form>
    </div>
  );
};

export default CommentSection;