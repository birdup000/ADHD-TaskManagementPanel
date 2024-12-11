"use client";

import { Droppable, DroppableStateSnapshot } from '@hello-pangea/dnd';
import { Task } from '../types/task';
import { DraggableTask } from './DraggableTask';

interface TaskListProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
  onReorderTasks: (tasks: Task[]) => void;
  onTaskClick: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  droppableId: string;
}

export const TaskList = ({ tasks, onUpdateTask, onReorderTasks, onTaskClick, onDeleteTask, droppableId }: TaskListProps) => {
  return (
    <Droppable droppableId={droppableId}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`space-y-4 min-h-[100px] ${snapshot?.isDraggingOver ? 'drop-target' : ''}`}
        >
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-xl mb-2">✨</p>
              <p>No tasks here</p>
              <p className="text-sm text-gray-500">Drag tasks here or create a new one</p>
            </div>
          ) : (
            tasks.map((task, index) => (
              <DraggableTask
                key={task.id}
                task={task}
                index={index}
                onClick={() => onTaskClick(task)}
                onDelete={() => onDeleteTask(task)}
                onUpdateTask={onUpdateTask}
              />
            ))
          )}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};
