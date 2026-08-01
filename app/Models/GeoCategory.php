<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

final class GeoCategory extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $table = 'categories';

    public $timestamps = false;

    protected $guarded = [];

    protected $casts = [
        'order' => 'integer',
    ];
}
