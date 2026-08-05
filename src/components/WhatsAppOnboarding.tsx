import React, { useEffect, useState } from 'react';
import {
  Loader2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { SiMeta, SiWhatsapp } from 'react-icons/si';
import {
  initFacebookSdk,
  openMetaLoginPopup,
} from '../services/metaSdk';
import {
  persistMetaSignupData,
  fetchWabaPhoneNumbers,
} from '../services/supabase';
import type { MetaSignupData, WabaPhoneNumber } from '../services/supabase';
import { useTheme } from '../theme/ThemeContext';

interface WhatsAppOnboardingProps {
  onMetaAuthSuccess: (email: string, name: string) => void;
  onSwitchToAdmin: () => void;
}

export const WhatsAppOnboarding: React.FC<WhatsAppOnboardingProps> = ({
  onMetaAuthSuccess,
  onSwitchToAdmin,
}) => {
  const { isDark } = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  // Variable de diagnóstico solo de escritura (nunca se renderiza)
  const [_sdkDiagnostic, setSdkDiagnostic] = useState<string>('');

  // Inicializar el SDK de Meta al montar el componente
  useEffect(() => {
    const appId = import.meta.env.VITE_META_APP_ID || '';

    console.log('[Onboarding] VITE_META_APP_ID:', appId || '(no configurado)');
    console.log('[Onboarding] window.FB al montar:', typeof window.FB);

    if (!appId) {
      console.warn(
        '[Onboarding] VITE_META_APP_ID no configurado. Usando modo simulación.'
      );
      setSdkDiagnostic('SIMULACIÓN (sin VITE_META_APP_ID)');
      setSdkReady(true);
      return;
    }

    setSdkDiagnostic('Inicializando SDK...');

    initFacebookSdk()
      .then(() => {
        console.log('[Onboarding] Meta SDK inicializado correctamente.');
        console.log('[Onboarding] window.FB después de init:', typeof window.FB);
        if (window.FB) {
          console.log('[Onboarding] FB.version:', window.FB.version);
          console.log('[Onboarding] FB.getLoginStatus:', typeof window.FB.getLoginStatus);
        }
        setSdkDiagnostic('SDK listo ✓');
        setSdkReady(true);
      })
      .catch((err) => {
        console.error('[Onboarding] Error al inicializar Meta SDK:', err);
        setSdkDiagnostic(`Error SDK: ${err.message}`);
        // Aún así marcamos listo para no bloquear la UI
        setSdkReady(true);
      });

    // Timeout de seguridad: si tras 12s el SDK no está listo, habilitar botón igual
    const timeoutId = setTimeout(() => {
      if (!sdkReady) {
        console.warn('[Onboarding] Timeout: SDK no se inicializó en 12s. Forzando habilitación.');
        setSdkDiagnostic('Timeout SDK — habilitando botón');
        setSdkReady(true);
      }
    }, 12000);

    return () => clearTimeout(timeoutId);
  }, []);

  const handleMetaLogin = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // DIAGNÓSTICO: Estado completo antes del login
      console.log('========== META LOGIN DIAGNÓSTICO ==========');
      console.log('[Meta Login] VITE_META_APP_ID:', import.meta.env.VITE_META_APP_ID || '(no configurado)');
      console.log('[Meta Login] VITE_META_EMBEDDED_SIGNUP_CONFIG_ID:', import.meta.env.VITE_META_EMBEDDED_SIGNUP_CONFIG_ID || '(no configurado)');
      console.log('[Meta Login] window.FB status:', typeof window.FB);
      console.log('[Meta Login] sdkReady:', sdkReady);
      if (window.FB) {
        console.log('[Meta Login] FB.version:', window.FB.version);
        console.log('[Meta Login] FB.login disponible:', typeof window.FB.login);
      }
      console.log('============================================');

      const appId = import.meta.env.VITE_META_APP_ID || '';

      // --- 1. OBTENER DATOS DE META ---
      let metaPayload: MetaSignupData;

      if (appId && window.FB && typeof window.FB.login === 'function') {
        // FLUJO REAL: Abrir pop-up de Meta Embedded Signup
        console.log('[Meta Login] Abriendo pop-up de Meta...');
        const result = await openMetaLoginPopup();
        console.log('[Meta Login] Código de autorización recibido.');

        // En producción, el código se enviaría a la Edge Function
        // que lo canjearía y devolvería los datos. Aquí simulamos
        // ese intercambio con latencia.
        console.log('[Meta Login] Canjeando código por datos de Meta...');
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
        // FLUJO SIMULADO (sin App ID real o sin SDK)
        const reason = !appId
          ? 'sin VITE_META_APP_ID'
          : !window.FB
            ? 'FB no disponible'
            : 'FB.login no es función';
        console.log(`[Meta Login] Modo simulación (${reason}).`);
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

      console.log('[Meta Login] Datos obtenidos de Meta:', {
        email: metaPayload.email,
        name: metaPayload.name,
        facebookUserId: metaPayload.facebookUserId,
        wabaId: metaPayload.wabaId,
      });

      // --- 2. CONSULTAR GRAPH API PARA OBTENER NÚMEROS DE LA WABA ---
      console.log('[Meta Login] Consultando Graph API para obtener números de teléfono...');
      let phoneNumbers: WabaPhoneNumber[] = [];

      try {
        phoneNumbers = await fetchWabaPhoneNumbers(
          metaPayload.wabaId,
          metaPayload.accessToken
        );
      } catch (graphErr) {
        console.error('[Meta Login] Error al consultar Graph API:', graphErr);
        // Si falla la consulta, continuamos con los datos que tenemos
      }

      // Si se encontraron números, usar el primero como principal
      if (phoneNumbers.length > 0) {
        metaPayload.phoneNumberId = phoneNumbers[0].phoneNumberId;
        metaPayload.phoneNumber = phoneNumbers[0].displayPhoneNumber;
        console.log('[Meta Login] Número principal seleccionado:', metaPayload.phoneNumber);
      }

      // Asignar la lista completa al payload
      metaPayload.phoneNumbers = phoneNumbers;

      // --- 3. PERSISTIR DIRECTAMENTE EN SUPABASE ---
      console.log('[Meta Login] Persistiendo datos en Supabase...');
      const { email, name } = await persistMetaSignupData(metaPayload);
      console.log('[Meta Login] Datos persistidos correctamente.');

      // --- 4. REDIRIGIR AL PANEL DE CHATS ---
      console.log('[Meta Login] Redirigiendo al panel de chats...');
      onMetaAuthSuccess(email, name);
    } catch (err: any) {
      console.error('[Meta Login] ERROR:', err);
      setError(
        err?.message || 'Error al conectar con Meta. Intenta de nuevo.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center p-6 select-none font-sans transition-colors duration-200 ${isDark ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
      {/* Icono principal: círculo verde con el logo de WhatsApp */}
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center shadow-2xl mb-6">
        <SiWhatsapp className="w-10 h-10 text-white" />
      </div>

      {/* Título */}
      <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Mensajería Inteligente
      </h1>
      <p className={`text-sm mb-8 text-center max-w-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        Conecta tu WhatsApp Business y automatiza la comunicación con tus clientes mediante inteligencia artificial.
      </p>

      {/* Botón principal: Continuar con Meta y WhatsApp */}
      <button
        onClick={handleMetaLogin}
        disabled={isProcessing}
        className="w-full max-w-sm py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-lg active:scale-[0.98] bg-[#1877F2] hover:bg-[#166fe5] text-white hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Conectando con Meta...
          </>
        ) : (
          <>
            <SiMeta className="w-5 h-5" />
            Continuar con Meta 
          </>
        )}
      </button>

      {/* Mensaje de error */}
      {error && (
        <div className="mt-4 w-full max-w-sm p-3 bg-red-500/20 border border-red-500/50 rounded-xl flex items-start gap-2 text-left">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-200 font-medium flex-1">{error}</p>
        </div>
      )}

      {/* Enlace: Entrar como administrador/soporte */}
      <button
        onClick={onSwitchToAdmin}
        className={`mt-6 text-sm transition-colors underline underline-offset-2 ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}
      >
        Entrar como administrador/soporte
      </button>

      {/* Badge de seguridad */}
      <div className={`mt-8 flex items-center gap-1.5 text-[11px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Conexión segura vía Meta Cloud API</span>
      </div>
    </div>
  );
};
