import React, { useState } from 'react';
import { authService } from '../services/api';
import { BrainCircuit, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authService.login(username, password);
      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.response?.data?.message || "Login yoki parol noto'g'ri");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError('');
    setLoading(true);
    try {
      const data = await authService.login(u, p);
      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kirishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo & Headline */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-xl shadow-indigo-500/20 ring-4 ring-indigo-500/10">
            <BrainCircuit className="w-10 h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Xodim Bilimini Baholash
          </h1>
          <p className="text-indigo-200/70 text-sm mt-1">
            AI & RAG asosidagi avtomatlashtirilgan test tizimi
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Tizimga kirish</h2>

          {error && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Login / Foydalanuvchi nomi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin yoki xodim"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Parol
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-50"
            >
              {loading ? (
                <span>Kirilmoqda...</span>
              ) : (
                <>
                  <span>Kirish</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <span className="block text-center text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Tezkor kirish (Demo hisoblar)
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin123')}
                className="py-2.5 px-3 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 rounded-xl text-xs font-semibold transition text-center flex flex-col items-center gap-1"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>HR Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('xodim', 'xodim123')}
                className="py-2.5 px-3 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 rounded-xl text-xs font-semibold transition text-center flex flex-col items-center gap-1"
              >
                <User className="w-4 h-4 text-emerald-600" />
                <span>Xodim</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
