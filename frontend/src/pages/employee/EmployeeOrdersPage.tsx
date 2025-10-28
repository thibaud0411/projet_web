// src/pages/employee/EmployeeOrdersPage.tsx
import React, { useState, useEffect, type ChangeEvent } from 'react';
import AOS from 'aos';
import { Button } from 'react-bootstrap'; 
import { getOrderStatusBadgeClass, formatTime, formatAmount } from '../../components/utils/formatters';
import { PageHeader } from '../../components/shared/PageHeader';
import { InfoTile } from '../../components/shared/InfoTile';
import { InfoTileRow } from '../../components/shared/InfoTileRow';

// --- Types (inchangés) ---
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
  updating?: boolean;
}
const ALL_STATUSES: (OrderStatus | 'Toutes')[] = ['Toutes', 'En attente', 'En préparation', 'Prête', 'Livrée', 'Annulée'];

// --- Données Fictives (inchangées) ---
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
  {
    id_commande: 102,
    numero_commande: "CMD-102",
    montant_total: 8000,
    statut: 'En préparation',
    date_commande: new Date(Date.now() - 10 * 60000).toISOString(),
    utilisateur: { nom: 'Martin', prenom: 'Alice' },
    telephone: '677665544',
    lignes: [ { article: { nom: 'Burger Classique' }, quantite: 1 } ]
  },
  {
    id_commande: 103,
    numero_commande: "CMD-103",
    montant_total: 4500,
    statut: 'Prête',
    date_commande: new Date(Date.now() - 30 * 60000).toISOString(),
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
  const [orders, setOrders] =useState<Order[]>(mockOrders);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(mockOrders);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: 'Toutes' as OrderStatus | 'Toutes',
    date: '',
    search: ''
  });

  useEffect(() => {
    AOS.init({ duration: 800, once: true, offset: 100 });
  }, []);

  useEffect(() => {
    applyFilters();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, orders]); // Se déclenche quand les filtres ou les commandes changent

  // --- MODIFIÉ : Logique de filtre implémentée ---
  const applyFilters = () => {
    let tempOrders = [...orders];
    const search = filters.search.toLowerCase().trim();

    // 1. Filtre par Statut
    if (filters.status !== 'Toutes') {
      tempOrders = tempOrders.filter(o => o.statut === filters.status);
    }

    // 2. Filtre par Date
    if (filters.date) {
      // Compare la partie 'YYYY-MM-DD' de la date
      tempOrders = tempOrders.filter(o => {
        try {
          // '2025-10-28T10:00:00.000Z'.split('T')[0] === '2025-10-28'
          return o.date_commande.split('T')[0] === filters.date;
        } catch (e) {
          return false; // Gère les dates invalides
        }
      });
    }
    
    // 3. Filtre par Recherche (ID, Nom, Prénom, Téléphone)
    if (search) {
      tempOrders = tempOrders.filter(o =>
        o.id_commande.toString().includes(search) ||
        o.utilisateur?.nom?.toLowerCase().includes(search) ||
        o.utilisateur?.prenom?.toLowerCase().includes(search) ||
        o.telephone?.replace(/\s/g, '').includes(search) // Recherche sans espaces
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

   const handleUpdateStatus = async (orderId: number, newStatus: OrderStatus) => {
       setError(null);
       setOrders(prev => prev.map(o => o.id_commande === orderId ? {...o, updating: true} : o));
       setTimeout(() => {
         setOrders(prevOrders =>
            prevOrders.map(order =>
                order.id_commande === orderId ? { ...order, statut: newStatus, updating: false } : order
            )
         );
       }, 1000);
   }

  // --- Calculs Stats (inchangés) ---
  const totalOrders = filteredOrders.length;
  const pendingOrders = filteredOrders.filter(o => o.statut === 'En attente').length;
  const preparingOrders = filteredOrders.filter(o => o.statut === 'En préparation').length;
  const readyOrders = filteredOrders.filter(o => o.statut === 'Prête').length;

  return (
    <div>
      {/* PageHeader a maintenant "mb-4" grâce à la modif de son propre fichier */}
      <PageHeader
        title="Suivi des Commandes"
        subtitle="Visualisez et mettez à jour le statut des commandes."
      />

      {error && <div className="alert alert-danger">{error}</div>}

      {/* --- MODIFIÉ : Ajout de "mb-4" pour l'espacement --- */}
      <InfoTileRow data-aos="fade-up" data-aos-delay="100" className="mb-4">
        <InfoTile
          value={<span>{totalOrders}</span>}
          label="Total"
          icon={<i className="bi bi-card-list"></i>}
          iconBgClass="icon-bg-1"
        />
        <InfoTile
          value={<span>{pendingOrders}</span>}
          label="En attente"
          valueClassName="text-warning"
          icon={<i className="bi bi-clock-history"></i>}
          iconBgClass="icon-bg-3"
        />
        <InfoTile
          value={<span>{preparingOrders}</span>}
          label="En prépa."
          valueClassName="text-info"
          icon={<i className="bi bi-gear-fill"></i>}
          iconBgClass="icon-bg-2"
        />
        <InfoTile
          value={<span>{readyOrders}</span>}
          label="Prêtes"
          valueClassName="text-success"
          icon={<i className="bi bi-check2-circle"></i>}
          iconBgClass="icon-bg-4"
        />
      </InfoTileRow>


      {/* --- MODIFIÉ : Ajout de "mb-4" pour l'espacement --- */}
      <div className="card mb-4" data-aos="fade-up" data-aos-delay="200">
          <div className="card-body" style={{paddingBottom: '0.5rem'}}>
              <div className="row g-3 align-items-end">
                 
                 <div className="col-lg-4">
                     <label className="form-label">Statut</label>
                     <select className="form-select" value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} >
                         {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                 </div>
                 
                 <div className="col-lg-3">
                    <label className="form-label">Date</label>
                    <input type="date" className="form-control" value={filters.date} onChange={(e) => handleFilterChange('date', e.target.value)} />
                 </div>
                 
                 <div className="col-lg-4">
                     <label className="form-label">Recherche</label>
                     <input type="text" className="form-control" placeholder="ID, Client, Tél..." value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} />
                 </div>
                 
                 <div className="col-lg-1">
                     <button className="btn btn-outline-secondary w-100" onClick={clearFilters} title="Effacer les filtres">
                         <i className="bi bi-x-lg"></i>
                     </button>
                 </div>
              </div>
          </div>
      </div>

      {/* Tableau (inchangé) */}
      <div className="card" data-aos="fade-up" data-aos-delay="300">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>ID</th><th>Client</th><th>Détails</th><th>Total</th><th>Heure</th><th>Statut</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && ( <tr><td colSpan={7} className="text-center p-4">Chargement...</td></tr> )}
                {!loading && !error && filteredOrders.length === 0 && ( <tr><td colSpan={7} className="text-center p-4">Aucune commande trouvée.</td></tr> )}
                
                {!loading && !error && filteredOrders.map((order) => (
                  <tr key={order.id_commande} style={{opacity: order.updating ? 0.5 : 1}}>
                    <td className="td-primary">#{order.id_commande}</td>
                    <td>
                      <div className="td-primary">{order.utilisateur?.prenom} {order.utilisateur?.nom}</div>
                      <div>{order.telephone}</div>
                    </td>
                    <td style={{minWidth: '250px', whiteSpace: 'normal'}}>
                        {order.lignes?.map((ligne, index) => (
                            <span key={ligne.id_ligne ?? index}>
                                {ligne.article?.nom || '?'} (x{ligne.quantite})
                                {index < order.lignes.length - 1 ? ', ' : ''}
                            </span>
                        )) || '-'}
                    </td>
                    <td className="td-primary">{formatAmount(order.montant_total)}</td>
                    <td>{formatTime(order.date_commande)}</td>
                    <td><span className={`badge ${getOrderStatusBadgeClass(order.statut)}`}>{order.statut}</span></td>
                    <td className="td-actions">
                      {order.statut === 'En attente' && (
                        <Button variant="info" size="sm"
                           onClick={() => handleUpdateStatus(order.id_commande, 'En préparation')} disabled={order.updating}>
                           Préparer
                        </Button>
                      )}
                      {order.statut === 'En préparation' && (
                        <Button variant="success" size="sm"
                           onClick={() => handleUpdateStatus(order.id_commande, 'Prête')} disabled={order.updating}>
                           Prête
                        </Button>
                      )}
                      {order.statut === 'Prête' && (
                         <Button variant="secondary" size="sm"
                           onClick={() => handleUpdateStatus(order.id_commande, 'Livrée')} disabled={order.updating}>
                           Livrer
                         </Button>
                      )}
                       {(order.statut === 'En attente' || order.statut === 'En préparation') && (
                         <Button variant="outline-danger" size="sm"
                           onClick={() => handleUpdateStatus(order.id_commande, 'Annulée')} disabled={order.updating}>
                           <i className="bi bi-x"></i>
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