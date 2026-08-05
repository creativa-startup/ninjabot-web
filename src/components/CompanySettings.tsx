import React from 'react';
import { Building2, Loader2 } from 'lucide-react';

interface CompanySettingsProps {
  businessData: { name: string; email: string; phone: string; address: string; description: string };
  tempBusiness: { name: string; email: string; phone: string; address: string; description: string };
  setTempBusiness: (data: any) => void;
  isEditing: boolean;
  isLoading: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export const CompanySettings: React.FC<CompanySettingsProps> = ({
  businessData, tempBusiness, setTempBusiness, isEditing, isLoading, isSaving, onEdit, onSave, onCancel,
}) => {
  return (
    <div className="p-5 sm:p-6 max-w-2xl">
      <h3 className="font-extrabold text-base sm:text-lg text-gray-900 mb-5">Información del Negocio</h3>

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (<div key={i} className="animate-pulse"><div className="h-4 w-24 bg-gray-300 rounded mb-1"></div><div className="h-3 w-16 bg-gray-200 rounded"></div></div>))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map((i) => (<div key={i} className="animate-pulse"><div className="h-4 w-24 bg-gray-300 rounded mb-1"></div><div className="h-3 w-16 bg-gray-200 rounded"></div></div>))}
          </div>
        </div>
      ) : !isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><div className="text-sm font-extrabold text-gray-900">{businessData.name || '-'}</div><div className="text-xs text-gray-500 font-medium">Nombre del negocio</div></div>
            <div><div className="text-sm font-extrabold text-gray-900">{businessData.email || '-'}</div><div className="text-xs text-gray-500 font-medium">Email de contacto</div></div>
            <div><div className="text-sm font-extrabold text-gray-900">{businessData.phone || '-'}</div><div className="text-xs text-gray-500 font-medium">Teléfono</div></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><div className="text-sm font-extrabold text-gray-900">{businessData.address || '-'}</div><div className="text-xs text-gray-500 font-medium">Dirección</div></div>
            <div><div className="text-sm font-extrabold text-gray-900">{businessData.description || '-'}</div><div className="text-xs text-gray-500 font-medium">Descripción</div></div>
          </div>
          <button onClick={onEdit} className="underline font-bold text-xs sm:text-sm text-gray-900 cursor-pointer hover:opacity-80">Editar</button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-xs text-gray-700 mb-1">Nombre del negocio</label>
              <input type="text" value={tempBusiness.name} onChange={(e) => setTempBusiness({ ...tempBusiness, name: e.target.value })} placeholder="Nombre del negocio" className="w-full bg-white rounded-lg px-3 py-2 text-xs font-medium text-gray-900 shadow-xs outline-none border border-gray-200 focus:border-gray-400" />
            </div>
            <div>
              <label className="block font-bold text-xs text-gray-700 mb-1">Email de contacto</label>
              <input type="email" value={tempBusiness.email} onChange={(e) => setTempBusiness({ ...tempBusiness, email: e.target.value })} placeholder="Email de contacto" className="w-full bg-white rounded-lg px-3 py-2 text-xs font-medium text-gray-900 shadow-xs outline-none border border-gray-200 focus:border-gray-400" />
            </div>
            <div>
              <label className="block font-bold text-xs text-gray-700 mb-1">Teléfono</label>
              <input type="text" value={tempBusiness.phone} onChange={(e) => setTempBusiness({ ...tempBusiness, phone: e.target.value })} placeholder="Teléfono" className="w-full bg-white rounded-lg px-3 py-2 text-xs font-medium text-gray-900 shadow-xs outline-none border border-gray-200 focus:border-gray-400" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-xs text-gray-700 mb-1">Dirección</label>
              <input type="text" value={tempBusiness.address} onChange={(e) => setTempBusiness({ ...tempBusiness, address: e.target.value })} placeholder="Dirección" className="w-full bg-white rounded-lg px-3 py-2 text-xs font-medium text-gray-900 shadow-xs outline-none border border-gray-200 focus:border-gray-400" />
            </div>
            <div>
              <label className="block font-bold text-xs text-gray-700 mb-1">Descripción</label>
              <input type="text" value={tempBusiness.description} onChange={(e) => setTempBusiness({ ...tempBusiness, description: e.target.value })} placeholder="Descripción" className="w-full bg-white rounded-lg px-3 py-2 text-xs font-medium text-gray-900 shadow-xs outline-none border border-gray-200 focus:border-gray-400" />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button onClick={onSave} disabled={isSaving} className="border-2 border-black bg-transparent hover:bg-black hover:text-white text-black font-bold text-xs sm:text-sm px-6 py-1.5 rounded-full transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {isSaving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Guardando...</> : 'Guardar'}
            </button>
            <button onClick={onCancel} disabled={isSaving} className="underline font-bold text-xs sm:text-sm text-gray-600 cursor-pointer hover:opacity-80">Cancelar</button>
          </div>
        </div>
      )}

      {/* Meta Business Manager Section */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className="font-extrabold text-sm text-gray-900 mb-3">Meta Business Manager</h4>
        <p className="text-xs text-gray-500 mb-3">Conecta tu negocio con Meta para integraciones de WhatsApp, Instagram y CAPI.</p>
        <button className="flex items-center gap-2 px-5 py-2 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-xl font-bold text-xs shadow-xs transition-colors">
          <Building2 className="w-4 h-4" />
          Conectar Meta Business
        </button>
      </div>
    </div>
  );
};