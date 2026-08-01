<?php

namespace App\Http\Controllers\Api;

use App\Models\GeoLocation;

final class LocationController extends ResourceController
{
    protected function modelClass(): string
    {
        return GeoLocation::class;
    }
}
