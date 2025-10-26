<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use Illuminate\Http\Request;

/**
 * Gère la lecture des Catégories pour l'affichage du menu/catalogue.
 */
class CategorieController extends Controller
{
    /**
     * Affiche une liste de toutes les Catégories actives.
     * * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        // Récupérer uniquement les catégories 'active' et les trier
        $categories = Categorie::where('active', true)
                               ->orderBy('ordre_affichage')
                               ->with('articles') // Optionnel: charger les articles de chaque catégorie
                               ->get();

        return response()->json($categories);
    }

    /**
     * Affiche les détails d'une Catégorie spécifique et ses articles.
     *
     * @param  int  $id_categorie
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(int $id_categorie)
    {
        $categorie = Categorie::where('id_categorie', $id_categorie)
                              ->where('active', true)
                              ->with(['articles' => function ($query) {
                                  // Filtrer les articles pour n'afficher que ceux qui sont disponibles
                                  $query->where('disponible', true);
                              }])
                              ->first();

        if (!$categorie) {
            return response()->json(['message' => 'Catégorie non trouvée ou inactive.'], 404);
        }

        return response()->json($categorie);
    }
}
