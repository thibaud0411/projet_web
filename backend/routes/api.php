<?php

use Illuminate\HttpRequest;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth; // Ajout de l'import Auth
use Illuminate\Validation\ValidationException; // Ajout de l'import ValidationException

// --- Imports des Contrôleurs (fusionnés et dé-doublonnés) ---
use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\ClaimController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DashboardEmployeeController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\OrderController;

Route::post('/login', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    // --- CORRECTION : Mapper 'password' (requête) vers 'mot_de_passe' (DB) ---
    $credentials = [
        'email' => $request->email,
        'mot_de_passe' => $request->password,
    ];

    if (! Auth::attempt($credentials, $request->boolean('remember'))) {
    // --- FIN CORRECTION ---
        throw ValidationException::withMessages([
            'email' => __('auth.failed'),
        ]);
    }

    $request->session()->regenerate();

    // Renvoie une réponse 204 (No Content) pour indiquer le succès
    return response()->noContent(); 
});

Route::post('/logout', function (Request $request) {
    Auth::guard('web')->logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();
    return response()->noContent();
})->middleware('auth:sanctum'); // Le logout nécessite d'être authentifié

// --- FIN DES NOUVELLES ROUTES D'AUTH ---


// --- Route d'authentification (existante) ---
// --- CORRECTION : Suppression de la route dupliquée. On garde celle-ci : ---
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    // <<< MODIFICATION : Charger le rôle avec l'utilisateur >>>
    $user = $request->user();
    $user->load('role'); // Charge la relation 'role'
    return $user;
    // --- FIN MODIFICATION ---
});
// La route dupliquée qui était ici a été supprimée.


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
