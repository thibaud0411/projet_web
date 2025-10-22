<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    /**
     * Get all orders with filters
     */
    public function index(Request $request)
    {
        try {
            $query = DB::table('commandes')
                ->join('users', 'commandes.id_utilisateur', '=', 'users.id')
                ->select([
                    'commandes.*',
                    'users.prenom as client_prenom',
                    'users.nom as client_nom',
                    'users.email as client_email',
                    'users.telephone as client_telephone'
                ]);

            // Filter by status
            if ($request->has('statut') && $request->statut !== 'all') {
                $query->where('commandes.statut', $request->statut);
            }

            // Filter by date range
            if ($request->has('date_debut')) {
                $query->whereDate('commandes.date_commande', '>=', $request->date_debut);
            }

            if ($request->has('date_fin')) {
                $query->whereDate('commandes.date_commande', '<=', $request->date_fin);
            }

            // Search by order number or client name
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('commandes.numero_commande', 'LIKE', "%{$search}%")
                      ->orWhere('users.nom', 'LIKE', "%{$search}%")
                      ->orWhere('users.prenom', 'LIKE', "%{$search}%");
                });
            }

            $orders = $query->orderBy('commandes.date_commande', 'DESC')->get();

            return response()->json($orders);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du chargement des commandes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single order with details
     */
    public function show($id)
    {
        try {
            // Get order info
            $order = DB::table('commandes')
                ->join('users', 'commandes.id_utilisateur', '=', 'users.id')
                ->leftJoin('users as emp', 'commandes.id_employe_validateur', '=', 'emp.id')
                ->where('commandes.id', $id)
                ->select([
                    'commandes.*',
                    'users.prenom as client_prenom',
                    'users.nom as client_nom',
                    'users.email as client_email',
                    'users.telephone as client_telephone',
                    'emp.prenom as employe_prenom',
                    'emp.nom as employe_nom'
                ])
                ->first();

            if (!$order) {
                return response()->json([
                    'message' => 'Commande non trouvée'
                ], 404);
            }

            // Get order items
            $items = DB::table('details_commande')
                ->join('produits', 'details_commande.id_produit', '=', 'produits.id')
                ->where('details_commande.id_commande', $id)
                ->select([
                    'details_commande.*',
                    'produits.nom as nom_produit',
                    'produits.image_url'
                ])
                ->get();

            $order->items = $items;

            return response()->json($order);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du chargement de la commande',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update order status
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'statut' => [
                'required',
                Rule::in([
                    'en_attente',
                    'confirmee',
                    'en_preparation',
                    'prete',
                    'en_livraison',
                    'livree',
                    'annulee'
                ])
            ],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $updateData = [
                'statut' => $request->statut,
                'id_employe_validateur' => auth()->id(),
            ];

            // Set validation date if confirming
            if ($request->statut === 'confirmee') {
                $updateData['date_validation'] = now();
            }

            // Set delivery date if delivered
            if ($request->statut === 'livree') {
                $updateData['date_livraison'] = now();
            }

            DB::table('commandes')
                ->where('id', $id)
                ->update($updateData);

            // Log activity
            DB::table('logs_activites')->insert([
                'id_utilisateur' => auth()->id(),
                'action' => 'UPDATE_ORDER_STATUS',
                'table_affectee' => 'commandes',
                'id_enregistrement' => $id,
                'details' => json_encode([
                    'new_status' => $request->statut,
                    'timestamp' => now()
                ]),
                'date_action' => now()
            ]);

            return response()->json([
                'message' => 'Statut mis à jour avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la mise à jour',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get order statistics
     */
    public function statistics(Request $request)
    {
        try {
            $period = $request->get('period', 'today');
            
            $query = DB::table('commandes');

            switch ($period) {
                case 'today':
                    $query->whereDate('date_commande', today());
                    break;
                case 'week':
                    $query->whereBetween('date_commande', [
                        now()->startOfWeek(),
                        now()->endOfWeek()
                    ]);
                    break;
                case 'month':
                    $query->whereMonth('date_commande', now()->month)
                          ->whereYear('date_commande', now()->year);
                    break;
            }

            $stats = [
                'total' => $query->count(),
                'en_attente' => (clone $query)->where('statut', 'en_attente')->count(),
                'en_preparation' => (clone $query)->where('statut', 'en_preparation')->count(),
                'en_livraison' => (clone $query)->where('statut', 'en_livraison')->count(),
                'livrees' => (clone $query)->where('statut', 'livree')->count(),
                'annulees' => (clone $query)->where('statut', 'annulee')->count(),
                'revenue' => (clone $query)->where('statut', 'livree')->sum('montant_total'),
                'average_order' => (clone $query)->where('statut', 'livree')->avg('montant_total'),
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
     * Assign order to employee
     */
    public function assignEmployee(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'id_employe' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::table('commandes')
                ->where('id', $id)
                ->update([
                    'id_employe_validateur' => $request->id_employe,
                    'date_validation' => now()
                ]);

            return response()->json([
                'message' => 'Employé assigné avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de l\'assignation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add notes to order
     */
    public function addNotes(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'notes_preparation' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::table('commandes')
                ->where('id', $id)
                ->update([
                    'notes_preparation' => $request->notes_preparation
                ]);

            return response()->json([
                'message' => 'Notes ajoutées avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de l\'ajout des notes',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}