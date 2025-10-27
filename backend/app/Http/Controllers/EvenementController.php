<?php

namespace App\Http\Controllers;

use App\Models\Evenement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EvenementController extends Controller
{
    /**
     * Display a listing of events.
     */
    public function index(Request $request)
    {
        $query = Evenement::with('participations');

        // Filter by active status
        if ($request->has('est_actif')) {
            $query->where('est_actif', $request->est_actif);
        }

        // Filter by event type
        if ($request->has('type_evenement')) {
            $query->where('type_evenement', $request->type_evenement);
        }

        // Filter by current/upcoming events
        if ($request->has('upcoming')) {
            $query->where('date_debut', '>=', now());
        }

        // Filter by ongoing events
        if ($request->has('ongoing')) {
            $query->where('date_debut', '<=', now())
                  ->where('date_fin', '>=', now());
        }

        // Order by start date
        $query->orderBy('date_debut', 'desc');

        // Pagination
        $perPage = $request->get('per_page', 15);
        $evenements = $query->paginate($perPage);

        return response()->json($evenements);
    }

    /**
     * Store a newly created event in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'titre' => 'required|string|max:200',
            'description' => 'nullable|string',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
            'type_evenement' => 'required|string|max:50',
            'image_url' => 'nullable|string|max:255',
            'recompense_points' => 'nullable|integer|min:0',
            'nombre_participants_max' => 'nullable|integer|min:1',
            'est_actif' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $evenement = Evenement::create($request->all());

        return response()->json([
            'message' => 'Événement créé avec succès',
            'data' => $evenement
        ], 201);
    }

    /**
     * Display the specified event.
     */
    public function show($id)
    {
        $evenement = Evenement::with('participations.utilisateur')->find($id);

        if (!$evenement) {
            return response()->json([
                'message' => 'Événement non trouvé'
            ], 404);
        }

        return response()->json($evenement);
    }

    /**
     * Update the specified event in storage.
     */
    public function update(Request $request, $id)
    {
        $evenement = Evenement::find($id);

        if (!$evenement) {
            return response()->json([
                'message' => 'Événement non trouvé'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'titre' => 'sometimes|string|max:200',
            'description' => 'nullable|string',
            'date_debut' => 'sometimes|date',
            'date_fin' => 'sometimes|date|after_or_equal:date_debut',
            'type_evenement' => 'sometimes|string|max:50',
            'image_url' => 'nullable|string|max:255',
            'recompense_points' => 'nullable|integer|min:0',
            'nombre_participants_max' => 'nullable|integer|min:1',
            'est_actif' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $evenement->update($request->all());

        return response()->json([
            'message' => 'Événement mis à jour avec succès',
            'data' => $evenement
        ]);
    }

    /**
     * Remove the specified event from storage.
     */
    public function destroy($id)
    {
        $evenement = Evenement::find($id);

        if (!$evenement) {
            return response()->json([
                'message' => 'Événement non trouvé'
            ], 404);
        }

        $evenement->delete();

        return response()->json([
            'message' => 'Événement supprimé avec succès'
        ]);
    }
}
