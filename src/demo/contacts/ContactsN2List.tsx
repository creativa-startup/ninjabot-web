/**
 * @module ContactsN2List
 * @description Esqueleto visual (wireframe) del Panel N2 — Módulo Core CRM (Contactos).
 * Etapa 3: rediseño ultra-minimalista — directorio de networking en cuadrícula.
 * Cada tarjeta muestra solo: Avatar + punto verde online + Nombre debajo.
 * Los avatares se pegan uno al lado del otro llenando el ancho del panel;
 * cuando no caben más saltan a la siguiente fila (grid responsivo).
 * El contexto de navegación lo provee el header maestro persistente (ControlProfile).
 *
 * Encapsulación: este componente NO conoce el módulo de Chats. Comparte únicamente
 * el ancho/alto provisto por el contenedor maestro (w-full h-full).
 */

import React from 'react';
import { DEMO_CRM_CONTACTS } from './mockContacts';
import { Avatar } from '../../components/ui/Avatar';

export interface ContactsN2ListProps {
  /** Callback al seleccionar un contacto → dispara navegación N2 → N3 */
  onSelectContact: (contactId: string) => void;
  /** Id del contacto activo (para resaltar la tarjeta seleccionada) */
  selectedId?: string | null;
  /** Tema del shell maestro (dark/light) para adaptar colores base */
  isShellDark?: boolean;
}

export const ContactsN2List: React.FC<ContactsN2ListProps> = ({
  onSelectContact,
  selectedId = null,
  isShellDark = false,
}) => {
  return (
    <div className={`w-full h-full flex flex-col overflow-hidden select-none transition-colors duration-500 ${
      isShellDark ? 'bg-transparent text-white' : 'bg-transparent text-gray-900'
    }`}>
      {/* ─── Titular de sección minimalista (directorio de networking) ─── */}
      <h3 className="px-4 pt-4 pb-3 text-xs font-semibold uppercase tracking-wider text-secondary">
        Ninjazs
      </h3>

      {/* ─── Cuadrícula de avatares (scrollable) ─── */}
      <div className={`flex-1 overflow-y-auto px-3 pb-4 bg-transparent`}>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 gap-1">
          {DEMO_CRM_CONTACTS.map((contact) => {
            const isSelected = contact.id === selectedId;
            const initial = (contact.name || 'N').charAt(0).toUpperCase();
            const isOnline = contact.isOnline === true;
            return (
              <button
                key={contact.id}
                type="button"
                onClick={() => onSelectContact(contact.id)}
                title={contact.name}
                aria-label={`Ver perfil de ${contact.name}`}
                className={`flex flex-col items-center gap-1.5 rounded-xl py-2.5 px-1 cursor-pointer transition-colors ${
                  isSelected
                    ? isShellDark
                      ? 'bg-white/10'
                      : 'bg-black/5'
                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {/* Avatar + punto verde online */}
                <div className="relative shrink-0">
                  <Avatar
                    src={contact.avatar}
                    fallback={initial}
                    size="md"
                  />
                  {isOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 bg-emerald-500 border-white dark:border-transparent" />
                  )}
                </div>

                {/* Nombre debajo del avatar (truncado a 1 línea) */}
                <span className="w-full text-[11px] font-medium text-title truncate text-center leading-tight">
                  {contact.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ContactsN2List;