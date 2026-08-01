<?php

namespace App\Http\Controllers\Api;

use App\Models\NetworkLink;

final class NetworkLinkController extends ResourceController
{
    protected function modelClass(): string
    {
        return NetworkLink::class;
    }
}
