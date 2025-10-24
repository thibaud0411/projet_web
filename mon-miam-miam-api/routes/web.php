<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\CategorieController;
use App\Http\Controllers\PromotionController;
use App\Http\Controllers\EvenementController;
use App\Http\Controllers\CommandeController;
use App\Http\Controllers\CommentaireController;
use App\Http\Controllers\Admin\StatisticsController;

Route::get('/', function () {
    return view('welcome');
});

/*
|--------------------------------------------------------------------------
| PUBLIC API ROUTES
|--------------------------------------------------------------------------
*/

// Authentication
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/register', [AuthController::class, 'register'])->name('register');

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
| PROTECTED API ROUTES
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Customer routes
    Route::apiResource('commandes', CommandeController::class);
    Route::apiResource('commentaires', CommentaireController::class);
    
    // Admin routes
    Route::middleware('role:administrateur,gerant')->prefix('admin')->group(function () {
        Route::get('/statistics', [StatisticsController::class, 'dashboard']);
        Route::get('/revenue', [StatisticsController::class, 'revenue']);
        
        // Articles Management
        Route::apiResource('articles', ArticleController::class)->except(['index', 'show']);
        
        // Categories Management  
        Route::apiResource('categories', CategorieController::class)->except(['index', 'show']);
        
        // Commandes Management
        Route::get('/commandes-all', [CommandeController::class, 'index']);
        Route::patch('/commandes/{id}', [CommandeController::class, 'update']);
    });
});
