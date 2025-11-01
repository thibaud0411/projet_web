<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthenticatedSessionController extends Controller
{
    /**
     * Handle an incoming authentication request.
     */
    public function store(Request $request): Response
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        // Find user by email
        $user = Utilisateur::where('email', $request->email)->first();

        // Check if user exists and password is correct
        if (!$user || !Hash::check($request->password, $user->mot_de_passe)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants fournis sont incorrects.'],
            ]);
        }

        // Check if account is active
        if (!$user->statut_compte || !$user->est_actif) {
            throw ValidationException::withMessages([
                'email' => ['Votre compte est désactivé. Veuillez contacter l\'administrateur.'],
            ]);
        }

        // Load role relationship
        $user->load('role');

        // Create token for API authentication
        $token = $user->createToken('auth-token')->plainTextToken;

        return response([
            'user' => [
                'id' => $user->id_utilisateur,
                'nom' => $user->nom,
                'prenom' => $user->prenom,
                'email' => $user->email,
                'telephone' => $user->telephone,
                'role' => $user->role->nom_role ?? 'client',
                'points_fidelite' => $user->points_fidelite,
            ],
            'token' => $token,
            'message' => 'Connexion réussie',
        ], 200);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): Response
    {
        // Revoke current token
        $request->user()->currentAccessToken()->delete();

        return response([
            'message' => 'Déconnexion réussie',
        ], 200);
    }
}
