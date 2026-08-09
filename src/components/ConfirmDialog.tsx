import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Modal konfirmasi aksi destruktif (hapus) — gaya konsisten seluruh dashboard. */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open, title, message, confirmLabel = 'Hapus', cancelLabel = 'Batal', onConfirm, onCancel,
}) => {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.92, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 16, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
            className="relative z-10 bg-white dark:bg-stone-900 rounded-2xl border border-rose-200 dark:border-rose-900/50 shadow-2xl w-full max-w-md overflow-hidden"
            role="alertdialog"
            aria-modal="true"
            aria-label={title}
          >
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-1.5">{title}</h3>
              <div className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">{message}</div>
              <div className="flex items-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 py-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-sm font-bold rounded-xl transition"
                >
                  {cancelLabel}
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-xl transition shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
