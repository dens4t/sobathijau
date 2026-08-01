/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Trash2, Save, Eye, AlertCircle,
  ChevronUp, ChevronDown, Type, Hash,
  CalendarDays, List, ListChecks, AlignLeft, ShieldCheck,
  FileText, Droplet, Leaf, Flame, Briefcase, Wrench,
  LayoutTemplate, ArrowLeft
} from 'lucide-react';
import { ServiceTemplate, FieldDefinition, FieldType } from '../types';

interface FormCreatorProps {
  onSave: (newService: ServiceTemplate) => void;
  onSpeak: (text: string) => void;
}

const CATEGORIES: { value: ServiceTemplate['category']; label: string }[] = [
  { value: 'Izin & Rekomendasi', label: 'Izin & Rekomendasi' },
  { value: 'Laboratorium', label: 'Laboratorium' },
  { value: 'Kemitraan & Edukasi', label: 'Kemitraan & Edukasi' },
  { value: 'Layanan Umum', label: 'Layanan Umum' },
];

const ICONS = [
  { value: 'FileText', label: 'Dokumen', Icon: FileText },
  { value: 'Droplet', label: 'Cairan/Air', Icon: Droplet },
  { value: 'Leaf', label: 'Tanaman', Icon: Leaf },
  { value: 'ShieldAlert', label: 'Aduan', Icon: ShieldCheck },
  { value: 'Flame', label: 'Energi/Asap', Icon: Flame },
  { value: 'Briefcase', label: 'Perusahaan', Icon: Briefcase },
  { value: 'Wrench', label: 'Utilitas', Icon: Wrench },
];

const FIELD_TYPES: { value: FieldType; label: string; icon: React.FC<{ className: string }> }[] = [
  { value: 'text', label: 'Teks Singkat', icon: Type },
  { value: 'number', label: 'Angka', icon: Hash },
  { value: 'date', label: 'Tanggal', icon: CalendarDays },
  { value: 'textarea', label: 'Teks Panjang', icon: AlignLeft },
  { value: 'select', label: 'Dropdown Pilihan', icon: List },
  { value: 'checkbox_group', label: 'Centang Banyak', icon: ListChecks },
];

