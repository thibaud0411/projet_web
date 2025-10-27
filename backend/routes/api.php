<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Admin\EmployeeController;
use App\Http\Controllers\Admin\StatisticsController;

// Import new controllers
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\CategorieController;
use App\Http\Controllers\CommandeController;
use App\Http\Controllers\CommentaireController;
use App\Http\Controllers\EvenementController;
use App\Http\Controllers\LigneCommandeController;
use App\Http\Controllers\LivraisonController;
use App\Http\Controllers\PaiementController;
use App\Http\Controllers\ParrainageController;
use App\Http\Controllers\ParticipationController;
use App\Http\Controllers\PromotionController;
use App\Http\Controllers\ReclamationController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UtilisateurController;
use App\Http\Controllers\StatistiqueController;

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

// Authentication routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);


// Public product/category routes use ArticleController and CategorieController
// See below for /articles and /categories-list routes

// Public articles and categories (new controllers)
Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/articles/{id}', [ArticleController::class, 'show']);
Route::get('/categories-list', [CategorieController::class, 'index']);
Route::get('/categories-list/{id}', [CategorieController::class, 'show']);
Route::get('/categories-list/{id}/articles', [CategorieController::class, 'withArticles']);

// Public promotions
Route::get('/promotions', [PromotionController::class, 'index']);
Route::post('/promotions/validate-code', [PromotionController::class, 'validatePromoCode']);

// Public events
Route::get('/evenements', [EvenementController::class, 'index']);
Route::get('/evenements/{id}', [EvenementController::class, 'show']);

/*
|--------------------------------------------------------------------------
| PROTECTED ROUTES (Authentication Required)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    /*
    |--------------------------------------------------------------------------
    | CUSTOMER ROUTES (All authenticated users)
    |--------------------------------------------------------------------------
    */
    
    // Commandes (Orders)
    Route::apiResource('commandes', CommandeController::class);
    Route::post('/commandes/{id}/cancel', [CommandeController::class, 'cancel']);
    
    // Commentaires (Reviews)
    Route::apiResource('commentaires', CommentaireController::class);
    
    // Parrainages (Referrals)
    Route::apiResource('parrainages', ParrainageController::class);
    
    // Participations (Event participations)
    Route::apiResource('participations', ParticipationController::class);
    Route::post('/participations/{id}/mark-winner', [ParticipationController::class, 'markAsWinner']);
    
    // Reclamations (Complaints)
    Route::apiResource('reclamations', ReclamationController::class);
    
    // User Statistics
    Route::get('/utilisateurs/{id}/statistics', [UtilisateurController::class, 'statistics']);
    Route::post('/utilisateurs/{id}/points', [UtilisateurController::class, 'updatePoints']);
    
    /*
    |--------------------------------------------------------------------------
    | ADMIN ROUTES (Admin & Manager)
    |--------------------------------------------------------------------------
    */
    
    // Use explicit auth + role middleware instead of a non-existent 'admin' alias/group.
    // This avoids Laravel trying to resolve 'admin' as a container binding.
    Route::middleware(['auth:sanctum', 'role:administrateur,gerant'])->prefix('admin')->group(function () {
        
        // Statistics & Dashboard
        Route::get('/statistics', [StatisticsController::class, 'dashboard']);
        Route::get('/revenue', [StatisticsController::class, 'revenue']);
        
        // Employee Management (Admin only for creation/deletion)
        Route::get('/employees', [EmployeeController::class, 'index']);
        Route::post('/employees', [EmployeeController::class, 'store'])
            ->middleware('role:administrateur');
        Route::get('/employees/{id}', [EmployeeController::class, 'show']);
        Route::put('/employees/{id}', [EmployeeController::class, 'update'])
            ->middleware('role:administrateur');
        Route::delete('/employees/{id}', [EmployeeController::class, 'destroy'])
            ->middleware('role:administrateur');
        Route::patch('/employees/{id}/status', [EmployeeController::class, 'updateStatus']);
        
        
        // Articles Management (new controller)
        Route::apiResource('articles', ArticleController::class)->except(['index', 'show']);
        
        // Categories Management (new controller)
        Route::apiResource('categories', CategorieController::class)->except(['index', 'show']);
        
        
        // Commandes Management (new controller - full access)
        Route::get('/commandes-all', [CommandeController::class, 'index']);
        Route::patch('/commandes/{id}', [CommandeController::class, 'update']);
        
        // Ligne Commandes (Order Lines)
        Route::apiResource('ligne-commandes', LigneCommandeController::class);
        
        // Livraisons (Deliveries)
        Route::apiResource('livraisons', LivraisonController::class);
        Route::patch('/livraisons/{id}/status', [LivraisonController::class, 'updateStatus']);
        
        // Paiements (Payments)
        Route::apiResource('paiements', PaiementController::class);
        Route::post('/paiements/{id}/validate', [PaiementController::class, 'validate']);
        
        // Promotions Management
        Route::get('/promotions-admin', [PromotionController::class, 'index']);
        Route::post('/promotions-admin', [PromotionController::class, 'store']);
        Route::put('/promotions-admin/{id}', [PromotionController::class, 'update']);
        Route::delete('/promotions-admin/{id}', [PromotionController::class, 'destroy']);
        Route::post('/promotions-admin/{id}/increment', [PromotionController::class, 'incrementUsage']);
        
        // Evenements Management
        Route::get('/evenements-admin', [EvenementController::class, 'index']);
        Route::post('/evenements-admin', [EvenementController::class, 'store']);
        Route::put('/evenements-admin/{id}', [EvenementController::class, 'update']);
        Route::delete('/evenements-admin/{id}', [EvenementController::class, 'destroy']);
        
        
        // Reclamations Management (new controller - full access)
        Route::get('/reclamations-all', [ReclamationController::class, 'index']);
        Route::post('/reclamations/{id}/assign', [ReclamationController::class, 'assign']);
        Route::post('/reclamations/{id}/resolve', [ReclamationController::class, 'resolve']);
        
        // Commentaires Management
        Route::get('/commentaires-all', [CommentaireController::class, 'index']);
        Route::post('/commentaires/{id}/toggle-visibility', [CommentaireController::class, 'toggleVisibility']);
        
        // Parrainages Management
        Route::get('/parrainages-all', [ParrainageController::class, 'index']);
        Route::post('/parrainages/{id}/attribute-reward', [ParrainageController::class, 'attributeReward']);
        
        // Participations Management
        Route::get('/participations-all', [ParticipationController::class, 'index']);
        
        // User Management
        Route::apiResource('utilisateurs', UtilisateurController::class);
        Route::post('/utilisateurs/{id}/suspend', [UtilisateurController::class, 'suspend']);
        Route::post('/utilisateurs/{id}/activate', [UtilisateurController::class, 'activate']);
        
        // Role Management
        Route::apiResource('roles', RoleController::class);
        
        // Statistics Management
        Route::apiResource('statistiques', StatistiqueController::class);
        Route::get('/statistiques/user/{idUtilisateur}', [StatistiqueController::class, 'getByUser']);
        Route::post('/statistiques/user/{idUtilisateur}/increment-order', [StatistiqueController::class, 'incrementOrder']);
        Route::post('/statistiques/user/{idUtilisateur}/update-rating', [StatistiqueController::class, 'updateAverageRating']);
        
    });
});