<?php

namespace App\Http\Controllers;

use App\Models\Promotion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PromotionController extends Controller
{
    /**
     * Display a listing of promotions.
     */
    public function index(Request $request)
    {
        $query = Promotion::query();

        // Filter by active status
        if ($request->has('active')) {
            $query->where('active', $request->active);
        }

        // Filter by current/active promotions
        if ($request->has('current')) {
            $query->where('date_debut', '<=', now())
                  ->where('date_fin', '>=', now())
                  ->where('active', true);
        }

        // Filter by upcoming promotions
        if ($request->has('upcoming')) {
            $query->where('date_debut', '>', now());
        }

        // Search by code
        if ($request->has('code_promo')) {
            $query->where('code_promo', $request->code_promo);
        }

        // Order by creation date
        $query->orderBy('date_creation', 'desc');

        // Pagination
        $perPage = $request->get('per_page', 15);
        $promotions = $query->paginate($perPage);

        return response()->json($promotions);
    }

    /**
     * Store a newly created promotion in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'titre' => 'required|string|max:150',
            'description' => 'nullable|string',
            'reduction' => 'nullable|numeric|min:0|max:100',
            'montant_reduction' => 'nullable|numeric|min:0',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
            'image_url' => 'nullable|string|max:255',
            'active' => 'boolean',
            'code_promo' => 'nullable|string|max:50|unique:promotion,code_promo',
            'nombre_utilisations' => 'nullable|integer|min:0',
            'limite_utilisations' => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Validate that either reduction or montant_reduction is provided
        if (!$request->reduction && !$request->montant_reduction) {
            return response()->json([
                'message' => 'Vous devez fournir soit une réduction en pourcentage, soit un montant de réduction'
            ], 422);
        }

        $promotion = Promotion::create($request->all());

        return response()->json([
            'message' => 'Promotion créée avec succès',
            'data' => $promotion
        ], 201);
    }

    /**
     * Display the specified promotion.
     */
    public function show($id)
    {
        $promotion = Promotion::find($id);

        if (!$promotion) {
            return response()->json([
                'message' => 'Promotion non trouvée'
            ], 404);
        }

        return response()->json($promotion);
    }

    /**
     * Validate a promo code.
     */
    public function validatePromoCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code_promo' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $promotion = Promotion::where('code_promo', $request->code_promo)
            ->where('active', true)
            ->where('date_debut', '<=', now())
            ->where('date_fin', '>=', now())
            ->first();

        if (!$promotion) {
            return response()->json([
                'message' => 'Code promo invalide ou expiré',
                'valid' => false
            ], 404);
        }

        // Check usage limit
        if ($promotion->limite_utilisations && $promotion->nombre_utilisations >= $promotion->limite_utilisations) {
            return response()->json([
                'message' => 'Cette promotion a atteint sa limite d\'utilisations',
                'valid' => false
            ], 400);
        }

        return response()->json([
            'message' => 'Code promo valide',
            'valid' => true,
            'data' => $promotion
        ]);
    }

    /**
     * Update the specified promotion in storage.
     */
    public function update(Request $request, $id)
    {
        $promotion = Promotion::find($id);

        if (!$promotion) {
            return response()->json([
                'message' => 'Promotion non trouvée'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'titre' => 'sometimes|string|max:150',
            'description' => 'nullable|string',
            'reduction' => 'nullable|numeric|min:0|max:100',
            'montant_reduction' => 'nullable|numeric|min:0',
            'date_debut' => 'sometimes|date',
            'date_fin' => 'sometimes|date|after_or_equal:date_debut',
            'image_url' => 'nullable|string|max:255',
            'active' => 'boolean',
            'code_promo' => 'nullable|string|max:50|unique:promotion,code_promo,' . $id . ',id_promotion',
            'nombre_utilisations' => 'nullable|integer|min:0',
            'limite_utilisations' => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $promotion->update($request->all());

        return response()->json([
            'message' => 'Promotion mise à jour avec succès',
            'data' => $promotion
        ]);
    }

    /**
     * Increment usage count for a promotion.
     */
    public function incrementUsage($id)
    {
        $promotion = Promotion::find($id);

        if (!$promotion) {
            return response()->json([
                'message' => 'Promotion non trouvée'
            ], 404);
        }

        $promotion->increment('nombre_utilisations');

        return response()->json([
            'message' => 'Utilisation de la promotion enregistrée',
            'data' => $promotion
        ]);
    }

    /**
     * Remove the specified promotion from storage.
     */
    public function destroy($id)
    {
        $promotion = Promotion::find($id);

        if (!$promotion) {
            return response()->json([
                'message' => 'Promotion non trouvée'
            ], 404);
        }

        $promotion->delete();

        return response()->json([
            'message' => 'Promotion supprimée avec succès'
        ]);
    }
}
