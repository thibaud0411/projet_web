<?php

namespace App\Http\Controllers;

use App\Models\Parrainage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ParrainageController extends Controller
{
    /**
     * Display a listing of referrals.
     */
    public function index(Request $request)
    {
        $query = Parrainage::with(['parrain', 'filleul']);

        // Filter by sponsor
        if ($request->has('id_parrain')) {
            $query->where('id_parrain', $request->id_parrain);
        }

        // Filter by referred user
        if ($request->has('id_filleul')) {
            $query->where('id_filleul', $request->id_filleul);
        }

        // Filter by reward status
        if ($request->has('recompense_attribuee')) {
            $query->where('recompense_attribuee', $request->recompense_attribuee);
        }

        // Order by referral date
        $query->orderBy('date_parrainage', 'desc');

        // Pagination
        $perPage = $request->get('per_page', 15);
        $parrainages = $query->paginate($perPage);

        return response()->json($parrainages);
    }

    /**
     * Store a newly created referral in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_parrain' => 'required|exists:utilisateur,id_utilisateur',
            'id_filleul' => 'required|exists:utilisateur,id_utilisateur|different:id_parrain',
            'recompense_attribuee' => 'boolean',
            'points_gagnes' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if referral already exists
        $existingParrainage = Parrainage::where('id_parrain', $request->id_parrain)
            ->where('id_filleul', $request->id_filleul)
            ->first();

        if ($existingParrainage) {
            return response()->json([
                'message' => 'Ce parrainage existe déjà'
            ], 400);
        }

        $parrainage = Parrainage::create($request->all());
        $parrainage->load(['parrain', 'filleul']);

        return response()->json([
            'message' => 'Parrainage créé avec succès',
            'data' => $parrainage
        ], 201);
    }

    /**
     * Display the specified referral.
     */
    public function show($id)
    {
        $parrainage = Parrainage::with(['parrain', 'filleul'])->find($id);

        if (!$parrainage) {
            return response()->json([
                'message' => 'Parrainage non trouvé'
            ], 404);
        }

        return response()->json($parrainage);
    }

    /**
     * Update the specified referral in storage.
     */
    public function update(Request $request, $id)
    {
        $parrainage = Parrainage::find($id);

        if (!$parrainage) {
            return response()->json([
                'message' => 'Parrainage non trouvé'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'recompense_attribuee' => 'boolean',
            'points_gagnes' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $parrainage->update($request->all());
        $parrainage->load(['parrain', 'filleul']);

        return response()->json([
            'message' => 'Parrainage mis à jour avec succès',
            'data' => $parrainage
        ]);
    }

    /**
     * Attribute reward for referral.
     */
    public function attributeReward($id, Request $request)
    {
        $parrainage = Parrainage::find($id);

        if (!$parrainage) {
            return response()->json([
                'message' => 'Parrainage non trouvé'
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

        $parrainage->update([
            'recompense_attribuee' => true,
            'points_gagnes' => $request->points_gagnes,
        ]);

        return response()->json([
            'message' => 'Récompense attribuée avec succès',
            'data' => $parrainage
        ]);
    }

    /**
     * Remove the specified referral from storage.
     */
    public function destroy($id)
    {
        $parrainage = Parrainage::find($id);

        if (!$parrainage) {
            return response()->json([
                'message' => 'Parrainage non trouvé'
            ], 404);
        }

        $parrainage->delete();

        return response()->json([
            'message' => 'Parrainage supprimé avec succès'
        ]);
    }
}
