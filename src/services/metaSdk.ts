// ==========================================
// SERVICIO SDK DE META — Embedded Signup
// ==========================================

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

/** Versión de la API de Graph de Meta */
const META_API_VERSION = 'v18.0';

/**
 * Obtiene el App ID de Meta desde variables de entorno.
 * En Vite solo aplican variables con prefijo VITE_ (NEXT_PUBLIC_* no existe aquí).
 */
function getMetaAppId(): string {
  return import.meta.env.VITE_META_APP_ID || '';
}

/**
 * Inicializa el SDK de Facebook JS.
 *
 * El script del SDK ya se carga desde index.html. Esta función:
 * 1. Espera a que window.FB esté disponible (el script se carga asíncrono).
 * 2. Ejecuta FB.init() con el App ID desde variables de entorno de Vite.
 * 3. Registra logs de diagnóstico para verificar el estado.
 *
 * @returns Promise que resuelve cuando FB está listo.
 */
export function initFacebookSdk(): Promise<void> {
  return new Promise((resolve, reject) => {
    const appId = getMetaAppId();

    console.log('[Meta SDK] initFacebookSdk() llamado. appId:', appId || '(no configurado)');
    console.log('[Meta SDK] window.FB antes de init:', typeof window.FB);

    // Si window.FB ya existe, hacemos init directamente
    if (window.FB) {
      console.log('[Meta SDK] window.FB ya disponible. Ejecutando FB.init()...');
      try {
        window.FB.init({
          appId: appId || undefined,
          autoLogAppEvents: true,
          xfbml: true,
          version: META_API_VERSION,
        });
        console.log('[Meta SDK] FB.init() completado.');
        resolve();
      } catch (err) {
        console.error('[Meta SDK] FB.init() falló:', err);
        reject(err);
      }
      return;
    }

    // Si window.FB aún no está, definimos fbAsyncInit para cuando el SDK termine de cargar
    console.log('[Meta SDK] window.FB no disponible. Definiendo fbAsyncInit...');
    window.fbAsyncInit = () => {
      console.log('[Meta SDK] fbAsyncInit disparado. window.FB disponible:', typeof window.FB);
      try {
        window.FB.init({
          appId: appId || undefined,
          autoLogAppEvents: true,
          xfbml: true,
          version: META_API_VERSION,
        });
        console.log('[Meta SDK] FB.init() completado desde fbAsyncInit.');
        resolve();
      } catch (err) {
        console.error('[Meta SDK] FB.init() desde fbAsyncInit falló:', err);
        reject(err);
      }
    };

    // Timeout de seguridad: si tras 10s el SDK no cargó, resolver igual (modo simulación)
    setTimeout(() => {
      if (!window.FB) {
        console.warn('[Meta SDK] Timeout: SDK no cargó en 10s. Activando modo simulación.');
        resolve(); // Resolvemos igual para no bloquear la UI
      }
    }, 10000);
  });
}

/**
 * Abre el flujo de Meta Embedded Signup (FB.login) con los
 * permisos necesarios para WhatsApp Business.
 *
 * @returns Una promesa que resuelve con el código de autorización
 *          o rechaza si el usuario cancela o hay error.
 */
export function openMetaLoginPopup(): Promise<{ authorizationCode: string }> {
  return new Promise((resolve, reject) => {
    // Diagnóstico: estado de window.FB
    console.log('[Meta SDK] openMetaLoginPopup() — window.FB status:', typeof window.FB);
    if (window.FB) {
      console.log('[Meta SDK] window.FB versión:', window.FB.version || 'unknown');
      console.log('[Meta SDK] window.FB.getLoginStatus disponible:', typeof window.FB.getLoginStatus);
    }

    if (!window.FB) {
      console.error('[Meta SDK] ERROR: FB no está inicializado.');
      reject(new Error('FB SDK no está inicializado.'));
      return;
    }

    const configId = import.meta.env.VITE_META_EMBEDDED_SIGNUP_CONFIG_ID || '';
    console.log('[Meta SDK] Abriendo FB.login con config_id:', configId || '(no configurado)');

    window.FB.login(
      (response: any) => {
        // DIAGNÓSTICO: Imprimir respuesta completa de Meta
        console.log('[Meta SDK] FB.login callback response:', JSON.stringify(response, null, 2));
        console.log('[Meta SDK] response.status:', response?.status);
        console.log('[Meta SDK] response.authResponse:', response?.authResponse ? 'presente' : 'ausente');

        if (response.authResponse) {
          console.log('[Meta SDK] authResponse.code:', response.authResponse.code ? 'presente' : 'ausente');
          console.log('[Meta SDK] authResponse.accessToken:', response.authResponse.accessToken ? 'presente' : 'ausente');
          console.log('[Meta SDK] authResponse.userID:', response.authResponse.userID || 'ausente');
        }

        // Si el usuario cerró el popup
        if (response.status === 'unknown') {
          console.warn('[Meta SDK] Usuario cerró el popup o no autenticado.');
          reject(new Error('Inicio de sesión cancelado por el usuario.'));
          return;
        }

        if (response.status === 'not_authorized') {
          console.warn('[Meta SDK] Usuario no autorizó la aplicación.');
          reject(new Error('No autorizaste la conexión con Meta.'));
          return;
        }

        // Si hay un error en la respuesta
        if (response.error) {
          console.error('[Meta SDK] Error en FB.login:', response.error);
          reject(new Error(`Meta Error: ${response.error.message || JSON.stringify(response.error)}`));
          return;
        }

        // Respuesta exitosa con authResponse
        if (response.authResponse) {
          const authCode = response.authResponse.code;
          if (authCode) {
            console.log('[Meta SDK] Código de autorización recibido exitosamente.');
            resolve({ authorizationCode: authCode });
          } else {
            console.warn('[Meta SDK] authResponse presente pero sin code. ¿Falta config_id o override_default_response_type?');
            reject(
              new Error(
                'No se recibió el código de autorización de Meta. ' +
                  'El flujo de Embedded Signup requiere un config_id configurado y ' +
                  'override_default_response_type=true. ' +
                  'Verifica VITE_META_EMBEDDED_SIGNUP_CONFIG_ID en tu archivo .env.'
              )
            );
          }
        } else {
          console.error('[Meta SDK] Respuesta inesperada sin authResponse:', response);
          reject(new Error('Error inesperado al autenticar con Meta.'));
        }
      },
      {
        config_id: configId || undefined,
        response_type: 'code',
        override_default_response_type: true,
        scope: 'whatsapp_business_management,whatsapp_business_messaging,business_management',
        extras: {
          setup: {
            prefetch_data: true,
          },
        },
      }
    );
  });
}
