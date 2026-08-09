<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ReplyTemplate;
use App\Support\ReplyTemplates as ReplyTemplateDefaults;
use App\Support\Timeline;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;

final class ReplyTemplateController extends Controller
{
    /**
     * Index publik (juga dipakai bootstrap). Jika tabel belum termigrasi
     * (server lama), kembali ke template default bawaan agar tidak 500.
     */
    public function index(): JsonResponse
    {
        return response()->json($this->all());
    }

    public function store(Request $request): JsonResponse
    {
        $this->ensureMigrated();

        $data = $request->validate($this->rules());

        $template = ReplyTemplate::create([
            'id' => $data['id'] ?? 'tpl-'.uniqid(),
            'label' => $data['label'],
            'status' => $data['status'],
            'text' => $data['text'],
            'sort_order' => $data['sortOrder'] ?? $this->nextSortOrder(),
        ]);

        return response()->json($template, 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $this->ensureMigrated();

        $template = ReplyTemplate::findOrFail($id);
        $data = $request->validate($this->rules());

        $template->fill([
            'label' => $data['label'],
            'status' => $data['status'],
            'text' => $data['text'],
            'sort_order' => $data['sortOrder'] ?? $template->sort_order,
        ])->save();

        return response()->json($template->fresh());
    }

    public function destroy(string $id): JsonResponse
    {
        $this->ensureMigrated();

        ReplyTemplate::findOrFail($id)->delete();

        return response()->json(['ok' => true]);
    }

    /** @return array<int, array<string, mixed>> */
    private function all(): array
    {
        if (! Schema::hasTable('reply_templates')) {
            return ReplyTemplateDefaults::defaults();
        }

        return ReplyTemplate::orderBy('sort_order')->get()->map(
            static fn (ReplyTemplate $t): array => [
                'id' => $t->id,
                'label' => $t->label,
                'status' => $t->status,
                'text' => $t->text,
                'sortOrder' => $t->sort_order,
            ],
        )->values()->all();
    }

    /** @return array<string, mixed> */
    private function rules(): array
    {
        return [
            'id' => 'sometimes|string|max:50',
            'label' => 'required|string|max:80',
            'status' => ['required', Rule::in(array_keys(Timeline::STATUS_LABELS))],
            'text' => 'required|string|max:1000',
            'sortOrder' => 'sometimes|integer',
        ];
    }

    private function nextSortOrder(): int
    {
        return (int) (ReplyTemplate::max('sort_order') ?? 0) + 1;
    }

    private function ensureMigrated(): void
    {
        abort_unless(Schema::hasTable('reply_templates'), 503, 'Tabel template belum tersedia di server. Jalankan php artisan migrate.');
    }
}
