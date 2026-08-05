import React, { useState } from 'react';
import { NinjabotLogo } from './common/NinjabotLogo';
import {
  loginUsuario,
  registrarUsuario,
  loginConGoogle,
  loginConFacebook,
} from '../services/supabase';

interface LoginScreenProps {
  onLogin: (userEmail: string, userName: string) => void;
}

/**
 * LoginScreen — "La Puerta" (estilo Dark Minimalista Borderless)
 *
 * Experiencia inmersiva tipo túnel omnicanal:
 * - Fondo negro puro, sin tarjetas ni contenedores cerrados.
 * - Logo Ninjabot en variante blanca + eslogan "Mensajería Inteligente".
 * - Formulario con inputs transparentes y borde inferior sutil.
 * - Registro (Nombre, Email, Password) o Inicio de sesión (Email, Password)
 *   conmutables desde el footer de texto interactivo.
 * - Social Login: iconos limpios de Google y Facebook (OAuth Supabase).
 */
export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Por favor ingresa tu correo electrónico.');
      return;
    }

    if (!password.trim()) {
      setError('Por favor ingresa tu contraseña.');
      return;
    }

    if (!email.includes('@')) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }

    if (isSignUp && !name.trim()) {
      setError('Por favor ingresa tu nombre.');
      return;
    }

    setIsLoading(true);

    try {
      let userName = 'Usuario Ninjabot';

      if (isSignUp) {
        // Registro con Email, Password y Nombre (cero fricción)
        // La entidad de origen 'ninjabot' se sincroniza dentro de registrarUsuario
        await registrarUsuario(email, password, name.trim());
        userName = name.trim();
      } else {
        const data = await loginUsuario(email, password);
        userName =
          data.user?.user_metadata?.name ||
          data.user?.email?.split('@')[0] ||
          'Usuario Ninjabot';
      }

      onLogin(email, userName);
    } catch (err: any) {
      const mensaje =
        err?.message || 'Error al iniciar sesión. Verifica tus credenciales.';
      if (mensaje.includes('Invalid login credentials')) {
        setError('Credenciales inválidas. Revisa tu email y contraseña.');
      } else if (mensaje.includes('Email not confirmed')) {
        setError('Email no confirmado. Revisa tu bandeja de entrada.');
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
      await loginConGoogle();
      // El redireccionamiento OAuth ocurre automáticamente en Supabase
    } catch (err: any) {
      setError(err?.message || 'Error al iniciar sesión con Google.');
    }
  };

  const handleFacebookLogin = async () => {
    setError('');
    try {
      await loginConFacebook();
      // El redireccionamiento OAuth ocurre automáticamente en Supabase
    } catch (err: any) {
      setError(err?.message || 'Error al iniciar sesión con Facebook.');
    }
  };

  const toggleMode = () => {
    setIsSignUp((prev) => !prev);
    setError('');
  };

  return (
    <div className="bg-black min-h-screen w-full flex flex-col items-center justify-between p-6 select-none font-sans text-white">
      {/* Top Spacer for vertical balance */}
      <div className="w-full h-8 sm:h-12" />

      {/* Main Content — Tunnel */}
      <div className="w-full max-w-sm flex flex-col items-center space-y-6 text-center my-auto">
        {/* Logo Ninjabot — variante blanca para contraste sobre negro */}
        <div className="flex items-center justify-center mb-1 w-20 h-20 sm:w-24 sm:h-24">
          <NinjabotLogo variant="blanco" size="2xl" className="w-full h-full sm:w-24 sm:h-24" />
        </div>

        {/* Eslogan exacto */}
        <p className="text-sm sm:text-base text-neutral-400 font-light tracking-wide">
          Mensajería Inteligente
        </p>

        {/* Formulario sin cajas — inputs transparentes con borde inferior */}
        <form onSubmit={handleSubmit} className="w-full space-y-3.5 pt-2">
          {error && (
            <div className="text-red-400 text-xs py-2 font-medium animate-fadeIn">
              {error}
            </div>
          )}

          {isSignUp && (
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre"
                className="w-full bg-transparent text-white placeholder-neutral-500 text-center text-sm font-medium py-3 px-4 border-b border-neutral-700 focus:border-white focus:outline-none transition-colors"
              />
            </div>
          )}

          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full bg-transparent text-white placeholder-neutral-500 text-center text-sm font-medium py-3 px-4 border-b border-neutral-700 focus:border-white focus:outline-none transition-colors"
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-transparent text-white placeholder-neutral-500 text-center text-sm font-medium py-3 px-4 border-b border-neutral-700 focus:border-white focus:outline-none transition-colors"
            />
          </div>

          {/* Botón principal — sólido minimalista blanco, sin sombras */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-black font-bold py-3.5 px-4 rounded-xl text-sm transition-all active:scale-[0.98] disabled:opacity-70 cursor-pointer mt-1"
          >
            {isLoading ? 'Procesando...' : isSignUp ? 'Registrarse' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Social Login — iconos limpios */}
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
          onClick={toggleMode}
          className="text-[13px] font-normal tracking-wide text-neutral-500 hover:text-white transition-colors cursor-pointer"
        >
          {isSignUp ? 'Iniciar sesión' : 'Crear cuenta'}
        </button>
      </div>
    </div>
  );
};