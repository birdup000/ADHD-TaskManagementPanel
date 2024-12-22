"use client";

import React from 'react';
import { Task } from '../types/task';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface TaskPriorityMatrixProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
  className?: string;
}

type QuadrantType = 'urgent-important' | 'not-urgent-important' | 'urgent-not-important' | 'not-urgent-not-important';

const TaskPriorityMatrix: React.FC<TaskPriorityMatrixProps> = ({
  tasks,
  onTaskClick,
  onUpdateTask,
  className = '',
}) => {
  const getQuadrantTasks = (quadrant: QuadrantType) => {
    return tasks.filter(task => {
      const isUrgent = task.dueDate ? new Date(task.dueDate) <= new Date(Date.now() + 24 * 60 * 60 * 1000) : false;
      const isImportant = task.priority === 'high';

      switch (quadrant) {
        case 'urgent-important':
          return isUrgent && isImportant;
        case 'not-urgent-important':
          return !isUrgent && isImportant;
        case 'urgent-not-important':
          return isUrgent && !isImportant;
        case 'not-urgent-not-important':
          return !isUrgent && !isImportant;
      }
    });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceQuadrant = result.source.droppableId as QuadrantType;
    const destinationQuadrant = result.destination.droppableId as QuadrantType;
    const taskId = result.draggableId;
    const task = tasks.find(t => t.id === taskId);

    if (!task) return;

    // Update task priority and due date based on destination quadrant
    const updatedTask = { ...task };
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    switch (destinationQuadrant) {
      case 'urgent-important':
        updatedTask.priority = 'high';
        updatedTask.dueDate = tomorrow;
        break;
      case 'not-urgent-important':
        updatedTask.priority = 'high';
        updatedTask.dueDate = nextWeek;
        break;
      case 'urgent-not-important':
        updatedTask.priority = 'medium';
        updatedTask.dueDate = tomorrow;
        break;
      case 'not-urgent-not-important':
        updatedTask.priority = 'low';
        updatedTask.dueDate = nextWeek;
        break;
    }

    onUpdateTask(updatedTask);
  };

  const renderQuadrant = (title: string, description: string, id: QuadrantType, color: string) => (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="mb-4">
        <h3 className={`text-lg font-semibold ${color}`}>{title}</h3>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
      <Droppable droppableId={id}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="min-h-[200px] space-y-2"
          >
            {getQuadrantTasks(id).map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      snapshot.isDragging
                        ? 'bg-gray-600'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                    onClick={() => onTaskClick(task)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{task.title}</h4>
                        {task.dueDate && (
                          <p className="text-sm text-gray-400">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className={`w-2 h-2 rounded-full ${
                        task.priority === 'high'
                          ? 'bg-red-500'
                          : task.priority === 'medium'
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`} />
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );

  return (
    <div className={`${className}`}>
      <h2 className="text-xl font-semibold mb-6">Priority Matrix</h2>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderQuadrant(
            'Do First',
            'Urgent and Important',
            'urgent-important',
            'text-red-400'
          )}
          {renderQuadrant(
            'Schedule',
            'Not Urgent but Important',
            'not-urgent-important',
            'text-yellow-400'
          )}
          {renderQuadrant(
            'Delegate',
            'Urgent but Not Important',
            'urgent-not-important',
            'text-blue-400'
          )}
          {renderQuadrant(
            'Don\'t Do',
            'Not Urgent and Not Important',
            'not-urgent-not-important',
            'text-green-400'
          )}
        </div>
      </DragDropContext>
    </div>
  );
};

export default TaskPriorityMatrix;
