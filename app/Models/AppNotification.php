<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

final class AppNotification extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $table = 'notifications';

    public $timestamps = false;

    protected $guarded = [];

    protected $casts = [
        'isRead' => 'boolean',
    ];
}
