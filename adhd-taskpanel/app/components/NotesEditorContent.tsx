import React from 'react';

const NotesEditorContent: React.FC<{
  initialContent?: string;
  onChange: (content: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}> = ({ initialContent = '', onChange, readOnly = false, placeholder }) => {
  return (
    <div
      className="prose prose-invert max-w-none focus:outline-none"
      contentEditable={!readOnly}
      onInput={(e) => {
        const content = e.currentTarget.innerHTML;
        onChange(content);
      }}
      dangerouslySetInnerHTML={{ __html: initialContent }}
      data-placeholder={placeholder || "Start typing..."}
    />
  );
};

export default NotesEditorContent;