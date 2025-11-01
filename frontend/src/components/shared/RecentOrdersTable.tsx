// src/components/shared/RecentOrdersTable.tsx

import React, { useState, useEffect } from 'react'; // Ajouter les hooks
import apiClient from '../../apiClient'; // Importer apiClient
import './RecentOrdersTable.css';

// --- Interfaces (peuvent être partagées dans un fichier types.ts) ---
type OrderStatus = 'En attente' | 'En préparation' | 'Prête' | 'Livrée' | 'Annulée';
interface Utilisateur { nom: string; prenom: string; }
interface Article { nom: string; }
interface LigneCommande { quantite: number; article: Article; }
interface Order {
  id_commande: number;
  montant_total: number | string;
  date_commande: string;
  statut: OrderStatus;
  utilisateur: Utilisateur;
  lignes: LigneCommande[];
}
// --- Fin Interfaces ---

// Supprimer mock data
// const orders = [ ... ];

// Fonction badge (adaptée)
const getStatusBadgeClass = (status: OrderStatus): string => {
    switch (status) {
        case 'En préparation': return 'status-warning';
        case 'En attente': return 'status-info'; // 'Confirmée' -> 'En attente' ? Ajuster si besoin
        case 'Prête': return 'status-success';
        case 'Livrée': return 'status-secondary';
        case 'Annulée': return 'status-danger';
        default: return 'status-secondary';
    }
};

// Fonctions formatage (similaires à OrdersPage)
const formatTime = (isoDateString: string): string => {
    try {
        return new Date(isoDateString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch { return 'N/A'; }
}
const formatAmount = (amount: number | string | null | undefined): string => {
    const num = Number(amount);
    return isNaN(num) ? 'N/A' : num.toLocaleString('fr-FR') + ' F';
}

export const RecentOrdersTable: React.FC = () => {
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Fetch des commandes récentes ---
  useEffect(() => {
    const fetchRecent = async () => {
      setLoading(true);
      setError(null);
      try {
        // Appelle l'API /orders (qui trie par défaut par date récente)
        const response = await apiClient.get<Order[]>('/orders');
        // Garde seulement les 5 plus récentes pour cet aperçu
        setRecentOrders(response.data.slice(0, 5));
      } catch (err: any) {
        console.error("Erreur chargement commandes récentes:", err);
        setError("Impossible de charger les commandes.");
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
    // Optionnel: Ajouter un intervalle pour rafraîchir automatiquement
    // const intervalId = setInterval(fetchRecent, 30000); // Rafraîchit toutes les 30s
    // return () => clearInterval(intervalId); // Nettoyage de l'intervalle
  }, []); // [] = exécuter une seule fois au montage (ou périodiquement si intervalle)


  return (
    <div className="orders-table-card card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">Commandes Récentes</h5>
        {/* L'indicateur temps réel peut être conditionnel */}
        <span className="update-status">
          {/* <span className="update-dot"></span> */}
          {loading ? 'Chargement...' : 'À jour'}
        </span>
      </div>
      <div className="card-body p-0">
        {error && <p className="text-danger p-3">{error}</p>}
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
              {loading && (
                <tr><td colSpan={5} className="text-center p-4">Chargement...</td></tr>
              )}
              {!loading && !error && recentOrders.length === 0 && (
                 <tr><td colSpan={5} className="text-center p-4 text-muted">Aucune commande récente.</td></tr>
              )}
              {!loading && !error && recentOrders.map((order) => (
                <tr key={order.id_commande}>
                  <td className="fw-bold">#{order.id_commande}</td>
                  <td>{order.utilisateur?.prenom} {order.utilisateur?.nom}</td>
                  <td>{formatAmount(order.montant_total)}</td>
                  <td>{formatTime(order.date_commande)}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(order.statut)}`}>
                      {order.statut}
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