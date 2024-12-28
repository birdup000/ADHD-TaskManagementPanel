'use client';

import React, { useMemo, useCallback, useState } from 'react';
import { createEditor, Descendant, Editor, Element as SlateElement, Node as SlateNode, Text } from 'slate';
import { Slate, Editable, withReact, ReactEditor, RenderElementProps, RenderLeafProps } from 'slate-react';
// Using the same type from EditorConfig
import { CustomEditor } from './EditorConfig';
import isHotkey from 'is-hotkey';
import { initializeAGiXT } from '../utils/agixt';
import { FormatButton } from './FormatButton';
import { toggleMark } from './editorUtils';

interface AIEnhancedRichTextEditorProps {
  placeholder?: string;
  initialContent?: string;
  onChange?: (content: string) => void;
  onCreateTask?: (title: string, description: string) => void;
}

const ELEMENT_TYPES = {
  paragraph: 'paragraph',
  heading1: 'heading',
  heading2: 'heading',
  heading3: 'heading',
  bulletList: 'paragraph',
  numberList: 'paragraph',
  listItem: 'paragraph',
  blockquote: 'paragraph',
  codeBlock: 'paragraph',
} as const;

const MARK_TYPES = {
  bold: 'bold',
  italic: 'italic',
  underline: 'underline',
  code: 'code',
  strikethrough: 'strikethrough',
} as const;

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
  'mod+shift+s': 'strikethrough',
};

const serialize = (nodes: Descendant[]): string => {
  return nodes.map(n => SlateNode.string(n)).join('\n');
};

const deserialize = (text: string): Descendant[] => {
  const lines = text.split('\n');
  return lines.map(line => ({
    type: 'paragraph',
    children: [{ text: line }],
  }));
};

interface FormattedText extends Text {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
  strikethrough?: boolean;
}

interface AGiXTSDK {
  runChain: (
    chainName: string,
    taskText: string,
    selectedAgent: string,
    isNewConversation: boolean,
    steps: number,
    options: any
  ) => Promise<any>;
  prompt: (
    selectedAgent: string,
    prompt: string,
    conversationName: string
  ) => Promise<any>;
}


