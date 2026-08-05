/**
 * @module ChatN4NotesHistory
 * @description Historial de tarjetas de notas dentro del panel N4 con cronología visual.
 * Layout 90/10: 10% timeline (punto + línea vertical), 90% tarjeta de nota.
 * Componente [Sub] puro: lista de notas con 2 botones toggle circulares (✏️ lápiz, 🗑️ tacho)
 * al estilo del botón + y pin de agregar nota.
 * La edición se delega a ChatN4SubDetailPanel que renderiza ChatN4NoteForm.
 * No incluye header — el header N4 lo provee ChatN4SubDetailPanel.
 */

import React from 'react';
import { Edit3, Trash2, StickyNote } from 'lucide-react';
import type { Note } from '../../types';

export interface ChatN4NotesHistoryProps {
  notes: Note[];
  onDelete: (noteId: string) => void;
  /** Emitido cuando se hace clic en el lápiz para editar desde ChatN4NoteForm */
  onEditStart?: (noteId: string, text: string) => void;
}

// Notas de demostración para el sandbox — visibles cuando no hay notas reales
const DEMO_NOTES: Note[] = [
  { id: 'demo-1', contactId: 'demo', text: 'Cliente interesado en el plan Pro con IA. Solicita demo para su equipo de ventas.', createdAt: '2025-07-28T10:30:00', updatedAt: '2025-07-28T10:30:00' },
  { id: 'demo-2', contactId: 'demo', text: 'Llamada programada para el viernes a las 15:00. Confirmar disponibilidad del equipo técnico.', createdAt: '2025-07-26T14:15:00', updatedAt: '2025-07-27T09:00:00' },
  { id: 'demo-3', contactId: 'demo', text: 'Presupuesto enviado: $299/mes por 12 meses con 2 meses gratis de cortesía.', createdAt: '2025-07-24T09:45:00' },
  { id: 'demo-4', contactId: 'demo', text: 'Cliente mencionó que su competidor usa una solución similar. Enviar comparativa de features.', createdAt: '2025-07-22T16:20:00' },
];

export const ChatN4NotesHistory: React.FC<ChatN4NotesHistoryProps> = ({ notes, onDelete, onEditStart }) => {
  // Si no hay notas reales, usar demo notes para mostrar el timeline visual
  const effectiveNotes = notes.length > 0 ? notes : DEMO_NOTES;
  const sortedNotes = [...effectiveNotes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-0">
      {sortedNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-gray-400 py-12 gap-2">
          <StickyNote className="w-8 h-8 text-gray-300" />
          <p className="text-sm font-medium">No hay notas para este contacto</p>
        </div>
      ) : (
        <div className="relative">
          {sortedNotes.map((note, index) => {
            const isLast = index === sortedNotes.length - 1;

            return (
              <div key={note.id} className="flex gap-3">
                {/* Timeline: 10% — punto + línea vertical */}
                <div className="flex flex-col items-center shrink-0 w-8">
                  <div className="w-3 h-3 rounded-full bg-gray-300 border-2 border-white/70 shrink-0 mt-1.5 z-10" />
                  {!isLast && (
                    <div className="w-0.5 flex-1 bg-black/5 min-h-[24px]" />
                  )}
                </div>

                {/* Card: 90% — tarjeta de nota */}
                <div className="flex-1 pb-4 min-w-0">
                  <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-black/5 overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.03)] transition-shadow">
                    <div className="p-3.5">
                      <div className="flex items-start justify-between gap-2">
                        {/* Text — sin expansión, siempre visible */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 font-medium whitespace-pre-wrap">
                            {note.text}
                          </p>
                        </div>

                        {/* Actions — lápiz + tacho, estilo circular como botón + y pin */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => onEditStart?.(note.id, note.text)}
                            className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.03)] active:scale-95 transition-all duration-150 ease-out"
                            title="Editar nota"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete(note.id)}
                            className="w-8 h-8 rounded-full bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.03)] active:scale-95 transition-all duration-150 ease-out"
                            title="Eliminar nota"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};