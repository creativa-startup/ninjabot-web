import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import type { Funnel, LeadStage } from '../types';

interface NewContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  funnels?: Funnel[];
  onAddContact: (
    name: string,
    phone: string,
    leadStage: LeadStage,
    firstMessage: string,
    city?: string,
    interest?: string
  ) => void;
}

const LEAD_STAGES: LeadStage[] = [
  'Lead',
  'Contacted',
  'Scheduled',
  'Checkout',
  'Purchased',
  'Lost',
];

export const NewContactModal: React.FC<NewContactModalProps> = ({
  isOpen,
  onClose,
  funnels = [],
  onAddContact,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+593 ');
  const [city, setCity] = useState('Quito');
  const [interest, setInterest] = useState(funnels[0]?.interes || 'Meta Ads Esencial');
  const [leadStage, setLeadStage] = useState<LeadStage>('Lead');
  const [firstMessage, setFirstMessage] = useState('Hola, quisiera información sobre Ninjabot.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    onAddContact(
      name.trim(),
      phone.trim(),
      leadStage,
      firstMessage.trim(),
      city,
      interest
    );
    setName('');
    setPhone('+593 ');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-gray-900 text-base">
              Nuevo Chat / Lead WhatsApp
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-bold text-gray-800 mb-1">
              Nombre del Contacto
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Ana Belén"
              className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-black font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-1">
              Teléfono WhatsApp
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+593 099112233"
              className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-black font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-800 mb-1">
                Anclar a Embudo
              </label>
              <select
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-black font-medium"
              >
                {funnels.length > 0 ? (
                  funnels.map((f) => (
                    <option key={f.id} value={f.interes}>
                      {f.interes}
                    </option>
                  ))
                ) : (
                  <option value="Meta Ads Esencial">Meta Ads Esencial</option>
                )}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">
                Ciudad
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-black font-medium"
              >
                <option value="Quito">Quito</option>
                <option value="Guayaquil">Guayaquil</option>
                <option value="Cuenca">Cuenca</option>
                <option value="Manta">Manta</option>
                <option value="Ambato">Ambato</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-1">
              Etapa del Lead
            </label>
            <select
              value={leadStage}
              onChange={(e) => setLeadStage(e.target.value as LeadStage)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-black font-medium"
            >
              {LEAD_STAGES.map((stage) => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-1">
              Primer Mensaje del Cliente
            </label>
            <textarea
              rows={3}
              value={firstMessage}
              onChange={(e) => setFirstMessage(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-black font-medium"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl font-bold shadow-sm"
            >
              Crear Chat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};