import React, { useState, useEffect } from 'react';
import { authService } from './services/api';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminDepartments } from './pages/AdminDepartments';
import { AdminDocuments } from './pages/AdminDocuments';
import { AdminQuestions } from './pages/AdminQuestions';
import { AdminResults } from './pages/AdminResults';
import { AdminAdmins } from './pages/AdminAdmins';
import { EmployeeTest } from './pages/EmployeeTest';
import { EmployeeResults } from './pages/EmployeeResults';

export const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedResultId, setSelectedResultId] = useState<number | null>(null);

  const isSuperAdmin = user?.role === 'superadmin';
  const isAdmin = user?.role === 'admin' || isSuperAdmin;

  useEffect(() => {
    const savedUser = authService.getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
      if (savedUser.role === 'admin' || savedUser.role === 'superadmin') {
        setCurrentTab('dashboard');
      } else {
        setCurrentTab('employee-test');
      }
    }
  }, []);

  const handleLoginSuccess = (loggedInUser: any) => {
    setUser(loggedInUser);
    if (loggedInUser.role === 'admin' || loggedInUser.role === 'superadmin') {
      setCurrentTab('dashboard');
    } else {
      setCurrentTab('employee-test');
    }
  };

  const handleViewResultDetail = (sessionId: number) => {
    setSelectedResultId(sessionId);
    if (isAdmin) {
      setCurrentTab('results');
    } else {
      setCurrentTab('employee-results');
    }
  };

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} user={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isAdmin ? (
          <>
            {currentTab === 'dashboard' && (
              <AdminDashboard onViewResults={handleViewResultDetail} />
            )}
            {currentTab === 'departments' && <AdminDepartments />}
            {currentTab === 'documents' && <AdminDocuments />}
            {currentTab === 'questions' && <AdminQuestions />}
            {currentTab === 'results' && (
              <AdminResults initialSessionId={selectedResultId} />
            )}
            {/* Superadmin Exclusive Admins Management Tab */}
            {currentTab === 'admins' && isSuperAdmin && <AdminAdmins />}
          </>
        ) : (
          <>
            {currentTab === 'employee-test' && (
              <EmployeeTest user={user} onViewResults={handleViewResultDetail} />
            )}
            {currentTab === 'employee-results' && (
              <EmployeeResults initialSessionId={selectedResultId} />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
