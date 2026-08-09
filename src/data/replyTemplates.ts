import { SubmissionStatus } from '../types';

/**
 * Template "Balasan Cepat" per status — admin cukup pilih (1 klik) lalu
 * boleh diedit. Teks akhir dikirim sebagai balasan ke pemohon.
 */
export interface ReplyTemplate {
  label: string;
  text: string;
}

export const replyTemplates: Record<SubmissionStatus, ReplyTemplate[]> = {
  DIAJUKAN: [
    {
      label: 'Berkas diterima',
      text: 'Berkas Anda telah kami terima dan tercatat di sistem Sobat Hijau. Tim DLH akan memverifikasi kelengkapan administrasi dalam 1–3 hari kerja.',
    },
    {
      label: 'Terima kasih & antrean',
      text: 'Permohonan Anda sudah masuk antrean verifikasi. Mohon menunggu konfirmasi berikutnya dari petugas.',
    },
  ],
  VERIFIKASI_ADMIN: [
    {
      label: 'Lolos verifikasi',
      text: 'Berkas Anda dinyatakan lengkap dan lolos verifikasi administrasi. Proses dilanjutkan ke pemeriksaan teknis/lapangan.',
    },
    {
      label: 'Sedang diverifikasi',
      text: 'Kami sedang memeriksa kelengkapan berkas Anda. Hasil verifikasi akan kami sampaikan segera.',
    },
  ],
  SURVEY_TEKNIS: [
    {
      label: 'Jadwal survei',
      text: 'Petugas DLH akan melakukan pemeriksaan lapangan ke lokasi Anda. Mohon siapkan dokumen asli dan sambut petugas saat survei.',
    },
    {
      label: 'Jadwal disusun',
      text: 'Jadwal survei lapangan sedang disusun. Tim akan menghubungi Anda untuk konfirmasi waktu dan lokasi.',
    },
  ],
  PROSES_REKOMENDASI: [
    {
      label: 'Validasi Kepala Dinas',
      text: 'Dokumen rekomendasi Anda sedang dalam proses validasi Kepala Dinas. Hasil akhir akan kami sampaikan segera.',
    },
    {
      label: 'Penyusunan naskah',
      text: 'Berkas Anda dalam tahap penyusunan naskah rekomendasi. Mohon menunggu pemberitahuan selanjutnya.',
    },
  ],
  SELESAI: [
    {
      label: 'Selamat, selesai',
      text: 'Selamat! Rekomendasi Anda telah selesai diterbitkan dan siap diambil/diunduh. Terima kasih telah menggunakan Sobat Hijau.',
    },
    {
      label: 'Dokumen final',
      text: 'Dokumen final telah diterbitkan. Anda dapat mengunduh salinan digital atau mengambilnya di kantor DLH.',
    },
  ],
  DITOLAK: [
    {
      label: 'Syarat tidak lengkap',
      text: 'Mohon maaf, berkas Anda belum dapat diproses karena syarat administrasi tidak terpenuhi. Silakan periksa kembali dan ajukan ulang.',
    },
    {
      label: 'Konsultasi perbaikan',
      text: 'Permohonan ditolak karena kelengkapan data tidak sesuai ketentuan. Hubungi kami untuk konsultasi perbaikan berkas.',
    },
  ],
};
