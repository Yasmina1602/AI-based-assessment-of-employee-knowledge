import React, { useEffect, useState, useRef } from 'react';
import { testSessionService, departmentService } from '../services/api';
import { AntiCheatGuard } from '../components/AntiCheatGuard';
import { 
  Clock, CheckCircle2, ArrowRight, ArrowLeft, Send, 
  AlertTriangle, ShieldCheck, HelpCircle, BrainCircuit, Sparkles 
} from 'lucide-react';

interface EmployeeTestProps {
  user: any;
  onViewResults: (sessionId: number) => void;
}

export const EmployeeTest: React.FC<EmployeeTestProps> = ({ user, onViewResults }) => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<number>(user?.department_id || 0);
  const [session, setSession] = useState<any>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [remainingSec, setRemainingSec] = useState<number>(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const depts = await departmentService.getAll();
      setDepartments(depts);
      if (!selectedDeptId && depts.length > 0) {
        setSelectedDeptId(depts[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Start or resume test
  const handleStartTest = async () => {
    if (!selectedDeptId) return;
    try {
      setLoading(true);
      const res = await testSessionService.start(selectedDeptId);
      setSession(res);
      setRemainingSec(res.remaining_seconds || 1800);
      setCurrentIdx(0);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Testni boshlashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  // Server-synced countdown timer
  useEffect(() => {
    if (!session || session.status !== 'in_progress') return;

    timerRef.current = setInterval(() => {
      setRemainingSec((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [session]);

  const handleAutoSubmit = async () => {
    if (!session) return;
    try {
      setSubmitting(true);
      await testSessionService.submit(session.session_id);
      onViewResults(session.session_id);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!session) return;
    const unansweredCount = session.questions.filter(
      (q: any) => !q.saved_selected_option_id && (!q.saved_answer_text || q.saved_answer_text.trim() === '')
    ).length;

    let confirmMsg = "Testni haqiqatdan ham yakunlamoqchimisiz?";
    if (unansweredCount > 0) {
      confirmMsg = `Diqqat! Sizda ${unansweredCount} ta belgilanmagan savol bor. Baribir testni yakunlamoqchimisiz?`;
    }

    if (!window.confirm(confirmMsg)) return;

    try {
      setSubmitting(true);
      await testSessionService.submit(session.session_id);
      onViewResults(session.session_id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Yakunlashda xatolik');
      setSubmitting(false);
    }
  };

  const handleSelectOption = async (optionId: number) => {
    if (!session) return;
    const q = session.questions[currentIdx];

    // Optimistic UI update
    const updatedQuestions = [...session.questions];
    updatedQuestions[currentIdx].saved_selected_option_id = optionId;
    setSession({ ...session, questions: updatedQuestions });

    // Save to server
    try {
      await testSessionService.saveAnswer(session.session_id, q.id, {
        selected_option_id: optionId,
      });
    } catch (e) {
      console.error('Answer save failed', e);
    }
  };

  const handleTextAnswerChange = (val: string) => {
    if (!session) return;
    const updatedQuestions = [...session.questions];
    updatedQuestions[currentIdx].saved_answer_text = val;
    setSession({ ...session, questions: updatedQuestions });
  };

  const handleTextAnswerBlur = async () => {
    if (!session) return;
    const q = session.questions[currentIdx];
    try {
      await testSessionService.saveAnswer(session.session_id, q.id, {
        answer_text: q.saved_answer_text || '',
      });
    } catch (e) {
      console.error('Text answer save failed', e);
    }
  };

  const handleAntiCheatDetected = async (eventType: string, details?: any) => {
    if (!session) return { warning_count: 0, terminated: false, message: '' };
    try {
      const res = await testSessionService.logAntiCheatEvent(session.session_id, eventType, details);
      return res;
    } catch (e) {
      return { warning_count: 0, terminated: false, message: '' };
    }
  };

  // Format MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Evaluating Overlay
  if (submitting) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center text-white">
        <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center mb-6 shadow-2xl animate-pulse">
          <BrainCircuit className="w-12 h-12 text-white animate-spin" />
        </div>
        <h2 className="text-2xl font-bold mb-2">AI Natijalaringizni Baholamoqda...</h2>
        <p className="text-indigo-200 text-sm max-w-md mb-4">
          Yopiq savollar tekshirildi. Ochiq savollaringiz RAG orqali me'yoriy reglamentlar bilan solishtirilib, 1-5 ball shkalada baholanmoqda.
        </p>
        <div className="w-48 bg-slate-800 h-2 rounded-full overflow-hidden">
          <div className="bg-indigo-500 h-full w-2/3 animate-pulse" />
        </div>
      </div>
    );
  }

  // Pre-test Screen
  if (!session) {
    const currentDept = departments.find((d) => d.id === selectedDeptId);

    return (
      <div className="max-w-3xl mx-auto space-y-6 py-6">
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
            Bilim va Ko'nikmalarni Baholash Testi
          </h1>
          <p className="text-gray-600 text-sm mb-6">
            Ushbu test korxonaning tasdiqlangan ichki reglament va me'yoriy hujjatlari asosida sun'iy intellekt tomonidan tuzilgan.
          </p>

          {/* Department Selector */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Test Yo'nalishini (Bo'limni) tanlang:
            </label>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(Number(e.target.value))}
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.test_duration_minutes || 30} daqiqa, {d.total_questions || 30} ta savol)
                </option>
              ))}
            </select>
          </div>

          {/* Instructions Box */}
          <div className="bg-indigo-50/60 p-5 rounded-2xl border border-indigo-100 mb-6 space-y-3 text-xs text-indigo-950">
            <h4 className="font-bold text-sm text-indigo-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Test Qoidalari va Shartlari</span>
            </h4>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>Test davomiyligi: <b>{currentDept?.test_duration_minutes || 30} daqiqa</b>.</li>
              <li>Test tarkibi: <b>{currentDept?.closed_questions_count || 25} ta yopiq</b> va <b>{currentDept?.open_questions_count || 5} ta ochiq</b> savol.</li>
              <li>O'tish bali: <b>{currentDept?.passing_score || 60}%</b>.</li>
              <li><b>Anti-Cheat Nazorati:</b> Brauzer oynasini tark etish, tab almashish, matnni nusxalash taqiqlanadi (3 ta ogohlantirishdan so'ng test bekor qilinadi).</li>
              <li>Javoblaringiz avtomatik saqlanib boradi. Internet uzilsa ham vaqt serverda to'xtamaydi.</li>
            </ul>
          </div>

          <button
            onClick={handleStartTest}
            disabled={loading || departments.length === 0}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50 text-base"
          >
            {loading ? (
              <span>Test tayyorlanmoqda...</span>
            ) : (
              <>
                <span>Testni Boshlash</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Active Test Screen with Anti-Cheat Protection
  const questions = session.questions || [];
  const currentQ = questions[currentIdx];
  const isTimeUrgent = remainingSec < 300; // < 5 mins

  return (
    <AntiCheatGuard
      sessionId={session.session_id}
      warningsCount={session.cheat_warnings_count || 0}
      onCheatDetected={handleAntiCheatDetected}
      isTestActive={session.status === 'in_progress'}
    >
      <div className="max-w-5xl mx-auto space-y-4 py-4">
        {/* Top Sticky Bar: Department, Question Nav & Timer */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4 sticky top-16 z-20">
          <div>
            <span className="text-xs text-gray-400 font-medium">{session.department_name}</span>
            <div className="text-sm font-bold text-gray-900">
              Savol: {currentIdx + 1} / {questions.length}
            </div>
          </div>

          {/* Countdown Timer */}
          <div className={`px-4 py-2 rounded-xl flex items-center gap-2 font-mono font-bold text-base shadow-sm border ${
            isTimeUrgent 
              ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse' 
              : 'bg-indigo-50 text-indigo-700 border-indigo-100'
          }`}>
            <Clock className="w-4 h-4" />
            <span>{formatTime(remainingSec)}</span>
          </div>

          <button
            onClick={handleManualSubmit}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-emerald-100 flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Yakunlash</span>
          </button>
        </div>

        {/* Question Content & Navigation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Question Card */}
          <div className="lg:col-span-3 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between min-h-[460px]">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  currentQ.question_type === 'closed'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-purple-50 text-purple-700 border border-purple-200'
                }`}>
                  {currentQ.question_type === 'closed' ? "Yopiq savol (1 ta to'g'ri javob)" : 'Ochiq savol (Matnli javob)'}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  Daraja: {currentQ.level || 'Middle'}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-relaxed mb-6">
                {currentQ.question_text}
              </h2>

              {/* Closed Question Options */}
              {currentQ.question_type === 'closed' && (
                <div className="space-y-3">
                  {currentQ.options.map((opt: any, oIdx: number) => {
                    const isSelected = currentQ.saved_selected_option_id === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelectOption(opt.id)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-center gap-3.5 ${
                          isSelected
                            ? 'bg-indigo-50/70 border-indigo-600 text-indigo-950 font-semibold shadow-sm'
                            : 'bg-gray-50/60 border-gray-100 text-gray-700 hover:bg-gray-50 hover:border-gray-200'
                        }`}
                      >
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span className="text-sm">{opt.option_text}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Open Question Textarea */}
              {currentQ.question_type === 'open' && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-500">
                    Javobingizni me'yoriy qoidalar va ichki reglamentga asoslangan holda to'liq yozing:
                  </label>
                  <textarea
                    rows={6}
                    value={currentQ.saved_answer_text || ''}
                    onChange={(e) => handleTextAnswerChange(e.target.value)}
                    onBlur={handleTextAnswerBlur}
                    placeholder="Bu yerga batafsil javobingizni yozing..."
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none leading-relaxed"
                  />
                  <div className="flex justify-between text-[11px] text-gray-400">
                    <span>Avtomatik saqlanadi</span>
                    <span>{(currentQ.saved_answer_text || '').length} belgi</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Next/Prev buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-6">
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(currentIdx - 1)}
                className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition flex items-center gap-1.5 disabled:opacity-30"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Oldingisi</span>
              </button>

              <button
                disabled={currentIdx === questions.length - 1}
                onClick={() => setCurrentIdx(currentIdx + 1)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-indigo-100 disabled:opacity-30"
              >
                <span>Keyingisi</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Question Palette */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm h-fit">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Savollar Xaritasi
            </h3>

            <div className="grid grid-cols-5 gap-2">
              {questions.map((q: any, idx: number) => {
                const isAnswered = q.saved_selected_option_id || (q.saved_answer_text && q.saved_answer_text.trim().length > 0);
                const isCurrent = currentIdx === idx;

                let btnStyle = 'bg-gray-50 text-gray-600 border-gray-200';
                if (isAnswered) btnStyle = 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold';
                if (isCurrent) btnStyle += ' ring-2 ring-indigo-600 font-extrabold';

                return (
                  <button
                    key={q.id || idx}
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-9 rounded-xl text-xs border flex items-center justify-center transition ${btnStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100 space-y-2 text-[11px] text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-500" />
                <span>Javob berilgan</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gray-200" />
                <span>Belgilanmagan</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded border-2 border-indigo-600" />
                <span>Hozirgi savol</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AntiCheatGuard>
  );
};
