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
        $model = $this->upsert($request);
        \App\Support\ActivityLogger::log(class_basename($this->modelClass()).' ditambah: '.($model->id ?? ''), 'success');

        return response()->json($model);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $model = $this->upsert($request, $id);
        \App\Support\ActivityLogger::log(class_basename($this->modelClass()).' diperbarui: '.$id, 'info');

        return response()->json($model);
    }

    public function destroy(string $id): JsonResponse
    {
        $class = $this->modelClass();
        $class::findOrFail($id)->delete();
        \App\Support\ActivityLogger::log(class_basename($class).' dihapus: '.$id, 'warning');

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
