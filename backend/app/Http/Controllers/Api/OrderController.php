<?php

namespace App\Http\Controllers\Api;

use Illuminate\Support\Str;
use App\Http\Controllers\Controller;
use App\Models\Commande; // Importer le modèle Commande
use App\Models\LigneCommande; // Importer le modèle LigneCommande
use App\Models\Paiement; // Importer le modèle Paiement
use Illuminate\Http\Request;
use Illuminate\Validation\Rule; // Pour la validation 'in'
// --- AJOUT DE LA MODIFICATION ---
use Illuminate\Database\Eloquent\ModelNotFoundException; // Importer pour le try-catch
// --- FIN DE L'AJOUT ---

class OrderController extends Controller
{
    // Statuts valides possibles pour une commande
    private $validStatuses = ['En attente', 'En préparation', 'Prête', 'Livrée', 'Annulée'];

    /**
     * LIRE: Récupère les commandes avec filtres et relations.
     * (GET /api/orders)
     * (GET /api/orders?statut=En%20préparation)
     */
    public function index(Request $request)
    {
        // Valider le paramètre de statut (optionnel)
        $request->validate([
            'statut' => ['sometimes', 'string', Rule::in($this->validStatuses)],
        ]);

        $query = Commande::with([
                            'utilisateur:id_utilisateur,nom,prenom', // Sélectionne colonnes spécifiques
                            'lignes.article:id_article,nom' // Sélectionne colonnes spécifiques
                          ])
                         ->orderBy('date_commande', 'desc');

        // Appliquer le filtre si un statut valide est fourni
        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        $commandes = $query->get();

        return response()->json($commandes);
    }


    // --- DÉBUT DE LA MÉTHODE MODIFIÉE ---
    /**
     * METTRE À JOUR: Permet de changer le statut d'une commande.
     * (PATCH /api/orders/{id}) -> {id} sera l'ID
     */
    public function update(Request $request, $id) // Changement: "Commande $commande" devient "$id"
    {
        // 1. Trouver la commande manuellement en utilisant l'ID
        try {
            // Utilise la clé primaire 'id_commande' (ou celle définie dans votre modèle)
            $commande = Commande::findOrFail($id); 
        } catch (ModelNotFoundException $e) {
            // Si findOrFail échoue, renvoyer un 404
            return response()->json(['message' => 'Commande non trouvée.'], 404);
        }

        // 2. Valider le nouveau statut
        $data = $request->validate([
            'statut' => ['required', 'string', Rule::in($this->validStatuses)],
        ]);

        // 3. Mettre à jour le statut dans la base de données
        try {
            $commande->update(['statut' => $data['statut']]);
        } catch (\Exception $e) {
             // Log l'erreur si l'update échoue
             \Log::error("Erreur lors de la mise à jour DB commande #{$commande->id_commande}: " . $e->getMessage());
             // Renvoie une erreur 500 au frontend
             return response()->json(['message' => 'Erreur serveur lors de la mise à jour.'], 500);
        }


        // 4. Re-requêter explicitement la commande depuis la DB AVEC les relations
        try {
             $updatedCommandeWithRelations = Commande::with([
                                                'utilisateur:id_utilisateur,nom,prenom',
                                                'lignes.article:id_article,nom'
                                            ])
                                            ->findOrFail($commande->id_commande); // Utilise findOrFail pour être sûr
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
             // Cas très improbable où la commande disparaît juste après l'update
              \Log::error("Commande #{$commande->id_commande} non trouvée après mise à jour.");
              return response()->json(['message' => 'Commande non trouvée après mise à jour.'], 404);
        }

        // 5. Renvoyer cette NOUVELLE instance complète
        return response()->json($updatedCommandeWithRelations);
    }
    // --- FIN DE LA MÉTHODE MODIFIÉE ---


