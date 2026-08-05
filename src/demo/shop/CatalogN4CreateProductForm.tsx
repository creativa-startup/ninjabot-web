/**
 * @module CatalogN4CreateProductForm
 * @description Formulario inmersivo del Catálogo (Panel N4 — Focus Overlay).
 * Se monta sobre N3 de forma absoluta (absolute inset-0 z-30) para capturar
 * los datos de un nuevo producto: Nombre, Precio, SKU y URL de la foto.
 *
 * Emite el callback `onSave` con el producto creado y un botón ArrowLeft
 * superior para retornar a la tienda (cierra el overlay).
 *
 * Estética Premium UX/UI Card: fondos translúcidos con blur, bordes invisibles
 * (border-black/5 claro / border-white/10 oscuro), sin sombras pesadas.
 */

import React, { useState } from 'react';
import { ArrowLeft, ImagePlus, Save, X } from 'lucide-react';
import type { DemoProduct } from '../settings/mockSettings';

export interface CatalogN4CreateProductFormProps {
  /** Callback al guardar el nuevo producto (emite el producto completo) */
  onSave: (product: DemoProduct) => void;
  /** Callback al cerrar el formulario (ArrowLeft o X) — retorna a la tienda */
  onClose: () => void;
  /** Tema del shell maestro (dark/light) para variantes del sandbox */
  isShellDark?: boolean;
}

