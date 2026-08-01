<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

final class SiteMetric extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $guarded = [];
}
