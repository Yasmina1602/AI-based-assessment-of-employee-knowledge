import React from 'react';
import { 
  Building2, FileText, HelpCircle, BarChart3, LogOut, 
  CheckCircle2, LayoutDashboard, BrainCircuit, Sun, Moon 
} from 'lucide-react';
import { authService } from '../services/api';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user: any;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, user }) => {
  const { isDark, toggleTheme } = useTheme();
  const isAdmin = user?.role === 'admin';

  // Extract initials (e.g. "Aliyev Vali" -> "AV", or fallback "XO")
  const getInitials = (name?: string) => {
    if (!name) return 'XO';
    const clean = name.replace(/\s*\(HR\)/i, '').trim();
    const parts = clean.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  // Format clean display name for header
  const getDisplayName = () => {
    if (isAdmin) {
      if (user?.full_name?.includes('Tizim') || !user?.full_name) {
        return 'HR Admin';
      }
      return user.full_name;
    }
    return user?.full_name || user?.username || 'Xodim';
  };

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-30 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-indigo-800 dark:from-white dark:via-indigo-200 dark:to-indigo-300 bg-clip-text text-transparent">
                Xodim Baholash AI
              </span>
              <span className="hidden md:inline-block ml-2 text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800/80">
                {isAdmin ? 'HR Admin Panel' : 'Xodim Portali'}
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center gap-1 sm:gap-2">
            {isAdmin ? (
              <>
                <button
                  onClick={() => setCurrentTab('dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    currentTab === 'dashboard'
                      ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-semibold'
                      : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </button>

                <button
                  onClick={() => setCurrentTab('departments')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    currentTab === 'departments'
                      ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-semibold'
                      : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Bo'limlar</span>
                </button>

                <button
                  onClick={() => setCurrentTab('documents')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    currentTab === 'documents'
                      ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-semibold'
                      : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Hujjatlar</span>
                </button>

                <button
                  onClick={() => setCurrentTab('questions')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    currentTab === 'questions'
                      ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-semibold'
                      : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Savollar</span>
                </button>

                <button
                  onClick={() => setCurrentTab('results')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    currentTab === 'results'
                      ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-semibold'
                      : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Natijalar</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setCurrentTab('employee-test')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    currentTab === 'employee-test'
                      ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-semibold'
                      : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Test Topshirish</span>
                </button>

                <button
                  onClick={() => setCurrentTab('employee-results')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    currentTab === 'employee-results'
                      ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-semibold'
                      : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Natijalarim</span>
                </button>
              </>
            )}

            {/* Separator */}
            <div className="h-6 w-px bg-gray-200 dark:bg-slate-800 mx-1 sm:mx-2" />

            {/* Dark / Light Mode Switcher */}
            <button
              onClick={toggleTheme}
              title={isDark ? "Yorug' rejimga o'tish" : "Tungi rejimga o'tish"}
              className="p-2 text-gray-500 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition duration-200"
              aria-label="Tungi/Yorug' rejim"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* User Profile Avatar Pill */}
            <div className="flex items-center gap-2.5 pl-1">
              {/* Circular Avatar */}
              <div className="relative flex-shrink-0">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ring-2 select-none ${
                    isAdmin
                      ? 'bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 text-white ring-indigo-200 dark:ring-indigo-800/80 shadow-indigo-500/20'
                      : 'bg-gradient-to-tr from-emerald-500 to-teal-600 text-white ring-teal-200 dark:ring-teal-800/80 shadow-teal-500/20'
                  }`}
                >
                  {isAdmin ? 'HR' : getInitials(user?.full_name || user?.username)}
                </div>
                {/* Online status indicator */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
              </div>

              {/* Name & Role (No "Barcha bo'limlar" text!) */}
              <div className="flex flex-col text-left hidden sm:flex">
                <span className="text-xs font-bold text-gray-900 dark:text-gray-100 leading-tight">
                  {getDisplayName()}
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-none mt-0.5">
                  {isAdmin ? 'Administrator' : (user?.department_name || 'Xodim')}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={authService.logout}
                title="Tizimdan chiqish"
                className="p-2 text-gray-400 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition ml-0.5"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
