<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Commande; // Importer le modèle Commande
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


    // --- Les autres méthodes restent vides ou minimales ---
    public function store(Request $request) { return response()->json(['message' => 'Non implémenté'], 501); }
    
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