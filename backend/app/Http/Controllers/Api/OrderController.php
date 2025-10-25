<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Commande; // Importer le modèle Commande
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * LIRE: Récupère les commandes avec filtres et relations.
     * (GET /api/orders)
     * (GET /api/orders?statut=En%20préparation)
     */
    public function index(Request $request)
    {
        // Valider le paramètre de statut (optionnel)
        $request->validate([
            'statut' => 'sometimes|string|in:En attente,En préparation,Prête,Livrée,Annulée', // Autorise seulement ces statuts
        ]);

        $query = Commande::with([
                            'utilisateur:id_utilisateur,nom,prenom', // Charger seulement l'ID et nom/prénom de l'utilisateur
                            'lignes.article:id_article,nom' // Charger lignes->article (juste ID et nom)
                          ])
                         ->orderBy('date_commande', 'desc'); // Trier par date de commande (plus récent en premier)

        // Appliquer le filtre si un statut est fourni dans l'URL
        if ($request->has('statut') && $request->statut !== 'Toutes') { // 'Toutes' n'est pas un statut en DB
            $query->where('statut', $request->statut);
        }

        $commandes = $query->get();

        return response()->json($commandes);
    }

    /**
     * METTRE À JOUR: Permet de changer le statut d'une commande.
     * (PATCH /api/orders/{id})
     *
     * Le frontend enverrait le nouveau statut ('En préparation', 'Prête', etc.).
     */
    public function update(Request $request, Commande $commande) // Route Model Binding
    {
        $data = $request->validate([
            'statut' => 'required|string|in:En attente,En préparation,Prête,Livrée,Annulée',
        ]);

        $commande->update(['statut' => $data['statut']]);

        // Recharger les relations pour renvoyer l'objet complet mis à jour (bonne pratique)
        $commande->load(['utilisateur:id_utilisateur,nom,prenom', 'lignes.article:id_article,nom']);

        return response()->json($commande);
    }

    // --- Les autres méthodes peuvent rester vides ---
    public function store(Request $request) {}
    public function show(Commande $commande) {}
    public function destroy(Commande $commande) {}
}