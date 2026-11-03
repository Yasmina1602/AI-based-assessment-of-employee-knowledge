import React, { useEffect, useState } from 'react';
import { resultService, testSessionService, departmentService } from '../services/api';
import { 
  BarChart3, CheckCircle2, XCircle, AlertTriangle, 
  ArrowLeft, BrainCircuit, ShieldAlert, Award, Star, Filter 
} from 'lucide-react';

interface AdminResultsProps {
  initialSessionId?: number | null;
}

export const AdminResults: React.FC<AdminResultsProps> = ({ initialSessionId }) => {
  const [results, setResults] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedPass, setSelectedPass] = useState<string>('');

  // Detailed Modal/View
  const [activeSessionId, setActiveSessionId] = useState<number | null>(initialSessionId || null);
  const [sessionDetail, setSessionDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    loadResults();
  }, [selectedDept, selectedPass]);

  useEffect(() => {
    if (activeSessionId) {
      loadSessionDetail(activeSessionId);
    }
  }, [activeSessionId]);

  const loadDepartments = async () => {
    try {
      const depts = await departmentService.getAll();
      setDepartments(depts);
    } catch (e) {
      console.error(e);
    }
  };

  const loadResults = async () => {
    try {
      setLoading(true);
      const res = await resultService.getAll({
        department_id: selectedDept ? Number(selectedDept) : undefined,
        is_passed: selectedPass !== '' ? selectedPass === 'true' : undefined,
      });
      setResults(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadSessionDetail = async (id: number) => {
    try {
      setDetailLoading(true);
      const res = await testSessionService.getResults(id);
      setSessionDetail(res);
    } catch (e) {
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  };

  // Detailed Result View
  if (activeSessionId && sessionDetail) {
    const { session, details } = sessionDetail;

    return (
      <div className="space-y-6">
        <button
          onClick={() => {
            setActiveSessionId(null);
            setSessionDetail(null);
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold rounded-xl shadow-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Barcha natijalarga qaytish</span>
        </button>

        {/* Overview Banner */}
        <div className={`p-6 sm:p-8 rounded-3xl text-white shadow-xl ${
          session.is_passed 
            ? 'bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900' 
            : 'bg-gradient-to-br from-rose-600 via-red-700 to-rose-900'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md">
                  {session.department_name}
                </span>
                {session.cheat_warnings_count > 0 && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-400 text-gray-900 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> {session.cheat_warnings_count} marta qoidabuzarlik
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">{session.employee_name}</h1>
              <p className="text-white/80 text-sm mt-1">
                Topshirilgan vaqt: {new Date(session.completed_at || session.started_at).toLocaleString('uz-UZ')}
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 self-start md:self-auto">
              <div className="text-right">
                <span className="text-xs text-white/70 block">Umumiy Ball</span>
                <span className="text-3xl font-black">{session.percentage}%</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white text-gray-900 flex items-center justify-center font-bold">
                {session.is_passed ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                ) : (
                  <XCircle className="w-8 h-8 text-rose-600" />
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/20 text-xs">
            <div>
              <span className="text-white/60 block">Yopiq savollar:</span>
              <span className="text-base font-bold">{session.closed_score} ta to'g'ri</span>
            </div>
            <div>
              <span className="text-white/60 block">Ochiq savollar (AI):</span>
              <span className="text-base font-bold">{session.open_score} ball</span>
            </div>
            <div>
              <span className="text-white/60 block">O'tish chegarasi:</span>
              <span className="text-base font-bold">{session.passing_score}%</span>
            </div>
            <div>
              <span className="text-white/60 block">Qaror:</span>
              <span className="text-base font-bold uppercase">{session.is_passed ? "Muvaffaqiyatli o'tdi" : "O'ta olmadi"}</span>
            </div>
          </div>
        </div>

        {/* Detailed Question Answers */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Har bir savol bo'yicha batafsil baholash</h2>

          {details.map((item: any) => {
            const isClosed = item.question_type === 'closed';
            const aiEval = item.ai_evaluation;

            return (
              <div key={item.order} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                      {item.order}-savol • {isClosed ? 'Yopiq savol' : 'Ochiq savol'}
                    </span>
                    <h3 className="text-base font-bold text-gray-900">{item.question_text}</h3>
                  </div>

                  <div className="shrink-0">
                    {isClosed ? (
                      item.is_correct ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 1 ball (To'g'ri)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
                          <XCircle className="w-3.5 h-3.5" /> 0 ball (Noto'g'ri)
                        </span>
                      )
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        <Star className="w-3.5 h-3.5 fill-purple-700" /> {item.score} / 5 ball
                      </span>
                    )}
                  </div>
                </div>

                {/* Closed Question Options */}
                {isClosed && Array.isArray(item.options) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {item.options.map((opt: any) => {
                      const isSelected = opt.id === item.selected_option_id;
                      const isCorrect = opt.is_correct;

                      let style = 'bg-gray-50 border-gray-100 text-gray-600';
                      if (isCorrect) style = 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold';
                      if (isSelected && !isCorrect) style = 'bg-red-50 border-red-300 text-red-900 font-semibold';

                      return (
                        <div key={opt.id} className={`p-3 rounded-xl border flex items-center justify-between ${style}`}>
                          <span>{opt.option_text}</span>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            {isSelected && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-800 font-bold">
                                Xodim tanlagan
                              </span>
                            )}
                            {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Open Question Employee Answer & AI Evaluation */}
                {!isClosed && (
                  <div className="space-y-3">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                      <span className="font-bold text-gray-700 block mb-1">Xodimning javobi:</span>
                      <p className="text-gray-900 whitespace-pre-wrap">{item.answer_text || "Bo'sh qoldirilgan"}</p>
                    </div>

                    {aiEval && (
                      <div className="bg-purple-50/70 p-4 rounded-xl border border-purple-200 text-xs text-purple-950 space-y-2">
                        <div className="flex items-center gap-1.5 font-bold text-purple-900 dark:text-purple-300 text-sm">
                          <BrainCircuit className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span>AI Tahlili va Izohlari (Ball: {aiEval.score} / 5)</span>
                        </div>

                        {aiEval.explanation && (
                          <p className="italic text-purple-900 dark:text-purple-200">{aiEval.explanation}</p>
                        )}

                        {Array.isArray(aiEval.strengths) && aiEval.strengths.length > 0 && (
                          <div>
                            <span className="font-bold text-emerald-800 dark:text-emerald-300 block">Kuchli jihatlari:</span>
                            <ul className="list-disc list-inside text-emerald-900 dark:text-emerald-200 space-y-0.5">
                              {aiEval.strengths.map((s: string, i: number) => (
                                <li key={i}>{s}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {Array.isArray(aiEval.weaknesses) && aiEval.weaknesses.length > 0 && (
                          <div>
                            <span className="font-bold text-rose-800 dark:text-rose-300 block">Kamchiliklar / Xatoliklar:</span>
                            <ul className="list-disc list-inside text-rose-900 dark:text-rose-200 space-y-0.5">
                              {aiEval.weaknesses.map((w: string, i: number) => (
                                <li key={i}>{w}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Results Table View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Barcha Test Natijalari</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Xodimlar topshirgan testlar va AI tomonidan berilgan baholar ro'yxati
        </p>
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
          value={selectedPass}
          onChange={(e) => setSelectedPass(e.target.value)}
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none"
        >
          <option value="">Barcha Natijalar</option>
          <option value="true">O'tganlar</option>
          <option value="false">O'ta olmaganlar</option>
        </select>

        <span className="ml-auto text-xs font-semibold text-gray-500">
          Jami: {results.length} ta natija
        </span>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-3 px-5">Xodim</th>
                <th className="py-3 px-5">Bo'lim</th>
                <th className="py-3 px-5">Natija (%)</th>
                <th className="py-3 px-5">Yopiq / Ochiq ball</th>
                <th className="py-3 px-5">Qaror</th>
                <th className="py-3 px-5">Vaqt</th>
                <th className="py-3 px-5 text-right">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    Natijalar mavjud emas
                  </td>
                </tr>
              ) : (
                results.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-5 font-bold text-gray-900">
                      {r.employee_name || r.username}
                    </td>
                    <td className="py-4 px-5 text-gray-600">{r.department_name}</td>
                    <td className="py-4 px-5">
                      <span className="text-base font-extrabold text-gray-900">{r.percentage}%</span>
                    </td>
                    <td className="py-4 px-5 text-xs text-gray-500">
                      {r.closed_score} yopiq + {r.open_score} ochiq
                    </td>
                    <td className="py-4 px-5">
                      {r.is_passed ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> O'tdi
                        </span>
                      ) : r.status === 'cancelled_cheat' ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-700 font-bold border border-red-200">
                          <AlertTriangle className="w-3.5 h-3.5" /> Anti-cheat bekor
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
                          O'ta olmadi
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-xs text-gray-400">
                      {new Date(r.completed_at || r.started_at).toLocaleDateString('uz-UZ')}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => setActiveSessionId(r.id)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition"
                      >
                        Batafsil tahlil
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

