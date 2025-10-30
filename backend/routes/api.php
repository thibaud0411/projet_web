<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// --- Imports des Contrôleurs (fusionnés et dé-doublonnés) ---
use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\ClaimController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DashboardEmployeeController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\OrderController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Voici le fichier de routes API consolidé.
|
*/

// --- Route d'authentification (provenant du bloc 2) ---
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// --- Routes pour les Dashboards ---
// Note : Les deux routes ont été conservées car elles pointent vers des contrôleurs différents.
Route::get('/dashboard-stats', [DashboardEmployeeController::class, 'getStats']); // Pour EmployeeDashboard.tsx
Route::get('/dashboard/stats', [DashboardController::class, 'getStats']); // Pour un autre dashboard (admin?)

// --- Route pour la Gestion des Employés (provenant du bloc 2) ---
Route::apiResource('employees', EmployeeController::class);

// --- Routes pour la Gestion du Menu (EmployeeMenuPage.tsx) ---
Route::get('/menu-items', [ArticleController::class, 'index']);
Route::patch('/menu-items/{id}', [ArticleController::class, 'update']);

// --- Routes pour les Commandes (EmployeeOrdersPage.tsx) ---
// Note : Nous gardons ces routes explicites du bloc 1 car elles incluent 'show',
// ce que le 'apiResource' partiel du bloc 2 n'avait pas.
Route::get('/orders', [OrderController::class, 'index']);
Route::patch('/orders/{id}', [OrderController::class, 'update']);
Route::get('/orders/{id}', [OrderController::class, 'show']);

// --- Routes pour les Réclamations (EmployeeClaimsPage.tsx) ---
// Note : Nous gardons ces routes explicites du bloc 1 car elles incluent la route 'reply',
// ce que le 'apiResource' partiel du bloc 2 n'avait pas.
Route::get('/claims', [ClaimController::class, 'index']);
Route::patch('/claims/{reclamation}', [ClaimController::class, 'update']);
Route::patch('/claims/{reclamation}/reply', [ClaimController::class, 'reply']);
