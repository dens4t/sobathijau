<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

final class SiteMetric extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $primaryKey = 'key';

    public $timestamps = false;

    protected $guarded = [];
}
