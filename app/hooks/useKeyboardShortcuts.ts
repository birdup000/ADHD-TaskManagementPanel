import { useEffect } from 'react';

interface ShortcutHandlers {
  onNewTask: () => void;
  onSearch: () => void;
  onToggleView: () => void;
  onDelete?: () => void;
  onDeleteTask?: () => void;
}

export const useKeyboardShortcuts = ({ onNewTask, onSearch, onToggleView, onDelete, onDeleteTask }: ShortcutHandlers) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only trigger if not in an input/textarea
      if (['input', 'textarea'].includes((event.target as HTMLElement)?.tagName?.toLowerCase())) {
        return;
      }

      // Command/Ctrl + K - Focus search
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        onSearch();
      }
      // Command/Ctrl + N - New task
      else if ((event.metaKey || event.ctrlKey) && event.key === 'n') {
        event.preventDefault();
        onNewTask();
      }
      // Command/Ctrl + V - Toggle view
      else if ((event.metaKey || event.ctrlKey) && event.key === 'v') {
        event.preventDefault();
        onToggleView();
      }
       // Command/Ctrl + Delete - Delete task
      else if ((event.metaKey || event.ctrlKey) && event.key === 'Delete' && onDelete) {
        event.preventDefault();
        onDelete();
      }
      // Command/Ctrl + Shift + Delete - Delete task
      else if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'Delete' && onDeleteTask) {
        event.preventDefault();
        onDeleteTask();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onNewTask, onSearch, onToggleView, onDelete, onDeleteTask]);
};
