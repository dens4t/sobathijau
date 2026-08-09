<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

final class Submission extends Model
{
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
        // Hapus notifikasi yatim saat berkas dihapus (data hygiene).
        static::deleting(static function (Submission $sub): void {
            \App\Models\AppNotification::where('submissionId', $sub->id)->delete();
        });
    }
}
