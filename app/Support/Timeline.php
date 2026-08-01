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
        'DITOLAK' => 'BERKAS DITOLAK / DIKEMBALIKAN',
    ];

    public static function now(): string
    {
        return date('Y-m-d H:i');
    }

    public static function update(array $timeline, string $newStatus, ?string $note = null, ?string $date = null): array
    {
        $date ??= self::now();
        $target = $newStatus === 'DITOLAK' ? 'VERIFIKASI_ADMIN' : $newStatus;
        $targetIdx = array_search($target, self::STATUS_ORDER, true);

        return array_map(static function (array $step) use ($newStatus, $note, $date, $targetIdx): array {
            $completed = array_search($step['status'], self::STATUS_ORDER, true) <= $targetIdx;
            $isTarget = $step['status'] === $newStatus
                || ($newStatus === 'DITOLAK' && $step['status'] === 'VERIFIKASI_ADMIN');

            $step['title'] = $isTarget && $newStatus === 'DITOLAK' ? 'Pemberitahuan Ditolak' : $step['title'];
            $step['description'] = $isTarget && $newStatus === 'DITOLAK'
                ? ($note ?: 'Sarat administratif tidak terpenuhi. Silakan periksa kembali berkas Anda atau hubungi admin.')
                : $step['description'];
            $step['isCompleted'] = $isTarget || $completed;
            $step['updatedAt'] = $isTarget ? $date : ($step['updatedAt'] ?? '-');
            if ($step['status'] === $newStatus) {
                $step['notes'] = $note;
            }

            return $step;
        }, $timeline);
    }
}
