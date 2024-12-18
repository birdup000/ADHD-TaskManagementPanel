import { useState, useEffect } from 'react';
import { Task } from '../types/task';
import { ActivityLog, Collaborator, Comment } from '../types/collaboration';

interface UseCollaborationProps {
  task: Task;
  currentUser: string;
  onUpdateTask: (task: Task) => void;
}

export const useCollaboration = ({ task, currentUser, onUpdateTask }: UseCollaborationProps) => {
  const [isCollaborator, setIsCollaborator] = useState(false);
  const [userRole, setUserRole] = useState<Collaborator['role'] | null>(null);

  useEffect(() => {
    const collaborator = task.collaborators?.find(c => c.id === currentUser);
    setIsCollaborator(!!collaborator || task.owner === currentUser);
    setUserRole(collaborator?.role || (task.owner === currentUser ? 'owner' : null));
  }, [task.collaborators, task.owner, currentUser]);

  const addCollaborator = (email: string, role: Collaborator['role'] = 'editor') => {
    if (!userRole || userRole === 'viewer') return;

    const newCollaborator: Collaborator = {
      id: Date.now().toString(), // In a real app, this would be the actual user ID
      name: email.split('@')[0],
      email,
      role,
      joinedAt: new Date(),
    };

    const activityLog: ActivityLog = {
      id: Date.now().toString(),
      taskId: task.id,
      userId: currentUser,
      action: 'updated',
      timestamp: new Date(),
      details: {
        field: 'collaborators',
        oldValue: JSON.stringify(task.collaborators),
        newValue: JSON.stringify([...task.collaborators, newCollaborator])
      }
    };

    onUpdateTask({
      ...task,
      collaborators: [...task.collaborators, newCollaborator],
      activityLog: [...task.activityLog, activityLog]
    });
  };

  const removeCollaborator = (collaboratorId: string) => {
    if (!userRole || userRole === 'viewer') return;

    const activityLog: ActivityLog = {
      id: Date.now().toString(),
      taskId: task.id,
      userId: currentUser,
      action: 'updated',
      timestamp: new Date(),
      details: {
        field: 'collaborators',
        oldValue: JSON.stringify(task.collaborators),
        newValue: JSON.stringify(task.collaborators.filter(c => c.id !== collaboratorId))
      }
    };

    onUpdateTask({
      ...task,
      collaborators: task.collaborators.filter(c => c.id !== collaboratorId),
      activityLog: [...task.activityLog, activityLog]
    });
  };

  const updateCollaboratorRole = (collaboratorId: string, newRole: Collaborator['role']) => {
    if (!userRole || userRole !== 'owner') return;

    const collaborators = task.collaborators.map(c => 
      c.id === collaboratorId ? { ...c, role: newRole } : c
    );

    const activityLog: ActivityLog = {
      id: Date.now().toString(),
      taskId: task.id,
      userId: currentUser,
      action: 'updated',
      timestamp: new Date(),
      details: {
        field: `collaborator_role_${collaboratorId}`,
        oldValue: task.collaborators.find(c => c.id === collaboratorId)?.role,
        newValue: newRole
      }
    };

    onUpdateTask({
      ...task,
      collaborators,
      activityLog: [...task.activityLog, activityLog]
    });
  };

  const addComment = (content: string) => {
    if (!isCollaborator) return;

    const comment: Comment = {
      id: Date.now().toString(),
      taskId: task.id,
      userId: currentUser,
      content,
      createdAt: new Date(),
    };

    const activityLog: ActivityLog = {
      id: Date.now().toString(),
      taskId: task.id,
      userId: currentUser,
      action: 'commented',
      timestamp: new Date(),
      details: {
        comment: content
      }
    };

    onUpdateTask({
      ...task,
      comments: [...task.comments, comment],
      activityLog: [...task.activityLog, activityLog]
    });
  };

  const canEdit = userRole === 'editor' || userRole === 'owner';
  const canManageCollaborators = userRole === 'owner';

  return {
    isCollaborator,
    userRole,
    canEdit,
    canManageCollaborators,
    addCollaborator,
    removeCollaborator,
    updateCollaboratorRole,
    addComment,
  };
};
