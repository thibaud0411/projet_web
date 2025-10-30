<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ClaimController;
use App\Http\Controllers\Api\DashboardEmployeeController;
use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\OrderController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });

// --- Routes pour le Dashboard Employé (EmployeeDashboard.tsx) ---
Route::get('/dashboard-stats', [DashboardEmployeeController::class, 'getStats']);

// --- Routes pour la Gestion du Menu (EmployeeMenuPage.tsx) ---
Route::get('/menu-items', [ArticleController::class, 'index']);
Route::patch('/menu-items/{id}', [ArticleController::class, 'update']);

// --- Routes pour les Commandes (EmployeeOrdersPage.tsx) ---
Route::get('/orders', [OrderController::class, 'index']);
Route::patch('/orders/{id}', [OrderController::class, 'update']);
Route::get('/orders/{id}', [OrderController::class, 'show']);

// --- Routes pour les Réclamations (EmployeeClaimsPage.tsx) ---
Route::get('/claims', [ClaimController::class, 'index']);
Route::patch('/claims/{reclamation}', [ClaimController::class, 'update']);
Route::patch('/claims/{reclamation}/reply', [ClaimController::class, 'reply']);