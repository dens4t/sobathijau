import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ClipboardList, Filter, FileText, Download, FileSpreadsheet, Printer, FileDown, ArrowUp, ArrowDown } from 'lucide-react';
import { downloadSubmissionsExport } from '../lib/api';
import { ServiceTemplate, Submission, SubmissionStatus } from '../types';

const STATUS_OPTIONS: (SubmissionStatus | 'ALL')[] = ['ALL', 'DIAJUKAN', 'VERIFIKASI_ADMIN', 'SURVEY_TEKNIS', 'PROSES_REKOMENDASI', 'SELESAI', 'DITOLAK', 'DIKEMBALIKAN'];

interface RekapPermohonanProps {
  submissions: Submission[];
  services: ServiceTemplate[];
  addToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const badge = (status: string) =>
  `px-2 py-0.5 rounded-full text-[9px] font-bold font-mono ${
    status === 'SELESAI' ? 'bg-emerald-100 text-emerald-800'
    : status === 'DITOLAK' ? 'bg-rose-100 text-rose-800'
    : status === 'DIKEMBALIKAN' ? 'bg-orange-100 text-orange-800'
    : status === 'DIAJUKAN' ? 'bg-blue-100 text-blue-800'
    : 'bg-amber-100 text-amber-800'
  }`;

export const RekapPermohonan: React.FC<RekapPermohonanProps> = ({ submissions, services, addToast }) => {
  const [filterService, setFilterService] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<SubmissionStatus | 'ALL'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [sortKey, setSortKey] = useState<string>('submittedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [exporting, setExporting] = useState<'csv' | 'xlsx' | null>(null);

  const currentFilters = () => ({
    serviceId: filterService === 'ALL' ? undefined : filterService,
    status: filterStatus === 'ALL' ? undefined : filterStatus,
    dateStart: dateStart || undefined,
    dateEnd: dateEnd || undefined,
  });

  const handleExport = async (format: 'csv' | 'xlsx') => {
    setExporting(format);
    try {
      await downloadSubmissionsExport(format, currentFilters());
    } catch {
      addToast('Gagal mengekspor. Cek koneksi dan coba lagi.', 'error');
    } finally {
      setExporting(null);
    }
  };

  const handlePrintPdf = () => {
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const rowsHtml = sorted.map(sub =>
      `<tr><td>${esc(sub.id)}</td><td>${esc(sub.submittedAt)}</td><td>${esc(sub.applicantName)}</td><td>${esc(sub.serviceName)}</td><td>${esc(sub.status.replace('_', ' '))}</td></tr>`
    ).join('');
    const w = window.open('', '_blank');
    if (!w) { addToast('Blokir popup menghalangi cetak. Izinkan popup lalu coba lagi.', 'error'); return; }
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Rekap Permohonan</title><style>
      body{font-family:Arial,sans-serif;margin:24px;color:#111;}
      h1{font-size:16px;margin:0 0 4px;} .meta{font-size:11px;color:#555;margin-bottom:14px;}
      table{width:100%;border-collapse:collapse;font-size:10px;}
      th,td{border:1px solid #999;padding:4px 6px;text-align:left;}
      th{background:#1B4332;color:#fff;}
      .footer{font-size:9px;color:#888;margin-top:14px;text-align:center;}
      @media print { body{margin:8mm;} }
    </style></head><body>
      <h1>Rekap Data Permohonan — DLH Kota Pontianak</h1>
      <div class="meta">Dicetak: ${new Date().toLocaleString('id-ID')} · Jumlah: ${sorted.length} permohonan</div>
      <table><thead><tr><th>Kode</th><th>Tanggal</th><th>Pemohon</th><th>Layanan</th><th>Status</th></tr></thead>
      <tbody>${rowsHtml}</tbody></table>
      <div class="footer">Sobat Hijau — Dinas Lingkungan Hidup Kota Pontianak</div>
    </body></html>`);
    w.document.close();
    w.focus();
    w.print();
  };

  // Kolom menyesuaikan field layanan yang dipilih (hanya saat filter layanan aktif).
  const selectedService = filterService === 'ALL' ? null : services.find(s => s.id === filterService) || null;
  const dynamicColumns = selectedService?.fields ?? [];

  const fmtLabel = (key: string) => key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  const fmtValue = (v: unknown): string => {
    if (v === null || v === undefined || v === '') return '—';
    if (Array.isArray(v)) return v.join(', ');
    if (typeof v === 'object') return (v as { name?: string }).name || '—';
    return String(v);
  };

  const getSortValue = (sub: Submission, key: string): string => {
    if (key === 'id') return sub.id;
    if (key === 'submittedAt') return sub.submittedAt;
    if (key === 'applicantName') return sub.applicantName;
    if (key === 'status') return sub.status;
    return fmtValue(sub.formData?.[key]);
  };

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'submittedAt' ? 'desc' : 'asc');
    }
  };

  const sortable = (key: string, label: string) => (
    <button
      onClick={() => toggleSort(key)}
      className="inline-flex items-center gap-1 hover:text-[#1B4332] dark:hover:text-emerald-400 transition"
    >
      {label}
      {sortKey === key && (sortDir === 'asc'
        ? <ArrowUp className="w-3 h-3 text-emerald-600" />
        : <ArrowDown className="w-3 h-3 text-emerald-600" />)}
    </button>
  );

  const filtered = submissions.filter(s => {
    const d = (s.submittedAt || '').slice(0, 10);
    const okService = filterService === 'ALL' || s.serviceId === filterService;
    const okStatus = filterStatus === 'ALL' || s.status === filterStatus;
    const okStart = !dateStart || d >= dateStart;
    const okEnd = !dateEnd || d <= dateEnd;
    return okService && okStatus && okStart && okEnd;
  });

  const byStatus = (st: SubmissionStatus) => filtered.filter(s => s.status === st).length;
  const sorted = [...filtered].sort((a, b) => {
    const va = getSortValue(a, sortKey);
    const vb = getSortValue(b, sortKey);
    const cmp = va.localeCompare(vb, undefined, { numeric: true, sensitivity: 'base' });
    return sortDir === 'asc' ? cmp : -cmp;
  });

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
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-slate-400 block mb-1">&nbsp;</label>
          <div className="flex items-center gap-2 text-slate-500 h-[34px]">
            <Filter className="w-4 h-4" />
            <span className="text-xs font-extrabold text-[#1B4332] dark:text-emerald-400 uppercase tracking-wide">Filter</span>
          </div>
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
        <div className="sm:w-40">
          <label className="text-[10px] font-bold text-slate-400 block mb-1">Dari Tanggal</label>
          <input
            type="date"
            value={dateStart}
            onChange={e => setDateStart(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 bg-white dark:bg-stone-900"
          />
        </div>
        <div className="sm:w-40">
          <label className="text-[10px] font-bold text-slate-400 block mb-1">Sampai Tanggal</label>
          <input
            type="date"
            value={dateEnd}
            onChange={e => setDateEnd(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 bg-white dark:bg-stone-900"
          />
        </div>
        <div className="sm:w-44">
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
          <div className="ml-auto flex items-center gap-1.5">
            <button onClick={() => handleExport('csv')} disabled={!!exporting}
              className="px-3 py-1.5 bg-white hover:bg-emerald-50 border border-emerald-200 text-[#1B4332] text-[10px] font-bold rounded-lg transition flex items-center gap-1.5 disabled:opacity-60">
              <FileDown className="w-3 h-3" /> {exporting === 'csv' ? '...' : 'CSV'}
            </button>
            <button onClick={() => handleExport('xlsx')} disabled={!!exporting}
              className="px-3 py-1.5 bg-white hover:bg-emerald-50 border border-emerald-200 text-[#1B4332] text-[10px] font-bold rounded-lg transition flex items-center gap-1.5 disabled:opacity-60">
              <FileSpreadsheet className="w-3 h-3" /> {exporting === 'xlsx' ? '...' : 'Excel'}
            </button>
            <button onClick={handlePrintPdf}
              className="px-3 py-1.5 bg-white hover:bg-emerald-50 border border-emerald-200 text-[#1B4332] text-[10px] font-bold rounded-lg transition flex items-center gap-1.5">
              <Printer className="w-3 h-3" /> PDF
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-stone-850 text-slate-500 dark:text-stone-400 uppercase font-bold text-[10px]">
              <tr>
                <th className="py-3 px-4">{sortable('id', 'Kode')}</th>
                <th className="py-3 px-4">{sortable('submittedAt', 'Tanggal')}</th>
                <th className="py-3 px-4">{sortable('applicantName', 'Pemohon')}</th>
                {dynamicColumns.map(f => (
                  <th key={f.id} className="py-3 px-4 whitespace-nowrap">{sortable(f.id, f.label)}</th>
                ))}
                <th className="py-3 px-4 text-right">{sortable('status', 'Status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-stone-800">
              {sorted.length === 0 && (
                <tr><td colSpan={4 + dynamicColumns.length} className="text-center py-10 text-slate-400">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  Tidak ada permohonan dengan filter ini.
                </td></tr>
              )}
              {sorted.map(sub => (
                <React.Fragment key={sub.id}>
                <motion.tr
                  
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
                  className={`hover:bg-emerald-50/50 dark:hover:bg-stone-800/40 transition cursor-pointer ${expandedId === sub.id ? 'bg-emerald-50/60 dark:bg-stone-800/50' : ''}`}
                >
                  <td className="py-3 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">{sub.id}</td>
                  <td className="py-3 px-4 text-slate-500">{sub.submittedAt}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-stone-200">{sub.applicantName}</td>
                  {dynamicColumns.map(f => (
                    <td key={f.id} className="py-3 px-4 text-slate-600 dark:text-stone-300 max-w-[180px] truncate whitespace-nowrap">
                      {fmtValue(sub.formData?.[f.id])}
                    </td>
                  ))}
                  <td className="py-3 px-4 text-right"><span className={badge(sub.status)}>{sub.status.replace('_', ' ')}</span></td>
                </motion.tr>
                {expandedId === sub.id && (
                  <tr>
                    <td colSpan={4 + dynamicColumns.length} className="px-6 py-5 bg-emerald-50/40 dark:bg-stone-850/60">
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                          <div className="lg:col-span-2">
                            <p className="text-[10px] font-extrabold text-[#1B4332] dark:text-emerald-400 uppercase tracking-wide mb-3">Rincian Formulir</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                              {Object.entries(sub.formData || {}).filter(([k]) => !k.startsWith('__')).map(([k, v]) => (
                                <div key={k} className="text-xs">
                                  <p className="text-slate-400 text-[10px] font-medium">{fmtLabel(k)}</p>
                                  <p className="font-semibold text-slate-800 dark:text-stone-200 mt-0.5 break-words">{fmtValue(v)}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] font-extrabold text-[#1B4332] dark:text-emerald-400 uppercase tracking-wide mb-3">Progres Berkas</p>
                            <div className="space-y-2">
                              {sub.timeline?.map(step => (
                                <div key={step.status} className="flex items-start gap-2">
                                  <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${step.isCompleted ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-stone-700'}`} />
                                  <div className="min-w-0">
                                    <p className={`text-[11px] font-semibold ${step.isCompleted ? 'text-slate-800 dark:text-stone-200' : 'text-slate-400'}`}>{step.title}</p>
                                    <p className="text-[9px] text-slate-400 font-mono">{step.updatedAt === '-' ? 'Belum' : step.updatedAt}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </td>
                  </tr>
                )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
