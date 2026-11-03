import React, { useEffect, useState } from 'react';
import { resultService, testSessionService, departmentService } from '../services/api';
import { 
  BarChart3, CheckCircle2, XCircle, AlertTriangle, 
  ArrowLeft, BrainCircuit, ShieldAlert, Award, Star, Filter, 
  Trophy, Medal, Users 
} from 'lucide-react';

interface AdminResultsProps {
  initialSessionId?: number | null;
}

export const AdminResults: React.FC<AdminResultsProps> = ({ initialSessionId }) => {
  const [currentSubTab, setCurrentSubTab] = useState<'sessions' | 'leaderboard'>('sessions');
  const [results, setResults] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
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
    if (currentSubTab === 'sessions') {
      loadResults();
    } else {
      loadLeaderboard();
    }
  }, [currentSubTab, selectedDept, selectedPass]);

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

  const loadLeaderboard = async () => {
    try {
      setLeaderboardLoading(true);
      const res = await resultService.getLeaderboard(
        selectedDept ? Number(selectedDept) : undefined
      );
      setLeaderboard(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLeaderboardLoading(false);
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

  const getCheatEventLabel = (type: string) => {
    switch (type) {
      case 'tab_hidden':
        return { title: "Boshqa tabga o'tish", desc: "Foydalanuvchi brauzerda boshqa sahifa yoki tabga o'tdi" };
      case 'window_blur':
        return { title: "Oynadan tashqariga chiqish", desc: "Foydalanuvchi ekrandagi boshqa dasturga o'tdi" };
      case 'copy_attempt':
        return { title: "Nusxalash urinishi (Ctrl+C / Copy)", desc: "Savol yoki matnni nusxalashga harakat qilindi" };
      case 'paste_attempt':
        return { title: "Joylash urinishi (Ctrl+V / Paste)", desc: "Tashqi matnni javob maydoniga joylashga urinish" };
      case 'devtools_key':
        return { title: "Dasturchi uskunalarini ochish (F12 / DevTools)", desc: "Konsol yoki kod ko'rish oynasini ochish urinishi" };
      case 'fullscreen_exit':
        return { title: "Ekran rejimidan chiqish", desc: "To'liq ekran holatidan chiqildi" };
      default:
        return { title: "Qoidabuzarlik urinishi", desc: type };
    }
  };

  // Detailed Result View
  if (activeSessionId && sessionDetail) {
    const { session, details, anti_cheat_logs } = sessionDetail;

    return (
      <div className="space-y-6">
        <button
          onClick={() => {
            setActiveSessionId(null);
            setSessionDetail(null);
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 text-sm font-semibold rounded-xl shadow-sm transition"
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
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-400 text-gray-900 flex items-center gap-1 shadow-sm">
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
              <span className="text-white/60 block">Ochiq savollar:</span>
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

        {/* Anti-Cheat Violations Card (If any violation was recorded) */}
        {((session.cheat_warnings_count > 0) || (anti_cheat_logs && anti_cheat_logs.length > 0)) && (
          <div className="bg-rose-50/80 dark:bg-rose-950/40 p-5 rounded-3xl border-2 border-rose-200 dark:border-rose-900/60 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-900 dark:text-rose-200 font-bold text-sm">
                <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <span>Anti-Cheat Nazorati: Qoidabuzarliklar Qaydnomasi</span>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-200">
                {anti_cheat_logs?.length || session.cheat_warnings_count || 0} ta ogohlantirish
              </span>
            </div>

            {session.status === 'cancelled_cheat' && (
              <div className="p-3 bg-red-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Diqqat: Xodim 3 marta qoidabuzarlik sodir etgani sababli test majburiy bekor qilingan!</span>
              </div>
            )}

            <div className="space-y-2 mt-2">
              {Array.isArray(anti_cheat_logs) && anti_cheat_logs.length > 0 ? (
                anti_cheat_logs.map((log: any, idx: number) => {
                  const info = getCheatEventLabel(log.event_type);
                  return (
                    <div key={log.id || idx} className="bg-white/90 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-rose-100 dark:border-rose-900/40 flex items-start justify-between gap-3 text-xs">
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-rose-900 dark:text-rose-200">{info.title}</div>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{info.desc}</div>
                        </div>
                      </div>
                      <div className="text-[11px] text-gray-400 dark:text-gray-400 font-mono shrink-0">
                        {log.created_at ? new Date(log.created_at).toLocaleTimeString('uz-UZ') : ''}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-rose-800 dark:text-rose-300">
                  {session.cheat_warnings_count} marta boshqa oynaga chalg'ish yoki ruxsatsiz amal qayd etilgan.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Detailed Question Answers */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Savollar tahlili va natijalar</h2>

          {details.map((item: any) => {
            const isClosed = item.question_type === 'closed';
            const aiEval = item.ai_evaluation;

            return (
              <div key={item.order} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">
                      {item.order}-savol • {isClosed ? 'Yopiq savol' : 'Ochiq savol'}
                    </span>
                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">{item.question_text}</h3>
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

                      let style = 'bg-gray-50 dark:bg-slate-800/80 border-gray-100 dark:border-slate-700 text-gray-600 dark:text-slate-300';
                      if (isCorrect) style = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-semibold';
                      if (isSelected && !isCorrect) style = 'bg-red-50 dark:bg-red-950/60 border-red-300 dark:border-red-700 text-red-900 dark:text-red-200 font-semibold';

                      return (
                        <div key={opt.id} className={`p-3 rounded-xl border flex items-center justify-between ${style}`}>
                          <span>{opt.option_text}</span>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            {isSelected && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 font-bold">
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
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs">
                      <span className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Xodimning javobi:</span>
                      <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{item.answer_text || "Bo'sh qoldirilgan"}</p>
                    </div>

                    {aiEval && (
                      <div className="bg-purple-50/70 dark:bg-purple-950/30 p-4 rounded-xl border border-purple-200 dark:border-purple-800/40 text-xs text-purple-950 dark:text-purple-200 space-y-2">
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

  // Results & Leaderboard Table View
  return (
    <div className="space-y-6">
      {/* Header & Sub-Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {currentSubTab === 'sessions' ? 'Barcha Test Natijalari' : '🏆 Xodimlar Reytingi (Leaderboard)'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {currentSubTab === 'sessions' 
              ? "Xodimlar topshirgan testlar va AI tomonidan berilgan baholar ro'yxati" 
              : "Xodimlarning bilim darajasi, o'rtacha balli va reyting ko'rsatkichlari"}
          </p>
        </div>

        {/* Tab Toggle Buttons */}
        <div className="flex items-center p-1 bg-gray-100 dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700/80 self-start sm:self-auto">
          <button
            onClick={() => setCurrentSubTab('sessions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              currentSubTab === 'sessions'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Test Sessiyalari</span>
          </button>
          <button
            onClick={() => setCurrentSubTab('leaderboard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              currentSubTab === 'leaderboard'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Xodimlar Reytingi</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          <Filter className="w-4 h-4" />
          <span>Bo'lim bo'yicha:</span>
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="px-3.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none text-gray-900 dark:text-gray-100"
        >
          <option value="">Barcha Bo'limlar</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        {currentSubTab === 'sessions' && (
          <select
            value={selectedPass}
            onChange={(e) => setSelectedPass(e.target.value)}
            className="px-3.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none text-gray-900 dark:text-gray-100"
          >
            <option value="">Barcha Natijalar</option>
            <option value="true">O'tganlar</option>
            <option value="false">O'ta olmaganlar</option>
          </select>
        )}

        <span className="ml-auto text-xs font-semibold text-gray-500 dark:text-gray-400">
          {currentSubTab === 'sessions' ? `Jami: ${results.length} ta natija` : `Jami: ${leaderboard.length} nafar xodim`}
        </span>
      </div>

      {/* TAB 1: SESSIONS TABLE */}
      {currentSubTab === 'sessions' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/40">
                  <th className="py-3 px-5">Xodim</th>
                  <th className="py-3 px-5">Bo'lim</th>
                  <th className="py-3 px-5">Natija (%)</th>
                  <th className="py-3 px-5">Yopiq / Ochiq ball</th>
                  <th className="py-3 px-5">Qaror</th>
                  <th className="py-3 px-5">Vaqt</th>
                  <th className="py-3 px-5 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800/60">
                {results.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      Natijalar mavjud emas
                    </td>
                  </tr>
                ) : (
                  results.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-4 px-5 font-bold text-gray-900 dark:text-gray-100">
                        {r.employee_name || r.username}
                      </td>
                      <td className="py-4 px-5 text-gray-600 dark:text-gray-300">{r.department_name}</td>
                      <td className="py-4 px-5">
                        <span className="text-base font-extrabold text-gray-900 dark:text-gray-100">{r.percentage}%</span>
                      </td>
                      <td className="py-4 px-5 text-xs text-gray-500 dark:text-gray-400">
                        {r.closed_score} yopiq + {r.open_score} ochiq
                      </td>
                      <td className="py-4 px-5">
                        {r.is_passed ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800/60">
                            <CheckCircle2 className="w-3.5 h-3.5" /> O'tdi
                          </span>
                        ) : r.status === 'cancelled_cheat' ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-bold border border-red-200 dark:border-red-800/60">
                            <AlertTriangle className="w-3.5 h-3.5" /> Qoidabuzarlik
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800/60">
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
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-lg transition"
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
      )}

      {/* TAB 2: LEADERBOARD / XODIMLAR REYTINGI */}
      {currentSubTab === 'leaderboard' && (
        <div className="space-y-6">
          {/* Top 3 Podium Cards */}
          {leaderboard.length >= 1 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1st Place */}
              {leaderboard[0] && (
                <div className="bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-amber-500/20 dark:from-amber-950/40 dark:to-yellow-950/20 p-5 rounded-3xl border-2 border-amber-400/60 dark:border-amber-500/40 relative shadow-sm order-1 md:order-2">
                  <span className="absolute -top-3 right-5 px-3 py-0.5 rounded-full bg-amber-500 text-white font-extrabold text-xs shadow-md">
                    🥇 1-O'RIN
                  </span>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-amber-500/30">
                      1
                    </div>
                    <div>
                      <h3 className="font-extrabold text-gray-900 dark:text-gray-100 text-base leading-tight">
                        {leaderboard[0].employee_name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{leaderboard[0].department_name}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center pt-3 border-t border-amber-300/40 dark:border-amber-800/40">
                    <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl">
                      <span className="text-[10px] text-gray-400 block">O'rtacha ball</span>
                      <span className="text-lg font-black text-amber-600 dark:text-amber-400">{leaderboard[0].avg_score}%</span>
                    </div>
                    <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl">
                      <span className="text-[10px] text-gray-400 block">Topshirgan testlar</span>
                      <span className="text-lg font-black text-gray-800 dark:text-gray-200">{leaderboard[0].total_tests_taken} ta</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 2nd Place */}
              {leaderboard[1] && (
                <div className="bg-gradient-to-br from-slate-200/50 via-slate-100/30 to-slate-200/60 dark:from-slate-800/60 dark:to-slate-850 p-5 rounded-3xl border-2 border-slate-300 dark:border-slate-700 relative shadow-sm order-2 md:order-1">
                  <span className="absolute -top-3 right-5 px-3 py-0.5 rounded-full bg-slate-500 text-white font-extrabold text-xs shadow-md">
                    🥈 2-O'RIN
                  </span>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-500 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-slate-500/20">
                      2
                    </div>
                    <div>
                      <h3 className="font-extrabold text-gray-900 dark:text-gray-100 text-base leading-tight">
                        {leaderboard[1].employee_name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{leaderboard[1].department_name}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl">
                      <span className="text-[10px] text-gray-400 block">O'rtacha ball</span>
                      <span className="text-lg font-black text-slate-700 dark:text-slate-300">{leaderboard[1].avg_score}%</span>
                    </div>
                    <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl">
                      <span className="text-[10px] text-gray-400 block">Topshirgan testlar</span>
                      <span className="text-lg font-black text-gray-800 dark:text-gray-200">{leaderboard[1].total_tests_taken} ta</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {leaderboard[2] && (
                <div className="bg-gradient-to-br from-amber-700/10 via-orange-600/5 to-amber-700/20 dark:from-orange-950/40 dark:to-amber-950/20 p-5 rounded-3xl border-2 border-amber-600/40 dark:border-amber-700/40 relative shadow-sm order-3">
                  <span className="absolute -top-3 right-5 px-3 py-0.5 rounded-full bg-amber-700 text-white font-extrabold text-xs shadow-md">
                    🥉 3-O'RIN
                  </span>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-700 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-amber-700/20">
                      3
                    </div>
                    <div>
                      <h3 className="font-extrabold text-gray-900 dark:text-gray-100 text-base leading-tight">
                        {leaderboard[2].employee_name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{leaderboard[2].department_name}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center pt-3 border-t border-amber-500/30 dark:border-amber-800/40">
                    <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl">
                      <span className="text-[10px] text-gray-400 block">O'rtacha ball</span>
                      <span className="text-lg font-black text-amber-700 dark:text-amber-400">{leaderboard[2].avg_score}%</span>
                    </div>
                    <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl">
                      <span className="text-[10px] text-gray-400 block">Topshirgan testlar</span>
                      <span className="text-lg font-black text-gray-800 dark:text-gray-200">{leaderboard[2].total_tests_taken} ta</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Full Leaderboard Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-800 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/40">
                    <th className="py-3.5 px-5">O'rin</th>
                    <th className="py-3.5 px-5">Xodim</th>
                    <th className="py-3.5 px-5">Bo'lim</th>
                    <th className="py-3.5 px-5">Topshirilgan Testlar</th>
                    <th className="py-3.5 px-5">O'rtacha Ball</th>
                    <th className="py-3.5 px-5">Eng Yuqori Ball</th>
                    <th className="py-3.5 px-5">Qoidabuzarlik</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-800/60">
                  {leaderboard.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400">
                        Xodimlar ma'lumotlari topilmadi
                      </td>
                    </tr>
                  ) : (
                    leaderboard.map((u, idx) => (
                      <tr key={u.user_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-4 px-5">
                          {idx === 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-extrabold text-xs">
                              🥇 1-o'rin
                            </span>
                          ) : idx === 1 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs">
                              🥈 2-o'rin
                            </span>
                          ) : idx === 2 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-200/70 dark:bg-amber-900/40 text-amber-900 dark:text-amber-300 font-extrabold text-xs">
                              🥉 3-o'rin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 font-bold text-xs">
                              {idx + 1}-o'rin
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-5">
                          <div className="font-bold text-gray-900 dark:text-gray-100">{u.employee_name}</div>
                          <div className="text-[11px] text-gray-400 font-mono">@{u.username}</div>
                        </td>
                        <td className="py-4 px-5 text-gray-600 dark:text-gray-300 text-xs">
                          {u.department_name || '-'}
                        </td>
                        <td className="py-4 px-5 text-xs text-gray-600 dark:text-gray-300">
                          <b>{u.total_tests_taken} ta</b> ({u.passed_tests_count} o'tdi)
                        </td>
                        <td className="py-4 px-5">
                          <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                            {u.avg_score}%
                          </span>
                        </td>
                        <td className="py-4 px-5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {u.max_score}%
                        </td>
                        <td className="py-4 px-5 text-xs">
                          {u.total_cheat_warnings > 0 ? (
                            <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> {u.total_cheat_warnings} ta ogohlantirish
                            </span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> 100% toza
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
