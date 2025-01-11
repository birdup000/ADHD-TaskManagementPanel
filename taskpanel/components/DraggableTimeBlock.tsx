import React from 'react';
import { Task } from './TaskPanel';

interface DraggableTimeBlockProps {
  task: Task;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDragEnd: (e: React.DragEvent) => void;
  suggestedStartDate?: string;
  suggestedEndDate?: string;
}

export function DraggableTimeBlock({
  task,
  onDragStart,
  onDragEnd,
  suggestedStartDate,
  suggestedEndDate
}: DraggableTimeBlockProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onDragEnd={onDragEnd}
      className="cursor-move bg-accent/10 hover:bg-accent/20 rounded-lg p-4 mb-2 transition-colors"
    >
      <h4 className="font-medium">{task.title}</h4>
      {suggestedStartDate && suggestedEndDate && (
        <div className="text-sm text-muted-foreground mt-1">
          <div>Start: {new Date(suggestedStartDate).toLocaleDateString()}</div>
          <div>End: {new Date(suggestedEndDate).toLocaleDateString()}</div>
        </div>
      )}
      <div className="text-xs text-muted-foreground mt-1">
        Drag to schedule
      </div>
    </div>
  );
}