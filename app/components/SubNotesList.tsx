import React from 'react';
import { Note } from './NotesEditor';

interface SubNotesListProps {
  parentId: string;
  notes: Note[];
  onSelectNote: (note: Note) => void;
  selectedNoteId?: string;
}

const SubNotesList: React.FC<SubNotesListProps> = ({
  parentId,
  notes,
  onSelectNote,
  selectedNoteId,
}) => {
  const subNotes = notes.filter(note => note.parentId === parentId);

  return (
    <div className="pl-4 space-y-1">
      {subNotes.map(note => (
        <div key={note.id}>
          <div
            className={`p-2 rounded-lg cursor-pointer flex items-center gap-2 ${
              selectedNoteId === note.id
                ? 'bg-[#333333]'
                : 'hover:bg-[#333333]'
            }`}
            onClick={() => onSelectNote(note)}
          >
            <span className="w-4 h-4 flex items-center justify-center text-gray-400">
              •
            </span>
            <span className="truncate flex-1">{note.title}</span>
          </div>
          <SubNotesList
            parentId={note.id}
            notes={notes}
            onSelectNote={onSelectNote}
            selectedNoteId={selectedNoteId}
          />
        </div>
      ))}
    </div>
  );
};

export default SubNotesList;