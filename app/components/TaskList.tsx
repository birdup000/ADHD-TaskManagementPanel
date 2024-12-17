"use client";

import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Task } from '../types/task';
import { TaskCard } from './TaskCard';

interface TaskListProps {
  droppableId: string;
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
  onTaskClick: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onReorderTasks: (tasks: Task[]) => void;
  listId: string;
}

export const TaskList: React.FC<TaskListProps> = ({
  droppableId,
  tasks,
  onUpdateTask,
  onTaskClick,
  onDeleteTask,
  onReorderTasks,
  listId
}) => {
  return (
    <Droppable droppableId={droppableId}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="space-y-4"
        >
          {tasks.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              index={index}
              onUpdateTask={onUpdateTask}
              onClick={() => onTaskClick(task)}
              onDelete={() => onDeleteTask(task)}
            />
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};
