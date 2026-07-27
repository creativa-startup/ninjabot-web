import React, { useState } from 'react';
import type { Contact, Funnel, LeadStage } from '../types';
import { User, ChevronDown, Plus, X } from 'lucide-react';

interface FunnelPanelProps {
  contacts: Contact[];
  funnels?: Funnel[];
  onAddFunnel?: (funnel: Funnel) => void;
  onSelectContact: (contact: Contact) => void;
  onChangeLeadStage?: (contactId: string, stage: LeadStage) => void;
  isMobileLayout?: boolean;
}

const STAGES = [
  'Lead Nuevo',
  'Contactado',
  'Interesado',
  'Cotización',
  'En negociación',
  'Cerrado',
  'Perdido',
] as const;

export const FunnelPanel: React.FC<FunnelPanelProps> = ({
  contacts,
  funnels: parentFunnels,
  onAddFunnel: parentOnAddFunnel,
  onSelectContact,
  onChangeLeadStage,
  isMobileLayout = false,
}) => {
  const funnels = parentFunnels || [];

  const [activeFunnelId, setActiveFunnelId] = useState<string | null>(funnels[0]?.id || '1');

  // Mobile Sub-View Tab State
  const [mobileTab, setMobileTab] = useState<'chart' | 'contacts'>('chart');

  // Form State
  const [formTipo, setFormTipo] = useState('Servicio');
  const [formInteres, setFormInteres] = useState('Meta Ads Esencial');
  const [formPresupuesto, setFormPresupuesto] = useState('$ 150');
  const [formDescripcion, setFormDescripcion] = useState(
    'Descripción del Producto o servicio'
  );

  // Filters State
  const [selectedInteres, setSelectedInteres] = useState(funnels[0]?.interes || 'Meta Ads Esencial');
  const [selectedCiudad, setSelectedCiudad] = useState('Todas las ciudades');
  const [selectedFuente, setSelectedFuente] = useState('Todas las fuentes');
  const [selectedStage, setSelectedStage] = useState<string>('Todas las Etapas');

  // Selected contact for accordion detail
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  // Mobile Modal State
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  const activeFunnel = funnels.find((f) => f.id === activeFunnelId) || null;

  // Add Funnel Handler
  const handleAddFunnel = () => {
    if (!formInteres.trim()) return;
    const newFunnel: Funnel = {
      id: `f-${Date.now()}`,
      tipo: formTipo || 'Servicio',
      interes: formInteres,
      presupuesto: formPresupuesto || '$ 150',
      descripcion: formDescripcion || 'Descripción del Producto o servicio',
    };
    if (parentOnAddFunnel) {
      parentOnAddFunnel(newFunnel);
    }
    setActiveFunnelId(newFunnel.id);
    setSelectedInteres(newFunnel.interes);
    setIsMobileModalOpen(false);
  };

  // Delete Active Funnel Handler
  const handleDeleteFunnel = () => {
    if (!activeFunnelId) return;
    const updated = funnels.filter((f) => f.id !== activeFunnelId);
    if (updated.length > 0) {
      setActiveFunnelId(updated[0].id);
      setSelectedInteres(updated[0].interes);
    } else {
      setActiveFunnelId(null);
    }
  };

  // Get contact stage count for horizontal funnel chart
  const getStageCount = (stageName: string) => {
    const matching = contacts.filter((c) => {
      // Funnel / Interest filter check
      if (selectedInteres && selectedInteres !== 'Todos' && selectedInteres !== 'Todos los embudos') {
        if (c.interest && c.interest.toLowerCase() !== selectedInteres.toLowerCase()) return false;
      }
      // City filter check
      if (selectedCiudad !== 'Todas' && selectedCiudad !== 'Todas las ciudades') {
        if (c.city && c.city.toLowerCase() !== selectedCiudad.toLowerCase()) return false;
      }
      // Source filter check
      if (selectedFuente !== 'Fuente' && selectedFuente !== 'Todas' && selectedFuente !== 'Todas las fuentes') {
        if (c.source && c.source.toLowerCase() !== selectedFuente.toLowerCase()) return false;
      }
      // Stage check
      const matchStage =
        c.leadStage.toLowerCase() === stageName.toLowerCase() ||
        (stageName === 'Lead Nuevo' && c.leadStage.toLowerCase() === 'lead nuevo');
      return matchStage;
    });

    return matching.length;
  };

  // Filter contacts list for the right panel / bottom section
  const filteredContacts = contacts.filter((c) => {
    // Funnel / Interest Filter
    if (selectedInteres && selectedInteres !== 'Todos' && selectedInteres !== 'Todos los embudos') {
      if (c.interest && c.interest.toLowerCase() !== selectedInteres.toLowerCase()) {
        return false;
      }
    }
    // City Filter
    if (selectedCiudad !== 'Todas' && selectedCiudad !== 'Todas las ciudades') {
      if (c.city && c.city.toLowerCase() !== selectedCiudad.toLowerCase()) {
        return false;
      }
    }
    // Source Filter
    if (selectedFuente !== 'Fuente' && selectedFuente !== 'Todas' && selectedFuente !== 'Todas las fuentes') {
      if (c.source && c.source.toLowerCase() !== selectedFuente.toLowerCase()) {
        return false;
      }
    }
    // Stage Filter
    if (selectedStage !== 'Todas' && selectedStage !== 'Todas las Etapas') {
      const matchStage =
        c.leadStage.toLowerCase() === selectedStage.toLowerCase() ||
        (selectedStage === 'Lead Nuevo' && c.leadStage.toLowerCase() === 'lead nuevo');
      if (!matchStage) return false;
    }
    return true;
  });

  // Display filtered contacts
  const displayContacts = filteredContacts;

  return (
    <div className="w-full h-full bg-[#eaeaea] text-gray-900 flex flex-col overflow-y-auto select-none font-sans min-w-0 relative">
      {/* ==================== NO FUNNEL STATE (EMPTY FORM) ==================== */}
      {funnels.length === 0 || !activeFunnel ? (
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto max-w-4xl w-full mx-auto">
          {/* Top Pill Badge */}
          <div className="mb-6">
            <span className="bg-black text-white px-5 py-2 rounded-full font-black text-lg tracking-tight inline-block shadow-xs">
              Embudos
            </span>
          </div>

          {/* Form Card */}
          <div className="bg-[#f0f0f2] p-5 sm:p-6 rounded-2xl border border-gray-300/80 shadow-2xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block font-extrabold text-xs text-gray-900 mb-1">
                  Tipo
                </label>
                <input
                  type="text"
                  value={formTipo}
                  onChange={(e) => setFormTipo(e.target.value)}
                  placeholder="Servicio"
                  className="w-full bg-white text-gray-900 p-2.5 rounded-lg border-none shadow-2xs text-xs font-medium outline-none focus:ring-2 focus:ring-black/20"
                />
              </div>

              <div>
                <label className="block font-extrabold text-xs text-gray-900 mb-1">
                  Interés
                </label>
                <input
                  type="text"
                  value={formInteres}
                  onChange={(e) => setFormInteres(e.target.value)}
                  placeholder="Meta Ads Esencial"
                  className="w-full bg-white text-gray-900 p-2.5 rounded-lg border-none shadow-2xs text-xs font-medium outline-none focus:ring-2 focus:ring-black/20"
                />
              </div>

              <div>
                <label className="block font-extrabold text-xs text-gray-900 mb-1">
                  Presupuesto
                </label>
                <input
                  type="text"
                  value={formPresupuesto}
                  onChange={(e) => setFormPresupuesto(e.target.value)}
                  placeholder="$ 150"
                  className="w-full bg-white text-gray-900 p-2.5 rounded-lg border-none shadow-2xs text-xs font-medium outline-none focus:ring-2 focus:ring-black/20"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block font-extrabold text-xs text-gray-900 mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  value={formDescripcion}
                  onChange={(e) => setFormDescripcion(e.target.value)}
                  placeholder="Descripción del Producto o servicio"
                  className="w-full bg-white text-gray-900 p-2.5 rounded-lg border-none shadow-2xs text-xs font-medium outline-none focus:ring-2 focus:ring-black/20"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleAddFunnel}
                className="px-8 py-2 bg-[#eaeaea] hover:bg-gray-300 text-black border-2 border-black rounded-full font-black text-xs shadow-2xs transition-all active:scale-95 cursor-pointer"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ==================== ACTIVE FUNNEL VIEW (PC & MOBILE) ==================== */
        <div
          className={`w-full flex-1 flex ${
            isMobileLayout ? 'flex-col' : 'flex-col md:flex-row'
          } min-w-0 bg-[#eaeaea] pb-8`}
        >
          {/* LEFT / MAIN COLUMN: Funnel Bar Chart & Filters */}
          <div
            className={`w-full ${
              isMobileLayout ? 'w-full' : 'md:flex-1'
            } flex flex-col p-3.5 sm:p-5 min-w-0 bg-[#eaeaea]`}
          >
            {/* TOP HEADER & FILTERS BAR */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 mb-5">
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
                {/* Pill Badge "Embudos" */}
                <span className="bg-black text-white px-4 sm:px-5 py-1.5 rounded-full font-black text-sm sm:text-lg tracking-tight shrink-0 shadow-xs">
                  Embudos
                </span>

                {/* Filter 1: Interés */}
                <div className="relative inline-flex items-center">
                  <select
                    value={selectedInteres}
                    onChange={(e) => setSelectedInteres(e.target.value)}
                    className="appearance-none bg-transparent font-extrabold text-xs sm:text-sm text-gray-900 pr-5 cursor-pointer outline-none hover:opacity-80"
                  >
                    {funnels.map((f) => (
                      <option key={f.id} value={f.interes}>
                        {f.interes}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-800 pointer-events-none -ml-4" />
                </div>

                {/* Filter 2: Ciudad */}
                <div className="relative inline-flex items-center">
                  <select
                    value={selectedCiudad}
                    onChange={(e) => setSelectedCiudad(e.target.value)}
                    className="appearance-none bg-transparent font-extrabold text-xs sm:text-sm text-gray-900 pr-5 cursor-pointer outline-none hover:opacity-80"
                  >
                    <option value="Todas las ciudades">Quito</option>
                    <option value="Quito">Quito</option>
                    <option value="Guayaquil">Guayaquil</option>
                    <option value="Cuenca">Cuenca</option>
                    <option value="Manta">Manta</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-800 pointer-events-none -ml-4" />
                </div>

                {/* Filter 3: Fuente */}
                <div className="relative inline-flex items-center">
                  <select
                    value={selectedFuente}
                    onChange={(e) => setSelectedFuente(e.target.value)}
                    className="appearance-none bg-transparent font-extrabold text-xs sm:text-sm text-gray-900 pr-5 cursor-pointer outline-none hover:opacity-80"
                  >
                    <option value="Todas las fuentes">Fuente</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Web">Web</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-800 pointer-events-none -ml-4" />
                </div>

                {/* Eliminar Link */}
                <button
                  onClick={handleDeleteFunnel}
                  className="text-black font-extrabold text-xs sm:text-sm underline cursor-pointer hover:opacity-75 transition-opacity"
                >
                  Eliminar
                </button>
              </div>

              {/* "Agregar embudo" top-right link */}
              <div>
                <button
                  onClick={() => setIsMobileModalOpen(true)}
                  className="text-black font-extrabold text-xs sm:text-sm underline cursor-pointer hover:opacity-75"
                >
                  Agregar embudo
                </button>
              </div>
            </div>

            {/* FUNNEL STAGE BAR CHART */}
            <div className="mb-6 space-y-2.5 max-w-2xl w-full">
              {STAGES.map((stageName, idx) => {
                const count = getStageCount(stageName);
                // Proportional bar width calculation based on funnel shape & count
                const baseWidths = [100, 88, 76, 64, 52, 40, 25];
                const widthPercent = Math.max(15, Math.min(100, baseWidths[idx] || 30));

                return (
                  <div key={stageName} className="flex items-center gap-3 text-xs">
                    {/* Stage Label */}
                    <span className="w-24 sm:w-28 font-extrabold text-gray-900 text-[11px] sm:text-xs shrink-0 truncate">
                      {stageName}
                    </span>

                    {/* Gradient Bar */}
                    <div className="flex-1 flex items-center">
                      <div
                        style={{ width: `${widthPercent}%` }}
                        className="h-8 sm:h-9 bg-gradient-to-r from-[#f43f5e] via-[#c084fc] to-[#a855f7] rounded-xs flex items-center justify-end pr-3.5 text-white font-black text-xs shadow-2xs transition-all duration-300 min-w-[45px]"
                      >
                        {count}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PC "AGREGAR EMBUDO" FORM AT BOTTOM (Only on PC desktop mode) */}
            {!isMobileLayout && (
              <div className="hidden md:block mt-auto pt-6 border-t border-gray-300/80 max-w-2xl w-full">
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="block font-extrabold text-xs text-gray-900 mb-1">
                      Tipo
                    </label>
                    <input
                      type="text"
                      value={formTipo}
                      onChange={(e) => setFormTipo(e.target.value)}
                      className="w-full bg-white text-gray-900 p-2.5 rounded-lg border-none shadow-2xs text-xs font-medium outline-none focus:ring-2 focus:ring-black/20"
                    />
                  </div>

                  <div>
                    <label className="block font-extrabold text-xs text-gray-900 mb-1">
                      Interés
                    </label>
                    <input
                      type="text"
                      value={formInteres}
                      onChange={(e) => setFormInteres(e.target.value)}
                      className="w-full bg-white text-gray-900 p-2.5 rounded-lg border-none shadow-2xs text-xs font-medium outline-none focus:ring-2 focus:ring-black/20"
                    />
                  </div>

                  <div>
                    <label className="block font-extrabold text-xs text-gray-900 mb-1">
                      Presupuesto
                    </label>
                    <input
                      type="text"
                      value={formPresupuesto}
                      onChange={(e) => setFormPresupuesto(e.target.value)}
                      className="w-full bg-white text-gray-900 p-2.5 rounded-lg border-none shadow-2xs text-xs font-medium outline-none focus:ring-2 focus:ring-black/20"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block font-extrabold text-xs text-gray-900 mb-1">
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={formDescripcion}
                    onChange={(e) => setFormDescripcion(e.target.value)}
                    className="w-full bg-white text-gray-900 p-2.5 rounded-lg border-none shadow-2xs text-xs font-medium outline-none focus:ring-2 focus:ring-black/20"
                  />
                </div>

                <button
                  onClick={handleAddFunnel}
                  className="px-8 py-2 bg-[#eaeaea] hover:bg-gray-300 text-black border-2 border-black rounded-full font-black text-xs shadow-2xs transition-all active:scale-95 cursor-pointer"
                >
                  Agregar
                </button>
              </div>
            )}
          </div>

          {/* CONTACTS TABLE WITH ACCORDION (RIGHT COLUMN ON PC / BELOW CHART ON MOBILE) */}
          <div
            className={`w-full ${
              isMobileLayout ? 'w-full border-t border-gray-300' : 'md:w-[380px] lg:w-[420px] md:border-l'
            } shrink-0 bg-[#d8d8db] flex flex-col border-gray-300 min-w-0 md:overflow-y-auto`}
          >
            {/* Header / Filter Bar */}
            <div className="p-3.5 sm:p-4 bg-[#d8d8db] border-b border-gray-300 flex items-center justify-between font-extrabold text-xs text-gray-900 shrink-0">
              <span className="truncate">{selectedInteres}</span>

              {/* Stage Dropdown Filter */}
              <div className="relative inline-flex items-center">
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="appearance-none bg-transparent font-extrabold text-xs text-gray-900 pr-5 cursor-pointer outline-none hover:opacity-80"
                >
                  <option value="Todas las Etapas">Todas las Etapas</option>
                  {STAGES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-800 pointer-events-none -ml-4" />
              </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-2 px-4 py-2 text-xs font-extrabold text-gray-900 bg-[#d8d8db] border-b border-gray-300">
              <div>Nombre</div>
              <div>Email</div>
            </div>

            {/* Contact Rows List */}
            <div className="w-full md:flex-1 divide-y divide-gray-300/80 md:overflow-y-auto min-w-0">
              {displayContacts.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-500 font-semibold">
                  No hay contactos para los filtros seleccionados
                </div>
              ) : (
                displayContacts.map((contact) => {
                  const isSelected = selectedContactId === contact.id;

                return (
                  <div key={contact.id} className="w-full min-w-0">
                    {/* Primary Row */}
                    <div
                      onClick={() =>
                        setSelectedContactId(isSelected ? null : contact.id)
                      }
                      className={`grid grid-cols-2 items-center px-4 py-3 text-xs cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-black text-white font-bold'
                          : 'bg-[#eaeaea] hover:bg-[#e0e0e3] text-gray-900 font-medium'
                      }`}
                    >
                      {/* Avatar + Name */}
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-gray-700 text-white'
                              : 'bg-[#c2c2c8] text-white'
                          }`}
                        >
                          <User className="w-4 h-4 fill-white/80" />
                        </div>
                        <span className="truncate font-extrabold text-xs">
                          {contact.name}
                        </span>
                      </div>

                      {/* Email */}
                      <div className="truncate text-xs">{contact.email}</div>
                    </div>

                    {/* EXPANDED DETAILS ACCORDION (Matches Screenshot 4 & 5) */}
                    {isSelected && (
                      <div className="bg-[#eaeaea] p-3.5 sm:p-4 border-b border-gray-300 flex items-center justify-between gap-3 text-xs text-gray-900 animate-in fade-in slide-in-from-top-1 duration-200">
                        {/* Details Fields Grid */}
                        <div className="flex-1 grid grid-cols-3 gap-y-2 gap-x-2 font-semibold text-[11px] sm:text-xs min-w-0">
                          <div className="truncate">{contact.leadStage}</div>
                          <div className="truncate">{contact.city || 'Quito'}</div>
                          <div className="truncate font-mono text-[10px] sm:text-xs">
                            {contact.phone}
                          </div>

                          <div className="truncate">{contact.source || 'WhatsApp'}</div>
                          <div className="truncate">{contact.leadType || 'Servicio'}</div>
                          <div className="truncate">{contact.interest || 'Meta Ads Esencial'}</div>
                        </div>

                        {/* Lime Green Chat Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectContact(contact);
                          }}
                          className="bg-[#a3e635] hover:bg-[#84cc16] text-black font-black text-xs px-4 sm:px-5 py-3 rounded-xl shadow-2xs transition-all active:scale-95 shrink-0 cursor-pointer border border-black/10 flex items-center justify-center"
                        >
                          Chat
                        </button>
                      </div>
                    )}
                  </div>
                );
              }))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== MOBILE "AGREGAR EMBUDO" MODAL / VIEW ==================== */}
      {isMobileModalOpen && (
        <div className="fixed inset-0 bg-[#eaeaea] z-50 p-4 sm:p-6 overflow-y-auto flex flex-col justify-center items-center font-sans animate-in fade-in duration-150">
          <div className="max-w-md w-full bg-[#eaeaea] p-2 space-y-4 my-auto">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-extrabold text-xs text-gray-900 mb-1">
                  Tipo
                </label>
                <input
                  type="text"
                  value={formTipo}
                  onChange={(e) => setFormTipo(e.target.value)}
                  placeholder="Servicio"
                  className="w-full bg-white text-gray-900 p-2.5 rounded-lg border border-gray-200 shadow-2xs text-xs font-medium outline-none focus:ring-2 focus:ring-black/20"
                />
              </div>

              <div>
                <label className="block font-extrabold text-xs text-gray-900 mb-1">
                  Interés
                </label>
                <input
                  type="text"
                  value={formInteres}
                  onChange={(e) => setFormInteres(e.target.value)}
                  placeholder="Meta Ads Esencial"
                  className="w-full bg-white text-gray-900 p-2.5 rounded-lg border border-gray-200 shadow-2xs text-xs font-medium outline-none focus:ring-2 focus:ring-black/20"
                />
              </div>
            </div>

            <div>
              <label className="block font-extrabold text-xs text-gray-900 mb-1">
                Presupuesto
              </label>
              <input
                type="text"
                value={formPresupuesto}
                onChange={(e) => setFormPresupuesto(e.target.value)}
                placeholder="$ 150"
                className="w-full bg-white text-gray-900 p-2.5 rounded-lg border border-gray-200 shadow-2xs text-xs font-medium outline-none focus:ring-2 focus:ring-black/20"
              />
            </div>

            <div>
              <label className="block font-extrabold text-xs text-gray-900 mb-1">
                Descripción
              </label>
              <input
                type="text"
                value={formDescripcion}
                onChange={(e) => setFormDescripcion(e.target.value)}
                placeholder="Descripción del Producto o servicio"
                className="w-full bg-white text-gray-900 p-2.5 rounded-lg border border-gray-200 shadow-2xs text-xs font-medium outline-none focus:ring-2 focus:ring-black/20"
              />
            </div>

            {/* Actions: Agregar Pill + Salir Link */}
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={handleAddFunnel}
                className="px-8 py-2 bg-[#eaeaea] hover:bg-gray-300 text-black border-2 border-black rounded-full font-black text-xs shadow-2xs transition-all active:scale-95 cursor-pointer"
              >
                Agregar
              </button>

              <button
                onClick={() => setIsMobileModalOpen(false)}
                className="text-black font-extrabold text-xs underline cursor-pointer hover:opacity-75"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
