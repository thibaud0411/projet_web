<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Admin\EmployeeController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\PromotionController;
use App\Http\Controllers\Admin\EventController;
use App\Http\Controllers\Admin\ComplaintController;
use App\Http\Controllers\Admin\StatisticsController;
use App\Http\Controllers\Admin\SettingsController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Public product/category routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/categories', [ProductController::class, 'categories']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Admin & Gerant only routes
    Route::middleware('role:administrateur,gerant')->prefix('admin')->group(function () {
        
        // Statistics & Dashboard
        Route::get('/statistics', [StatisticsController::class, 'dashboard']);
        Route::get('/revenue', [StatisticsController::class, 'revenue']);
        
        // Employee Management (Admin only for creation)
        Route::get('/employees', [EmployeeController::class, 'index']);
        Route::post('/employees', [EmployeeController::class, 'store'])
            ->middleware('role:administrateur');
        Route::get('/employees/{id}', [EmployeeController::class, 'show']);
        Route::put('/employees/{id}', [EmployeeController::class, 'update'])
            ->middleware('role:administrateur');
        Route::delete('/employees/{id}', [EmployeeController::class, 'destroy'])
            ->middleware('role:administrateur');
        Route::patch('/employees/{id}/status', [EmployeeController::class, 'updateStatus']);
        
        // Product Management
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{id}', [ProductController::class, 'update']);
        Route::delete('/products/{id}', [ProductController::class, 'destroy']);
        Route::patch('/products/{id}/availability', [ProductController::class, 'toggleAvailability']);
        Route::patch('/products/{id}/plat-du-jour', [ProductController::class, 'togglePlatDuJour']);
        
        // Order Management
        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{id}', [OrderController::class, 'show']);
        Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus']);
        
        // Promotion Management
        Route::get('/promotions', [PromotionController::class, 'index']);
        Route::post('/promotions', [PromotionController::class, 'store']);
        Route::put('/promotions/{id}', [PromotionController::class, 'update']);
        Route::delete('/promotions/{id}', [PromotionController::class, 'destroy']);
        Route::patch('/promotions/{id}/toggle', [PromotionController::class, 'toggle']);
        
        // Event Management
        Route::get('/events', [EventController::class, 'index']);
        Route::post('/events', [EventController::class, 'store']);
        Route::put('/events/{id}', [EventController::class, 'update']);
        Route::delete('/events/{id}', [EventController::class, 'destroy']);
        Route::get('/events/{id}/participants', [EventController::class, 'participants']);
        
        // Complaint Management
        Route::get('/complaints', [ComplaintController::class, 'index']);
        Route::get('/complaints/{id}', [ComplaintController::class, 'show']);
        Route::patch('/complaints/{id}/status', [ComplaintController::class, 'updateStatus']);
        Route::post('/complaints/{id}/respond', [ComplaintController::class, 'respond']);
        
        // Settings (Admin only)
        Route::middleware('role:administrateur')->group(function () {
            Route::get('/settings', [SettingsController::class, 'index']);
            Route::put('/settings', [SettingsController::class, 'update']);
            Route::get('/settings/horaires', [SettingsController::class, 'horaires']);
            Route::put('/settings/horaires', [SettingsController::class, 'updateHoraires']);
        });
    });
});