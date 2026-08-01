<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

final class Service extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $guarded = [];

    protected $casts = [
        'fields' => 'array',
        'isCustom' => 'boolean',
    ];
}
