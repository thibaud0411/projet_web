import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'aos/dist/aos.css';
import AOS from 'aos';

// Components
import Header from './Header';
import Footer from './Footer';

// Styles
import '../styles/GlobalStyles.css';

const GestionMenu = () => {
  const [theme, setTheme] = useState('dark');
  const [dishes, setDishes] = useState([
    {
      id: 1,
      name: "Burger Classique",
      description: "Steak haché, laitue, tomate, oignon, sauce spéciale",
      category: "meal",
      price: 6500,
      status: "available",
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop",
      lastUpdated: new Date().toISOString()
    },
    {
      id: 2,
      name: "Salade César",
      description: "Laitue romaine, parmesan, croûtons, sauce césar",
      category: "meal",
      price: 4500,
      status: "available",
      image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=200&h=200&fit=crop",
      lastUpdated: new Date().toISOString()
    },
    {
      id: 3,
      name: "Fondant au Chocolat",
      description: "Gâteau au chocolat coulant avec glace vanille",
      category: "dessert",
      price: 3500,
      status: "unavailable",
      image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=200&h=200&fit=crop",
      lastUpdated: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 4,
      name: "Jus d'Orange Frais",
      description: "Oranges pressées fraîchement",
      category: "drink",
      price: 2000,
      status: "available",
      image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=200&h=200&fit=crop",
      lastUpdated: new Date().toISOString()
    },
    {
      id: 5,
      name: "Pizza Margherita",
      description: "Tomate, mozzarella, basilic frais",
      category: "meal",
      price: 8000,
      status: "available",
      image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=200&h=200&fit=crop",
      lastUpdated: new Date().toISOString()
    },
    {
      id: 6,
      name: "Tiramisu Maison",
      description: "Dessert italien au café et mascarpone",
      category: "dessert",
      price: 4000,
      status: "available",
      image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=200&h=200&fit=crop",
      lastUpdated: new Date().toISOString()
    }
  ]);

  const [currentEditingId, setCurrentEditingId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    status: true,
    image: null
  });

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100
    });

    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  // Fonctions utilitaires
  const getCategoryText = (category) => {
    const categories = {
      meal: 'Plat principal',
      dessert: 'Dessert',
      drink: 'Boisson'
    };
    return categories[category] || category;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      meal: 'hamburger',
      dessert: 'birthday-cake',
      drink: 'glass-whiskey'
    };
    return icons[category] || 'utensils';
  };

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays === 1) return 'Il y a 1 jour';
    return `Il y a ${diffDays} jours`;
  };

  // Gestion des plats
  const openAddModal = () => {
    setCurrentEditingId(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      price: '',
      status: true,
      image: null
    });
    setShowModal(true);
  };

  const editDish = (id) => {
    const dish = dishes.find(d => d.id === id);
    if (dish) {
      setCurrentEditingId(id);
      setFormData({
        name: dish.name,
        description: dish.description,
        category: dish.category,
        price: dish.price.toString(),
        status: dish.status === 'available',
        image: dish.image
      });
      setShowModal(true);
    }
  };

  const saveDish = () => {
    if (!formData.name || !formData.category || !formData.price) {
      showNotification('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    const dishData = {
      id: currentEditingId || Date.now(),
      name: formData.name,
      description: formData.description,
      category: formData.category,
      price: parseInt(formData.price),
      status: formData.status ? 'available' : 'unavailable',
      lastUpdated: new Date().toISOString(),
      image: formData.image
    };

    if (currentEditingId) {
      // Modification
      setDishes(prevDishes => 
        prevDishes.map(dish => 
          dish.id === currentEditingId ? { ...dish, ...dishData } : dish
        )
      );
      showNotification('Plat modifié avec succès', 'success');
    } else {
      // Ajout
      setDishes(prevDishes => [...prevDishes, dishData]);
      showNotification('Plat ajouté avec succès', 'success');
    }

    setShowModal(false);
  };

  const toggleDishStatus = (id) => {
    setDishes(prevDishes => 
      prevDishes.map(dish => 
        dish.id === id 
          ? { 
              ...dish, 
              status: dish.status === 'available' ? 'unavailable' : 'available',
              lastUpdated: new Date().toISOString()
            } 
          : dish
      )
    );
    
    const dish = dishes.find(d => d.id === id);
    showNotification(`Statut de "${dish.name}" modifié`, 'info');
  };

  const deleteDish = (id) => {
    const dish = dishes.find(d => d.id === id);
    if (dish && window.confirm(`Êtes-vous sûr de vouloir supprimer "${dish.name}" ?`)) {
      setDishes(prevDishes => prevDishes.filter(d => d.id !== id));
      showNotification('Plat supprimé avec succès', 'success');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showNotification('L\'image est trop volumineuse (max 2MB)', 'error');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, image: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Filtrage
  const filteredDishes = filterCategory === 'all' 
    ? dishes 
    : dishes.filter(dish => dish.category === filterCategory);

  // Statistiques
  const totalDishes = dishes.length;
  const availableDishes = dishes.filter(d => d.status === 'available').length;
  const unavailableDishes = totalDishes - availableDishes;
  const categories = [...new Set(dishes.map(d => d.category))].length;

  // Notification
  const showNotification = (message, type = 'info') => {
    // Implémentation simple des notifications
    console.log(`${type.toUpperCase()}: ${message}`);
    // Vous pouvez utiliser un système de notifications plus avancé ici
  };

  return (
    <div className="App">
      <Header theme={theme} toggleTheme={toggleTheme} activePage="gestion" />
      
      {/* Section principale */}
      <main className="main-content">
        <div className="container">
          {/* En-tête de la page */}
          <div className="mb-4" data-aos="fade-up">
            <h1 className="page-title">Mise à jour et Gestion du Menu</h1>
            <p className="page-subtitle">Gérez les plats de votre restaurant, les prix et la disponibilité</p>
          </div>

          {/* Bouton d'action */}
          <div className="header-actions" data-aos="fade-up" data-aos-delay="100">
            <button className="btn btn-primary" onClick={openAddModal}>
              <i className="fas fa-plus"></i> Ajouter un Plat
            </button>
          </div>

          {/* Statistiques */}
          <div className="stats-grid" data-aos="fade-up" data-aos-delay="200">
            <div className="stat-card">
              <div className="stat-number">{totalDishes}</div>
              <div className="stat-label">Plats Totaux</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{availableDishes}</div>
              <div className="stat-label">Disponibles</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{unavailableDishes}</div>
              <div className="stat-label">Épuisés</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{categories}</div>
              <div className="stat-label">Catégories</div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="content-grid">
            {/* Filtres */}
            <div className="filters-section" data-aos="fade-right" data-aos-delay="300">
              <h3 className="section-title">Filtrer par catégorie</h3>
              <ul className="category-list">
                <li 
                  className={`category-item ${filterCategory === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterCategory('all')}
                >
                  Tous les plats
                </li>
                <li 
                  className={`category-item ${filterCategory === 'meal' ? 'active' : ''}`}
                  onClick={() => setFilterCategory('meal')}
                >
                  Plats principaux
                </li>
                <li 
                  className={`category-item ${filterCategory === 'dessert' ? 'active' : ''}`}
                  onClick={() => setFilterCategory('dessert')}
                >
                  Desserts
                </li>
                <li 
                  className={`category-item ${filterCategory === 'drink' ? 'active' : ''}`}
                  onClick={() => setFilterCategory('drink')}
                >
                  Boissons
                </li>
              </ul>
            </div>

            {/* Section menu */}
            <div className="menu-section" data-aos="fade-left" data-aos-delay="400">
              <div className="menu-header">
                <div>Image</div>
                <div>Nom du Plat</div>
                <div>Catégorie</div>
                <div>Prix</div>
                <div>Statut</div>
                <div>Dernière MAJ</div>
                <div>Actions</div>
              </div>
              <div id="dishes-container">
                {filteredDishes.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-utensils fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">Aucun plat trouvé</h5>
                    <p className="text-muted">Aucun plat ne correspond aux critères sélectionnés.</p>
                  </div>
                ) : (
                  filteredDishes.map(dish => (
                    <div key={dish.id} className="menu-item fade-in">
                      <div className="dish-image">
                        {dish.image ? (
                          <img src={dish.image} alt={dish.name} className="rounded" />
                        ) : (
                          <i className={`fas fa-${getCategoryIcon(dish.category)}`}></i>
                        )}
                      </div>
                      <div className="dish-info">
                        <div className="dish-name">{dish.name}</div>
                        <div className="dish-description">{dish.description}</div>
                      </div>
                      <div>
                        <span className={`dish-category category-${dish.category}`}>
                          {getCategoryText(dish.category)}
                        </span>
                      </div>
                      <div className="dish-price currency-xaf">
                        {formatPrice(dish.price)}
                      </div>
                      <div>
                        <span className={`status-badge status-${dish.status}`}>
                          {dish.status === 'available' ? 'Disponible' : 'Épuisé'}
                        </span>
                      </div>
                      <div className="last-updated">
                        {getTimeAgo(dish.lastUpdated)}
                      </div>
                      <div className="actions">
                        <button 
                          className="btn-action btn-edit" 
                          title="Modifier" 
                          onClick={() => editDish(dish.id)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          className="btn-action btn-toggle" 
                          title="Basculer le statut" 
                          onClick={() => toggleDishStatus(dish.id)}
                        >
                          <i className="fas fa-power-off"></i>
                        </button>
                        <button 
                          className="btn-action btn-delete" 
                          title="Supprimer" 
                          onClick={() => deleteDish(dish.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal pour ajouter/modifier un plat */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {currentEditingId ? 'Modifier le Plat' : 'Ajouter un Nouveau Plat'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Nom du plat *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Description</label>
                      <textarea 
                        className="form-control" 
                        rows="3" 
                        placeholder="Décrivez brièvement le plat..."
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                      ></textarea>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Catégorie *</label>
                      <select 
                        className="form-select" 
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({...prev, category: e.target.value}))}
                        required
                      >
                        <option value="">Choisir une catégorie</option>
                        <option value="meal">Plat principal</option>
                        <option value="dessert">Dessert</option>
                        <option value="drink">Boisson</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Prix (XAF) *</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        min="0" 
                        required 
                        placeholder="5000"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({...prev, price: e.target.value}))}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Image du plat</label>
                      <input 
                        type="file" 
                        className="form-control" 
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      <div className="image-preview mt-2">
                        {formData.image ? (
                          <img src={formData.image} alt="Preview" className="rounded" />
                        ) : (
                          <i className="fas fa-utensils fa-3x text-muted"></i>
                        )}
                      </div>
                      <small className="text-muted">Format recommandé: JPG, PNG (max 2MB)</small>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Statut</label>
                      <div className="form-check form-switch">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          checked={formData.status}
                          onChange={(e) => setFormData(prev => ({...prev, status: e.target.checked}))}
                          style={{transform: 'scale(1.2)'}}
                        />
                        <label className="form-check-label">
                          Disponible
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={saveDish}
                >
                  <i className="fas fa-save"></i> Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default GestionMenu;