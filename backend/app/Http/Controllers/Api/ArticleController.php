<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Article; // Importer le modèle
use Illuminate\Validation\Rule;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class ArticleController extends Controller
{
    /**
     * LIRE: Récupère tous les articles pour la page 'Menu'.
     * (GET /api/menu-items)
     */
    public function index()
    {
        // 1. Récupérer les articles avec leur catégorie
        $articles = Article::with('categorie')->get(); 
        
        // 2. Transformer les données pour correspondre à l'interface 'Dish' du frontend
        $formattedArticles = $articles->map(function ($article) {
            
            $categorieNom = $article->categorie->nom_categorie ?? 'Autre';

            return [
                'id_plat' => $article->id_article, // Le frontend attend 'id_plat'
                'nom' => $article->nom,
                'description' => $article->description,
                'categorie' => $categorieNom, // Le frontend attend le nom de la catégorie
                'prix' => $article->prix,
                'statut' => $article->disponible ? 'available' : 'unavailable', // Conversion booléen -> string
                'image_url' => $article->image_url,
                'updated_at' => $article->date_modification ?? $article->date_creation, 
            ];
        });

        // 3. Renvoyer les données en JSON
        return response()->json($formattedArticles);
    }

    /**
     * METTRE À JOUR: Met à jour le statut (disponibilité) d'un article.
     * (PATCH /api/menu-items/{id})
     */
    public function update(Request $request, $id)
    {
        try {
            $article = Article::findOrFail($id);
            
            // Valider que le statut est 'available' ou 'unavailable'
            $data = $request->validate([
                'statut' => ['required', 'string', Rule::in(['available', 'unavailable'])],
            ]);

            // Convertir 'available' -> true, 'unavailable' -> false
            $article->disponible = ($data['statut'] === 'available');
            $article->save();

            // Renvoyer l'article mis à jour (après re-transformation)
            $categorieNom = $article->categorie->nom_categorie ?? 'Autre';
            $formattedArticle = [
                'id_plat' => $article->id_article,
                'nom' => $article->nom,
                'description' => $article->description,
                'categorie' => $categorieNom,
                'prix' => $article->prix,
                'statut' => $article->disponible ? 'available' : 'unavailable',
                'image_url' => $article->image_url,
                'updated_at' => $article->date_modification,
            ];

            return response()->json($formattedArticle);

        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Article non trouvé.'], 404);
        } catch (\Exception $e) {
            \Log::error("Erreur update article: " . $e->getMessage());
            return response()->json(['message' => 'Erreur serveur lors de la mise à jour.'], 500);
        }
    }
}