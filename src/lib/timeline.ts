import { StatusTimelineStep, SubmissionStatus } from '../types';

export const STATUS_ORDER: SubmissionStatus[] = ['DIAJUKAN', 'VERIFIKASI_ADMIN', 'SURVEY_TEKNIS', 'PROSES_REKOMENDASI', 'SELESAI'];

export const STATUS_LABELS: Record<SubmissionStatus, string> = {
  DIAJUKAN: 'DIAJUKAN',
  VERIFIKASI_ADMIN: 'VERIFIKASI ADMINISTRASI',
  SURVEY_TEKNIS: 'SURVEI TEKNIS LAPANGAN',
  PROSES_REKOMENDASI: 'PROSES PENYUSUNAN REKOMENDASI',
  SELESAI: 'SELESAI, REKOMENDASI SIAP DIUNDUH',
  DITOLAK: 'BERKAS DITOLAK / DIKEMBALIKAN'
};

export const nowSql = () => new Date().toISOString().replace('T', ' ').substring(0, 16);

export const createTimeline = (date = nowSql()): StatusTimelineStep[] => [
  { status: 'DIAJUKAN', title: 'Berkas Diterima', description: 'Permohonan Anda berhasil masuk ke database Sobat Hijau DLH.', updatedAt: date, isCompleted: true },
  { status: 'VERIFIKASI_ADMIN', title: 'Verifikasi Administrasi', description: 'Pemeriksaan kesesuaian berkas dan kelengkapan data oleh petugas.', updatedAt: '-', isCompleted: false },
  { status: 'SURVEY_TEKNIS', title: 'Pemeriksaan Teknis / Lapangan', description: 'Peninjauan langsung ke lokasi dan identifikasi parameter lapangan.', updatedAt: '-', isCompleted: false },
  { status: 'PROSES_REKOMENDASI', title: 'Penerbitan Surat Rekomendasi', description: 'Format naskah surat dan validasi dari kepala dinas.', updatedAt: '-', isCompleted: false },
  { status: 'SELESAI', title: 'Selesai & Serah Terima', description: 'Dokumen final telah diterbitkan dan siap diunduh atau diambil.', updatedAt: '-', isCompleted: false }
];

export const updateTimeline = (timeline: StatusTimelineStep[], newStatus: SubmissionStatus, note?: string, date = nowSql()) => {
  const targetIdx = STATUS_ORDER.indexOf(newStatus === 'DITOLAK' ? 'VERIFIKASI_ADMIN' : newStatus);
  return timeline.map(step => {
    const completed = STATUS_ORDER.indexOf(step.status) <= targetIdx;
    const isTarget = step.status === newStatus || (newStatus === 'DITOLAK' && step.status === 'VERIFIKASI_ADMIN');
    return {
      ...step,
      title: isTarget && newStatus === 'DITOLAK' ? 'Pemberitahuan Ditolak' : step.title,
      description: isTarget && newStatus === 'DITOLAK' ? (note || 'Sarat administratif tidak terpenuhi. Silakan periksa kembali berkas Anda atau hubungi admin.') : step.description,
      isCompleted: isTarget || completed,
      updatedAt: isTarget ? date : (step.updatedAt || '-'),
      notes: step.status === newStatus ? note : step.notes
    };
  });
};
