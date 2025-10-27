// src/pages/employee/EmployeeMenuPage.tsx
import React, { useState, useEffect } from 'react';
import AOS from 'aos';
// import apiClient from '../../api/apiClient'; // API non requise
import { formatAmount, getTimeAgo } from '../../components/utils/formatters';
import { InfoTile } from '../../components/shared/InfoTile';
import { InfoTileRow } from '../../components/shared/InfoTileRow';

// Importer le CSS spécifique
import './EmployeeMenuPage.css';

// --- Interfaces ---
interface Dish {
  id_plat: number;
  nom: string;
  description: string | null;
  categorie: 'meal' | 'dessert' | 'drink' | string;
  prix: number;
  statut: 'available' | 'unavailable';
  image_url: string | null;
  updated_at: string;
}

// Catégories pour le filtre
const categories = [
  { id: 'all', name: 'Tous les plats', icon: 'bi-grid-fill' },
  { id: 'meal', name: 'Plats', icon: 'bi-egg-fried' },
  { id: 'drink', name: 'Boissons', icon: 'bi-cup-straw' },
  { id: 'dessert', name: 'Desserts', icon: 'bi-cake2' },
];

// --- Données Fictives ---
const mockDishes: Dish[] = [
  {
    id_plat: 1,
    nom: 'Pizza Margherita',
    description: 'Sauce tomate, mozzarella, basilic frais.',
    categorie: 'meal',
    prix: 5500,
    statut: 'available',
    image_url: 'https://via.placeholder.com/150/CFBD97/000000?text=Pizza',
    updated_at: new Date().toISOString()
  },
  {
    id_plat: 2,
    nom: 'Burger Classique',
    description: 'Steak haché, cheddar, laitue, tomate, oignons.',
    categorie: 'meal',
    prix: 4500,
    statut: 'available',
    image_url: 'https://via.placeholder.com/150/CFBD97/000000?text=Burger',
    updated_at: new Date().toISOString()
  },
    {
    id_plat: 3,
    nom: 'Fondant au Chocolat',
    description: 'Cœur coulant, servi avec une boule de glace vanille.',
    categorie: 'dessert',
    prix: 3000,
    statut: 'unavailable',
    image_url: 'https://via.placeholder.com/150/CFBD97/000000?text=Dessert',
    updated_at: new Date(Date.now() - 2 * 60 * 60000).toISOString()
  },
  {
    id_plat: 4,
    nom: 'Jus de Bissap',
    description: 'Jus de fleur d\'hibiscus rafraîchissant.',
    categorie: 'drink',
    prix: 1500,
    statut: 'available',
    image_url: 'https://via.placeholder.com/150/CFBD97/000000?text=Jus',
    updated_at: new Date(Date.now() - 1 * 60 * 60000).toISOString()
  }
];
// --- Fin Données Fictives ---

