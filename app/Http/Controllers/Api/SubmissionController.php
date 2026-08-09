<?php

namespace App\Http\Controllers\Api;

use App\Models\AppNotification;
use App\Models\Submission;
use App\Support\Timeline;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

final class SubmissionController extends ResourceController
{
    protected function modelClass(): string
    {
        return Submission::class;
    }

    // Endpoint publik: wajib validasi penuh agar payload cacat tidak masuk DB / 500.
    // ponytail: validasi per-field layanan (syarat isian dinamis) tetap di frontend;
    // tambah rules per-service di sini bila perlu server-side strict.
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'id' => 'required|string|max:50',
            'serviceId' => 'required|string|max:50',
            'serviceName' => 'required|string',
            'applicantName' => 'required|string',
            'status' => ['required', Rule::in(array_keys(Timeline::STATUS_LABELS))],
            'formData' => 'required|array',
            'submittedAt' => 'required|date',
            'timeline' => ['required', 'array', function (string $attr, mixed $value, Closure $fail): void {
                $steps = array_values($value);
                if (count($steps) !== count(Timeline::STATUS_ORDER)) {
                    $fail('Timeline harus memuat seluruh tahapan proses.');

                    return;
                }
                foreach (array_values($steps) as $i => $step) {
                    $expected = Timeline::STATUS_ORDER[$i];
                    foreach (['status', 'title', 'description', 'updatedAt', 'isCompleted'] as $key) {
                        if (! array_key_exists($key, $step)) {
                            $fail("Step $i: field \"$key\" wajib ada.");

                            return;
                        }
                    }
                    if ($step['status'] !== $expected) {
                        $fail("Step $i harus berstatus $expected.");

                        return;
                    }
                }
            }],
        ]);

        return response()->json(Submission::create($data), 201);
    }

    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(array_keys(Timeline::STATUS_LABELS))],
            'adminNote' => 'sometimes|string',
        ]);

        $sub = Submission::findOrFail($id);
        $status = $data['status'];
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
