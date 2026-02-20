import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const widthClasses = {
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full',
};

export default function SlideOver({
  open,
  onClose,
  title,
  children,
  footer,
  width = 'lg'
}: SlideOverProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          {/* ===== BACKDROP WITH BLUR ===== */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md"
            style={{ WebkitBackdropFilter: 'blur(12px)' }}
            onClick={onClose}
          />

          {/* ===== PANEL ===== */}
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <motion.div
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={cn(
                'pointer-events-auto w-screen',
                widthClasses[width]
              )}
            >
              <div className="flex h-full flex-col overflow-hidden bg-white/95 backdrop-blur-xl shadow-2xl shadow-slate-900/20 border-l border-slate-200/50">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 relative overflow-hidden">
                  {/* Decorative elements */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                  <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-purple-400/10 rounded-full blur-xl" />

                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <h2 className="text-lg font-bold text-white leading-tight">
                        {title}
                      </h2>
                      <div className="h-0.5 w-12 bg-white/30 rounded-full mt-2" />
                    </div>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                      className="rounded-xl bg-white/15 backdrop-blur-sm text-white/90 hover:text-white hover:bg-white/25 p-2 border border-white/10 transition-colors"
                      onClick={onClose}
                    >
                      <X className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>

                {/* Content */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.3 }}
                  className="relative flex-1 px-6 py-6 overflow-y-auto"
                >
                  {children}
                </motion.div>

                {/* Footer */}
                {footer && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="border-t border-slate-200/60 bg-slate-50/80 backdrop-blur-sm px-6 py-4"
                  >
                    {footer}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
