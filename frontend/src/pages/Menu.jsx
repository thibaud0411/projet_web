import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Image as ImageIcon, Star } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const Menu = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix: '',
    id_categorie: '',
    temps_preparation: '',
    allergenes: '',
    calories: '',
    est_disponible: true,
    est_plat_du_jour: false,
    image_url: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Backend uses /articles and /categories-list
      const [articlesRes, categoriesRes] = await Promise.all([
        api.get('/articles'),
        api.get('/categories-list')
      ]);

      // Laravel paginator returns { data: [...] } when paginated
      const articlesData = Array.isArray(articlesRes.data)
        ? articlesRes.data
        : articlesRes.data.data ?? [];

      // Normalize article fields to what the frontend expects
      const normalized = articlesData.map((a) => ({
        id: a.id_article ?? a.id ?? null,
        nom: a.nom ?? a.nom_article ?? '',
        description: a.description ?? '',
        prix: a.prix ?? 0,
        id_categorie: a.id_categorie ?? null,
        temps_preparation: a.temps_preparation ?? '',
        allergenes: a.allergenes ?? '',
        calories: a.calories ?? '',
        est_disponible: a.disponible ?? a.est_disponible ?? true,
        est_plat_du_jour: a.est_promotion ?? a.est_plat_du_jour ?? false,
        image_url: a.image_url ?? '',
      }));

      // Normalize categories
      const cats = Array.isArray(categoriesRes.data)
        ? categoriesRes.data
        : categoriesRes.data.data ?? [];

      const normalizedCats = cats.map((c) => ({
        id: c.id_categorie ?? c.id ?? null,
        nom: c.nom_categorie ?? c.nom ?? '',
      }));

      setProducts(normalized);
      setCategories(normalizedCats);
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Build payload matching backend ArticleController fields
      const payload = {
        nom: formData.nom,
        description: formData.description,
        prix: parseFloat(formData.prix) || 0,
        id_categorie: formData.id_categorie,
        disponible: formData.est_disponible,
        est_promotion: formData.est_plat_du_jour,
        image_url: formData.image_url,
      };

      if (editingProduct) {
        await api.put(`/admin/articles/${editingProduct.id}`, payload);
        toast.success('Produit modifié avec succès');
      } else {
        await api.post('/admin/articles', payload);
        toast.success('Produit créé avec succès');
      }
      
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'opération');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) return;
    
    try {
  await api.delete(`/admin/articles/${id}`);
      toast.success('Produit supprimé avec succès');
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const toggleAvailability = async (product) => {
    try {
      // Backend expects 'disponible'
      await api.patch(`/admin/articles/${product.id}`, {
        disponible: !product.est_disponible
      });
      toast.success('Disponibilité modifiée');
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la modification');
    }
  };

  const togglePlatDuJour = async (product) => {
    try {
      // Use est_promotion field on backend
      await api.patch(`/admin/articles/${product.id}`, {
        est_promotion: !product.est_plat_du_jour
      });
      toast.success('Plat du jour modifié');
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la modification');
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      nom: product.nom,
      description: product.description || '',
      prix: product.prix,
      id_categorie: product.id_categorie,
      temps_preparation: product.temps_preparation || '',
      allergenes: product.allergenes || '',
      calories: product.calories || '',
      est_disponible: product.est_disponible,
      est_plat_du_jour: product.est_plat_du_jour,
      image_url: product.image_url || '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      nom: '',
      description: '',
      prix: '',
      id_categorie: '',
      temps_preparation: '',
      allergenes: '',
      calories: '',
      est_disponible: true,
      est_plat_du_jour: false,
      image_url: '',
    });
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.id_categorie === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion du menu</h1>
          <p className="text-gray-600 mt-1">
            Gérez les produits et catégories du restaurant
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus size={20} />
          Nouveau produit
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nom}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            {/* Product Image */}
            <div className="relative h-48 bg-gray-200">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.nom}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="text-gray-400" size={48} />
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-2 right-2 flex flex-col gap-2">
                {product.est_plat_du_jour && (
                  <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Star size={12} fill="white" />
                    Plat du jour
                  </span>
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  product.est_disponible
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                }`}>
                  {product.est_disponible ? 'Disponible' : 'Indisponible'}
                </span>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">
                    {product.nom}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {product.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <div className="text-xl font-bold text-primary">
                  {product.prix.toLocaleString('fr-FR')} FCFA
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAvailability(product)}
                    className={`p-2 rounded-lg transition-colors ${
                      product.est_disponible
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                    }`}
                    title={product.est_disponible ? 'Marquer indisponible' : 'Marquer disponible'}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => togglePlatDuJour(product)}
                    className={`p-2 rounded-lg transition-colors ${
                      product.est_plat_du_jour
                        ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={product.est_plat_du_jour ? 'Retirer du plat du jour' : 'Définir comme plat du jour'}
                  >
                    <Star size={16} fill={product.est_plat_du_jour ? 'currentColor' : 'none'} />
                  </button>
                  
                  <button
                    onClick={() => openEditModal(product)}
                    className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  {product.temps_preparation && (
                    <span>⏱️ {product.temps_preparation} min</span>
                  )}
                  {product.calories && (
                    <span>🔥 {product.calories} kcal</span>
                  )}
                </div>
                {product.allergenes && (
                  <p className="text-xs text-red-600 mt-1">
                    ⚠️ Allergènes: {product.allergenes}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Aucun produit trouvé</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 my-8">
            <h2 className="text-2xl font-bold mb-4">
              {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du produit *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix (FCFA) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.prix}
                    onChange={(e) => setFormData({...formData, prix: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie *
                  </label>
                  <select
                    required
                    value={formData.id_categorie}
                    onChange={(e) => setFormData({...formData, id_categorie: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nom}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Temps de préparation (min)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.temps_preparation}
                    onChange={(e) => setFormData({...formData, temps_preparation: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calories
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.calories}
                    onChange={(e) => setFormData({...formData, calories: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allergènes
                  </label>
                  <input
                    type="text"
                    value={formData.allergenes}
                    onChange={(e) => setFormData({...formData, allergenes: e.target.value})}
                    placeholder="Ex: Arachides, Gluten, Lactose"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL de l'image
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="md:col-span-2 flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.est_disponible}
                      onChange={(e) => setFormData({...formData, est_disponible: e.target.checked})}
                      className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Produit disponible
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.est_plat_du_jour}
                      onChange={(e) => setFormData({...formData, est_plat_du_jour: e.target.checked})}
                      className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Plat du jour
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  {editingProduct ? 'Modifier' : 'Créer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;