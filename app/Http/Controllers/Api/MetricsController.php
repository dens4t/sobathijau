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
        $data = $request->validate($this->slideRules());

        $slide = CarouselSlide::findOrFail($id);
        $this->fillSlide($slide, $data)->save();

        return response()->json($slide->fresh());
    }

    public function storeCarouselSlide(Request $request): JsonResponse
    {
        $data = $request->validate($this->slideRules());

        $slide = $this->fillSlide(new CarouselSlide, $data);
        $slide->id = 'slide-'.uniqid();
        $slide->sort_order = (int) (CarouselSlide::max('sort_order') ?? 0) + 1;
        $slide->save();

        return response()->json($slide->fresh(), 201);
    }

    public function destroyCarouselSlide(string $id): JsonResponse
    {
        CarouselSlide::findOrFail($id)->delete();

        return response()->json(['ok' => true]);
    }

    /** @return array<string, mixed> */
    private function slideRules(): array
    {
        return [
            'tag' => 'required|string|max:60',
            'title' => 'required|string|max:120',
            'subtitle' => 'required|string|max:200',
            'colorBg' => 'required|string|max:80',
            'icon' => 'required|string|max:30',
            'metric' => 'required|string|max:40',
            'metricLabel' => 'required|string|max:80',
            'bulletPoints' => 'array',
            'bulletPoints.*' => 'string|max:200',
        ];
    }

    private function fillSlide(CarouselSlide $slide, array $data): CarouselSlide
    {
        return $slide->fill([
            'tag' => $data['tag'],
            'title' => $data['title'],
            'subtitle' => $data['subtitle'],
            'color_bg' => $data['colorBg'],
            'icon' => $data['icon'],
            'metric' => $data['metric'],
            'metric_label' => $data['metricLabel'],
            'bullet_points' => $data['bulletPoints'] ?? [],
        ]);
    }
}
