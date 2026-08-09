<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\AppNotification;
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
        return response()->json([
            'services' => Service::orderByDesc('createdAt')->get(),
            'submissions' => Submission::all()->map(static function (Submission $sub): Submission {
                // Publik: sembunyikan NIK/kontak; admin memakai /api/submissions (ber-token) utk data penuh.
                $sub->formData = $sub->maskedFormData();

                return $sub;
            })->values(),
            'notifications' => AppNotification::all(),
            'activityLogs' => ActivityLog::orderBy('timestamp', 'desc')->get(),
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
}
