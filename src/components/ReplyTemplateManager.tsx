import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Pencil, Trash2, Save, X, MessageSquareText, AlertCircle } from 'lucide-react';
import { ReplyTemplate, SubmissionStatus } from '../types';
import { ConfirmDialog } from './ConfirmDialog';

const STATUS_OPTIONS: SubmissionStatus[] = ['DIAJUKAN', 'VERIFIKASI_ADMIN', 'SURVEY_TEKNIS', 'PROSES_REKOMENDASI', 'SELESAI', 'DITOLAK', 'DIKEMBALIKAN'];

interface ReplyTemplateManagerProps {
  templates: ReplyTemplate[];
  onAdd: (t: ReplyTemplate) => Promise<void>;
  onUpdate: (t: ReplyTemplate) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  addToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const empty = (): Partial<ReplyTemplate> => ({ label: '', status: 'DIAJUKAN', text: '' });

export const ReplyTemplateManager: React.FC<ReplyTemplateManagerProps> = ({
  templates, onAdd, onUpdate, onDelete, addToast,
}) => {
  const [form, setForm] = useState<Partial<ReplyTemplate>>(empty());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ReplyTemplate | null>(null);

  const reset = () => { setForm(empty()); setEditingId(null); setIsFormOpen(false); };

  const openEdit = (t: ReplyTemplate) => { setForm({ ...t }); setEditingId(t.id); setIsFormOpen(true); };

  const handleSave = async () => {
    if (!form.label?.trim() || !form.text?.trim()) {
      addToast('Label dan teks balasan wajib diisi.', 'error');
      return;
    }
    const payload: ReplyTemplate = {
      id: editingId || `tpl-${Date.now().toString(36)}`,
      label: form.label.trim(),
      status: form.status as SubmissionStatus,
      text: form.text.trim(),
      sortOrder: editingId ? undefined : templates.length + 1,
    };
    try {
      if (editingId) {
        await onUpdate(payload);
        addToast('Template balasan diperbarui.', 'success');
      } else {
        await onAdd(payload);
        addToast('Template balasan ditambahkan.', 'success');
      }
      reset();
    } catch {
      addToast('Gagal menyimpan template. Cek koneksi dan coba lagi.', 'error');
    }
  };

  const performDelete = async () => {
    if (!deleteTarget) return;
    try {
      await onDelete(deleteTarget.id);
      addToast(`Template "${deleteTarget.label}" dihapus.`, 'info');
    } catch {
      addToast('Gagal menghapus template. Cek koneksi dan coba lagi.', 'error');
    }
    setDeleteTarget(null);
  };

  const badge = (status: string) =>
    `px-2 py-0.5 rounded-full text-[9px] font-bold font-mono ${
      status === 'SELESAI' ? 'bg-emerald-100 text-emerald-800'
      : status === 'DITOLAK' ? 'bg-rose-100 text-rose-800'
      : status === 'DIAJUKAN' ? 'bg-blue-100 text-blue-800'
      : 'bg-amber-100 text-amber-800'
    }`;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquareText className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-extrabold text-[#1B4332]">Template Balasan ({templates.length})</h3>
        </div>
        <button
          onClick={() => { reset(); setIsFormOpen(true); }}
          className="px-4 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> Template Baru
        </button>
      </div>

      <p className="text-[11px] text-slate-500 bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 leading-relaxed">
        Template berisi <b>status + teks balasan</b>. Saat admin memilih template di panel Ubah Status, status
        dan teks otomatis terisi. Pemohon melihat teks ini di notifikasi dan timeline pelacakan.
      </p>

      {/* Form */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white border border-emerald-100 rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-[#1B4332]">
                  {editingId ? '✏️ Edit Template' : '➕ Template Baru'}
                </h4>
                <button onClick={reset} className="p-1.5 rounded-lg hover:bg-slate-100 transition">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Label (nama singkat) *</label>
                <input
                  type="text"
                  value={form.label || ''}
                  onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                  placeholder="Contoh: Tindak lanjut awal"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Status yang Diatur *</label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value as SubmissionStatus }))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 bg-white"
                >
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Teks Balasan *</label>
                <textarea
                  value={form.text || ''}
                  onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                  rows={3}
                  placeholder="Contoh: Laporan Anda akan segera kami tindaklanjuti..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 resize-none"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button onClick={reset} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition">Batal</button>
                <button onClick={handleSave} className="px-5 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5">
                  <Save className="w-3.5 h-3.5" /> {editingId ? 'Simpan' : 'Tambah Template'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      <div className="space-y-2">
        {templates.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-xs">
            <MessageSquareText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="font-bold">Belum ada template</p>
            <p className="mt-1">Buat template pertama dengan tombol di atas.</p>
          </div>
        )}
        {templates.map(t => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-slate-200 p-3.5 flex items-start gap-3 hover:border-emerald-200 transition"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-slate-800">{t.label}</span>
                <span className={badge(t.status)}>{t.status.replace('_', ' ')}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">{t.text}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition" title="Edit">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setDeleteTarget(t)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition" title="Hapus">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus Template?"
        message={<>
          Template <span className="font-bold text-slate-700 dark:text-stone-200">"{deleteTarget?.label}"</span> akan dihapus
          permanen. Berkas yang sudah dibalas tidak terpengaruh.
        </>}
        onConfirm={performDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
