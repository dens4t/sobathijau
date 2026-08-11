import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ClipboardList, Filter, FileText } from 'lucide-react';
import { ServiceTemplate, Submission, SubmissionStatus } from '../types';

const STATUS_OPTIONS: (SubmissionStatus | 'ALL')[] = ['ALL', 'DIAJUKAN', 'VERIFIKASI_ADMIN', 'SURVEY_TEKNIS', 'PROSES_REKOMENDASI', 'SELESAI', 'DITOLAK', 'DIKEMBALIKAN'];

interface RekapPermohonanProps {
  submissions: Submission[];
  services: ServiceTemplate[];
}

const badge = (status: string) =>
  `px-2 py-0.5 rounded-full text-[9px] font-bold font-mono ${
    status === 'SELESAI' ? 'bg-emerald-100 text-emerald-800'
    : status === 'DITOLAK' ? 'bg-rose-100 text-rose-800'
    : status === 'DIKEMBALIKAN' ? 'bg-orange-100 text-orange-800'
    : status === 'DIAJUKAN' ? 'bg-blue-100 text-blue-800'
    : 'bg-amber-100 text-amber-800'
  }`;

export const RekapPermohonan: React.FC<RekapPermohonanProps> = ({ submissions, services }) => {
  const [filterService, setFilterService] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<SubmissionStatus | 'ALL'>('ALL');

  // Kolom menyesuaikan field layanan yang dipilih (hanya saat filter layanan aktif).
  const selectedService = filterService === 'ALL' ? null : services.find(s => s.id === filterService) || null;
  const dynamicColumns = selectedService?.fields ?? [];

  const fmtValue = (v: unknown): string => {
    if (v === null || v === undefined || v === '') return '—';
    if (Array.isArray(v)) return v.join(', ');
    if (typeof v === 'object') return (v as { name?: string }).name || '—';
    return String(v);
  };

  const filtered = submissions.filter(s =>
    (filterService === 'ALL' || s.serviceId === filterService)
    && (filterStatus === 'ALL' || s.status === filterStatus)
  );

  const byStatus = (st: SubmissionStatus) => filtered.filter(s => s.status === st).length;
  const sorted = [...filtered].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

  return (
    <div className="max-w-[1600px] mx-auto w-full space-y-6">
      {/* Ringkasan */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Permohonan', value: filtered.length, cls: 'text-[#1B4332]' },
          { label: 'Dalam Proses', value: byStatus('DIAJUKAN') + byStatus('VERIFIKASI_ADMIN') + byStatus('SURVEY_TEKNIS') + byStatus('PROSES_REKOMENDASI'), cls: 'text-amber-600' },
          { label: 'Selesai', value: byStatus('SELESAI'), cls: 'text-emerald-600' },
          { label: 'Ditolak/Dikembalikan', value: byStatus('DITOLAK') + byStatus('DIKEMBALIKAN'), cls: 'text-rose-600' },
        ].map(k => (
          <div key={k.label} className="bg-white dark:bg-stone-900 rounded-xl border border-slate-200 dark:border-stone-800 p-4 shadow-sm">
            <p className={`text-2xl font-black leading-none ${k.cls}`}>{k.value}</p>
            <p className="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-wide">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-slate-200 dark:border-stone-800 p-4 shadow-sm flex flex-col sm:flex-row gap-3 sm:items-end">
        <div className="flex items-center gap-2 text-slate-500">
          <Filter className="w-4 h-4" />
          <span className="text-xs font-extrabold text-[#1B4332] dark:text-emerald-400 uppercase tracking-wide">Filter</span>
        </div>
        <div className="flex-1">
          <label className="text-[10px] font-bold text-slate-400 block mb-1">Jenis Layanan</label>
          <select
            value={filterService}
            onChange={e => setFilterService(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 bg-white dark:bg-stone-900"
          >
            <option value="ALL">Semua Layanan ({submissions.length})</option>
            {services.map(s => {
              const n = submissions.filter(x => x.serviceId === s.id).length;
              return <option key={s.id} value={s.id}>{s.name} ({n})</option>;
            })}
          </select>
        </div>
        <div className="sm:w-56">
          <label className="text-[10px] font-bold text-slate-400 block mb-1">Status</label>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as SubmissionStatus | 'ALL')}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 bg-white dark:bg-stone-900"
          >
            {STATUS_OPTIONS.map(st => <option key={st} value={st}>{st === 'ALL' ? 'Semua Status' : st.replace('_', ' ')}</option>)}
          </select>
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-slate-200 dark:border-stone-800 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-stone-800 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-emerald-600" />
          <h4 className="text-xs font-extrabold text-[#1B4332] dark:text-emerald-400 uppercase tracking-wide">
            Rekap Data Permohonan ({filtered.length})
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-stone-850 text-slate-500 dark:text-stone-400 uppercase font-bold text-[10px]">
              <tr>
                <th className="py-3 px-4">Kode</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Pemohon</th>
                <th className="py-3 px-4">Layanan</th>
                {dynamicColumns.map(f => (
                  <th key={f.id} className="py-3 px-4 whitespace-nowrap">{f.label}</th>
                ))}
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-stone-800">
              {sorted.length === 0 && (
                <tr><td colSpan={5 + dynamicColumns.length} className="text-center py-10 text-slate-400">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  Tidak ada permohonan dengan filter ini.
                </td></tr>
              )}
              {sorted.map(sub => (
                <motion.tr
                  key={sub.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="hover:bg-slate-50/60 dark:hover:bg-stone-800/30 transition"
                >
                  <td className="py-3 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">{sub.id}</td>
                  <td className="py-3 px-4 text-slate-500">{sub.submittedAt}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-stone-200">{sub.applicantName}</td>
                  <td className="py-3 px-4 text-slate-500 max-w-[220px] truncate">{sub.serviceName}</td>
                  {dynamicColumns.map(f => (
                    <td key={f.id} className="py-3 px-4 text-slate-600 dark:text-stone-300 max-w-[180px] truncate whitespace-nowrap">
                      {fmtValue(sub.formData?.[f.id])}
                    </td>
                  ))}
                  <td className="py-3 px-4 text-right"><span className={badge(sub.status)}>{sub.status.replace('_', ' ')}</span></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
