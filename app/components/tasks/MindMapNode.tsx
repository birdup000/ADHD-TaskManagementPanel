import React, { useState } from 'react';
import { MindMapNode as MindMapNodeType } from '../../types/mindmap';

interface MindMapNodeProps {
  node: MindMapNodeType;
  onSelect: (id: string) => void;
  onContentChange: (id: string, content: string) => void;
  selected: boolean;
}

const MindMapNode: React.FC<MindMapNodeProps> = ({
  node,
  onSelect,
  onContentChange,
  selected,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(node.content);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onContentChange(node.id, editContent);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      onContentChange(node.id, editContent);
    }
  };

  // Prevent node click when editing
  const handleEditorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <g
      transform={`translate(${node.x || 0},${node.y || 0})`}
      onClick={() => onSelect(node.id)}
      onDoubleClick={handleDoubleClick}
      className="cursor-pointer"
    >
      {/* Node background */}
      <rect
        x="-80"
        y="-25"
        width="160"
        height="50"
        rx="25"
        className={`${
          selected
            ? 'fill-accent-primary stroke-accent-primary'
            : node.status === 'task'
            ? 'fill-accent-secondary stroke-accent-secondary'
            : 'fill-bg-secondary stroke-border-default'
        }`}
      />
      {/* Inner shadow/highlight for depth */}
      <rect
        x="-78"
        y="-23"
        width="156"
        height="40"
        rx="20"
        className={`${
          selected
            ? 'fill-accent-primary stroke-accent-primary'
            : node.status === 'task'
            ? 'fill-accent-secondary stroke-accent-secondary'
            : 'fill-bg-secondary stroke-border-default'
        } opacity-50`}
      />

      {/* Node content */}
      {isEditing ? (
        <foreignObject 
          x="-75" 
          y="-20" 
          width="150" 
          height="40"
          onClick={handleEditorClick}
        >
          <input
            type="text"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full h-full bg-transparent border-none outline-none text-center text-sm px-2"
            autoFocus
          />
        </foreignObject>
      ) : (
        <>
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            className={`${
              selected || node.status === 'task' ? 'fill-white' : 'fill-text-primary'
            } text-sm font-medium`}
          >
            {node.content}
          </text>
          {/* Task indicator */}
          {node.status === 'task' && (
            <g transform="translate(-70, -18)">
              <rect
                width="16"
                height="16"
                rx="3"
                className="fill-white opacity-20"
              />
              <path
                d="M3 8l3.5 3.5L12 5"
                className="stroke-white stroke-2"
                fill="none"
              />
            </g>
          )}
        </>
      )}
    </g>
  );
};

export default MindMapNode;