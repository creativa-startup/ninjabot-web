import React, { useState } from "react";
import type { Contact, LeadStage } from "../types";
import { Search, User, Plus } from "lucide-react";
import { supabase, getPerfilConEmpresa } from "../services/supabase";

interface ContactsPanelProps {
  contacts?: Contact[];
  onSelectContact?: (contact: Contact) => void;
  onDeleteContact?: (contactId: string) => void;
  fetchContactos?: () => Promise<void>;
  isMobileLayout?: boolean;
}

export const ContactsPanel: React.FC<ContactsPanelProps> = ({
  contacts = [],
  onSelectContact = () => {},
  onDeleteContact = () => {},
  fetchContactos = async () => {},
  isMobileLayout = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Formulario con campos en INGLES para coincidir con tabla contacts
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    city: "",
    phone: "",
    lead_stage: "Lead" as LeadStage,
  });

  const selectedContact = (contacts || []).find((c) => c.id === selectedContactId);

  const filteredContacts = (contacts || []).filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      (c.name || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q) ||
      (c.phone || "").includes(q) ||
      (c.city || "").toLowerCase().includes(q) ||
      (c.interest || "").toLowerCase().includes(q)
    );
  });

  const handleStartEdit = (contact: Contact) => {
    setSelectedContactId(contact.id);
    setEditForm({
      name: contact.name || "",
      email: contact.email || "",
      city: contact.city || "",
      phone: contact.phone || "",
      lead_stage: contact.leadStage || "Lead",
    });
    setIsEditing(true);
  };

  // NUEVO CONTACTO: limpia formulario y pone id en null
  const handleNewContactClick = () => {
    setEditForm({
      name: "",
      email: "",
      city: "",
      phone: "",
      lead_stage: "Lead",
    });
    setSelectedContactId(null);
    setIsEditing(true);
  };

  // GUARDAR: Crear o Actualizar en Supabase (tabla contacts)
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const name = editForm.name || (selectedContact?.name ?? "");
    const email = editForm.email || (selectedContact?.email ?? "");
    const phone = editForm.phone || (selectedContact?.phone ?? "");
    const city = editForm.city || (selectedContact?.city ?? "");
    const lead_stage = editForm.lead_stage || (selectedContact?.leadStage ?? "Lead");

    if (!name || !phone) return;

    try {
      const perfil = await getPerfilConEmpresa();

      if (!selectedContactId) {
        // CREAR nuevo contacto en tabla contacts
        // NO incluimos id para que Supabase auto-genere UUID
        await supabase.from("contacts").insert([
          {
            user_id: perfil.id,
            name,
            email,
            phone,
            city: city || null,
            lead_stage,
          },
        ]);
      } else {
        // ACTUALIZAR contacto existente por UUID
        await supabase
          .from("contacts")
          .update({ name, email, phone, city: city || null, lead_stage })
          .eq("id", selectedContactId);
      }

      // Recargar lista desde Supabase
      await fetchContactos();

      // Mostrar exito y cerrar editor tras 1.2s
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditing(false);
        setSelectedContactId(null);
      }, 1200);
    } catch (err) {
      console.error("Error guardando contacto en Supabase:", err);
    }
  };

  // ELIMINAR: Confirmacion + delete en tabla contacts por UUID
  const handleDeleteContact = async (contactId: string) => {
    if (!window.confirm("Estas seguro de eliminar este contacto?")) return;

    try {
      await supabase.from("contacts").delete().eq("id", contactId);
      onDeleteContact(contactId);
      if (selectedContactId === contactId) {
        setIsEditing(false);
        setSelectedContactId(null);
      }
    } catch (err) {
      console.error("Error eliminando contacto en Supabase:", err);
    }
  };

  const showDetailPanel = isEditing && (selectedContact || selectedContactId === null);

  return (
    <div className="w-full h-full bg-[#efeff0] sm:bg-[#e8e8e9] flex flex-col overflow-hidden select-none font-sans text-gray-900">
      {/* HEADER */}
      <div className="p-3 sm:p-4 bg-[#e8e8e9] border-b border-gray-300 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-black text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full font-black text-xs sm:text-sm tracking-wide shadow-xs shrink-0">
            Contactos
          </div>
          {/* BOTON + ANADIR CONTACTO */}
          <button
            onClick={handleNewContactClick}
            className="bg-white hover:bg-gray-100 text-black border border-gray-300 font-bold text-[11px] sm:text-xs px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl flex items-center gap-1 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Anadir Contacto</span>
            <span className="sm:hidden">Anadir</span>
          </button>
        </div>
        <div className="relative w-36 sm:w-64 shrink-0">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar"
            className="w-full bg-[#d2d2d6] text-gray-900 placeholder-gray-600 text-xs sm:text-sm pl-3.5 pr-8 py-1.5 rounded-xl border-none outline-none focus:ring-2 focus:ring-black/20 font-medium"
          />
          <Search className="w-3.5 h-3.5 text-gray-700 absolute right-2.5 top-1/2 -translate-y-1/2 stroke-[2.2]" />
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 flex overflow-hidden min-w-0 w-full">
        <div
          className={`flex-1 flex flex-col overflow-y-auto overflow-x-hidden bg-[#e8e8e9] min-w-0 ${
            showDetailPanel && !isMobileLayout ? "md:w-3/5 border-r border-gray-300" : "w-full"
          }`}
        >
          {/* PC TABLE */}
          {!isMobileLayout && (
            <div className="hidden md:block w-full min-w-0 overflow-x-hidden">
              <table className="w-full text-left border-collapse table-fixed min-w-0">
                <thead>
                  <tr className="border-b border-gray-300 text-xs font-extrabold text-gray-900">
                    <th className="py-3 px-3 w-1/3 min-w-0">Nombre</th>
                    <th className={`py-3 px-3 ${showDetailPanel ? "hidden xl:table-cell xl:w-1/4" : "w-1/4"}`}>Email</th>
                    <th className="py-3 px-3 w-1/4 min-w-0">Telefono</th>
                    <th className={`py-3 px-3 ${showDetailPanel ? "hidden lg:table-cell lg:w-1/5" : "w-1/6"}`}>Ciudad</th>
                    <th className="py-3 px-3 text-right pr-4 w-28">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300/60 text-sm font-medium">
                  {filteredContacts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500 font-medium">
                        No hay contactos en la lista. Agrega un contacto o espera las conversaciones entrantes.
                      </td>
                    </tr>
                  ) : (
                    filteredContacts.map((contact) => {
                      const isSelected = contact.id === selectedContactId && isEditing;
                      return (
                        <tr
                          key={contact.id}
                          className={`transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-black text-white font-semibold"
                              : "hover:bg-gray-200/80 text-gray-900 bg-[#e8e8e9]"
                          }`}
                          onClick={() => handleStartEdit(contact)}
                        >
                          <td className="py-3 px-3 min-w-0">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isSelected ? "bg-gray-700 text-white" : "bg-[#c2c2c8] text-white"}`}>
                                <User className="w-4 h-4 fill-white/80" />
                              </div>
                              <span className="truncate min-w-0 text-xs sm:text-sm">{contact.name}</span>
                            </div>
                          </td>
                          <td className={`py-3 px-3 truncate text-xs sm:text-sm ${showDetailPanel ? "hidden xl:table-cell" : ""}`}>{contact.email || "-"}</td>
                          <td className="py-3 px-3 font-mono text-xs whitespace-nowrap">{contact.phone}</td>
                          <td className={`py-3 px-3 truncate text-xs sm:text-sm ${showDetailPanel ? "hidden lg:table-cell" : ""}`}>{contact.city || ""}</td>
                          <td className="py-3 px-3 text-right pr-4 whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2 text-xs font-medium">
                              <button onClick={(e) => { e.stopPropagation(); handleStartEdit(contact); }} className={`underline hover:opacity-80 ${isSelected ? "text-white" : "text-gray-900"}`}>Editar</button>
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteContact(contact.id); }} className={`underline hover:text-red-500 ${isSelected ? "text-white" : "text-gray-900"}`}>Eliminar</button>
                              <button onClick={(e) => { e.stopPropagation(); onSelectContact(contact); }} className={`underline font-bold hover:opacity-80 ${isSelected ? "text-white" : "text-gray-900"}`}>Chat</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* MOBILE CARDS */}
          <div className={`${isMobileLayout ? "block" : "md:hidden"} divide-y divide-gray-300 w-full`}>
            {filteredContacts.length === 0 ? (
              <div className="p-8 text-center text-gray-500 font-medium text-xs">No hay contactos en la lista. Agrega un contacto o espera las conversaciones entrantes.</div>
            ) : (
              filteredContacts.map((contact, index) => {
                const isSelected = contact.id === selectedContactId && isEditing;
                const isEven = index % 2 === 0;
                return (
                  <div key={contact.id} className="w-full">
                    <div className={`p-3.5 sm:p-4 transition-colors cursor-pointer ${isSelected ? "bg-black text-white" : isEven ? "bg-white text-gray-900" : "bg-[#efeff0] text-gray-900"}`}
                      onClick={() => handleStartEdit(contact)}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-xs font-extrabold ${isSelected ? "text-white" : "text-gray-900"}`}>Telefono</span>
                        <div className="w-6 h-6 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-xs shrink-0">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                            <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.764.459 3.486 1.332 5.006L2 22l5.122-1.34A9.92 9.92 0 0 0 12.008 22c5.507 0 9.991-4.478 9.991-9.986 0-2.668-1.037-5.176-2.922-7.062A9.917 9.917 0 0 0 12.012 2z" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-sm sm:text-base font-mono tracking-tight">{contact.phone}</span>
                        <div className="flex items-center gap-3 text-xs font-semibold whitespace-nowrap">
                          <button onClick={(e) => { e.stopPropagation(); handleStartEdit(contact); }} className={`underline hover:opacity-80 ${isSelected ? "text-white" : "text-gray-900"}`}>Editar</button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteContact(contact.id); }} className={`underline hover:opacity-80 ${isSelected ? "text-white" : "text-gray-900"}`}>Eliminar</button>
                          <button onClick={(e) => { e.stopPropagation(); onSelectContact(contact); }} className={`underline font-bold hover:opacity-80 ${isSelected ? "text-white" : "text-gray-900"}`}>Chat</button>
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="p-4 sm:p-5 bg-[#dedede] border-t border-b border-gray-400">
                        <h3 className="font-extrabold text-gray-900 text-sm mb-3.5 tracking-tight">Detalle del Contacto</h3>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div><label className="block font-bold text-gray-900 mb-1">Nombre</label><input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full bg-white text-gray-900 p-2.5 rounded-md border-none shadow-xs outline-none font-medium" /></div>
                          <div><label className="block font-bold text-gray-900 mb-1">Email</label><input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full bg-white text-gray-900 p-2.5 rounded-md border-none shadow-xs outline-none font-medium" /></div>
                          <div><label className="block font-bold text-gray-900 mb-1">Ciudad</label><input type="text" value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} className="w-full bg-white text-gray-900 p-2.5 rounded-md border-none shadow-xs outline-none font-medium" /></div>
                          <div><label className="block font-bold text-gray-900 mb-1">Telefono</label><input type="text" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="w-full bg-white text-gray-900 p-2.5 rounded-md border-none shadow-xs outline-none font-medium" /></div>
                        </div>
                        <div className="flex items-center justify-between mt-5 pt-1">
                          <button onClick={() => handleSave()} className="px-7 py-1.5 bg-[#dedede] hover:bg-[#d0d0d3] text-black border-2 border-black rounded-full font-black text-xs shadow-xs transition-all active:scale-95">{saveSuccess ? "Guardado" : "Guardar"}</button>
                          <button onClick={() => setIsEditing(false)} className="text-xs font-bold text-gray-900 underline hover:opacity-80">Salir</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* PC DETAIL SIDE PANEL */}
        {!isMobileLayout && showDetailPanel && (
          <div className="hidden md:flex w-2/5 min-w-0 bg-[#d8d8db] p-4 sm:p-5 flex-col justify-between overflow-y-auto overflow-x-hidden border-l border-gray-300 shrink-0">
            <div className="w-full min-w-0">
              <h3 className="font-extrabold text-gray-900 text-sm mb-4 tracking-tight truncate">
                {selectedContactId === null ? "Nuevo Contacto" : "Detalle del Contacto"}
              </h3>
              <div className="flex flex-wrap gap-3 text-xs w-full min-w-0">
                <div className="flex-1 min-w-[130px]">
                  <label className="block font-extrabold text-gray-900 mb-1 truncate">Nombre</label>
                  <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full min-w-0 bg-white text-gray-900 p-2.5 rounded-lg border-none shadow-xs outline-none font-medium text-xs focus:ring-2 focus:ring-black/20" />
                </div>
                <div className="flex-1 min-w-[130px]">
                  <label className="block font-extrabold text-gray-900 mb-1 truncate">Email</label>
                  <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full min-w-0 bg-white text-gray-900 p-2.5 rounded-lg border-none shadow-xs outline-none font-medium text-xs focus:ring-2 focus:ring-black/20" />
                </div>
                <div className="flex-1 min-w-[130px]">
                  <label className="block font-extrabold text-gray-900 mb-1 truncate">Ciudad</label>
                  <input type="text" value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} className="w-full min-w-0 bg-white text-gray-900 p-2.5 rounded-lg border-none shadow-xs outline-none font-medium text-xs focus:ring-2 focus:ring-black/20" />
                </div>
                <div className="flex-1 min-w-[130px]">
                  <label className="block font-extrabold text-gray-900 mb-1 truncate">Telefono</label>
                  <input type="text" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="w-full min-w-0 bg-white text-gray-900 p-2.5 rounded-lg border-none shadow-xs outline-none font-medium text-xs focus:ring-2 focus:ring-black/20" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-6 mt-4 w-full min-w-0">
              <button onClick={() => handleSave()} className="px-8 py-2 bg-[#d2d2d6] hover:bg-[#c4c4c8] text-black border-2 border-black rounded-full font-black text-xs shadow-xs transition-all active:scale-95">{saveSuccess ? "Guardado" : "Guardar"}</button>
              <button onClick={() => setIsEditing(false)} className="text-xs font-bold text-gray-900 underline hover:opacity-80">Salir</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};