<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\CommandeController;
use App\Http\Controllers\ReclamationController;
use App\Http\Controllers\UtilisateurController;
use App\Http\Controllers\CategorieController; // Ajouté

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Ces routes sont chargées par le RouteServiceProvider et assignées au 
| middleware 'api'.
|
*/

// =========================================================================
// ROUTES PUBLIQUES (Ouvertes aux invités)
// =========================================================================

// Authentification
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// 1. Articles / Menu (lecture publique)
Route::get('/articles', [ArticleController::class, 'index']); // Liste des articles paginée et filtrable
Route::get('/articles/{id_article}', [ArticleController::class, 'show']); // Détail d'un article

// 2. Catégories (lecture publique pour navigation du menu)
Route::get('/categories', [CategorieController::class, 'index']); // Liste de toutes les catégories actives
Route::get('/categories/{id_categorie}', [CategorieController::class, 'show']); // Détail d'une catégorie et ses articles

// =========================================================================
// ROUTES PROTÉGÉES (ACCÈS APRÈS CONNEXION avec 'auth:sanctum')
// =========================================================================
Route::middleware('auth:sanctum')->group(function () {

    // 3. Profil utilisateur et statistiques
    Route::get('/utilisateur/profile', [UtilisateurController::class, 'getProfileAndStats']);
    // Suggestion : Route pour permettre la mise à jour du profil (vous devez créer la méthode updateProfile dans UtilisateurController)
    Route::put('/utilisateur/profile', [UtilisateurController::class, 'updateProfile']); 
    
    // 4. Commandes
    Route::post('/commandes', [CommandeController::class, 'store']); // Créer une nouvelle commande
    Route::get('/commandes/historique', [CommandeController::class, 'historique']); // Historique des commandes de l'utilisateur

    // 5. Réclamations
    Route::post('/reclamations', [ReclamationController::class, 'store']); // Créer une nouvelle réclamation

    // 6. Déconnexion
    Route::post('/logout', [AuthController::class, 'logout']);
});
