import React from 'react';
import { motion } from 'motion/react';
import {
  FolderOpen, Map, Layers, Globe, Settings, MessageSquareText, PencilRuler,
  Activity, Bell, CheckCircle2, XCircle, Clock, AlertTriangle, ArrowRight,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { SubmissionStatus } from '../types';

type AdminSubTab = 'kelola' | 'rancang' | 'layanan' | 'peta' | 'kategori' | 'jejaring' | 'template';

interface AdminDashboardProps {
  goAdmin: (sub: AdminSubTab) => void;
  onOpenActivityLog: () => void;
}

const STATUS_STEPS: SubmissionStatus[] = ['DIAJUKAN', 'VERIFIKASI_ADMIN', 'SURVEY_TEKNIS', 'PROSES_REKOMENDASI', 'SELESAI', 'DITOLAK', 'DIKEMBALIKAN'];

const STATUS_COLORS: Record<string, string> = {
  DIAJUKAN: 'bg-blue-500', VERIFIKASI_ADMIN: 'bg-amber-500', SURVEY_TEKNIS: 'bg-amber-600',
  PROSES_REKOMENDASI: 'bg-violet-500', SELESAI: 'bg-emerald-500', DITOLAK: 'bg-rose-500', DIKEMBALIKAN: 'bg-orange-500',
};

const TERMINAL = ['SELESAI', 'DITOLAK', 'DIKEMBALIKAN'];

const getBusinessDays = (submittedAt: string): number => {
  const t = new Date(submittedAt.replace(' ', 'T'));
  if (isNaN(t.getTime())) return 0;
  let days = 0;
  const now = Date.now();
  for (let d = t.getTime(); d < now; d += 86400000) {
    const wd = new Date(d).getDay();
    if (wd !== 0 && wd !== 6) days++;
  }
  return days;
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ goAdmin, onOpenActivityLog }) => {
  const { submissions, services, locations, categories, networkLinks, replyTemplates, notifications, activityLogs } = useStore();

  const stats = {
    total: submissions.length,
    proses: submissions.filter(s => !TERMINAL.includes(s.status)).length,
    selesai: submissions.filter(s => s.status === 'SELESAI').length,
    dikembalikan: submissions.filter(s => s.status === 'DITOLAK' || s.status === 'DIKEMBALIKAN').length,
    urgent: submissions.filter(s => !TERMINAL.includes(s.status) && getBusinessDays(s.submittedAt) > 5).length,
    unreadNotif: notifications.filter(n => !n.isRead).length,
  };

  const recent = [...submissions].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)).slice(0, 6);
  const recentLogs = activityLogs.slice(0, 5);
  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const statusBars = STATUS_STEPS.map(st => ({
    status: st,
    count: submissions.filter(s => s.status === st).length,
    pct: submissions.length ? Math.round(submissions.filter(s => s.status === st).length / submissions.length * 100) : 0,
  })).filter(x => x.count > 0);

  const badge = (status: string) =>
    `px-2 py-0.5 rounded-full text-[9px] font-bold font-mono ${
      status === 'SELESAI' ? 'bg-emerald-100 text-emerald-800'
      : status === 'DITOLAK' ? 'bg-rose-100 text-rose-800'
      : status === 'DIKEMBALIKAN' ? 'bg-orange-100 text-orange-800'
      : status === 'DIAJUKAN' ? 'bg-blue-100 text-blue-800'
      : 'bg-amber-100 text-amber-800'
    }`;

  const quickActions: { sub: AdminSubTab; label: string; desc: string; icon: React.ReactNode }[] = [
    { sub: 'kelola', label: 'Berkas Masuk', desc: `${stats.total} berkas · ${stats.urgent} perlu tindakan`, icon: <FolderOpen className="w-4 h-4" /> },
    { sub: 'layanan', label: 'Layanan', desc: `${services.length} layanan aktif`, icon: <PencilRuler className="w-4 h-4" /> },
    { sub: 'peta', label: 'Peta & Titik', desc: `${locations.length} titik · ${categories.length} kategori`, icon: <Map className="w-4 h-4" /> },
    { sub: 'kategori', label: 'Kategori Peta', desc: `${categories.length} kategori`, icon: <Layers className="w-4 h-4" /> },
    { sub: 'jejaring', label: 'Jejaring DLH', desc: `${networkLinks.length} tautan`, icon: <Globe className="w-4 h-4" /> },
    { sub: 'template', label: 'Template Balasan', desc: `${replyTemplates.length} template`, icon: <MessageSquareText className="w-4 h-4" /> },
    { sub: 'rancang', label: 'Rancang Layanan', desc: 'Buat layanan baru', icon: <Settings className="w-4 h-4" /> },
  ];

  const kpi = [
    { label: 'Total Berkas', value: stats.total, icon: <FolderOpen className="w-5 h-5" />, color: 'bg-emerald-100 text-emerald-700' },
    { label: 'Dalam Proses', value: stats.proses, icon: <Clock className="w-5 h-5" />, color: 'bg-amber-100 text-amber-700' },
    { label: 'Perlu Tindakan', value: stats.urgent, icon: <AlertTriangle className="w-5 h-5" />, color: 'bg-rose-100 text-rose-700' },
    { label: 'Selesai', value: stats.selesai, icon: <CheckCircle2 className="w-5 h-5" />, color: 'bg-emerald-100 text-emerald-700' },
    { label: 'Ditolak/Dikembalikan', value: stats.dikembalikan, icon: <XCircle className="w-5 h-5" />, color: 'bg-orange-100 text-orange-700' },
    { label: 'Notifikasi Baru', value: stats.unreadNotif, icon: <Bell className="w-5 h-5" />, color: 'bg-indigo-100 text-indigo-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Sambutan */}
      <div className="bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] rounded-2xl p-6 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black tracking-tight">Selamat datang, Administrator DLH 👋</h3>
            <p className="text-[11px] text-emerald-100/80 mt-1">{today} · Portal Sobat Hijau — Dinas Lingkungan Hidup Kota Pontianak</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] bg-white/10 border border-white/15 rounded-xl px-3 py-2 font-mono">
            <Activity className="w-3.5 h-3.5" />
            {stats.total} berkas · {stats.proses} proses · {stats.selesai} selesai
          </div>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpi.map(k => (
          <div key={k.label} className="bg-white dark:bg-stone-900 rounded-xl border border-slate-200 dark:border-stone-800 p-4 shadow-sm">
            <div className={`inline-flex p-2 rounded-lg ${k.color} mb-2`}>{k.icon}</div>
            <p className="text-xl font-black text-slate-800 dark:text-stone-100 leading-none">{k.value}</p>
            <p className="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-wide">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Berkas terbaru */}
        <div className="lg:col-span-2 bg-white dark:bg-stone-900 rounded-2xl border border-slate-200 dark:border-stone-800 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-stone-800 flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-[#1B4332] dark:text-emerald-400 uppercase tracking-wide">Berkas Terbaru</h4>
            <button onClick={() => goAdmin('kelola')} className="text-[10px] font-bold text-emerald-700 hover:underline flex items-center gap-1">
              Lihat semua <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-stone-800">
            {recent.length === 0 && <p className="p-8 text-center text-xs text-slate-400">Belum ada berkas.</p>}
            {recent.map(sub => (
              <div key={sub.id} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50/60 dark:hover:bg-stone-800/30 transition cursor-pointer" onClick={() => goAdmin('kelola')}>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-stone-100 truncate">{sub.applicantName}</p>
                  <p className="text-[10px] text-slate-400 truncate">{sub.serviceName}</p>
                </div>
                <span className="hidden sm:block text-[9px] font-mono text-slate-400">{sub.submittedAt}</span>
                <span className={badge(sub.status)}>{sub.status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Kolom kanan: distribusi status + log */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-slate-200 dark:border-stone-800 p-5 shadow-sm">
            <h4 className="text-xs font-extrabold text-[#1B4332] dark:text-emerald-400 uppercase tracking-wide mb-4">Distribusi Status</h4>
            <div className="space-y-3">
              {statusBars.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Belum ada data.</p>}
              {statusBars.map(s => (
                <div key={s.status}>
                  <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
                    <span>{s.status.replace('_', ' ')}</span>
                    <span className="font-mono">{s.count} ({s.pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-stone-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${s.pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className={`h-full rounded-full ${STATUS_COLORS[s.status]}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-slate-200 dark:border-stone-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-extrabold text-[#1B4332] dark:text-emerald-400 uppercase tracking-wide">Aktivitas Terakhir</h4>
              <button onClick={onOpenActivityLog} className="text-[10px] font-bold text-emerald-700 hover:underline">Buka log</button>
            </div>
            <div className="space-y-2.5">
              {recentLogs.length === 0 && <p className="text-xs text-slate-400 text-center py-3">Belum ada aktivitas.</p>}
              {recentLogs.map(log => (
                <div key={log.id} className="flex items-start gap-2.5">
                  <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${log.iconType === 'success' ? 'bg-emerald-500' : 'bg-blue-400'}`} />
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-600 dark:text-stone-300 leading-snug line-clamp-1">{log.action}</p>
                    <p className="text-[9px] text-slate-400 font-mono">{log.timestamp} WIB</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Aksi cepat */}
      <div>
        <h4 className="text-xs font-extrabold text-[#1B4332] dark:text-emerald-400 uppercase tracking-wide mb-3">Aksi Cepat</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-7 gap-3">
          {quickActions.map(a => (
            <button
              key={a.sub}
              onClick={() => goAdmin(a.sub)}
              className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 rounded-xl p-3.5 text-left hover:border-emerald-300 hover:shadow-sm transition"
            >
              <span className="inline-flex p-1.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 mb-2">{a.icon}</span>
              <p className="text-xs font-bold text-slate-800 dark:text-stone-100">{a.label}</p>
              <p className="text-[9px] text-slate-400 mt-0.5">{a.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
