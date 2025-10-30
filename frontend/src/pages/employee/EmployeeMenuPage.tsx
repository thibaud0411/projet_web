// src/pages/employee/EmployeeMenuPage.tsx
import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import { formatAmount, getTimeAgo } from '../../components/utils/formatters';
import { InfoTile } from '../../components/shared/InfoTile';
import { InfoTileRow } from '../../components/shared/InfoTileRow';
import { PageHeader } from '../../components/shared/PageHeader';
import apiClient from '../../apiClient'; // <<< CORRECTION: Import d'apiClient
import './EmployeeMenuPage.css';

// --- Interfaces (Correspond à l'API) ---
interface Dish {
  id_plat: number;
  nom: string;
  description: string | null;
  categorie: string; // 'Plats principaux', 'Boissons', etc.
  prix: number;
  statut: 'available' | 'unavailable';
  image_url: string | null;
  updated_at: string;
}

// Catégories pour filtrer
const categories = [
  { id: 'all', name: 'Tous' },
  { id: 'Plats principaux', name: 'Plats principaux' },
  { id: 'Boissons', name: 'Boissons' },
  { id: 'Desserts', name: 'Desserts' },
];

export const EmployeeMenuPage: React.FC = () => {
  // --- États ---
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  // const apiUrl = import.meta.env.VITE_API_URL; // (Plus nécessaire)

  // --- Fetch initial des données ---
  useEffect(() => {
    AOS.init({ duration: 800, once: true, offset: 50 });
    fetchMenuData();
  }, []); // Dépendance apiUrl supprimée

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // <<< CORRECTION: Utilisation d'apiClient au lieu de fetch >>>
      const response = await apiClient.get<Dish[]>('/menu-items');
      const data = response.data; // La réponse d'Axios est dans .data
      // --- Fin de la correction ---
      
      setDishes(data);
    } catch (err: any) {
      // <<< CORRECTION: Gestion d'erreur Axios >>>
      const message = err.response?.data?.message || err.message || "Impossible de charger le menu.";
      setError(message);
      // --- Fin de la correction ---
    } finally {
      setLoading(false);
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category.toLowerCase()) {
      case 'plats principaux': return 'badge-meal';
      case 'desserts': return 'badge-dessert';
      case 'boissons': return 'badge-drink';
      default: return 'badge-other';
    }
  };

  const filteredDishes = filterCategory === 'all'
    ? dishes
    : dishes.filter(dish => dish.categorie === filterCategory);

  const totalDishes = dishes.length;
  const availableDishes = dishes.filter(d => d.statut === 'available').length;
  const soldOutDishes = dishes.filter(d => d.statut === 'unavailable').length;
  const totalCategories = categories.filter(c => c.id !== 'all').length;

  // --- Mise à jour du Statut (Toggle) ---
  const handleStatusToggle = async (id: number) => {
    const originalDishes = [...dishes];
    const newStatus = dishes.find(d => d.id_plat === id)?.statut === 'available' ? 'unavailable' : 'available';

    // 1. Mise à jour optimiste (UI)
    setDishes(prevDishes =>
      prevDishes.map(dish =>
        dish.id_plat === id
          ? { ...dish, statut: newStatus }
          : dish
      )
    );

    // 2. Appel API (PATCH)
    try {
        // <<< CORRECTION: Utilisation d'apiClient.patch au lieu de fetch >>>
        const response = await apiClient.patch(
            `/menu-items/${id}`,
            { statut: newStatus } // Le corps de la requête
        );
        
        const updatedDish = response.data; // La réponse d'Axios est dans .data
        // --- Fin de la correction ---

        // 3. Confirmer la mise à jour avec les données de l'API
        setDishes(prev => prev.map(d => d.id_plat === id ? updatedDish : d));

    } catch (err) {
        setError('Échec de la mise à jour. Rétablissement...');
        // 4. Rollback en cas d'erreur
        setDishes(originalDishes);
        // Cacher l'erreur après 3 secondes
        setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <div>
      <PageHeader
        title="Gestion du Menu"
        subtitle="Gérez les plats, prix et disponibilité."
        actionButton={
          <button className="btn btn-primary">
            <i className="bi bi-plus-lg me-2"></i> Ajouter un plat
          </button>
        }
      />

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <InfoTileRow data-aos="fade-up" data-aos-delay="100" className="mb-4">
          <InfoTile value={<span>{totalDishes}</span>} label="Plats (Total)" icon={<i className="bi bi-journal-text"></i>} iconBgClass="icon-bg-1" />
          <InfoTile value={<span className="text-success">{availableDishes}</span>} label="Disponibles" icon={<i className="bi bi-check-circle"></i>} iconBgClass="icon-bg-2" />
          <InfoTile value={<span className="text-danger">{soldOutDishes}</span>} label="Épuisés" icon={<i className="bi bi-x-circle"></i>} iconBgClass="icon-bg-3" />
          <InfoTile value={<span>{totalCategories}</span>} label="Catégories" icon={<i className="bi bi-grid"></i>} iconBgClass="icon-bg-4" />
      </InfoTileRow>

      <div className="card menu-section mb-4" data-aos="fade-up" data-aos-delay="200">
            <div className="card-header filter-bar">
               <span className="filter-label">Filtrer par catégorie:</span>
               <div className="filter-buttons">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      className={`btn-filter ${filterCategory === cat.id ? 'active' : ''}`}
                      onClick={() => setFilterCategory(cat.id)}
                    >
                      {cat.name}
                    </button>
                  ))}
               </div>
            </div>

            <div className="card-body p-0">
               <div className="menu-header">
                   <div>Image</div> <div>Dish Name</div> <div>Category</div>
                   <div>Price</div> <div>Status</div> <div>Last Updated</div>
                   <div className="text-end">Actions</div>
               </div>
               
               <div>
                   {loading && ( <div className="text-center p-5 text-muted">Chargement du menu...</div> )}
                   {!loading && !error && filteredDishes.length === 0 && ( <div className="text-center p-5 text-muted">Aucun plat trouvé.</div> )}
                   
                   {!loading && !error && filteredDishes.map(dish => (
                       <div key={dish.id_plat} className="menu-item">
                          <div className="dish-image">
                            {dish.image_url ? <img src={dish.image_url} alt={dish.nom} /> : <span className="image-placeholder">?</span>}
                          </div>
                          <div className="dish-info">
                            <div className="dish-name">{dish.nom}</div>
                            <small className="dish-description">{dish.description}</small>
                          </div>
                          <div className="dish-category">
                            <span className={`badge ${getCategoryBadgeClass(dish.categorie)}`}> {dish.categorie} </span>
                          </div>
                          <div className="dish-price">{formatAmount(dish.prix)}</div>
                          <div className="dish-status">
                            <label className="toggle-switch">
                              <input type="checkbox" checked={dish.statut === 'available'} onChange={() => handleStatusToggle(dish.id_plat)} />
                              <span className="slider"></span>
                            </label>
                          </div>
                          <div className="last-updated">
                            <span>{getTimeAgo(dish.updated_at)}</span>
                          </div>
                          <div className="dish-actions">
                            <button className="btn-icon" title="Modifier"> <i className="bi bi-pencil-fill"></i> </button>
                            <button className="btn-icon btn-icon-danger" title="Supprimer"> <i className="bi bi-trash-fill"></i> </button>
                          </div>
                       </div>
                   ))}
               </div>
            </div>
      </div>
    </div>
  );
};