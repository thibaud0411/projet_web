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

const Commandes = () => {
  const [theme, setTheme] = useState('dark');
  const [orders, setOrders] = useState([
    {
      id: 'CMD-001',
      number: 'CMD-001',
      customer: 'Jean Dupont',
      phone: '+242 06 655 04 30',
      date: new Date().toISOString().split('T')[0],
      time: '12:30',
      status: 'pending',
      items: [
        { 
          name: 'Poulet Rôti aux Herbes', 
          price: 6500, 
          quantity: 1, 
          image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=120&h=120&fit=crop'
        },
        { 
          name: 'Tiramisu Maison', 
          price: 3500, 
          quantity: 1, 
          image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=120&h=120&fit=crop'
        }
      ],
      total: 10000
    },
    {
      id: 'CMD-002',
      number: 'CMD-002',
      customer: 'Marie Martin',
      phone: '+242 06 655 04 31',
      date: new Date().toISOString().split('T')[0],
      time: '12:15',
      status: 'preparing',
      items: [
        { 
          name: 'Salade César Gourmande', 
          price: 4500, 
          quantity: 1, 
          image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=120&h=120&fit=crop'
        },
        { 
          name: 'Pâtes Carbonara Crémeuses', 
          price: 5500, 
          quantity: 1, 
          image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=120&h=120&fit=crop'
        }
      ],
      total: 10000
    },
    {
      id: 'CMD-003',
      number: 'CMD-003',
      customer: 'Pierre Leroy',
      phone: '+242 06 655 04 32',
      date: new Date().toISOString().split('T')[0],
      time: '11:45',
      status: 'ready',
      items: [
        { 
          name: 'Poulet Rôti aux Herbes', 
          price: 6500, 
          quantity: 2, 
          image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=120&h=120&fit=crop'
        }
      ],
      total: 13000
    },
    {
      id: 'CMD-004',
      number: 'CMD-004',
      customer: 'Sophie Bernard',
      phone: '+242 06 655 04 33',
      date: new Date().toISOString().split('T')[0],
      time: '13:20',
      status: 'delivered',
      items: [
        { 
          name: 'Burger Gourmet', 
          price: 7500, 
          quantity: 1, 
          image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=120&h=120&fit=crop'
        },
        { 
          name: 'Frites Maison', 
          price: 2000, 
          quantity: 1, 
          image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=120&h=120&fit=crop'
        }
      ],
      total: 9500
    },
    {
      id: 'CMD-005',
      number: 'CMD-005',
      customer: 'David Nkounkou',
      phone: '+242 06 655 04 34',
      date: new Date().toISOString().split('T')[0],
      time: '14:00',
      status: 'pending',
      items: [
        { 
          name: 'Pizza Margherita', 
          price: 8000, 
          quantity: 1, 
          image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=120&h=120&fit=crop'
        },
        { 
          name: 'Jus d\'Orange Frais', 
          price: 1500, 
          quantity: 2, 
          image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=120&h=120&fit=crop'
        }
      ],
      total: 11000
    }
  ]);

  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    date: '',
    time: 'all',
    search: ''
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100
    });

    document.body.setAttribute('data-theme', theme);
    applyFilters();
  }, [theme, filters, orders]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  const applyFilters = () => {
    let tempOrders = [...orders];
    
    // Filtre par statut
    if (filters.status !== 'all') {
      tempOrders = tempOrders.filter(order => order.status === filters.status);
    }
    
    // Filtre par date
    if (filters.date) {
      tempOrders = tempOrders.filter(order => order.date === filters.date);
    }
    
    // Filtre par recherche
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      tempOrders = tempOrders.filter(order => 
        order.customer.toLowerCase().includes(searchTerm) ||
        order.number.toLowerCase().includes(searchTerm) ||
        order.phone.includes(searchTerm)
      );
    }
    
    setFilteredOrders(tempOrders);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      date: '',
      time: 'all',
      search: ''
    });
    showToast('Filtres réinitialisés', 'success');
  };

  const handleOrderAction = (orderId, action) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const actions = {
      'start': () => updateOrderStatus(orderId, 'preparing'),
      'ready': () => updateOrderStatus(orderId, 'ready'),
      'deliver': () => updateOrderStatus(orderId, 'delivered'),
      'cancel': () => updateOrderStatus(orderId, 'cancelled'),
      'delay': () => delayOrder(orderId),
      'notify': () => notifyCustomer(orderId)
    };

    if (actions[action]) {
      actions[action]();
    }
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prevOrders => 
      prevOrders.map(order => {
        if (order.id === orderId) {
          const oldStatus = order.status;
          showToast(`Statut de ${order.number} mis à jour: ${getStatusText(oldStatus)} → ${getStatusText(newStatus)}`, 'success');
          return { ...order, status: newStatus };
        }
        return order;
      })
    );
  };

  const delayOrder = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      showToast(`Délai ajouté pour ${order.number} (+15 minutes)`, 'warning');
    }
  };

  const notifyCustomer = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      showToast(`Notification envoyée à ${order.customer}`, 'info');
    }
  };

  const refreshOrders = () => {
    setIsRefreshing(true);
    
    // Simuler un chargement
    setTimeout(() => {
      // Ajouter une nouvelle commande aléatoire (simulation)
      if (Math.random() > 0.5) {
        const newOrder = {
          id: `CMD-${String(orders.length + 1).padStart(3, '0')}`,
          number: `CMD-${String(orders.length + 1).padStart(3, '0')}`,
          customer: 'Nouveau Client',
          phone: '+242 06 655 04 99',
          date: new Date().toISOString().split('T')[0],
          time: '15:30',
          status: 'pending',
          items: [
            { 
              name: 'Plat du Jour', 
              price: 5000, 
              quantity: 1, 
              image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&h=120&fit=crop'
            }
          ],
          total: 5000
        };
        
        setOrders(prev => [newOrder, ...prev]);
        showToast('Nouvelle commande reçue !', 'info');
      } else {
        showToast('Liste des commandes actualisée', 'info');
      }
      
      setIsRefreshing(false);
    }, 1000);
  };

  const exportOrders = () => {
    const data = JSON.stringify(filteredOrders, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commandes-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Export des commandes téléchargé', 'success');
  };

  // Utilitaires
  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'En attente',
      'preparing': 'En préparation',
      'ready': 'Prête',
      'delivered': 'Livrée',
      'cancelled': 'Annulée'
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const getActionButtons = (order) => {
    const buttons = {
      'pending': (
        <>
          <button 
            className="btn-status btn-start" 
            onClick={() => handleOrderAction(order.id, 'start')}
          >
            <i className="fas fa-play"></i> Démarrer
          </button>
          <button 
            className="btn-status btn-cancel" 
            onClick={() => handleOrderAction(order.id, 'cancel')}
          >
            <i className="fas fa-times"></i> Annuler
          </button>
        </>
      ),
      'preparing': (
        <>
          <button 
            className="btn-status btn-ready" 
            onClick={() => handleOrderAction(order.id, 'ready')}
          >
            <i className="fas fa-check"></i> Prête
          </button>
          <button 
            className="btn-status btn-delay" 
            onClick={() => handleOrderAction(order.id, 'delay')}
          >
            <i className="fas fa-clock"></i> Retarder
          </button>
        </>
      ),
      'ready': (
        <>
          <button 
            className="btn-status btn-deliver" 
            onClick={() => handleOrderAction(order.id, 'deliver')}
          >
            <i className="fas fa-truck"></i> Livrer
          </button>
          <button 
            className="btn-status btn-notify" 
            onClick={() => handleOrderAction(order.id, 'notify')}
          >
            <i className="fas fa-bell"></i> Notifier
          </button>
        </>
      ),
      'delivered': (
        <span className="text-muted small">
          <i className="fas fa-check-circle me-1"></i>Commande livrée
        </span>
      ),
      'cancelled': (
        <span className="text-muted small">
          <i className="fas fa-times-circle me-1"></i>Commande annulée
        </span>
      )
    };

    return buttons[order.status] || '';
  };

  const showToast = (message, type = 'info') => {
    // Implémentation simple des notifications
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  // Calcul des statistiques
  const totalOrders = filteredOrders.length;
  const pendingOrders = filteredOrders.filter(o => o.status === 'pending').length;
  const preparingOrders = filteredOrders.filter(o => o.status === 'preparing').length;
  const readyOrders = filteredOrders.filter(o => o.status === 'ready').length;

  return (
    <div className="App">
      <Header theme={theme} toggleTheme={toggleTheme} activePage="commandes" />
      
      {/* Section principale */}
      <main className="main-content">
        <div className="container py-5">
          {/* En-tête de la page */}
          <div className="row mb-4" data-aos="fade-up">
            <div className="col">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h1 className="page-title">Gestion des Commandes</h1>
                  <p className="text-muted">Suivez et gérez toutes les commandes en temps réel</p>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-outline-secondary" onClick={exportOrders}>
                    <i className="fas fa-download"></i>
                    Exporter
                  </button>
                  <button 
                    className="btn btn-orange" 
                    onClick={refreshOrders}
                    disabled={isRefreshing}
                  >
                    {isRefreshing ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fas fa-sync-alt"></i>
                    )}
                    {isRefreshing ? ' Chargement...' : ' Actualiser'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="row mb-4" data-aos="fade-up" data-aos-delay="100">
            <div className="col-md-3 mb-3">
              <div className="stats-card">
                <div className="stats-number">{totalOrders}</div>
                <div className="stats-label">Commandes totales</div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="stats-card">
                <div className="stats-number">{pendingOrders}</div>
                <div className="stats-label">En attente</div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="stats-card">
                <div className="stats-number">{preparingOrders}</div>
                <div className="stats-label">En préparation</div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="stats-card">
                <div className="stats-number">{readyOrders}</div>
                <div className="stats-label">Prêtes</div>
              </div>
            </div>
          </div>

          {/* Filtres */}
          <div className="filters-section mb-4" data-aos="fade-up" data-aos-delay="200">
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Statut</label>
                <select 
                  className="form-select" 
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="preparing">En préparation</option>
                  <option value="ready">Prête</option>
                  <option value="delivered">Livrée</option>
                  <option value="cancelled">Annulée</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Date</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={filters.date}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Heure</label>
                <select 
                  className="form-select" 
                  value={filters.time}
                  onChange={(e) => handleFilterChange('time', e.target.value)}
                >
                  <option value="all">Toute la journée</option>
                  <option value="morning">Matin (8h-12h)</option>
                  <option value="afternoon">Après-midi (12h-18h)</option>
                  <option value="evening">Soir (18h-22h)</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Recherche</label>
                <div className="input-group">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Nom client, numéro commande..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                  <button className="btn btn-outline-secondary" type="button">
                    <i className="fas fa-search"></i>
                  </button>
                </div>
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-12">
                <button className="btn btn-sm btn-outline-secondary" onClick={clearFilters}>
                  <i className="fas fa-times"></i> Effacer tous les filtres
                </button>
              </div>
            </div>
          </div>

          {/* Liste des commandes */}
          <div className="row" data-aos="fade-up" data-aos-delay="300">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>Liste des Commandes</h3>
                <span className="text-muted">{totalOrders} commande(s)</span>
              </div>
              
              {filteredOrders.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                  <h5>Aucune commande trouvée</h5>
                  <p className="text-muted">Aucune commande ne correspond aux critères sélectionnés.</p>
                  <button className="btn btn-orange" onClick={clearFilters}>
                    <i className="fas fa-refresh"></i>
                    Réinitialiser les filtres
                  </button>
                </div>
              ) : (
                <div id="ordersContainer">
                  {filteredOrders.map(order => (
                    <div key={order.id} className="order-card fade-in" data-aos="fade-up">
                      <div className="order-header">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h5 className="mb-0">Commande {order.number}</h5>
                            <small>{formatDate(order.date)} - {order.time}</small>
                          </div>
                          <span className={`order-status status-${order.status}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="order-items">
                        <div className="customer-info">
                          <div className="row">
                            <div className="col-md-6">
                              <strong><i className="fas fa-user me-2"></i>Client:</strong> {order.customer}
                            </div>
                            <div className="col-md-6">
                              <strong><i className="fas fa-phone me-2"></i>Téléphone:</strong> {order.phone}
                            </div>
                          </div>
                        </div>
                        
                        {order.items.map((item, index) => (
                          <div key={index} className="order-item">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="item-image" 
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/60x60/2d2d2d/cfbd97?text=🍽️';
                              }}
                            />
                            <div className="item-details">
                              <div className="item-name">{item.name}</div>
                              <div className="text-muted small">Quantité: {item.quantity}</div>
                            </div>
                            <div className="item-price currency-xaf">{formatPrice(item.price)}</div>
                            <div className="quantity-badge">x{item.quantity}</div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="order-total">
                        <div className="d-flex justify-content-between align-items-center">
                          <span>
                            <i className="fas fa-receipt me-2"></i>
                            Total: <span className="currency-xaf">{formatPrice(order.total)}</span>
                          </span>
                          <div className="action-buttons">
                            {getActionButtons(order)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Commandes;