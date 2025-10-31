<?php

namespace App\Http\Controllers;

use App\Models\Reclamation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReclamationController extends Controller
{
    /**
     * Display a listing of complaints.
     */
    public function index(Request $request)
    {
        try {
            $query = Reclamation::with(['utilisateur', 'commande', 'employe']);

            // Filter by user
            if ($request->has('id_utilisateur')) {
                $query->where('id_utilisateur', $request->id_utilisateur);
            }

            // Filter by order
            if ($request->has('id_commande')) {
                $query->where('id_commande', $request->id_commande);
            }

            // Filter by status
            if ($request->has('statut')) {
                $query->where('statut', $request->statut);
            }

            // Filter by priority
            if ($request->has('priorite')) {
                $query->where('priorite', $request->priorite);
            }

            // Filter by employee
            if ($request->has('id_employe_traitement')) {
                $query->where('id_employe_traitement', $request->id_employe_traitement);
            }

            // Order by priority and date
            $query->orderByRaw("FIELD(priorite, 'urgent', 'haute', 'moyenne', 'basse')")
                  ->orderBy('date_reclamation', 'desc');

            // Pagination
            $perPage = $request->get('per_page', 15);
            $reclamations = $query->paginate($perPage);

            return response()->json($reclamations);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des réclamations',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    /**
     * Store a newly created complaint in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_utilisateur' => 'required|exists:utilisateur,id_utilisateur',
            'id_commande' => 'nullable|exists:commande,id_commande',
            'description' => 'required|string',
            'priorite' => 'sometimes|in:basse,moyenne,haute,urgent',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $reclamation = Reclamation::create(array_merge($request->all(), [
            'statut' => 'en_attente',
            'priorite' => $request->priorite ?? 'moyenne',
        ]));

        $reclamation->load(['utilisateur', 'commande']);

        return response()->json([
            'message' => 'Réclamation créée avec succès',
            'data' => $reclamation
        ], 201);
    }

    /**
     * Display the specified complaint.
     */
    public function show($id)
    {
        $reclamation = Reclamation::with(['utilisateur', 'commande', 'employe'])->find($id);

        if (!$reclamation) {
            return response()->json([
                'message' => 'Réclamation non trouvée'
            ], 404);
        }

        return response()->json($reclamation);
    }

    /**
     * Update the specified complaint in storage.
     */
    public function update(Request $request, $id)
    {
        $reclamation = Reclamation::find($id);

        if (!$reclamation) {
            return response()->json([
                'message' => 'Réclamation non trouvée'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'statut' => 'sometimes|in:en_attente,en_cours,resolue,fermee',
            'reponse' => 'nullable|string',
            'priorite' => 'sometimes|in:basse,moyenne,haute,urgent',
            'id_employe_traitement' => 'nullable|exists:employe,id_employe',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $reclamation->update($request->all());
        $reclamation->load(['utilisateur', 'commande', 'employe']);

        return response()->json([
            'message' => 'Réclamation mise à jour avec succès',
            'data' => $reclamation
        ]);
    }

    /**
     * Assign complaint to an employee.
     */
    public function assign(Request $request, $id)
    {
        $reclamation = Reclamation::find($id);

        if (!$reclamation) {
            return response()->json([
                'message' => 'Réclamation non trouvée'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'id_employe_traitement' => 'required|exists:employe,id_employe',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $reclamation->update([
            'id_employe_traitement' => $request->id_employe_traitement,
            'statut' => 'en_cours',
        ]);

        $reclamation->load('employe');

        return response()->json([
            'message' => 'Réclamation assignée avec succès',
            'data' => $reclamation
        ]);
    }

    /**
     * Resolve a complaint.
     */
    public function resolve(Request $request, $id)
    {
        $reclamation = Reclamation::find($id);

        if (!$reclamation) {
            return response()->json([
                'message' => 'Réclamation non trouvée'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'reponse' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $reclamation->update([
            'reponse' => $request->reponse,
            'statut' => 'resolue',
        ]);

        return response()->json([
            'message' => 'Réclamation résolue avec succès',
            'data' => $reclamation
        ]);
    }

    /**
     * Remove the specified complaint from storage.
     */
    public function destroy($id)
    {
        $reclamation = Reclamation::find($id);

        if (!$reclamation) {
            return response()->json([
                'message' => 'Réclamation non trouvée'
            ], 404);
        }

        $reclamation->delete();

        return response()->json([
            'message' => 'Réclamation supprimée avec succès'
        ]);
    }
}
