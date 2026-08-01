<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DlhFeed;
use App\Services\InstagramFeed;
use Illuminate\Http\JsonResponse;

final class FeedController extends Controller
{
    public function index(DlhFeed $dlh, InstagramFeed $instagram): JsonResponse
    {
        return response()->json([
            'website' => $dlh->get(),
            'instagram' => $instagram->get(),
        ]);
    }
}
