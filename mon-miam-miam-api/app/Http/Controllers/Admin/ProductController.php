<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Get all products with filters
     */
    public function index(Request $request)
    {
        try {
            $query = DB::table('produits')
                ->leftJoin('categories', 'produits.categorie_id', '=', 'categories.id')
                ->select([
                    'produits.*',
                    'categories.nom as categorie_nom'
                ]);

            // Filter by category
            if ($request->has('categorie_id') && $request->categorie_id !== 'all') {
                $query->where('produits.categorie_id', $request->categorie_id);
            }

            // Filter by status
            if ($request->has('est_actif') && $request->est_actif !== 'all') {
                $query->where('produits.est_actif', $request->boolean('est_actif'));
            }

            // Search
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('produits.nom', 'LIKE', "%{$search}%")
                      ->orWhere('produits.description', 'LIKE', "%{$search}%")
                      ->orWhere('produits.reference', 'LIKE', "%{$search}%");
                });
            }

            // Sorting
            $sortField = $request->input('sort_by', 'nom');
            $sortOrder = $request->input('sort_order', 'asc');
            $query->orderBy($sortField, $sortOrder);

            $products = $query->paginate($request->input('per_page', 15));

            return response()->json($products);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du chargement des produits',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create new product
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:100',
            'description' => 'nullable|string',
            'prix' => 'required|numeric|min:0',
            'prix_promotionnel' => 'nullable|numeric|min:0',
            'reference' => 'required|string|max:50|unique:produits,reference',
            'categorie_id' => 'required|exists:categories,id',
            'stock_disponible' => 'required|integer|min:0',
            'stock_alerte' => 'required|integer|min:0',
            'est_actif' => 'boolean',
            'est_mis_en_avant' => 'boolean',
            'ingredients' => 'nullable|string',
            'allergenes' => 'nullable|string',
            'temps_preparation' => 'nullable|integer|min:0', // in minutes
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $this->uploadImage($request->file('image'), 'products');
            }

            $productId = DB::table('produits')->insertGetId([
                'nom' => $request->nom,
                'description' => $request->description,
                'prix' => $request->prix,
                'prix_promotionnel' => $request->prix_promotionnel,
                'reference' => $request->reference,
                'categorie_id' => $request->categorie_id,
                'stock_disponible' => $request->stock_disponible,
                'stock_alerte' => $request->stock_alerte,
                'est_actif' => $request->boolean('est_actif', true),
                'est_mis_en_avant' => $request->boolean('est_mis_en_avant', false),
                'ingredients' => $request->ingredients,
                'allergenes' => $request->allergenes,
                'temps_preparation' => $request->temps_preparation,
                'image_url' => $imagePath,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Handle multiple images
            if ($request->hasFile('images')) {
                $this->uploadProductImages($productId, $request->file('images'));
            }

            DB::commit();

            return response()->json([
                'message' => 'Produit créé avec succès',
                'data' => $this->getProductWithDetails($productId)
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            // Delete uploaded files if any error occurs
            if (isset($imagePath)) {
                Storage::delete($imagePath);
            }
            
            return response()->json([
                'message' => 'Erreur lors de la création du produit',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single product with details
     */
    public function show($id)
    {
        try {
            $product = $this->getProductWithDetails($id);

            if (!$product) {
                return response()->json([
                    'message' => 'Produit non trouvé'
                ], 404);
            }

            return response()->json($product);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du chargement du produit',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update product
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'sometimes|required|string|max:100',
            'description' => 'nullable|string',
            'prix' => 'sometimes|required|numeric|min:0',
            'prix_promotionnel' => 'nullable|numeric|min:0',
            'reference' => 'sometimes|required|string|max:50|unique:produits,reference,' . $id,
            'categorie_id' => 'sometimes|required|exists:categories,id',
            'stock_disponible' => 'sometimes|required|integer|min:0',
            'stock_alerte' => 'sometimes|required|integer|min:0',
            'est_actif' => 'boolean',
            'est_mis_en_avant' => 'boolean',
            'ingredients' => 'nullable|string',
            'allergenes' => 'nullable|string',
            'temps_preparation' => 'nullable|integer|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'deleted_images' => 'nullable|array',
            'deleted_images.*' => 'exists:produit_images,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $product = DB::table('produits')->find($id);
            if (!$product) {
                return response()->json([
                    'message' => 'Produit non trouvé'
                ], 404);
            }

            $updateData = array_filter($request->only([
                'nom', 'description', 'prix', 'prix_promotionnel', 'reference',
                'categorie_id', 'stock_disponible', 'stock_alerte', 'ingredients',
                'allergenes', 'temps_preparation'
            ]));

            // Handle main image update
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($product->image_url) {
                    Storage::delete($product->image_url);
                }
                $updateData['image_url'] = $this->uploadImage($request->file('image'), 'products');
            }

            // Handle boolean fields
            if ($request->has('est_actif')) {
                $updateData['est_actif'] = $request->boolean('est_actif');
            }
            if ($request->has('est_mis_en_avant')) {
                $updateData['est_mis_en_avant'] = $request->boolean('est_mis_en_avant');
            }

            $updateData['updated_at'] = now();

            DB::table('produits')->where('id', $id)->update($updateData);

            // Handle multiple images
            if ($request->hasFile('images')) {
                $this->uploadProductImages($id, $request->file('images'));
            }

            // Delete selected images
            if ($request->has('deleted_images') && is_array($request->deleted_images)) {
                $this->deleteProductImages($request->deleted_images);
            }

            DB::commit();

            return response()->json([
                'message' => 'Produit mis à jour avec succès',
                'data' => $this->getProductWithDetails($id)
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la mise à jour du produit',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete product
     */
    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $product = DB::table('produits')->find($id);
            if (!$product) {
                return response()->json([
                    'message' => 'Produit non trouvé'
                ], 404);
            }

            // Delete main image
            if ($product->image_url) {
                Storage::delete($product->image_url);
            }

            // Delete additional images
            $productImages = DB::table('produit_images')
                ->where('produit_id', $id)
                ->get();

            foreach ($productImages as $image) {
                Storage::delete($image->url);
            }

            // Delete from database
            DB::table('produit_images')->where('produit_id', $id)->delete();
            $deleted = DB::table('produits')->where('id', $id)->delete();

            DB::commit();

            if ($deleted) {
                return response()->json([
                    'message' => 'Produit supprimé avec succès'
                ]);
            }

            return response()->json([
                'message' => 'Erreur lors de la suppression du produit'
            ], 500);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la suppression du produit',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle product status
     */
    public function toggleStatus($id)
    {
        try {
            $product = DB::table('produits')->find($id);

            if (!$product) {
                return response()->json([
                    'message' => 'Produit non trouvé'
                ], 404);
            }

            $newStatus = !$product->est_actif;
            
            DB::table('produits')
                ->where('id', $id)
                ->update(['est_actif' => $newStatus]);

            return response()->json([
                'message' => 'Statut du produit mis à jour',
                'est_actif' => $newStatus
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du changement de statut',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update product stock
     */
    public function updateStock(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'stock_disponible' => 'required|integer|min:0',
            'raison' => 'required|in:ajout,retrait,correction,commande,retour',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $product = DB::table('produits')->find($id);
            if (!$product) {
                return response()->json([
                    'message' => 'Produit non trouvé'
                ], 404);
            }

            $oldStock = $product->stock_disponible;
            $newStock = $request->stock_disponible;

            // Update product stock
            DB::table('produits')
                ->where('id', $id)
                ->update(['stock_disponible' => $newStock]);

            // Log stock movement
            DB::table('mouvements_stock')->insert([
                'produit_id' => $id,
                'type_mouvement' => 'ajout',
                'quantite' => $newStock - $oldStock,
                'quantite_avant' => $oldStock,
                'quantite_apres' => $newStock,
                'raison' => $request->raison,
                'notes' => $request->notes,
                'utilisateur_id' => auth()->id(),
                'created_at' => now()
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Stock mis à jour avec succès',
                'stock_actuel' => $newStock
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la mise à jour du stock',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get product stock history
     */
    public function stockHistory($id)
    {
        try {
            $history = DB::table('mouvements_stock')
                ->leftJoin('users', 'mouvements_stock.utilisateur_id', '=', 'users.id')
                ->where('mouvements_stock.produit_id', $id)
                ->select([
                    'mouvements_stock.*',
                    'users.nom as utilisateur_nom',
                    'users.prenom as utilisateur_prenom'
                ])
                ->orderBy('mouvements_stock.created_at', 'desc')
                ->get();

            return response()->json($history);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du chargement de l\'historique du stock',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get low stock products
     */
    public function lowStock()
    {
        try {
            $products = DB::table('produits')
                ->whereColumn('stock_disponible', '<=', 'stock_alerte')
                ->where('est_actif', true)
                ->orderBy('stock_disponible', 'asc')
                ->get();

            return response()->json($products);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du chargement des produits en stock bas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload product image
     */
    private function uploadImage($file, $folder = 'products')
    {
        $extension = $file->getClientOriginalExtension();
        $filename = Str::random(40) . '.' . $extension;
        $path = $file->storeAs("public/{$folder}", $filename);
        return str_replace('public/', 'storage/', $path);
    }

    /**
     * Upload multiple product images
     */
    private function uploadProductImages($productId, $images)
    {
        $imageData = [];
        foreach ($images as $image) {
            $path = $this->uploadImage($image, 'products/additional');
            $imageData[] = [
                'produit_id' => $productId,
                'url' => $path,
                'created_at' => now(),
                'updated_at' => now()
            ];
        }

        if (!empty($imageData)) {
            DB::table('produit_images')->insert($imageData);
        }
    }

    /**
     * Delete product images
     */
    private function deleteProductImages($imageIds)
    {
        $images = DB::table('produit_images')
            ->whereIn('id', $imageIds)
            ->get();

        foreach ($images as $image) {
            Storage::delete(str_replace('storage/', 'public/', $image->url));
        }

        DB::table('produit_images')
            ->whereIn('id', $imageIds)
            ->delete();
    }

    /**
     * Get product with all details
     */
    private function getProductWithDetails($id)
    {
        $product = DB::table('produits')
            ->leftJoin('categories', 'produits.categorie_id', '=', 'categories.id')
            ->select([
                'produits.*',
                'categories.nom as categorie_nom'
            ])
            ->where('produits.id', $id)
            ->first();

        if ($product) {
            // Get additional images
            $product->images = DB::table('produit_images')
                ->where('produit_id', $id)
                ->get();

            // Get category details
            $product->categorie = DB::table('categories')
                ->find($product->categorie_id);

            // Get stock alerts
            $product->alerte_stock = $product->stock_disponible <= $product->stock_alerte;
        }

        return $product;
    }
}