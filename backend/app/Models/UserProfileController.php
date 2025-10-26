<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserProfileController extends Controller
{
    /**
     * Récupère les données de profil et de fidélité de l'utilisateur connecté.
     * Inclut les statistiques et les informations de parrainage.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function show()
    {
        // Récupère l'utilisateur connecté avec ses relations clés
        $user = Auth::user()->load(['statistique', 'role', 'parrainages', 'employe']);

        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        // Retourne les données pertinentes pour le dashboard
        return response()->json([
            'profile' => [
                'nom' => $user->nom,
                'prenom' => $user->prenom,
                'email' => $user->email,
                'telephone' => $user->telephone,
                'localisation' => $user->localisation,
                'role' => $user->role->nom_role ?? 'Client',
            ],
            'fidelite' => [
                'points_fidelite' => $user->points_fidelite,
                'code_parrainage' => $user->code_parrainage,
                'total_parrainages' => $user->parrainages->count(),
                'statistiques' => $user->statistique, // Contient total_commandes, total_depense, etc.
            ]
        ], 200);
    }

    /**
     * Met à jour le profil de l'utilisateur connecté.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request)
    {
        $user = Auth::user();

        // Validation des données
        $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'prenom' => 'sometimes|required|string|max:255',
            // L'email doit être unique sauf pour l'utilisateur actuel
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('utilisateur', 'email')->ignore($user->id_utilisateur, 'id_utilisateur')],
            'telephone' => 'nullable|string|max:50',
            'localisation' => 'nullable|string|max:255',
            // Pour la sécurité, la mise à jour du mot de passe est souvent gérée séparément
            // Ici, nous ne gérons que les champs de profil standards.
        ]);

        try {
            // Mise à jour des champs
            $user->update($request->only([
                'nom',
                'prenom',
                'email',
                'telephone',
                'localisation'
            ]));

            return response()->json(['message' => 'Profil mis à jour avec succès', 'user' => $user], 200);
        } catch (\Exception $e) {
            // Gérer les erreurs de base de données ou autres
            return response()->json(['message' => 'Erreur lors de la mise à jour du profil', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Gère la mise à jour du mot de passe de l'utilisateur (méthode séparée pour plus de sécurité).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updatePassword(Request $request)
    {
        $user = Auth::user();

        // Validation du mot de passe
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        // Vérifie si l'ancien mot de passe correspond
        if (!Hash::check($request->current_password, $user->mot_de_passe)) {
            return response()->json(['message' => 'L\'ancien mot de passe est incorrect.'], 403);
        }

        // Hash et met à jour le nouveau mot de passe
        $user->mot_de_passe = Hash::make($request->new_password);
        $user->save();

        return response()->json(['message' => 'Mot de passe mis à jour avec succès.'], 200);
    }
}
