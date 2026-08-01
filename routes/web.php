<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', function (): string {
    return file_get_contents(public_path('app.html'));
});

Route::get('/{any}', function (Request $request): mixed {
    if (str_starts_with($request->path(), 'api/')) {
        return response('Not Found', 404);
    }

    return file_get_contents(public_path('app.html'));
})->where('any', '.*');
