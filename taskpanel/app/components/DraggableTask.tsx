"use client";

import { Draggable } from '@hello-pangea/dnd';
import { Task } from '../types/task';
import TaskCard from './TaskCard';

interface DraggableTaskProps {
  task: Task;
  index: number;
  onUpdateTask: (task: Task) => void;
  onClick: (task: Task) => void;
}

export const DraggableTask = ({ task, index, onUpdateTask, onClick }: DraggableTaskProps) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <TaskCard {...task} onClick={() => onClick(task)} />
        </div>
      )}
    </Draggable>
  );
};
