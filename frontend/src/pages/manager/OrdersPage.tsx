import React, { useState, useEffect, useMemo } from 'react';
import './OrdersPage.css'; // Nous allons créer ce fichier CSS

// --- Types définis localement ---
type OrderStatus = 'En attente' | 'En préparation' | 'Prête' | 'Livrée' | 'Annulée';
interface Order {
  id: string;
  studentName: string;
  items: { name: string; quantity: number }[];
  status: OrderStatus;
  total: number;
  timestamp: Date;
}
// --- Fin des Types ---

// --- Données de simulation (plus complètes) ---
const mockOrders: Order[] = [
  { id: 'C1005', studentName: 'Léa Martin', items: [{ name: 'Ndolè Royal', quantity: 1 }], status: 'En attente', total: 3500, timestamp: new Date(Date.now() - 60000 * 2) },
  { id: 'C1004', studentName: 'Paul Bernard', items: [{ name: 'Poulet DG', quantity: 2 }], status: 'En préparation', total: 5000, timestamp: new Date(Date.now() - 60000 * 5) },
  { id: 'C1003', studentName: 'Sophie Bernard', items: [{ name: 'Spaghetti', quantity: 1 }], status: 'Prête', total: 1500, timestamp: new Date(Date.now() - 60000 * 10) },
  { id: 'C1002', studentName: 'Lucas Moreau', items: [{ name: 'Poisson Braisé', quantity: 1 }], status: 'Livrée', total: 4000, timestamp: new Date(Date.now() - 60000 * 30) },
  { id: 'C1001', studentName: 'Emma Rousseau', items: [{ name: 'Jus de Bissap', quantity: 1 }], status: 'Annulée', total: 500, timestamp: new Date(Date.now() - 60000 * 60) },
];
// --- Fin des Données ---

// Fonction utilitaire pour les badges de statut
const getStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case 'En attente': return 'status-warning';
    case 'En préparation': return 'status-info';
    case 'Prête': return 'status-success';
    case 'Livrée': return 'status-secondary';
    case 'Annulée': return 'status-danger';
    default: return 'status-secondary';
  }
};

// Liste des statuts pour les boutons filtres
const ALL_STATUSES: (OrderStatus | 'Toutes')[] = [
  'Toutes', 
  'En attente', 
  'En préparation', 
  'Prête', 
  'Livrée', 
  'Annulée'
];

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'Toutes'>('Toutes');

  // Simulation de mise à jour en temps réel (AJAX)
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prevOrders => {
        const newOrders = [...prevOrders];
        // 1. Simuler un changement de statut
        const orderToUpdateIndex = newOrders.findIndex(o => o.status === 'En attente');
        if (orderToUpdateIndex !== -1) {
          newOrders[orderToUpdateIndex].status = 'En préparation';
          newOrders[orderToUpdateIndex].timestamp = new Date();
        }
        
        // 2. Simuler une nouvelle commande
        if (Math.random() > 0.8) { // 20% de chance d'ajouter une commande
          const newId = `C${1006 + Math.floor(Math.random() * 100)}`;
          if (!newOrders.find(o => o.id === newId)) {
            newOrders.unshift({
              id: newId,
              studentName: 'Nouveau Client',
              items: [{ name: 'Coca-Cola', quantity: 1 }],
              status: 'En attente',
              total: 500,
              timestamp: new Date(),
            });
          }
        }
        return newOrders;
      });
    }, 5000); // Mise à jour toutes les 5 secondes

    return () => clearInterval(interval);
  }, []);

  // Filtrer les commandes pour l'affichage
  const filteredOrders = useMemo(() => {
    return orders
      .filter(order => statusFilter === 'Toutes' || order.status === statusFilter)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Trier par date
  }, [orders, statusFilter]);

  return (
    <div className="orders-page-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-0">Supervision des Commandes</h1>
          <p className="text-muted mb-0">Suivi en temps réel de toutes les opérations.</p>
        </div>
        <div className="d-flex align-items-center">
          <span className="update-status me-3">
            <span className="update-dot"></span>
            Mise à jour en temps réel
          </span>
        </div>
      </div>
      
      {/* --- MODIFICATION DES FILTRES --- */}
      <div className="d-flex justify-content-start align-items-center mb-3">
        <label className="form-label me-3 mb-0 text-muted fw-500">Filtrer par statut:</label>
        <div className="filter-btn-group">
          {ALL_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              className={`btn ${statusFilter === status ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
      {/* --- FIN MODIFICATION DES FILTRES --- */}


      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID Commande</th>
                  <th>Client</th>
                  <th>Détails</th>
                  <th>Total</th>
                  <th>Heure</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="fw-bold">{order.id}</td>
                      <td>{order.studentName}</td>
                      <td>{order.items.map(it => `${it.name} (x${it.quantity})`).join(', ')}</td>
                      <td>{order.total.toLocaleString()} F</td>
                      <td>{order.timestamp.toLocaleTimeString('fr-FR')}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center p-4 text-muted">
                      Aucune commande ne correspond à ce filtre.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Exporter le composant pour qu'il soit utilisable dans le routeur
export default OrdersPage;