    /**
     * Créer une nouvelle commande
     * (POST /api/orders)
     */
public function store(Request $request)
{
    try {
        // Valider les données de la requête
        $validated = $request->validate([
            'user_id' => 'required|integer|exists:utilisateur,id_utilisateur',
            'items' => 'required|array|min:1',
            'items.*.article_id' => 'required|integer|exists:article,id_article',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.name' => 'required|string',
            'total_amount' => 'required|numeric|min:0',
            'service_type' => 'required|in:sur place,à emporter,livraison',
            'arrival_time' => 'nullable|date_format:H:i',
            'payment_method' => 'required|in:especes,cinetpay',
        ]);

        // Vérifier la disponibilité des articles
        foreach ($validated['items'] as $item) {
            $article = \App\Models\Article::find($item['article_id']);
            if (!$article || !$article->disponible || $article->stock_disponible < $item['quantity']) {
                return response()->json([
                    'message' => "L'article {$item['name']} n'est pas disponible en quantité suffisante",
                    'article_id' => $item['article_id']
                ], 400);
            }
        }

        // Démarrer une transaction
        \DB::beginTransaction();

        // Créer la commande
        $heureArrivee = $validated['arrival_time'] ?? null;
        
        // Si une heure d'arrivée est fournie, créer un objet DateTime avec la date d'aujourd'hui
        if ($heureArrivee) {
            $aujourdHui = now()->format('Y-m-d');
            $heureArrivee = \Carbon\Carbon::createFromFormat('Y-m-d H:i', $aujourdHui . ' ' . $heureArrivee);
        }
        
        $commande = new Commande([
            'id_utilisateur' => $validated['user_id'],
            'montant_total' => $validated['total_amount'],
            'points_gagnes' => floor($validated['total_amount'] / 1000),
            'type_service' => $validated['service_type'],
            'heure_arrivee' => $heureArrivee,
            'statut' => 'En attente',
            'numero_commande' => 'CMD-' . time() . '-' . Str::upper(Str::random(4)),
        ]);
        $commande->save();

        // Créer les lignes de commande et mettre à jour les stocks
        foreach ($validated['items'] as $item) {
            $article = \App\Models\Article::find($item['article_id']);
            
            // Créer la ligne de commande
            $ligneCommande = new LigneCommande([
                'id_article' => $item['article_id'],
                'quantite' => $item['quantity'],
                'prix_unitaire' => $item['price'],
                'sous_total' => $item['price'] * $item['quantity'],
                'commentaire_article' => $item['comment'] ?? null,
            ]);
            $commande->lignes()->save($ligneCommande);

            // Mettre à jour le stock
            $article->decrement('stock_disponible', $item['quantity']);
        }

        // Créer le paiement
        $paiement = new Paiement([
            'montant' => $validated['total_amount'],
            'methode_paiement' => $validated['payment_method'],
            'statut' => $validated['payment_method'] === 'cinetpay' ? 'en attente' : 'payé',
            'date_paiement' => now(),
        ]);
        $commande->paiement()->save($paiement);

        \DB::commit();

        // Charger les relations pour la réponse
        $commande->load(['utilisateur:id_utilisateur,nom,prenom', 'lignes.article:id_article,nom']);

        return response()->json([
            'message' => 'Commande créée avec succès',
            'data' => $commande
        ], 201);

    } catch (\Illuminate\Validation\ValidationException $e) {
        \DB::rollBack();
        return response()->json([
            'message' => 'Erreur de validation',
            'errors' => $e->errors()
        ], 422);
    } catch (\Exception $e) {
        \DB::rollBack();
        \Log::error('Erreur création commande: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
        return response()->json([
            'message' => 'Une erreur est survenue lors de la création de la commande',
            'error' => config('app.debug') ? $e->getMessage() : 'Erreur serveur'
        ], 500);
    }
}
    
    // Modification: Gérer "show" manuellement aussi si vous l'utilisez
    public function show($id) {
        try {
            $commande = Commande::with(['utilisateur:id_utilisateur,nom,prenom', 'lignes.article:id_article,nom'])
                                ->findOrFail($id);
            return response()->json($commande);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Commande non trouvée.'], 404);
        }
    }
    
    // Modification: Gérer "destroy" manuellement aussi si vous l'utilisez
    public function destroy($id) { 
        try {
            $commande = Commande::findOrFail($id);
            $commande->delete(); // Exemple de suppression
            return response()->json(null, 204);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Commande non trouvée.'], 404);
        }
    }
}