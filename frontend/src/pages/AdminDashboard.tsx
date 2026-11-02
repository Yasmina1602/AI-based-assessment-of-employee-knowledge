import React, { useEffect, useState } from 'react';
import { resultService } from '../services/api';
import { 
  Users, CheckCircle2, TrendingUp, AlertTriangle, 
  Building2, Clock, ShieldAlert, ArrowUpRight 
} from 'lucide-react';

interface AdminDashboardProps {
  onViewResults: (sessionId: number) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onViewResults }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await resultService.getDashboardStats();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const { stats, departments, recent_tests } = data || { stats: {}, departments: [], recent_tests: [] };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard & Umumiy Statistika</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Xodimlarning bilim darajasi va test natijalarining umumiy tahlili
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium">Jami Xodimlar</span>
            <div className="text-2xl font-bold text-gray-900">{stats.total_employees || 0}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium">O'tgan Testlar</span>
            <div className="text-2xl font-bold text-gray-900">
              {stats.passed_tests || 0} <span className="text-xs text-gray-400 font-normal">/ {stats.total_tests || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium">O'rtacha Natija</span>
            <div className="text-2xl font-bold text-gray-900">{stats.average_percentage || 0}%</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium">Anti-Cheat Bekorlar</span>
            <div className="text-2xl font-bold text-amber-600">{stats.cheat_cancelled_tests || 0}</div>
          </div>
        </div>
      </div>

      {/* Departments Performance */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-600" />
          <span>Bo'limlar bo'yicha ko'rsatkichlar</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {departments.map((dept: any) => (
            <div key={dept.id} className="p-4 rounded-xl border border-gray-100 bg-slate-50/50">
              <span className="text-sm font-bold text-gray-900 block truncate">{dept.name}</span>
              <div className="mt-2 flex justify-between text-xs text-gray-500 mb-1">
                <span>O'rtacha ball:</span>
                <span className="font-semibold text-gray-800">{dept.avg_score}%</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, dept.avg_score)}%` }}
                />
              </div>
              <div className="mt-2 text-[11px] text-gray-400">
                Topshirilgan testlar: {dept.tests_count} ta
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Tests Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-600" />
          <span>So'nggi topshirilgan testlar</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="pb-3">Xodim</th>
                <th className="pb-3">Bo'lim</th>
                <th className="pb-3">Natija</th>
                <th className="pb-3">Holat</th>
                <th className="pb-3">Qoidabuzarlik</th>
                <th className="pb-3 text-right">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recent_tests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    Hozircha test natijalari mavjud emas
                  </td>
                </tr>
              ) : (
                recent_tests.map((test: any) => (
                  <tr key={test.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 font-medium text-gray-900">
                      {test.employee_name || test.username}
                    </td>
                    <td className="py-3.5 text-gray-600">{test.department_name}</td>
                    <td className="py-3.5">
                      <span className="font-bold text-gray-900">{test.percentage}%</span>
                    </td>
                    <td className="py-3.5">
                      {test.is_passed ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> O'tdi
                        </span>
                      ) : test.status === 'cancelled_cheat' ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-700 font-semibold border border-red-200">
                          <AlertTriangle className="w-3.5 h-3.5" /> Anti-cheat bekor
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                          Yiqildi
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 text-gray-500">
                      {test.cheat_warnings_count > 0 ? (
                        <span className="text-amber-600 font-semibold text-xs">
                          {test.cheat_warnings_count} marta
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">0</span>
                      )}
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => onViewResults(test.id)}
                        className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-lg transition"
                        title="Tafsilotlar"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

