import React, { useState } from 'react';
import { ArrowLeft, Save, StickyNote } from 'lucide-react';

interface ChatNoteFormProps {
  onSave: (text: string) => void;
  onCancel: () => void;
}

export const ChatNoteForm: React.FC<ChatNoteFormProps> = ({ onSave, onCancel }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSave(text.trim());
    setText('');
  };

  return (
    <div className="flex-1 flex flex-col p-4 bg-[#ececec]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <button onClick={onCancel} className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-700">
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center">
            <StickyNote className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-extrabold text-sm text-gray-900">Nueva Nota</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe una nota sobre este contacto..."
          className="flex-1 w-full bg-white rounded-2xl p-4 text-sm text-gray-900 border border-gray-200 shadow-xs outline-none focus:ring-2 focus:ring-black/20 resize-none font-medium min-h-[160px]"
          autoFocus
        />
        <div className="text-[10px] text-gray-500 mt-1.5 mb-3 font-medium">
          {new Date().toLocaleString('es-EC', { dateStyle: 'long', timeStyle: 'short' })}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-sm">
            Cancelar
          </button>
          <button type="submit" disabled={!text.trim()} className="flex-1 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl font-bold text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            <Save className="w-4 h-4" />
            Guardar Nota
          </button>
        </div>
      </form>
    </div>
  );
};