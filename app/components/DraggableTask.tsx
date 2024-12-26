"use client";

import { Draggable } from '@hello-pangea/dnd';
import { Task } from '../types/task';
import { TaskCard } from './TaskCard';

interface DraggableTaskProps {
  task: Task;
  index: number;
  onUpdateTask: (task: Task) => void;
  onClick: (task: Task) => void;
  onDelete: () => void;
}

export const DraggableTask = ({ task, index, onUpdateTask, onClick, onDelete }: DraggableTaskProps) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <TaskCard 
            task={task}
            onClick={() => onClick(task)}
            onUpdateTask={onUpdateTask}
            onDelete={onDelete}
          />
        </div>
      )}
    </Draggable>
  );
};
