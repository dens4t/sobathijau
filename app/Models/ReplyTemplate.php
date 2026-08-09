<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

final class ReplyTemplate extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $guarded = [];

    protected $casts = [
        'sort_order' => 'integer',
    ];
}
