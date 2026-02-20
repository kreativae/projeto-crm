import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType>({} as ToastContextType);

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: { bg: 'bg-emerald-50 border-emerald-200', icon: 'text-emerald-500', title: 'text-emerald-900', msg: 'text-emerald-700' },
  error: { bg: 'bg-red-50 border-red-200', icon: 'text-red-500', title: 'text-red-900', msg: 'text-red-700' },
  warning: { bg: 'bg-amber-50 border-amber-200', icon: 'text-amber-500', title: 'text-amber-900', msg: 'text-amber-700' },
  info: { bg: 'bg-blue-50 border-blue-200', icon: 'text-blue-500', title: 'text-blue-900', msg: 'text-blue-700' },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    const newToast = { ...toast, id };
    setToasts(prev => [...prev.slice(-4), newToast]);
    setTimeout(() => removeToast(id), toast.duration || 4000);
  }, [removeToast]);

  const success = useCallback((title: string, message?: string) => addToast({ type: 'success', title, message }), [addToast]);
  const error = useCallback((title: string, message?: string) => addToast({ type: 'error', title, message, duration: 6000 }), [addToast]);
  const warning = useCallback((title: string, message?: string) => addToast({ type: 'warning', title, message }), [addToast]);
  const info = useCallback((title: string, message?: string) => addToast({ type: 'info', title, message }), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, success, error, warning, info }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => {
            const Icon = icons[toast.type];
            const color = colors[toast.type];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 100, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.9 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-lg backdrop-blur-sm ${color.bg}`}
              >
                <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${color.icon}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${color.title}`}>{toast.title}</p>
                  {toast.message && <p className={`text-xs mt-0.5 ${color.msg}`}>{toast.message}</p>}
                </div>
                <button onClick={() => removeToast(toast.id)} className="flex-shrink-0 p-1 hover:bg-black/5 rounded-lg transition-colors">
                  <X className="h-3.5 w-3.5 text-slate-400" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
