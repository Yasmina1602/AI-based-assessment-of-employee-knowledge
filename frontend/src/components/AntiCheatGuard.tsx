import React, { useEffect, useState } from 'react';
import { AlertTriangle, ShieldAlert, XCircle } from 'lucide-react';

interface AntiCheatGuardProps {
  sessionId: number;
  warningsCount: number;
  onCheatDetected: (eventType: string, details?: any) => Promise<{ warning_count: number; terminated: boolean; message: string }>;
  isTestActive: boolean;
  children: React.ReactNode;
}

export const AntiCheatGuard: React.FC<AntiCheatGuardProps> = ({
  sessionId,
  warningsCount,
  onCheatDetected,
  isTestActive,
  children,
}) => {
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [currentWarnings, setCurrentWarnings] = useState(warningsCount);
  const [isTerminated, setIsTerminated] = useState(false);

  useEffect(() => {
    setCurrentWarnings(warningsCount);
  }, [warningsCount]);

  useEffect(() => {
    if (!isTestActive || isTerminated) return;

    // 1. Tab visibility change (leaving tab)
    const handleVisibilityChange = async () => {
      if (document.hidden) {
        const res = await onCheatDetected('tab_hidden', { url: window.location.href });
        setCurrentWarnings(res.warning_count);
        setWarningMessage(res.message);
        setWarningModalOpen(true);
        if (res.terminated) setIsTerminated(true);
      }
    };

    // 2. Window blur (clicking outside or opening secondary screen)
    const handleWindowBlur = async () => {
      const res = await onCheatDetected('window_blur', { timestamp: new Date().toISOString() });
      setCurrentWarnings(res.warning_count);
      setWarningMessage(res.message);
      setWarningModalOpen(true);
      if (res.terminated) setIsTerminated(true);
    };

    // 3. Block Context Menu (right click)
    const handleContextMenu = async (e: MouseEvent) => {
      e.preventDefault();
      const res = await onCheatDetected('context_menu_attempt', {});
      setCurrentWarnings(res.warning_count);
      setWarningMessage(res.message);
      setWarningModalOpen(true);
      if (res.terminated) setIsTerminated(true);
    };

    // 4. Block Copy, Cut, Paste
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      onCheatDetected('copy_attempt', {});
    };
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      onCheatDetected('paste_attempt', {});
    };

    // 5. Block Key Combinations (F12, Ctrl+Shift+I, Ctrl+U)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'C' || e.key === 'c' || e.key === 'J' || e.key === 'j')) ||
        (e.ctrlKey && (e.key === 'u' || e.key === 'U'))
      ) {
        e.preventDefault();
        onCheatDetected('devtools_attempt', { key: e.key });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCopy);
    document.addEventListener('paste', handlePaste);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCopy);
      document.removeEventListener('paste', handlePaste);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTestActive, isTerminated, onCheatDetected]);

  return (
    <div className="relative select-none no-select">
      {/* Warning banner if warnings exist */}
      {currentWarnings > 0 && !isTerminated && (
        <div className="bg-amber-500 text-white px-4 py-2 text-center text-sm font-semibold flex items-center justify-center gap-2 sticky top-0 z-40 shadow">
          <AlertTriangle className="w-5 h-5 animate-pulse" />
          <span>
            Anti-Cheat ogohlantirishi: {currentWarnings}/3. Yana {3 - currentWarnings} ta qoidabuzarlikdan so'ng test avtomatik bekor qilinadi!
          </span>
        </div>
      )}

      {children}

      {/* Warning Modal */}
      {warningModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-red-500 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              {isTerminated ? <XCircle className="w-10 h-10" /> : <ShieldAlert className="w-10 h-10" />}
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {isTerminated ? 'TEST BEKOR QILINDI!' : 'QOIDABUZARLIK ANIQLANDI!'}
            </h3>

            <p className="text-gray-600 text-sm mb-4">
              {warningMessage || "Siz boshqa ilovaga o'tdingiz yoki ruxsat etilmagan amalni bajardingiz. Barcha harakatlar audit jurnaliga yozib borilmoqda."}
            </p>

            <div className="bg-red-50 p-3 rounded-lg border border-red-200 mb-5">
              <span className="text-sm font-bold text-red-700">
                Qoidabuzarliklar soni: {currentWarnings} / 3
              </span>
            </div>

            {isTerminated ? (
              <button
                onClick={() => window.location.href = '/login'}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition"
              >
                Chiqish
              </button>
            ) : (
              <button
                onClick={() => setWarningModalOpen(false)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition shadow-lg shadow-indigo-200"
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

