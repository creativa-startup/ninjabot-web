import React from 'react';
import { User, Loader2 } from 'lucide-react';

interface ProfileSettingsProps {
  userData: { full_name: string; email: string; phone: string };
  tempUser: { full_name: string; email: string; phone: string };
  setTempUser: (data: any) => void;
  isEditing: boolean;
  isLoading: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  userData, tempUser, setTempUser, isEditing, isLoading, isSaving, onEdit, onSave, onCancel,
}) => {
  return (
    <div className="p-5 sm:p-6 max-w-2xl">
      <h3 className="font-extrabold text-base sm:text-lg text-gray-900 mb-5">Datos del Perfil</h3>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-white shadow-sm">
          <User className="w-8 h-8 fill-gray-400/50" />
        </div>
        <div>
          <p className="font-bold text-sm text-gray-900">{userData.full_name || 'Usuario'}</p>
          <p className="text-xs text-gray-500">{userData.email}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse"><div className="h-4 w-24 bg-gray-300 rounded mb-1"></div><div className="h-3 w-16 bg-gray-200 rounded"></div></div>
          ))}
        </div>
      ) : !isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><div className="text-sm font-extrabold text-gray-900">{userData.full_name || '-'}</div><div className="text-xs text-gray-500 font-medium">Nombre</div></div>
            <div><div className="text-sm font-extrabold text-gray-900">{userData.email || '-'}</div><div className="text-xs text-gray-500 font-medium">Email</div></div>
            <div><div className="text-sm font-extrabold text-gray-900">{userData.phone || '-'}</div><div className="text-xs text-gray-500 font-medium">Teléfono</div></div>
          </div>
          <button onClick={onEdit} className="underline font-bold text-xs sm:text-sm text-gray-900 cursor-pointer hover:opacity-80">Editar</button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-xs text-gray-700 mb-1">Nombre</label>
              <input type="text" value={tempUser.full_name} onChange={(e) => setTempUser({ ...tempUser, full_name: e.target.value })} placeholder="Nombre" className="w-full bg-white rounded-lg px-3 py-2 text-xs font-medium text-gray-900 shadow-xs outline-none border border-gray-200 focus:border-gray-400" />
            </div>
            <div>
              <label className="block font-bold text-xs text-gray-700 mb-1">Email</label>
              <input type="email" value={tempUser.email} onChange={(e) => setTempUser({ ...tempUser, email: e.target.value })} placeholder="Email" className="w-full bg-white rounded-lg px-3 py-2 text-xs font-medium text-gray-900 shadow-xs outline-none border border-gray-200 focus:border-gray-400" />
            </div>
            <div>
              <label className="block font-bold text-xs text-gray-700 mb-1">Teléfono</label>
              <input type="text" value={tempUser.phone} onChange={(e) => setTempUser({ ...tempUser, phone: e.target.value })} placeholder="Teléfono" className="w-full bg-white rounded-lg px-3 py-2 text-xs font-medium text-gray-900 shadow-xs outline-none border border-gray-200 focus:border-gray-400" />
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
    </div>
  );
};