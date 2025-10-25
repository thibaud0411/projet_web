<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reclamation; // N'oubliez pas d'importer le modèle
use Illuminate\Http\Request;

class ClaimController extends Controller
{
    /**
     * LIRE: Récupère les réclamations qui nécessitent une action du gérant.
     * (GET /api/claims)
     *
     * Note: Pour correspondre au frontend, on ne charge que 'En cours' ou 'Ouverte'.
     * On charge aussi la relation utilisateur pour afficher le nom.
     */
    public function index()
    {
        $claims = Reclamation::with('utilisateur') // Charger l'utilisateur associé
                            ->whereIn('statut', ['En cours', 'Ouverte']) // Filtrer par statut
                            ->orderBy('date_reclamation', 'desc') // Trier par date
                            ->get();

        return response()->json($claims);
    }

    /**
     * METTRE À JOUR: Valide ou rejette la réponse d'une réclamation.
     * (PATCH /api/claims/{id})
     *
     * Le frontend enverra le nouveau statut ('Validée' ou 'Rejetée').
     */
    public function update(Request $request, Reclamation $reclamation) // Utilisation du Route Model Binding
    {
        // Validation simple: on attend un statut 'Validée' ou 'Rejetée'
        $data = $request->validate([
            'statut' => 'required|string|in:Validée,Rejetée',
        ]);

        // Mettre à jour le statut et la date de traitement
        $reclamation->update([
            'statut' => $data['statut'],
            'date_traitement' => now(), // Mettre à jour la date de traitement
            // Vous pourriez aussi vouloir enregistrer l'ID du gérant qui valide/rejette ici
        ]);

        // Recharger la relation utilisateur si besoin (pas essentiel ici car on ne renvoie que le succès)
        // $reclamation->load('utilisateur');

        // On renvoie la réclamation mise à jour ou juste un message de succès
        return response()->json($reclamation);
        // Ou alternativement: return response()->json(['message' => 'Réclamation mise à jour.']);
    }

    // --- Les autres méthodes (store, show, destroy) peuvent rester vides pour l'instant ---
    public function store(Request $request) {}
    public function show(Reclamation $reclamation) {}
    public function destroy(Reclamation $reclamation) {}
}