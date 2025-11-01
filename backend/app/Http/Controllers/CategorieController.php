<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CategorieController extends Controller
{
    /**
     * Display a listing of categories.
     */
    public function index(Request $request)
    {
        $query = Categorie::query();

        // Filter by active status
        if ($request->has('active')) {
            $query->where('active', $request->active);
        }

        // Order by display order
        $query->orderBy('ordre_affichage');

        $categories = $query->get();

        return response()->json($categories);
    }

    /**
     * Get category with its articles.
     */
    public function withArticles($id)
    {
        $categorie = Categorie::with('articles')->find($id);

        if (!$categorie) {
            return response()->json([
                'message' => 'Catégorie non trouvée'
            ], 404);
        }

        return response()->json($categorie);
    }

    /**
     * Store a newly created category in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom_categorie' => 'required|string|max:100',
            'description' => 'nullable|string',
            'ordre_affichage' => 'nullable|integer|min:0',
            'active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $categorie = Categorie::create($request->all());

        return response()->json([
            'message' => 'Catégorie créée avec succès',
            'data' => $categorie
        ], 201);
    }

    /**
     * Display the specified category.
     */
    public function show($id)
    {
        $categorie = Categorie::find($id);

        if (!$categorie) {
            return response()->json([
                'message' => 'Catégorie non trouvée'
            ], 404);
        }

        return response()->json($categorie);
    }

    /**
     * Update the specified category in storage.
     */
    public function update(Request $request, $id)
    {
        $categorie = Categorie::find($id);

        if (!$categorie) {
            return response()->json([
                'message' => 'Catégorie non trouvée'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'nom_categorie' => 'sometimes|string|max:100',
            'description' => 'nullable|string',
            'ordre_affichage' => 'nullable|integer|min:0',
            'active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $categorie->update($request->all());

        return response()->json([
            'message' => 'Catégorie mise à jour avec succès',
            'data' => $categorie
        ]);
    }

    /**
     * Remove the specified category from storage.
     */
    public function destroy($id)
    {
        $categorie = Categorie::find($id);

        if (!$categorie) {
            return response()->json([
                'message' => 'Catégorie non trouvée'
            ], 404);
        }

        // Check if category has articles
        if ($categorie->articles()->count() > 0) {
            return response()->json([
                'message' => 'Impossible de supprimer une catégorie contenant des articles'
            ], 400);
        }

        $categorie->delete();

        return response()->json([
            'message' => 'Catégorie supprimée avec succès'
        ]);
    }
}
