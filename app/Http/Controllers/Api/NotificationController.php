<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use Illuminate\Http\JsonResponse;

final class NotificationController extends Controller
{
    public function readAll(): JsonResponse
    {
        $rows = AppNotification::all();
        foreach ($rows as $row) {
            $row->update(['isRead' => true]);
        }

        return response()->json($rows);
    }

    public function read(string $id): JsonResponse
    {
        $row = AppNotification::findOrFail($id);
        $row->update(['isRead' => true]);

        return response()->json($row);
    }

    public function destroy(): JsonResponse
    {
        AppNotification::query()->delete();

        return response()->json(['ok' => true]);
    }
}
