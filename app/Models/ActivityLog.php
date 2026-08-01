<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

final class ActivityLog extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $guarded = [];
}