const AIEnhancedRichTextEditor: React.FC<AIEnhancedRichTextEditorProps> = ({
  placeholder = 'Start typing...',
  initialContent = '',
  onChange,
  onCreateTask,
}) => {
  const editor = useMemo(() => withReact(createEditor()), []) as CustomEditor;
  const [editorValue, setEditorValue] = useState<Descendant[]>(() => 
    deserialize(initialContent)
  );
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const generateSuggestions = async (content: string) => {
    setIsProcessing(true);
    try {
      const backendUrl = 'http://localhost:7437';
      const authToken = '';
      const agixt = await initializeAGiXT(backendUrl, authToken) as unknown as AGiXTSDK;
      if (agixt) {
        if (typeof agixt.prompt === 'function') {
          const response = await agixt.runChain(
            'Task Management',
            `Analyze the following note content and suggest relevant tasks, tags, or related information:\n\n${content}`,
            'default',
            false,
            1,
            {}
          );

          try {
            const parsedResponse = JSON.parse(response);
            if (Array.isArray(parsedResponse)) {
              setAiSuggestions(parsedResponse);
            } else if (parsedResponse && parsedResponse.suggestions) {
              setAiSuggestions(parsedResponse.suggestions);
            }
          } catch (e) {
            console.error("Error parsing AI response", e);
            setAiSuggestions([response]);
          }
        }
      }
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
    } finally {
      setIsProcessing(false);
    };

  const renderElement = useCallback((props: RenderElementProps) => {
    switch (props.element.type) {
      case ELEMENT_TYPES.heading1:
        return <h1 {...props.attributes} className="text-2xl font-bold my-4">{props.children}</h1>;
      case ELEMENT_TYPES.heading2:
        return <h2 {...props.attributes} className="text-xl font-bold my-3">{props.children}</h2>;
      case ELEMENT_TYPES.heading3:
        return <h3 {...props.attributes} className="text-lg font-bold my-2">{props.children}</h3>;
      case ELEMENT_TYPES.bulletList:
        return <ul {...props.attributes} className="list-disc ml-6 my-2">{props.children}</ul>;
      case ELEMENT_TYPES.numberList:
        return <ol {...props.attributes} className="list-decimal ml-6 my-2">{props.children}</ol>;
      case ELEMENT_TYPES.listItem:
        return <li {...props.attributes}>{props.children}</li>;
      case ELEMENT_TYPES.blockquote:
        return <blockquote {...props.attributes} className="border-l-4 border-gray-500 pl-4 my-2">{props.children}</blockquote>;
      case ELEMENT_TYPES.codeBlock:
        return <pre {...props.attributes} className="bg-gray-800 p-4 rounded my-2"><code>{props.children}</code></pre>;
      default:
        return <p {...props.attributes} className="my-2">{props.children}</p>;
    }
  }, []);

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    let { attributes, children, leaf } = props;
    
    if (leaf.bold) {
      children = <strong>{children}</strong>;
    }
    if (leaf.italic) {
      children = <em>{children}</em>;
    }
    if (leaf.underline) {
      children = <u>{children}</u>;
    }
    if (leaf.code) {
      children = <code className="bg-gray-800 px-1 rounded">{children}</code>;
    }
    if (leaf.strikethrough) {
      children = <del>{children}</del>;
    }

    return <span {...attributes}>{children}</span>;
  }, []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    for (const hotkey in HOTKEYS) {
      if (isHotkey(hotkey, event)) {
        event.preventDefault();
        toggleMark(editor, HOTKEYS[hotkey as keyof typeof HOTKEYS]);
      }
    }
  }, [editor]);

  const handleChange = (value: Descendant[]) => {
    setEditorValue(value);
    const content = serialize(value);
    onChange?.(content);

    if (content.length > 50) {
      generateSuggestions(content);
    }
  };

  return (
    <div className="bg-[#2A2A2A] rounded-lg p-4">
      <Slate
        editor={editor}
        initialValue={editorValue}
        onChange={handleChange}
      >
        <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-700 pb-2">
          <FormatButton format={MARK_TYPES.bold} icon="B" />
          <FormatButton format={MARK_TYPES.italic} icon="I" />
          <FormatButton format={MARK_TYPES.underline} icon="U" />
          <FormatButton format={MARK_TYPES.code} icon="<>" />
          <FormatButton format={MARK_TYPES.strikethrough} icon="S" />
          <div className="border-l border-gray-700 mx-2" />
          <FormatButton format={ELEMENT_TYPES.heading1} icon="H1" isBlock />
          <FormatButton format={ELEMENT_TYPES.heading2} icon="H2" isBlock />
          <FormatButton format={ELEMENT_TYPES.heading3} icon="H3" isBlock />
          <div className="border-l border-gray-700 mx-2" />
          <FormatButton format={ELEMENT_TYPES.bulletList} icon="•" isBlock />
          <FormatButton format={ELEMENT_TYPES.numberList} icon="1." isBlock />
          <FormatButton format={ELEMENT_TYPES.blockquote} icon="\" isBlock />
          <FormatButton format={ELEMENT_TYPES.codeBlock} icon="⌘" isBlock />
        </div>

        <Editable
          className="min-h-[200px] text-gray-200 focus:outline-none"
          placeholder={placeholder}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={handleKeyDown}
        />

        {aiSuggestions.length > 0 && (
          <div className="mt-4 border-t border-gray-700 pt-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">AI Suggestions</h4>
            <div className="space-y-2">
              {aiSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-800/50 p-2 rounded"
                >
                  <span className="text-sm text-gray-300">{suggestion}</span>
                  <button
                    onClick={() => onCreateTask?.(suggestion, '')}
                    className="text-xs bg-indigo-600/50 hover:bg-indigo-600 px-2 py-1 rounded transition-colors"
                  >
                    Create Task
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Slate>
    </div>
  );
};
}

export default React.memo(AIEnhancedRichTextEditor);