<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\EmployeeController;

Route::get('/', function () {
    return view('welcome');
});
Route::prefix('api')->group(function () {
    Route::apiResource('employees', EmployeeController::class);
});
