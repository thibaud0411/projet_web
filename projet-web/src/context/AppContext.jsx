// src/context/AppContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';

// État initial
const initialState = {
  theme: 'dark',
  statsData: {
    orders: {
      labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      datasets: [{
        label: 'Commandes',
        data: [180, 210, 190, 230, 250, 200, 180],
        backgroundColor: '#cfbd97',
        borderColor: '#b8a885',
        borderWidth: 2,
        tension: 0.4,
        fill: false
      }]
    },
    delivery: {
      labels: ['Livraison', 'Sur Place', 'À emporter'],
      datasets: [{
        data: [33, 52, 15],
        backgroundColor: ['#cfbd97', '#b8a885', '#a39473'],
        borderWidth: 0
      }]
    },
    products: {
      labels: ['Pizza', 'Burger', 'Pâtes', 'Salade', 'Dessert'],
      datasets: [{
        label: 'Ventes',
        data: [45, 30, 25, 20, 15],
        backgroundColor: [
          '#cfbd97',
          '#b8a885',
          '#a39473',
          '#8e8061',
          '#796c4f'
        ],
        borderWidth: 0
      }]
    },
    satisfaction: {
      labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      datasets: [{
        label: 'Satisfaction (%)',
        data: [92, 94, 93, 95, 96, 94, 95],
        backgroundColor: 'rgba(207, 189, 151, 0.2)',
        borderColor: '#cfbd97',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    },
    revenue: {
      labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      datasets: [{
        label: 'Revenus (k XAF)',
        data: [120, 140, 130, 160, 180, 150, 130],
        backgroundColor: 'rgba(207, 189, 151, 0.3)',
        borderColor: '#cfbd97',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    },
    hours: {
      labels: ['8h', '10h', '12h', '14h', '16h', '18h', '20h', '22h'],
      datasets: [{
        label: 'Commandes',
        data: [15, 45, 120, 85, 65, 95, 70, 25],
        backgroundColor: 'rgba(207, 189, 151, 0.6)',
        borderColor: '#cfbd97',
        borderWidth: 2
      }]
    }
  },
  claimsData: [
    {
      id: 1,
      student: "North Dubai",
      order: "#COR-2024-H5",
      subject: "Commande du mois d'écriture",
      description: "La commande reçue ne correspond pas à ce qui a été commandé. Plusieurs articles manquent et la qualité des produits n'est pas à la hauteur des attentes.",
      priority: "high",
      status: "pending",
      date: "2024-01-15",
      responses: [
        { sender: "North Dubai", message: "Ma commande n'est pas complète et la qualité est médiocre.", time: "2024-01-15 14:30" },
        { sender: "Support", message: "Nous sommes désolés pour ce désagrément. Notre équipe examine votre réclamation.", time: "2024-01-15 15:45" }
      ]
    },
    {
      id: 2,
      student: "Juven Martin",
      order: "#COR-2024-H5",
      subject: "Problème de qualité de nourriture",
      description: "La nourriture était froide et le goût n'était pas bon. Je demande un remboursement.",
      priority: "medium",
      status: "resolved",
      date: "2024-01-14",
      responses: [
        { sender: "Juven Martin", message: "La nourriture était froide et immangeable.", time: "2024-01-14 10:15" },
        { sender: "Support", message: "Nous vous offrons un bon de réduction pour votre prochaine commande.", time: "2024-01-14 11:30" }
      ]
    }
  ],
  dishes: [
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
    }
  ],
  orders: [
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
        }
      ],
      total: 4500
    }
  ]
};

// Actions
const actionTypes = {
  SET_THEME: 'SET_THEME',
  UPDATE_STATS: 'UPDATE_STATS',
  UPDATE_CLAIMS: 'UPDATE_CLAIMS',
  UPDATE_DISHES: 'UPDATE_DISHES',
  UPDATE_ORDERS: 'UPDATE_ORDERS',
  ADD_CLAIM: 'ADD_CLAIM',
  ADD_ORDER: 'ADD_ORDER',
  UPDATE_DISH: 'UPDATE_DISH',
  UPDATE_ORDER_STATUS: 'UPDATE_ORDER_STATUS',
  LOAD_STATE: 'LOAD_STATE'
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_THEME:
      return {
        ...state,
        theme: action.payload
      };
    
    case actionTypes.UPDATE_STATS:
      return {
        ...state,
        statsData: {
          ...state.statsData,
          ...action.payload
        }
      };
    
    case actionTypes.UPDATE_CLAIMS:
      return {
        ...state,
        claimsData: action.payload
      };
    
    case actionTypes.ADD_CLAIM:
      return {
        ...state,
        claimsData: [action.payload, ...state.claimsData]
      };
    
    case actionTypes.ADD_ORDER:
      return {
        ...state,
        orders: [action.payload, ...state.orders]
      };
    
    case actionTypes.UPDATE_DISH:
      return {
        ...state,
        dishes: state.dishes.map(dish => 
          dish.id === action.payload.id ? action.payload : dish
        )
      };
    
    case actionTypes.UPDATE_ORDER_STATUS:
      return {
        ...state,
        orders: state.orders.map(order => 
          order.id === action.payload.orderId 
            ? { ...order, status: action.payload.newStatus }
            : order
        )
      };
    
    case actionTypes.UPDATE_DISHES:
      return {
        ...state,
        dishes: action.payload
      };

    case actionTypes.UPDATE_ORDERS:
      return {
        ...state,
        orders: action.payload
      };

    case actionTypes.LOAD_STATE:
      return {
        ...state,
        ...action.payload
      };
    
    default:
      return state;
  }
};

