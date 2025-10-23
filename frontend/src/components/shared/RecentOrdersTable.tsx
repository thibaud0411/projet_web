import React from 'react';
import './RecentOrdersTable.css';

// Mock Data
const orders = [
  { id: '#1254', client: 'Sophie Bernard', montant: '€24.50', heure: '14:32', status: 'En Préparation' },
  { id: '#1253', client: 'Lucas Moreau', montant: '€18.75', heure: '14:28', status: 'Confirmée' },
  { id: '#1252', client: 'Emma Rousseau', montant: '€31.20', heure: '14:25', status: 'Prête' },
  { id: '#1251', client: 'Thomas Leroy', montant: '€42.90', heure: '14:20', status: 'Livrée' },
  { id: '#1250', client: 'Camille Petit', montant: '€16.40', heure: '14:15', status: 'En Préparation' },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'En Préparation': return 'status-warning';
    case 'Confirmée': return 'status-info';
    case 'Prête': return 'status-success';
    case 'Livrée': return 'status-secondary';
    default: return 'status-secondary';
  }
};

export const RecentOrdersTable: React.FC = () => {
  return (
    <div className="orders-table-card card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">Commandes Récentes (Temps Réel)</h5>
        <span className="update-status">
          <span className="update-dot"></span>
          Mise à jour en temps réel
        </span>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>ID Commande</th>
                <th>Client</th>
                <th>Montant</th>
                <th>Heure</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="fw-bold">{order.id}</td>
                  <td>{order.client}</td>
                  <td>{order.montant}</td>
                  <td>{order.heure}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};