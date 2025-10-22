<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\StatisticsController;

Route::post('/register', [RegisterController::class, 'register']);
Route::post('/login', [LoginController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::resource('users', UserController::class)->only(['index', 'store', 'update', 'destroy', 'show']);
    Route::post('/referral/generate', [UserController::class, 'generateReferralCode']);
    Route::post('/complaint/submit', [UserController::class, 'submitComplaint']);

    Route::get('/statistics', [StatisticsController::class, 'index']);
    Route::get('/statistics/weekly-sales', [StatisticsController::class, 'weeklySales']);
    Route::get('/statistics/top-clients', [StatisticsController::class, 'topClients']);
});