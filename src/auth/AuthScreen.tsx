import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { NinjabotLogo } from '../components/common/NinjabotLogo';
import {
  loginUsuario,
  registrarUsuario,
  loginConGoogle,
  loginConFacebook,
  getPerfilActual,
} from '../services/supabase';

interface AuthScreenProps {
  /** Se invoca con (email, name) cuando hay sesión activa tras login/registro/Google/Facebook */
  onAuthSuccess: (userEmail: string, userName: string) => void;
}

type AuthMode = 'login' | 'register';

/**
 * AuthScreen — "La Puerta" (estilo Dark Minimalista Borderless)
 *
 * Ruta pública /auth. Experiencia inmersiva tipo túnel omnicanal:
 * - Fondo negro puro (bg-black), sin tarjetas ni contenedores cerrados.
 * - Logo Ninjabot en variante blanca + eslogan "Mensajería Inteligente".
 * - Formulario sin cajas: inputs transparentes con borde inferior sutil.
 * - Registro (Nombre, Email, Password) / Inicio de sesión (Email, Password).
 * - Social Login: iconos limpios de Google y Facebook (OAuth Supabase).
 * - Footer: texto interactivo para conmutar de modo sin botones.
 */
export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Ruta destino guardada por el Cadenero (PublicNinjatLayout) o PowerAppGuard.
  // Tras autenticarse exitosamente, el usuario regresa a este destino.
  const returnTo = searchParams.get('returnTo');

  // Destino final: el returnTo original o /app por defecto
  const resolveDestination = (): string => {
    if (returnTo && returnTo.startsWith('/')) return returnTo;
    return '/app';
  };

  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validaciones básicas
    if (!email.trim() || !email.includes('@')) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }
    if (!password.trim()) {
      setError('Ingresa tu contraseña.');
      return;
    }
    if (mode === 'register') {
      if (!name.trim()) {
        setError('Ingresa tu nombre para crear tu cuenta.');
        return;
      }
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'register') {
        const data = await registrarUsuario(email, password, name);
        const user = data.user;
        if (user && !data.session) {
          // Supabase con email confirmation activo: sesión aún no existe
          setSuccessMessage(
            '¡Cuenta creada! Revisa tu correo para confirmar tu email y luego inicia sesión.'
          );
          setMode('login');
          return;
        }
        const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || name;
        onAuthSuccess(email, userName);
        // Cierre del túnel: redirigir al destino original (returnTo) o /app
        navigate(resolveDestination(), { replace: true });
      } else {
        const data = await loginUsuario(email, password);
        const userName =
          data.user?.user_metadata?.full_name || data.user?.email?.split('@')[0] || 'Usuario Ninjabot';
        onAuthSuccess(email, userName);
        // Cierre del túnel: redirigir al destino original (returnTo) o /app
        navigate(resolveDestination(), { replace: true });
      }
    } catch (err: any) {
      const mensaje = err?.message || 'Error en la autenticación. Intenta de nuevo.';
      if (mensaje.includes('Invalid login credentials')) {
        setError('Credenciales inválidas. Revisa tu email y contraseña.');
      } else if (mensaje.includes('Email not confirmed')) {
        setError('Email no confirmado. Revisa tu bandeja de entrada.');
      } else if (mensaje.includes('already registered') || mensaje.includes('already exists')) {
        setError('Este correo ya está registrado. Inicia sesión.');
      } else {
        setError(mensaje);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      // Redirige al navegador a Google OAuth; al volver, Supabase restaura la sesión
      await loginConGoogle();
      // Nota: tras el redirect, App.tsx escucha onAuthStateChange y navega a /app.
      // Si por alguna razón no hay redirect (popup bloqueado), verificamos sesión:
      try {
        const perfil = await getPerfilActual();
        onAuthSuccess(perfil.email, perfil.full_name || perfil.email?.split('@')[0] || 'Usuario');
        navigate(resolveDestination(), { replace: true });
      } catch {
        // Sin sesión aún: el redirect de OAuth está en curso
      }
    } catch (err: any) {
      console.error('[AuthScreen] Error con Google OAuth:', err);
      setError(err?.message || 'No se pudo conectar con Google. Intenta de nuevo.');
    }
  };

  const handleFacebookLogin = async () => {
    setError('');
    try {
      // Redirige al navegador a Facebook OAuth; al volver, Supabase restaura la sesión
      await loginConFacebook();
      try {
        const perfil = await getPerfilActual();
        onAuthSuccess(perfil.email, perfil.full_name || perfil.email?.split('@')[0] || 'Usuario');
        navigate(resolveDestination(), { replace: true });
      } catch {
        // Sin sesión aún: el redirect de OAuth está en curso
      }
    } catch (err: any) {
      console.error('[AuthScreen] Error con Facebook OAuth:', err);
      setError(err?.message || 'No se pudo conectar con Facebook. Intenta de nuevo.');
    }
  };

  const inputClasses =
    'w-full bg-transparent text-white placeholder-neutral-500 text-center text-sm font-medium py-3 px-4 border-b border-neutral-700 focus:border-white focus:outline-none transition-colors';

  return (
    <div className="bg-black min-h-screen w-full flex flex-col items-center justify-between p-6 select-none font-sans text-white">
      {/* Top Spacer for vertical balance */}
      <div className="w-full h-8 sm:h-12" />

      {/* Main Content — Tunnel */}
      <div className="w-full max-w-sm flex flex-col items-center space-y-6 text-center my-auto">
        {/* ─── Logo Ninjabot — variante blanca para contraste sobre negro ─── */}
        <div className="mb-1 flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24">
          <NinjabotLogo variant="blanco" size="2xl" className="w-full h-full sm:w-24 sm:h-24" />
        </div>

        {/* ─── Nombre de marca ─── */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Ninjabot
        </h1>

        {/* ─── Eslogan exacto ─── */}
        <p className="text-sm sm:text-base text-neutral-400 font-light tracking-wide">
          Mensajería Inteligente
        </p>

        {/* ─── Formulario sin cajas ─── */}
        <form onSubmit={handleSubmit} className="w-full space-y-3.5 pt-2">
          {mode === 'register' && (
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre"
                autoComplete="name"
                className={inputClasses}
              />
            </div>
          )}

          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              autoComplete="email"
              className={inputClasses}
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              className={inputClasses}
            />
          </div>

          {error && (
            <div className="text-red-400 text-xs py-2 font-medium animate-fadeIn">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="text-emerald-400 text-xs py-2 font-medium animate-fadeIn">
              {successMessage}
            </div>
          )}

          {/* Botón principal — sólido minimalista blanco, sin sombras */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-black font-bold py-3.5 px-4 rounded-xl text-sm transition-all active:scale-[0.98] disabled:opacity-70 cursor-pointer mt-1"
          >
            {isLoading
              ? mode === 'register'
                ? 'Creando cuenta...'
                : 'Iniciando sesión...'
              : mode === 'register'
                ? 'Registrarse'
                : 'Iniciar Sesión'}
          </button>
        </form>

        {/* ─── Social Login — iconos limpios (sin botones grandes) ─── */}
        <div className="pt-2 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={handleGoogleLogin}
            aria-label="Continuar con Google"
            title="Continuar con Google"
            className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleFacebookLogin}
            aria-label="Continuar con Facebook"
            title="Continuar con Facebook"
            className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.23.2 2.23.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.57v1.88h2.78l-.45 2.9h-2.33V22c4.78-.76 8.45-4.92 8.45-9.94z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Footer — texto interactivo sin botones */}
      <div className="w-full text-center pb-2">
        <button
          type="button"
          onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
          className="text-[13px] font-normal tracking-wide text-neutral-500 hover:text-white transition-colors cursor-pointer"
        >
          {mode === 'login' ? 'Crear cuenta' : 'Iniciar sesión'}
        </button>
      </div>
    </div>
  );
};