<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class PromotionController extends Controller
{
    /**
     * Get all promotions with filters
     */
    public function index(Request $request)
    {
        try {
            $query = DB::table('promotions')
                ->select('*')
                ->orderBy('date_debut', 'DESC');

            // Filter by status
            if ($request->has('statut')) {
                $now = now()->toDateString();
                switch ($request->statut) {
                    case 'actives':
                        $query->where('date_debut', '<=', $now)
                              ->where('date_fin', '>=', $now);
                        break;
                    case 'a_venir':
                        $query->where('date_debut', '>', $now);
                        break;
                    case 'terminees':
                        $query->where('date_fin', '<', $now);
                        break;
                }
            }

            // Filter by type
            if ($request->has('type') && $request->type !== 'all') {
                $query->where('type_promotion', $request->type);
            }

            $promotions = $query->get();

            return response()->json($promotions);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du chargement des promotions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create new promotion
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:20|unique:promotions,code',
            'description' => 'nullable|string',
            'type_promotion' => 'required|in:pourcentage,montant_fixe,offre_speciale',
            'valeur' => 'required|numeric|min:0',
            'date_debut' => 'required|date|after_or_equal:today',
            'date_fin' => 'required|date|after:date_debut',
            'montant_minimum' => 'nullable|numeric|min:0',
            'utilisations_max' => 'nullable|integer|min:1',
            'produits_ids' => 'nullable|array',
            'produits_ids.*' => 'exists:produits,id',
            'est_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $promotionId = DB::table('promotions')->insertGetId([
                'code' => $request->code,
                'description' => $request->description,
                'type_promotion' => $request->type_promotion,
                'valeur' => $request->valeur,
                'date_debut' => $request->date_debut,
                'date_fin' => $request->date_fin,
                'montant_minimum' => $request->montant_minimum,
                'utilisations_max' => $request->utilisations_max,
                'utilisations_actuelles' => 0,
                'est_active' => $request->boolean('est_active', true),
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Attach products if any
            if (!empty($request->produits_ids)) {
                $promotionProducts = array_map(function($produitId) use ($promotionId) {
                    return [
                        'id_promotion' => $promotionId,
                        'id_produit' => $produitId,
                        'created_at' => now()
                    ];
                }, $request->produits_ids);

                DB::table('promotion_produit')->insert($promotionProducts);
            }

            DB::commit();

            return response()->json([
                'message' => 'Promotion créée avec succès',
                'data' => DB::table('promotions')->find($promotionId)
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la création de la promotion',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single promotion
     */
    public function show($id)
    {
        try {
            $promotion = DB::table('promotions')->find($id);

            if (!$promotion) {
                return response()->json([
                    'message' => 'Promotion non trouvée'
                ], 404);
            }

            // Get associated products
            $promotion->produits = DB::table('promotion_produit')
                ->join('produits', 'promotion_produit.id_produit', '=', 'produits.id')
                ->where('promotion_produit.id_promotion', $id)
                ->select('produits.*')
                ->get();

            return response()->json($promotion);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du chargement de la promotion',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update promotion
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:20|unique:promotions,code,' . $id,
            'description' => 'nullable|string',
            'type_promotion' => 'required|in:pourcentage,montant_fixe,offre_speciale',
            'valeur' => 'required|numeric|min:0',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after:date_debut',
            'montant_minimum' => 'nullable|numeric|min:0',
            'utilisations_max' => 'nullable|integer|min:1',
            'produits_ids' => 'nullable|array',
            'produits_ids.*' => 'exists:produits,id',
            'est_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $updateData = [
                'code' => $request->code,
                'description' => $request->description,
                'type_promotion' => $request->type_promotion,
                'valeur' => $request->valeur,
                'date_debut' => $request->date_debut,
                'date_fin' => $request->date_fin,
                'montant_minimum' => $request->montant_minimum,
                'utilisations_max' => $request->utilisations_max,
                'est_active' => $request->boolean('est_active', true),
                'updated_at' => now()
            ];

            DB::table('promotions')->where('id', $id)->update($updateData);

            // Update products if provided
            if ($request->has('produits_ids')) {
                // Remove existing product associations
                DB::table('promotion_produit')->where('id_promotion', $id)->delete();

                // Add new product associations
                if (!empty($request->produits_ids)) {
                    $promotionProducts = array_map(function($produitId) use ($id) {
                        return [
                            'id_promotion' => $id,
                            'id_produit' => $produitId,
                            'created_at' => now()
                        ];
                    }, $request->produits_ids);

                    DB::table('promotion_produit')->insert($promotionProducts);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Promotion mise à jour avec succès',
                'data' => DB::table('promotions')->find($id)
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la mise à jour de la promotion',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete promotion
     */
    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            // Remove product associations first
            DB::table('promotion_produit')->where('id_promotion', $id)->delete();
            
            // Then delete the promotion
            $deleted = DB::table('promotions')->where('id', $id)->delete();

            if ($deleted) {
                DB::commit();
                return response()->json([
                    'message' => 'Promotion supprimée avec succès'
                ]);
            } else {
                DB::rollBack();
                return response()->json([
                    'message' => 'Promotion non trouvée'
                ], 404);
            }

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la suppression de la promotion',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle promotion status
     */
    public function toggleStatus($id)
    {
        try {
            $promotion = DB::table('promotions')->find($id);

            if (!$promotion) {
                return response()->json([
                    'message' => 'Promotion non trouvée'
                ], 404);
            }

            $newStatus = !$promotion->est_active;
            
            DB::table('promotions')
                ->where('id', $id)
                ->update(['est_active' => $newStatus]);

            return response()->json([
                'message' => 'Statut de la promotion mis à jour',
                'est_active' => $newStatus
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du changement de statut',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get promotion statistics
     */
    public function statistics()
    {
        try {
            $now = now()->toDateString();
            
            $stats = [
                'total' => DB::table('promotions')->count(),
                'actives' => DB::table('promotions')
                    ->where('date_debut', '<=', $now)
                    ->where('date_fin', '>=', $now)
                    ->where('est_active', true)
                    ->count(),
                'a_venir' => DB::table('promotions')
                    ->where('date_debut', '>', $now)
                    ->count(),
                'terminees' => DB::table('promotions')
                    ->where('date_fin', '<', $now)
                    ->count(),
                'types' => DB::table('promotions')
                    ->select('type_promotion', DB::raw('count(*) as total'))
                    ->groupBy('type_promotion')
                    ->get()
                    ->pluck('total', 'type_promotion')
            ];

            return response()->json($stats);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du chargement des statistiques',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Validate promotion code
     */
    public function validateCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string',
            'montant_panier' => 'required|numeric|min:0',
            'produits_ids' => 'nullable|array',
            'produits_ids.*' => 'exists:produits,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $now = now()->toDateString();
            $code = $request->code;

            $promotion = DB::table('promotions')
                ->where('code', $code)
                ->where('est_active', true)
                ->where('date_debut', '<=', $now)
                ->where('date_fin', '>=', $now)
                ->first();

            if (!$promotion) {
                return response()->json([
                    'valid' => false,
                    'message' => 'Code promotionnel invalide ou expiré'
                ]);
            }

            // Check minimum amount
            if ($promotion->montant_minimum && $request->montant_panier < $promotion->montant_minimum) {
                return response()->json([
                    'valid' => false,
                    'message' => sprintf('Montant minimum de %s FCFA requis', $promotion->montant_minimum)
                ]);
            }

            // Check usage limit
            if ($promotion->utilisations_max && $promotion->utilisations_actuelles >= $promotion->utilisations_max) {
                return response()->json([
                    'valid' => false,
                    'message' => 'Ce code a atteint sa limite d\'utilisation'
                ]);
            }

            // Check if promotion is product-specific
            if ($request->has('produits_ids') && !empty($request->produits_ids)) {
                $validProduct = DB::table('promotion_produit')
                    ->where('id_promotion', $promotion->id)
                    ->whereIn('id_produit', $request->produits_ids)
                    ->exists();

                if (!$validProduct) {
                    return response()->json([
                        'valid' => false,
                        'message' => 'Ce code ne s\'applique pas aux produits sélectionnés'
                    ]);
                }
            }

            // Calculate discount amount
            $discount = $this->calculateDiscount($promotion, $request->montant_panier);

            return response()->json([
                'valid' => true,
                'message' => 'Code promotionnel valide',
                'promotion' => [
                    'id' => $promotion->id,
                    'code' => $promotion->code,
                    'type_promotion' => $promotion->type_promotion,
                    'valeur' => (float)$promotion->valeur,
                    'montant_remise' => $discount,
                    'montant_minimum' => $promotion->montant_minimum ? (float)$promotion->montant_minimum : null
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'valid' => false,
                'message' => 'Erreur lors de la validation du code',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calculate discount amount based on promotion type
     */
    private function calculateDiscount($promotion, $amount)
    {
        switch ($promotion->type_promotion) {
            case 'pourcentage':
                return round(($promotion->valeur / 100) * $amount, 2);
            case 'montant_fixe':
                return min($promotion->valeur, $amount); // Can't discount more than the total amount
            case 'offre_speciale':
                // For special offers, the value might represent a fixed price or other logic
                // This is a simplified example
                return max(0, $amount - $promotion->valeur);
            default:
                return 0;
        }
    }

    /**
     * Increment promotion usage
     */
    public function incrementUsage($id)
    {
        try {
            DB::table('promotions')
                ->where('id', $id)
                ->increment('utilisations_actuelles');

            return response()->json([
                'message' => 'Compteur d\'utilisation incrémenté'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la mise à jour du compteur d\'utilisation',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}