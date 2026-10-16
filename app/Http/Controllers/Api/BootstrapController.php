<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CarouselSlide;
use App\Models\GeoCategory;
use App\Models\GeoLocation;
use App\Models\NetworkLink;
use App\Models\Service;
use App\Models\SiteMetric;
use App\Models\Submission;
use Illuminate\Http\JsonResponse;

final class BootstrapController extends Controller
{
    public function index(): JsonResponse
    {
        // Payload publik minimal — TANPA submissions/notifications/activityLogs
        // (privasi: sebelumnya seluruh daftar pemohon + log internal bocor ke publik).
        // Admin memakai endpoint ber-token: /api/submissions, dst.
        // Lacak per-berkas memakai endpoint publik: /api/track/{id} (ter-mask).
        return response()->json([
            'services' => Service::orderByDesc('createdAt')->get(),
            'submissions' => [],
            'notifications' => [],
            'activityLogs' => [],
            'locations' => GeoLocation::all(),
            'categories' => GeoCategory::all(),
            'networkLinks' => NetworkLink::all(),
            'carouselSlides' => CarouselSlide::orderBy('sort_order')->get()->map(
                static fn (CarouselSlide $s): array => [
                    'id' => $s->id,
                    'tag' => $s->tag,
                    'title' => $s->title,
                    'subtitle' => $s->subtitle,
                    'colorBg' => $s->color_bg,
                    'icon' => $s->icon,
                    'metric' => $s->metric,
                    'metricLabel' => $s->metric_label,
                    'bulletPoints' => (array) $s->bullet_points,
                ],
            )->values(),
            'siteMetrics' => SiteMetric::all(),
            'replyTemplates' => (new ReplyTemplateController)->index()->getData(true),
            'assistantQuestions' => (new AssistantController)->questions(),
        ]);
    }

    public function track(string $id): JsonResponse
    {
        $sub = Submission::findOrFail($id);

        return response()->json($sub->forPublicTracking());
    }
}
