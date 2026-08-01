<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

abstract class ResourceController extends Controller
{
    abstract protected function modelClass(): string;

    public function index(): JsonResponse
    {
        return response()->json(($this->modelClass())::all());
    }

    public function store(Request $request): JsonResponse
    {
        return response()->json($this->upsert($request));
    }

    public function update(Request $request, string $id): JsonResponse
    {
        return response()->json($this->upsert($request, $id));
    }

    public function destroy(string $id): JsonResponse
    {
        $class = $this->modelClass();
        $class::findOrFail($id)->delete();

        return response()->json(['ok' => true]);
    }

    protected function upsert(Request $request, ?string $id = null): Model
    {
        $data = $request->all();
        $data['id'] = $id ?? ($data['id'] ?? null);
        abort_unless(is_string($data['id']) && $data['id'] !== '', 422, 'id wajib diisi.');

        $class = $this->modelClass();
        $model = $class::find($data['id']) ?? new $class;
        $model->fill($data)->save();

        return $model->fresh();
    }
}
