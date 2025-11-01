<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class UtilisateurController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request)
    {
        $query = Utilisateur::with(['role', 'employe']);

        // Filter by role
        if ($request->has('id_role')) {
            $query->where('id_role', $request->id_role);
        }

        // Filter by account status
        if ($request->has('statut_compte')) {
            $query->where('statut_compte', $request->statut_compte);
        }

        // Search by name or email
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nom', 'like', '%' . $search . '%')
                  ->orWhere('prenom', 'like', '%' . $search . '%')
                  ->orWhere('email', 'like', '%' . $search . '%');
            });
        }

        // Order by registration date
        $query->orderBy('date_inscription', 'desc');

        // Pagination
        $perPage = $request->get('per_page', 15);
        $utilisateurs = $query->paginate($perPage);

        return response()->json($utilisateurs);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'email' => 'required|string|email|max:150|unique:utilisateur,email',
            'mot_de_passe' => 'required|string|min:8',
            'telephone' => 'nullable|string|max:20',
            'localisation' => 'nullable|string',
            'id_role' => 'required|exists:role,id_role',
            'statut_compte' => 'sometimes|in:actif,inactif,suspendu',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Generate unique referral code
        $codeParrainage = strtoupper(Str::random(8));

        $utilisateur = Utilisateur::create([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'email' => $request->email,
            'mot_de_passe' => Hash::make($request->mot_de_passe),
            'telephone' => $request->telephone,
            'localisation' => $request->localisation,
            'id_role' => $request->id_role,
            'statut_compte' => $request->statut_compte ?? 'actif',
            'code_parrainage' => $codeParrainage,
            'points_fidelite' => 0,
        ]);

        $utilisateur->load('role');

        return response()->json([
            'message' => 'Utilisateur créé avec succès',
            'data' => $utilisateur
        ], 201);
    }

    /**
     * Display the specified user.
     */
    public function show($id)
    {
        $utilisateur = Utilisateur::with([
            'role',
            'employe',
            'commandes',
            'reclamations',
            'statistique',
            'parrainages'
        ])->find($id);

        if (!$utilisateur) {
            return response()->json([
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        return response()->json($utilisateur);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, $id)
    {
        $utilisateur = Utilisateur::find($id);

        if (!$utilisateur) {
            return response()->json([
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'nom' => 'sometimes|string|max:100',
            'prenom' => 'sometimes|string|max:100',
            'email' => 'sometimes|string|email|max:150|unique:utilisateur,email,' . $id . ',id_utilisateur',
            'mot_de_passe' => 'sometimes|string|min:8',
            'telephone' => 'nullable|string|max:20',
            'localisation' => 'nullable|string',
            'id_role' => 'sometimes|exists:role,id_role',
            'statut_compte' => 'sometimes|in:actif,inactif,suspendu',
            'points_fidelite' => 'sometimes|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->except(['mot_de_passe']);

        // Hash password if provided
        if ($request->has('mot_de_passe')) {
            $data['mot_de_passe'] = Hash::make($request->mot_de_passe);
        }

        $utilisateur->update($data);
        $utilisateur->load('role');

        return response()->json([
            'message' => 'Utilisateur mis à jour avec succès',
            'data' => $utilisateur
        ]);
    }

    /**
     * Update user's loyalty points.
     */
    public function updatePoints(Request $request, $id)
    {
        $utilisateur = Utilisateur::find($id);

        if (!$utilisateur) {
            return response()->json([
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'points' => 'required|integer',
            'action' => 'required|in:add,subtract,set',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        switch ($request->action) {
            case 'add':
                $utilisateur->increment('points_fidelite', $request->points);
                break;
            case 'subtract':
                $newPoints = max(0, $utilisateur->points_fidelite - $request->points);
                $utilisateur->update(['points_fidelite' => $newPoints]);
                break;
            case 'set':
                $utilisateur->update(['points_fidelite' => max(0, $request->points)]);
                break;
        }

        return response()->json([
            'message' => 'Points de fidélité mis à jour',
            'data' => $utilisateur->fresh()
        ]);
    }

    /**
     * Get user statistics.
     */
    public function statistics($id)
    {
        $utilisateur = Utilisateur::with([
            'statistique',
            'commandes' => function($query) {
                $query->selectRaw('id_utilisateur, COUNT(*) as total_commandes, SUM(montant_total) as total_depense')
                      ->groupBy('id_utilisateur');
            }
        ])->find($id);

        if (!$utilisateur) {
            return response()->json([
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        return response()->json([
            'utilisateur' => $utilisateur->only(['id_utilisateur', 'nom', 'prenom', 'email']),
            'statistique' => $utilisateur->statistique,
            'points_fidelite' => $utilisateur->points_fidelite,
        ]);
    }

    /**
     * Suspend a user account.
     */
    public function suspend($id)
    {
        $utilisateur = Utilisateur::find($id);

        if (!$utilisateur) {
            return response()->json([
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        $utilisateur->update(['statut_compte' => 'suspendu']);

        return response()->json([
            'message' => 'Compte utilisateur suspendu',
            'data' => $utilisateur
        ]);
    }

    /**
     * Activate a user account.
     */
    public function activate($id)
    {
        $utilisateur = Utilisateur::find($id);

        if (!$utilisateur) {
            return response()->json([
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        $utilisateur->update(['statut_compte' => 'actif']);

        return response()->json([
            'message' => 'Compte utilisateur activé',
            'data' => $utilisateur
        ]);
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy($id)
    {
        $utilisateur = Utilisateur::find($id);

        if (!$utilisateur) {
            return response()->json([
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        $utilisateur->delete();

        return response()->json([
            'message' => 'Utilisateur supprimé avec succès'
        ]);
    }
}
