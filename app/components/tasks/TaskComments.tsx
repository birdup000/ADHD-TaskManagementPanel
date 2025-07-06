"use client";

import React, { useState, useEffect, FormEvent } from 'react';
// Assuming a Comment type and some way to fetch/post comments
// For now, we'll simulate this.
// import { Comment, User } from '../../types'; // You would define these types
// import { fetchComments, postComment } from '../../services/commentService'; // Example service

// Dummy User and Comment types for now
interface User {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface Comment {
  id: string;
  taskId: string;
  userId: string;
  user: User; // Embedded user info
  text: string;
  createdAt: string; // ISO date string
  updatedAt?: string; // ISO date string
}

interface TaskCommentsProps {
  taskId: string;
  currentUser: User; // Assume we know the current user
}

const TaskComments: React.FC<TaskCommentsProps> = ({ taskId, currentUser }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  // Simulate fetching comments
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    // Simulate API call
    setTimeout(() => {
      // Replace with actual fetchComments(taskId)
      const allMockComments: Comment[] = [
        {
          id: 'comment-1-task-A', taskId: 'task-A', userId: 'user-2', text: 'This is a comment for task A.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          user: { id: 'user-2', name: 'Jane Doe', avatarUrl: 'https://i.pravatar.cc/150?u=jane' }
        },
        {
          id: 'comment-2-task-A', taskId: 'task-A', userId: 'user-1', text: 'Another comment for task A.', createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          user: { id: 'user-1', name: 'John Smith', avatarUrl: 'https://i.pravatar.cc/150?u=john' }
        },
        {
          id: 'comment-1-task-B', taskId: 'task-B', userId: 'user-3', text: 'Comment for task B.', createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          user: { id: 'user-3', name: 'Alice Wonderland', avatarUrl: 'https://i.pravatar.cc/150?u=alice' }
        },
      ];

      const fetchedComments = allMockComments.filter(c => c.taskId === taskId);

      // Sort comments by date, oldest first for display
      setComments(fetchedComments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
      setIsLoading(false);
    }, 1000);
  }, [taskId]);

  const handlePostComment = async (e: FormEvent) => {
    e.preventDefault();
    if (newCommentText.trim() === '') return;

    setIsPosting(true);
    setError(null);
    const tempId = `temp-${Date.now()}`;
    const optimisticComment: Comment = {
      id: tempId,
      taskId,
      userId: currentUser.id,
      user: currentUser,
      text: newCommentText.trim(),
      createdAt: new Date().toISOString(),
    };

    // Optimistic update
    setComments(prevComments => [...prevComments, optimisticComment]);
    setNewCommentText('');

    try {
      // Simulate API call: await postComment(taskId, newCommentText.trim(), currentUser.id);
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay

      // Replace optimistic comment with actual comment from server if needed
      // For example, if server returns the created comment with a real ID
      // setComments(prevComments => prevComments.map(c => c.id === tempId ? { ...serverComment } : c));

      // For simulation, we'll just assume it worked and keep the optimistic one or slightly modify it
       setComments(prevComments => prevComments.map(c =>
        c.id === tempId ? { ...c, id: `server-${Date.now()}` } : c // Simulate server ID
      ));

    } catch (err) {
      setError('Failed to post comment. Please try again.');
      // Revert optimistic update
      setComments(prevComments => prevComments.filter(c => c.id !== optimisticComment.id));
      setNewCommentText(optimisticComment.text); // Put text back in input
      console.error("Failed to post comment:", err);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <section aria-labelledby="task-comments-heading" className="space-y-4 py-4 md:py-6">
      <h3 id="task-comments-heading" className="heading-tertiary text-text-primary">
        Activity & Comments ({comments.length})
      </h3>

      {isLoading && <p className="text-text-secondary text-sm p-4 text-center">Loading comments...</p>}
      {error && <p className="text-status-error text-sm p-4 text-center">{error}</p>}

      {!isLoading && comments.length === 0 && (
        <p className="text-text-disabled italic text-sm p-4 text-center">No activity or comments yet.</p>
      )}

      {comments.length > 0 && (
        <div className="space-y-5 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar"> {/* Added custom-scrollbar if defined globally */}
          {comments.map(comment => (
            <article key={comment.id} className="flex gap-3 items-start p-1">
              <img
                src={comment.user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user.name)}&background=random&color=fff&size=36`}
                alt={`${comment.user.name}'s avatar`}
                className="w-9 h-9 rounded-full object-cover flex-shrink-0 mt-0.5 border border-border-default"
              />
              <div className="flex-1 bg-bg-secondary p-3 rounded-lg shadow-sm border border-border-default">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-sm text-text-primary">{comment.user.name}</p>
                  <time dateTime={comment.createdAt} className="text-xs text-text-tertiary">
                    {new Date(comment.createdAt).toLocaleString(undefined, {dateStyle: 'medium', timeStyle: 'short'})}
                  </time>
                </div>
                <p className="text-sm text-text-secondary whitespace-pre-wrap prose prose-sm max-w-none">{comment.text}</p>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Sticky comment input bar - improved styling and positioning */}
      <form onSubmit={handlePostComment} className="sticky bottom-0 py-3 bg-bg-primary/80 backdrop-blur-sm border-t border-border-default -mx-4 md:-mx-6 px-4 md:px-6 z-5">
        <div className="flex items-start gap-3 max-w-3xl mx-auto"> {/* Limit width for better readability on wide screens */}
           <img
            src={currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random&color=fff&size=40`}
            alt="Your avatar"
            className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover flex-shrink-0 border border-border-default"
          />
          <div className="flex-1 relative">
            <textarea
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Add a comment... Markdown supported. Ctrl+Enter to send."
              rows={newCommentText.split('\n').length > 1 ? Math.min(newCommentText.split('\n').length, 5) : 1} // Auto-expand up to 5 rows
              className="input-base w-full resize-none text-sm py-2.5 px-3 pr-20 bg-bg-secondary border-border-default rounded-md focus:ring-1 focus:ring-accent-focus focus:border-accent-focus transition-all duration-150"
              disabled={isPosting}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault(); // Prevent new line if submitting
                  handlePostComment(e);
                }
              }}
              aria-label="New comment text area"
            />
            <button
              type="submit"
              className="btn btn-primary btn-sm absolute right-2 bottom-2 py-1 px-3 text-xs"
              disabled={isPosting || newCommentText.trim() === ''}
              aria-label="Post comment"
            >
              {isPosting ? (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Post'}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};

export default TaskComments;
