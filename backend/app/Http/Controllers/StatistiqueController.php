<?php

namespace App\Http\Controllers;

use App\Models\Statistique;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class StatistiqueController extends Controller
{
    /**
     * Display a listing of statistics.
     */
    public function index(Request $request)
    {
        $query = Statistique::with('utilisateur');

        // Filter by user
        if ($request->has('id_utilisateur')) {
            $query->where('id_utilisateur', $request->id_utilisateur);
        }

        // Order by total spending
        if ($request->has('order_by_spending')) {
            $query->orderBy('total_depense', 'desc');
        }

        // Order by total orders
        if ($request->has('order_by_orders')) {
            $query->orderBy('total_commandes', 'desc');
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $statistiques = $query->paginate($perPage);

        return response()->json($statistiques);
    }

    /**
     * Store a newly created statistic in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_utilisateur' => 'required|exists:utilisateur,id_utilisateur|unique:statistique,id_utilisateur',
            'total_commandes' => 'nullable|integer|min:0',
            'total_depense' => 'nullable|numeric|min:0',
            'total_points_gagnes' => 'nullable|integer|min:0',
            'total_points_utilises' => 'nullable|integer|min:0',
            'total_parrainages' => 'nullable|integer|min:0',
            'note_moyenne' => 'nullable|numeric|min:0|max:5',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $statistique = Statistique::create($request->all());
        $statistique->load('utilisateur');

        return response()->json([
            'message' => 'Statistique créée avec succès',
            'data' => $statistique
        ], 201);
    }

    /**
     * Display the specified statistic.
     */
    public function show($id)
    {
        $statistique = Statistique::with('utilisateur')->find($id);

        if (!$statistique) {
            return response()->json([
                'message' => 'Statistique non trouvée'
            ], 404);
        }

        return response()->json($statistique);
    }

    /**
     * Get statistics by user ID.
     */
    public function getByUser($idUtilisateur)
    {
        $statistique = Statistique::with('utilisateur')->where('id_utilisateur', $idUtilisateur)->first();

        if (!$statistique) {
            return response()->json([
                'message' => 'Statistique non trouvée pour cet utilisateur'
            ], 404);
        }

        return response()->json($statistique);
    }

    /**
     * Update the specified statistic in storage.
     */
    public function update(Request $request, $id)
    {
        $statistique = Statistique::find($id);

        if (!$statistique) {
            return response()->json([
                'message' => 'Statistique non trouvée'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'total_commandes' => 'nullable|integer|min:0',
            'total_depense' => 'nullable|numeric|min:0',
            'total_points_gagnes' => 'nullable|integer|min:0',
            'total_points_utilises' => 'nullable|integer|min:0',
            'total_parrainages' => 'nullable|integer|min:0',
            'note_moyenne' => 'nullable|numeric|min:0|max:5',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $statistique->update($request->all());
        $statistique->load('utilisateur');

        return response()->json([
            'message' => 'Statistique mise à jour avec succès',
            'data' => $statistique
        ]);
    }

    /**
     * Increment order count and spending for a user.
     */
    public function incrementOrder(Request $request, $idUtilisateur)
    {
        $validator = Validator::make($request->all(), [
            'montant' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $statistique = Statistique::firstOrCreate(
            ['id_utilisateur' => $idUtilisateur],
            [
                'total_commandes' => 0,
                'total_depense' => 0,
                'total_points_gagnes' => 0,
                'total_points_utilises' => 0,
                'total_parrainages' => 0,
                'note_moyenne' => 0,
            ]
        );

        $statistique->increment('total_commandes');
        $statistique->increment('total_depense', $request->montant);

        return response()->json([
            'message' => 'Statistique mise à jour',
            'data' => $statistique->fresh()
        ]);
    }

    /**
     * Update average rating for a user.
     */
    public function updateAverageRating($idUtilisateur, Request $request)
    {
        $validator = Validator::make($request->all(), [
            'note_moyenne' => 'required|numeric|min:0|max:5',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $statistique = Statistique::where('id_utilisateur', $idUtilisateur)->first();

        if (!$statistique) {
            return response()->json([
                'message' => 'Statistique non trouvée'
            ], 404);
        }

        $statistique->update(['note_moyenne' => $request->note_moyenne]);

        return response()->json([
            'message' => 'Note moyenne mise à jour',
            'data' => $statistique
        ]);
    }

    /**
     * Remove the specified statistic from storage.
     */
    public function destroy($id)
    {
        $statistique = Statistique::find($id);

        if (!$statistique) {
            return response()->json([
                'message' => 'Statistique non trouvée'
            ], 404);
        }

        $statistique->delete();

        return response()->json([
            'message' => 'Statistique supprimée avec succès'
        ]);
    }
}
