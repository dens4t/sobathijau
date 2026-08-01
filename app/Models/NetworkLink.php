<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

final class NetworkLink extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $guarded = [];

    protected $casts = [
        'sortOrder' => 'integer',
        'isActive' => 'boolean',
    ];
}
