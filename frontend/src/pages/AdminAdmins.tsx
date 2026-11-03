import React, { useEffect, useState } from 'react';
import { authService } from '../services/api';
import { 
  ShieldCheck, Shield, Users, UserPlus, Edit2, Trash2, 
  Crown, CheckCircle2, AlertCircle, X, Save, KeyRound 
} from 'lucide-react';

export const AdminAdmins: React.FC = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'admin',
  });

  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [adminsData, rolesData] = await Promise.all([
        authService.getAdmins(),
        authService.getRoles().catch(() => []),
      ]);
      setAdmins(adminsData);
      setRoles(rolesData);
    } catch (err: any) {
      console.error('Adminlarni yuklashda xatolik:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingAdmin(null);
    setFormData({
      username: '',
      password: '',
      full_name: '',
      role: 'admin',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (admin: any) => {
    setEditingAdmin(admin);
    setFormData({
      username: admin.username,
      password: '',
      full_name: admin.full_name,
      role: admin.role,
    });
    setModalOpen(true);
  };

  const handleDelete = async (admin: any) => {
    if (admin.id === currentUser?.id) {
      alert("O'z hisobingizni o'chira olmaysiz!");
      return;
    }

    if (!window.confirm(`Haqiqatdan ham "${admin.full_name}" (@${admin.username}) administratorini tizimdan o'chirmoqchimisiz?`)) {
      return;
    }

    try {
      await authService.deleteAdmin(admin.id);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "O'chirishda xatolik yuz berdi");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.full_name.trim()) {
      alert("Iltimos, barcha majburiy maydonlarni to'ldiring");
      return;
    }

    if (!editingAdmin && !formData.password.trim()) {
      alert("Yangi admin uchun parol kiritish shart");
      return;
    }

    try {
      setSubmitting(true);
      if (editingAdmin) {
        await authService.updateAdmin(editingAdmin.id, formData);
      } else {
        await authService.createAdmin(formData);
      }
      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Saqlashda xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
            <ShieldCheck className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <span>Administratorlar Boshqaruvi</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Faqat Superadmin huquqiga ega foydalanuvchilar yangi administrator tayinlashi va rollarni boshqarishi mumkin.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/20 transition transform active:scale-95 text-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>Yangi Admin Tayinlash</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Jami Adminlar</span>
            <div className="text-2xl font-black text-gray-900 dark:text-white">{admins.length} ta</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center font-bold">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Super Administratorlar</span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{superAdminCount} ta</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center font-bold">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">HR Administratorlar</span>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{hrAdminCount} ta</div>
          </div>
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>Tizim Administratorlari Ro'yxati</span>
          </h2>
          <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
            MBBT: roles & users
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-800 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/40">
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
                  <td colSpan={5} className="py-12 text-center text-gray-400 dark:text-gray-500">
                    <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-xs">Administratorlar ro'yxati yuklanmoqda...</p>
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 dark:text-gray-500">
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
                            <div className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                              <span>{adm.full_name}</span>
                              {isCurrent && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                                  Siz
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-gray-400 dark:text-gray-500">
                              ID: #{adm.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <span className="font-mono text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                          @{adm.username}
                        </span>
                      </td>

                      <td className="py-4 px-5">
                        {isSuper ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 font-extrabold text-xs border border-purple-200 dark:border-purple-800">
                            <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>Super Administrator</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800">
                            <Shield className="w-3.5 h-3.5 text-indigo-500" />
                            <span>HR Administrator</span>
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-5 text-xs text-gray-500 dark:text-gray-400">
                        {adm.created_at ? new Date(adm.created_at).toLocaleDateString('uz-UZ') : '-'}
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(adm)}
                            className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-xl transition"
                            title="Tahrirlash"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(adm)}
                            disabled={isCurrent}
                            className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/60 rounded-xl transition disabled:opacity-30 disabled:cursor-not-allowed"
                            title={isCurrent ? "O'z hisobingizni o'chira olmaysiz" : "O'chirish"}
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

      {/* Modal: Add or Edit Admin */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  {editingAdmin ? <Edit2 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {editingAdmin ? "Adminni Tahrirlash" : "Yangi Admin Tayinlash"}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Faqat Superadmin ruxsatiga ega
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Administrator F.I.Sh. *
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Masalan: Sardor Komilov"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Login (Username) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Masalan: admin_hr2"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Parol {editingAdmin ? "(O'zgartirish shart bo'lmasa, bo'sh qoldiring)" : '*'}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required={!editingAdmin}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingAdmin ? "Yangi parol (ixtiyoriy)" : "Parolni kiriting"}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                  />
                  <KeyRound className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Administrator Roli *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 font-semibold"
                >
                  <option value="admin">HR Administrator (Bo'limlar, savollar va xodimlarni boshqaradi)</option>
                  <option value="superadmin">Super Administrator (Barcha huquqlar va adminlarni boshqarish)</option>
                </select>
              </div>

              <div className="p-3 bg-purple-50/70 dark:bg-purple-950/40 rounded-xl text-xs text-purple-950 dark:text-purple-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Rol huquqlari:</span>
                </div>
                <p className="text-[11px] text-purple-800 dark:text-purple-300">
                  {formData.role === 'superadmin' 
                    ? "Superadmin tizimdagi barcha amallarni bajara oladi va boshqa administratorlarni qo'shish/o'chirish vakolatiga ega."
                    : "HR Admin bo'limlar, hujjatlar, savollar va xodimlarni boshqara oladi, lekin yangi admin tayinlay olmaydi."}
                </p>
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-purple-500/20 flex items-center gap-2 disabled:opacity-50 transition"
                >
                  <Save className="w-4 h-4" />
                  <span>{submitting ? 'Saqlanmoqda...' : 'Saqlash'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
