// src/pages/manager/OrdersPage.tsx

import React, { useState, useEffect } from 'react'; // Changement: useMemo n'est plus utile ici
import apiClient from '../../apiClient'; // Importer apiClient
import './OrdersPage.css'; // Garder tes styles

// --- Types mis à jour pour correspondre à l'API Laravel ---
type OrderStatus = 'En attente' | 'En préparation' | 'Prête' | 'Livrée' | 'Annulée';

interface Utilisateur {
  id_utilisateur: number;
  nom: string;
  prenom: string;
}

interface Article {
  id_article: number;
  nom: string;
}

interface LigneCommande {
  id_ligne: number; // Ajout de la clé primaire pour React si besoin
  id_article: number;
  quantite: number;
  article: Article; // Article imbriqué grâce au 'with' dans Laravel
}

interface Order {
  id_commande: number;
  montant_total: number | string; // Accepter string car Laravel peut le retourner comme tel parfois
  statut: OrderStatus;
  date_commande: string; // Date ISO string de Laravel
  utilisateur: Utilisateur; // Utilisateur imbriqué
  lignes: LigneCommande[]; // Lignes de commande imbriquées
}
// --- Fin des Types ---


// Fonction utilitaire pour les badges (inchangée)
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

// Liste des statuts pour les filtres (inchangée)
const ALL_STATUSES: (OrderStatus | 'Toutes')[] = [
  'Toutes',
  'En attente',
  'En préparation',
  'Prête',
  'Livrée',
  'Annulée'
];

// Fonction pour formater l'heure depuis une date ISO (inchangée)
const formatTime = (isoDateString: string): string => {
    try {
        const date = new Date(isoDateString);
        // HH:MM format
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        console.error("Erreur formatage date:", isoDateString, e);
        return 'Invalide';
    }
}

// Fonction pour formater le montant (pour s'assurer que c'est un nombre)
const formatAmount = (amount: number | string | null | undefined): string => {
    const num = Number(amount);
    if (isNaN(num)) {
        return 'N/A';
    }
    return num.toLocaleString('fr-FR') + ' F'; // Formatage avec espace et "F"
}


