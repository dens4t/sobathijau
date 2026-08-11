<?php

use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\AssistantController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BootstrapController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ExportController;
use App\Http\Controllers\Api\FeedController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\MetricsController;
use App\Http\Controllers\Api\NetworkLinkController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ReplyTemplateController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\SubmissionController;
use App\Http\Controllers\Api\UploadController;
use Illuminate\Support\Facades\Route;

Route::get('/bootstrap', [BootstrapController::class, 'index']);

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');
Route::post('/submissions', [SubmissionController::class, 'store']);
Route::get('/assistant/questions', [AssistantController::class, 'questions']);
Route::post('/assistant', [AssistantController::class, 'answer']);
Route::get('/feed', [FeedController::class, 'index']);
Route::post('/uploads', [UploadController::class, 'store'])->middleware('throttle:10,1');

Route::middleware('auth.token')->group(function (): void {
    Route::get('/services', [ServiceController::class, 'index']);
    Route::post('/services', [ServiceController::class, 'store']);
    Route::put('/services/{id}', [ServiceController::class, 'update']);
    Route::delete('/services/{id}', [ServiceController::class, 'destroy']);

    Route::get('/submissions', [SubmissionController::class, 'index']);
    Route::put('/submissions/{id}/status', [SubmissionController::class, 'updateStatus']);
    Route::delete('/submissions/{id}', [SubmissionController::class, 'destroy']);

    Route::put('/notifications/read-all', [NotificationController::class, 'readAll']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'read']);
    Route::delete('/notifications', [NotificationController::class, 'destroy']);

    Route::get('/locations', [LocationController::class, 'index']);
    Route::post('/locations', [LocationController::class, 'store']);
    Route::put('/locations/{id}', [LocationController::class, 'update']);
    Route::delete('/locations/{id}', [LocationController::class, 'destroy']);

    Route::get('/categories', [CategoryController::class, 'index']);
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

    Route::get('/network-links', [NetworkLinkController::class, 'index']);
    Route::get('/network-links/all', [NetworkLinkController::class, 'index']);
    Route::post('/network-links', [NetworkLinkController::class, 'store']);
    Route::put('/network-links/{id}', [NetworkLinkController::class, 'update']);
    Route::delete('/network-links/{id}', [NetworkLinkController::class, 'destroy']);

    Route::get('/export/locations/{format}', [ExportController::class, 'locations'])
        ->where('format', 'csv|kml|kmz|xlsx|shp');

    Route::get('/export/submissions/{format}', [ExportController::class, 'submissions'])
        ->where('format', 'csv|xlsx');

    Route::get('/uploads/{fileId}', [UploadController::class, 'download']);

    Route::put('/site-metrics/{key}', [MetricsController::class, 'updateSiteMetric']);
    Route::post('/carousel-slides', [MetricsController::class, 'storeCarouselSlide']);
    Route::put('/carousel-slides/{id}', [MetricsController::class, 'updateCarouselSlide']);
    Route::delete('/carousel-slides/{id}', [MetricsController::class, 'destroyCarouselSlide']);

    Route::get('/reply-templates', [ReplyTemplateController::class, 'index']);
    Route::post('/reply-templates', [ReplyTemplateController::class, 'store']);
    Route::put('/reply-templates/{id}', [ReplyTemplateController::class, 'update']);
    Route::delete('/reply-templates/{id}', [ReplyTemplateController::class, 'destroy']);

    Route::post('/activity-logs', [ActivityLogController::class, 'store']);
});
