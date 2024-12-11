import { useEffect } from 'react';

interface ShortcutHandlers {
  onNewTask: () => void;
  onSearch: () => void;
  onToggleView: () => void;
}

export const useKeyboardShortcuts = ({ onNewTask, onSearch, onToggleView }: ShortcutHandlers) => {
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
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onNewTask, onSearch, onToggleView]);
};