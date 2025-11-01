<?php

namespace App\Http\Controllers;

use App\Models\LigneCommande;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LigneCommandeController extends Controller
{
    /**
     * Display a listing of order lines.
     */
    public function index(Request $request)
    {
        $query = LigneCommande::with(['commande', 'article']);

        // Filter by order
        if ($request->has('id_commande')) {
            $query->where('id_commande', $request->id_commande);
        }

        // Filter by article
        if ($request->has('id_article')) {
            $query->where('id_article', $request->id_article);
        }

        $lignes = $query->get();

        return response()->json($lignes);
    }

    /**
     * Store a newly created order line in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_commande' => 'required|exists:commande,id_commande',
            'id_article' => 'required|exists:article,id_article',
            'quantite' => 'required|integer|min:1',
            'prix_unitaire' => 'required|numeric|min:0',
            'commentaire_article' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Calculate subtotal
        $sousTotal = $request->quantite * $request->prix_unitaire;

        $ligne = LigneCommande::create([
            'id_commande' => $request->id_commande,
            'id_article' => $request->id_article,
            'quantite' => $request->quantite,
            'prix_unitaire' => $request->prix_unitaire,
            'sous_total' => $sousTotal,
            'commentaire_article' => $request->commentaire_article,
        ]);

        $ligne->load(['commande', 'article']);

        return response()->json([
            'message' => 'Ligne de commande créée avec succès',
            'data' => $ligne
        ], 201);
    }

    /**
     * Display the specified order line.
     */
    public function show($id)
    {
        $ligne = LigneCommande::with(['commande', 'article'])->find($id);

        if (!$ligne) {
            return response()->json([
                'message' => 'Ligne de commande non trouvée'
            ], 404);
        }

        return response()->json($ligne);
    }

    /**
     * Update the specified order line in storage.
     */
    public function update(Request $request, $id)
    {
        $ligne = LigneCommande::find($id);

        if (!$ligne) {
            return response()->json([
                'message' => 'Ligne de commande non trouvée'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'quantite' => 'sometimes|integer|min:1',
            'prix_unitaire' => 'sometimes|numeric|min:0',
            'commentaire_article' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Recalculate subtotal if quantity or price changes
        $quantite = $request->quantite ?? $ligne->quantite;
        $prixUnitaire = $request->prix_unitaire ?? $ligne->prix_unitaire;
        $sousTotal = $quantite * $prixUnitaire;

        $ligne->update([
            'quantite' => $quantite,
            'prix_unitaire' => $prixUnitaire,
            'sous_total' => $sousTotal,
            'commentaire_article' => $request->commentaire_article ?? $ligne->commentaire_article,
        ]);

        $ligne->load(['commande', 'article']);

        return response()->json([
            'message' => 'Ligne de commande mise à jour avec succès',
            'data' => $ligne
        ]);
    }

    /**
     * Remove the specified order line from storage.
     */
    public function destroy($id)
    {
        $ligne = LigneCommande::find($id);

        if (!$ligne) {
            return response()->json([
                'message' => 'Ligne de commande non trouvée'
            ], 404);
        }

        $ligne->delete();

        return response()->json([
            'message' => 'Ligne de commande supprimée avec succès'
        ]);
    }
}
