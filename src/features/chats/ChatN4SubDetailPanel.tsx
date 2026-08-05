/**
 * @module ChatN4SubDetailPanel
 * @description Panel taxonómico N4 (SubDetail — Focus Overlay) del módulo Chats.
 * Cuando N4 se activa desde ControlChat en N3:
 *   - AddTrigger (+) → ChatN4NoteForm (formulario para agregar nota)
 *   - Libreta (📋)   → ChatN4NotesHistory (historial de tarjetas de notas)
 * Componente [Panel] puro: se renderiza como 100% Focus Overlay sobre N3.
 * No define tipos locales.
 */

import React, { useState } from 'react';
import type { Contact, Note } from '../../types';
import { ChatN4Header } from './ChatN4Header';
import { ChatN4NoteForm } from './ChatN4NoteForm';
import { ChatN4NotesHistory } from './ChatN4NotesHistory';

export interface ChatN4SubDetailPanelProps {
  contact: Contact;
  onToggleAiAgent?: (enabled: boolean) => void;
  notes?: Note[];
  onAddNote?: (contactId: string, text: string) => void;
  onEditNote?: (noteId: string, newText: string) => void;
  onDeleteNote?: (noteId: string) => void;
  /** Callback obligatorio para cerrar N4 y retornar a N3 */
  onBack: () => void;
  /** Callback para abrir acciones desde N4 */
  onToggleN4?: () => void;
  /** Variante: "close" (Cerrar) para AddTrigger(+) muestra ChatN4NoteForm, "back" (Volver) para libreta(📋) muestra ChatN4NotesHistory */
  variant?: 'close' | 'back';
  /** Título del header N4. Default: "Agregar nota" para variant="close", "Notas de chat" para variant="back" */
  title?: string;
}

export const ChatN4SubDetailPanel: React.FC<ChatN4SubDetailPanelProps> = ({
  contact, notes = [], onAddNote, onEditNote, onDeleteNote, onBack, variant = 'close', title,
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const contactNotes = notes.filter((n) => n.contactId === contact.id);

  // Determinar si se muestra el formulario o el historial:
  // - variant='close' o editingNoteId → formulario, al guardar pasa a historial
  // - variant='back'  → historial directamente
  const isFormActive = (variant === 'close' && !showHistory) || editingNoteId !== null;
  const isEditing = editingNoteId !== null;
  const headerTitle = title ?? (isEditing ? 'Editar nota' : isFormActive ? 'Agregar nota' : 'Notas de chat');
  const headerVariant = isFormActive ? 'close' : 'back';

  const handleSaveNote = (text: string) => {
    if (editingNoteId) {
      onEditNote?.(editingNoteId, text);
      setEditingNoteId(null);
      setEditingText('');
    } else {
      onAddNote?.(contact.id, text);
    }
    // Transicionar al historial para que el usuario vea el resultado
    setShowHistory(true);
  };

  const handleEditStart = (noteId: string, text: string) => {
    setEditingNoteId(noteId);
    setEditingText(text);
    setShowHistory(false);
  };

  // isFormMode combina ambos: formulario nuevo + formulario edición
  const isFormMode = isFormActive;

  return (
    <div className="w-full h-full flex flex-col panel-n4-floating">
      {/* ChatN4Header — tamaño LG */}
      <ChatN4Header
        title={headerTitle}
        onBack={onBack}
        variant={headerVariant}
        size="lg"
      />

      {/* Contenido: formulario o historial con fade transition */}
      <div className="flex-1 relative overflow-hidden">
        {/* Formulario */}
        <div
          className={`absolute inset-0 transition-all duration-200 ease-out ${
            isFormMode ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
          }`}
        >
          <ChatN4NoteForm onSave={handleSaveNote} initialText={editingText} />
        </div>
        {/* Historial */}
        <div
          className={`absolute inset-0 transition-all duration-200 ease-out ${
            !isFormMode ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          <ChatN4NotesHistory
            notes={contactNotes}
            onDelete={(noteId) => onDeleteNote?.(noteId)}
            onEditStart={handleEditStart}
          />
        </div>
      </div>
    </div>
  );
};
