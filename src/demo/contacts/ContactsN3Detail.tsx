/**
 * @module ContactsN3Detail
 * @description Esqueleto visual (wireframe) del Panel N3 — Módulo Core CRM (Contactos).
 * Etapa 2: componente funcional independiente, inyectado en el espacio físico N3
 * del LayoutDemo.tsx mediante el principio de Layout Decoupling.
 *
 * Encapsulación: este componente NO conoce el módulo de Chats. Comparte únicamente
 * el ancho/alto provisto por el contenedor maestro (w-full h-full).
 * Recibe contactId por props y resuelve el contacto desde el array demo local.
 */

import React from 'react';
import { ChevronLeft, Phone, Mail, MapPin, Tag, NotebookPen, MessageCircleMore, PenLine, Building2 } from 'lucide-react';
import type { LeadStage } from '../../types';
import { DEMO_CRM_CONTACTS } from './mockContacts';

/* ─── Config de etapas del lead (colores semánticos) ─── */
const STAGE_META: Record<LeadStage, { label: string; className: string; dot: string }> = {
  Lead:       { label: 'Lead',       className: 'bg-black/5 text-gray-700/90 border-black/5',         dot: 'bg-gray-400/80' },
  Contacted:  { label: 'Contactado', className: 'bg-blue-500/10 text-blue-700/90 border-transparent',  dot: 'bg-blue-500' },
  Scheduled:  { label: 'Agendado',   className: 'bg-amber-500/10 text-amber-700/90 border-transparent', dot: 'bg-amber-500' },
  Checkout:   { label: 'Checkout',   className: 'bg-violet-500/10 text-violet-700/90 border-transparent', dot: 'bg-violet-500' },
  Purchased:  { label: 'Comprado',   className: 'bg-emerald-500/10 text-emerald-700/90 border-transparent', dot: 'bg-emerald-500' },
  Lost:       { label: 'Perdido',    className: 'bg-red-500/10 text-red-700/90 border-transparent',     dot: 'bg-red-500' },
};

export interface ContactsN3DetailProps {
  /** Id del contacto a mostrar en el detalle */
  contactId?: string | null;
  /** Callback "atrás" — usado por el LayoutDemo para volver a N2 (móvil) */
  onBackClick?: () => void;
  /** Tema del shell maestro (dark/light) para adaptar colores base */
  isShellDark?: boolean;
}

