<?php

namespace App\Http\Controllers;

use App\Models\Paiement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PaiementController extends Controller
{
    /**
     * Display a listing of payments.
     */
    public function index(Request $request)
    {
        $query = Paiement::with('commande');

        // Filter by order
        if ($request->has('id_commande')) {
            $query->where('id_commande', $request->id_commande);
        }

        // Filter by payment method
        if ($request->has('methode_paiement')) {
            $query->where('methode_paiement', $request->methode_paiement);
        }

        // Filter by payment status
        if ($request->has('statut_paiement')) {
            $query->where('statut_paiement', $request->statut_paiement);
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->whereDate('date_paiement', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->whereDate('date_paiement', '<=', $request->date_to);
        }

        // Order by payment date
        $query->orderBy('date_paiement', 'desc');

        // Pagination
        $perPage = $request->get('per_page', 15);
        $paiements = $query->paginate($perPage);

        return response()->json($paiements);
    }

    /**
     * Store a newly created payment in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_commande' => 'required|exists:commande,id_commande',
            'montant' => 'required|numeric|min:0',
            'methode_paiement' => 'required|in:especes,carte_bancaire,points_fidelite,mixte',
            'statut_paiement' => 'sometimes|in:en_attente,valide,echoue,rembourse',
            'transaction_id' => 'nullable|string|max:255',
            'points_utilises' => 'nullable|integer|min:0',
            'montant_points' => 'nullable|numeric|min:0',
            'montant_especes' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Generate payment reference
        $referencePaiement = 'PAY-' . date('Ymd') . '-' . strtoupper(Str::random(8));

        $paiement = Paiement::create(array_merge($request->all(), [
            'reference_paiement' => $referencePaiement,
            'statut_paiement' => $request->statut_paiement ?? 'en_attente',
        ]));

        $paiement->load('commande');

        return response()->json([
            'message' => 'Paiement créé avec succès',
            'data' => $paiement
        ], 201);
    }

    /**
     * Display the specified payment.
     */
    public function show($id)
    {
        $paiement = Paiement::with('commande.utilisateur')->find($id);

        if (!$paiement) {
            return response()->json([
                'message' => 'Paiement non trouvé'
            ], 404);
        }

        return response()->json($paiement);
    }

    /**
     * Update the specified payment in storage.
     */
    public function update(Request $request, $id)
    {
        $paiement = Paiement::find($id);

        if (!$paiement) {
            return response()->json([
                'message' => 'Paiement non trouvé'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'statut_paiement' => 'sometimes|in:en_attente,valide,echoue,rembourse',
            'transaction_id' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $paiement->update($request->only(['statut_paiement', 'transaction_id']));
        $paiement->load('commande');

        return response()->json([
            'message' => 'Paiement mis à jour avec succès',
            'data' => $paiement
        ]);
    }

    /**
     * Validate a payment.
     */
    public function validate($id)
    {
        $paiement = Paiement::find($id);

        if (!$paiement) {
            return response()->json([
                'message' => 'Paiement non trouvé'
            ], 404);
        }

        $paiement->update(['statut_paiement' => 'valide']);

        return response()->json([
            'message' => 'Paiement validé avec succès',
            'data' => $paiement
        ]);
    }

    /**
     * Remove the specified payment from storage.
     */
    public function destroy($id)
    {
        $paiement = Paiement::find($id);

        if (!$paiement) {
            return response()->json([
                'message' => 'Paiement non trouvé'
            ], 404);
        }

        $paiement->delete();

        return response()->json([
            'message' => 'Paiement supprimé avec succès'
        ]);
    }
}
