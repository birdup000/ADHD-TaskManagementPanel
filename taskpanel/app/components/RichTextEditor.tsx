import React from 'react';

interface RichTextEditorProps {
  placeholder?: string;
  initialContent?: string;
  onChange?: (content: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  placeholder = 'Start typing...',
  initialContent = '',
  onChange,
}) => {
  return (
    <div className="bg-[#2A2A2A] rounded-lg p-4">
      <div className="flex gap-2 mb-4 border-b border-gray-700 pb-2">
        <button className="p-2 hover:bg-[#333333] rounded" title="Bold">
          <span className="font-bold">B</span>
        </button>
        <button className="p-2 hover:bg-[#333333] rounded" title="Italic">
          <span className="italic">I</span>
        </button>
        <button className="p-2 hover:bg-[#333333] rounded" title="Link">
          🔗
        </button>
        <button className="p-2 hover:bg-[#333333] rounded" title="Image">
          🖼️
        </button>
        <button className="p-2 hover:bg-[#333333] rounded" title="Code">
          &lt;/&gt;
        </button>
        <button className="p-2 hover:bg-[#333333] rounded" title="Table">
          📊
        </button>
      </div>
      <div
        className="min-h-[200px] text-gray-200 focus:outline-none"
        contentEditable
        placeholder={placeholder}
        dangerouslySetInnerHTML={{ __html: initialContent }}
        onInput={(e) => onChange?.(e.currentTarget.innerHTML)}
      />
    </div>
  );
};

export default RichTextEditor;