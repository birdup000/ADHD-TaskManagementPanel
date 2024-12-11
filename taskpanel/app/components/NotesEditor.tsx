"use client";

import React, { useState } from 'react';
import IntegrationButton from './IntegrationButton';
import RichTextEditor from './RichTextEditor';
import SubNotesList from './SubNotesList';
import TaskSelectDialog from './TaskSelectDialog';
import { Task } from '../types/task';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  parentId?: string;
  linkedTaskIds?: string[];
  isInbox?: boolean;
}

interface NotesEditorProps {
  initialNotes?: Note[];
  tasks?: Task[];
  onLinkTask?: (noteId: string, taskId: string) => void;
}

const NotesEditor: React.FC<NotesEditorProps> = ({ initialNotes = [], tasks = [], onLinkTask }) => {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [newTagInput, setNewTagInput] = useState('');
  const [notionConnected, setNotionConnected] = useState(false);
  const [isTaskSelectOpen, setIsTaskSelectOpen] = useState(false);

  const connectToNotion = async () => {
    // TODO: Implement actual Notion OAuth flow
    try {
      const { syncNotesFromNotion } = await import('../utils/notion');
      const notionNotes = await syncNotesFromNotion();
      
      // Merge Notion notes with existing notes, updating existing ones and adding new ones
      const mergedNotes = notes.map(note => {
        const notionNote = notionNotes.find(n => n.id === note.id);
        return notionNote || note;
      });
      
      // Add new notes from Notion that don't exist locally
      notionNotes.forEach(notionNote => {
        if (!mergedNotes.some(note => note.id === notionNote.id)) {
          mergedNotes.push(notionNote);
        }
      });
      
      setNotes(mergedNotes);
      setNotionConnected(true);
    } catch (error) {
      console.error('Failed to fetch notes from Notion:', error);
      alert('Failed to connect to Notion. Please try again.');
    }
  };

  const syncWithNotion = async (note: Note) => {
    if (!notionConnected) return;
    
    try {
      const { syncNoteWithNotion } = await import('../utils/notion');
      // Ensure there's at least one line break to handle empty notes
      const formattedContent = note.content || '\n';
      await syncNoteWithNotion({
        ...note,
        content: formattedContent
      });
    } catch (error) {
      console.error('Failed to sync with Notion:', error);
      // Show error to user
      alert('Failed to sync note with Notion. Please try again.');
    }
  };

  const createNote = (parentId?: string) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: 'Untitled Note',
      content: '',
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      parentId,
      linkedTaskIds: [],
    };
    setNotes([...notes, newNote]);
    setSelectedNote(newNote);
    if (notionConnected) {
      syncWithNotion(newNote);
    }
  };

  const updateNote = (updatedNote: Note) => {
    setNotes(notes.map(note => 
      note.id === updatedNote.id ? updatedNote : note
    ));
    if (notionConnected) {
      syncWithNotion(updatedNote);
    }
  };

  const deleteNote = async (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId));
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
    }
    if (notionConnected) {
      try {
        const { deleteNoteFromNotion } = await import('../utils/notion');
        await deleteNoteFromNotion(noteId);
      } catch (error) {
        console.error('Failed to delete note from Notion:', error);
        alert('Failed to delete note from Notion. Please try again.');
      }
    }
  };

  const addTag = (note: Note, tag: string) => {
    if (!note.tags.includes(tag)) {
      const updatedNote = {
        ...note,
        tags: [...note.tags, tag],
        updatedAt: new Date(),
      };
      updateNote(updatedNote);
    }
    setNewTagInput('');
  };

  const removeTag = (note: Note, tagToRemove: string) => {
    const updatedNote = {
      ...note,
      tags: note.tags.filter(tag => tag !== tagToRemove),
      updatedAt: new Date(),
    };
    updateNote(updatedNote);
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 bg-[#2A2A2A] border-r border-gray-700 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Notes</h2>
          <div className="flex gap-2">
            <button
              onClick={() => createNote(undefined)}
              title="Create root note"
              className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              +
            </button>
            {selectedNote && (
              <button
                onClick={() => createNote(selectedNote.id)}
                title="Create subnote"
                className="p-2 rounded-lg bg-indigo-600/50 hover:bg-indigo-700 transition-colors"
              >
                ++
              </button>
            )}
          </div>
        </div>
        {!notionConnected && (
          <div className="mb-4">
            <IntegrationButton
              type="notion"
              onClick={connectToNotion}
            />
          </div>
        )}
        <div className="space-y-2">
          {notes.filter(note => !note.parentId).map(note => (
            <div key={note.id}>
              <div
                className={`p-3 rounded-lg cursor-pointer ${
                  selectedNote?.id === note.id
                    ? 'bg-[#333333]'
                    : 'hover:bg-[#333333]'
                }`}
                onClick={() => setSelectedNote(note)}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-medium truncate">{note.title}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                    className="text-gray-400 hover:text-red-400"
                  >
                    ×
                  </button>
                </div>
                <div className="text-sm text-gray-400">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </div>
              </div>
              <SubNotesList
                parentId={note.id}
                notes={notes}
                onSelectNote={setSelectedNote}
                selectedNoteId={selectedNote?.id}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      {selectedNote ? (
        <div className="flex-1 p-4">
          <div className="flex items-center gap-4 mb-4">
            <input
              type="text"
              value={selectedNote.title}
              onChange={(e) =>
                updateNote({
                  ...selectedNote,
                  title: e.target.value,
                  updatedAt: new Date(),
                })
              }
              className="flex-1 px-3 py-2 bg-[#333333] rounded-lg text-white text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => createNote(selectedNote.id)}
              title="Create subnote"
              className="p-2 rounded-lg bg-indigo-600/50 hover:bg-indigo-700 transition-colors"
            >
              Add subnote
            </button>
          </div>
          
          {/* Tags and Task Links */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedNote.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-indigo-600/30 rounded-full text-sm flex items-center gap-1"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(selectedNote, tag)}
                      className="hover:text-red-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newTagInput.trim()) {
                      addTag(selectedNote, newTagInput.trim());
                    }
                  }}
                  placeholder="Add tag..."
                  className="px-3 py-1.5 bg-[#333333] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={() => {
                    if (newTagInput.trim()) {
                      addTag(selectedNote, newTagInput.trim());
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors text-sm"
                >
                  Add
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Linked Tasks</h3>
              <div className="space-y-2">
                {selectedNote.linkedTaskIds?.map(taskId => {
                  const task = tasks?.find(t => t.id === taskId);
                  if (!task) return null;
                  return (
                    <div
                      key={taskId}
                      className="p-2 bg-[#333333] rounded-lg flex items-center justify-between"
                    >
                      <span className="truncate">{task.title}</span>
                      <button
                        onClick={() => {
                          updateNote({
                            ...selectedNote,
                            linkedTaskIds: selectedNote.linkedTaskIds?.filter(id => id !== taskId),
                          });
                        }}
                        className="text-gray-400 hover:text-red-400"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
                <button
                  onClick={() => setIsTaskSelectOpen(true)}
                  className="w-full p-2 rounded-lg bg-[#333333] hover:bg-[#444444] text-left text-sm text-gray-400"
                >
                  + Link a task
                </button>
              </div>
              <TaskSelectDialog
                isOpen={isTaskSelectOpen}
                onClose={() => setIsTaskSelectOpen(false)}
                tasks={tasks}
                excludeTaskIds={selectedNote.linkedTaskIds}
                onSelectTask={(task) => {
                  updateNote({
                    ...selectedNote,
                    linkedTaskIds: [...(selectedNote.linkedTaskIds || []), task.id],
                  });
                  if (onLinkTask) {
                    onLinkTask(selectedNote.id, task.id);
                  }
                }}
              />
            </div>
          </div>

          <RichTextEditor
            initialContent={selectedNote.content}
            onChange={(content) =>
              updateNote({
                ...selectedNote,
                content,
                updatedAt: new Date(),
              })
            }
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          Select a note or create a new one to get started
        </div>
      )}
    </div>
  );
};

export default NotesEditor;