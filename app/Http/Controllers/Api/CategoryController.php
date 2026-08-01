<?php

namespace App\Http\Controllers\Api;

use App\Models\GeoCategory;

final class CategoryController extends ResourceController
{
    protected function modelClass(): string
    {
        return GeoCategory::class;
    }
}
