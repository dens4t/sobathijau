<?php

namespace App\Http\Controllers\Api;

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

final class EnsureAdminToken
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();
        $ok = is_string($token)
            && \Illuminate\Support\Facades\DB::table('api_tokens')->where('token', $token)->exists();

        abort_unless($ok, 401, 'Unauthorized.');

        return $next($request);
    }
}