export const CatalogN4CreateProductForm: React.FC<CatalogN4CreateProductFormProps> = ({
  onSave,
  onClose,
  isShellDark = false,
}) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [sku, setSku] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const isFormValid = name.trim().length > 0 && price.trim().length > 0 && sku.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const product: DemoProduct = {
      id: `prod-${Date.now()}`,
      title: name.trim(),
      price: `${price.trim()} USD`,
      sku: sku.trim().toUpperCase(),
      imageUrl: imageUrl.trim() || null,
      category: 'Disponible',
    };
    onSave(product);
  };

  return (
    <div
      className={`absolute inset-0 z-30 panel-n4-floating flex flex-col overflow-hidden transition-colors duration-500 ${
        isShellDark ? 'text-white' : 'text-gray-900'
      }`}
      style={isShellDark ? { backgroundColor: 'var(--panel-n4)', boxShadow: 'var(--shadow-panel-n4-left)' } : undefined}
    >
      {/* ─── Header N4 — ArrowLeft + título + Cerrar ─── */}
      <div
        className={`flex items-center justify-between p-4 flex-shrink-0 transition-colors duration-500 ${
          isShellDark ? 'bg-transparent' : 'bg-white/80 backdrop-blur-md'
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          title="Volver a la tienda"
          aria-label="Volver a la tienda"
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
            isShellDark
              ? 'text-gray-400 hover:bg-white/10 hover:text-white'
              : 'text-gray-500 hover:bg-black/5 hover:text-gray-700'
          }`}
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
        </button>

        <h3 className={`flex items-center gap-2 text-sm font-semibold ${isShellDark ? 'text-white' : 'text-gray-900'}`}>
          <ImagePlus size={16} className={isShellDark ? 'text-fuchsia-400' : 'text-fuchsia-600'} />
          Nuevo Producto
        </h3>

        <button
          type="button"
          onClick={onClose}
          title="Cerrar"
          aria-label="Cerrar"
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
            isShellDark
              ? 'text-gray-400 hover:bg-white/10 hover:text-white'
              : 'text-gray-500 hover:bg-black/5 hover:text-gray-700'
          }`}
        >
          <X size={18} strokeWidth={1.5} />
        </button>
      </div>

      {/* ─── Cuerpo N4 — Formulario de captura ─── */}
      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 flex flex-col gap-5 max-w-md mx-auto w-full">
          {/* ─── Preview de la foto del producto ─── */}
          <div
            className={`w-full aspect-[4/3] rounded-2xl border flex items-center justify-center overflow-hidden transition-colors duration-500 ${
              imageUrl.trim()
                ? 'border-transparent'
                : isShellDark
                  ? 'bg-white/5 border-white/10'
                  : 'bg-black/5 border-black/5'
            }`}
          >
            {imageUrl.trim() ? (
              <img
                src={imageUrl.trim()}
                alt="Preview del producto"
                className="w-full h-full object-cover select-none pointer-events-none"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-center px-6">
                <span className={`w-12 h-12 rounded-full flex items-center justify-center ${isShellDark ? 'bg-white/10 text-fuchsia-400' : 'bg-fuchsia-500/10 text-fuchsia-600'}`}>
                  <ImagePlus size={22} strokeWidth={1.5} />
                </span>
                <p className={`text-xs font-medium ${isShellDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Agrega la URL de la foto del producto
                </p>
                <p className={`text-[10px] ${isShellDark ? 'text-gray-600' : 'text-gray-400'}`}>
                  Se mostrará una preview en vivo aquí
                </p>
              </div>
            )}
          </div>

          {/* ─── Campo: Nombre ─── */}
          <div className="flex flex-col gap-1.5">
            <label className={`text-xs font-medium ${isShellDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Nombre del producto <span className="text-fuchsia-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Plantilla de Reels"
                autoFocus
                className={`h-11 rounded-xl px-3.5 text-sm outline-none transition-colors ${
                  isShellDark
                    ? 'bg-transparent border border-white/10 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-fuchsia-500/40'
                    : 'bg-black/5 border border-black/5 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-fuchsia-500/20'
                }`}
            />
          </div>

          {/* ─── Campo: Precio ─── */}
          <div className="flex flex-col gap-1.5">
            <label className={`text-xs font-medium ${isShellDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Precio (USD) <span className="text-fuchsia-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Ej. 29.99"
              className={`h-11 rounded-xl px-3.5 text-sm outline-none transition-colors ${
                isShellDark
                  ? 'bg-transparent border border-white/10 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-fuchsia-500/40'
                  : 'bg-black/5 border border-black/5 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-fuchsia-500/20'
              }`}
            />
          </div>

          {/* ─── Campo: SKU ─── */}
          <div className="flex flex-col gap-1.5">
            <label className={`text-xs font-medium ${isShellDark ? 'text-gray-300' : 'text-gray-700'}`}>
              SKU <span className="text-fuchsia-500">*</span>
            </label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="Ej. TPL-REELS-007"
              className={`h-11 rounded-xl px-3.5 text-sm font-mono uppercase outline-none transition-colors ${
                isShellDark
                  ? 'bg-transparent border border-white/10 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-fuchsia-500/40'
                  : 'bg-black/5 border border-black/5 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-fuchsia-500/20'
              }`}
            />
          </div>

          {/* ─── Campo: URL de la foto ─── */}
          <div className="flex flex-col gap-1.5">
            <label className={`text-xs font-medium ${isShellDark ? 'text-gray-300' : 'text-gray-700'}`}>
              URL de la foto
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://ejemplo.com/foto.jpg"
              className={`h-11 rounded-xl px-3.5 text-sm outline-none transition-colors ${
                isShellDark
                  ? 'bg-transparent border border-white/10 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-fuchsia-500/40'
                  : 'bg-black/5 border border-black/5 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-fuchsia-500/20'
              }`}
            />
          </div>

          {/* ─── Acciones ─── */}
          <div className="flex flex-col gap-2.5 pt-2">
            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                isShellDark
                  ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white border border-white/10 hover:shadow-[0_0_20px_rgba(224,86,253,0.3)]'
                  : 'bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white shadow-[0_8px_20px_rgba(217,70,239,0.3)] hover:shadow-[0_8px_25px_rgba(217,70,239,0.4)]'
              }`}
            >
              <Save size={16} strokeWidth={2} />
              Guardar producto
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`w-full py-3 rounded-xl text-xs font-medium border transition-all active:scale-95 ${
                isShellDark
                  ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                  : 'bg-white/60 border-black/5 text-gray-700 hover:bg-black/5'
              }`}
            >
              Cancelar y volver a la tienda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CatalogN4CreateProductForm;