<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Request;

/**
 * Gère les opérations CRUD pour la ressource Article, 
 * en se concentrant sur les vues publiques (index et show) pour le catalogue.
 */
class ArticleController extends Controller
{
    /**
     * Affiche une liste paginée des Articles disponibles.
     * Inclut le filtrage et la recherche.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // Récupérer uniquement les articles 'disponible' par défaut
        $query = Article::where('disponible', true)
                         ->with('categorie'); // Chargement Eager de la catégorie

        // Exemple de filtrage par catégorie (si l'ID est fourni)
        if ($request->has('id_categorie')) {
            $query->where('id_categorie', $request->input('id_categorie'));
        }

        // Exemple de recherche par nom ou description
        if ($request->has('search')) {
            $searchTerm = $request->input('search');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('nom', 'like', '%' . $searchTerm . '%')
                  ->orWhere('description', 'like', '%' . $searchTerm . '%');
            });
        }
        
        // Trier par nom ou par date de création (ex: les plus récents en premier)
        $articles = $query->orderBy('date_creation', 'desc')->paginate(15);

        return response()->json($articles);
    }

    /**
     * Affiche les détails d'un Article spécifique par son ID.
     *
     * @param  int  $id_article
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(int $id_article)
    {
        $article = Article::where('id_article', $id_article)
                          ->where('disponible', true) // S'assurer qu'il est disponible
                          ->with('categorie')
                          ->first();

        if (!$article) {
            return response()->json(['message' => 'Article non trouvé ou non disponible.'], 404);
        }

        return response()->json($article);
    }
    
    // NOTE: Les méthodes 'store', 'update', 'destroy' pour la gestion 
    // par l'administrateur seraient ajoutées ici, potentiellement dans un AdminController.
}