export const FormCreator: React.FC<FormCreatorProps> = ({ onSave, onSpeak }) => {
  // Step management: 0 = meta, 1 = fields
  const [step, setStep] = useState<'meta' | 'fields'>('meta');

  // Meta
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ServiceTemplate['category']>('Izin & Rekomendasi');
  const [icon, setIcon] = useState('FileText');

  // Fields
  const [fields, setFields] = useState<FieldDefinition[]>([
    { id: 'nama_pemohon', label: 'Nama Lengkap Pemohon', type: 'text', required: true, placeholder: 'Masukkan nama lengkap' },
    { id: 'kontak_pemohon', label: 'Nomor WhatsApp', type: 'text', required: true, placeholder: 'Contoh: 0812XXXXXXXX' },
  ]);

  // New field form
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState<FieldType>('text');
  const [newRequired, setNewRequired] = useState(true);
  const [newPlaceholder, setNewPlaceholder] = useState('');
  const [newOptions, setNewOptions] = useState('');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const moveField = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= fields.length) return;
    const arr = [...fields];
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    setFields(arr);
  };

  const removeField = (idx: number) => {
    setFields(fields.filter((_, i) => i !== idx));
    onSpeak(`Field ${fields[idx].label} dihapus`);
  };

  const addField = () => {
    if (!newLabel.trim()) {
      setMessage({ type: 'error', text: 'Label wajib diisi.' });
      return;
    }
    const id = newLabel.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '_');
    if (fields.some(f => f.id === id)) {
      setMessage({ type: 'error', text: 'Nama field sudah ada.' });
      return;
    }
    const needsOpts = newType === 'select' || newType === 'checkbox_group';
    const opts = newOptions.split(',').map(o => o.trim()).filter(Boolean);
    if (needsOpts && opts.length === 0) {
      setMessage({ type: 'error', text: 'Tipe pilihan butuh minimal satu opsi (pisah koma).' });
      return;
    }
    const field: FieldDefinition = {
      id, label: newLabel.trim(), type: newType, required: newRequired,
      placeholder: newPlaceholder || undefined,
      options: needsOpts ? opts : undefined,
    };
    setFields([...fields, field]);
    setNewLabel(''); setNewPlaceholder(''); setNewOptions('');
    setMessage(null);
    onSpeak(`Field ${newLabel} ditambahkan`);
  };

  const handleSave = () => {
    if (!name.trim()) { setMessage({ type: 'error', text: 'Nama layanan wajib diisi.' }); return; }
    if (!description.trim()) { setMessage({ type: 'error', text: 'Deskripsi wajib diisi.' }); return; }
    if (fields.length === 0) { setMessage({ type: 'error', text: 'Minimal satu field.' }); return; }

    const id = 'custom-' + name.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '-');
    onSave({ id, name, description, category, icon, fields, isCustom: true });
    setMessage({ type: 'success', text: `"${name}" berhasil diterbitkan!` });
    setName(''); setDescription(''); setCategory('Izin & Rekomendasi'); setIcon('FileText');
    setFields([
      { id: 'nama_pemohon', label: 'Nama Lengkap Pemohon', type: 'text', required: true, placeholder: 'Masukkan nama lengkap' },
      { id: 'kontak_pemohon', label: 'Nomor WhatsApp', type: 'text', required: true, placeholder: 'Contoh: 0812XXXXXXXX' },
    ]);
    setStep('meta');
    onSpeak(`Layanan ${name} berhasil diterbitkan`);
  };

  const canProceed = name.trim() && description.trim();

  return (
    <div className="max-w-5xl mx-auto" id="form-creator-container">
      {/* ── Step indicator ── */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => setStep('meta')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            step === 'meta'
              ? 'bg-[#1B4332] text-white shadow-md'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">1</span>
          Info Layanan
        </button>
        <span className="text-stone-300 dark:text-stone-600">→</span>
        <button
          onClick={() => canProceed && setStep('fields')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            step === 'fields'
              ? 'bg-[#1B4332] text-white shadow-md'
              : canProceed
              ? 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              : 'bg-stone-50 dark:bg-stone-900 text-stone-300 dark:text-stone-600 cursor-not-allowed'
          }`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${canProceed ? 'bg-white/20' : 'bg-stone-200 dark:bg-stone-700'}`}>2</span>
          Atur Field
        </button>
        <div className="ml-auto text-[10px] font-mono text-stone-400">
          {fields.length} field
        </div>
      </div>

      {/* ── Notification ── */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-6 p-4 rounded-xl flex items-center gap-2.5 text-sm font-medium ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800'
            }`}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── LEFT: Form area ── */}
        <div className="lg:col-span-3 space-y-6">
          <AnimatePresence mode="wait">
            {step === 'meta' ? (
              <motion.div
                key="meta"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 rounded-2xl shadow-sm space-y-5"
              >
                <div className="flex items-center gap-3 pb-4 border-b border-stone-100 dark:border-stone-800">
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
                    <LayoutTemplate className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Informasi Dasar Layanan</h3>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">Isi detail layanan yang akan tampil di halaman publik.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 dark:text-stone-300 mb-1.5">
                    Nama Layanan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Contoh: Izin Usaha Mikro Pengolahan Limbah"
                    className="w-full px-4 py-3 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition placeholder:text-stone-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-600 dark:text-stone-300 mb-1.5">
                      Kategori <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value as ServiceTemplate['category'])}
                      className="w-full px-4 py-3 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                    >
                      {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-600 dark:text-stone-300 mb-1.5">Ikon</label>
                    <div className="relative">
                      <select
                        value={icon}
                        onChange={e => setIcon(e.target.value)}
                        className="w-full px-4 py-3 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition appearance-none"
                      >
                        {ICONS.map(ic => <option key={ic.value} value={ic.value}>{ic.label}</option>)}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-600">
                        {React.createElement(ICONS.find(i => i.value === icon)?.Icon || FileText, { className: 'w-4 h-4' })}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 dark:text-stone-300 mb-1.5">
                    Deskripsi Singkat <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Jelaskan secara singkat tujuan dan cakupan layanan ini..."
                    className="w-full px-4 py-3 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition placeholder:text-stone-300 resize-none"
                  />
                </div>

                <button
                  onClick={() => { if (canProceed) { setStep('fields'); onSpeak('Lanjut ke pengaturan field'); } else setMessage({ type: 'error', text: 'Nama dan deskripsi wajib diisi.' }); }}
                  className="w-full py-3.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
                >
                  Lanjut ke Atur Field <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="fields"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 rounded-2xl shadow-sm space-y-5"
              >
                <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setStep('meta')}
                      className="p-2 rounded-xl text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Atur Field Formulir</h3>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate max-w-[280px]">{name}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-full">{fields.length} field</span>
                </div>

                {/* Existing fields with reorder animation */}
                <div className="space-y-2">
                  <AnimatePresence>
                    {fields.map((f, idx) => (
                      <motion.div
                        key={f.id}
                        layout
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8, height: 0, marginBottom: 0, padding: 0, borderWidth: 0 }}
                        transition={{ type: 'spring', duration: 0.3, bounce: 0.1 }}
                        className="flex items-center gap-3 p-3.5 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-700"
                      >
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => moveField(idx, -1)}
                            disabled={idx === 0}
                            className="p-0.5 text-stone-400 hover:text-stone-600 disabled:opacity-20 transition"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveField(idx, 1)}
                            disabled={idx === fields.length - 1}
                            className="p-0.5 text-stone-400 hover:text-stone-600 disabled:opacity-20 transition"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-700 dark:text-stone-200 truncate">{f.label}</span>
                            {f.required && <span className="text-rose-400 text-[10px] font-bold">*</span>}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] font-mono text-stone-400">{f.id}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-stone-700 text-emerald-700 dark:text-emerald-400 font-medium">
                              {FIELD_TYPES.find(t => t.value === f.type)?.label || f.type}
                            </span>
                          </div>
                        </div>
                        {idx > 1 ? (
                          <button onClick={() => removeField(idx)} className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 dark:hover:bg-stone-700 transition shrink-0">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-[9px] text-stone-300 dark:text-stone-600 font-mono shrink-0">default</span>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Add field form */}
                <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-dashed border-emerald-200 dark:border-emerald-800 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> Tambah Field
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-3 sm:col-span-2">
                      <input
                        value={newLabel}
                        onChange={e => setNewLabel(e.target.value)}
                        placeholder="Label field..."
                        className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 focus:outline-none focus:border-emerald-400 transition"
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addField(); } }}
                      />
                    </div>
                    <div className="col-span-1">
                      <select
                        value={newType}
                        onChange={e => setNewType(e.target.value as FieldType)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 focus:outline-none focus:border-emerald-400 transition"
                      >
                        {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                  </div>
                  {(newType === 'select' || newType === 'checkbox_group') && (
                    <div>
                      <input
                        value={newOptions}
                        onChange={e => setNewOptions(e.target.value)}
                        placeholder="Opsi: A, B, C (pisah koma)"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-amber-200 dark:border-stone-700 bg-amber-50/30 dark:bg-stone-900 focus:outline-none focus:border-amber-400 transition"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <input
                      value={newPlaceholder}
                      onChange={e => setNewPlaceholder(e.target.value)}
                      placeholder="Placeholder (opsional)"
                      className="flex-1 px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 focus:outline-none focus:border-emerald-400 transition"
                    />
                    <label className="flex items-center gap-1.5 text-[10px] font-medium text-stone-500">
                      <input type="checkbox" checked={newRequired} onChange={e => setNewRequired(e.target.checked)} className="rounded" />
                      Wajib
                    </label>
                    <button
                      onClick={addField}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  className="w-full py-3.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  Terbitkan Layanan
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── RIGHT: Live preview ── */}
        <div className="lg:col-span-2 lg:sticky lg:top-24 h-fit">
          <div className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-inner">
            <div className="px-5 py-3 border-b border-stone-200 dark:border-stone-800 flex items-center gap-2 bg-white/50 dark:bg-stone-900/50">
              <Eye className="w-4 h-4 text-stone-400" />
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Pratinjau Warga</span>
              <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="p-5">
              <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-100 dark:border-stone-800 p-5 shadow-sm">
                {/* Header */}
                <div className="text-center mb-5 pb-4 border-b border-dashed border-stone-200 dark:border-stone-700">
                  <div className="mb-2 flex justify-center">
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
                      {React.createElement(ICONS.find(i => i.value === icon)?.Icon || FileText, { className: 'w-6 h-6 text-emerald-700 dark:text-emerald-400' })}
                    </div>
                  </div>
                  <h2 className="text-sm font-black text-slate-800 dark:text-stone-100">
                    {name || 'Nama Layanan'}
                  </h2>
                  <p className="text-[10px] text-stone-400 mt-1.5 italic max-w-[260px] mx-auto">
                    {description || 'Deskripsi layanan akan muncul di sini...'}
                  </p>
                  {category && (
                    <span className="inline-block mt-2 text-[9px] font-mono px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500">
                      {category}
                    </span>
                  )}
                </div>

                {/* Fields preview */}
                <div className="space-y-3.5">
                  {fields.map(f => (
                    <div key={f.id}>
                      <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300 mb-1">
                        {f.label}{f.required && <span className="text-rose-500 ml-0.5">*</span>}
                      </label>
                      {f.type === 'textarea' ? (
                        <textarea rows={2} readOnly className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-xs text-stone-300 resize-none" placeholder={f.placeholder || '...'} />
                      ) : f.type === 'select' || f.type === 'checkbox_group' ? (
                        <div className="px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950">
                          {f.type === 'select' ? (
                            <select className="w-full text-xs text-stone-400 bg-transparent"><option>{f.placeholder || 'Pilih...'}</option></select>
                          ) : (
                            (f.options || []).map((o, i) => (
                              <label key={i} className="flex items-center gap-2 text-[11px] text-stone-500 py-0.5">
                                <input type="checkbox" readOnly className="rounded opacity-50" />{o}
                              </label>
                            ))
                          )}
                        </div>
                      ) : (
                        <input type="text" readOnly className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-xs text-stone-300" placeholder={f.placeholder || '...'} />
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-4 mt-4 border-t border-dashed border-stone-200 dark:border-stone-700 flex justify-end">
                  <span className="px-5 py-2 bg-emerald-700/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-lg">
                    Kirim Permohonan
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
