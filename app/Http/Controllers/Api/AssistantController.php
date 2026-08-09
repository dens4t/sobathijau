<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AssistantQuestion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class AssistantController extends Controller
{
    /** @return array<int, string> */
    public function questions(): array
    {
        return AssistantQuestion::orderBy('sort_order')->pluck('question')->all();
    }

    public function answer(Request $request): JsonResponse
    {
        $data = $request->validate(['message' => 'required|string']);
        $prompt = mb_strtolower($data['message']);

        $response = null;
        foreach (AssistantQuestion::all() as $row) {
            $keywords = (array) $row->keywords;
            if (count(array_filter($keywords, static fn (string $k): bool => str_contains($prompt, $k))) > 0) {
                $response = $row->answer;
                break;
            }
        }

        $response ??= 'Terima kasih atas pertanyaan Anda mengenai Dinas Lingkungan Hidup. Melalui portal Sobat Hijau ini, Anda dapat mengajukan dokumen SPPL, pengujian uji lab sampel udara/air, pengajuan bibit, dan pengaduan pencemaran lingkungan. Semua permohonan ini bersifat dinamis, dapat dilacak secara instan, dan dirancang mudah digunakan oleh seluruh lapisan masyarakat termasuk penyandang disabilitas.';

        return response()->json(['text' => $response]);
    }
}
