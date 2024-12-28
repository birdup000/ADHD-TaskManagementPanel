import React from 'react';
import { Editor } from 'slate';
import { useSlate } from 'slate-react';
import { isBlockActive, isMarkActive, toggleBlock, toggleMark } from './editorUtils';

interface FormatButtonProps {
  format: string;
  icon: string;
  isBlock?: boolean;
}

export const FormatButton: React.FC<FormatButtonProps> = ({ format, icon, isBlock = false }) => {
  const editor = useSlate();
  const isActive = isBlock ? isBlockActive(editor, format) : isMarkActive(editor, format);
  
  return (
    <button
      className={`p-2 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
      onMouseDown={(e) => {
        e.preventDefault();
        if (isBlock) {
          toggleBlock(editor, format);
        } else {
          toggleMark(editor, format);
        }
      }}
    >
      {icon}
    </button>
  );
};