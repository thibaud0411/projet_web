// src/pages/employee/EmployeeOrdersPage.tsx
import React, { useState, useEffect, type ChangeEvent } from 'react';
import AOS from 'aos';
// import apiClient from '../../api/apiClient'; // API non requise pour l'instant
import { Button } from 'react-bootstrap'; // Import manquant
import '../manager/OrdersPage.css'; // Réutilise le CSS Manager

// Import des utilitaires centralisés
import { getOrderStatusBadgeClass, formatTime, formatAmount } from '../../components/utils/formatters';

// --- NOUVEAUX IMPORTS ---
import { PageHeader } from '../../components/shared/PageHeader';
import { InfoTile } from '../../components/shared/InfoTile';
import { InfoTileRow } from '../../components/shared/InfoTileRow';

// --- Types ---
type OrderStatus = 'En attente' | 'En préparation' | 'Prête' | 'Livrée' | 'Annulée';
interface Utilisateur { nom: string; prenom?: string; }
interface Article { nom: string; }
interface LigneCommande { id_ligne?: number; quantite: number; article: Article; }
interface Order {
  id_commande: number;
  numero_commande?: string;
  montant_total: number | string;
  statut: OrderStatus;
  date_commande: string;
  utilisateur: Utilisateur;
  lignes: LigneCommande[];
  telephone?: string;
  updating?: boolean; // Pour l'état de chargement de la ligne
}

const ALL_STATUSES: (OrderStatus | 'Toutes')[] = ['Toutes', 'En attente', 'En préparation', 'Prête', 'Livrée', 'Annulée'];

// --- Données Fictives ---
const mockOrders: Order[] = [
  {
    id_commande: 101,
    numero_commande: "CMD-101",
    montant_total: 12500,
    statut: 'En attente',
    date_commande: new Date().toISOString(),
    utilisateur: { nom: 'Dupont', prenom: 'Jean' },
    telephone: '699887766',
    lignes: [
      { article: { nom: 'Pizza Reine' }, quantite: 2 },
      { article: { nom: 'Coca-Cola' }, quantite: 2 }
    ]
  },
  // ... autres commandes fictives
  {
    id_commande: 102,
    numero_commande: "CMD-102",
    montant_total: 8000,
    statut: 'En préparation',
    date_commande: new Date(Date.now() - 10 * 60000).toISOString(), // 10 mins ago
    utilisateur: { nom: 'Martin', prenom: 'Alice' },
    telephone: '677665544',
    lignes: [
      { article: { nom: 'Burger Classique' }, quantite: 1 },
    ]
  },
  {
    id_commande: 103,
    numero_commande: "CMD-103",
    montant_total: 4500,
    statut: 'Prête',
    date_commande: new Date(Date.now() - 30 * 60000).toISOString(), // 30 mins ago
    utilisateur: { nom: 'Bernard', prenom: 'Luc' },
    telephone: '655443322',
    lignes: [
      { article: { nom: 'Salade César' }, quantite: 1 },
      { article: { nom: 'Eau Minérale' }, quantite: 1 }
    ]
  }
];
// --- Fin Données Fictives ---

