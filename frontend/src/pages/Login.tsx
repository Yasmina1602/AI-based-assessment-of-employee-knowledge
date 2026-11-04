import React, { useState } from 'react';
import { authService } from '../services/api';
import { BrainCircuit, Lock, User, ArrowRight, Sun, Moon, RefreshCw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const { isDark, toggleTheme } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [retryNotice, setRetryNotice] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRetryNotice('');
    setLoading(true);

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      setError("Login va parolni kiriting");
      setLoading(false);
      return;
    }

    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const data = await authService.login(cleanUsername, cleanPassword);
        onLoginSuccess(data.user);
        return;
      } catch (err: any) {
        const isNetworkError =
          !err.response ||
          err.response?.status === 502 ||
          err.response?.status === 503 ||
          err.response?.status === 504 ||
          err.code === 'ERR_NETWORK' ||
          err.message?.includes('Network Error');

        // Agar server hali to'liq ishga tushmagan bo'lsa, avtomatik qayta urinish
        if (isNetworkError && attempt < maxAttempts) {
          setRetryNotice(`Serverga ulanish kutilyapti... Qayta urinilmoqda (${attempt}/${maxAttempts})`);
          await new Promise((resolve) => setTimeout(resolve, 1500));
          continue;
        }

        if (isNetworkError) {
          setError("Backend serveriga (port 4000) ulanib bo'lmadi. Server to'liq ishga tushishini kuting va qayta urinib ko'ring.");
        } else {
          setError(err.response?.data?.message || "Login yoki parol noto'g'ri");
        }
        break;
      }
    }

    setRetryNotice('');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 relative">
      {/* Theme Switcher Top-Right */}
      <div className="absolute top-5 right-5">
        <button
          onClick={toggleTheme}
          title={isDark ? "Yorug' rejim" : "Tungi rejim"}
          className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 backdrop-blur transition shadow-sm"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
        </button>
      </div>

      <div className="max-w-md w-full">
        {/* Logo & Headline */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-xl shadow-indigo-500/20 ring-4 ring-indigo-500/10">
            <BrainCircuit className="w-10 h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Xodim Reyting AI
          </h1>
          <p className="text-indigo-200/70 text-sm mt-1">
            Sun'iy intellekt asosidagi avtomatlashtirilgan baholash tizimi
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-slate-800 transition">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Tizimga kirish</h2>

          {error && (
            <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm rounded-xl">
              {error}
            </div>
          )}

          {retryNotice && !error && (
            <div className="mb-4 p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 text-xs font-semibold rounded-xl flex items-center gap-2 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-amber-600 dark:text-amber-400" />
              <span>{retryNotice}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Login / Foydalanuvchi nomi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-slate-500">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Foydalanuvchi nomini kiriting"
                  autoComplete="username"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Parol
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-slate-500">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Tekshirilmoqda...</span>
                </div>
              ) : (
                <>
                  <span>Kirish</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
