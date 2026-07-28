import React from 'react';
import { Search, User } from 'lucide-react';
import type { Contact } from '../types';

interface ChatListPanelProps {
  contacts: Contact[];
  activeContactId: string | null;
  onSelectContact: (contact: Contact) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const ChatListPanel: React.FC<ChatListPanelProps> = ({
  contacts,
  activeContactId,
  onSelectContact,
  searchQuery,
  setSearchQuery,
}) => {
  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.lastMessage?.toLowerCase() ?? '').includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full flex flex-col bg-[#efeff0] sm:bg-[#f4f4f5] border-r border-gray-200 select-none overflow-hidden">
      {/* Search & Header Section */}
      <div className="p-3 bg-[#f8f8f8] sm:bg-white border-b border-gray-200 flex items-center gap-2 shrink-0">
        {/* Pill "Chats" badge matching screenshot */}
        <div className="bg-black text-white px-5 py-1.5 rounded-full font-bold text-sm tracking-wide shrink-0 shadow-2xs">
          Chats
        </div>

        {/* Search Bar */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar"
            className="w-full bg-[#d9d9d9] sm:bg-[#e4e4e7] text-gray-900 placeholder-gray-600 text-sm pl-4 pr-9 py-1.5 rounded-xl border-none outline-none focus:ring-2 focus:ring-black/20 font-medium"
          />
          <Search className="w-4 h-4 text-gray-600 absolute right-3 top-1/2 -translate-y-1/2 stroke-[2.2]" />
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-200/60">
        {filteredContacts.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm font-medium">
            No se encontraron chats
          </div>
        ) : (
          filteredContacts.map((contact) => {
            const isSelected = contact.id === activeContactId;

            return (
              <div
                key={contact.id}
                onClick={() => onSelectContact(contact)}
                className={`p-3.5 sm:p-4 transition-colors cursor-pointer flex items-center justify-between gap-3 relative ${
                  isSelected
                    ? 'bg-[#ffffff] sm:bg-[#e9e9eb] shadow-2xs font-medium'
                    : 'bg-[#f4f4f5] hover:bg-white/80'
                }`}
              >
                {/* Left: Avatar & Text */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  {/* Default grey user avatar circle matching screenshot */}
                  <div className="w-12 h-12 rounded-full bg-[#c2c2c8] flex items-center justify-center shrink-0 text-white shadow-2xs">
                    <User className="w-7 h-7 text-white/90 fill-white/80" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                        {contact.name}
                        {(contact.unreadCount ?? 0) > 0 && (
                          <span className="ml-1 text-gray-800 font-bold">
                            ({contact.unreadCount ?? 0})
                          </span>
                        )}
                      </h3>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-500 truncate mt-0.5">
                      {contact.lastMessage || 'Sin mensajes'}
                    </p>
                  </div>
                </div>

                {/* Right: WhatsApp Logo Badge & Timestamp */}
                <div className="flex flex-col items-end justify-between h-11 shrink-0">
                  {/* Green WhatsApp Icon Badge matching reference image */}
                  <div className="w-5 h-5 rounded-full bg-[#25D366] flex items-center justify-center shadow-2xs text-white">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                      <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.764.459 3.486 1.332 5.006L2 22l5.122-1.34A9.92 9.92 0 0 0 12.008 22c5.507 0 9.991-4.478 9.991-9.986 0-2.668-1.037-5.176-2.922-7.062A9.917 9.917 0 0 0 12.012 2z" />
                    </svg>
                  </div>

                  <span className="text-[11px] text-gray-600 font-medium">
                    {contact.lastTime}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
