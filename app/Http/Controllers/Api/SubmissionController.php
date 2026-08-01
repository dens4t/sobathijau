<?php

namespace App\Http\Controllers\Api;

use App\Models\AppNotification;
use App\Models\Submission;
use App\Support\Timeline;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class SubmissionController extends ResourceController
{
    protected function modelClass(): string
    {
        return Submission::class;
    }

    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $data = $request->validate(['status' => 'required|string']);

        $sub = Submission::findOrFail($id);
        $status = $data['status'];
        $adminNote = $request->input('adminNote');
        $date = Timeline::now();

        $timeline = Timeline::update((array) $sub->timeline, $status, $adminNote, $date);
        $sub->fill(['status' => $status, 'timeline' => $timeline])->save();

        $message = $status === 'DITOLAK'
            ? "Permohonan {$sub->serviceName} ({$sub->id}) ditolak: \"".($adminNote ?: 'Syarat berkas tidak terpenuhi').'"'
            : 'Status berkas '.$sub->serviceName.' ('.$sub->id.') diperbarui menjadi ['.Timeline::STATUS_LABELS[$status].'].';

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
