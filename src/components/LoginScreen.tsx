import React, { useState } from 'react';
import whiteLogo from '../assets/ninjabot_logotipo_blanco.png';
import { loginUsuario } from '../services/supabase';

interface LoginScreenProps {
  onLogin: (userEmail: string, userName: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
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

    setIsLoading(true);

    try {
      const data = await loginUsuario(email, password);
      const userName = data.user?.user_metadata?.name ||
        data.user?.email?.split('@')[0] ||
        'Usuario Ninjabot';
      onLogin(email, userName);
    } catch (err: any) {
      const mensaje = err?.message || 'Error al iniciar sesión. Verifica tus credenciales.';
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

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin('usuario.google@ninjabot.com', 'Usuario Google');
    }, 400);
  };

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col items-center justify-between p-6 select-none font-sans">
      {/* Top Spacer for vertical balance */}
      <div className="w-full h-8 sm:h-12" />

      {/* Main Login Form Container */}
      <div className="w-full max-w-sm flex flex-col items-center space-y-6 text-center my-auto">
        {/* White Ninja Logo */}
        <div className="flex items-center justify-center mb-1 w-20 h-20 sm:w-24 sm:h-24">
          <img src={whiteLogo} alt="Ninjabot Logo" className="w-full h-full object-contain" />
        </div>

        {/* Brand Name */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#e056fd] tracking-tight">
          Ninjabot
        </h1>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-3.5 pt-2">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-xs py-2 px-3 rounded-xl font-medium animate-fadeIn">
              {error}
            </div>
          )}

          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full bg-[#dbe2f0] text-gray-900 placeholder-gray-500 text-center text-sm font-medium py-3 px-4 rounded-xl outline-none focus:ring-2 focus:ring-[#e056fd] transition-all shadow-inner"
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              className="w-full bg-[#dbe2f0] text-gray-900 placeholder-gray-500 text-center text-sm font-medium py-3 px-4 rounded-xl outline-none focus:ring-2 focus:ring-[#e056fd] transition-all shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#e056fd] hover:bg-[#d846fd] text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-md active:scale-[0.98] disabled:opacity-70 cursor-pointer mt-1"
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Continue with Google */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-2 text-white hover:text-[#e056fd] font-semibold text-sm transition-colors cursor-pointer py-1"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            Continuar con Google
          </button>
        </div>
      </div>

      {/* Footer text */}
      <div className="w-full text-center pb-2">
        <p className="text-[11px] text-gray-400 font-normal tracking-wide">
          Desarrollado desde la api de WhatsApp Business
        </p>
      </div>
    </div>
  );
};
