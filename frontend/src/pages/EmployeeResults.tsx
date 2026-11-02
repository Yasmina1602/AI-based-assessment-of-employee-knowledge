import React, { useEffect, useState } from 'react';
import { resultService, testSessionService } from '../services/api';
import { 
  BarChart3, CheckCircle2, XCircle, AlertTriangle, 
  ArrowLeft, BrainCircuit, ShieldAlert, Award, Star, Clock 
} from 'lucide-react';

export const EmployeeResults: React.FC = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [sessionDetail, setSessionDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    loadMyResults();
  }, []);

  useEffect(() => {
    if (activeSessionId) {
      loadDetail(activeSessionId);
    }
  }, [activeSessionId]);

  const loadMyResults = async () => {
    try {
      setLoading(true);
      const res = await resultService.getMy();
      setResults(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (id: number) => {
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

  // Detailed Modal/View
  if (activeSessionId && sessionDetail) {
    const { session, details } = sessionDetail;

    return (
      <div className="max-w-4xl mx-auto space-y-6 py-4">
        <button
          onClick={() => {
            setActiveSessionId(null);
            setSessionDetail(null);
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold rounded-xl shadow-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Natijalar ro'yxatiga qaytish</span>
        </button>

        {/* Banner */}
        <div className={`p-6 sm:p-8 rounded-3xl text-white shadow-xl ${
          session.is_passed 
            ? 'bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900' 
            : 'bg-gradient-to-br from-rose-600 via-red-700 to-rose-900'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/20">
                {session.department_name}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">
                {session.is_passed ? "Tabriklaymiz, testdan o'tdingiz!" : "Afsuski, o'tish bali yetarli bo'lmadi"}
              </h1>
              <p className="text-white/80 text-xs mt-1">
                Topshirilgan sana: {new Date(session.completed_at || session.started_at).toLocaleString('uz-UZ')}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 text-center self-start sm:self-auto">
              <span className="text-xs text-white/70 block">Umumiy Natija</span>
              <span className="text-4xl font-black">{session.percentage}%</span>
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
              <span className="text-white/60 block">Talab qilingan:</span>
              <span className="text-base font-bold">{session.passing_score}%</span>
            </div>
            <div>
              <span className="text-white/60 block">Holat:</span>
              <span className="text-base font-bold">{session.is_passed ? "Muvaffaqiyatli" : "Qayta topshirish tavsiya etiladi"}</span>
            </div>
          </div>
        </div>

        {/* Detailed Feedback */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Savollar tahlili va AI fikrlari</h2>

          {details.map((item: any) => {
            const isClosed = item.question_type === 'closed';
            const aiEval = item.ai_evaluation;

            return (
              <div key={item.order} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 block mb-1">
                      {item.order}-savol • {isClosed ? 'Yopiq savol' : 'Ochiq savol'}
                    </span>
                    <h3 className="text-sm font-bold text-gray-900">{item.question_text}</h3>
                  </div>

                  <div className="shrink-0">
                    {isClosed ? (
                      item.is_correct ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" /> To'g'ri
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700">
                          <XCircle className="w-3.5 h-3.5" /> Noto'g'ri
                        </span>
                      )
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700">
                        <Star className="w-3.5 h-3.5 fill-purple-700" /> {item.score} / 5 ball
                      </span>
                    )}
                  </div>
                </div>

                {/* Open question AI feedback */}
                {!isClosed && aiEval && (
                  <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-100 text-xs text-purple-950 space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-purple-900">
                      <BrainCircuit className="w-4 h-4 text-purple-600" />
                      <span>AI Tahlili va Izohlari:</span>
                    </div>

                    {aiEval.explanation && <p className="italic">{aiEval.explanation}</p>}

                    {Array.isArray(aiEval.strengths) && aiEval.strengths.length > 0 && (
                      <div className="text-emerald-800">
                        <b>Kuchli jihatlar:</b> {aiEval.strengths.join('; ')}
                      </div>
                    )}

                    {Array.isArray(aiEval.weaknesses) && aiEval.weaknesses.length > 0 && (
                      <div className="text-rose-800">
                        <b>E'tibor berish kerak bo'lgan kamchiliklar:</b> {aiEval.weaknesses.join('; ')}
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

  // List View
  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mening Natijalarim</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Avval topshirgan barcha testlaringiz va AI tomonidan berilgan baholar
        </p>
      </div>

      <div className="space-y-3">
        {results.length === 0 ? (
          <div className="bg-white p-12 text-center text-gray-400 rounded-2xl border border-gray-100">
            <Award className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="text-sm">Siz hali test topshirmagansiz.</p>
          </div>
        ) : (
          results.map((r) => (
            <div
              key={r.id}
              onClick={() => setActiveSessionId(r.id)}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition cursor-pointer flex items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                    {r.department_name}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(r.completed_at || r.started_at).toLocaleDateString('uz-UZ')}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Ball: <b>{r.closed_score} yopiq + {r.open_score} ochiq</b>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-2xl font-black text-gray-900 block">{r.percentage}%</span>
                  <span className={`text-[11px] font-bold ${
                    r.is_passed ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {r.is_passed ? "Muvaffaqiyatli" : "O'ta olmadi"}
                  </span>
                </div>

                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

