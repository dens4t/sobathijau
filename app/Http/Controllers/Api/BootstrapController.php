<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\AppNotification;
use App\Models\GeoCategory;
use App\Models\GeoLocation;
use App\Models\NetworkLink;
use App\Models\Service;
use App\Models\Submission;
use Illuminate\Http\JsonResponse;

final class BootstrapController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'services' => Service::all(),
            'submissions' => Submission::all(),
            'notifications' => AppNotification::all(),
            'activityLogs' => ActivityLog::all(),
            'locations' => GeoLocation::all(),
            'categories' => GeoCategory::all(),
            'networkLinks' => NetworkLink::all(),
        ]);
    }
}
