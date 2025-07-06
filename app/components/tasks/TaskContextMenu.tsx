import React, { useRef, useEffect } from 'react';

import { Task } from '../../types/task'; // Import Task type

interface TaskContextMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onDelete?: () => void;
    onDuplicate?: () => void;
    onCopyLink?: () => void;
    anchorEl: HTMLElement | null;
    task?: Task | null;
}

const TaskContextMenu: React.FC<TaskContextMenuProps> = ({
    isOpen,
    onClose,
    onDelete,
    onDuplicate,
    onCopyLink,
    anchorEl,
    task
}) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node) && isOpen) {
                onClose();
            }
        };
        // Use mousedown to catch click before it triggers something else if menu is over it
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);


    if (!isOpen || !anchorEl) return null;

    const rect = anchorEl.getBoundingClientRect();
    // Position menu below anchor, ensuring it doesn't go off-screen horizontally
    const menuLeft = Math.min(
        rect.left + window.scrollX,
        window.innerWidth - (menuRef.current?.offsetWidth || 192) - 16 // 192px is w-48, 16px for padding
    );
    const menuTop = rect.bottom + window.scrollY + 8;

    const menuStyle: React.CSSProperties = {
        position: 'absolute', // Use absolute for better control within a potential portal
        top: `${menuTop}px`,
        left: `${menuLeft}px`,
        zIndex: 100, // High z-index
    };

    const handleAction = (action?: () => void) => {
        if (action) {
            action();
        }
        onClose();
    };

    return (
        // Portal this component in a real app for best stacking context handling
        <div
            ref={menuRef}
            className="bg-bg-elevated border border-border-light rounded-lg shadow-xl py-1.5 w-48 animate-fade-in" // Using w-48 from previous attempt
            style={menuStyle}
            role="menu"
            aria-orientation="vertical"
            aria-labelledby={anchorEl.id || undefined}
            onClick={(e) => e.stopPropagation()} // Prevent click on menu itself from closing it via overlay
        >
            {onDuplicate && (
                <button
                    onClick={() => handleAction(onDuplicate)}
                    className="w-full text-left px-3.5 py-2 text-sm text-text-primary hover:bg-accent-muted flex items-center gap-2.5 rounded-md"
                    role="menuitem"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-text-secondary">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                    </svg>
                    Duplicate Task
                </button>
            )}
            {onCopyLink && (
                <button
                    onClick={() => handleAction(onCopyLink)}
                    className="w-full text-left px-3.5 py-2 text-sm text-text-primary hover:bg-accent-muted flex items-center gap-2.5 rounded-md"
                    role="menuitem"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-text-secondary">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                    </svg>
                    Copy Link
                </button>
            )}
            {onDelete && (onDuplicate || onCopyLink) && <div className="my-1 border-t border-border-default mx-2.5"></div>}
            {onDelete && (
                <button
                    onClick={() => handleAction(onDelete)}
                    className="w-full text-left px-3.5 py-2 text-sm text-status-error hover:bg-status-errorBg hover:text-status-error flex items-center gap-2.5 rounded-md"
                    role="menuitem"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.243.096 3.222.261m3.222.261L11 5.296M8.856 5.296L8 5m5.25 0L13.75 8.25" />
                    </svg>
                    Delete Task
                </button>
            )}
        </div>
    );
};

export default TaskContextMenu;