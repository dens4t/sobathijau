<?php

use App\Http\Controllers\Api\BootstrapController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\NetworkLinkController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\SubmissionController;
use Illuminate\Support\Facades\Route;

Route::get('/bootstrap', [BootstrapController::class, 'index']);

Route::get('/services', [ServiceController::class, 'index']);
Route::post('/services', [ServiceController::class, 'store']);
Route::put('/services/{id}', [ServiceController::class, 'update']);
Route::delete('/services/{id}', [ServiceController::class, 'destroy']);

Route::get('/submissions', [SubmissionController::class, 'index']);
Route::post('/submissions', [SubmissionController::class, 'store']);
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
