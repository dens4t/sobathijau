<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Support\Timeline;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class ActivityLogController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate(['action' => 'required|string']);

        $log = ActivityLog::create([
            'id' => 'log-'.uniqid(),
            'action' => $data['action'],
            'timestamp' => Timeline::now(),
            'iconType' => $request->input('iconType', 'info'),
        ]);

        return response()->json($log);
    }
}
