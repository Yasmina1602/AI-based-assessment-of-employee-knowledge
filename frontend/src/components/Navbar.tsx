import React from 'react';
import { 
  Building2, FileText, HelpCircle, BarChart3, LogOut, 
  User, CheckCircle2, LayoutDashboard, BrainCircuit 
} from 'lucide-react';
import { authService } from '../services/api';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user: any;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, user }) => {
  const isAdmin = user?.role === 'admin';

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent">
                Xodim Baholash AI
              </span>
              <span className="hidden md:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
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
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </button>

                <button
                  onClick={() => setCurrentTab('departments')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    currentTab === 'departments'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Bo'limlar</span>
                </button>

                <button
                  onClick={() => setCurrentTab('documents')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    currentTab === 'documents'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Hujjatlar</span>
                </button>

                <button
                  onClick={() => setCurrentTab('questions')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    currentTab === 'questions'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Savollar</span>
                </button>

                <button
                  onClick={() => setCurrentTab('results')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    currentTab === 'results'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
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
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Test Topshirish</span>
                </button>

                <button
                  onClick={() => setCurrentTab('employee-results')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    currentTab === 'employee-results'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Natijalarim</span>
                </button>
              </>
            )}

            {/* Profile & Logout */}
            <div className="h-6 w-px bg-gray-200 mx-1 sm:mx-2" />

            <div className="flex items-center gap-2">
              <div className="flex flex-col text-right hidden sm:block">
                <span className="text-xs font-semibold text-gray-900 leading-tight">
                  {user?.full_name || user?.username}
                </span>
                <span className="text-[10px] text-gray-500">
                  {user?.department_name || (isAdmin ? "Barcha bo'limlar" : 'Xodim')}
                </span>
              </div>

              <button
                onClick={authService.logout}
                title="Chiqish"
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
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
