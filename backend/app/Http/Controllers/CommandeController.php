<?php

namespace App\Http\Controllers;

use App\Models\Commande;
use App\Models\LigneCommande;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use App\Services\CinetPayService;

/**
 * Gère les opérations liées aux Commandes, y compris la création et le suivi par l'utilisateur.
 */
class CommandeController extends Controller
{
    protected $cinetPayService;

    public function __construct(CinetPayService $cinetPayService)
    {
        $this->cinetPayService = $cinetPayService;
    }

    /**
     * Récupère les données consolidées pour le tableau de bord de l'utilisateur (Student).
     * Inclut l'historique des commandes et les articles associés.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getDashboardData(Request $request)
    {
        $utilisateur = $request->user();

        // Récupérer toutes les commandes de l'utilisateur, en chargeant les relations nécessaires
        // 'lignes' pour obtenir les articles et les quantités
        $commandes = Commande::where('id_utilisateur', $utilisateur->id_personne)
                            ->with(['lignes.article'])
                            ->orderBy('date_creation', 'desc')
                            ->get()
                            ->map(function ($commande) {
                                // Consolidation des données pour un affichage plus simple sur le front-end
                                return [
                                    'id_commande' => $commande->id_commande,
                                    'date_creation' => $commande->date_creation,
                                    'statut' => $commande->statut,
                                    'montant_total' => $commande->montant_total,
                                    'articles_commandes' => $commande->lignes->map(function ($ligne) {
                                        return [
                                            'nom' => $ligne->article->nom,
                                            'description' => $ligne->article->description,
                                            'quantite' => $ligne->quantite,
                                            'prix_unitaire' => $ligne->prix_unitaire_a_lachat,
                                        ];
                                    })
                                ];
                            });
                            
        // Calcul d'un petit résumé pour le dashboard
        $stats = [
            'nombre_commandes_total' => $commandes->count(),
            'total_paye' => $commandes->where('statut', 'payee')->sum('montant_total'),
            'derniere_commande_statut' => $commandes->first() ? $commandes->first()['statut'] : 'Aucune commande'
        ];

        return response()->json([
            'utilisateur' => [
                'nom_complet' => $utilisateur->nom . ' ' . $utilisateur->prenom,
                'email' => $utilisateur->email,
                // Ajoutez d'autres données utilisateur ici (ex: profil étudiant)
            ],
            'statistiques' => $stats,
            'historique_commandes' => $commandes,
        ]);
    }
    
    // --- METHODES EXISTANTES (index, show, updateStatut, store, initiatePayment, handleCinetPayCallback) ---

    public function index(Request $request) { /* ... */ }
    public function show(int $id_commande, Request $request) { /* ... */ }
    public function updateStatut(int $id_commande, Request $request) { /* ... */ }
    public function store(Request $request) { /* ... */ }
    public function initiatePayment(int $id_commande, Request $request) { /* ... */ }
    public function handleCinetPayCallback(Request $request) { /* ... */ }
}
