import { useState } from 'react';
import { createPortal } from 'react-dom';

let toastFn = null;

export const initToast = (fn) => { toastFn = fn; };
export const showToast = (msg, type = 'success') => { if (toastFn) toastFn(msg, type); };

export const ToastContainer = () => {
    const [toasts, setToasts] = useState([]);

    const addToast = (msg, type) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, msg, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    };

    // Register globally
    useState(() => { initToast(addToast); });

    return createPortal(
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
            {toasts.map(t => (
                <div
                    key={t.id}
                    className="animate-pop-in pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-md max-w-sm"
                    style={{ background: t.type === 'badge' ? 'linear-gradient(135deg, #166534, #15803d)' : t.type === 'error' ? '#991b1b' : '#1e293b' }}
                >
                    {t.type === 'badge' && <span className="text-2xl">🏅</span>}
                    {t.type === 'success' && <span className="text-2xl">✅</span>}
                    {t.type === 'error' && <span className="text-2xl">❌</span>}
                    <p className="text-white font-medium text-sm leading-snug">{t.msg}</p>
                </div>
            ))}
        </div>,
        document.body
    );
};
