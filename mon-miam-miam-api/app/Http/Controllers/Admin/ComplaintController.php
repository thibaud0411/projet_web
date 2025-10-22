<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ComplaintController extends Controller
{
    /**
     * Get all complaints with filters
     */
    public function index(Request $request)
    {
        try {
            $query = DB::table('reclamations')
                ->join('users', 'reclamations.id_utilisateur', '=', 'users.id')
                ->leftJoin('commandes', 'reclamations.id_commande', '=', 'commandes.id')
                ->leftJoin('users as emp', 'reclamations.id_employe_traitement', '=', 'emp.id')
                ->select([
                    'reclamations.*',
                    'users.prenom as client_prenom',
                    'users.nom as client_nom',
                    'users.email as client_email',
                    'users.telephone as client_telephone',
                    'commandes.numero_commande',
                    'emp.prenom as employe_prenom',
                    'emp.nom as employe_nom'
                ]);

            // Filter by status
            if ($request->has('statut') && $request->statut !== 'all') {
                $query->where('reclamations.statut', $request->statut);
            }

            // Filter by priority
            if ($request->has('priorite') && $request->priorite !== 'all') {
                $query->where('reclamations.priorite', $request->priorite);
            }

            // Search
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('reclamations.sujet', 'LIKE', "%{$search}%")
                      ->orWhere('reclamations.description', 'LIKE', "%{$search}%")
                      ->orWhere('users.nom', 'LIKE', "%{$search}%")
                      ->orWhere('users.prenom', 'LIKE', "%{$search}%");
                });
            }

            $complaints = $query->orderBy('reclamations.date_creation', 'DESC')->get();

            return response()->json($complaints);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du chargement des réclamations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single complaint
     */
    public function show($id)
    {
        try {
            $complaint = DB::table('reclamations')
                ->join('users', 'reclamations.id_utilisateur', '=', 'users.id')
                ->leftJoin('commandes', 'reclamations.id_commande', '=', 'commandes.id')
                ->leftJoin('users as emp', 'reclamations.id_employe_traitement', '=', 'emp.id')
                ->where('reclamations.id', $id)
                ->select([
                    'reclamations.*',
                    'users.prenom as client_prenom',
                    'users.nom as client_nom',
                    'users.email as client_email',
                    'users.telephone as client_telephone',
                    'commandes.numero_commande',
                    'emp.prenom as employe_prenom',
                    'emp.nom as employe_nom'
                ])
                ->first();

            if (!$complaint) {
                return response()->json([
                    'message' => 'Réclamation non trouvée'
                ], 404);
            }

            return response()->json($complaint);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du chargement de la réclamation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update complaint status
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'statut' => [
                'required',
                Rule::in(['en_attente', 'en_cours', 'resolue', 'rejetee'])
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
                'id_employe_traitement' => auth()->id(),
            ];

            // Set treatment date if status is en_cours
            if ($request->statut === 'en_cours' && 
                DB::table('reclamations')->where('id', $id)->value('statut') === 'en_attente') {
                $updateData['date_traitement'] = now();
            }

            // Set resolution date if status is resolue or rejetee
            if (in_array($request->statut, ['resolue', 'rejetee'])) {
                $updateData['date_resolution'] = now();
            }

            DB::table('reclamations')
                ->where('id', $id)
                ->update($updateData);

            // Log activity
            DB::table('logs_activites')->insert([
                'id_utilisateur' => auth()->id(),
                'action' => 'UPDATE_COMPLAINT_STATUS',
                'table_affectee' => 'reclamations',
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
     * Respond to complaint
     */
    public function respond(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'reponse' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::table('reclamations')
                ->where('id', $id)
                ->update([
                    'reponse' => $request->reponse,
                    'id_employe_traitement' => auth()->id(),
                    'date_traitement' => now(),
                    'statut' => 'en_cours',
                ]);

            // Get complaint details for notification
            $complaint = DB::table('reclamations')
                ->join('users', 'reclamations.id_utilisateur', '=', 'users.id')
                ->where('reclamations.id', $id)
                ->select([
                    'reclamations.sujet',
                    'users.email',
                    'users.prenom',
                    'users.nom'
                ])
                ->first();

            // TODO: Send email notification to customer
            // You can implement email notification here using Laravel Mail
            // Mail::to($complaint->email)->send(new ComplaintResponseMail($complaint));

            // Log activity
            DB::table('logs_activites')->insert([
                'id_utilisateur' => auth()->id(),
                'action' => 'RESPOND_TO_COMPLAINT',
                'table_affectee' => 'reclamations',
                'id_enregistrement' => $id,
                'date_action' => now()
            ]);

            return response()->json([
                'message' => 'Réponse envoyée avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de l\'envoi de la réponse',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update complaint priority
     */
    public function updatePriority(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'priorite' => [
                'required',
                Rule::in(['basse', 'normale', 'haute', 'urgente'])
            ],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::table('reclamations')
                ->where('id', $id)
                ->update(['priorite' => $request->priorite]);

            return response()->json([
                'message' => 'Priorité mise à jour avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la mise à jour',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get complaint statistics
     */
    public function statistics(Request $request)
    {
        try {
            $period = $request->get('period', 'all');
            
            $query = DB::table('reclamations');

            switch ($period) {
                case 'today':
                    $query->whereDate('date_creation', today());
                    break;
                case 'week':
                    $query->whereBetween('date_creation', [
                        now()->startOfWeek(),
                        now()->endOfWeek()
                    ]);
                    break;
                case 'month':
                    $query->whereMonth('date_creation', now()->month)
                          ->whereYear('date_creation', now()->year);
                    break;
            }

            $stats = [
                'total' => $query->count(),
                'en_attente' => (clone $query)->where('statut', 'en_attente')->count(),
                'en_cours' => (clone $query)->where('statut', 'en_cours')->count(),
                'resolues' => (clone $query)->where('statut', 'resolue')->count(),
                'rejetees' => (clone $query)->where('statut', 'rejetee')->count(),
                'urgentes' => (clone $query)->where('priorite', 'urgente')->count(),
                'taux_resolution' => $this->calculateResolutionRate($query),
                'temps_moyen_resolution' => $this->calculateAverageResolutionTime($query),
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
     * Calculate resolution rate
     */
    private function calculateResolutionRate($query)
    {
        $total = (clone $query)->count();
        if ($total === 0) return 0;

        $resolved = (clone $query)->where('statut', 'resolue')->count();
        return round(($resolved / $total) * 100, 2);
    }

    /**
     * Calculate average resolution time in hours
     */
    private function calculateAverageResolutionTime($query)
    {
        $resolved = (clone $query)
            ->where('statut', 'resolue')
            ->whereNotNull('date_resolution')
            ->select([
                DB::raw('AVG(TIMESTAMPDIFF(HOUR, date_creation, date_resolution)) as avg_hours')
            ])
            ->first();

        return $resolved ? round($resolved->avg_hours, 2) : null;
    }

    /**
     * Assign complaint to employee
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
            DB::table('reclamations')
                ->where('id', $id)
                ->update([
                    'id_employe_traitement' => $request->id_employe,
                    'statut' => 'en_cours',
                    'date_traitement' => now()
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
}