<?php

namespace App\Http\Controllers\Api;

use App\Models\Service;

final class ServiceController extends ResourceController
{
    protected function modelClass(): string
    {
        return Service::class;
    }
}
