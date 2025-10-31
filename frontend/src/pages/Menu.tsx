import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Plus, Search, Edit, Trash2, Image as ImageIcon, Star } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';
import { Product, Category, ProductFormData } from '../types/menu';

const Menu = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | number>('all');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
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

  const fetchData = async (): Promise<void> => {
    try {
      const [articlesRes, categoriesRes] = await Promise.all([
        api.get('/articles'),
        api.get('/categories-list')
      ]);

      const articlesData = Array.isArray(articlesRes.data)
        ? articlesRes.data
        : articlesRes.data?.data ?? [];

      const normalized = articlesData.map((a: any) => ({
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

      const cats = Array.isArray(categoriesRes.data)
        ? categoriesRes.data
        : categoriesRes.data?.data ?? [];

      const normalizedCats = cats.map((c: any) => ({
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

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    
    try {
      const payload = {
        nom: formData.nom,
        description: formData.description,
        prix: parseFloat(formData.prix as string) || 0,
        id_categorie: formData.id_categorie,
        disponible: formData.est_disponible,
        est_promotion: formData.est_plat_du_jour,
        image_url: formData.image_url,
      };

      if (editingProduct && editingProduct.id) {
        await api.put(`/admin/articles/${editingProduct.id}`, payload);
        toast.success('Produit modifié avec succès');
      } else {
        await api.post('/admin/articles', payload);
        toast.success('Produit créé avec succès');
      }
      
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'opération');
    }
  };

  const handleDelete = async (id: number | string | null): Promise<void> => {
    if (!id || !window.confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) return;
    
    try {
      await api.delete(`/admin/articles/${id}`);
      toast.success('Produit supprimé avec succès');
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const toggleAvailability = async (product: Product): Promise<void> => {
    if (!product.id) return;
    
    try {
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

  const togglePlatDuJour = async (product: Product): Promise<void> => {
    if (!product.id) return;
    
    try {
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

  const openEditModal = (product: Product): void => {
    setEditingProduct(product);
    setFormData({
      nom: product.nom,
      description: product.description || '',
      prix: product.prix,
      id_categorie: product.id_categorie ?? '',
      temps_preparation: product.temps_preparation || '',
      allergenes: product.allergenes || '',
      calories: product.calories || '',
      est_disponible: product.est_disponible,
      est_plat_du_jour: product.est_plat_du_jour,
      image_url: product.image_url || '',
    });
    setShowModal(true);
  };

  const resetForm = (): void => {
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

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.id_categorie?.toString() === selectedCategory.toString();
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
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Gestion du Menu</h1>
        <Button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus size={18} />
          Ajouter un produit
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher un produit..."
              className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Toutes les catégories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id ?? ''}>
                {category.nom}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.nom}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}
              {product.est_plat_du_jour && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <Star size={14} />
                  Plat du jour
                </div>
              )}
              <div className="absolute top-2 left-2">
                <button
                  onClick={() => togglePlatDuJour(product)}
                  className={`p-2 rounded-full ${product.est_plat_du_jour ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                  title={product.est_plat_du_jour ? 'Retirer du plat du jour' : 'Définir comme plat du jour'}
                >
                  <Star size={16} />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-800">{product.nom}</h3>
                <span className="text-lg font-bold text-primary">{product.prix} €</span>
              </div>
              {product.description && (
                <p className="text-gray-600 mt-2 text-sm line-clamp-2">{product.description}</p>
              )}
              <div className="mt-4 flex justify-between items-center">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={product.est_disponible}
                    onChange={() => toggleAvailability(product)}
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  <span className="ms-3 text-sm font-medium text-gray-700">
                    {product.est_disponible ? 'Disponible' : 'Indisponible'}
                  </span>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(product)}
                    className="p-2 text-gray-600 hover:text-primary transition-colors"
                    title="Modifier"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 text-red-600 hover:text-red-800 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucun produit trouvé</p>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Nom *</label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Catégorie *</label>
                    <select
                      name="id_categorie"
                      value={formData.id_categorie}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                      required
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id ?? ''}>
                          {category.nom}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Prix (€) *</label>
                    <input
                      type="number"
                      name="prix"
                      step="0.01"
                      min="0"
                      value={formData.prix}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Temps de préparation</label>
                    <input
                      type="text"
                      name="temps_preparation"
                      value={formData.temps_preparation}
                      onChange={handleInputChange}
                      placeholder="Ex: 15 min"
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Allergènes</label>
                    <input
                      type="text"
                      name="allergenes"
                      value={formData.allergenes}
                      onChange={handleInputChange}
                      placeholder="Ex: Lait, fruits à coque"
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Calories</label>
                    <input
                      type="text"
                      name="calories"
                      value={formData.calories}
                      onChange={handleInputChange}
                      placeholder="Ex: 250 kcal"
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">URL de l'image</label>
                    <input
                      type="url"
                      name="image_url"
                      value={formData.image_url}
                      onChange={handleInputChange}
                      placeholder="https://exemple.com/image.jpg"
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Disponibilité</label>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="est_disponible"
                        checked={formData.est_disponible}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      <span className="ms-3 text-sm font-medium text-gray-700">
                        {formData.est_disponible ? 'Disponible' : 'Indisponible'}
                      </span>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Plat du jour</label>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="est_plat_du_jour"
                        checked={formData.est_plat_du_jour}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                      <span className="ms-3 text-sm font-medium text-gray-700">
                        {formData.est_plat_du_jour ? 'Oui' : 'Non'}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    {editingProduct ? 'Mettre à jour' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
