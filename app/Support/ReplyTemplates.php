<?php

namespace App\Support;

/**
 * Template balasan default — sumber tunggal untuk seeder & fallback
 * (saat tabel reply_templates belum termigrasi di server).
 */
final class ReplyTemplates
{
    /** @return array<int, array{id: string, label: string, status: string, text: string, sort_order: int}> */
    public static function defaults(): array
    {
        return [
            ['id' => 'tpl-diajukan-1', 'label' => 'Tindak lanjut awal', 'status' => 'DIAJUKAN', 'text' => 'Laporan Anda akan segera kami tindaklanjuti. Mohon menunggu konfirmasi berikutnya dari petugas.', 'sort_order' => 1],
            ['id' => 'tpl-diajukan-2', 'label' => 'Berkas diterima', 'status' => 'DIAJUKAN', 'text' => 'Berkas Anda telah kami terima dan tercatat di sistem Sobat Hijau. Tim DLH akan memverifikasi kelengkapan administrasi dalam 1–3 hari kerja.', 'sort_order' => 2],
            ['id' => 'tpl-verifikasi-1', 'label' => 'Lolos verifikasi', 'status' => 'VERIFIKASI_ADMIN', 'text' => 'Berkas Anda dinyatakan lengkap dan lolos verifikasi administrasi. Proses dilanjutkan ke pemeriksaan teknis/lapangan.', 'sort_order' => 3],
            ['id' => 'tpl-verifikasi-2', 'label' => 'Sedang diverifikasi', 'status' => 'VERIFIKASI_ADMIN', 'text' => 'Kami sedang memeriksa kelengkapan berkas Anda. Hasil verifikasi akan kami sampaikan segera.', 'sort_order' => 4],
            ['id' => 'tpl-survei-1', 'label' => 'Jadwal survei', 'status' => 'SURVEY_TEKNIS', 'text' => 'Petugas DLH akan melakukan pemeriksaan lapangan ke lokasi Anda. Mohon siapkan dokumen asli dan sambut petugas saat survei.', 'sort_order' => 5],
            ['id' => 'tpl-survei-2', 'label' => 'Jadwal disusun', 'status' => 'SURVEY_TEKNIS', 'text' => 'Jadwal survei lapangan sedang disusun. Tim akan menghubungi Anda untuk konfirmasi waktu dan lokasi.', 'sort_order' => 6],
            ['id' => 'tpl-rekomendasi-1', 'label' => 'Validasi Kepala Dinas', 'status' => 'PROSES_REKOMENDASI', 'text' => 'Dokumen rekomendasi Anda sedang dalam proses validasi Kepala Dinas. Hasil akhir akan kami sampaikan segera.', 'sort_order' => 7],
            ['id' => 'tpl-rekomendasi-2', 'label' => 'Penyusunan naskah', 'status' => 'PROSES_REKOMENDASI', 'text' => 'Berkas Anda dalam tahap penyusunan naskah rekomendasi. Mohon menunggu pemberitahuan selanjutnya.', 'sort_order' => 8],
            ['id' => 'tpl-selesai-1', 'label' => 'Selamat, selesai', 'status' => 'SELESAI', 'text' => 'Selamat! Rekomendasi Anda telah selesai diterbitkan dan siap diambil/diunduh. Terima kasih telah menggunakan Sobat Hijau.', 'sort_order' => 9],
            ['id' => 'tpl-selesai-2', 'label' => 'Dokumen final', 'status' => 'SELESAI', 'text' => 'Dokumen final telah diterbitkan. Anda dapat mengunduh salinan digital atau mengambilnya di kantor DLH.', 'sort_order' => 10],
            ['id' => 'tpl-ditolak-1', 'label' => 'Syarat tidak lengkap', 'status' => 'DITOLAK', 'text' => 'Mohon maaf, berkas Anda belum dapat diproses karena syarat administrasi tidak terpenuhi. Silakan periksa kembali dan ajukan ulang.', 'sort_order' => 11],
            ['id' => 'tpl-ditolak-2', 'label' => 'Konsultasi perbaikan', 'status' => 'DITOLAK', 'text' => 'Permohonan ditolak karena kelengkapan data tidak sesuai ketentuan. Hubungi kami untuk konsultasi perbaikan berkas.', 'sort_order' => 12],
            ['id' => 'tpl-dikembalikan-1', 'label' => 'Perbaikan data/lampiran', 'status' => 'DIKEMBALIKAN', 'text' => 'Mohon maaf, berkas Anda kami kembalikan karena ada data atau lampiran yang perlu disesuaikan. Silakan perbaiki sesuai catatan lalu ajukan ulang.', 'sort_order' => 13],
            ['id' => 'tpl-dikembalikan-2', 'label' => 'Lampiran tidak lengkap', 'status' => 'DIKEMBALIKAN', 'text' => 'Berkas dikembalikan: lampiran tidak lengkap atau tidak sesuai ketentuan. Mohon lengkapi lalu kirim ulang melalui Sobat Hijau.', 'sort_order' => 14],
        ];
    }
}
