import React, { useEffect, useState } from 'react';
import { authService, departmentService } from '../services/api';
import { 
  ShieldCheck, Shield, Users, UserPlus, Edit2, Trash2, 
  Crown, CheckCircle2, AlertCircle, X, Save, KeyRound, 
  User, Building2, Search, Filter, Eye, EyeOff 
} from 'lucide-react';

export const AdminAdmins: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'admins' | 'employees'>('admins');
  const [admins, setAdmins] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters for Employees tab
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Admin Modal State
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<any>(null);
  const [adminSubmitting, setAdminSubmitting] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminFormData, setAdminFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'admin',
  });

  // Employee Modal State (Superadmin can edit employee logins & passwords)
  const [empModalOpen, setEmpModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [empSubmitting, setEmpSubmitting] = useState(false);
  const [showEmpPassword, setShowEmpPassword] = useState(false);
  const [empFormData, setEmpFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    department_id: 1,
  });

  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [adminsData, usersData, deptsData, rolesData] = await Promise.all([
        authService.getAdmins(),
        authService.getUsers(),
        departmentService.getAll().catch(() => []),
        authService.getRoles().catch(() => []),
      ]);

      setAdmins(adminsData);
      // Filter out admins from all users to get employees
      const empsOnly = (usersData || []).filter((u: any) => u.role === 'xodim');
      setEmployees(empsOnly);
      setDepartments(deptsData || []);
      setRoles(rolesData || []);

      if (deptsData && deptsData.length > 0 && !empFormData.department_id) {
        setEmpFormData((prev) => ({ ...prev, department_id: deptsData[0].id }));
      }
    } catch (err: any) {
      console.error("Ma'lumotlarni yuklashda xatolik:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- ADMIN ACTIONS ---
  const handleOpenAddAdmin = () => {
    setEditingAdmin(null);
    setShowAdminPassword(false);
    setAdminFormData({
      username: '',
      password: '',
      full_name: '',
      role: 'admin',
    });
    setAdminModalOpen(true);
  };

  const handleOpenEditAdmin = (admin: any) => {
    setEditingAdmin(admin);
    setShowAdminPassword(false);
    setAdminFormData({
      username: admin.username,
      password: '',
      full_name: admin.full_name,
      role: admin.role,
    });
    setAdminModalOpen(true);
  };

  const handleDeleteAdmin = async (admin: any) => {
    if (admin.id === currentUser?.id) {
      alert("O'z hisobingizni o'chira olmaysiz!");
      return;
    }

    if (!window.confirm(`Haqiqatdan ham "${admin.full_name}" (@${admin.username}) administratorini tizimdan o'chirmoqchimisiz?`)) {
      return;
    }

    try {
      await authService.deleteAdmin(admin.id);
      await loadAllData();
    } catch (err: any) {
      alert(err.response?.data?.message || "O'chirishda xatolik yuz berdi");
    }
  };

  const handleSaveAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminFormData.username.trim() || !adminFormData.full_name.trim()) {
      alert("Iltimos, barcha majburiy maydonlarni to'ldiring");
      return;
    }

    if (!editingAdmin && !adminFormData.password.trim()) {
      alert("Yangi admin uchun parol kiritish shart");
      return;
    }

    try {
      setAdminSubmitting(true);
      if (editingAdmin) {
        await authService.updateAdmin(editingAdmin.id, adminFormData);
      } else {
        await authService.createAdmin(adminFormData);
      }
      setAdminModalOpen(false);
      await loadAllData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Saqlashda xatolik yuz berdi');
    } finally {
      setAdminSubmitting(false);
    }
  };

  // --- EMPLOYEE ACTIONS ---
  const handleOpenAddEmployee = () => {
    setEditingEmployee(null);
    setShowEmpPassword(false);
    setEmpFormData({
      username: '',
      password: '',
      full_name: '',
      department_id: departments[0]?.id || 1,
    });
    setEmpModalOpen(true);
  };

  const handleOpenEditEmployee = (emp: any) => {
    setEditingEmployee(emp);
    setShowEmpPassword(false);
    setEmpFormData({
      username: emp.username,
      password: '',
      full_name: emp.full_name,
      department_id: emp.department_id || departments[0]?.id || 1,
    });
    setEmpModalOpen(true);
  };

  const handleDeleteEmployee = async (emp: any) => {
    if (!window.confirm(`Haqiqatdan ham "${emp.full_name}" (@${emp.username}) xodimini o'chirmoqchimisiz?`)) {
      return;
    }

    try {
      await authService.deleteUser(emp.id);
      await loadAllData();
    } catch (err: any) {
      alert(err.response?.data?.message || "O'chirishda xatolik yuz berdi");
    }
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empFormData.username.trim() || !empFormData.full_name.trim()) {
      alert("Iltimos, barcha majburiy maydonlarni to'ldiring");
      return;
    }

    if (!editingEmployee && !empFormData.password.trim()) {
      alert("Yangi xodim uchun parol kiritish shart");
      return;
    }

    try {
      setEmpSubmitting(true);
      if (editingEmployee) {
        await authService.updateUser(editingEmployee.id, empFormData);
      } else {
        await authService.registerEmployee(empFormData);
      }
      setEmpModalOpen(false);
      await loadAllData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Saqlashda xatolik yuz berdi');
    } finally {
      setEmpSubmitting(false);
    }
  };

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesDept = !selectedDeptFilter || String(emp.department_id) === String(selectedDeptFilter);
    const matchesSearch = !searchQuery || 
      emp.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.username?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const superAdminCount = admins.filter((a) => a.role === 'superadmin').length;
  const hrAdminCount = admins.filter((a) => a.role === 'admin').length;

  return (
    <div className="space-y-6 py-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80">
              Superadmin Nazorati
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2.5">
            <ShieldCheck className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <span>Foydalanuvchilar va Kirish Huquqlari</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Superadmin paneli: Administratorlar va barcha bo'lim xodimlarining login-parollarini to'liq boshqaring va tahrirlang.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {activeTab === 'admins' ? (
            <button
              onClick={handleOpenAddAdmin}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/20 transition transform active:scale-95 text-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>Yangi Admin Qo'shish</span>
            </button>
          ) : (
            <button
              onClick={handleOpenAddEmployee}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 transition transform active:scale-95 text-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>Yangi Xodim Qo'shish</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tab Switcher: Admins vs Employees */}
      <div className="flex items-center p-1.5 bg-gray-100 dark:bg-slate-800/80 rounded-2xl border border-gray-200 dark:border-slate-700 w-fit">
        <button
          onClick={() => setActiveTab('admins')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'admins'
              ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-sm'
              : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>Administratorlar ({admins.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('employees')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'employees'
              ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-sm'
              : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Xodimlar — Barcha bo'limlar ({employees.length})</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center font-bold">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">Super Adminlar</span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{superAdminCount} ta</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center font-bold">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">HR Adminlar</span>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400">{hrAdminCount} ta</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">Jami Xodimlar</span>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{employees.length} nafar</div>
          </div>
        </div>
      </div>

      {/* --- TAB 1: ADMINS TABLE --- */}
      {activeTab === 'admins' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>Tizim Administratorlari Ro'yxati</span>
            </h2>
            <span className="text-xs text-gray-400 dark:text-slate-500 font-mono">
              MBBT: roles & users
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/40">
                  <th className="py-3.5 px-5">Administrator</th>
                  <th className="py-3.5 px-5">Login</th>
                  <th className="py-3.5 px-5">Roli (Huquqi)</th>
                  <th className="py-3.5 px-5">Qo'shilgan Sana</th>
                  <th className="py-3.5 px-5 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400 dark:text-slate-500">
                      Administratorlar yuklanmoqda...
                    </td>
                  </tr>
                ) : admins.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400 dark:text-slate-500">
                      Administratorlar topilmadi
                    </td>
                  </tr>
                ) : (
                  admins.map((adm) => {
                    const isSuper = adm.role === 'superadmin';
                    const isCurrent = adm.id === currentUser?.id;

                    return (
                      <tr key={adm.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${
                              isSuper
                                ? 'bg-gradient-to-tr from-purple-600 to-amber-500 text-white'
                                : 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white'
                            }`}>
                              {isSuper ? 'SA' : 'HR'}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                <span>{adm.full_name}</span>
                                {isCurrent && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                                    Siz
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-gray-400 dark:text-slate-500">
                                ID: #{adm.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          <span className="font-mono text-xs font-semibold text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                            @{adm.username}
                          </span>
                        </td>

                        <td className="py-4 px-5">
                          {isSuper ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                              <Crown className="w-3.5 h-3.5 text-amber-500" />
                              <span>Super Administrator</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                              <Shield className="w-3.5 h-3.5 text-indigo-500" />
                              <span>HR Administrator</span>
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-5 text-xs text-gray-500 dark:text-slate-400">
                          {adm.created_at ? new Date(adm.created_at).toLocaleDateString('uz-UZ') : '—'}
                        </td>

                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditAdmin(adm)}
                              className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl transition"
                              title="Login va parolni tahrirlash"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAdmin(adm)}
                              disabled={isCurrent}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition disabled:opacity-30 disabled:hover:bg-transparent"
                              title={isCurrent ? "O'z hisobingizni o'chira olmaysiz" : "Adminni o'chirish"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 2: EMPLOYEES TABLE --- */}
      {activeTab === 'employees' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden space-y-4">
          {/* Filters Bar */}
          <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search box */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ism yoki login bo'yicha qidirish..."
                  className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-white outline-none w-60"
                />
              </div>

              {/* Department filter */}
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-white outline-none font-semibold"
              >
                <option value="">Barcha bo'limlar</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-xs text-gray-400 dark:text-slate-500">
              Topildi: <b>{filteredEmployees.length}</b> nafar xodim
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/40">
                  <th className="py-3.5 px-5">Xodim</th>
                  <th className="py-3.5 px-5">Login (Username)</th>
                  <th className="py-3.5 px-5">Bo'limi</th>
                  <th className="py-3.5 px-5">Qo'shilgan Sana</th>
                  <th className="py-3.5 px-5 text-right">Login / Parolni Tahrirlash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400 dark:text-slate-500">
                      Xodimlar yuklanmoqda...
                    </td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400 dark:text-slate-500">
                      Xodimlar topilmadi
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shadow-sm">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white">
                              {emp.full_name}
                            </div>
                            <div className="text-[11px] text-gray-400 dark:text-slate-500">
                              ID: #{emp.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <span className="font-mono text-xs font-semibold text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                          @{emp.username}
                        </span>
                      </td>

                      <td className="py-4 px-5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{emp.department_name || "Biriktirilmagan"}</span>
                        </span>
                      </td>

                      <td className="py-4 px-5 text-xs text-gray-500 dark:text-slate-400">
                        {emp.created_at ? new Date(emp.created_at).toLocaleDateString('uz-UZ') : '—'}
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditEmployee(emp)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-xl transition"
                            title="Xodim login va parolini o'zgartirish"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Tahrirlash</span>
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(emp)}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition"
                            title="Xodimni o'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- MODAL 1: ADD / EDIT ADMIN --- */}
      {adminModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span>{editingAdmin ? "Administratorni Tahrirlash" : "Yangi Administrator Qo'shish"}</span>
              </h3>
              <button
                onClick={() => setAdminModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  To'liq Ism-Sharif *
                </label>
                <input
                  type="text"
                  required
                  value={adminFormData.full_name}
                  onChange={(e) => setAdminFormData({ ...adminFormData, full_name: e.target.value })}
                  placeholder="Masalan: Sardor Aliyev"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Login (Username) *
                </label>
                <input
                  type="text"
                  required
                  value={adminFormData.username}
                  onChange={(e) => setAdminFormData({ ...adminFormData, username: e.target.value })}
                  placeholder="admin_hr"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Parol {editingAdmin ? "(O'zgartirmaslik uchun bo'sh qoldiring)" : '*'}
                </label>
                <div className="relative">
                  <input
                    type={showAdminPassword ? "text" : "password"}
                    required={!editingAdmin}
                    value={adminFormData.password}
                    onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                    placeholder={editingAdmin ? "Yangi parol (ixtiyoriy)" : "Parolni kiriting"}
                    className="w-full pl-3.5 pr-11 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    title={showAdminPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300"
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Administrator Roli *
                </label>
                <select
                  value={adminFormData.role}
                  onChange={(e) => setAdminFormData({ ...adminFormData, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 font-semibold"
                >
                  <option value="admin">HR Administrator</option>
                  <option value="superadmin">Super Administrator (Bosh admin)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setAdminModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={adminSubmitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-purple-500/20 flex items-center gap-2 disabled:opacity-50 transition"
                >
                  <Save className="w-4 h-4" />
                  <span>{adminSubmitting ? 'Saqlanmoqda...' : 'Saqlash'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: ADD / EDIT EMPLOYEE (Superadmin Login & Password Management) --- */}
      {empModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>{editingEmployee ? "Xodim Login va Parolini Tahrirlash" : "Yangi Xodim Qo'shish"}</span>
              </h3>
              <button
                onClick={() => setEmpModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  To'liq Ism-Sharif *
                </label>
                <input
                  type="text"
                  required
                  value={empFormData.full_name}
                  onChange={(e) => setEmpFormData({ ...empFormData, full_name: e.target.value })}
                  placeholder="Aliyev Vali"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Login (Username) *
                </label>
                <input
                  type="text"
                  required
                  value={empFormData.username}
                  onChange={(e) => setEmpFormData({ ...empFormData, username: e.target.value })}
                  placeholder="vali_aliyev"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Parol {editingEmployee ? "(O'zgartirmaslik uchun bo'sh qoldiring)" : '*'}
                </label>
                <div className="relative">
                  <input
                    type={showEmpPassword ? "text" : "password"}
                    required={!editingEmployee}
                    value={empFormData.password}
                    onChange={(e) => setEmpFormData({ ...empFormData, password: e.target.value })}
                    placeholder={editingEmployee ? "Yangi parol (ixtiyoriy)" : "Parolni kiriting"}
                    className="w-full pl-3.5 pr-11 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmpPassword(!showEmpPassword)}
                    title={showEmpPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300"
                  >
                    {showEmpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Biriktirilgan Bo'lim *
                </label>
                <select
                  value={empFormData.department_id}
                  onChange={(e) => setEmpFormData({ ...empFormData, department_id: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-semibold"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setEmpModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={empSubmitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-50 transition"
                >
                  <Save className="w-4 h-4" />
                  <span>{empSubmitting ? 'Saqlanmoqda...' : 'Saqlash'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
