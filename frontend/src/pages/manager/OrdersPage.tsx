import React, { useState, useEffect } from 'react';
import apiClient from '../../apiClient';
import './OrdersPage.css'; // Assure-toi que ce fichier CSS existe

// --- Types ---
type OrderStatus = 'En attente' | 'En préparation' | 'Prête' | 'Livrée' | 'Annulée';
interface Utilisateur { id_utilisateur: number; nom: string; prenom: string; }
interface Article { id_article: number; nom: string; }
// Assure-toi que id_ligne est bien inclus par ton API
interface LigneCommande { id_ligne: number; id_article: number; quantite: number; article: Article; }
interface Order {
  id_commande: number;
  montant_total: number | string;
  statut: OrderStatus;
  date_commande: string;
  utilisateur: Utilisateur;
  lignes: LigneCommande[];
}

// --- Fonctions utilitaires (placées HORS du composant) ---
const getStatusBadgeClass = (status: OrderStatus): string => {
  switch (status) {
    case 'En attente': return 'status-warning';
    case 'En préparation': return 'status-info';
    case 'Prête': return 'status-success';
    case 'Livrée': return 'status-secondary';
    case 'Annulée': return 'status-danger';
    default: return 'status-secondary';
  }
};
const ALL_STATUSES: (OrderStatus | 'Toutes')[] = [
  'Toutes', 'En attente', 'En préparation', 'Prête', 'Livrée', 'Annulée'
];
const formatTime = (isoDateString: string): string => {
    try {
        if (!isoDateString) return 'N/A'; // Ajout d'une vérification
        const date = new Date(isoDateString);
        // Vérifie si la date est valide
        if (isNaN(date.getTime())) {
             console.warn("Date invalide reçue:", isoDateString);
             return 'Invalide';
        }
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        console.error("Erreur formatage date:", isoDateString, e);
        return 'Erreur';
    }
}
const formatAmount = (amount: number | string | null | undefined): string => {
    const num = Number(amount);
    if (amount === null || amount === undefined || isNaN(num)) { return 'N/A'; }
    return num.toLocaleString('fr-FR') + ' F'; // Ou F CFA selon préférence
}

// --- Composant ---
export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'Toutes'>('Toutes');

  // Fetch initial et sur changement de filtre
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = statusFilter !== 'Toutes' ? { statut: statusFilter } : {};
        const response = await apiClient.get<Order[]>('/orders', { params });
        // Vérification simple des données reçues
        if (Array.isArray(response.data)) {
            setOrders(response.data);
        } else {
            console.error("Données reçues ne sont pas un tableau:", response.data);
            setError("Format de données incorrect reçu du serveur.");
            setOrders([]); // Vide le tableau en cas d'erreur de format
        }
      } catch (err: any) {
        console.error("[FETCH] Erreur chargement commandes:", err);
        setError(err.response?.data?.message || err.message || "Impossible de charger les commandes.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [statusFilter]);

  // Mise à jour du statut
  const handleUpdateStatus = async (orderId: number, newStatus: OrderStatus) => {
      setError(null);
      try {
          const response = await apiClient.patch<Order>(`/orders/${orderId}`, { statut: newStatus });
          if (response.data && response.data.id_commande && response.data.statut) {
              setOrders(prevOrders =>
                  prevOrders.map(order =>
                      order.id_commande === orderId ? response.data : order
                  )
              );
          } else {
              console.error("[UPDATE] Réponse API invalide reçue:", response.data);
              setError("Réponse invalide reçue du serveur après la mise à jour.");
          }
      } catch (err: any) {
           console.error(`[UPDATE] Erreur API/Réseau pour #${orderId}:`, err);
           setError(err.response?.data?.message || err.message || `Erreur mise à jour statut.`);
           if (err.response) {
               console.error('[UPDATE] Détails Erreur API:', { status: err.response.status, data: err.response.data });
           }
      }
  }

  return (
    <div className="orders-page-container">
      {/* En-tête */}
      <div className="page-header mb-4">
        <h1 className="h2 mb-0">Supervision des Commandes</h1>
        <p className="text-muted mb-0">Suivi en temps réel de toutes les opérations.</p>
      </div>

      {/* Filtres */}
      <div className="d-flex justify-content-start align-items-center mb-3">
        <label className="form-label me-3 mb-0 text-muted fw-500">Filtrer par statut:</label>
        <div className="filter-btn-group">
          {ALL_STATUSES.map((status) => (
            <button key={status} type="button" disabled={loading}
              className={`btn ${statusFilter === status ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setStatusFilter(status)} >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Affichage d'erreur */}
      {error && <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
      </div>}

      {/* Tableau des commandes */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th><th>Client</th><th>Détails</th><th>Total</th><th>Heure</th><th>Statut</th><th>Actions</th>
                </tr>
              </thead>
              {/* Correction structure tbody pour éviter whitespace error */}
              <tbody>
                {/* Condition 1: Chargement */}
                {loading && (
                    <tr><td colSpan={7} className="text-center p-4"><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Chargement...</td></tr>
                )}
                {/* Condition 2: Pas de chargement, pas d'erreur, tableau vide */}
                {!loading && !error && orders.length === 0 && (
                    <tr><td colSpan={7} className="text-center p-4 text-muted">Aucune commande trouvée {statusFilter !== 'Toutes' ? `avec le statut "${statusFilter}"` : ''}.</td></tr>
                )}
                {/* Condition 3: Pas de chargement, pas d'erreur, commandes présentes */}
                {!loading && !error && orders.length > 0 && (
                    orders.map((order) => (
                      <tr key={order.id_commande}>
                        <td className="fw-bold">#{order.id_commande}</td>
                        <td>{order.utilisateur?.prenom} {order.utilisateur?.nom}</td>
                        <td>
                          {/* Correction key prop ici */}
                          {order.lignes?.map((ligne, index) => (
                              <span key={ligne.id_ligne}> {/* Utilise id_ligne */}
                                  {ligne.article?.nom || 'Article?'} (x{ligne.quantite})
                                  {index < order.lignes.length - 1 ? ', ' : ''}
                              </span>
                          )) || <span className="text-muted">Vide</span>}
                        </td>
                        <td>{formatAmount(order.montant_total)}</td>
                        <td>{formatTime(order.date_commande)}</td>
                        <td><span className={`status-badge ${getStatusBadgeClass(order.statut)}`}>{order.statut}</span></td>
                        <td>
                          {order.statut === 'En attente' && ( <button className="btn btn-sm btn-info me-1" title="Passer en préparation" onClick={() => handleUpdateStatus(order.id_commande, 'En préparation')}><i className="bi bi-play-fill"></i> Préparer</button> )}
                          {order.statut === 'En préparation' && ( <button className="btn btn-sm btn-success me-1" title="Marquer comme prête" onClick={() => handleUpdateStatus(order.id_commande, 'Prête')}><i className="bi bi-check-lg"></i> Prête</button> )}
                          {order.statut === 'Prête' && ( <button className="btn btn-sm btn-secondary" title="Marquer comme livrée/retirée" onClick={() => handleUpdateStatus(order.id_commande, 'Livrée')}><i className="bi bi-box-arrow-right"></i> Livrée</button> )}
                        </td>
                      </tr>
                    ))
                )}
                {/* Condition 4: Afficher l'erreur ici aussi si elle empêche l'affichage */}
                {!loading && error && (
                     <tr><td colSpan={7} className="text-center p-4 text-danger">Erreur: {error}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;