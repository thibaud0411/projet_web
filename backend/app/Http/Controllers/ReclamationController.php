<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Reclamation;
use Illuminate\Support\Facades\Log;

class ReclamationController extends Controller
{
    public function store(Request $request)
    {
        $user = Auth::user();
        if (!$user) return response()->json(['message' => 'Non authentifié.'], 401);

        $request->validate([
            'sujet' => 'required|string|max:255',
            'description' => 'required|string',
            'id_commande' => 'nullable|exists:commande,id_commande',
        ]);

        try {
            $reclamation = Reclamation::create([
                'id_utilisateur' => $user->id_utilisateur,
                'description' => $request->description,
                'statut' => 'Pending',
                'id_commande' => $request->id_commande
            ]);

            Log::info('Réclamation créée: ' . $reclamation->id_reclamation);

            return response()->json([
                'success' => true,
                'reclamation_id' => $reclamation->id_reclamation
            ], 201);

        } catch (\Exception $e) {
            Log::error('Erreur réclamation: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Impossible de créer la réclamation.'], 500);
        }
    }
}
