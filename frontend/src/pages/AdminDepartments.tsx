import React, { useEffect, useState } from 'react';
import { departmentService, authService } from '../services/api';
import { 
  Building2, Plus, Edit2, Trash2, Clock, 
  HelpCircle, CheckCircle2, UserPlus, Users, X, Save 
} from 'lucide-react';

export const AdminDepartments: React.FC = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit/Create Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    test_duration_minutes: 30,
    total_questions: 30,
    closed_questions_count: 25,
    open_questions_count: 5,
    passing_score: 60,
  });

  // Employee Management State
  const [manageEmpModalOpen, setManageEmpModalOpen] = useState(false);
  const [selectedDeptForEmployees, setSelectedDeptForEmployees] = useState<any>(null);
  const [deptEmployees, setDeptEmployees] = useState<any[]>([]);
  const [deptEmployeesLoading, setDeptEmployeesLoading] = useState(false);

  // Employee Register / Edit Modal State
  const [empModalOpen, setEmpModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);
  const [empFormData, setEmpFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    level: 'Middle',
  });

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const res = await departmentService.getAll();
      setDepartments(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingDept(null);
    setFormData({
      name: '',
      description: '',
      test_duration_minutes: 30,
      total_questions: 30,
      closed_questions_count: 25,
      open_questions_count: 5,
      passing_score: 60,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (dept: any) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      description: dept.description || '',
      test_duration_minutes: dept.test_duration_minutes || 30,
      total_questions: dept.total_questions || 30,
      closed_questions_count: dept.closed_questions_count || 25,
      open_questions_count: dept.open_questions_count || 5,
      passing_score: dept.passing_score || 60,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await departmentService.update(editingDept.id, formData);
      } else {
        await departmentService.create(formData);
      }
      setModalOpen(false);
      loadDepartments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Haqiqatdan ham ushbu bo'limni o'chirmoqchimisiz?")) return;
    try {
      await departmentService.delete(id);
      loadDepartments();
    } catch (err: any) {
      alert(err.response?.data?.message || "O'chirishda xatolik");
    }
  };

  const handleOpenManageEmployees = async (dept: any) => {
    setSelectedDeptForEmployees(dept);
    setManageEmpModalOpen(true);
    await loadDeptEmployees(dept.id);
  };

  const loadDeptEmployees = async (deptId: number) => {
    try {
      setDeptEmployeesLoading(true);
      const res = await authService.getDepartmentEmployees(deptId);
      setDeptEmployees(Array.isArray(res) ? res : []);
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.message || "Xodimlarni yuklashda xatolik yuz berdi. Backend ishlab turganini tekshiring.");
    } finally {
      setDeptEmployeesLoading(false);
    }
  };

  const handleOpenAddEmployee = (deptId: number) => {
    setEditingEmployee(null);
    setSelectedDeptId(deptId);
    setEmpFormData({
      username: '',
      password: '',
      full_name: '',
      level: 'Middle',
    });
    setEmpModalOpen(true);
  };

  const handleOpenEditEmployee = (emp: any) => {
    setEditingEmployee(emp);
    setSelectedDeptId(emp.department_id);
    setEmpFormData({
      username: emp.username,
      password: '',
      full_name: emp.full_name,
      level: emp.level || 'Middle',
    });
    setEmpModalOpen(true);
  };

  const handleDeleteEmployee = async (userId: number) => {
    if (!window.confirm("Haqiqatdan ham ushbu xodimni o'chirmoqchimisiz?")) return;
    try {
      await authService.deleteUser(userId);
      if (selectedDeptForEmployees) {
        await loadDeptEmployees(selectedDeptForEmployees.id);
      }
      loadDepartments();
    } catch (err: any) {
      alert(err.response?.data?.message || "O'chirishda xatolik yuz berdi");
    }
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeptId) return;
    try {
      if (editingEmployee) {
        // Tahrirlash (MBBT ga saqlash)
        await authService.updateUser(editingEmployee.id, {
          ...empFormData,
          department_id: selectedDeptId,
        });
        alert("Xodim ma'lumotlari muvaffaqiyatli yangilandi!");
      } else {
        // Yangi xodim (MBBT ga qo'shish)
        await authService.registerEmployee({
          ...empFormData,
          department_id: selectedDeptId,
        });
        alert("Xodim muvaffaqiyatli ro'yxatdan o'tkazildi!");
      }
      setEmpModalOpen(false);
      if (selectedDeptForEmployees) {
        await loadDeptEmployees(selectedDeptForEmployees.id);
      }
      loadDepartments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bo'limlar va Test Sozlamalari</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Har bir bo'lim uchun test savollari soni, turi va vaqtini sozlang
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-100 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Bo'lim Qo'shish</span>
        </button>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <div
            key={dept.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{dept.name}</h3>
                    <span className="text-xs text-gray-400">ID: #{dept.id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(dept)}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                    title="Tahrirlash"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(dept.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-600 mt-3 line-clamp-2">
                {dept.description || 'Izoh berilmagan'}
              </p>

              {/* Test Configuration Badges */}
              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-gray-400 block mb-0.5">Test Vaqti:</span>
                  <div className="font-bold text-gray-800 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{dept.test_duration_minutes || 30} daqiqa</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-gray-400 block mb-0.5">Jami Savollar:</span>
                  <div className="font-bold text-gray-800 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{dept.total_questions || 30} ta</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-gray-400 block mb-0.5">Yopiq / Ochiq:</span>
                  <div className="font-bold text-gray-800">
                    {dept.closed_questions_count || 25} yopiq + {dept.open_questions_count || 5} ochiq
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-gray-400 block mb-0.5">O'tish Bali:</span>
                  <div className="font-bold text-gray-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>{dept.passing_score || 60}%</span>
                  </div>
                </div>
              </div>

              {/* Status info */}
              <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500">
                <span>Hujjatlar: <b>{dept.documents_count || 0} ta</b></span>
                <span>Savollar banki: <b>{dept.approved_questions_count || 0} ta</b></span>
                <span>Xodimlar: <b>{dept.employees_count || 0} nafar</b></span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center gap-2">
              <button
                onClick={() => handleOpenManageEmployees(dept)}
                className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
                title="Bo'lim xodimlari ro'yxatini ko'rish va tahrirlash"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Xodimlar ({dept.employees_count || 0})</span>
              </button>
              <button
                onClick={() => handleOpenAddEmployee(dept.id)}
                className="py-2 px-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
                title="Ushbu bo'limga yangi xodim qo'shish"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Qo'shish</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create/Edit Department */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">
                {editingDept ? "Bo'limni tahrirlash" : "Yangi bo'lim yaratish"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Bo'lim nomi *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masalan: Buxgalteriya hisobi"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Bo'lim tavsifi
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Vazifalari va yo'nalishi haqida qisqacha..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Test vaqti (daqiqa)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    required
                    value={formData.test_duration_minutes}
                    onChange={(e) => setFormData({ ...formData, test_duration_minutes: parseInt(e.target.value, 10) })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    O'tish bali (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={formData.passing_score}
                    onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value, 10) })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Yopiq savollar soni
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={formData.closed_questions_count}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setFormData({ 
                        ...formData, 
                        closed_questions_count: val,
                        total_questions: val + formData.open_questions_count
                      });
                    }}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Ochiq savollar soni
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    required
                    value={formData.open_questions_count}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setFormData({ 
                        ...formData, 
                        open_questions_count: val,
                        total_questions: formData.closed_questions_count + val
                      });
                    }}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-indigo-50/70 rounded-xl text-xs text-indigo-900 font-medium">
                Jami test savollari soni: <b>{formData.closed_questions_count + formData.open_questions_count} ta</b>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-100 flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Saqlash</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Manage Department Employees */}
      {manageEmpModalOpen && selectedDeptForEmployees && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>{selectedDeptForEmployees.name} — Xodimlari</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Bo'limga biriktirilgan xodimlar ro'yxati va ularni tahrirlash (MBBT)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenAddEmployee(selectedDeptForEmployees.id)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Yangi xodim</span>
                </button>
                <button
                  onClick={() => setManageEmpModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {deptEmployeesLoading ? (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-xs text-gray-400 mt-2">Xodimlar yuklanmoqda...</p>
              </div>
            ) : deptEmployees.length === 0 ? (
              <div className="py-12 text-center text-gray-400 dark:text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Ushbu bo'limda hozircha xodimlar mavjud emas.</p>
                <button
                  onClick={() => handleOpenAddEmployee(selectedDeptForEmployees.id)}
                  className="mt-3 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 rounded-xl text-xs font-semibold"
                >
                  Birinchi xodimni qo'shish
                </button>
              </div>
            ) : (
              <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1">
                {deptEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {emp.full_name?.slice(0, 2).toUpperCase() || 'XO'}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          <span>{emp.full_name}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                            {emp.level || 'Middle'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-0.5">
                          Login: <span className="text-gray-600 dark:text-gray-300 font-semibold">{emp.username}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenEditEmployee(emp)}
                        className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-xl transition"
                        title="Tahrirlash (MBBT)"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(emp.id)}
                        className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/60 rounded-xl transition"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Add or Edit Employee */}
      {empModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {editingEmployee ? "Xodim Ma'lumotlarini Tahrirlash" : "Yangi Xodim Ro'yxatdan O'tkazish"}
              </h3>
              <button
                onClick={() => setEmpModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Xodim F.I.Sh. *
                </label>
                <input
                  type="text"
                  required
                  value={empFormData.full_name}
                  onChange={(e) => setEmpFormData({ ...empFormData, full_name: e.target.value })}
                  placeholder="Aliyev Vali"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Login (Username) *
                </label>
                <input
                  type="text"
                  required
                  value={empFormData.username}
                  onChange={(e) => setEmpFormData({ ...empFormData, username: e.target.value })}
                  placeholder="vali_aliyev"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {editingEmployee ? "Yangi Parol (Ixtiyoriy)" : "Parol *"}
                </label>
                <input
                  type="password"
                  required={!editingEmployee}
                  value={empFormData.password}
                  onChange={(e) => setEmpFormData({ ...empFormData, password: e.target.value })}
                  placeholder={editingEmployee ? "O'zgartirmaslik uchun bo'sh qoldiring" : "••••••••"}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Bo'lim *
                </label>
                <select
                  value={selectedDeptId || ''}
                  onChange={(e) => setSelectedDeptId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Daraja (Level)
                </label>
                <select
                  value={empFormData.level}
                  onChange={(e) => setEmpFormData({ ...empFormData, level: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none"
                >
                  <option value="Junior">Junior</option>
                  <option value="Middle">Middle</option>
                  <option value="Senior">Senior</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEmpModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-100 flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingEmployee ? "O'zgarishlarni Saqlash" : "Ro'yxatdan O'tkazish"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
