"use client";

import { Droppable, DroppableStateSnapshot } from '@hello-pangea/dnd';
import { Task } from '../types/task';
import { DraggableTask } from './DraggableTask';

interface TaskListProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
  onReorderTasks: (tasks: Task[]) => void;
  onTaskClick: (task: Task) => void;
  droppableId: string;
}

export const TaskList = ({ tasks, onUpdateTask, onReorderTasks, onTaskClick, droppableId }: TaskListProps) => {
  return (
    <Droppable droppableId={droppableId}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`space-y-4 min-h-[100px] ${snapshot?.isDraggingOver ? 'drop-target' : ''}`}
        >
          {tasks.map((task, index) => (
            <DraggableTask
              key={task.id}
              task={task}
              index={index}
              onUpdateTask={onUpdateTask}
              onClick={onTaskClick}
            />
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};
