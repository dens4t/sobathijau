<?php

namespace App\Http\Controllers\Api;

use App\Models\AppNotification;
use App\Models\Submission;
use App\Support\Timeline;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

final class SubmissionController extends ResourceController
{
    protected function modelClass(): string
    {
        return Submission::class;
    }

    // Endpoint publik: whitelist field agar attacker tidak bisa mengirim status/timeline
    // arbitrer (mis. SELESAI) — server selalu memaksa status DIAJUKAN + timeline awal.
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'id' => 'required|string|max:40',
            'serviceId' => 'required|string',
            'serviceName' => 'required|string',
            'applicantName' => 'required|string|max:120',
            'formData' => 'nullable|array',
            'submittedAt' => 'nullable|string',
        ]);

        $sub = Submission::create([
            'id' => $data['id'],
            'serviceId' => $data['serviceId'],
            'serviceName' => $data['serviceName'],
            'applicantName' => $data['applicantName'],
            'formData' => $data['formData'] ?? [],
            'submittedAt' => $data['submittedAt'] ?? Timeline::now(),
            'status' => 'DIAJUKAN',
            'timeline' => Timeline::build(Timeline::now()),
        ]);

        return response()->json($sub, 201);
    }

    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(array_keys(Timeline::STATUS_LABELS))],
            'adminNote' => 'sometimes|string',
        ]);

        $status = $data['status'];
        abort_unless(array_key_exists($status, Timeline::STATUS_LABELS), 422, 'Status tidak valid.');

        $sub = Submission::findOrFail($id);
        $adminNote = $request->input('adminNote');
        $date = Timeline::now();

        $timeline = Timeline::update((array) $sub->timeline, $status, $adminNote, $date);
        $sub->fill(['status' => $status, 'timeline' => $timeline])->save();

        // Balasan admin (dari template cepat / teks kustom) menjadi isi notifikasi pemohon.
        $message = is_string($adminNote) && trim($adminNote) !== ''
            ? trim($adminNote)
            : match ($status) {
                'DITOLAK' => 'Permohonan '.$sub->serviceName.' ('.$sub->id.') ditolak: syarat berkas tidak terpenuhi.',
                'DIKEMBALIKAN' => 'Permohonan '.$sub->serviceName.' ('.$sub->id.') dikembalikan: mohon sesuaikan data/lampiran lalu ajukan ulang.',
                default => 'Status berkas '.$sub->serviceName.' ('.$sub->id.') diperbarui menjadi ['.Timeline::STATUS_LABELS[$status].'].',
            };

        $notification = AppNotification::create([
            'id' => 'notif-'.self::randomId(),
            'submissionId' => $sub->id,
            'applicantName' => $sub->applicantName,
            'serviceName' => $sub->serviceName,
            'newStatus' => $status,
            'message' => $message,
            'timestamp' => $date,
            'isRead' => false,
        ]);

        return response()->json(['submission' => $sub->fresh(), 'notification' => $notification]);
    }

    private static function randomId(int $length = 7): string
    {
        $chars = '0123456789abcdefghijklmnopqrstuvwxyz';
        $out = '';
        for ($i = 0; $i < $length; $i++) {
            $out .= $chars[random_int(0, 35)];
        }

        return $out;
    }
}
