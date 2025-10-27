<?php

namespace App\Http\Controllers;

use App\Models\Participation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ParticipationController extends Controller
{
    /**
     * Display a listing of participations.
     */
    public function index(Request $request)
    {
        $query = Participation::with(['utilisateur', 'evenement']);

        // Filter by user
        if ($request->has('id_utilisateur')) {
            $query->where('id_utilisateur', $request->id_utilisateur);
        }

        // Filter by event
        if ($request->has('id_evenement')) {
            $query->where('id_evenement', $request->id_evenement);
        }

        // Filter by winners
        if ($request->has('a_gagne')) {
            $query->where('a_gagne', $request->a_gagne);
        }

        // Order by participation date
        $query->orderBy('date_participation', 'desc');

        // Pagination
        $perPage = $request->get('per_page', 15);
        $participations = $query->paginate($perPage);

        return response()->json($participations);
    }

    /**
     * Store a newly created participation in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_utilisateur' => 'required|exists:utilisateur,id_utilisateur',
            'id_evenement' => 'required|exists:evenement,id_evenement',
            'points_gagnes' => 'nullable|integer|min:0',
            'score' => 'nullable|numeric|min:0',
            'a_gagne' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if user already participated in this event
        $existingParticipation = Participation::where('id_utilisateur', $request->id_utilisateur)
            ->where('id_evenement', $request->id_evenement)
            ->first();

        if ($existingParticipation) {
            return response()->json([
                'message' => 'Cet utilisateur a déjà participé à cet événement'
            ], 400);
        }

        $participation = Participation::create($request->all());
        $participation->load(['utilisateur', 'evenement']);

        return response()->json([
            'message' => 'Participation créée avec succès',
            'data' => $participation
        ], 201);
    }

    /**
     * Display the specified participation.
     */
    public function show($id)
    {
        $participation = Participation::with(['utilisateur', 'evenement'])->find($id);

        if (!$participation) {
            return response()->json([
                'message' => 'Participation non trouvée'
            ], 404);
        }

        return response()->json($participation);
    }

    /**
     * Update the specified participation in storage.
     */
    public function update(Request $request, $id)
    {
        $participation = Participation::find($id);

        if (!$participation) {
            return response()->json([
                'message' => 'Participation non trouvée'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'points_gagnes' => 'nullable|integer|min:0',
            'score' => 'nullable|numeric|min:0',
            'a_gagne' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $participation->update($request->all());
        $participation->load(['utilisateur', 'evenement']);

        return response()->json([
            'message' => 'Participation mise à jour avec succès',
            'data' => $participation
        ]);
    }

    /**
     * Mark participation as winner.
     */
    public function markAsWinner($id, Request $request)
    {
        $participation = Participation::find($id);

        if (!$participation) {
            return response()->json([
                'message' => 'Participation non trouvée'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'points_gagnes' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $participation->update([
            'a_gagne' => true,
            'points_gagnes' => $request->points_gagnes,
        ]);

        return response()->json([
            'message' => 'Participation marquée comme gagnante',
            'data' => $participation
        ]);
    }

    /**
     * Remove the specified participation from storage.
     */
    public function destroy($id)
    {
        $participation = Participation::find($id);

        if (!$participation) {
            return response()->json([
                'message' => 'Participation non trouvée'
            ], 404);
        }

        $participation->delete();

        return response()->json([
            'message' => 'Participation supprimée avec succès'
        ]);
    }
}
