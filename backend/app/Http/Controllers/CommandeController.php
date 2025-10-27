<?php

namespace App\Http\Controllers;

use App\Models\Commande;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CommandeController extends Controller
{
    /**
     * Display a listing of orders.
     */
    public function index(Request $request)
    {
        $query = Commande::with(['utilisateur', 'lignes.article', 'paiement', 'livraison']);

        // Filter by user
        if ($request->has('id_utilisateur')) {
            $query->where('id_utilisateur', $request->id_utilisateur);
        }

        // Filter by status
        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        // Filter by service type
        if ($request->has('type_service')) {
            $query->where('type_service', $request->type_service);
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->whereDate('date_commande', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->whereDate('date_commande', '<=', $request->date_to);
        }

        // Order by latest first
        $query->orderBy('date_commande', 'desc');

        // Pagination
        $perPage = $request->get('per_page', 15);
        $commandes = $query->paginate($perPage);

        return response()->json($commandes);
    }

    /**
     * Store a newly created order in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_utilisateur' => 'required|exists:utilisateur,id_utilisateur',
            'montant_total' => 'required|numeric|min:0',
            'points_gagnes' => 'nullable|integer|min:0',
            'type_service' => 'required|in:sur_place,a_emporter,livraison',
            'heure_arrivee' => 'nullable|date',
            'statut' => 'sometimes|in:en_attente,en_preparation,pret,en_livraison,livre,annule',
            'lignes' => 'required|array|min:1',
            'lignes.*.id_article' => 'required|exists:article,id_article',
            'lignes.*.quantite' => 'required|integer|min:1',
            'lignes.*.prix_unitaire' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Generate order number
        $numeroCommande = 'CMD-' . date('Ymd') . '-' . strtoupper(Str::random(6));

        // Create order
        $commande = Commande::create([
            'id_utilisateur' => $request->id_utilisateur,
            'montant_total' => $request->montant_total,
            'points_gagnes' => $request->points_gagnes ?? 0,
            'type_service' => $request->type_service,
            'heure_arrivee' => $request->heure_arrivee,
            'statut' => $request->statut ?? 'en_attente',
            'numero_commande' => $numeroCommande,
        ]);

        // Create order lines
        foreach ($request->lignes as $ligne) {
            $commande->lignes()->create([
                'id_article' => $ligne['id_article'],
                'quantite' => $ligne['quantite'],
                'prix_unitaire' => $ligne['prix_unitaire'],
                'sous_total' => $ligne['quantite'] * $ligne['prix_unitaire'],
                'commentaire_article' => $ligne['commentaire_article'] ?? null,
            ]);
        }

        $commande->load(['lignes.article', 'utilisateur']);

        return response()->json([
            'message' => 'Commande créée avec succès',
            'data' => $commande
        ], 201);
    }

    /**
     * Display the specified order.
     */
    public function show($id)
    {
        $commande = Commande::with(['utilisateur', 'lignes.article', 'paiement', 'livraison', 'commentaires'])->find($id);

        if (!$commande) {
            return response()->json([
                'message' => 'Commande non trouvée'
            ], 404);
        }

        return response()->json($commande);
    }

    /**
     * Update the specified order in storage.
     */
    public function update(Request $request, $id)
    {
        $commande = Commande::find($id);

        if (!$commande) {
            return response()->json([
                'message' => 'Commande non trouvée'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'statut' => 'sometimes|in:en_attente,en_preparation,pret,en_livraison,livre,annule',
            'heure_arrivee' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $commande->update($request->only(['statut', 'heure_arrivee']));
        $commande->load(['utilisateur', 'lignes.article', 'paiement', 'livraison']);

        return response()->json([
            'message' => 'Commande mise à jour avec succès',
            'data' => $commande
        ]);
    }

    /**
     * Cancel an order.
     */
    public function cancel($id)
    {
        $commande = Commande::find($id);

        if (!$commande) {
            return response()->json([
                'message' => 'Commande non trouvée'
            ], 404);
        }

        if (in_array($commande->statut, ['livre', 'annule'])) {
            return response()->json([
                'message' => 'Cette commande ne peut pas être annulée'
            ], 400);
        }

        $commande->update(['statut' => 'annule']);

        return response()->json([
            'message' => 'Commande annulée avec succès',
            'data' => $commande
        ]);
    }

    /**
     * Remove the specified order from storage.
     */
    public function destroy($id)
    {
        $commande = Commande::find($id);

        if (!$commande) {
            return response()->json([
                'message' => 'Commande non trouvée'
            ], 404);
        }

        $commande->delete();

        return response()->json([
            'message' => 'Commande supprimée avec succès'
        ]);
    }
}
