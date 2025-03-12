import React, { useRef, useEffect } from 'react';

interface TaskContextMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  anchorEl: HTMLElement | null;
}

const TaskContextMenu: React.FC<TaskContextMenuProps> = ({
  isOpen,
  onClose,
  onDelete,
  anchorEl,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !anchorEl) return null;

  const rect = anchorEl.getBoundingClientRect();
  const menuStyle = {
    position: 'fixed' as const,
    top: `${rect.bottom + 5}px`,
    right: `${window.innerWidth - rect.right}px`,
  };

  return (
    <div
      ref={menuRef}
      className="bg-bg-secondary border border-border-default rounded-lg shadow-lg py-1 z-50"
      style={menuStyle}
    >
      <button
        onClick={() => {
          onDelete();
          onClose();
        }}
        className="w-full px-4 py-2 text-left text-sm hover:bg-bg-tertiary text-text-destructive
                 transition-colors duration-200 flex items-center gap-2"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        Delete Task
      </button>
    </div>
  );
};

export default TaskContextMenu;