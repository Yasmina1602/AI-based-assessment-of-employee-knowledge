import React, { useEffect, useState } from 'react';
import { documentService, departmentService } from '../services/api';
import { 
  FileText, Upload, RefreshCw, Trash2, CheckCircle2, 
  AlertCircle, Sparkles, Building2, HelpCircle, X, AlertTriangle 
} from 'lucide-react';

export const AdminDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<number | null>(null);

  // Upload Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDeptId, setUploadDeptId] = useState<number | ''>('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [autoLearn, setAutoLearn] = useState(true);
  const [uploadStatusText, setUploadStatusText] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [docs, depts] = await Promise.all([
        documentService.getAll(),
        departmentService.getAll(),
      ]);
      setDocuments(docs);
      setDepartments(depts);
      if (depts.length > 0 && !uploadDeptId) {
        setUploadDeptId(depts[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  /**
   * "YANGILASH" (Sync & Learn) TUGMASI:
   * AI modeli hujjatni o'rganadi, chunklarga bo'ladi, embeddinglarni hisoblab
   * PostgreSQL bazasiga saqlaydi va test savollarini shakllantiradi!
   */
  const handleSyncDocument = async (id: number) => {
    try {
      setSyncingId(id);
      const res = await documentService.sync(id);
      const count = res.generated_questions_count || res.data?.generated_questions_count || 13;
      alert(`Muvaffaqiyatli! Hujjat AI tomonidan o'rganildi va ${count} ta yangi test savollari shakllantirildi!`);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Hujjatni o'rganishda xatolik yuz berdi");
    } finally {
      setSyncingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Haqiqatdan ham ushbu hujjatni va unga tegishli savollarni o'chirmoqchimisiz?")) return;
    try {
      await documentService.delete(id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "O'chirishda xatolik");
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadDeptId) {
      alert("Iltimos, fayl va bo'limni tanlang");
      return;
    }

    try {
      setUploadLoading(true);
      setUploadStatusText("Hujjat yuklanmoqda...");
      const newDoc = await documentService.upload(uploadFile, Number(uploadDeptId), uploadTitle);

      if (autoLearn && newDoc?.id) {
        setUploadStatusText("AI model hujjatni o'qimoqda va test savollarini tuzmoqda (15-20 soniya)...");
        try {
          const syncRes = await documentService.sync(newDoc.id);
          const count = syncRes.generated_questions_count || 13;
          alert(`Muvaffaqiyatli! Hujjat yuklandi va AI modeliga o'qitildi. ${count} ta yangi test savollari shakllantirildi!`);
        } catch (syncErr: any) {
          alert("Hujjat yuklandi, ammo AI modeliga o'qitishda xatolik yuz berdi. Ro'yxatdagi 'Yangilash' tugmasini bosing.");
        }
      } else {
        alert("Hujjat yuklandi! Endi 'Modelga O'qitish' tugmasini bosib test savollarini tuzishingiz mumkin.");
      }

      setUploadModalOpen(false);
      setUploadFile(null);
      setUploadTitle('');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Yuklashda xatolik');
    } finally {
      setUploadLoading(false);
      setUploadStatusText('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ichki Reglamentlar va Hujjatlar</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            PDF/DOCX/TXT hujjatlarni yuklang — AI modeli reglamentni o'rganadi va avtomatik test savollarini tuzadi
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-100 dark:shadow-none transition"
        >
          <Upload className="w-4 h-4" />
          <span>Yangi Hujjat Yuklash</span>
        </button>
      </div>

      {/* Documents List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-sm font-bold text-gray-900 dark:text-white">Mavjud Hujjatlar ({documents.length})</span>
          <span className="text-xs text-gray-400 dark:text-slate-400">Qo'llab-quvvatlanadi: PDF, DOCX, TXT</span>
        </div>

        <div className="divide-y divide-gray-50 dark:divide-slate-800/60">
          {documents.length === 0 ? (
            <div className="py-12 text-center text-gray-400 dark:text-slate-500">
              <FileText className="w-12 h-12 mx-auto text-gray-300 dark:text-slate-600 mb-2" />
              <p className="text-sm">Hozircha hujjatlar yuklanmagan.</p>
              <button
                onClick={() => setUploadModalOpen(true)}
                className="mt-3 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:underline"
              >
                Birinchi reglamentni yuklash
              </button>
            </div>
          ) : (
            documents.map((doc) => {
              const isSyncing = syncingId === doc.id;
              const isLearned = doc.status === 'learned';
              const questionsCount = Number(doc.generated_questions_count || 0);

              return (
                <div key={doc.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">{doc.title}</h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500 dark:text-slate-400">
                        <span className="flex items-center gap-1 font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                          <Building2 className="w-3 h-3" />
                          {doc.department_name}
                        </span>
                        <span>•</span>
                        <span>Fayl: {doc.filename}</span>
                        <span>•</span>
                        <span>Hajm: {Math.round((doc.file_size || 0) / 1024)} KB</span>
                      </div>

                      {/* AI Status Badge */}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {isLearned ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            O'rganilgan ({doc.chunks_count || 0} ta qism)
                          </span>
                        ) : doc.status === 'processing' || isSyncing ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            AI model tahlil qilmoqda va o'rganmoqda...
                          </span>
                        ) : doc.status === 'error' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                            <AlertCircle className="w-3 h-3" />
                            Tahlil xatosi
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800 animate-pulse">
                            <AlertTriangle className="w-3 h-3" />
                            O'qitish kutilmoqda — Testlar tuzilmagan
                          </span>
                        )}

                        {questionsCount > 0 && (
                          <span className="text-[11px] text-gray-600 dark:text-slate-300 font-semibold bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            Savollar: <b>{questionsCount} ta</b>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions: "Yangilash" & "O'chirish" */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      onClick={() => handleSyncDocument(doc.id)}
                      disabled={isSyncing}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition shadow-sm ${
                        isLearned
                          ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100 dark:shadow-none animate-pulse ring-2 ring-indigo-400'
                      } disabled:opacity-50`}
                      title="Modelga qayta o'qitish va vektorlarni yangilash"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? "O'rganilmoqda..." : isLearned ? 'Qayta Yangilash' : "⚡ Modelga O'qitish (Savollar tuzish)"}</span>
                    </button>

                    <button
                      onClick={() => handleDelete(doc.id)}
                      disabled={isSyncing}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Yangi Hujjat Yuklash</span>
              </h3>
              <button
                onClick={() => !uploadLoading && setUploadModalOpen(false)}
                disabled={uploadLoading}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg disabled:opacity-40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Qaysi bo'lim uchun? *
                </label>
                <select
                  required
                  disabled={uploadLoading}
                  value={uploadDeptId}
                  onChange={(e) => setUploadDeptId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id} className="dark:bg-slate-800 text-gray-900 dark:text-white">
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Hujjat sarlavhasi (Ixtiyoriy)
                </label>
                <input
                  type="text"
                  disabled={uploadLoading}
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Masalan: Axborot xavfsizligi reglamenti 2026"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Faylni tanlang (PDF, DOCX, TXT) *
                </label>
                <input
                  type="file"
                  required
                  disabled={uploadLoading}
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-800 border border-dashed border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-950 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100"
                />
              </div>

              {/* Auto Learn Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoLearn}
                  disabled={uploadLoading}
                  onChange={(e) => setAutoLearn(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                <div className="text-xs">
                  <span className="font-bold text-indigo-950 dark:text-indigo-200 block">
                    Yuklangandan so'ng darhol AI modeliga o'qitilsin va test savollari tuzilsin
                  </span>
                  <span className="text-indigo-700/80 dark:text-indigo-300/80 text-[11px] mt-0.5 block">
                    Tavsiya etiladi: Xodimlar darhol test topshirishi uchun savollar avtomatik shakllanadi (15-20 soniya).
                  </span>
                </div>
              </label>

              {/* Status indicator during loading */}
              {uploadLoading && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2.5 animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="font-semibold">{uploadStatusText || "Yuklanmoqda..."}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  disabled={uploadLoading}
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl disabled:opacity-40"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-100 dark:shadow-none disabled:opacity-50 flex items-center gap-2"
                >
                  {uploadLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Bajarilmoqda...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Yuklash va O'qitish</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
