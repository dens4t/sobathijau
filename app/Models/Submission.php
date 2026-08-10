<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

final class Submission extends Model
{
    private const SENSITIVE_TOKENS = ['nik', 'kontak', 'telepon', 'telp', 'whatsapp', 'no_hp', '_wa'];

    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $guarded = [];

    protected $casts = [
        'formData' => 'array',
        'timeline' => 'array',
    ];

    protected static function booted(): void
    {
        // Hapus notifikasi yatim + berkas lampiran saat berkas dihapus (data hygiene).
        static::deleting(static function (Submission $sub): void {
            \App\Models\AppNotification::where('submissionId', $sub->id)->delete();

            $lampiran = is_array($sub->formData) ? ($sub->formData['lampiran'] ?? null) : null;
            if (is_array($lampiran) && isset($lampiran['id'])) {
                $disk = \Illuminate\Support\Facades\Storage::disk('local');
                foreach ($disk->files('uploads') as $f) {
                    if (str_starts_with(basename($f), $lampiran['id'].'.')) {
                        $disk->delete($f);
                    }
                }
            }
        });
    }

    /**
     * Sembunyikan nilai sensitif (NIK, kontak) untuk respons publik.
     * Admin tetap mendapat data penuh lewat endpoint ber-token.
     *
     * @return array<string, mixed>
     */
    public function maskedFormData(): array
    {
        $formData = (array) $this->formData;

        foreach ($formData as $key => $value) {
            $k = mb_strtolower((string) $key);
            $sensitive = in_array($k, ['hp', 'wa'], true)
                || str_contains($k, 'nik')
                || str_contains($k, 'kontak')
                || str_contains($k, 'telepon')
                || str_contains($k, 'telp')
                || str_contains($k, 'whatsapp')
                || str_contains($k, 'no_hp')
                || str_contains($k, '_wa');

            if ($sensitive && is_string($value) && $value !== '') {
                $formData[$key] = self::maskValue($value);
            }
        }

        return $formData;
    }

    private static function maskValue(string $value): string
    {
        $len = mb_strlen($value);
        if ($len <= 4) {
            return str_repeat('*', $len);
        }

        $head = max(2, (int) floor($len * 0.25));
        $tail = min(2, $len - $head);

        return mb_substr($value, 0, $head).str_repeat('*', $len - $head - $tail).mb_substr($value, -$tail);
    }
}
