import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { Layers, Plus, Pencil, Trash2, X, Check, GripVertical } from 'lucide-react';
import type { GeoCategory } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface CategoryManagerProps {
  categories: GeoCategory[];
  onAdd: (cat: GeoCategory) => Promise<void>;
  onUpdate: (cat: GeoCategory) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  addToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const ICON_OPTIONS = ['Trash2', 'Landfill', 'Recycle', 'TreePine', 'Droplets', 'Leaf', 'Flower2', 'Sprout', 'MapPin', 'Warehouse', 'Building2', 'Factory', 'Shield', 'Cctv', 'Siren', 'Hospital', 'School', 'ParkingCircle', 'Bus', 'Train'];

const COLOR_OPTIONS = [
  { label: 'Merah TPS', value: '#DC2626' },
  { label: 'Merah TPA', value: '#B91C1C' },
  { label: 'Hijau', value: '#16A34A' },
  { label: 'Hijau Tua', value: '#15803D' },
  { label: 'Biru', value: '#2563EB' },
  { label: 'Kuning', value: '#CA8A04' },
  { label: 'Ungu', value: '#9333EA' },
  { label: 'Oranye', value: '#EA580C' },
  { label: 'Pink', value: '#DB2777' },
  { label: 'Coklat', value: '#92400E' },
];

const emptyCat = (): Partial<GeoCategory> => ({
  name: '', description: '', shortDesc: '',
  iconName: 'MapPin', color: '#16A34A', markerColor: '#16A34A',
  order: 99,
});

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories, onAdd, onUpdate, onDelete, addToast,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<GeoCategory>>(emptyCat());
  const [isFormOpen, setIsFormOpen] = useState(false);

  const sorted = [...categories].sort((a, b) => a.order - b.order);

  const resetForm = () => {
    setFormData(emptyCat());
    setEditingId(null);
    setIsFormOpen(false);
  };

  const openEdit = (cat: GeoCategory) => {
    setFormData({ ...cat });
    setEditingId(cat.id);
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      addToast('Nama kategori wajib diisi.', 'error');
      return;
    }
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    if (editingId) {
      const updated: GeoCategory = {
        id: editingId, name: formData.name!, description: formData.description || '', shortDesc: formData.shortDesc || '',
        iconName: formData.iconName || 'MapPin', color: formData.color || '#16A34A', markerColor: formData.markerColor || formData.color || '#16A34A',
        order: formData.order ?? categories.length,
        createdAt: categories.find(c => c.id === editingId)?.createdAt || now,
        updatedAt: now,
      };
      await onUpdate(updated);
      addToast(`Kategori "${updated.name}" diperbarui.`, 'success');
    } else {
      const newCat: GeoCategory = {
        id: `cat-${Date.now().toString(36)}`, name: formData.name!, description: formData.description || '', shortDesc: formData.shortDesc || '',
        iconName: formData.iconName || 'MapPin', color: formData.color || '#16A34A', markerColor: formData.markerColor || formData.color || '#16A34A',
        order: categories.length,
        createdAt: now, updatedAt: now,
      };
      await onAdd(newCat);
      addToast(`Kategori "${newCat.name}" ditambahkan.`, 'success');
    }
    resetForm();
  };

  const handleDelete = async (cat: GeoCategory) => {
    if (window.confirm(`Hapus kategori "${cat.name}"? Titik lokasi dengan kategori ini tidak akan terhapus, tapi kategorinya akan hilang.`)) {
      await onDelete(cat.id);
      addToast(`Kategori "${cat.name}" dihapus.`, 'info');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-extrabold text-[#1B4332]">Kelola Kategori Peta ({categories.length})</h3>
        </div>
        <button
          onClick={() => { resetForm(); setIsFormOpen(true); }}
          className="px-4 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> Tambah Kategori
        </button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white border border-emerald-100 rounded-2xl p-5 space-y-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-[#1B4332]">
                  {editingId ? '✏️ Edit Kategori' : '➕ Kategori Baru'}
                </h4>
                <button onClick={resetForm} className="p-1.5 rounded-lg hover:bg-slate-100 transition">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Nama Kategori *</label>
                    <input type="text" value={formData.name || ''} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      placeholder="Contoh: Taman & Ruang Hijau" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Deskripsi Singkat</label>
                    <input type="text" value={formData.shortDesc || ''} onChange={e => setFormData(f => ({ ...f, shortDesc: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      placeholder="Paru-paru kota dan ruang terbuka hijau publik" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Deskripsi Lengkap (HTML)</label>
                    <textarea value={formData.description || ''} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                      rows={6}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 font-mono"
                      placeholder="<div class='space-y-3'><p>Deskripsi lengkap...</p></div>" />
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Icon Grid */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-2">Ikon</label>
                    <div className="grid grid-cols-8 gap-1.5">
                      {ICON_OPTIONS.map(name => {
                        const IconComp = (Icons as any)[name];
                        if (!IconComp) return null;
                        return (
                          <button key={name} type="button" onClick={() => setFormData(f => ({ ...f, iconName: name }))}
                            className={`p-2 rounded-lg border transition-all flex items-center justify-center ${formData.iconName === name ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200' : 'border-slate-200 hover:border-slate-300'}`}>
                            <IconComp className={`w-4 h-4 ${formData.iconName === name ? 'text-emerald-600' : 'text-slate-500'}`} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Color Picker */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-2">Warna Marker</label>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_OPTIONS.map(c => (
                        <button key={c.value} type="button" onClick={() => setFormData(f => ({ ...f, color: c.value, markerColor: c.value }))}
                          title={c.label}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${formData.color === c.value ? 'border-slate-800 ring-2 ring-slate-300 scale-110' : 'border-transparent hover:scale-105'}`}
                          style={{ backgroundColor: c.value }}>
                          {formData.color === c.value && <X className="w-3 h-3 text-white mx-auto" strokeWidth={3} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <label className="text-[11px] font-bold text-slate-500 mb-2 block">Preview</label>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-md" style={{ backgroundColor: formData.color || '#16A34A' }}>
                        {(() => { const Ic = (Icons as any)[formData.iconName || 'MapPin']; return Ic ? <Ic className="w-5 h-5 text-white" /> : null; })()}
                      </div>
                      <div className="text-xs">
                        <p className="font-bold text-slate-700">{formData.name || 'Nama Kategori'}</p>
                        <p className="text-slate-400 text-[10px]">{formData.shortDesc || 'Deskripsi singkat'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Rich Description */}
              {formData.description && (
                <div className="border border-slate-200 rounded-xl p-4">
                  <label className="text-[11px] font-bold text-slate-500 block mb-2">📝 Pratinjau Deskripsi</label>
                  <div className="text-slate-700 text-xs [&_strong]:text-emerald-700 [&_em]:text-slate-500"
                    dangerouslySetInnerHTML={{ __html: formData.description }} />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button onClick={resetForm} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition">Batal</button>
                <button onClick={handleSave}
                  className="px-5 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> {editingId ? 'Simpan' : 'Tambah Kategori'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category List */}
      <div className="space-y-2">
        {sorted.map(cat => {
          const IconComp = (Icons as any)[cat.iconName] || Icons.MapPin;
          return (
            <motion.div key={cat.id} layout
              className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition"
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: cat.markerColor }}>
                <IconComp className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">{cat.name}</span>
                  <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono">Urutan {cat.order}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{cat.shortDesc}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition" title="Edit">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(cat)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition" title="Hapus">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
