import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Save, ExternalLink, Globe, X, AlertCircle, GripVertical, Pencil } from 'lucide-react';
import { useStore } from '../store/useStore';

export const NetworkLinkManager: React.FC<{ onSpeak: (text: string) => void }> = ({ onSpeak }) => {
  const { networkLinks, addNetworkLink, updateNetworkLink, deleteNetworkLink } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', url: '', description: '', id: '' });
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const resetForm = () => {
    setEditingId(null);
    setForm({ title: '', url: '', description: '', id: '' });
    setMsg(null);
  };

  const openEdit = (link: typeof networkLinks[0]) => {
    setEditingId(link.id);
    setForm({ title: link.title, url: link.url, description: link.description || '', id: link.id });
    setMsg(null);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.url.trim()) {
      setMsg({ type: 'error', text: 'Nama dan URL wajib diisi.' });
      return;
    }
    const id = editingId || form.id || `link-${Date.now()}`;
    const link = { id, title: form.title.trim(), url: form.url.trim(), description: form.description.trim(), sortOrder: networkLinks.length + 1, isActive: true };
    try {
      if (editingId) {
        await updateNetworkLink(link);
        onSpeak(`Jejaring ${form.title} diperbarui`);
      } else {
        await addNetworkLink(link);
        onSpeak(`Jejaring ${form.title} ditambahkan`);
      }
      resetForm();
      setMsg({ type: 'success', text: editingId ? 'Jejaring diperbarui.' : 'Jejaring ditambahkan.' });
    } catch { setMsg({ type: 'error', text: 'Gagal menyimpan.' }); }
  };

  const handleDelete = async (id: string, title: string) => {
    try {
      await deleteNetworkLink(id);
      onSpeak(`Jejaring ${title} dihapus`);
      setMsg({ type: 'success', text: `"${title}" dihapus.` });
    } catch { setMsg({ type: 'error', text: 'Gagal menghapus.' }); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {msg && (
        <div className={`p-3 rounded-xl flex items-center gap-2 text-xs font-medium ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
          <AlertCircle className="w-4 h-4 shrink-0" />{msg.text}
        </div>
      )}

      {/* Form */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-5 rounded-2xl shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          {editingId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {editingId ? 'Edit Jejaring' : 'Tambah Jejaring Baru'}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Nama *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Official Website DLH" className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 focus:outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">URL *</label>
            <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 focus:outline-none focus:border-emerald-500" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Deskripsi</label>
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi singkat (opsional)" className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 focus:outline-none focus:border-emerald-500" />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave} className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm">
            <Save className="w-3.5 h-3.5" /> {editingId ? 'Simpan' : 'Tambah'}
          </button>
          {editingId && (
            <button onClick={resetForm} className="px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-bold rounded-xl transition">Batal</button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Daftar Jejaring</h4>
          <span className="ml-auto text-[10px] font-mono text-stone-400">{networkLinks.length} link</span>
        </div>
        <div className="divide-y divide-stone-100 dark:divide-stone-800">
          <AnimatePresence>
            {networkLinks.length === 0 && (
              <p className="p-8 text-center text-xs text-stone-400">Belum ada jejaring. Tambahkan di atas.</p>
            )}
            {networkLinks.map((link) => (
              <motion.div
                key={link.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8, height: 0, marginBottom: 0, padding: 0, borderWidth: 0 }}
                transition={{ type: 'spring', duration: 0.3, bounce: 0.1 }}
                className="px-5 py-4 flex items-start justify-between gap-4 hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <h5 className="font-bold text-sm text-slate-800 dark:text-stone-100 truncate">{link.title}</h5>
                  </div>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-[11px] font-mono text-stone-500 hover:text-emerald-700 dark:hover:text-emerald-400 flex items-center gap-1 transition">
                    {link.url} <ExternalLink className="w-3 h-3" />
                  </a>
                  {link.description && (
                    <p className="text-[11px] text-stone-400 mt-1">{link.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEdit(link)} className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-700 transition"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(link.id, link.title)} className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-stone-700 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
