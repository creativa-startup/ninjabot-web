import React, { useState } from 'react';
import { X, ShoppingCart, DollarSign, Tag, Loader2 } from 'lucide-react';
import type { Contact } from '../types';

interface SaleRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
  onRegisterSale: (saleData: { contactId: string; amount: number; description: string }) => Promise<void>;
}

export const SaleRegistrationModal: React.FC<SaleRegistrationModalProps> = ({
  isOpen,
  onClose,
  contact,
  onRegisterSale,
}) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !contact) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description.trim()) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Ingresa un monto válido mayor a 0');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onRegisterSale({
        contactId: contact.id,
        amount: parsedAmount,
        description: description.trim(),
      });
      setAmount('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error al registrar la venta');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
        {/* Close button */}
        <div className="flex justify-end mb-2">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
            <ShoppingCart className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-extrabold text-gray-900 text-center mb-1">
          Registrar Venta
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          {contact.name} · {contact.phone}
        </p>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-bold text-gray-800 text-xs mb-1.5">
              Monto de la venta (USD)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-800 text-xs mb-1.5">
              Producto / Descripción
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej. Plan Pro Ninjabot"
                className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black font-medium"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-sm disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !amount || !description.trim()}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  Registrar Venta
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};