<?php

use Illuminate\Http\Request; // Corrigé de HttpRequest
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

/*
|--------------------------------------------------------------------------
| Imports des Contrôleurs (Fusionnés)
|--------------------------------------------------------------------------
*/

// --- Contrôleurs de Fichier 1 (uniques) ---
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DashboardEmployeeController;

// --- Contrôleurs de Fichier 2 (principaux) ---
use App\Http\Controllers\AuthController; // Note : Non utilisé dans la version finale, mais conservé au cas où
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Admin\EmployeeController;
use App\Http\Controllers\Admin\StatisticsController;
use App\Http\Controllers\Admin\SettingsController;
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
| ROUTES D'AUTHENTIFICATION PUBLIQUES
| (Using Laravel Breeze Controllers)
|--------------------------------------------------------------------------
*/

// Include Breeze auth routes
require __DIR__.'/auth.php';

// Order routes
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('orders', 'App\Http\Controllers\Api\OrderController');
    
    // Additional order status update route
    Route::patch('orders/{order}/status', 'App\Http\Controllers\Api\OrderController@updateStatus');
});


/*
|--------------------------------------------------------------------------
| AUTRES ROUTES PUBLIQUES
| (Provenant du Fichier 2)
|--------------------------------------------------------------------------
*/

// Public articles and categories
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
| ROUTES PROTÉGÉES (Authentification Requise)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    
    // --- Route /user (Get authenticated user) ---
    Route::get('/user', function (Request $request) {
        $user = $request->user();
        $user->load('role'); // S'assurer que le rôle est chargé
        return response()->json([
            'id' => $user->id_utilisateur,
            'nom' => $user->nom,
            'prenom' => $user->prenom,
            'email' => $user->email,
            'telephone' => $user->telephone,
            'role' => $user->role->nom_role ?? 'client',
            'points_fidelite' => $user->points_fidelite,
        ]);
    });

    // --- Routes Dashboard (Uniques de Fichier 1) ---
    Route::get('/dashboard-stats', [DashboardEmployeeController::class, 'getStats']);
    Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);

    /*
    |--------------------------------------------------------------------------
    | ROUTES CLIENT (Tous les utilisateurs authentifiés - Fichier 2)
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
    | ROUTES ADMIN (Admin & Manager - Fichier 2)
    |--------------------------------------------------------------------------
    */
    
    Route::middleware(['auth:sanctum', 'role:administrateur,gerant'])->prefix('admin')->group(function () {
        
        // Statistics & Dashboard
        Route::get('/statistics', [StatisticsController::class, 'dashboard']);
        Route::get('/revenue', [StatisticsController::class, 'revenue']);
        
        // Employee Management
        Route::get('/employees', [EmployeeController::class, 'index']);
        Route::post('/employees', [EmployeeController::class, 'store'])
            ->middleware('role:administrateur');
        Route::get('/employees/{id}', [EmployeeController::class, 'show']);
        Route::put('/employees/{id}', [EmployeeController::class, 'update'])
            ->middleware('role:administrateur');
        Route::delete('/employees/{id}', [EmployeeController::class, 'destroy'])
            ->middleware('role:administrateur');
        Route::patch('/employees/{id}/status', [EmployeeController::class, 'updateStatus']);
        
        
        // Articles Management
        Route::apiResource('articles', ArticleController::class)->except(['index', 'show']);
        
        // Categories Management
        Route::apiResource('categories', CategorieController::class)->except(['index', 'show']);
        
        
        // Commandes Management
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
        
        
        // Reclamations Management
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
        
        // Settings Management
        Route::get('/settings', [SettingsController::class, 'index']);
        Route::put('/settings', [SettingsController::class, 'update']);
        Route::get('/settings/horaires', [SettingsController::class, 'getHoraires']);
        Route::put('/settings/horaires', [SettingsController::class, 'updateHoraires']);
        
    });
});