import React, { useState, useRef } from 'react';
import * as Icons from 'lucide-react';
import { MapPin, Plus, Pencil, Trash2, X, Check, Search, Crosshair, MousePointerClick, Download, FileText, Map as MapIcon, FileSpreadsheet, FileType2, Printer } from 'lucide-react';
import type { GeoCategory, GeoLocation } from '../types';
import { EnvironmentalMap } from './EnvironmentalMap';
import { IconPicker } from './IconPicker';
import { motion, AnimatePresence } from 'motion/react';
import { downloadExport } from '../lib/api';

interface LocationManagerProps {
  locations: GeoLocation[];
  categories: GeoCategory[];
  onAdd: (loc: GeoLocation) => Promise<void>;
  onUpdate: (loc: GeoLocation) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  addToast: (msg: string, type: 'success' | 'info' | 'error') => void;
  speakText: (text: string) => void;
}

const emptyLocation = (categories: GeoCategory[]): Partial<GeoLocation> => ({
  name: '',
  category: categories[0]?.name || '',
  lat: 0,
  lng: 0,
  address: '',
  description: '',
  iconName: 'MapPin',
  color: categories[0]?.markerColor || '#DC2626',
});

export const LocationManager: React.FC<LocationManagerProps> = ({
  locations, onAdd, onUpdate, onDelete, addToast, speakText, categories: locCategories,
}) => {
  const catList = locCategories || [];
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<GeoLocation>>(emptyLocation(catList));
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMapLoc, setSelectedMapLoc] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pickMode, setPickMode] = useState(false);
  const [pickedPosition, setPickedPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const handleMapClick = (lat: number, lng: number) => {
    setFormData(f => ({ ...f, lat, lng }));
    setPickedPosition({ lat, lng });
    setPickMode(false);
  };

  const filtered = locations.filter(l => {
    const matchSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = filterCategory === 'ALL' || l.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const resetForm = () => {
    setFormData(emptyLocation(catList));
    setEditingId(null);
    setIsFormOpen(false);
    setPickMode(false);
    setPickedPosition(null);
  };

  const openEdit = (loc: GeoLocation) => {
    setFormData({ ...loc });
    setEditingId(loc.id);
    setIsFormOpen(true);
    setPickedPosition({ lat: loc.lat, lng: loc.lng });
  };

  const handleSave = async () => {
    const { name, category, lat, lng, address, description, iconName, color } = formData;
    if (!name || !address || lat === undefined || lng === undefined) {
      addToast('Lengkapi data: Nama, Alamat, dan Koordinat wajib diisi.', 'error');
      return;
    }

    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    try {
      if (editingId) {
        const updated: GeoLocation = {
          id: editingId, name: name!, category: category as any,
          lat: lat!, lng: lng!, address: address!, description: description || '',
          iconName: iconName || 'MapPin', color: color || '#DC2626',
          createdAt: locations.find(l => l.id === editingId)?.createdAt || now,
          updatedAt: now,
        };
        await onUpdate(updated);
        addToast(`"${name}" berhasil diperbarui.`, 'success');
      } else {
        const newLoc: GeoLocation = {
          id: `loc-${Date.now().toString(36)}`, name: name!, category: category as any,
          lat: lat!, lng: lng!, address: address!, description: description || '',
          iconName: iconName || 'MapPin', color: color || '#DC2626',
          createdAt: now, updatedAt: now,
        };
        await onAdd(newLoc);
        addToast(`"${name}" berhasil ditambahkan.`, 'success');
      }
      resetForm();
    } catch {
      addToast('Gagal menyimpan titik. Cek koneksi dan coba lagi.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    const loc = locations.find(l => l.id === id);
    if (!window.confirm(`Hapus titik "${loc?.name || id}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setDeletingId(id);
    try {
      await onDelete(id);
      addToast(`"${loc?.name}" berhasil dihapus.`, 'info');
    } catch {
      addToast('Gagal menghapus titik. Cek koneksi dan coba lagi.', 'error');
    }
    setDeletingId(null);
  };

  // Tutup dropdown ekspor saat klik di luar.
  React.useEffect(() => {
    const handler = (ev: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(ev.target as Node)) setExportOpen(false);
    };
    if (exportOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [exportOpen]);

  const handleExport = async (format: string) => {
    setExportOpen(false);
    setExporting(format);
    try {
      // Ekspor data yang sedang difilter/dicari; tanpa filter = semua titik.
      const ids = filtered.length < locations.length ? filtered.map(l => l.id) : undefined;
      await downloadExport(format, ids);
      addToast(`Ekspor ${format.toUpperCase()} berhasil diunduh.`, 'success');
    } catch {
      addToast('Gagal mengekspor. Cek koneksi dan coba lagi.', 'error');
    } finally {
      setExporting(null);
    }
  };

  const handlePrintPdf = () => {
    setExportOpen(false);
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const rowsHtml = filtered.map(l =>
      `<tr><td>${esc(l.id)}</td><td>${esc(l.name)}</td><td>${esc(l.category)}</td>` +
      `<td class="num">${l.lat.toFixed(6)}</td><td class="num">${l.lng.toFixed(6)}</td><td>${esc(l.address)}</td></tr>`
    ).join('');
    const w = window.open('', '_blank');
    if (!w) { addToast('Blokir popup menghalangi cetak. Izinkan popup lalu coba lagi.', 'error'); return; }
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Cetak Lokasi DLH Pontianak</title><style>
      body{font-family:Arial,sans-serif;color:#111;margin:24px;}
      h1{font-size:18px;margin:0 0 4px;} .meta{font-size:11px;color:#555;margin-bottom:16px;}
      table{width:100%;border-collapse:collapse;font-size:10px;}
      th,td{border:1px solid #999;padding:4px 6px;text-align:left;}
      th{background:#1B4332;color:#fff;}
      td.num{text-align:right;font-family:monospace;}
      .footer{font-size:9px;color:#888;margin-top:16px;text-align:center;}
      @media print { body{margin:8mm;} }
    </style></head><body>
      <h1>Daftar Lokasi Lingkungan — DLH Kota Pontianak</h1>
      <div class="meta">Dicetak: ${new Date().toLocaleString('id-ID')} · Jumlah titik: ${filtered.length}</div>
      <table><thead><tr><th>ID</th><th>Nama</th><th>Kategori</th><th>Latitude</th><th>Longitude</th><th>Alamat</th></tr></thead>
      <tbody>${rowsHtml}</tbody></table>
      <div class="footer">Sobat Hijau — Dinas Lingkungan Hidup Kota Pontianak · dlh.pontianak.go.id</div>
    </body></html>`);
    w.document.close();
    w.focus();
    w.print();
  };

  const exportItems: { format: string; label: string; icon: React.ReactNode }[] = [
    { format: 'kml', label: 'KML (Google Earth)', icon: <MapIcon className="w-3.5 h-3.5" /> },
    { format: 'kmz', label: 'KMZ (Google Earth terkompresi)', icon: <MapIcon className="w-3.5 h-3.5" /> },
    { format: 'shp', label: 'SHP (GIS — zip .shp/.dbf/.prj)', icon: <FileType2 className="w-3.5 h-3.5" /> },
    { format: 'xlsx', label: 'Excel (.xlsx)', icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
    { format: 'csv', label: 'CSV', icon: <FileText className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Map Preview — click-to-pick when pickMode is on */}
      <div className="relative">
        <EnvironmentalMap
          locations={locations}
          categories={catList}
          selectedLocationId={selectedMapLoc}
          onSelectLocation={(loc) => {
            if (!pickMode) {
              setSelectedMapLoc(loc.id);
              if (!isFormOpen) openEdit(loc);
            }
          }}
          onMapClick={pickMode ? handleMapClick : undefined}
          pickedPosition={isFormOpen ? pickedPosition : undefined}
          height="400px"
        />
        {isFormOpen && (
          <div className="absolute top-3 left-3 z-[1000] flex gap-2">
            <button
              type="button"
              onClick={() => { setPickMode(true); setPickedPosition(null); addToast('Klik di peta untuk memilih lokasi', 'info'); }}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-xl shadow-lg border transition flex items-center gap-1.5 ${
                pickMode
                  ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-300 animate-pulse'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              {pickMode ? 'Klik di peta...' : 'Pilih dari Peta'}
            </button>
          </div>
        )}
        {pickMode && (
          <div className="absolute top-3 right-3 z-[1000] bg-emerald-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-lg animate-pulse flex items-center gap-1.5">
            <MousePointerClick className="w-3.5 h-3.5" />
            Klik lokasi di peta
          </div>
        )}
      </div>

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-extrabold text-[#1B4332]">
            Kelola Titik Peta ({locations.length})
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Ekspor / Cetak */}
          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setExportOpen(o => !o)}
              disabled={!!exporting}
              className="px-4 py-2 bg-white hover:bg-emerald-50 text-[#1B4332] border border-emerald-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm disabled:opacity-60"
            >
              <Download className="w-3.5 h-3.5" />
              {exporting ? `Mengunduh ${exporting.toUpperCase()}...` : 'Ekspor / Cetak'}
            </button>
            <AnimatePresence>
              {exportOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 z-30 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden w-64"
                >
                  <p className="px-4 py-2 text-[9px] font-mono text-slate-400 border-b border-slate-100">
                    {filtered.length} titik {filtered.length < locations.length ? `(difilter dari ${locations.length})` : '(semua)'} · memerlukan login admin
                  </p>
                  <div className="py-1">
                    {exportItems.map(item => (
                      <button
                        key={item.format}
                        onClick={() => handleExport(item.format)}
                        className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-[#1B4332] transition flex items-center gap-2.5"
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    ))}
                    <button
                      onClick={handlePrintPdf}
                      className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-[#1B4332] transition flex items-center gap-2.5 border-t border-slate-100"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      PDF (cetak → Simpan sebagai PDF)
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={() => { resetForm(); setIsFormOpen(true); speakText('Membuka form tambah titik baru'); }}
            className="px-4 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah Titik
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau alamat titik..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 bg-white"
          />
        </div>
        <div className="flex gap-1.5">
          {[{ id: 'all', name: 'ALL' } as any, ...catList].map(cat => (
            <button
              key={cat.id || 'all'}
              onClick={() => setFilterCategory(cat.name)}
              className={`px-2.5 py-2 text-[10px] font-bold rounded-lg transition border whitespace-nowrap ${
                filterCategory === cat.name
                  ? 'bg-[#1B4332] text-white border-[#1B4332]'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.name === 'ALL' ? 'Semua' : cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* CRUD Form Modal */}
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
                  {editingId ? '✏️ Edit Titik' : '➕ Tambah Titik Baru'}
                </h4>
                <button onClick={resetForm} className="p-1.5 rounded-lg hover:bg-slate-100 transition">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column: Fields */}
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Nama Titik *</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      placeholder="Contoh: TPS 3R Siantan Hilir"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Kategori</label>
                    <select
                      value={formData.category}
                      onChange={e => { const cat = catList.find(c => c.name === e.target.value); setFormData(f => ({ ...f, category: e.target.value, color: cat?.markerColor || f.color, iconName: cat?.iconName || f.iconName })); }}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 bg-white"
                    >
                      {catList.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Latitude *</label>
                      <input
                        type="number"
                        step="any"
                        value={formData.lat || ''}
                        onChange={e => setFormData(f => ({ ...f, lat: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 font-mono"
                        placeholder="-0.016"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Longitude *</label>
                      <input
                        type="number"
                        step="any"
                        value={formData.lng || ''}
                        onChange={e => setFormData(f => ({ ...f, lng: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 font-mono"
                        placeholder="109.342"
                      />
                    </div>
                  </div>

                  {/* Mini picker map inside form */}
                  <div className="rounded-xl overflow-hidden border border-slate-200 h-[360px] relative">
                    <EnvironmentalMap
                      locations={locations}
                      categories={catList}
                      onMapClick={handleMapClick}
                      pickedPosition={pickedPosition}
                      height="360px"
                      searchable={false}
                    />
                    <div className="absolute bottom-2 left-2 z-[1000]">
                      <button
                        type="button"
                        onClick={() => { setPickMode(true); addToast('Klik di peta mini untuk memilih lokasi', 'info'); }}
                        className="px-2.5 py-1.5 text-[9px] font-bold bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-emerald-50 transition flex items-center gap-1"
                      >
                        <Crosshair className="w-3 h-3" /> Pilih koordinat
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Alamat *</label>
                    <input
                      type="text"
                      value={formData.address || ''}
                      onChange={e => setFormData(f => ({ ...f, address: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      placeholder="Jl. Alamat lengkap"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Deskripsi</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      placeholder="Informasi tambahan tentang titik ini..."
                    />
                  </div>
                </div>

                {/* Right Column: Icon Picker */}
                <IconPicker
                  selectedIcon={formData.iconName || 'MapPin'}
                  selectedColor={formData.color || '#DC2626'}
                  onSelectIcon={(iconName) => setFormData(f => ({ ...f, iconName }))}
                  onSelectColor={(color) => setFormData(f => ({ ...f, color }))}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  className="px-5 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  {editingId ? 'Simpan Perubahan' : 'Tambah Titik'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List of Locations */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="font-bold">Tidak ada titik ditemukan</p>
            <p className="mt-1">Coba ubah kata kunci pencarian atau filter kategori.</p>
          </div>
        ) : (
          filtered.map(loc => {
            const IconComp = (Icons as any)[loc.iconName] || Icons.MapPin;
            return (
              <motion.div
                key={loc.id}
                layout
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`group flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer hover:shadow-sm ${
                  selectedMapLoc === loc.id ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => setSelectedMapLoc(loc.id)}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-sm"
                  style={{ backgroundColor: loc.color }}
                >
                  <IconComp className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 truncate">{loc.name}</span>
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0"
                      style={{
                        backgroundColor: loc.category === 'Bank Sampah' ? '#F0FDF4' : '#FEF2F2',
                        color: loc.color,
                      }}
                    >
                      {loc.category}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 truncate">{loc.address}</p>
                  <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                    {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={(e) => { e.stopPropagation(); openEdit(loc); }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                    title="Edit"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(loc.id); }}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
