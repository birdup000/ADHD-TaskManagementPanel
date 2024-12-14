"use client";

import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Task } from '../types/task';
import TaskCard from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
  onReorderTasks: (tasks: Task[]) => void;
  onTaskClick: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  droppableId: string;
  listId: string;
}

export const TaskList = ({ tasks, onUpdateTask, onReorderTasks, onTaskClick, onDeleteTask, droppableId, listId }: TaskListProps) => {
  return (
    <Droppable droppableId={droppableId}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`space-y-4 min-h-[100px] ${snapshot?.isDraggingOver ? 'drop-target' : ''}`}
        >
          <div className="text-gray-500 text-sm mb-2">List ID: {listId}</div>
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-xl mb-2">✨</p>
              <p>No tasks here</p>
              <p className="text-sm text-gray-500">Drag tasks here or create a new one</p>
            </div>
          ) : (
            tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <TaskCard
                      task={task}
                      onClick={() => onTaskClick(task)}
                      onDelete={() => onDeleteTask(task)}
                      onUpdateTask={onUpdateTask}
                    />
                  </div>
                )}
              </Draggable>
            ))
          )}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};
