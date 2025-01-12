import React, { useState, useEffect } from 'react';
import { Task } from './TaskPanel';
import { useAICalendarSuggestions } from '../hooks/useAICalendarSuggestions';

interface AICalendarEditorProps {
  task: Task | null;
  onSave: (updates: CalendarEntryUpdate) => void;
  onCancel: () => void;
  startDate?: Date;
  endDate?: Date;
}

interface CalendarEntryUpdate {
  taskId: string;
  startDate: Date;
  endDate: Date;
  title?: string;
  description?: string;
}

export const AICalendarEditor: React.FC<AICalendarEditorProps> = ({
  task,
  onSave,
  onCancel,
  startDate,
  endDate
}) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [start, setStart] = useState(startDate || new Date());
  const [end, setEnd] = useState(endDate || new Date());
  const [aiSuggestions, setAiSuggestions] = useState<CalendarEntryUpdate[]>([]);

  const { loading, suggestions, generateSuggestions } = useAICalendarSuggestions(task);

  const generateAISuggestions = async () => {
    try {
      await generateSuggestions(start);
      if (!suggestions) return;
      
      const formattedSuggestions = suggestions.map(suggestion => ({
        taskId: task?.id || '',
        startDate: suggestion.startDate,
        endDate: suggestion.endDate,
        title: `AI Suggestion (${Math.min(Math.round(suggestion.confidence * 100), 100)}% confidence)`,
        description: suggestion.reasoning
      }));
      setAiSuggestions(formattedSuggestions);
    } catch (error) {
      console.error('Failed to generate AI suggestions:', error);
      // Set empty suggestions to clear any stale data
      setAiSuggestions([]);
    }
  };

  const handleSave = () => {
    if (!task) return;
    
    // Validate dates
    if (start >= end) {
      console.error('Invalid date range: start date must be before end date');
      return;
    }
    
    // Ensure we have required fields
    if (!title.trim()) {
      console.error('Title is required');
      return;
    }
    
    onSave({
      taskId: task.id,
      startDate: start,
      endDate: end,
      title: title.trim(),
      description: description.trim()
    });
  };

  return (
    <div className="p-4 bg-background border rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Edit Calendar Entry</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>
        
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Time</label>
            <input
              type="datetime-local"
              value={start.toISOString().slice(0, 16)}
              onChange={(e) => setStart(new Date(e.target.value))}
              className="p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">End Time</label>
            <input
              type="datetime-local"
              value={end.toISOString().slice(0, 16)}
              onChange={(e) => setEnd(new Date(e.target.value))}
              className="p-2 border rounded"
            />
          </div>
        </div>

        <button
          onClick={generateAISuggestions}
          className="w-full bg-primary/10 hover:bg-primary/20 text-primary p-2 rounded"
        >
          Get AI Suggestions
        </button>

        {aiSuggestions.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">AI Suggested Times:</h4>
            <div className="space-y-2">
              {aiSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setStart(suggestion.startDate);
                    setEnd(suggestion.endDate);
                  }}
                  className="block w-full text-left p-2 hover:bg-primary/5 rounded"
                >
                  {suggestion.title}: {suggestion.startDate.toLocaleString()} - {suggestion.endDate.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};