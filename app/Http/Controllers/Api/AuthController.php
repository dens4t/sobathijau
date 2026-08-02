<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

final class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Email atau password salah.'], 401);
        }

        $token = Str::random(60);
        \Illuminate\Support\Facades\DB::table('api_tokens')->insert([
            'user_id' => $user->id,
            'token' => $token,
            'created_at' => now(),
        ]);

        // Prune token tua (> 30 hari) agar tabel tidak membengkak
        \Illuminate\Support\Facades\DB::table('api_tokens')
            ->where('created_at', '<', now()->subDays(30))
            ->delete();

        return response()->json([
            'token' => $token,
            'name' => $user->name,
        ]);
    }
}
