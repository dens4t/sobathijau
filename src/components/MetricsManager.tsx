import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gauge, Save, X, Pencil, TrendingUp, AlertCircle } from 'lucide-react';
import { CarouselSlide, SiteMetric } from '../types';

interface MetricsManagerProps {
  siteMetrics: SiteMetric[];
  carouselSlides: CarouselSlide[];
  onUpdateMetric: (key: string, value: string, label: string) => Promise<void>;
  onUpdateSlide: (slide: CarouselSlide) => Promise<void>;
  addToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const MetricsManager: React.FC<MetricsManagerProps> = ({
  siteMetrics, carouselSlides, onUpdateMetric, onUpdateSlide, addToast,
}) => {
  const [metricDraft, setMetricDraft] = useState<Record<string, { value: string; label: string }>>({});
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null);

  const saveMetric = async (m: SiteMetric) => {
    const d = metricDraft[m.key] || { value: m.value, label: m.label };
    if (!d.value.trim()) { addToast('Nilai metrik wajib diisi.', 'error'); return; }
    try {
      await onUpdateMetric(m.key, d.value.trim(), d.label.trim() || m.label);
      setMetricDraft(prev => { const next = { ...prev }; delete next[m.key]; return next; });
      addToast(`Metrik "${m.key.toUpperCase()}" diperbarui.`, 'success');
    } catch {
      addToast('Gagal menyimpan metrik. Cek koneksi.', 'error');
    }
  };

  const saveSlide = async () => {
    if (!editingSlide) return;
    if (!editingSlide.metric.trim() || !editingSlide.metricLabel.trim() || !editingSlide.title.trim()) {
      addToast('Metrik, label metrik, dan judul wajib diisi.', 'error');
      return;
    }
    try {
      await onUpdateSlide(editingSlide);
      addToast(`Slide "${editingSlide.tag}" diperbarui.`, 'success');
      setEditingSlide(null);
    } catch {
      addToast('Gagal menyimpan slide. Cek koneksi.', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <p className="text-[11px] text-slate-500 bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 leading-relaxed">
        Nilai metrik di halaman beranda (indeks kualitas lingkungan & sorotan carousel) kini dapat diperbarui
        langsung dari sini dan tersimpan di database.
      </p>

      {/* Metrik umum (IKLH dll) */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-slate-200 dark:border-stone-800 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-stone-800 flex items-center gap-2">
          <Gauge className="w-4 h-4 text-emerald-600" />
          <h4 className="text-xs font-extrabold text-[#1B4332] dark:text-emerald-400 uppercase tracking-wide">Metrik Indeks (IKLH & lainnya)</h4>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-stone-800">
          {siteMetrics.length === 0 && <p className="p-6 text-center text-xs text-slate-400">Belum ada metrik.</p>}
          {siteMetrics.map(m => {
            const d = metricDraft[m.key] || { value: m.value, label: m.label };
            return (
              <div key={m.key} className="px-5 py-4 flex flex-col sm:flex-row sm:items-end gap-3">
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">{m.key}</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Nilai</label>
                      <input
                        value={d.value}
                        onChange={e => setMetricDraft(prev => ({ ...prev, [m.key]: { ...d, value: e.target.value } }))}
                        className="w-full sm:w-36 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 font-mono"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Label</label>
                      <input
                        value={d.label}
                        onChange={e => setMetricDraft(prev => ({ ...prev, [m.key]: { ...d, label: e.target.value } }))}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => saveMetric(m)}
                  className="px-4 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shrink-0"
                >
                  <Save className="w-3.5 h-3.5" /> Simpan
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slide carousel */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-slate-200 dark:border-stone-800 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-stone-800 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <h4 className="text-xs font-extrabold text-[#1B4332] dark:text-emerald-400 uppercase tracking-wide">Sorotan Carousel ({carouselSlides.length})</h4>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-stone-800">
          {carouselSlides.length === 0 && <p className="p-6 text-center text-xs text-slate-400">Belum ada slide.</p>}
          {carouselSlides.map(s => (
            <div key={s.id} className="px-5 py-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 uppercase tracking-wider font-mono">{s.tag}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{s.id}</span>
                </div>
                <p className="text-xs font-bold text-slate-800 truncate">{s.title}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  <span className="font-mono font-bold text-emerald-700">{s.metric}</span> — {s.metricLabel}
                </p>
              </div>
              <button
                onClick={() => setEditingSlide({ ...s })}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition shrink-0"
                title="Edit"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal edit slide */}
      <AnimatePresence>
        {editingSlide && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEditingSlide(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, y: 14, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 14, opacity: 0 }}
              className="relative z-10 bg-white dark:bg-stone-900 rounded-2xl border border-slate-200 dark:border-stone-700 shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 dark:border-stone-800 flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-[#1B4332] dark:text-white">Edit Slide — {editingSlide.id}</h4>
                <button onClick={() => setEditingSlide(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Tag</label>
                    <input value={editingSlide.tag} onChange={e => setEditingSlide({ ...editingSlide, tag: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Ikon</label>
                    <input value={editingSlide.icon} onChange={e => setEditingSlide({ ...editingSlide, icon: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 font-mono" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Judul</label>
                  <input value={editingSlide.title} onChange={e => setEditingSlide({ ...editingSlide, title: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Subjudul</label>
                  <textarea value={editingSlide.subtitle} onChange={e => setEditingSlide({ ...editingSlide, subtitle: e.target.value })} rows={2}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-emerald-700 block mb-1">Nilai Metrik *</label>
                    <input value={editingSlide.metric} onChange={e => setEditingSlide({ ...editingSlide, metric: e.target.value })}
                      placeholder="Contoh: 65.69"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 font-mono" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-emerald-700 block mb-1">Label Metrik *</label>
                    <input value={editingSlide.metricLabel} onChange={e => setEditingSlide({ ...editingSlide, metricLabel: e.target.value })}
                      placeholder="Contoh: Indeks Kualitas Air"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Poin (satu per baris)</label>
                  <textarea
                    value={editingSlide.bulletPoints.join('\n')}
                    onChange={e => setEditingSlide({ ...editingSlide, bulletPoints: e.target.value.split('\n').map(x => x.trim()).filter(Boolean) })}
                    rows={4}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 resize-none"
                  />
                </div>
                <div className="flex items-start gap-2 text-[10px] text-slate-400 bg-slate-50 rounded-xl p-2.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>Warna latar & urutan slide dikelola lewat data awal; fokus halaman ini pada nilai metrik & teks.</span>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 dark:border-stone-800 flex gap-2 justify-end">
                <button onClick={() => setEditingSlide(null)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition">Batal</button>
                <button onClick={saveSlide} className="px-5 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5">
                  <Save className="w-3.5 h-3.5" /> Simpan Slide
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
