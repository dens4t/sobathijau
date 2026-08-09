<?php

namespace App\Support;

final class Timeline
{
    public const STATUS_ORDER = ['DIAJUKAN', 'VERIFIKASI_ADMIN', 'SURVEY_TEKNIS', 'PROSES_REKOMENDASI', 'SELESAI'];

    public const STATUS_LABELS = [
        'DIAJUKAN' => 'DIAJUKAN',
        'VERIFIKASI_ADMIN' => 'VERIFIKASI ADMINISTRASI',
        'SURVEY_TEKNIS' => 'SURVEI TEKNIS LAPANGAN',
        'PROSES_REKOMENDASI' => 'PROSES PENYUSUNAN REKOMENDASI',
        'SELESAI' => 'SELESAI, REKOMENDASI SIAP DIUNDUH',
        'DITOLAK' => 'BERKAS DITOLAK',
        'DIKEMBALIKAN' => 'DIKEMBALIKAN KE PEMOHON',
    ];

    public static function now(): string
    {
        return date('Y-m-d H:i');
    }

    /** Timeline awal (5 tahapan kanonik) — mirror src/lib/timeline.ts createTimeline(). */
    public static function build(string $date): array
    {
        return [
            ['status' => 'DIAJUKAN', 'title' => 'Berkas Diterima', 'description' => 'Permohonan Anda berhasil masuk ke database Sobat Hijau DLH.', 'updatedAt' => $date, 'isCompleted' => true],
            ['status' => 'VERIFIKASI_ADMIN', 'title' => 'Verifikasi Administrasi', 'description' => 'Pemeriksaan kesesuaian berkas dan kelengkapan data oleh petugas.', 'updatedAt' => '-', 'isCompleted' => false],
            ['status' => 'SURVEY_TEKNIS', 'title' => 'Pemeriksaan Teknis / Lapangan', 'description' => 'Peninjauan langsung ke lokasi dan identifikasi parameter lapangan.', 'updatedAt' => '-', 'isCompleted' => false],
            ['status' => 'PROSES_REKOMENDASI', 'title' => 'Penerbitan Surat Rekomendasi', 'description' => 'Format naskah surat dan validasi dari kepala dinas.', 'updatedAt' => '-', 'isCompleted' => false],
            ['status' => 'SELESAI', 'title' => 'Selesai & Serah Terima', 'description' => 'Dokumen final telah diterbitkan dan siap diunduh atau diambil.', 'updatedAt' => '-', 'isCompleted' => false],
        ];
    }

    public static function update(array $timeline, string $newStatus, ?string $note = null, ?string $date = null): array
    {
        $date ??= self::now();
        $isReturn = in_array($newStatus, ['DITOLAK', 'DIKEMBALIKAN'], true);
        $target = $isReturn ? 'VERIFIKASI_ADMIN' : $newStatus;
        $targetIdx = array_search($target, self::STATUS_ORDER, true);

        return array_map(static function (array $step) use ($newStatus, $note, $date, $targetIdx, $isReturn): array {
            $completed = array_search($step['status'], self::STATUS_ORDER, true) <= $targetIdx;
            $isTarget = $step['status'] === $newStatus
                || ($isReturn && $step['status'] === 'VERIFIKASI_ADMIN');

            $step['title'] = $isTarget && $isReturn
                ? ($newStatus === 'DIKEMBALIKAN' ? 'Dikembalikan ke Pemohon' : 'Pemberitahuan Ditolak')
                : $step['title'];
            $step['description'] = $isTarget && $isReturn
                ? ($note ?: ($newStatus === 'DIKEMBALIKAN'
                    ? 'Berkas dikembalikan untuk penyesuaian data/lampiran. Silakan perbaiki dan ajukan ulang.'
                    : 'Sarat administratif tidak terpenuhi. Silakan periksa kembali berkas Anda atau hubungi admin.'))
                : $step['description'];
            $step['isCompleted'] = $isTarget || $completed;
            $step['updatedAt'] = $isTarget ? $date : ($step['updatedAt'] ?? '-');
            if ($isTarget) {
                $step['notes'] = $note;
            }

            return $step;
        }, $timeline);
    }
}
