<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user - Uses Supabase Auth
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'email' => 'required|string|email|max:150|unique:users',
            'telephone' => 'required|string|max:20',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'sometimes|in:administrateur,gerant,employe,etudiant'
        ]);

        $supabaseUrl = env('SUPABASE_URL');
        $supabaseKey = env('SUPABASE_ANON_KEY');

        try {
            // Step 1: Create auth user in Supabase (password stored there)
            $authResponse = Http::withOptions([
                'verify' => false, // Disable SSL verification for development
            ])->withHeaders([
                'apikey' => $supabaseKey,
                'Content-Type' => 'application/json',
            ])->post("{$supabaseUrl}/auth/v1/signup", [
                'email' => $validated['email'],
                'password' => $validated['password'],
                'email_confirm' => true,
            ]);

            if (!$authResponse->successful()) {
                throw new \Exception('Erreur lors de la création du compte: ' . $authResponse->body());
            }

            $authData = $authResponse->json();
            $supabaseUserId = $authData['user']['id'];

            // Step 2: Create user profile in YOUR users table (no password!)
            $user = User::create([
                'id' => $supabaseUserId,  // Use UUID from Supabase auth
                'nom' => $validated['nom'],
                'prenom' => $validated['prenom'],
                'email' => $validated['email'],
                'telephone' => $validated['telephone'],
                'role' => $validated['role'] ?? 'etudiant',
                'statut_compte' => 'actif',
                'email_verified_at' => now(),
            ]);

            // Step 3: Generate Laravel Sanctum token for API access
            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'user' => $user,
                'token' => $token,
                'supabase_token' => $authData['access_token'],
                'message' => 'Inscription réussie'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de l\'inscription',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Login user - Uses Supabase Auth
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:8',
        ]);

        // Check Supabase configuration
        $supabaseUrl = env('SUPABASE_URL');
        $supabaseKey = env('SUPABASE_ANON_KEY');
        
        if (!$supabaseUrl || !$supabaseKey) {
            return response()->json([
                'message' => 'Configuration Supabase manquante. Vérifiez SUPABASE_URL et SUPABASE_ANON_KEY dans .env',
                'error' => 'missing_config'
            ], 500);
        }
        
        try {
            // Call Supabase Auth API
            $response = Http::withOptions([
                'verify' => false, // Disable SSL verification for development
            ])->withHeaders([
                'apikey' => $supabaseKey,
                'Content-Type' => 'application/json',
            ])->post("{$supabaseUrl}/auth/v1/token?grant_type=password", [
                'email' => $request->email,
                'password' => $request->password,
            ]);

            // Log response for debugging
            \Log::info('Supabase Auth Response', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            if (!$response->successful()) {
                $errorBody = $response->json();
                return response()->json([
                    'message' => 'Identifiants incorrects',
                    'error' => $errorBody['error_description'] ?? 'Invalid credentials',
                    'debug' => [
                        'status' => $response->status(),
                        'supabase_url' => $supabaseUrl
                    ]
                ], 422);
            }

            $authData = $response->json();
            $supabaseUserId = $authData['user']['id'] ?? null;

            if (!$supabaseUserId) {
                return response()->json([
                    'message' => 'Réponse Supabase invalide',
                    'error' => 'no_user_id'
                ], 500);
            }

            // Get user profile from your users table
            $user = User::where('id', $supabaseUserId)->first();

            if (!$user) {
                return response()->json([
                    'message' => 'Profil utilisateur non trouvé. Créez le profil dans la table users.',
                    'error' => 'user_profile_not_found',
                    'supabase_user_id' => $supabaseUserId
                ], 404);
            }

            // Create Laravel Sanctum token for API access
            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'user' => $user,
                'token' => $token,
                'message' => 'Connexion réussie'
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Login error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Erreur de connexion',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Déconnexion réussie'
        ]);
    }

    /**
     * Get authenticated user
     */
    public function user(Request $request)
    {
        return response()->json($request->user());
    }
}
