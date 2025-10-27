<?php

namespace App\Http\Controllers;

use App\Models\Commentaire;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CommentaireController extends Controller
{
    /**
     * Display a listing of comments.
     */
    public function index(Request $request)
    {
        $query = Commentaire::with('commande');

        // Filter by order
        if ($request->has('id_commande')) {
            $query->where('id_commande', $request->id_commande);
        }

        // Filter by visibility
        if ($request->has('est_visible')) {
            $query->where('est_visible', $request->est_visible);
        }

        // Filter by minimum rating
        if ($request->has('min_note')) {
            $query->where('note', '>=', $request->min_note);
        }

        // Order by latest first
        $query->orderBy('date_commentaire', 'desc');

        // Pagination
        $perPage = $request->get('per_page', 15);
        $commentaires = $query->paginate($perPage);

        return response()->json($commentaires);
    }

    /**
     * Store a newly created comment in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_commande' => 'required|exists:commande,id_commande',
            'contenu' => 'required|string',
            'note' => 'required|integer|min:1|max:5',
            'est_visible' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $commentaire = Commentaire::create($request->all());
        $commentaire->load('commande');

        return response()->json([
            'message' => 'Commentaire créé avec succès',
            'data' => $commentaire
        ], 201);
    }

    /**
     * Display the specified comment.
     */
    public function show($id)
    {
        $commentaire = Commentaire::with('commande')->find($id);

        if (!$commentaire) {
            return response()->json([
                'message' => 'Commentaire non trouvé'
            ], 404);
        }

        return response()->json($commentaire);
    }

    /**
     * Update the specified comment in storage.
     */
    public function update(Request $request, $id)
    {
        $commentaire = Commentaire::find($id);

        if (!$commentaire) {
            return response()->json([
                'message' => 'Commentaire non trouvé'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'contenu' => 'sometimes|string',
            'note' => 'sometimes|integer|min:1|max:5',
            'est_visible' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $commentaire->update($request->all());
        $commentaire->load('commande');

        return response()->json([
            'message' => 'Commentaire mis à jour avec succès',
            'data' => $commentaire
        ]);
    }

    /**
     * Toggle visibility of a comment.
     */
    public function toggleVisibility($id)
    {
        $commentaire = Commentaire::find($id);

        if (!$commentaire) {
            return response()->json([
                'message' => 'Commentaire non trouvé'
            ], 404);
        }

        $commentaire->update(['est_visible' => !$commentaire->est_visible]);

        return response()->json([
            'message' => 'Visibilité du commentaire mise à jour',
            'data' => $commentaire
        ]);
    }

    /**
     * Remove the specified comment from storage.
     */
    public function destroy($id)
    {
        $commentaire = Commentaire::find($id);

        if (!$commentaire) {
            return response()->json([
                'message' => 'Commentaire non trouvé'
            ], 404);
        }

        $commentaire->delete();

        return response()->json([
            'message' => 'Commentaire supprimé avec succès'
        ]);
    }
}
