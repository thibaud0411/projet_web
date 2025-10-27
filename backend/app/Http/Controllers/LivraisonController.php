<?php

namespace App\Http\Controllers;

use App\Models\Livraison;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LivraisonController extends Controller
{
    /**
     * Display a listing of deliveries.
     */
    public function index(Request $request)
    {
        $query = Livraison::with('commande');

        // Filter by delivery status
        if ($request->has('statut_livraison')) {
            $query->where('statut_livraison', $request->statut_livraison);
        }

        // Filter by delivery person
        if ($request->has('id_livreur')) {
            $query->where('id_livreur', $request->id_livreur);
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->whereDate('heure_livraison', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->whereDate('heure_livraison', '<=', $request->date_to);
        }

        // Order by delivery time
        $query->orderBy('heure_livraison', 'desc');

        // Pagination
        $perPage = $request->get('per_page', 15);
        $livraisons = $query->paginate($perPage);

        return response()->json($livraisons);
    }

    /**
     * Store a newly created delivery in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_commande' => 'required|exists:commande,id_commande',
            'adresse_livraison' => 'required|string',
            'heure_livraison' => 'nullable|date',
            'statut_livraison' => 'sometimes|in:en_attente,en_cours,livree,annulee',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'instructions_livraison' => 'nullable|string',
            'id_livreur' => 'nullable|exists:employe,id_employe',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $livraison = Livraison::create($request->all());
        $livraison->load('commande');

        return response()->json([
            'message' => 'Livraison créée avec succès',
            'data' => $livraison
        ], 201);
    }

    /**
     * Display the specified delivery.
     */
    public function show($id)
    {
        $livraison = Livraison::with('commande.utilisateur')->find($id);

        if (!$livraison) {
            return response()->json([
                'message' => 'Livraison non trouvée'
            ], 404);
        }

        return response()->json($livraison);
    }

    /**
     * Update the specified delivery in storage.
     */
    public function update(Request $request, $id)
    {
        $livraison = Livraison::find($id);

        if (!$livraison) {
            return response()->json([
                'message' => 'Livraison non trouvée'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'adresse_livraison' => 'sometimes|string',
            'heure_livraison' => 'nullable|date',
            'statut_livraison' => 'sometimes|in:en_attente,en_cours,livree,annulee',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'instructions_livraison' => 'nullable|string',
            'id_livreur' => 'nullable|exists:employe,id_employe',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $livraison->update($request->all());
        $livraison->load('commande');

        return response()->json([
            'message' => 'Livraison mise à jour avec succès',
            'data' => $livraison
        ]);
    }

    /**
     * Update delivery status.
     */
    public function updateStatus(Request $request, $id)
    {
        $livraison = Livraison::find($id);

        if (!$livraison) {
            return response()->json([
                'message' => 'Livraison non trouvée'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'statut_livraison' => 'required|in:en_attente,en_cours,livree,annulee',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $livraison->update(['statut_livraison' => $request->statut_livraison]);

        return response()->json([
            'message' => 'Statut de livraison mis à jour',
            'data' => $livraison
        ]);
    }

    /**
     * Remove the specified delivery from storage.
     */
    public function destroy($id)
    {
        $livraison = Livraison::find($id);

        if (!$livraison) {
            return response()->json([
                'message' => 'Livraison non trouvée'
            ], 404);
        }

        $livraison->delete();

        return response()->json([
            'message' => 'Livraison supprimée avec succès'
        ]);
    }
}
