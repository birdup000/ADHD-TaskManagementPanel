"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Task } from '../../types/task';
// import { User } from '../../types/user'; // Assuming a User type
import { debounce } from 'lodash';

// Dummy User type for now
interface User {
  id: string;
  name: string;
  avatarUrl?: string;
}

// Dummy list of users for assignment (replace with actual user fetching)
const mockUsers: User[] = [
  { id: 'user-1', name: 'John Smith', avatarUrl: 'https://i.pravatar.cc/150?u=john' },
  { id: 'user-2', name: 'Jane Doe', avatarUrl: 'https://i.pravatar.cc/150?u=jane' },
  { id: 'user-3', name: 'Alice Wonderland', avatarUrl: 'https://i.pravatar.cc/150?u=alice' },
  { id: 'user-4', name: 'Bob The Builder', avatarUrl: 'https://i.pravatar.cc/150?u=bob' },
  { id: 'user-unassigned', name: 'Unassigned', avatarUrl: '' }, // For unassigning
];


interface TaskAssignmentProps {
  task: Task;
  onUpdateTask: (updatedFields: Partial<Task & { assigneeId?: string | null }>) => Promise<void>;
  // If users are fetched from a central place, they could be passed as a prop
  // availableUsers?: User[];
}

const TaskAssignment: React.FC<TaskAssignmentProps> = ({ task, onUpdateTask }) => {
  // Assuming 'assigneeId' might be a field on the Task type, or handled by convention
  const [assignedUserId, setAssignedUserId] = useState<string | null>(task.assigneeId || null);
  const [users, setUsers] = useState<User[]>(mockUsers); // Later, fetch users
  const [showUserList, setShowUserList] = useState(false);

  useEffect(() => {
    setAssignedUserId(task.assigneeId || null);
  }, [task.assigneeId]);

  // In a real app, you might fetch users:
  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     // const fetchedUsers = await api.getUsers();
  //     // setUsers(fetchedUsers);
  //   };
  //   fetchUsers();
  // }, []);

  const debouncedUpdateAssignee = useCallback(
    debounce(async (newAssigneeId: string | null) => {
      await onUpdateTask({ assigneeId: newAssigneeId });
    }, 500),
    [onUpdateTask]
  );

  const handleAssignUser = (userId: string | null) => {
    setAssignedUserId(userId);
    debouncedUpdateAssignee(userId);
    setShowUserList(false); // Close dropdown after selection
  };

  const assignedUser = users.find(u => u.id === assignedUserId);

  return (
    <div className="relative space-y-2">
      <label htmlFor="task-assignee" className="block text-sm font-medium text-text-secondary">
        Assignee
      </label>
      <div className="flex items-center gap-2">
        <button
          id="task-assignee"
          type="button"
          onClick={() => setShowUserList(!showUserList)}
          className="w-full flex items-center justify-between p-2.5 bg-bg-tertiary border border-border-default rounded-md text-left focus:outline-none focus:ring-2 focus:ring-accent-focus focus:border-accent-primary"
          aria-haspopup="listbox"
          aria-expanded={showUserList}
        >
          {assignedUser && assignedUser.id !== 'user-unassigned' ? (
            <div className="flex items-center gap-2">
              <img
                src={assignedUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(assignedUser.name)}&background=random&size=32`}
                alt={`${assignedUser.name}'s avatar`}
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="text-sm text-text-primary">{assignedUser.name}</span>
            </div>
          ) : (
            <span className="text-sm text-text-disabled">Unassigned</span>
          )}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 text-text-secondary transition-transform ${showUserList ? 'rotate-180' : ''}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
        {assignedUser && assignedUser.id !== 'user-unassigned' && (
          <button
            onClick={() => handleAssignUser(null)} // Or handleAssignUser('user-unassigned') if that's how you model it
            className="p-1.5 text-text-secondary hover:text-status-error rounded-md focus:outline-none focus:ring-1 focus:ring-status-error"
            title="Unassign user"
            aria-label="Unassign user"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {showUserList && (
        <ul
          role="listbox"
          aria-labelledby="task-assignee"
          className="absolute z-10 mt-1 w-full bg-bg-secondary border border-border-default rounded-md shadow-lg max-h-60 overflow-auto focus:outline-none sm:text-sm"
        >
          {users.map(user => (
            <li
              key={user.id}
              onClick={() => handleAssignUser(user.id === 'user-unassigned' ? null : user.id)}
              className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-bg-tertiary text-text-primary ${assignedUserId === user.id ? 'bg-accent-muted' : ''}`}
              role="option"
              aria-selected={assignedUserId === user.id}
            >
              <div className="flex items-center gap-2">
                {user.id !== 'user-unassigned' && (
                    <img
                        src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=32`}
                        alt={`${user.name}'s avatar`}
                        className="w-6 h-6 rounded-full object-cover"
                    />
                )}
                <span className={`block truncate ${assignedUserId === user.id ? 'font-semibold' : 'font-normal'}`}>
                  {user.name}
                </span>
              </div>
              {assignedUserId === user.id && (
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-accent-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
       <p className="text-xs text-text-tertiary">
        Assign tasks to team members for clear responsibility. (Mocked users)
      </p>
    </div>
  );
};

export default TaskAssignment;
