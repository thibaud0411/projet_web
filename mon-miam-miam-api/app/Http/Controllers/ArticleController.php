<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ArticleController extends Controller
{
    /**
     * Display a listing of articles.
     */
    public function index(Request $request)
    {
        $query = Article::with('categorie');

        // Filter by category
        if ($request->has('id_categorie')) {
            $query->where('id_categorie', $request->id_categorie);
        }

        // Filter by availability
        if ($request->has('disponible')) {
            $query->where('disponible', $request->disponible);
        }

        // Filter by promotion
        if ($request->has('est_promotion')) {
            $query->where('est_promotion', $request->est_promotion);
        }

        // Search by name
        if ($request->has('search')) {
            $query->where('nom', 'like', '%' . $request->search . '%');
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $articles = $query->paginate($perPage);

        return response()->json($articles);
    }

    /**
     * Store a newly created article in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:150',
            'description' => 'nullable|string',
            'prix' => 'required|numeric|min:0',
            'id_categorie' => 'required|exists:categorie,id_categorie',
            'disponible' => 'boolean',
            'image_url' => 'nullable|string|max:255',
            'est_promotion' => 'boolean',
            'stock_disponible' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $article = Article::create($request->all());
        $article->load('categorie');

        return response()->json([
            'message' => 'Article créé avec succès',
            'data' => $article
        ], 201);
    }

    /**
     * Display the specified article.
     */
    public function show($id)
    {
        $article = Article::with('categorie')->find($id);

        if (!$article) {
            return response()->json([
                'message' => 'Article non trouvé'
            ], 404);
        }

        return response()->json($article);
    }

    /**
     * Update the specified article in storage.
     */
    public function update(Request $request, $id)
    {
        $article = Article::find($id);

        if (!$article) {
            return response()->json([
                'message' => 'Article non trouvé'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'nom' => 'sometimes|string|max:150',
            'description' => 'nullable|string',
            'prix' => 'sometimes|numeric|min:0',
            'id_categorie' => 'sometimes|exists:categorie,id_categorie',
            'disponible' => 'boolean',
            'image_url' => 'nullable|string|max:255',
            'est_promotion' => 'boolean',
            'stock_disponible' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $article->update($request->all());
        $article->load('categorie');

        return response()->json([
            'message' => 'Article mis à jour avec succès',
            'data' => $article
        ]);
    }

    /**
     * Remove the specified article from storage.
     */
    public function destroy($id)
    {
        $article = Article::find($id);

        if (!$article) {
            return response()->json([
                'message' => 'Article non trouvé'
            ], 404);
        }

        $article->delete();

        return response()->json([
            'message' => 'Article supprimé avec succès'
        ]);
    }
}
