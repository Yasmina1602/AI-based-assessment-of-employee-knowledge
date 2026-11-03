import React, { useEffect, useState } from 'react';
import { questionService, departmentService } from '../services/api';
import { 
  HelpCircle, CheckCircle2, XCircle, Plus, 
  Trash2, Building2, FileText, Filter, Check, X 
} from 'lucide-react';

export const AdminQuestions: React.FC = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Modal: Add question
  const [modalOpen, setModalOpen] = useState(false);
  const [formDeptId, setFormDeptId] = useState<number | ''>('');
  const [formText, setFormText] = useState('');
  const [formType, setFormType] = useState<'closed' | 'open'>('closed');
  const [formLevel, setFormLevel] = useState('Middle');
  const [formCriteria, setFormCriteria] = useState('');
  const [formSampleAnswer, setFormSampleAnswer] = useState('');
  const [formOptions, setFormOptions] = useState([
    { text: '', is_correct: true },
    { text: '', is_correct: false },
    { text: '', is_correct: false },
    { text: '', is_correct: false },
  ]);

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [selectedDept, selectedType, selectedStatus]);

  const loadDepartments = async () => {
    try {
      const depts = await departmentService.getAll();
      setDepartments(depts);
      if (depts.length > 0 && !formDeptId) {
        setFormDeptId(depts[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const res = await questionService.getAll({
        department_id: selectedDept ? Number(selectedDept) : undefined,
        question_type: selectedType || undefined,
        status: selectedStatus || undefined,
      });
      setQuestions(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await questionService.approve(id);
      loadQuestions();
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await questionService.reject(id);
      loadQuestions();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Haqiqatdan ham ushbu savolni o'chirmoqchimisiz?")) return;
    try {
      await questionService.delete(id);
      loadQuestions();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDeptId) return;

    try {
      await questionService.create({
        department_id: Number(formDeptId),
        question_text: formText,
        question_type: formType,
        level: formLevel,
        evaluation_criteria: formType === 'open' ? formCriteria : undefined,
        sample_answer: formType === 'open' ? formSampleAnswer : undefined,
        options: formType === 'closed' ? formOptions : undefined,
      });

      setModalOpen(false);
      setFormText('');
      setFormCriteria('');
      setFormSampleAnswer('');
      loadQuestions();
      alert('Savol muvaffaqiyatli saqlandi!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Saqlashda xatolik');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Savollar Banki</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Ichki hujjatlar asosida generatsiya qilingan yoki qo'lda qo'shilgan test savollari
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-100 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Savol Qo'shish</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          <Filter className="w-4 h-4" />
          <span>Filtr:</span>
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none"
        >
          <option value="">Barcha Bo'limlar</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none"
        >
          <option value="">Barcha Turlar</option>
          <option value="closed">Yopiq (Variantli)</option>
          <option value="open">Ochiq (Matnli)</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none"
        >
          <option value="">Barcha Holatlar</option>
          <option value="approved">Tasdiqlangan</option>
          <option value="draft">Kutilmoqda (Draft)</option>
          <option value="rejected">Rad etilgan</option>
        </select>

        <span className="ml-auto text-xs font-semibold text-gray-500">
          Jami: {questions.length} ta savol
        </span>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="bg-white p-12 text-center text-gray-400 rounded-2xl border border-gray-100">
            <HelpCircle className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="text-sm">Tanlangan mezonlar bo'yicha savollar topilmadi.</p>
          </div>
        ) : (
          questions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {q.department_name}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                      q.question_type === 'closed' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                    }`}>
                      {q.question_type === 'closed' ? 'Yopiq savol' : 'Ochiq savol'}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700">
                      {q.level || 'Middle'}
                    </span>
                    {q.document_title && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <FileText className="w-3 h-3" /> {q.document_title}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 leading-relaxed">
                    {q.question_text}
                  </h3>

                  {/* Options for closed questions */}
                  {q.question_type === 'closed' && Array.isArray(q.options) && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt: any, oIdx: number) => (
                        <div
                          key={opt.id || oIdx}
                          className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                            opt.is_correct
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold'
                              : 'bg-gray-50 border-gray-100 text-gray-600'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                            opt.is_correct ? 'bg-emerald-600 text-white font-bold' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span>{opt.option_text}</span>
                          {opt.is_correct && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Criteria for open questions */}
                  {q.question_type === 'open' && (
                    <div className="mt-3 p-3 bg-purple-50/50 rounded-xl border border-purple-100 text-xs text-purple-900 space-y-1">
                      <div>
                        <b>Baholash mezoni:</b> {q.evaluation_criteria || "Savolga to'liq reglament bo'yicha javob berilishi kerak."}
                      </div>
                      {q.sample_answer && (
                        <div>
                          <b>Namunaviy to'g'ri javob:</b> {q.sample_answer}
                        </div>
                      )}
                    </div>
                  )}

                  {q.explanation && (
                    <div className="mt-2 text-xs text-gray-400 italic">
                      Izoh: {q.explanation}
                    </div>
                  )}
                </div>

                {/* Status & Action Buttons */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex items-center gap-1.5">
                    {q.status === 'approved' ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Tasdiqlangan
                      </span>
                    ) : q.status === 'rejected' ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                        Rad etilgan
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        Kutilmoqda
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {q.status !== 'approved' && (
                      <button
                        onClick={() => handleApprove(q.id)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                        title="Tasdiqlash"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    {q.status !== 'rejected' && (
                      <button
                        onClick={() => handleReject(q.id)}
                        className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                        title="Rad etish"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Add Question */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Yangi Savol Qo'shish</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Bo'lim *
                  </label>
                  <select
                    required
                    value={formDeptId}
                    onChange={(e) => setFormDeptId(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Savol turi *
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                  >
                    <option value="closed">Yopiq (4 ta variantli)</option>
                    <option value="open">Ochiq (Matnli javob)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Savol matni *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  placeholder="Savolni kiriting..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                />
              </div>

              {formType === 'closed' ? (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700">
                    Javob variantlari (To'g'ri variantni belgilang) *
                  </label>
                  {formOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctOption"
                        checked={opt.is_correct}
                        onChange={() => {
                          const updated = formOptions.map((o, i) => ({
                            ...o,
                            is_correct: i === idx,
                          }));
                          setFormOptions(updated);
                        }}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        required
                        value={opt.text}
                        onChange={(e) => {
                          const updated = [...formOptions];
                          updated[idx].text = e.target.value;
                          setFormOptions(updated);
                        }}
                        placeholder={`Variant ${String.fromCharCode(65 + idx)}`}
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Baholash mezoni (AI uchun)
                    </label>
                    <textarea
                      rows={2}
                      value={formCriteria}
                      onChange={(e) => setFormCriteria(e.target.value)}
                      placeholder="1-5 ball uchun talablar..."
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Namunaviy to'g'ri javob
                    </label>
                    <textarea
                      rows={2}
                      value={formSampleAnswer}
                      onChange={(e) => setFormSampleAnswer(e.target.value)}
                      placeholder="Ideal javob matni..."
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                    />
                  </div>
                </div>
              )}

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
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-100"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
