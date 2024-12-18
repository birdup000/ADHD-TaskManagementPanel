"use client";

import React from 'react';
import { Task } from '../types/task';
import { ActivityLog, Collaborator } from '../types/collaboration';
import { useCollaboration } from '../hooks/useCollaboration';
import { Comment } from './CommentSection';
import CommentSection from './CommentSection';
import CollaboratorActions from './CollaboratorActions';
import RichTextEditor from './RichTextEditor';

interface TaskDetailsProps {
  task: Task;
  onClose: () => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  comments: Comment[];
  onAddComment: (taskId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;
}

const [loadingCheckpoint, setLoadingCheckpoint] = useState&lt;string | null&gt;(null);

const TaskDetails: React.FC<TaskDetailsProps> = ({
  task,
  onClose,
  onUpdateTask,
  comments,

const [loadingCheckpoint, setLoadingCheckpoint] = useState&lt;string | null&gt;(null);

  onAddComment,
}) => {
  // Use the collaboration hook to manage permissions and actions
  const {
    isCollaborator,
    userRole,
    canEdit,
    canManageCollaborators,
    addCollaborator,
    removeCollaborator,
    updateCollaboratorRole
  } = useCollaboration({
    task,
    currentUser: 'current-user-id', // In a real app, this would come from auth
    onUpdateTask
  });

  const renderActivityLog = (log: ActivityLog) => {
    const getActionColor = (action: ActivityLog['action']) => {
      switch (action) {
        case 'created':
          return 'text-green-400';
        case 'updated':
          return 'text-blue-400';
        case 'commented':
          return 'text-purple-400';
        case 'status_changed':
          return 'text-yellow-400';
        case 'assigned':
          return 'text-indigo-400';
        default:
          return 'text-gray-400';
      }
    };

    return (
      <div key={log.id} className="flex items-start gap-2 text-sm">
        <span className={getActionColor(log.action)}>●</span>
        <div>
          <p className="text-gray-300">
            {log.action === 'commented' && log.details?.comment 
              ? `${log.userId} commented: "${log.details.comment}"`
              : log.action === 'updated' && log.details?.field
              ? `${log.userId} updated ${log.details.field} from "${log.details.oldValue}" to "${log.details.newValue}"`
              : `${log.userId} ${log.action}`}
          </p>
          <span className="text-xs text-gray-500">
            {new Date(log.timestamp).toLocaleString()}
          </span>
        </div>
      </div>
    );
  };

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
          <div className="flex items-center gap-2">
            {task.collaborators && task.collaborators.length > 0 && (
              <div className="flex -space-x-2">
                {task.collaborators.map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className="w-8 h-8 rounded-full bg-gray-500 border-2 border-[#212121] flex items-center justify-center text-sm text-white"
                    title={`${collaborator.name} (${collaborator.role})`}
                  >
                    {collaborator.name[0]}
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
&lt;h3 className="text-sm font-medium text-gray-400 mb-2"&gt;Description&lt;/h3&gt;
            {canEdit ? (
              &lt;RichTextEditor
                initialContent={task.description}
                onChange={(content) =&gt;
                  onUpdateTask({ ...task, description: content })
                }
              /&gt;
            ) : (
              &lt;div className="bg-[#2A2A2A] rounded-lg p-4 text-gray-300"&gt;
                {task.description || &lt;i&gt;No description provided.&lt;/i&gt;}
              &lt;/div&gt;
            )}
          &lt;/div&gt;

{task.checkpoints?.length >0 &amp;&amp; (
              &lt;div&gt;
                &lt;h4 className="text-white font-medium"&gt;
                  Checkpoints:
                &lt;/h4&gt;
                &lt;ul className="list-disc pl-5 mt-2"&gt;
                  {task.checkpoints.map((checkpoint) =&gt; (
                    &lt;li key={checkpoint.id} className="text-gray-300"&gt;
                      {checkpoint.createdAt.toLocaleString()}
                      &lt;button
                        onClick={async () =&gt; {
                          setLoadingCheckpoint(checkpoint.id);
                          const loadedState = await loadCheckpoint(
                            task.id,
                            checkpoint.id,
                            localStorage.getItem('agixtapi') || '',
                            localStorage.getItem('agixtkey') || ''
                          );
                          if (loadedState) {
                            // Handle loading the state by updating the task with the loaded state
                            onUpdateTask({ ...task, ...loadedState, checkpoints: task.checkpoints });
                          } else {
                            // Display an error message
                            alert('Failed to load checkpoint');
                          }
                          setLoadingCheckpoint(null);
                        }}
                        disabled={loadingCheckpoint === checkpoint.id}
                        className="ml-2 text-blue-500 hover:text-blue-700"
                      &gt;
                        {loadingCheckpoint === checkpoint.id ? 'Loading...' : 'Load'}
                      &lt;/button&gt;
                    &lt;/li&gt;
                  ))}
                &lt;/ul&gt;
              &lt;/div&gt;
            )}
          &lt;/div&gt;
&lt;div&gt;
// Handle loading the state by updating the task with the loaded state
      onUpdateTask({ ...task, ...loadedState, checkpoints: task.checkpoints });
        } else {
          // Display an error message
          alert('Failed to load checkpoint');
        }
        setLoadingCheckpoint(null);
      }}
      disabled={loadingCheckpoint === checkpoint.id}
      className="ml-2 text-blue-500 hover:text-blue-700"
    &gt;
      {loadingCheckpoint === checkpoint.id ? 'Loading...' : 'Load'}
    &lt;/button&gt;
                    &lt;/li&gt;
                  ))}
                &lt;/ul&gt;
              &lt;/div&gt;
            )}
                            &lt;h4 className="text-white font-medium"&gt;
                              Checkpoints:
                            &lt;/h4&gt;
                            &lt;ul className="list-disc pl-5 mt-2"&gt;
                              {task.checkpoints.map((checkpoint) =&gt; (
                                &lt;li key={checkpoint.id} className="text-gray-300"&gt;
                                  {checkpoint.createdAt.toLocaleString()}
                                  {/* Add a button to load the checkpoint */}
&lt;button
                                    onClick={async () =&gt; {
                                      setLoadingCheckpoint(checkpoint.id);
                                      const loadedState = await loadCheckpoint(
                                        task.id,
                                        checkpoint.id,
                                        localStorage.getItem('agixtapi') || '',
                                        localStorage.getItem('agixtkey') || ''
                                      );
                                      if (loadedState) {
                                        // Handle loading the state
                                        onUpdateTask({ ...task, ...loadedState });
                                      } else {
                                        // Display an error message
                                        alert('Failed to load checkpoint');
                                      }
                                      setLoadingCheckpoint(null);
                                    }}
                                    disabled={loadingCheckpoint === checkpoint.id}
                                    className="ml-2 text-blue-500 hover:text-blue-700"
                                  &gt;
                                    {loadingCheckpoint === checkpoint.id ? 'Loading...' : 'Load'}
                                  &lt;/button&gt;
                                &lt;/li&gt;
                              ))}
                            &lt;/ul&gt;
                          &lt;/div&gt;
                        )}

            <h3 className="text-sm font-medium text-gray-400 mb-2">Checkpoints</h3>
            <div className="space-y-2">
{task.checkpoints?.map((checkpoint) =>(<div
                  key={checkpoint.id}
                  className="flex items-start gap-2 bg-[#2A2A2A] rounded-lg p-3"
                ><input
                    type="checkbox"
                    checked={checkpoint.completed}
                    onChange={() =>{
                      const updatedCheckpoints = task.checkpoints?.map(cp =>cp.id === checkpoint.id ? { ...cp, completed: !cp.completed } : cp
                      );
                      const completedCount = updatedCheckpoints?.filter(cp =>cp.completed).length || 0;
                      const totalCount = updatedCheckpoints?.length || 0;
                      const progress = totalCount >0 ? Math.round((completedCount / totalCount) * 100) : 0;
                      onUpdateTask({
                        ...task,
                        checkpoints: updatedCheckpoints,
                        progress
                      });
                    }}
                    className="mt-1 rounded-sm text-indigo-600 focus:ring-indigo-500"
                  /><div className="flex-1"><h4 className="text-white font-medium">{checkpoint.title}</h4>{checkpoint.description && (<p className="text-gray-400 text-sm mt-1">{checkpoint.description}</p>)}<span className="text-xs text-gray-500 mt-2 block">Created {new Date(checkpoint.createdAt).toLocaleDateString()}</span></div></div>))}
              {canEdit && (<button
                  onClick={() =>{
                    const newCheckpoint = {
                      id: Date.now().toString(),
                      title: 'New Checkpoint',
                      completed: false,
                      createdAt: new Date(),
                      description: ''
                    };
                    const updatedCheckpoints = [...(task.checkpoints || []), newCheckpoint];
                    const completedCount = updatedCheckpoints?.filter(cp =>cp.completed).length || 0;
                    const totalCount = updatedCheckpoints?.length || 0;
                    const progress = totalCount >0 ? Math.round((completedCount / totalCount) * 100) : 0;
                    onUpdateTask({
                      ...task,
                      checkpoints: updatedCheckpoints,
                      progress
                    });
                  }}
                  className="w-full px-4 py-2 bg-[#333333] hover:bg-[#444444] rounded-lg text-white transition-colors"
                >Add Checkpoint</button>)}
              )}
            </div>
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

          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Activity Log</h3>
            <div className="bg-[#2A2A2A] rounded-lg p-4 space-y-2 max-h-40 overflow-y-auto">
              {task.activityLog?.map(renderActivityLog)}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Collaborators</h3>
            <div className="bg-[#2A2A2A] rounded-lg p-4">
              <div className="flex flex-wrap gap-2">
                {task.collaborators?.map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className="flex items-center gap-2 bg-[#333333] px-3 py-2 rounded-lg"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-sm text-white">
                      {collaborator.name[0]}
                    </div>
                    <div>
                      <p className="text-sm text-white">{collaborator.name}</p>
                      <p className="text-xs text-gray-400">{collaborator.role}</p>
                    </div>
                    <CollaboratorActions
                      collaborator={collaborator}
                      canManageCollaborators={canManageCollaborators}
                      onUpdateRole={(role) => updateCollaboratorRole(collaborator.id, role)}
                      onRemove={() => removeCollaborator(collaborator.id)}
                    />
                  </div>
                ))}
              </div>
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
