import { BaseEditor } from 'slate';
import { ReactEditor } from 'slate-react';

// Define custom types for the editor
export type CustomEditor = BaseEditor & ReactEditor;

// Define custom element types
export type ParagraphElement = {
  type: 'paragraph';
  children: CustomText[];
};

export type HeadingElement = {
  type: 'heading';
  level: number;
  children: CustomText[];
};

export type CustomElement = ParagraphElement | HeadingElement;

// Define custom text types
export type FormattedText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

export type CustomText = FormattedText;

// Extend the Slate types
declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

// Editor configuration
export const HOTKEYS: Record<string, 'bold' | 'italic' | 'underline'> = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
};

export const LIST_TYPES = ['numbered-list', 'bulleted-list'];
export const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify'];

// Initial editor value
export const initialValue = [
  {
    type: 'paragraph' as const,
    children: [{ text: '' }],
  },
];
