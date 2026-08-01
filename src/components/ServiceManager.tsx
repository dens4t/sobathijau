/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pencil, Trash2, Save, X, Package, AlertCircle, Plus, ChevronUp, ChevronDown, GripVertical, LayoutList } from 'lucide-react';
import { ServiceTemplate, FieldDefinition, FieldType } from '../types';

interface ServiceManagerProps {
  services: ServiceTemplate[];
  onUpdate: (updated: ServiceTemplate) => void;
  onDelete: (id: string) => void;
  onSpeak: (text: string) => void;
}

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Teks Singkat' },
  { value: 'number', label: 'Angka' },
  { value: 'date', label: 'Tanggal' },
  { value: 'textarea', label: 'Teks Panjang' },
  { value: 'select', label: 'Pilihan Tunggal (Select)' },
  { value: 'checkbox_group', label: 'Pilihan Banyak (Checkbox)' },
];

const CATEGORIES: ServiceTemplate['category'][] = [
  'Izin & Rekomendasi', 'Laboratorium', 'Kemitraan & Edukasi', 'Layanan Umum'
];

const ICONS = ['FileText','Droplet','Leaf','ShieldAlert','Flame','Settings','Briefcase'];

interface EditState {
  name: string;
  description: string;
  category: ServiceTemplate['category'];
  icon: string;
  fields: FieldDefinition[];
}

type EditMode = 'info' | 'fields' | null;

const emptyField = (): Omit<FieldDefinition,'id'> & { _label: string; _options: string } => ({
  _label: '', label: '', type: 'text', required: true, placeholder: '', _options: ''
});

