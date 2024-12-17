"use client";

import React, { useMemo, useCallback } from 'react';
import { createEditor, Descendant, Editor, Element as SlateElement, Text, Node as SlateNode } from 'slate';
import { Slate, Editable, withReact, RenderElementProps, RenderLeafProps } from 'slate-react';
import { CustomEditor, initialValue as defaultInitialValue, HOTKEYS } from './EditorConfig';
import isHotkey from 'is-hotkey';

interface RichTextEditorProps {
  placeholder?: string;
  initialContent?: string;
  onChange?: (content: string) => void;
}

// Convert plain text to Slate's format
const deserialize = (text: string): Descendant[] => {
  return [
    {
      type: 'paragraph' as const,
      children: [{ text: text || '' }],
    },
  ];
};

// Convert Slate's format to plain text
const serialize = (nodes: Descendant[]): string => {
  return nodes.map(n => SlateNode.string(n)).join('\n');
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  placeholder = 'Start typing...',
  initialContent = '',
  onChange,
}) => {
  const editor = useMemo(() => withReact(createEditor()), []);
  const [editorValue, setEditorValue] = React.useState<Descendant[]>(() => 
    deserialize(initialContent)
  );

  const renderElement = useCallback((props: RenderElementProps) => {
    const { element, attributes, children } = props;
    switch (element.type) {
      case 'heading':
        return React.createElement(`h${(element as any).level}`, attributes, children);
      default:
        return <p {...attributes}>{children}</p>;
    }
  }, []);

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    const { attributes, children, leaf } = props;
    let result = children;
    
    if (leaf.bold) {
      result = <strong>{result}</strong>;
    }
    if (leaf.italic) {
      result = <em>{result}</em>;
    }
    if (leaf.underline) {
      result = <u>{result}</u>;
    }

    return <span {...attributes}>{result}</span>;
  }, []);

  const handleHotkeys = useCallback((event: React.KeyboardEvent) => {
    for (const hotkey in HOTKEYS) {
      if (isHotkey(hotkey, event)) {
        event.preventDefault();
        const mark = HOTKEYS[hotkey as keyof typeof HOTKEYS];
        toggleMark(editor, mark as 'bold' | 'italic' | 'underline');
      }
    }
  }, [editor]);

  const toggleMark = (editor: CustomEditor, format: 'bold' | 'italic' | 'underline') => {
    const marks = Editor.marks(editor);
    const isActive = marks ? marks[format] === true : false;

    if (isActive) {
      Editor.removeMark(editor, format);
    } else {
      Editor.addMark(editor, format, true);
    }
  };

  const isMarkActive = (editor: CustomEditor, format: 'bold' | 'italic' | 'underline') => {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
  };

  const handleChange = (value: Descendant[]) => {
    setEditorValue(value);
    const content = serialize(value);
    onChange?.(content);
  };

  // Update editor value when initialContent changes
  React.useEffect(() => {
    const newValue = deserialize(initialContent);
    setEditorValue(newValue);
  }, [initialContent]);

  return (
    <div className="bg-[#2A2A2A] rounded-lg p-4">
      <div className="flex gap-2 mb-4 border-b border-gray-700 pb-2">
        <button
          className={`p-2 hover:bg-[#333333] rounded ${isMarkActive(editor, 'bold') ? 'bg-[#333333]' : ''}`}
          title="Bold"
          onMouseDown={(e: React.MouseEvent) => {
            e.preventDefault();
            toggleMark(editor, 'bold');
          }}
        >
          <span className="font-bold">B</span>
        </button>
        <button
          className={`p-2 hover:bg-[#333333] rounded ${isMarkActive(editor, 'italic') ? 'bg-[#333333]' : ''}`}
          title="Italic"
          onMouseDown={(e: React.MouseEvent) => {
            e.preventDefault();
            toggleMark(editor, 'italic');
          }}
        >
          <span className="italic">I</span>
        </button>
        <button
          className={`p-2 hover:bg-[#333333] rounded ${isMarkActive(editor, 'underline') ? 'bg-[#333333]' : ''}`}
          title="Underline"
          onMouseDown={(e: React.MouseEvent) => {
            e.preventDefault();
            toggleMark(editor, 'underline');
          }}
        >
          <span className="underline">U</span>
        </button>
      </div>
      <Slate
        editor={editor}
        initialValue={editorValue}
        onChange={handleChange}
      >
        <Editable
          className="min-h-[200px] text-gray-200 focus:outline-none"
          placeholder={placeholder}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={handleHotkeys}
        />
      </Slate>
    </div>
  );
};

export default RichTextEditor;
