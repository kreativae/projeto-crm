import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

const variants = {
  danger: { icon: '⚠️', bg: 'from-red-500 to-rose-600', shadow: 'shadow-red-500/25', btn: 'bg-red-600 hover:bg-red-700' },
  warning: { icon: '⚡', bg: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/25', btn: 'bg-amber-600 hover:bg-amber-700' },
  info: { icon: 'ℹ️', bg: 'from-indigo-500 to-purple-600', shadow: 'shadow-indigo-500/25', btn: 'bg-indigo-600 hover:bg-indigo-700' },
};

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', variant = 'danger', onConfirm, onCancel }: Props) {
  const v = variants[variant];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
          >
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${v.bg} flex items-center justify-center text-2xl mb-4 shadow-lg ${v.shadow}`}>
              {v.icon}
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">{message}</p>
            <div className="flex gap-3">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onCancel}
                className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/10 transition-colors"
              >{cancelLabel}</motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onConfirm}
                className={`flex-1 py-2.5 ${v.btn} rounded-xl text-sm font-semibold text-white transition-colors shadow-lg ${v.shadow}`}
              >{confirmLabel}</motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
