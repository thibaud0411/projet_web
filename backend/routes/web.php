<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
Route::post('/api/login', [AuthController::class, 'login'])->withoutMiddleware(['web']);
Route::post('/api/register', [AuthController::class, 'register'])->withoutMiddleware(['web']);
Route::get('/', function () {
    return view('welcome');
});
