/**
 * @module ChatN4NoteForm
 * @description Formulario para agregar/editar nota dentro del panel N4.
 * Componente [Sub] puro: textarea con botón icono de pin 📌 para guardar.
 * No incluye header — el header N4 lo provee ChatN4SubDetailPanel.
 */

import React, { useState, useEffect } from 'react';
import { Pin } from 'lucide-react';

export interface ChatN4NoteFormProps {
  onSave: (text: string) => void;
  initialText?: string;
}

export const ChatN4NoteForm: React.FC<ChatN4NoteFormProps> = ({ onSave, initialText = '' }) => {
  const [text, setText] = useState(initialText);

  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSave(text.trim());
    setText('');
  };

  return (
    <div className="flex-1 flex flex-col p-4">
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <textarea
          id="chat-note-textarea"
          name="chatNote"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe una nota sobre este contacto..."
          className="flex-1 w-full bg-black/5 rounded-2xl p-4 text-sm text-gray-900 border border-black/5 outline-none focus:ring-2 focus:ring-gray-900/20 resize-none font-medium min-h-[160px]"
          autoFocus
        />
        <div className="text-[10px] text-gray-500 mt-1.5 mb-3 font-medium">
          {new Date().toLocaleString('es-EC', { dateStyle: 'long', timeStyle: 'short' })}
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!text.trim()}
            className="w-11 h-11 rounded-full bg-brand hover:bg-gray-800 active:bg-gray-700 text-white flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.03)] disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all duration-150 ease-out"
            title="Fijar nota"
          >
            <Pin className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>
      </form>
    </div>
  );
};
