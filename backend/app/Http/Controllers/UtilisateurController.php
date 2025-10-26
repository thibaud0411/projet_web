<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\Utilisateur;

class UtilisateurController extends Controller
{
    /**
     * Récupère les informations de profil et les statistiques.
     */
    public function getProfileAndStats(Request $request)
    {
        try {
            $user = Auth::user(); // maintenant Utilisateur

            if (!$user) {
                return response()->json(['message' => 'Non authentifié.'], 401);
            }

            $profileData = [
                'id_utilisateur' => $user->id_utilisateur,
                'nom' => $user->nom,
                'prenom' => $user->prenom,
                'email' => $user->email,
                'points_fidelite' => $user->points_fidelite ?? 0,
            ];

            Log::info('Profile récupéré pour user: ' . $user->id_utilisateur);

            return response()->json([
                'success' => true,
                'data' => $profileData
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur récupération profil: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Impossible de récupérer le profil.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
