<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

final class UploadController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'file' => 'required|file|max:5120|mimes:pdf,jpeg,jpg,png,doc,docx',
        ]);

        $file = $data['file'];
        $id = Str::random(24);
        $ext = $file->getClientOriginalExtension() ?: 'bin';
        $file->storeAs('uploads', $id.'.'.$ext, 'local');

        return response()->json([
            'id' => $id,
            'name' => $file->getClientOriginalName(),
            'size' => $file->getSize(),
            'type' => $file->getMimeType(),
        ], 201);
    }

    /** Unduh berkas lampiran — hanya untuk admin (auth.token). */
    public function download(string $fileId)
    {
        $files = glob(config('filesystems.disks.local.root').'/uploads/'.$fileId.'.*');

        if (! $files) {
            abort(404, 'Berkas tidak ditemukan.');
        }

        return response()->download($files[0]);
    }
}