// --- Composant Principal (style maquette) ---
export const EmployeeMenuPage: React.FC = () => {
  const [dishes, setDishes] = useState<Dish[]>(mockDishes); // Utilise les mocks
  const [loading, setLoading] = useState(false); // Mis à false
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');

  // --- Chargement Initial ---
  useEffect(() => {
    AOS.init({ duration: 800, once: true, offset: 100 });
    // fetchDishes(); // Appel API désactivé
  }, []);

  /*
  // Logique de fetch (mise en commentaire)
  const fetchDishes = async () => { ... };
  */

  // --- Fonctions Utilitaires (Affichage) ---
  const getCategoryText = (category: string) => {
    return categories.find(c => c.id === category)?.name || 'Autre';
  };
  
  const getCategoryIcon = (category: string) => {
     return categories.find(c => c.id === category)?.icon || 'bi-question-lg';
  };

  // Filtrage
  const filteredDishes = filterCategory === 'all'
    ? dishes
    : dishes.filter(dish => dish.categorie === filterCategory);

  // Calculs pour les vignettes (style maquette)
  const totalDishes = dishes.length;
  const availableDishes = dishes.filter(d => d.statut === 'available').length;
  const soldOutDishes = dishes.filter(d => d.statut === 'unavailable').length;
  const totalCategories = categories.filter(c => c.id !== 'all').length; // Exclut 'Tous'

  return (
    <div>
      {/* En-tête de la page (style maquette) */}
      <div className="d-flex justify-content-between align-items-center mb-4" data-aos="fade-up">
        <div>
          <h1 className="h2 page-title mb-1">Menu Update and Management</h1>
          <p className="page-subtitle text-muted">Manage your restaurant menu, prices, and availability.</p>
        </div>
        {/* Bouton de la maquette (Note: c'est pour un employé, la fonctionnalité d'ajout peut être réservée au manager) */}
        <button className="btn btn-dark">
            <i className="bi bi-plus-lg me-2"></i> Add New Dish
        </button>
      </div>

      {error && <div className={`alert alert-danger alert-dismissible fade show`} role="alert"> {error} <button type="button" className="btn-close" onClick={() => setError(null)}></button> </div>}

      {/* Vignettes d'information (style maquette) */}
      <InfoTileRow data-aos="fade-up" data-aos-delay="100">
          <InfoTile
            value={<span>{totalDishes}</span>}
            label="Total Dishes"
          />
          <InfoTile
            value={<span className="text-success">{availableDishes}</span>}
            label="Available"
          />
          <InfoTile
            value={<span className="text-danger">{soldOutDishes}</span>}
            label="Sold Out"
          />
          <InfoTile
            value={<span>{totalCategories}</span>}
            label="Categories"
          />
      </InfoTileRow>

      {/* Section menu (Tableau dans une seule carte) */}
      <div className="card menu-section" data-aos="fade-up" data-aos-delay="200">
            
            {/* Filtres (style maquette - en haut du tableau) */}
            <div className="card-header d-flex flex-wrap justify-content-between align-items-center">
               <h5 className="card-title mb-0 me-3">Filter by category:</h5>
               <div className="filter-buttons">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      // Utilise btn-dark pour le filtre actif (comme le bouton 'Add') et btn-outline-secondary pour les autres
                      className={`btn btn-sm ${filterCategory === cat.id ? 'btn-dark' : 'btn-outline-secondary'} ms-1 mt-1 mb-1`}
                      onClick={() => setFilterCategory(cat.id)}
                    >
                      {/* Renomme 'Tous les plats' en 'All' pour coller à la maquette */}
                      {cat.id === 'all' ? 'All' : cat.name}
                    </button>
                  ))}
               </div>
            </div>

            {/* Tableau */}
            <div className="card-body p-0">
               {/* En-tête du tableau */}
               <div className="menu-header d-none d-lg-grid">
                   <div>Image</div>
                   <div>Nom du Plat</div>
                   <div>Catégorie</div>
                   <div>Prix</div>
                   <div>Statut</div>
                   <div className="text-end">Dernière MAJ</div>
               </div>
               
               {/* Liste des plats */}
               <div>
                   {loading && <div className="text-center p-5 text-muted">Chargement...</div>}
                   {!loading && filteredDishes.length === 0 && (
                     <div className="text-center p-5 text-muted">Aucun plat trouvé pour cette catégorie.</div>
                   )}
                   
                   {!loading && filteredDishes.map(dish => (
                       <div key={dish.id_plat} className="menu-item">
                          <div className="dish-image">
                            {dish.image_url ? 
                              <img src={dish.image_url} alt={dish.nom} /> : 
                              <span className="image-placeholder"><i className={`bi ${getCategoryIcon(dish.categorie)}`}></i></span>
                            }
                          </div>
                          <div className="dish-info">
                            <div className="fw-bold">{dish.nom}</div>
                            <small className="text-muted d-block d-lg-none">{dish.description}</small>
                          </div>
                          <div className="dish-category">
                            <i className={`bi ${getCategoryIcon(dish.categorie)} me-2 d-none d-lg-inline`}></i>
                            {getCategoryText(dish.categorie)}
                          </div>
                          <div className="dish-price fw-bold">{formatAmount(dish.prix)}</div>
                          <div className="dish-status">
                            {/* Note: La maquette a un interrupteur. Nous gardons votre badge de statut. */}
                            <span className={`status-badge status-${dish.statut === 'available' ? 'success' : 'secondary'}`}>
                              {dish.statut === 'available' ? 'Disponible' : 'Épuisé'}
                            </span>
                          </div>
                          <div className="last-updated text-end">
                            <span className="text-muted small">{getTimeAgo(dish.updated_at)}</span>
                          </div>
                       </div>
                   ))}
               </div>
            </div>
      </div>
    </div>
  );
};