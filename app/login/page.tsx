'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!username || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    // TODO: Add actual authentication logic here
    // For now, just redirect to dashboard
    localStorage.setItem('isAuthenticated', 'true');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background grid effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(0,255,255,0.05)_25%,rgba(0,255,255,0.05)_26%,transparent_27%,transparent_74%,rgba(0,255,255,0.05)_75%,rgba(0,255,255,0.05)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(0,255,255,0.05)_25%,rgba(0,255,255,0.05)_26%,transparent_27%,transparent_74%,rgba(0,255,255,0.05)_75%,rgba(0,255,255,0.05)_76%,transparent_77%,transparent)] bg-[length:50px_50px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="/logo-donet.svg"
            alt="DONET Logo"
            className="w-48 h-48"
          />
        </div>

        {/* Title */}
        <h1 className="text-center text-4xl font-bold mb-8">
          <span className="text-cyan-400">APLICACIONES</span>
          <span className="text-white"> - </span>
          <span className="text-white">DONET</span>
        </h1>

        {/* Login Card */}
        <div className="border border-cyan-500/50 rounded-lg p-8 backdrop-blur-sm bg-slate-900/50 shadow-2xl shadow-cyan-500/20">
          <h2 className="text-center text-2xl font-bold text-cyan-400 mb-8">
            Iniciar Sesión
          </h2>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username Input */}
            <div>
              <input
                type="text"
                placeholder="Usuario"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/30 rounded text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
              />
            </div>

            {/* Password Input */}
            <div>
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/30 rounded text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-3 bg-cyan-400 text-slate-900 font-bold rounded hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-400/50"
            >
              ENTRAR
            </button>
          </form>

          {/* Footer */}
          <div className="text-center text-gray-400 text-sm mt-6">
            Versión 1.0 - © 2025 DONET
          </div>
        </div>
      </div>
    </div>
  );
}