export const EmployeeOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(mockOrders); // Utilise les mocks
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(mockOrders);
  const [loading, setLoading] = useState(false); // Mis à false
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: 'Toutes' as OrderStatus | 'Toutes',
    date: '',
    search: ''
  });

  // --- Chargement et Filtrage ---
  useEffect(() => {
    AOS.init({ duration: 800, once: true, offset: 100 });
    // fetchOrders(); // Appel API désactivé
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFilters();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, orders]); // Applique les filtres

  /*
  // Logique de fetch (mise en commentaire)
  const fetchOrders = async () => { ... };
  */

  const applyFilters = () => {
    let tempOrders = [...orders];
    if (filters.status !== 'Toutes') {
      tempOrders = tempOrders.filter(order => order.statut === filters.status);
    }
    if (filters.date) {
      tempOrders = tempOrders.filter(order => order.date_commande.startsWith(filters.date));
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      tempOrders = tempOrders.filter(order =>
        (order.utilisateur?.nom?.toLowerCase().includes(searchTerm)) ||
        (order.utilisateur?.prenom?.toLowerCase().includes(searchTerm)) ||
        (order.numero_commande?.toLowerCase().includes(searchTerm)) ||
        (order.telephone?.includes(searchTerm)) ||
        (order.id_commande.toString().includes(searchTerm))
      );
    }
    setFilteredOrders(tempOrders);
  };

  const handleFilterChange = (filterType: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const clearFilters = () => {
    setFilters({ status: 'Toutes', date: '', search: '' });
  };

  // --- Actions sur les Commandes ---
   const handleUpdateStatus = async (orderId: number, newStatus: OrderStatus) => {
       // ... (logique inchangée)
       setError(null);
       setOrders(prev => prev.map(o => o.id_commande === orderId ? {...o, updating: true} : o));
       console.log(`[SIMULATION] Mise à jour Commande #${orderId} -> Statut: ${newStatus}`);
       setTimeout(() => {
         setOrders(prevOrders =>
            prevOrders.map(order =>
                order.id_commande === orderId ? { ...order, statut: newStatus, updating: false } : order
            )
         );
         showToast(`Commande #${orderId} marquée comme ${newStatus}`, 'success');
       }, 1000);
   }

   const showToast = (message: string, type: string) => console.log(`${type}: ${message}`);

  // --- Calculs Stats Rapides ---
  const totalOrders = filteredOrders.length;
  const pendingOrders = filteredOrders.filter(o => o.statut === 'En attente').length;
  const preparingOrders = filteredOrders.filter(o => o.statut === 'En préparation').length;
  const readyOrders = filteredOrders.filter(o => o.statut === 'Prête').length;

  return (
    <div>
      {/* En-tête (MODIFIÉ) */}
      <PageHeader
        title="Suivi des Commandes"
        subtitle="Visualisez et mettez à jour le statut des commandes."
      />

       {/* Affichage d'erreur globale */}
      {error && <div className="alert alert-danger alert-dismissible fade show" role="alert">
         {error}
         <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
      </div>}

      {/* Stats rapides (MODIFIÉ) */}
      <InfoTileRow data-aos="fade-up" data-aos-delay="100">
        <InfoTile
          value={<span>{totalOrders}</span>}
          label="Total"
        />
        <InfoTile
          value={<span>{pendingOrders}</span>}
          label="En attente"
          valueClassName="text-warning"
        />
        <InfoTile
          value={<span>{preparingOrders}</span>}
          label="En prépa."
          valueClassName="text-info"
        />
        <InfoTile
          value={<span>{readyOrders}</span>}
          label="Prêtes"
          valueClassName="text-success"
        />
      </InfoTileRow>


      {/* Filtres (Inchangé) */}
      <div className="card filters-section mb-4" data-aos="fade-up" data-aos-delay="200">
          <div className="card-body">
              <div className="row g-3 align-items-end">
                 {/* ... (contenu des filtres inchangé) ... */}
                 <div className="col-md-4">
                     <label className="form-label small text-muted">Statut</label>
                     <select className="form-select form-select-sm" value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} >
                         {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                 </div>
                 <div className="col-md-3">
                    <label className="form-label small text-muted">Date</label>
                    <input type="date" className="form-control form-control-sm" value={filters.date} onChange={(e) => handleFilterChange('date', e.target.value)} />
                 </div>
                 <div className="col-md-4">
                     <label className="form-label small text-muted">Recherche</label>
                     <input type="text" className="form-control form-control-sm" placeholder="ID, Client, Tél..." value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} />
                 </div>
                 <div className="col-md-1">
                     <button className="btn btn-sm btn-outline-secondary w-100" onClick={clearFilters} title="Effacer les filtres">
                         <i className="bi bi-x-lg"></i>
                     </button>
                 </div>
              </div>
          </div>
      </div>

      {/* Liste des commandes (Inchangé) */}
      <div className="card shadow-sm border-0" data-aos="fade-up" data-aos-delay="300">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              {/* ... (contenu du tableau inchangé) ... */}
              <thead className="table-light">
                <tr>
                  <th>ID</th><th>Client</th><th>Détails</th><th>Total</th><th>Heure</th><th>Statut</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && ( <tr><td colSpan={7} className="text-center p-4">Chargement...</td></tr> )}
                {!loading && filteredOrders.length === 0 && ( <tr><td colSpan={7} className="text-center p-4 text-muted">Aucune commande trouvée.</td></tr> )}
                
                {!loading && filteredOrders.map((order) => (
                  <tr key={order.id_commande} className={order.updating ? 'updating-row' : ''} style={{opacity: order.updating ? 0.6 : 1}}>
                    <td className="fw-bold">#{order.id_commande}</td>
                    <td>
                      <div>{order.utilisateur?.prenom} {order.utilisateur?.nom}</div>
                      <small className="text-muted">{order.telephone}</small>
                    </td>
                    <td style={{maxWidth: '300px'}}>
                        {order.lignes?.map((ligne, index) => (
                            <span key={ligne.id_ligne ?? index}>
                                {ligne.article?.nom || '?'} (x{ligne.quantite})
                                {index < order.lignes.length - 1 ? ', ' : ''}
                            </span>
                        )) || '-'}
                    </td>
                    <td>{formatAmount(order.montant_total)}</td>
                    <td>{formatTime(order.date_commande)}</td>
                    <td><span className={`status-badge ${getOrderStatusBadgeClass(order.statut)}`}>{order.statut}</span></td>
                    <td style={{minWidth: '180px'}}>
                      {order.statut === 'En attente' && (
                        <Button variant="info" size="sm" className="me-1" title="Passer en préparation"
                           onClick={() => handleUpdateStatus(order.id_commande, 'En préparation')} disabled={order.updating}>
                           {order.updating ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : <i className="bi bi-play-fill"></i>} Préparer
                        </Button>
                      )}
                      {order.statut === 'En préparation' && (
                        <Button variant="success" size="sm" className="me-1" title="Marquer comme prête"
                           onClick={() => handleUpdateStatus(order.id_commande, 'Prête')} disabled={order.updating}>
                           {order.updating ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : <i className="bi bi-check-lg"></i>} Prête
                        </Button>
                      )}
                      {order.statut === 'Prête' && (
                         <Button variant="secondary" size="sm" title="Notifier client / Marquer comme livrée"
                           onClick={() => handleUpdateStatus(order.id_commande, 'Livrée')} disabled={order.updating}>
                           {order.updating ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : <i className="bi bi-box-arrow-right"></i>} Livrer
                         </Button>
                      )}
                       {(order.statut === 'En attente' || order.statut === 'En préparation') && (
                         <Button variant="outline-danger" size="sm" className="mt-1 mt-lg-0" title="Annuler la commande"
                           onClick={() => handleUpdateStatus(order.id_commande, 'Annulée')} disabled={order.updating}>
                           <i className="bi bi-x-circle"></i>
                         </Button>
                       )}
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