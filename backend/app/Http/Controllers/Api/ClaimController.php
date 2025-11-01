<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reclamation;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule; // N'oubliez pas d'importer Rule

class ClaimController extends Controller
{
    // Vos statuts valides (vous pouvez ajouter 'En cours' s'il manque)
    private $validStatuses = ['Ouverte', 'En cours', 'Résolue', 'Validée', 'Rejetée'];

    /**
     * LIRE: ... (votre méthode index)
     */
    public function index()
    {
        $claims = Reclamation::with('utilisateur:id_utilisateur,nom,prenom') // Optimisation
                           ->whereIn('statut', ['En cours', 'Ouverte'])
                           ->orderBy('date_reclamation', 'desc')
                           ->get();
        
        // C'est mieux de transformer les données pour le frontend
        $formattedClaims = $claims->map(function ($claim) {
            return [
                'id_reclamation' => $claim->id_reclamation,
                'id_commande' => $claim->id_commande,
                'description' => $claim->description,
                'reponse' => $claim->reponse,
                'statut' => $claim->statut,
                'date_reclamation' => $claim->date_reclamation,
                'utilisateur' => $claim->utilisateur ?? ['nom' => 'Client', 'prenom' => 'Inconnu']
            ];
        });

        return response()->json($formattedClaims);
    }

    /**
     * METTRE À JOUR (pour Gérant): ... (votre méthode update)
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




    // --- AJOUTEZ CETTE NOUVELLE MÉTHODE ---
    /**
     * RÉPONDRE: Permet à un employé de répondre et de mettre à jour le statut.
     * (PATCH /api/claims/{claim}/reply)
     */
    public function reply(Request $request, Reclamation $reclamation)
    {
        $data = $request->validate([
            'reponse' => 'required|string|min:5',
            'statut' => ['required', 'string', Rule::in($this->validStatuses)], // Doit être 'En cours'
        ]);

        // Assurez-vous que l'employé ne peut pas valider ou rejeter
        if ($data['statut'] === 'Validée' || $data['statut'] === 'Rejetée') {
            return response()->json(['message' => 'Action non autorisée.'], 403);
        }

        try {
            $reclamation->update([
                'reponse' => $data['reponse'],
                'statut' => $data['statut'], // (ex: 'En cours')
                'date_traitement' => now(), // Met à jour la date de la réponse
                // 'id_employe_traitement' => auth()->id(), // Si vous avez l'auth
            ]);

            // Recharger la relation utilisateur pour la renvoyer
            $reclamation->load('utilisateur:id_utilisateur,nom,prenom');
            
            // Renvoyer la réclamation formatée
            $formattedClaim = [
                'id_reclamation' => $reclamation->id_reclamation,
                'id_commande' => $reclamation->id_commande,
                'description' => $reclamation->description,
                'reponse' => $reclamation->reponse,
                'statut' => $reclamation->statut,
                'date_reclamation' => $reclamation->date_reclamation,
                'utilisateur' => $reclamation->utilisateur ?? ['nom' => 'Client', 'prenom' => 'Inconnu']
            ];

            return response()->json($formattedClaim);

        } catch (\Exception $e) {
            \Log::error("Erreur lors de la réponse à la réclamation: " . $e->getMessage());
            return response()->json(['message' => 'Erreur serveur.'], 500);
        }
    }
    // --- FIN DE L'AJOUT ---


    // ... (vos méthodes store, show, destroy)
}