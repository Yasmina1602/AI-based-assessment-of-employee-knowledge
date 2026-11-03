import React, { useEffect, useState, useRef, useCallback } from 'react';
import { AlertTriangle, ShieldAlert, XCircle } from 'lucide-react';

interface AntiCheatGuardProps {
  sessionId: number;
  warningsCount: number;
  onCheatDetected: (eventType: string, details?: any) => Promise<{ warning_count: number; terminated: boolean; message: string }>;
  isTestActive: boolean;
  onTerminated?: () => void;
  children: React.ReactNode;
}

export const AntiCheatGuard: React.FC<AntiCheatGuardProps> = ({
  sessionId,
  warningsCount,
  onCheatDetected,
  isTestActive,
  onTerminated,
  children,
}) => {
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [currentWarnings, setCurrentWarnings] = useState(warningsCount);
  const [isTerminated, setIsTerminated] = useState(false);

  const lastEventTimeRef = useRef<number>(0);
  const isTerminatedRef = useRef<boolean>(false);

  useEffect(() => {
    setCurrentWarnings(warningsCount);
  }, [warningsCount]);

  // Audio alert tone using Web Audio API
  const playAlertSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch {
      // Audio autoplay policy fallback
    }
  }, []);

  // Centralized violation handler
  const triggerViolation = useCallback(
    async (eventType: string, details: any = {}) => {
      if (!isTestActive || isTerminatedRef.current) return;

      const now = Date.now();
      // Debounce events firing within 1200ms (e.g. blur + visibilitychange triggered together)
      if (now - lastEventTimeRef.current < 1200) {
        return;
      }
      lastEventTimeRef.current = now;

      // Play auditory warning
      playAlertSound();

      try {
        const res = await onCheatDetected(eventType, details);
        const count = res.warning_count || 1;
        setCurrentWarnings(count);
        setWarningMessage(res.message);
        setWarningModalOpen(true);

        if (res.terminated) {
          isTerminatedRef.current = true;
          setIsTerminated(true);
        }
      } catch (err) {
        console.error('Qoidabuzarlikni yozishda xatolik:', err);
      }
    },
    [isTestActive, onCheatDetected, playAlertSound]
  );

  useEffect(() => {
    if (!isTestActive || isTerminated) return;

    // 1. Tab visibility change (leaving or returning to tab)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation('tab_hidden', { url: window.location.href });
      } else {
        // When user returns to tab, if warnings exist, ensure modal is visible
        if (lastEventTimeRef.current > 0) {
          setWarningModalOpen(true);
        }
      }
    };

    // 2. Window blur (alt-tabbing or clicking another application)
    const handleWindowBlur = () => {
      triggerViolation('window_blur', { timestamp: new Date().toISOString() });
    };

    // 3. Window focus (returning)
    const handleWindowFocus = () => {
      if (lastEventTimeRef.current > 0 && currentWarnings > 0) {
        setWarningModalOpen(true);
      }
    };

    // 4. Block Context Menu (right click)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerViolation('context_menu_attempt', {});
    };

    // 5. Block Copy, Cut, Paste
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerViolation('copy_attempt', {});
    };
    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerViolation('cut_attempt', {});
    };
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerViolation('paste_attempt', {});
    };

    // 6. Block Key Combinations (F12, Ctrl+Shift+I/C/J, Ctrl+U)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'i', 'C', 'c', 'J', 'j'].includes(e.key)) ||
        (e.ctrlKey && (e.key === 'u' || e.key === 'U'))
      ) {
        e.preventDefault();
        triggerViolation('devtools_attempt', { key: e.key });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('paste', handlePaste);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('paste', handlePaste);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTestActive, isTerminated, triggerViolation, currentWarnings]);

  return (
    <div className="relative select-none no-select">
      {/* Sticky Warning Bar if any warning occurred */}
      {currentWarnings > 0 && !isTerminated && (
        <div className="bg-amber-600 dark:bg-amber-700 text-white px-4 py-2.5 text-center text-xs sm:text-sm font-bold flex items-center justify-center gap-2 sticky top-0 z-40 shadow-lg">
          <AlertTriangle className="w-5 h-5 animate-pulse text-amber-200" />
          <span>
            Qoidabuzarlik ogohlantirishi: {currentWarnings}/3. Yana {3 - currentWarnings} ta qoidabuzarlikdan so'ng test avtomatik bekor qilinadi!
          </span>
        </div>
      )}

      {children}

      {/* Immediate Violation Warning Modal (Shown on EVERY violation 1, 2, 3) */}
      {warningModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border-2 border-red-500 text-center animate-in fade-in zoom-in duration-200">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
              isTerminated 
                ? 'bg-red-100 dark:bg-red-950/70 text-red-600 dark:text-red-400' 
                : currentWarnings >= 2 
                  ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400'
                  : 'bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400'
            }`}>
              {isTerminated ? <XCircle className="w-10 h-10" /> : <ShieldAlert className="w-10 h-10 animate-bounce" />}
            </div>

            <h3 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">
              {isTerminated
                ? 'TEST BEKOR QILINDI!'
                : currentWarnings === 2
                  ? 'OXIRGI OGOHLANTIRISH (2/3)!'
                  : 'QOIDABUZARLIK ANIQLANDI (1/3)!'}
            </h3>

            <p className="text-gray-600 dark:text-gray-300 text-sm mb-5 leading-relaxed">
              {warningMessage || (
                isTerminated
                  ? "Test qoidalarini ketma-ket 3 marta buzganingiz sababli test to'xtatildi."
                  : currentWarnings === 2
                    ? "Diqqat! Bu sizning 2-ogohlantirishingiz. Agar yana bir bor boshqa ilovaga o'tsangiz yoki ruxsatsiz amal qilsangiz, testingiz darhol bekor qilinadi va 0 ball qo'yiladi!"
                    : "Siz boshqa oynaga o'tdingiz yoki ruxsat etilmagan amalni bajardingiz. Har bir harakat audit jurnaliga yozib borilmoqda. Qoidalarga rioya qiling!"
              )}
            </p>

            <div className="bg-red-50 dark:bg-red-950/40 p-3.5 rounded-2xl border border-red-200 dark:border-red-900/60 mb-6">
              <span className="text-sm font-extrabold text-red-700 dark:text-red-300">
                Qayd etilgan qoidabuzarliklar: {currentWarnings} / 3
              </span>
            </div>

            {isTerminated ? (
              <button
                onClick={() => {
                  setWarningModalOpen(false);
                  if (onTerminated) {
                    onTerminated();
                  } else {
                    window.location.reload();
                  }
                }}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition shadow-lg shadow-red-500/20 text-sm"
              >
                Natijani va Qoidabuzarliklar Auditini Ko'rish
              </button>
            ) : (
              <button
                onClick={() => setWarningModalOpen(false)}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-lg shadow-indigo-500/20 text-sm"
              >
                Tushundim, testni davom ettirish
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
