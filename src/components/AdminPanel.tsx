/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings, Eye, Edit3, Trash2, Check, AlertTriangle, RefreshCcw, BarChart3, Database, Sparkles, Search, Clock, X, ShieldAlert } from 'lucide-react';
import { Submission, SubmissionStatus } from '../types';
import { TrackingSobat } from './TrackingSobat';
import { motion, AnimatePresence } from 'motion/react';

interface AdminPanelProps {
  submissions: Submission[];
  onUpdateStatus: (id: string, newStatus: SubmissionStatus, adminNote?: string) => void;
  onDeleteSubmission: (id: string) => void;
  onSpeak: (text: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  submissions,
  onUpdateStatus,
  onDeleteSubmission,
  onSpeak
}) => {
  const [filter, setFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<SubmissionStatus>('DIAJUKAN');
  const [adminNotes, setAdminNotes] = useState('');
  
  // Delete confirmation state
  const [deleteSubId, setDeleteSubId] = useState<string | null>(null);

  // State for Tracking Modal
  const [trackingId, setTrackingId] = useState<string | null>(null);

  // Hitung jumlah hari kerja (Senin-Jumat) dari tanggal submit hingga sekarang (2026-06-02)
  const getElapsedBusinessDays = (submittedAtStr: string) => {
    try {
      const cleanStr = submittedAtStr.replace(' ', 'T');
      const submitDate = new Date(cleanStr);
      const now = new Date();
      if (isNaN(submitDate.getTime())) return 0;
      
      let businessDays = 0;
      let tempDate = new Date(submitDate.getTime());
      
      if (tempDate > now) return 0;

      while (tempDate < now) {
        const dayOfWeek = tempDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Bukan Minggu (0) dan Sabtu (6)
          businessDays++;
        }
        tempDate.setDate(tempDate.getDate() + 1);
      }
      return businessDays;
    } catch (e) {
      return 0;
    }
  };

  const isUrgentSubmission = (sub: Submission) => {
    if (sub.status === 'SELESAI' || sub.status === 'DITOLAK') return false;
    return getElapsedBusinessDays(sub.submittedAt) > 5;
  };

  // Count helper
  const stats = {
    total: submissions.length,
    selesai: submissions.filter(s => s.status === 'SELESAI').length,
    proses: submissions.filter(s => s.status !== 'SELESAI' && s.status !== 'DITOLAK').length,
    ditolak: submissions.filter(s => s.status === 'DITOLAK').length,
    urgent: submissions.filter(s => s.status !== 'SELESAI' && s.status !== 'DITOLAK' && getElapsedBusinessDays(s.submittedAt) > 5).length,
  };

  const filteredSubmissions = submissions.filter(sub => {
    // 1. Status Filter
    if (filter !== 'ALL') {
      if (filter === 'URGENT') {
        if (!isUrgentSubmission(sub)) return false;
      } else if (sub.status !== filter) {
        return false;
      }
    }

    // 2. Keyword Search query filter (Id, nama pemohon, atau nama layanan)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchId = sub.id.toLowerCase().includes(q);
      const matchApplicant = sub.applicantName.toLowerCase().includes(q);
      const matchService = sub.serviceName.toLowerCase().includes(q);
      return matchId || matchApplicant || matchService;
    }

    return true;
  });

  const startChangingStatus = (sub: Submission) => {
    setSelectedSubId(sub.id);
    setNewStatus(sub.status);
    setAdminNotes(sub.timeline.find(t => t.status === sub.status)?.notes || '');
    onSpeak(`Mengedit status berkas ${sub.id}`);
  };

  const saveStatusChange = () => {
    if (!selectedSubId) return;

    onUpdateStatus(selectedSubId, newStatus, adminNotes);
    onSpeak(`Status berkas ${selectedSubId} berhasil diperbarui menjadi ${newStatus.replace('_', ' ')}.`);
    setSelectedSubId(null);
    setAdminNotes('');
  };

  return (
    <div className="space-y-6" id="admin-panel-container">
      {/* KPI Stats (Ringkas) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-slate-200 dark:border-stone-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Total Berkas</p>
            <p className="text-xl font-black text-slate-800 dark:text-stone-100">{stats.total}</p>
          </div>
          <Database className="w-8 h-8 text-emerald-100 dark:text-stone-800" />
        </div>
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-rose-500 uppercase">Perlu Tindakan</p>
            <p className="text-xl font-black text-rose-600">{stats.urgent}</p>
          </div>
          <AlertTriangle className="w-8 h-8 text-rose-100 dark:text-rose-900/30" />
        </div>
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-slate-200 dark:border-stone-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Dalam Proses</p>
            <p className="text-xl font-black text-amber-600">{stats.proses}</p>
          </div>
          <RefreshCcw className="w-8 h-8 text-amber-100 dark:text-stone-800" />
        </div>
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-slate-200 dark:border-stone-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Selesai</p>
            <p className="text-xl font-black text-emerald-600">{stats.selesai}</p>
          </div>
          <Check className="w-8 h-8 text-emerald-100 dark:text-stone-800" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-stone-900 p-6 rounded-2xl border border-slate-200 dark:border-stone-800 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mb-4">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Cari berkas..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-stone-700 bg-slate-50 dark:bg-stone-850 focus:outline-none focus:border-emerald-500" />
            </div>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-full sm:w-auto px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-900 focus:outline-none">
              <option value="ALL">Semua Status</option>
              <option value="DIAJUKAN">Diajukan</option>
              <option value="SURVEY_TEKNIS">Survei</option>
              <option value="SELESAI">Selesai</option>
              <option value="DITOLAK">Ditolak</option>
              <option value="URGENT">⏳ &gt; 5 Hari</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-stone-850 text-slate-500 dark:text-stone-400 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-3 px-4 rounded-tl-lg">Kode / Tanggal</th>
                  <th className="py-3 px-4">Layanan & Pemohon</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right rounded-tr-lg">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-stone-800">
                <AnimatePresence>
                {filteredSubmissions.length > 0 ? filteredSubmissions.map(sub => (
                  <motion.tr
                    key={sub.id}
                    layout
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ type: 'spring', duration: 0.3, bounce: 0.1 }}
                    className="hover:bg-slate-50/50 dark:hover:bg-stone-800/30 transition"
                  >
                    <td className="py-3 px-4">
                      <p className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{sub.id}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{sub.submittedAt}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800 dark:text-stone-200">{sub.applicantName}</p>
                      <p className="text-[10px] text-slate-500 max-w-[200px] truncate">{sub.serviceName}</p>
                    </td>
                    <td className="py-3 px-4">
                      <motion.span
                        key={sub.status}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', duration: 0.3, bounce: 0.4 }}
                        className={`px-2.5 py-1 text-[9px] font-bold rounded-full ${sub.status === 'SELESAI' ? 'bg-emerald-100 text-emerald-800' : sub.status === 'DITOLAK' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}
                      >
                        {sub.status.replace('_', ' ')}
                      </motion.span>
                    </td>
                    <td className="py-3 px-4 text-right flex items-center justify-end gap-2">
                      <button onClick={() => setTrackingId(sub.id)} className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-stone-800 transition" title="Lacak"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => startChangingStatus(sub)} className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-stone-800 transition" title="Ubah Status"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteSubId(sub.id)} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-stone-800 transition" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </motion.tr>
                )) : <tr><td colSpan={4} className="text-center py-8 text-slate-400">Tidak ada berkas.</td></tr>}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedSubId ? (
              <motion.div
                key="edit-form"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: 'spring', duration: 0.35, bounce: 0.2 }}
                className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 p-5 rounded-2xl space-y-4 shadow-sm"
              >
                <h5 className="font-bold text-sm text-slate-800 dark:text-stone-200">Ubah Status: {selectedSubId}</h5>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status Baru</label>
                  <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as SubmissionStatus)} className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-stone-700 bg-slate-50 dark:bg-stone-850 focus:outline-none">
                    <option value="DIAJUKAN">DIAJUKAN</option>
                    <option value="VERIFIKASI_ADMIN">VERIFIKASI ADMINISTRASI</option>
                    <option value="SURVEY_TEKNIS">SURVEY TEKNIS / LAPANGAN</option>
                    <option value="PROSES_REKOMENDASI">PROSES REKOMENDASI KADIN</option>
                    <option value="SELESAI">SELESAI</option>
                    <option value="DITOLAK">DITOLAK</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Catatan Tambahan (Opsional)</label>
                  <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={3} className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-stone-700 bg-slate-50 dark:bg-stone-850 focus:outline-none resize-none" placeholder="Tambahkan catatan untuk pemohon..." />
                </div>
                <div className="flex gap-2">
                  <button onClick={saveStatusChange} className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs transition">Simpan</button>
                  <button onClick={() => setSelectedSubId(null)} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 text-slate-700 dark:text-stone-300 font-bold rounded-lg text-xs transition">Batal</button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: 'spring', duration: 0.35, bounce: 0.2 }}
                className="bg-slate-50 dark:bg-stone-900 border border-slate-200 dark:border-stone-800 p-8 rounded-2xl flex flex-col justify-center items-center text-center text-slate-400 h-full"
              >
                <Edit3 className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs font-bold text-slate-600 dark:text-stone-400">Pilih Berkas</p>
                <p className="text-[10px] mt-1">Klik ikon edit pada tabel untuk memperbarui status berkas.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {trackingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans text-stone-900 dark:text-stone-100">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTrackingId(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm pointer-events-auto"
            />
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", duration: 0.35, bounce: 0.2 }}
              className="bg-stone-50 dark:bg-stone-950 rounded-3xl shadow-2xl border border-stone-200/60 dark:border-stone-800/80 w-full max-w-5xl overflow-hidden relative z-10 flex flex-col max-h-[90vh] pointer-events-auto"
            >
              <div className="p-4 md:p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-white dark:bg-stone-900 sticky top-0 z-20">
                <h3 className="text-sm font-extrabold tracking-tight text-[#1B4332] dark:text-emerald-400 uppercase">
                  Detail Pelacakan Berkas
                </h3>
                <button
                  type="button"
                  onClick={() => setTrackingId(null)}
                  className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="overflow-y-auto p-4 md:p-8 flex-1">
                <TrackingSobat submissions={submissions} initialSearchCode={trackingId} readonly onSpeak={onSpeak} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {deleteSubId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteSubId(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
              className="relative z-10 bg-white dark:bg-stone-900 rounded-2xl border border-rose-200 dark:border-rose-900/50 shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center">
                  <ShieldAlert className="w-7 h-7 text-rose-600 dark:text-rose-400" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-1">Hapus Berkas?</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 mb-2">
                  Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="bg-stone-50 dark:bg-stone-850 rounded-xl p-3 mb-6">
                  <p className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">{deleteSubId}</p>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                    {submissions.find(s => s.id === deleteSubId)?.applicantName || ''}
                  </p>
                  <p className="text-[10px] text-stone-400 mt-0.5 truncate">
                    {submissions.find(s => s.id === deleteSubId)?.serviceName || ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setDeleteSubId(null)}
                    className="flex-1 py-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-sm font-bold rounded-xl transition"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => {
                      if (deleteSubId) {
                        onDeleteSubmission(deleteSubId);
                        setDeleteSubId(null);
                      }
                    }}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-xl transition shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    Hapus Permanen
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