// Création du Context
const AppContext = createContext();

// Provider
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // CHARGER TOUT L'ÉTAT DEPUIS LE LOCALSTORAGE AU DÉMARRAGE
  useEffect(() => {
    const savedState = localStorage.getItem('app-state');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        dispatch({ type: actionTypes.LOAD_STATE, payload: parsedState });
        
        // Appliquer le thème au body
        if (parsedState.theme) {
          document.body.setAttribute('data-theme', parsedState.theme);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'état:', error);
      }
    }
  }, []);

  // SAUVEGARDER TOUT L'ÉTAT DANS LE LOCALSTORAGE À CHAQUE CHANGEMENT
  useEffect(() => {
    const stateToSave = {
      theme: state.theme,
      statsData: state.statsData,
      claimsData: state.claimsData,
      dishes: state.dishes,
      orders: state.orders
    };
    localStorage.setItem('app-state', JSON.stringify(stateToSave));
    
    // S'assurer que le thème est appliqué au body
    document.body.setAttribute('data-theme', state.theme);
  }, [state]);

  // Fonctions d'actions
  const toggleTheme = () => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    dispatch({ type: actionTypes.SET_THEME, payload: newTheme });
  };

  const updateStatsData = (newData) => {
    dispatch({ type: actionTypes.UPDATE_STATS, payload: newData });
  };

  const addNewClaim = (claim) => {
    const claimWithId = {
      ...claim,
      id: claim.id || Date.now(),
      date: claim.date || new Date().toISOString().split('T')[0]
    };
    dispatch({ type: actionTypes.ADD_CLAIM, payload: claimWithId });
  };

  const addNewOrder = (order) => {
    const orderWithId = {
      ...order,
      id: order.id || `CMD-${String(state.orders.length + 1).padStart(3, '0')}`,
      number: order.number || `CMD-${String(state.orders.length + 1).padStart(3, '0')}`
    };
    dispatch({ type: actionTypes.ADD_ORDER, payload: orderWithId });
  };

  const updateDish = (dish) => {
    const dishWithTimestamp = {
      ...dish,
      lastUpdated: new Date().toISOString()
    };
    dispatch({ type: actionTypes.UPDATE_DISH, payload: dishWithTimestamp });
  };

  const updateOrderStatus = (orderId, newStatus) => {
    dispatch({ 
      type: actionTypes.UPDATE_ORDER_STATUS, 
      payload: { orderId, newStatus } 
    });
  };

  const updateDishes = (dishes) => {
    const dishesWithTimestamp = dishes.map(dish => ({
      ...dish,
      lastUpdated: dish.lastUpdated || new Date().toISOString()
    }));
    dispatch({ type: actionTypes.UPDATE_DISHES, payload: dishesWithTimestamp });
  };

  const updateClaims = (claims) => {
    dispatch({ type: actionTypes.UPDATE_CLAIMS, payload: claims });
  };

  const updateOrders = (orders) => {
    dispatch({ type: actionTypes.UPDATE_ORDERS, payload: orders });
  };

  // Mise à jour automatique des données (simulation temps réel)
  useEffect(() => {
    const interval = setInterval(() => {
      // Mise à jour aléatoire des statistiques
      const randomUpdate = (base, variation) => 
        Math.max(0, base + (Math.random() * variation * 2 - variation));
      
      const updatedStats = { ...state.statsData };
      
      // Mettre à jour les données des commandes
      if (updatedStats.orders?.datasets?.[0]?.data) {
        updatedStats.orders.datasets[0].data = 
          updatedStats.orders.datasets[0].data.map(value => randomUpdate(value, 15));
      }
      
      // Mettre à jour les revenus
      if (updatedStats.revenue?.datasets?.[0]?.data) {
        updatedStats.revenue.datasets[0].data = 
          updatedStats.revenue.datasets[0].data.map(value => randomUpdate(value, 10));
      }
      
      dispatch({ type: actionTypes.UPDATE_STATS, payload: updatedStats });
    }, 30000); // Toutes les 30 secondes

    return () => clearInterval(interval);
  }, [state.statsData]);

  // Rendre toutes les données disponibles dans le contexte
  const value = {
    // Données de l'état
    theme: state.theme,
    statsData: state.statsData,
    claimsData: state.claimsData,
    dishes: state.dishes,
    orders: state.orders,
    
    // Fonctions d'actions
    toggleTheme,
    updateStatsData,
    addNewClaim,
    addNewOrder,
    updateDish,
    updateOrderStatus,
    updateDishes,
    updateClaims,
    updateOrders
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Hook personnalisé
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};