export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]); // Initialisé à vide
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Peut être null
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'Toutes'>('Toutes');

  // --- Chargement des données via API ---
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null); // Réinitialiser l'erreur
      console.log(`Fetching orders with status: ${statusFilter}`); // Log pour débugger
      try {
        // Construire les paramètres de requête pour le filtre
        // Si 'Toutes' est sélectionné, on n'envoie pas le paramètre 'statut'
        const params = statusFilter !== 'Toutes' ? { statut: statusFilter } : {};

        // Appel GET vers /api/orders avec les paramètres
        const response = await apiClient.get<Order[]>('/orders', { params });
        console.log("Orders received:", response.data); // Log pour voir les données
        setOrders(response.data);
      } catch (err: any) {
        console.error("Erreur chargement commandes:", err);
        const errorMessage = err.response?.data?.message || err.message || "Impossible de charger les commandes.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [statusFilter]); // Se ré-exécute automatiquement quand statusFilter change

  // --- Fonction pour mettre à jour le statut d'une commande ---
  const handleUpdateStatus = async (orderId: number, newStatus: OrderStatus) => {
      // Optionnel: Ajouter un état pour indiquer qu'une commande spécifique est en cours de mise à jour
      // setUpdatingStatus(orderId);
      setError(null); // Clear previous errors
      try {
          const response = await apiClient.patch<Order>(`/orders/${orderId}`, { statut: newStatus });
          // Mettre à jour la commande dans l'état local
          setOrders(prevOrders => prevOrders.map(order =>
              order.id_commande === orderId ? response.data : order
          ));
          console.log(`Statut commande #${orderId} mis à jour: ${newStatus}`);
      } catch (err: any) {
           console.error(`Erreur mise à jour statut commande #${orderId}:`, err);
           const errorMessage = err.response?.data?.message || err.message || `Erreur mise à jour statut.`;
           setError(errorMessage); // Afficher l'erreur
      } finally {
           // setUpdatingStatus(null);
      }
  }

  return (
    <div className="orders-page-container">
      {/* En-tête (inchangé) */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-0">Supervision des Commandes</h1>
          <p className="text-muted mb-0">Suivi en temps réel de toutes les opérations.</p>
        </div>
        {/* On peut garder l'indicateur si on ajoute un rafraîchissement auto plus tard */}
        {/* <div className="d-flex align-items-center"> ... </div> */}
      </div>

      {/* Filtres (inchangés en apparence) */}
      <div className="d-flex justify-content-start align-items-center mb-3">
        <label className="form-label me-3 mb-0 text-muted fw-500">Filtrer par statut:</label>
        <div className="filter-btn-group">
          {ALL_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              className={`btn ${statusFilter === status ? 'btn-primary' : 'btn-outline-secondary'}`}
              // Désactiver le bouton pendant le chargement pour éviter double-clic
              disabled={loading}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Affichage d'erreur global */}
      {error && <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
      </div>}

      {/* Tableau des commandes */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              {/* En-tête de table */}
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Client</th>
                  <th>Détails</th>
                  <th>Total</th>
                  <th>Heure</th>
                  <th>Statut</th>
                  <th>Actions</th> {/* Nouvelle colonne pour les boutons */}
                </tr>
              </thead>
              <tbody>
                {/* Indicateur de chargement */}
                {loading && (
                    <tr><td colSpan={7} className="text-center p-4"><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Chargement...</td></tr>
                )}
                {/* Affichage si aucune commande après chargement */}
                {!loading && !error && orders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center p-4 text-muted">
                      Aucune commande trouvée {statusFilter !== 'Toutes' ? `avec le statut "${statusFilter}"` : ''}.
                    </td>
                  </tr>
                )}
                {/* Liste des commandes depuis l'API */}
                {!loading && !error && orders.map((order) => (
                  <tr key={order.id_commande}>
                    <td className="fw-bold">#{order.id_commande}</td>
                    <td>{order.utilisateur?.prenom} {order.utilisateur?.nom}</td>
                    <td>
                      {order.lignes?.map((ligne, index) => (
                          // Utiliser l'id_ligne comme clé si disponible, sinon l'index
                          <span key={ligne.id_ligne || index}>
                              {ligne.article?.nom || 'Article inconnu'} (x{ligne.quantite})
                              {/* Ajouter une virgule sauf pour le dernier élément */}
                              {index < order.lignes.length - 1 ? ', ' : ''}
                          </span>
                      )) || <span className="text-muted">Aucun article</span>}
                    </td>
                    {/* Utiliser formatAmount */}
                    <td>{formatAmount(order.montant_total)}</td>
                    <td>{formatTime(order.date_commande)}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(order.statut)}`}>
                        {order.statut}
                      </span>
                    </td>
                    {/* Colonne Actions avec boutons conditionnels */}
                    <td>
                       {order.statut === 'En attente' && (
                           <button className="btn btn-sm btn-info me-1" title="Passer en préparation" onClick={() => handleUpdateStatus(order.id_commande, 'En préparation')}>
                                <i className="bi bi-play-fill"></i> Préparer
                           </button>
                       )}
                       {order.statut === 'En préparation' && (
                           <button className="btn btn-sm btn-success me-1" title="Marquer comme prête" onClick={() => handleUpdateStatus(order.id_commande, 'Prête')}>
                                <i className="bi bi-check-lg"></i> Prête
                           </button>
                       )}
                       {order.statut === 'Prête' && (
                           <button className="btn btn-sm btn-secondary" title="Marquer comme livrée/retirée" onClick={() => handleUpdateStatus(order.id_commande, 'Livrée')}>
                                <i className="bi bi-box-arrow-right"></i> Livrée
                           </button>
                       )}
                       {/* Ajouter un bouton Annuler si besoin */}
                       {/* { (order.statut === 'En attente' || order.statut === 'En préparation') && (
                            <button className="btn btn-sm btn-danger" title="Annuler la commande" onClick={() => handleUpdateStatus(order.id_commande, 'Annulée')}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                       )} */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Exporter le composant
export default OrdersPage;