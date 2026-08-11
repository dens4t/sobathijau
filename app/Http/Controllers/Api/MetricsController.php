<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CarouselSlide;
use App\Models\SiteMetric;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class MetricsController extends Controller
{
    public function updateSiteMetric(Request $request, string $key): JsonResponse
    {
        $data = $request->validate([
            'value' => 'required|string|max:50',
            'label' => 'required|string|max:80',
        ]);

        $metric = SiteMetric::updateOrCreate(
            ['key' => $key],
            ['value' => $data['value'], 'label' => $data['label']],
        );

        return response()->json($metric);
    }

    public function updateCarouselSlide(Request $request, string $id): JsonResponse
    {
        $data = $request->validate([
            'tag' => 'required|string|max:60',
            'title' => 'required|string|max:120',
            'subtitle' => 'required|string|max:200',
            'colorBg' => 'required|string|max:80',
            'icon' => 'required|string|max:30',
            'metric' => 'required|string|max:40',
            'metricLabel' => 'required|string|max:80',
            'bulletPoints' => 'array',
            'bulletPoints.*' => 'string|max:200',
        ]);

        $slide = CarouselSlide::findOrFail($id);

        $slide->fill([
            'tag' => $data['tag'],
            'title' => $data['title'],
            'subtitle' => $data['subtitle'],
            'color_bg' => $data['colorBg'],
            'icon' => $data['icon'],
            'metric' => $data['metric'],
            'metric_label' => $data['metricLabel'],
            'bullet_points' => $data['bulletPoints'] ?? [],
        ])->save();

        return response()->json($slide->fresh());
    }
}
