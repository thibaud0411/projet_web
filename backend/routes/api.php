<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\EmployeeController; // Importez EmployeeController
use App\Http\Controllers\Api\ClaimController; // Importez ClaimController
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\DashboardController; // Importez DashboardController
Route::apiResource('employees', EmployeeController::class);
Route::apiResource('orders', OrderController::class)->only(['index', 'update']);
Route::apiResource('claims', ClaimController::class)->only(['index', 'update']);
Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});