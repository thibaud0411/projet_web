<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class EventController extends Controller
{
    /**
     * Get all events
     */
    public function index(Request $request)
    {
        try {
            $query = DB::table('evenements');

            // Filter by status
            if ($request->has('est_actif')) {
                $query->where('est_actif', $request->est_actif);
            }

            // Filter by type
            if ($request->has('type') && $request->type !== 'all') {
                $query->where('type_evenement', $request->type);
            }

            // Filter by date range
            if ($request->has('date_debut')) {
                $query->whereDate('date_debut', '>=', $request->date_debut);
            }

            if ($request->has('date_fin')) {
                $query->whereDate('date_fin', '<=', $request->date_fin);
            }

            $events = $query->orderBy('date_debut', 'DESC')->get();

            return response()->json($events);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du chargement des événements',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create new event
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'titre' => 'required|string|max:150',
            'description' => 'nullable|string',
            'type_evenement' => [
                'required',
                Rule::in(['jeu', 'concours', 'soiree_thematique', 'match', 'autre'])
            ],
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
            'lieu' => 'nullable|string|max:200',
            'recompenses' => 'nullable|string',
            'limite_participants' => 'nullable|integer|min:1',
            'image_affiche' => 'nullable|url',
            'est_actif' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $id = DB::table('evenements')->insertGetId([
                'titre' => $request->titre,
                'description' => $request->description,
                'type_evenement' => $request->type_evenement,
                'date_debut' => $request->date_debut,
                'date_fin' => $request->date_fin,
                'lieu' => $request->lieu ?? 'ZeDuc@Space',
                'recompenses' => $request->recompenses,
                'limite_participants' => $request->limite_participants,
                'image_affiche' => $request->image_affiche,
                'est_actif' => $request->est_actif ?? true,
                'nombre_participants' => 0,
                'created_at' => now(),
            ]);

            return response()->json([
                'message' => 'Événement créé avec succès',
                'data' => DB::table('evenements')->where('id', $id)->first()
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single event
     */
    public function show($id)
    {
        try {
            $event = DB::table('evenements')->where('id', $id)->first();

            if (!$event) {
                return response()->json([
                    'message' => 'Événement non trouvé'
                ], 404);
            }

            return response()->json($event);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du chargement de l\'événement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update event
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'titre' => 'sometimes|string|max:150',
            'description' => 'nullable|string',
            'type_evenement' => [
                'sometimes',
                Rule::in(['jeu', 'concours', 'soiree_thematique', 'match', 'autre'])
            ],
            'date_debut' => 'sometimes|date',
            'date_fin' => 'sometimes|date',
            'lieu' => 'nullable|string|max:200',
            'recompenses' => 'nullable|string',
            'limite_participants' => 'nullable|integer|min:1',
            'image_affiche' => 'nullable|url',
            'est_actif' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $updateData = array_filter($request->only([
                'titre', 'description', 'type_evenement', 'date_debut',
                'date_fin', 'lieu', 'recompenses', 'limite_participants',
                'image_affiche', 'est_actif'
            ]), function($value) {
                return $value !== null;
            });

            DB::table('evenements')->where('id', $id)->update($updateData);

            return response()->json([
                'message' => 'Événement modifié avec succès',
                'data' => DB::table('evenements')->where('id', $id)->first()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la modification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete event
     */
    public function destroy($id)
    {
        try {
            DB::table('evenements')->where('id', $id)->delete();

            return response()->json([
                'message' => 'Événement supprimé avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la suppression',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get event participants
     */
    public function participants($id)
    {
        try {
            $participants = DB::table('participations_evenements')
                ->join('users', 'participations_evenements.id_utilisateur', '=', 'users.id')
                ->where('participations_evenements.id_evenement', $id)
                ->select([
                    'participations_evenements.*',
                    'users.prenom',
                    'users.nom',
                    'users.email',
                    'users.telephone'
                ])
                ->orderBy('participations_evenements.date_participation', 'DESC')
                ->get();

            return response()->json($participants);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du chargement des participants',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update participant score
     */
    public function updateParticipantScore(Request $request, $eventId, $participationId)
    {
        $validator = Validator::make($request->all(), [
            'score' => 'required|integer|min:0',
            'a_gagne' => 'boolean',
            'recompense_obtenue' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::table('participations_evenements')
                ->where('id', $participationId)
                ->where('id_evenement', $eventId)
                ->update([
                    'score' => $request->score,
                    'a_gagne' => $request->a_gagne ?? false,
                    'recompense_obtenue' => $request->recompense_obtenue,
                ]);

            return response()->json([
                'message' => 'Score mis à jour avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la mise à jour',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle event status
     */
    public function toggleStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'est_actif' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::table('evenements')
                ->where('id', $id)
                ->update(['est_actif' => $request->est_actif]);

            return response()->json([
                'message' => 'Statut modifié avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la modification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get event statistics
     */
    public function statistics($id)
    {
        try {
            $event = DB::table('evenements')->where('id', $id)->first();

            if (!$event) {
                return response()->json([
                    'message' => 'Événement non trouvé'
                ], 404);
            }

            $stats = [
                'total_participants' => $event->nombre_participants,
                'limite_participants' => $event->limite_participants,
                'taux_remplissage' => $event->limite_participants 
                    ? round(($event->nombre_participants / $event->limite_participants) * 100, 2)
                    : null,
                'winners' => DB::table('participations_evenements')
                    ->where('id_evenement', $id)
                    ->where('a_gagne', true)
                    ->count(),
                'average_score' => DB::table('participations_evenements')
                    ->where('id_evenement', $id)
                    ->whereNotNull('score')
                    ->avg('score'),
            ];

            return response()->json($stats);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du chargement des statistiques',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}