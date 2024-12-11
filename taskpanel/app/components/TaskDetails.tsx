import React from 'react';
import { Task } from '../types/task';
import { Comment } from './CommentSection';
import CommentSection from './CommentSection';
import RichTextEditor from './RichTextEditor';

interface TaskDetailsProps {
  task: Task;
  onClose: () => void;
  onUpdateTask: (task: Task) => void;
  comments: Comment[];
  onAddComment: (taskId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({
  task,
  onClose,
  onUpdateTask,
  comments,
  onAddComment,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#212121] p-6 rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">{task.title}</h2>
            <span
              className={`px-2 py-1 rounded text-xs text-white ${
                task.priority === 'high'
                  ? 'bg-red-600'
                  : task.priority === 'medium'
                  ? 'bg-yellow-600'
                  : 'bg-green-600'
              }`}
            >
              {task.priority}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Description</h3>
            <RichTextEditor
              initialContent={task.description}
              onChange={(content) =>
                onUpdateTask({ ...task, description: content })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Status</h3>
              <select
                value={task.status}
                onChange={(e) =>
                  onUpdateTask({
                    ...task,
                    status: e.target.value as Task['status'],
                  })
                }
                className="w-full px-3 py-2 bg-[#333333] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Due Date</h3>
              <input
                type="date"
                value={task.dueDate?.toISOString().split('T')[0]}
                onChange={(e) =>
                  onUpdateTask({
                    ...task,
                    dueDate: e.target.value ? new Date(e.target.value) : undefined,
                  })
                }
                className="w-full px-3 py-2 bg-[#333333] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Assignees</h3>
            <div className="flex -space-x-2">
              {task.assignees?.map((assignee) => (
                <div
                  key={assignee}
                  className="w-8 h-8 rounded-full bg-gray-500 border-2 border-[#212121] flex items-center justify-center text-sm text-white"
                  title={assignee}
                >
                  {assignee[0]}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {task.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-indigo-600/30 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <CommentSection
            taskId={task.id}
            comments={comments}
            onAddComment={onAddComment}
          />
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;