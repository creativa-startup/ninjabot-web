import React, { useState, useEffect } from 'react';
import {
  X,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { SiMeta, SiWhatsapp, SiMessenger, SiInstagram } from 'react-icons/si';
import type { MessagingPlatform } from '../types';
import {
  initFacebookSdk,
  openMetaLoginPopup,
} from '../services/metaSdk';
import {
  persistMetaSignupData,
  fetchWabaPhoneNumbers,
} from '../services/supabase';
import type { MetaSignupData } from '../services/supabase';

interface PlatformConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: MessagingPlatform | null;
  onConnectSuccess: (email: string, name: string) => void;
}

const PLATFORM_CONFIG: Record<MessagingPlatform, {
  icon: React.ReactNode;
  name: string;
  color: string;
  description: string;
}> = {
  whatsapp: {
    icon: <SiWhatsapp className="w-8 h-8 text-white" />,
    name: 'WhatsApp Business',
    color: 'from-[#25D366] to-[#128C7E]',
    description: 'Conecta tu WhatsApp Business para automatizar mensajes y atención al cliente.',
  },
  messenger: {
    icon: <SiMessenger className="w-8 h-8 text-white" />,
    name: 'Messenger',
    color: 'from-[#006AFF] to-[#00A3FF]',
    description: 'Conecta tu página de Facebook para gestionar mensajes de Messenger.',
  },
  instagram: {
    icon: <SiInstagram className="w-8 h-8 text-white" />,
    name: 'Instagram',
    color: 'from-[#F58529] via-[#DD2A7B] to-[#8134AF]',
    description: 'Conecta tu cuenta de Instagram para responder mensajes directos.',
  },
};

export const PlatformConnectModal: React.FC<PlatformConnectModalProps> = ({
  isOpen,
  onClose,
  platform,
  onConnectSuccess,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [_sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const appId = import.meta.env.VITE_META_APP_ID || '';

    if (!appId) {
      setSdkReady(true);
      return;
    }

    initFacebookSdk()
      .then(() => setSdkReady(true))
      .catch(() => setSdkReady(true));

    const timeoutId = setTimeout(() => {
      setSdkReady(true);
    }, 12000);

    return () => clearTimeout(timeoutId);
  }, [isOpen]);

  if (!isOpen || !platform) return null;

  const config = PLATFORM_CONFIG[platform];

  const handleConnect = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const appId = import.meta.env.VITE_META_APP_ID || '';

      let metaPayload: MetaSignupData;

      if (appId && window.FB && typeof window.FB.login === 'function') {
        const result = await openMetaLoginPopup();
        await new Promise((resolve) => setTimeout(resolve, 2000));

        metaPayload = {
          facebookUserId: 'fb_user_' + Date.now(),
          email: 'usuario.meta@ejemplo.com',
          name: 'María García',
          wabaId: 'waba_' + Date.now(),
          phoneNumberId: 'phone_id_' + Date.now(),
          phoneNumber: '+593987654321',
          businessName: 'Mi Empresa Ninjabot',
          accessToken: 'ea_' + result.authorizationCode.substring(0, 20),
        };
      } else {
        await new Promise((resolve) => setTimeout(resolve, 2500));

        metaPayload = {
          facebookUserId: 'fb_user_simulated_987654321',
          email: 'usuario.meta@ejemplo.com',
          name: 'María García',
          wabaId: 'waba_simulated_1122334455',
          phoneNumberId: 'phone_id_simulated_5566778899',
          phoneNumber: '+593987654321',
          businessName: 'Mi Empresa Ninjabot',
          accessToken: 'ea_simulated_token_for_demo',
        };
      }

      // Fetch phone numbers for WhatsApp integration
      if (platform === 'whatsapp') {
        try {
          const phoneNumbers = await fetchWabaPhoneNumbers(
            metaPayload.wabaId,
            metaPayload.accessToken
          );
          metaPayload.phoneNumbers = phoneNumbers;
        } catch (graphErr) {
          console.error('[PlatformConnect] Error fetching phone numbers:', graphErr);
        }
      }

      await persistMetaSignupData(metaPayload);
      onConnectSuccess(metaPayload.email, metaPayload.name);
      onClose();
    } catch (err: any) {
      console.error('[PlatformConnect] Error:', err);
      setError(err?.message || 'Error al conectar. Intenta de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
        {/* Close button */}
        <div className="flex justify-end mb-2">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Icon Circle */}
        <div className="flex justify-center mb-5">
          <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg`}>
            {config.icon}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-extrabold text-gray-900 text-center mb-1">
          Conectar {config.name}
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
          {config.description}
        </p>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-left">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Connect button */}
        <button
          onClick={handleConnect}
          disabled={isProcessing}
          className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-md active:scale-[0.98] bg-[#1877F2] hover:bg-[#166fe5] text-white hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Conectando...
            </>
          ) : (
            <>
              <SiMeta className="w-5 h-5" />
              Continuar con Meta
            </>
          )}
        </button>

        {/* Security badge */}
        <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Conexión segura vía Meta Cloud API</span>
        </div>
      </div>
    </div>
  );
};