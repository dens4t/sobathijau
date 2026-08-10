<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        RateLimiter::for('login', function (Request $request): array {
            return [
                Limit::perMinute(5)->by((string) $request->input('email', 'unknown')),
                Limit::perMinute(20)->by((string) ($request->ip() ?: 'unknown')),
            ];
        });
    }
}
