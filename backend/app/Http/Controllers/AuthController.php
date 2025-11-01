<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'password' => 'required|min:8',
            ]);

            // Find user by email
            $user = Utilisateur::where('email', $validated['email'])->first();

            if (!$user) {
                return response()->json([
                    'message' => 'Ces identifiants ne correspondent à aucun compte.',
                    'errors' => ['email' => ['Utilisateur non trouvé.']]
                ], 422);
            }

            // Verify password
            if (!Hash::check($validated['password'], $user->mot_de_passe)) {
                return response()->json([
                    'message' => 'Ces identifiants ne correspondent à aucun compte.',
                    'errors' => ['password' => ['Mot de passe incorrect.']]
                ], 422);
            }

            // Vérifier si le compte est actif
            if (!$user->est_actif || !$user->statut_compte) {
                return response()->json([
                    'message' => 'Ce compte a été désactivé.',
                    'errors' => ['account' => ['Compte inactif']]
                ], 403);
            }

            

            // Generate token
            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'user' => $user,
                'token' => $token,
                'message' => 'Connexion réussie'
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Login error:', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Une erreur est survenue lors de la connexion.',
                'errors' => ['general' => [$e->getMessage()]]
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Déconnexion réussie']);
    }
}