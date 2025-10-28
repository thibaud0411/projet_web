// src/pages/employee/EmployeeMenuPage.tsx
import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import { formatAmount, getTimeAgo } from '../../components/utils/formatters';
import { InfoTile } from '../../components/shared/InfoTile';
import { InfoTileRow } from '../../components/shared/InfoTileRow';
import { PageHeader } from '../../components/shared/PageHeader';
import './EmployeeMenuPage.css';

// --- Interfaces et Données Fictives (inchangées) ---
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
const categories = [
  { id: 'all', name: 'All' },
  { id: 'meal', name: 'Meals' },
  { id: 'drink', name: 'Drinks' },
  { id: 'dessert', name: 'Desserts' },
];
const mockDishes: Dish[] = [
  {
    id_plat: 1,
    nom: 'Classic Burger',
    description: 'Beef patty, lettuce, tomato',
    categorie: 'meal',
    prix: 1000,
    statut: 'available',
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=50&h=50&fit=crop',
    updated_at: new Date(Date.now() - 2 * 60 * 60000).toISOString()
  },
  {
    id_plat: 2,
    nom: 'Caesar Salad',
    description: 'Romaine, parmesan, croutons',
    categorie: 'meal',
    prix: 1500,
    statut: 'available',
    image_url: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=50&h=50&fit=crop',
    updated_at: new Date(Date.now() - 5 * 60 * 60000).toISOString()
  },
    {
    id_plat: 3,
    nom: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with ice cream',
    categorie: 'dessert',
    prix: 2000,
    statut: 'available',
    image_url: 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?w=50&h=50&fit=crop',
    updated_at: new Date(Date.now() - 24 * 60 * 60000).toISOString()
  },
  {
    id_plat: 4,
    nom: 'Fresh Orange Juice',
    description: 'Freshly squeezed oranges',
    categorie: 'drink',
    prix: 500,
    statut: 'unavailable',
    image_url: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=50&h=50&fit=crop',
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60000).toISOString()
  }
];
// --- Fin Données Fictives ---

export const EmployeeMenuPage: React.FC = () => {
  const [dishes, setDishes] = useState<Dish[]>(mockDishes);
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    AOS.init({ duration: 800, once: true, offset: 50 });
  }, []);

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'meal': return 'badge-meal';
      case 'dessert': return 'badge-dessert';
      case 'drink': return 'badge-drink';
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

  const handleStatusToggle = (id: number) => {
    setDishes(prevDishes =>
      prevDishes.map(dish =>
        dish.id_plat === id
          ? { ...dish, statut: dish.statut === 'available' ? 'unavailable' : 'available' }
          : dish
      )
    );
  };

  return (
    <div>
      <PageHeader
        title="Menu Update and Management"
        subtitle="Manage your restaurant menu items, prices, and availability."
        actionButton={
          <button className="btn btn-primary">
            <i className="bi bi-plus-lg me-2"></i> Add New Dish
          </button>
        }
      />

      {/* --- MODIFIÉ : Ajout de "mb-4" pour l'espacement --- */}
      <InfoTileRow data-aos="fade-up" data-aos-delay="100" className="mb-4">
          <InfoTile
            value={<span>{totalDishes}</span>}
            label="Total Dishes"
            icon={<i className="bi bi-journal-text"></i>}
            iconBgClass="icon-bg-1"
          />
          <InfoTile
            value={<span className="text-success">{availableDishes}</span>}
            label="Available"
            icon={<i className="bi bi-check-circle"></i>}
            iconBgClass="icon-bg-2"
          />
          <InfoTile
            value={<span className="text-danger">{soldOutDishes}</span>}
            label="Sold Out"
            icon={<i className="bi bi-x-circle"></i>}
            iconBgClass="icon-bg-3"
          />
          <InfoTile
            value={<span>{totalCategories}</span>}
            label="Categories"
            icon={<i className="bi bi-grid"></i>}
            iconBgClass="icon-bg-4"
          />
      </InfoTileRow>

      {/* --- MODIFIÉ : Ajout de "mb-4" pour l'espacement --- */}
      <div className="card menu-section mb-4" data-aos="fade-up" data-aos-delay="200">
            
            <div className="card-header filter-bar">
               <span className="filter-label">Filter by category:</span>
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
                   <div>Image</div>
                   <div>Dish Name</div>
                   <div>Category</div>
                   <div>Price</div>
                   <div>Status</div>
                   <div>Last Updated</div>
                   <div className="text-end">Actions</div>
               </div>
               
               <div>
                   {filteredDishes.length === 0 && (
                     <div className="text-center p-5 text-muted">No dishes found.</div>
                   )}
                   
                   {filteredDishes.map(dish => (
                       <div key={dish.id_plat} className="menu-item">
                          
                          <div className="dish-image">
                            {dish.image_url ? 
                              <img src={dish.image_url} alt={dish.nom} /> : 
                              <span className="image-placeholder">?</span>
                            }
                          </div>
                          
                          <div className="dish-info">
                            <div className="dish-name">{dish.nom}</div>
                            <small className="dish-description">{dish.description}</small>
                          </div>
                          
                          <div className="dish-category">
                            <span className={`badge ${getCategoryBadgeClass(dish.categorie)}`}>
                              {dish.categorie}
                            </span>
                          </div>
                          
                          <div className="dish-price">{formatAmount(dish.prix)}</div>
                          
                          <div className="dish-status">
                            <label className="toggle-switch">
                              <input 
                                type="checkbox" 
                                checked={dish.statut === 'available'}
                                onChange={() => handleStatusToggle(dish.id_plat)}
                              />
                              <span className="slider"></span>
                            </label>
                          </div>
                          
                          <div className="last-updated">
                            <span>{getTimeAgo(dish.updated_at)}</span>
                          </div>

                          <div className="dish-actions">
                            <button className="btn-icon" title="Modifier">
                              <i className="bi bi-pencil-fill"></i>
                            </button>
                            <button className="btn-icon btn-icon-danger" title="Supprimer">
                              <i className="bi bi-trash-fill"></i>
                            </button>
                          </div>

                       </div>
                   ))}
               </div>
            </div>
      </div>
    </div>
  );
};