<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

final class GeoLocation extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $table = 'locations';

    public $timestamps = false;

    protected $guarded = [];

    protected $casts = [
        'lat' => 'float',
        'lng' => 'float',
    ];
}
