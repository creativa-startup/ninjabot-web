import React, { useState } from 'react';
import { ArrowLeft, StickyNote, Edit3, Trash2, ChevronDown, X, Save } from 'lucide-react';
import type { Note } from '../types';

interface ChatNotesTimelineProps {
  notes: Note[];
  onBack: () => void;
  onEdit: (noteId: string, newText: string) => void;
  onDelete: (noteId: string) => void;
}

export const ChatNotesTimeline: React.FC<ChatNotesTimelineProps> = ({ notes, onBack, onEdit, onDelete }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const sortedNotes = [...notes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleStartEdit = (note: Note) => {
    setEditingId(note.id);
    setEditText(note.text);
  };

  const handleSaveEdit = () => {
    if (editingId && editText.trim()) {
      onEdit(editingId, editText.trim());
      setEditingId(null);
      setEditText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#ececec] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 pb-3 shrink-0">
        <button onClick={onBack} className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-700">
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center">
            <StickyNote className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-extrabold text-sm text-gray-900">Notas ({notes.length})</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {sortedNotes.length === 0 ? (
          <div className="text-center text-gray-500 text-sm font-medium py-12">
            No hay notas para este contacto
          </div>
        ) : (
          sortedNotes.map((note) => {
            const isExpanded = expandedId === note.id;
            const isEditing = editingId === note.id;

            return (
              <div key={note.id} className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
                {/* Preview / Header */}
                <div className="p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full bg-gray-50 rounded-xl p-2.5 text-sm text-gray-900 border border-gray-200 outline-none focus:ring-2 focus:ring-black/20 resize-none font-medium"
                          rows={4}
                          autoFocus
                        />
                      ) : (
                        <p className={`text-sm text-gray-900 font-medium whitespace-pre-wrap ${!isExpanded ? 'line-clamp-2' : ''}`}>
                          {note.text}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      {isEditing ? (
                        <>
                          <button onClick={handleSaveEdit} disabled={!editText.trim()} className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-600 disabled:opacity-30">
                            <Save className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={handleCancelEdit} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleStartEdit(note)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => onDelete(note.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setExpandedId(isExpanded ? null : note.id)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Date */}
                  <div className="text-[10px] text-gray-500 font-medium mt-2">
                    {formatDate(note.createdAt)}
                    {note.updatedAt && note.updatedAt !== note.createdAt && (
                      <span className="text-gray-400"> (editada)</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};