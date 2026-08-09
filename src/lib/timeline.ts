import { StatusTimelineStep } from '../types';

export const nowSql = () => new Date().toISOString().replace('T', ' ').substring(0, 16);

export const createTimeline = (date = nowSql()): StatusTimelineStep[] => [
  { status: 'DIAJUKAN', title: 'Berkas Diterima', description: 'Permohonan Anda berhasil masuk ke database Sobat Hijau DLH.', updatedAt: date, isCompleted: true },
  { status: 'VERIFIKASI_ADMIN', title: 'Verifikasi Administrasi', description: 'Pemeriksaan kesesuaian berkas dan kelengkapan data oleh petugas.', updatedAt: '-', isCompleted: false },
  { status: 'SURVEY_TEKNIS', title: 'Pemeriksaan Teknis / Lapangan', description: 'Peninjauan langsung ke lokasi dan identifikasi parameter lapangan.', updatedAt: '-', isCompleted: false },
  { status: 'PROSES_REKOMENDASI', title: 'Penerbitan Surat Rekomendasi', description: 'Format naskah surat dan validasi dari kepala dinas.', updatedAt: '-', isCompleted: false },
  { status: 'SELESAI', title: 'Selesai & Serah Terima', description: 'Dokumen final telah diterbitkan dan siap diunduh atau diambil.', updatedAt: '-', isCompleted: false }
];
