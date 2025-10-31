<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Commande;

class UserCommandeController extends Controller
{
    /**
     * Affiche la liste des commandes de l'utilisateur connecté.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $userId = Auth::id();

        // Récupère toutes les commandes de l'utilisateur, triées par date de commande récente
        // Charge les relations clés (lignes, livraison, paiement) pour éviter le problème N+1
        $commandes = Commande::where('id_utilisateur', $userId)
            ->orderBy('date_commande', 'desc')
            ->with(['lignes.article', 'paiement', 'livraison'])
            ->get();

        return response()->json(['commandes' => $commandes], 200);
    }

    /**
     * Affiche les détails d'une commande spécifique de l'utilisateur connecté.
     *
     * @param  int  $id_commande
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id_commande)
    {
        $userId = Auth::id();

        // Tente de trouver la commande appartenant à l'utilisateur
        $commande = Commande::where('id_commande', $id_commande)
            ->where('id_utilisateur', $userId)
            ->with(['lignes.article', 'paiement', 'livraison', 'commentaires'])
            ->first();

        if (!$commande) {
            return response()->json(['message' => 'Commande non trouvée ou non autorisée'], 404);
        }

        return response()->json(['commande' => $commande], 200);
    }
}