export const ServiceManager: React.FC<ServiceManagerProps> = ({ services, onUpdate, onDelete, onSpeak }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [edit, setEdit] = useState<EditState | null>(null);
  const [newField, setNewField] = useState(emptyField());
  const [fieldErr, setFieldErr] = useState('');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const openModal = (s: ServiceTemplate, mode: EditMode) => {
    setEditingId(s.id);
    setEditMode(mode);
    setEdit({ name: s.name, description: s.description, category: s.category, icon: s.icon, fields: s.fields.map(f => ({ ...f })) });
    setNewField(emptyField());
    setFieldErr('');
    setMsg(null);
    onSpeak(mode === 'info' ? `Mengedit info layanan ${s.name}` : `Mengedit form dinamis layanan ${s.name}`);
  };

  const closeModal = () => { setEditingId(null); setEditMode(null); setEdit(null); setMsg(null); };

  const saveEdit = () => {
    if (!edit) return;
    if (!edit.name.trim() || !edit.description.trim()) {
      setMsg({ type: 'error', text: 'Nama dan deskripsi wajib diisi.' }); return;
    }
    const svc = services.find(s => s.id === editingId);
    if (!svc) return;
    onUpdate({ ...svc, name: edit.name.trim(), description: edit.description.trim(), category: edit.category, icon: edit.icon, fields: edit.fields });
    setMsg({ type: 'success', text: `Layanan "${edit.name}" berhasil diperbarui.` });
    closeModal();
    onSpeak(`Layanan ${edit.name} diperbarui`);
  };

  const saveFields = () => {
    if (!edit) return;
    const svc = services.find(s => s.id === editingId);
    if (!svc) return;
    onUpdate({ ...svc, fields: edit.fields });
    setMsg({ type: 'success', text: `Form dinamis "${svc.name}" berhasil diperbarui.` });
    closeModal();
    onSpeak(`Form dinamis ${svc.name} diperbarui`);
  };

  const updateField = (idx: number, patch: Partial<FieldDefinition>) =>
    setEdit(e => e ? { ...e, fields: e.fields.map((f, i) => i === idx ? { ...f, ...patch } : f) } : e);

  const removeField = (idx: number) =>
    setEdit(e => e ? { ...e, fields: e.fields.filter((_, i) => i !== idx) } : e);

  const moveField = (idx: number, dir: -1 | 1) => {
    if (!edit) return;
    const arr = [...edit.fields];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    setEdit({ ...edit, fields: arr });
  };

  const addNewField = () => {
    if (!edit) return;
    if (!newField._label.trim()) { setFieldErr('Label field wajib diisi.'); return; }
    const id = newField._label.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '_');
    if (edit.fields.some(f => f.id === id)) { setFieldErr('Field dengan nama serupa sudah ada.'); return; }
    const needsOpts = newField.type === 'select' || newField.type === 'checkbox_group';
    const opts = newField._options.split(',').map(o => o.trim()).filter(Boolean);
    if (needsOpts && opts.length === 0) { setFieldErr('Tipe ini butuh minimal satu opsi (pisahkan koma).'); return; }
    const field: FieldDefinition = {
      id, label: newField._label.trim(), type: newField.type, required: newField.required,
      placeholder: newField.placeholder || undefined, options: needsOpts ? opts : undefined
    };
    setEdit({ ...edit, fields: [...edit.fields, field] });
    setNewField(emptyField()); setFieldErr('');
  };

  const handleDelete = (s: ServiceTemplate) => {
    if (!window.confirm(`Hapus layanan "${s.name}"? Formulir ini tidak bisa diajukan lagi.`)) return;
    onDelete(s.id); onSpeak(`Layanan ${s.name} dihapus`);
  };

  const isOpen = editingId && edit && editMode;

  return (
    <>
      {/* ── Modal Edit Info ── */}
      {isOpen && editMode === 'info' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col border border-slate-200 dark:border-stone-700">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 dark:border-stone-800 shrink-0">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30">
                <Pencil className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Edit Info Layanan</h4>
                <p className="text-[11px] text-slate-500 dark:text-stone-400 truncate">{edit.name}</p>
              </div>
              <button onClick={closeModal} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-stone-800 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Nama Layanan</label>
                  <input
                    value={edit.name}
                    onChange={e => setEdit({ ...edit, name: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-stone-700 bg-slate-50 dark:bg-stone-850 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Kategori</label>
                  <select
                    value={edit.category}
                    onChange={e => setEdit({ ...edit, category: e.target.value as ServiceTemplate['category'] })}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-stone-700 bg-slate-50 dark:bg-stone-850 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Deskripsi</label>
                  <input
                    value={edit.description}
                    onChange={e => setEdit({ ...edit, description: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-stone-700 bg-slate-50 dark:bg-stone-850 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Ikon Layanan</label>
                  <select
                    value={edit.icon}
                    onChange={e => setEdit({ ...edit, icon: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-stone-700 bg-slate-50 dark:bg-stone-850 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  >
                    {ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-stone-800 flex items-center gap-3 shrink-0 bg-slate-50 dark:bg-stone-900 rounded-b-2xl">
              <button onClick={saveEdit} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-xl transition shadow-sm">
                <Save className="w-4 h-4" /> Simpan
              </button>
              <button onClick={closeModal} className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-stone-800 hover:bg-slate-100 dark:hover:bg-stone-700 border border-slate-200 dark:border-stone-700 text-slate-700 dark:text-stone-300 text-sm font-semibold rounded-xl transition">
                <X className="w-4 h-4" /> Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Edit Form Dinamis ── */}
      {isOpen && editMode === 'fields' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col border border-indigo-200 dark:border-indigo-900">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-indigo-100 dark:border-indigo-900/60 shrink-0 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-t-2xl">
              <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/40">
                <LayoutList className="w-4 h-4 text-indigo-700 dark:text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Edit Form Dinamis</h4>
                <p className="text-[11px] text-slate-500 dark:text-stone-400 truncate">{edit.name}</p>
              </div>
              <span className="text-[10px] font-mono text-indigo-500 bg-indigo-100 dark:bg-indigo-900/40 px-2 py-0.5 rounded-full mr-1">
                {edit.fields.length} field
              </span>
              <button onClick={closeModal} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white dark:hover:bg-stone-800 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              {/* Daftar field */}
              <div className="space-y-2.5">
                {edit.fields.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-6">Belum ada field. Tambahkan di bawah.</p>
                )}
                <AnimatePresence>
                  {edit.fields.map((f, idx) => (
                    <motion.div
                      key={f.id}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8, height: 0, marginBottom: 0, padding: 0, borderWidth: 0 }}
                      transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
                      className="bg-slate-50 dark:bg-stone-800/60 rounded-xl border border-slate-200 dark:border-stone-700 p-4 space-y-3"
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Label</label>
                          <input
                            value={f.label}
                            onChange={e => updateField(idx, { label: e.target.value })}
                            className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-900 focus:outline-none focus:border-indigo-400 transition"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Tipe</label>
                          <select
                            value={f.type}
                            onChange={e => updateField(idx, { type: e.target.value as FieldType })}
                            className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-900 focus:outline-none focus:border-indigo-400 transition"
                          >
                            {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Wajib?</label>
                          <select
                            value={f.required ? 'ya' : 'tidak'}
                            onChange={e => updateField(idx, { required: e.target.value === 'ya' })}
                            className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-900 focus:outline-none focus:border-indigo-400 transition"
                          >
                            <option value="ya">Ya</option>
                            <option value="tidak">Tidak</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Placeholder</label>
                          <input
                            value={f.placeholder || ''}
                            onChange={e => updateField(idx, { placeholder: e.target.value || undefined })}
                            className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-900 focus:outline-none focus:border-indigo-400 transition"
                          />
                        </div>
                        {(f.type === 'select' || f.type === 'checkbox_group') && (
                          <div>
                            <label className="block text-[10px] font-semibold text-amber-500 uppercase tracking-wide mb-1">Opsi (pisah koma)</label>
                            <input
                              value={f.options?.join(', ') || ''}
                              onChange={e => updateField(idx, { options: e.target.value.split(',').map(o => o.trim()).filter(Boolean) })}
                              className="w-full px-2.5 py-2 text-xs rounded-lg border border-amber-200 dark:border-stone-700 bg-amber-50/50 dark:bg-stone-900 focus:outline-none focus:border-amber-400 transition"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200 dark:border-stone-700">
                        <button onClick={() => moveField(idx, -1)} disabled={idx === 0} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-stone-700 disabled:opacity-30 transition">
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => moveField(idx, 1)} disabled={idx === edit.fields.length - 1} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-stone-700 disabled:opacity-30 transition">
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[9px] font-mono text-slate-400 ml-1">ID: {f.id}</span>
                        <button onClick={() => removeField(idx)} className="ml-auto p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-stone-700 transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Tambah Field Baru */}
              <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-dashed border-indigo-200 dark:border-indigo-800 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Tambah Field Baru
                </p>
                {fieldErr && <p className="text-[11px] text-rose-600 font-medium">{fieldErr}</p>}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Label *</label>
                    <input
                      value={newField._label}
                      onChange={e => setNewField({ ...newField, _label: e.target.value })}
                      placeholder="Contoh: Nama Pemohon"
                      className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-900 focus:outline-none focus:border-indigo-400 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Tipe</label>
                    <select
                      value={newField.type}
                      onChange={e => setNewField({ ...newField, type: e.target.value as FieldType })}
                      className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-900 focus:outline-none focus:border-indigo-400 transition"
                    >
                      {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Wajib?</label>
                    <select
                      value={newField.required ? 'ya' : 'tidak'}
                      onChange={e => setNewField({ ...newField, required: e.target.value === 'ya' })}
                      className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-900 focus:outline-none focus:border-indigo-400 transition"
                    >
                      <option value="ya">Ya</option>
                      <option value="tidak">Tidak</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Placeholder</label>
                    <input
                      value={newField.placeholder}
                      onChange={e => setNewField({ ...newField, placeholder: e.target.value })}
                      className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-900 focus:outline-none focus:border-indigo-400 transition"
                    />
                  </div>
                  {(newField.type === 'select' || newField.type === 'checkbox_group') && (
                    <div>
                      <label className="block text-[10px] font-semibold text-amber-500 uppercase tracking-wide mb-1">Opsi (pisah koma) *</label>
                      <input
                        value={newField._options}
                        onChange={e => setNewField({ ...newField, _options: e.target.value })}
                        placeholder="Opsi A, Opsi B, Opsi C"
                        className="w-full px-2.5 py-2 text-xs rounded-lg border border-amber-300 dark:border-stone-700 bg-amber-50/50 dark:bg-stone-900 focus:outline-none focus:border-amber-400 transition"
                      />
                    </div>
                  )}
                </div>
                <button
                  onClick={addNewField}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold rounded-lg transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Field
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-stone-800 flex items-center gap-3 shrink-0 bg-slate-50 dark:bg-stone-900 rounded-b-2xl">
              <button onClick={saveFields} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-semibold rounded-xl transition shadow-sm">
                <Save className="w-4 h-4" /> Simpan Form
              </button>
              <button onClick={closeModal} className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-stone-800 hover:bg-slate-100 dark:hover:bg-stone-700 border border-slate-200 dark:border-stone-700 text-slate-700 dark:text-stone-300 text-sm font-semibold rounded-xl transition">
                <X className="w-4 h-4" /> Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {msg && (
        <div className={`p-3 rounded-lg flex items-center gap-2 text-xs ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
          <AlertCircle className="w-4 h-4 shrink-0" />{msg.text}
        </div>
      )}

      {/* Service List */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-slate-200 dark:border-stone-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-stone-800 flex items-center gap-2">
          <Package className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Kelola Layanan</h4>
          <span className="ml-auto text-[10px] font-mono text-slate-400">{services.length} layanan</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-stone-800">
          {services.map(svc => (
            <div key={svc.id} className="px-6 py-4 flex items-start justify-between gap-4 hover:bg-slate-50 dark:hover:bg-stone-800/50 transition">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h5 className="font-semibold text-slate-800 dark:text-stone-100 text-sm">{svc.name}</h5>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-stone-800 text-slate-500 dark:text-stone-400">{svc.category}</span>
                  {svc.isCustom && <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">CUSTOM</span>}
                </div>
                <p className="text-xs text-slate-500 dark:text-stone-400 line-clamp-1 mb-2">{svc.description}</p>
                <div className="flex flex-wrap gap-1">
                  {svc.fields.map(f => (
                    <span key={f.id} className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-slate-200 dark:border-stone-700 text-slate-500 dark:text-stone-400">
                      {f.label}{f.required ? '*' : ''}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => openModal(svc, 'info')}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 dark:bg-stone-800 text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition"
                  title="Edit Info"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openModal(svc, 'fields')}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 dark:bg-stone-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                  title="Edit Form Dinamis"
                >
                  <LayoutList className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(svc)}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 dark:bg-stone-800 text-slate-500 hover:text-rose-600 transition"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