export const ContactsN3Detail: React.FC<ContactsN3DetailProps> = ({
  contactId = null,
  onBackClick,
  isShellDark = false,
}) => {
  /* Resolver el contacto desde el array demo local (encapsulado) */
  const contact = DEMO_CRM_CONTACTS.find((c) => c.id === contactId) ?? null;

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((part) => part.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();

  /* ─── Empty state: sin contacto seleccionado ─── */
  if (!contact) {
    return (
      <div className={`w-full h-full flex flex-col overflow-hidden transition-colors duration-500 ${
        isShellDark ? 'bg-transparent text-white' : 'bg-transparent text-gray-900'
      }`}>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <Building2 size={40} className={isShellDark ? 'text-gray-700 mb-3' : 'text-gray-300 mb-3'} />
          <h3 className={`text-base font-semibold ${isShellDark ? 'text-white' : 'text-gray-900'}`}>
            Ficha del Contacto
          </h3>
          <p className={`text-sm mt-1.5 leading-relaxed max-w-xs ${isShellDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Selecciona un contacto de la lista para ver su ficha CRM con etapa, interés y datos de contacto.
          </p>
        </div>
      </div>
    );
  }

  const stage = STAGE_META[contact.leadStage] ?? STAGE_META.Lead;

  return (
    <div className={`w-full h-full flex flex-col overflow-hidden select-none transition-colors duration-500 ${
      isShellDark ? 'bg-transparent text-white' : 'bg-transparent text-gray-900'
    }`}>
      {/* ─── Header N3 ─── */}
      <div className={`flex items-center gap-3 p-4 flex-shrink-0 transition-colors duration-500 ${
        isShellDark ? 'bg-transparent' : 'bg-white/80 backdrop-blur-md'
      }`}>
        <button
          type="button"
          onClick={onBackClick}
          title="Volver a la lista"
          className={`md:hidden w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
            isShellDark
              ? 'text-gray-400 hover:bg-white/10 hover:text-white'
              : 'text-gray-500 hover:bg-black/5 hover:text-gray-700'
          }`}
        >
          <ChevronLeft size={18} />
        </button>

        <span className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
          isShellDark
            ? 'bg-white/10 text-fuchsia-300'
            : 'bg-gradient-to-br from-gray-900 to-gray-700 text-white'
        }`}>
          {getInitials(contact.name)}
        </span>

        <div className="min-w-0 flex-1">
          <p className={`font-semibold text-sm truncate ${isShellDark ? 'text-white' : 'text-gray-900'}`}>
            {contact.name}
          </p>
          <p className={`text-xs truncate ${isShellDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {contact.email}
          </p>
        </div>

        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border flex-shrink-0 ${stage.className}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${stage.dot}`} />
          {stage.label}
        </span>
      </div>

      {/* ─── Cuerpo N3 — Ficha del Lead ─── */}
      <div className={`flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4 bg-transparent`}>
        {/* Tarjeta de resumen de datos del lead */}
        <div className={`rounded-2xl p-4 sm:p-5 border transition-colors duration-500 ${
          isShellDark ? 'bg-white/5 border-white/10' : 'bg-white/80 backdrop-blur-md border-black/5'
        }`}>
          <h4 className={`text-[11px] font-bold uppercase tracking-wide mb-3 ${isShellDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Datos del Contacto
</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Teléfono */}
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isShellDark ? 'bg-white/10 text-fuchsia-400' : 'bg-black/5 text-gray-500'
              }`}>
                <Phone size={14} />
              </span>
              <div className="min-w-0">
                <p className={`text-[10px] font-medium uppercase tracking-wide ${isShellDark ? 'text-gray-600' : 'text-gray-400'}`}>
                  Teléfono
                </p>
                <p className={`text-sm font-semibold truncate ${isShellDark ? 'text-white' : 'text-gray-900'}`}>
                  {contact.phone || '—'}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isShellDark ? 'bg-white/10 text-fuchsia-400' : 'bg-black/5 text-gray-500'
              }`}>
                <Mail size={14} />
              </span>
              <div className="min-w-0">
                <p className={`text-[10px] font-medium uppercase tracking-wide ${isShellDark ? 'text-gray-600' : 'text-gray-400'}`}>
                  Email
                </p>
                <p className={`text-sm font-semibold truncate ${isShellDark ? 'text-white' : 'text-gray-900'}`}>
                  {contact.email}
                </p>
              </div>
            </div>

            {/* Ciudad */}
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isShellDark ? 'bg-white/10 text-fuchsia-400' : 'bg-black/5 text-gray-500'
              }`}>
                <MapPin size={14} />
              </span>
              <div className="min-w-0">
                <p className={`text-[10px] font-medium uppercase tracking-wide ${isShellDark ? 'text-gray-600' : 'text-gray-400'}`}>
                  Ciudad
                </p>
                <p className={`text-sm font-semibold truncate ${isShellDark ? 'text-white' : 'text-gray-900'}`}>
                  {contact.city || '—'}
                </p>
              </div>
            </div>

            {/* Interés */}
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isShellDark ? 'bg-white/10 text-fuchsia-400' : 'bg-black/5 text-gray-500'
              }`}>
                <Tag size={14} />
              </span>
              <div className="min-w-0">
                <p className={`text-[10px] font-medium uppercase tracking-wide ${isShellDark ? 'text-gray-600' : 'text-gray-400'}`}>
                  Interés
                </p>
                <p className={`text-sm font-semibold truncate ${isShellDark ? 'text-white' : 'text-gray-900'}`}>
                  {contact.interest || '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjeta de pipeline: etapa + temperatura */}
        <div className={`rounded-2xl p-4 sm:p-5 border transition-colors duration-500 ${
          isShellDark ? 'bg-white/5 border-white/10' : 'bg-white/80 backdrop-blur-md border-black/5'
        }`}>
          <h4 className={`text-[11px] font-bold uppercase tracking-wide mb-3 ${isShellDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Pipeline Comercial
          </h4>

          <div className="flex flex-col gap-2.5">
            {/* Etapa actual */}
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isShellDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Etapa actual
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${stage.className}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${stage.dot}`} />
                {stage.label}
              </span>
            </div>

            {/* Nivel de temperatura (barras) */}
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isShellDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Temperatura del lead
              </span>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-5 h-1.5 rounded-full transition-colors ${
                      (contact.leadLevel ?? 0) > i
                        ? i < 2
                          ? 'bg-blue-400'
                          : i < 4
                            ? 'bg-amber-400'
                            : 'bg-red-400'
                        : isShellDark
                          ? 'bg-white/10'
                          : 'bg-black/5'
                    }`}
                  />
                ))}
                <span className={`ml-1.5 text-[11px] font-semibold ${isShellDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {contact.leadLevel ?? 0}/5
                </span>
              </div>
            </div>

            {/* Fuente de origen */}
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isShellDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Fuente
              </span>
              <span className={`text-sm font-semibold capitalize ${isShellDark ? 'text-white' : 'text-gray-900'}`}>
                {contact.source || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Acciones rápidas (wireframe visual) */}
        <div className="grid grid-cols-3 gap-2.5">
          <button
            type="button"
            className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
              isShellDark
                ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                : 'bg-white/60 border-black/5 text-gray-700 hover:bg-black/5'
            }`}
          >
            <MessageCircleMore size={16} className={isShellDark ? 'text-fuchsia-400' : 'text-gray-500'} />
            Chat
          </button>
          <button
            type="button"
            className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
              isShellDark
                ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                : 'bg-white/60 border-black/5 text-gray-700 hover:bg-black/5'
            }`}
          >
            <NotebookPen size={16} className={isShellDark ? 'text-fuchsia-400' : 'text-gray-500'} />
            Notas
          </button>
          <button
            type="button"
            className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
              isShellDark
                ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                : 'bg-white/60 border-black/5 text-gray-700 hover:bg-black/5'
            }`}
          >
            <PenLine size={16} className={isShellDark ? 'text-fuchsia-400' : 'text-gray-500'} />
            Editar
          </button>
        </div>

        {/* Última interacción */}
        <div className={`rounded-2xl p-4 border transition-colors duration-500 ${
          isShellDark ? 'bg-amber-500/5 border-amber-400/10' : 'bg-amber-500/10 border-amber-500/10'
        }`}>
          <h4 className={`text-[11px] font-bold uppercase tracking-wide mb-1.5 ${
            isShellDark ? 'text-amber-300' : 'text-amber-600'
          }`}>
            Última interacción · {contact.lastTime || '—'}
          </h4>
          <p className={`text-sm leading-snug ${isShellDark ? 'text-gray-300' : 'text-gray-800'}`}>
            {contact.lastMessage || 'Sin mensajes recientes'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactsN3Detail;
