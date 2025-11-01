// src/pages/employee/EmployeeOrdersPage.tsx
import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import { Modal, Button, Dropdown } from 'react-bootstrap';
import { 
  getOrderStatusBadgeClass, 
  formatDate, 
  formatAmount, 
  formatTime 
} from '../../components/utils/formatters';
import { PageHeader } from '../../components/shared/PageHeader';
import { InfoTile } from '../../components/shared/InfoTile';
import { InfoTileRow } from '../../components/shared/InfoTileRow';
import apiClient from '../../apiClient'; // <<< CORRECTION: Import d'apiClient

// --- Types (Correspond à l'API OrderController) ---
interface Utilisateur { 
  nom: string; 
  prenom?: string; 
}
interface Ligne { 
  article: { nom: string }; 
  quantite: number; 
  prix_unitaire: number;
}
interface Order {
  id_commande: number;
  utilisateur: Utilisateur;
  lignes: Ligne[];
  date_commande: string;
  montant_total: number;
  statut: 'En attente' | 'En préparation' | 'Prête' | 'Livrée' | 'Annulée';
}
type OrderStatus = Order['statut'] | 'Toutes';
const ALL_STATUSES_ORDERS: OrderStatus[] = ['Toutes', 'En attente', 'En préparation', 'Prête', 'Livrée', 'Annulée'];
const STATUS_ACTIONS: Order['statut'][] = ['En attente', 'En préparation', 'Prête', 'Annulée'];

export const EmployeeOrdersPage: React.FC = () => {
  // --- États ---
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [filters, setFilters] = useState({
    status: 'Toutes' as OrderStatus,
    search: ''
  });
  // const apiUrl = import.meta.env.VITE_API_URL; // (Plus nécessaire)


  // --- Fetch initial des données ---
  useEffect(() => {
    AOS.init({ duration: 800, once: true, offset: 100 });
    fetchOrders();
  }, []); // Dépendance apiUrl supprimée

  const fetchOrders = async () => {
      try {
          setLoading(true);
          setError(null);
          
          // <<< CORRECTION: Utilisation d'apiClient au lieu de fetch >>>
          const response = await apiClient.get<Order[]>('/orders');
          const data = response.data; // La réponse d'Axios est dans .data
          // --- Fin de la correction ---

          setOrders(data);
      } catch (err: any) {
          // <<< CORRECTION: Gestion d'erreur Axios >>>
          const message = err.response?.data?.message || err.message || "Erreur chargement commandes";
          setError(message);
          // --- Fin de la correction ---
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
    applyFilters();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, orders]);

  // --- Logique de filtre ---
  const applyFilters = () => {
    let tempOrders = [...orders];
    const search = filters.search.toLowerCase().trim();

    if (filters.status !== 'Toutes') {
      tempOrders = tempOrders.filter(o => o.statut === filters.status);
    }
    if (search) {
      tempOrders = tempOrders.filter(o =>
        o.id_commande.toString().includes(search) ||
        o.utilisateur?.nom?.toLowerCase().includes(search) ||
        o.utilisateur?.prenom?.toLowerCase().includes(search)
      );
    }
    setFilteredOrders(tempOrders);
  };
   const handleFilterChange = (filterType: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };
   const clearFilters = () => {
     setFilters({ status: 'Toutes', search: '' });
   };

  // --- Gestion Modale ---
  const showOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };
  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedOrder(null);
  };
  
  // --- Logique de Mise à Jour Statut ---
  const handleStatusUpdate = async (orderId: number, newStatus: Order['statut']) => {
    const originalOrders = [...orders];

    // 1. Mise à jour optimiste (UI)
    setOrders(prev => 
      prev.map(o => o.id_commande === orderId ? { ...o, statut: newStatus } : o)
    );

    try {
        // <<< CORRECTION: Utilisation d'apiClient.patch au lieu de fetch >>>
        const response = await apiClient.patch(
            `/orders/${orderId}`,
            { statut: newStatus } // Le corps de la requête
        );
        
        const updatedOrder: Order = response.data; // La réponse d'Axios est dans .data
        // --- Fin de la correction ---
        
        // 3. Mettre à jour l'état global avec la réponse (confirmer)
        setOrders(prev => prev.map(o => 
            o.id_commande === updatedOrder.id_commande ? updatedOrder : o
        ));

    } catch (err: any) {
        // <<< CORRECTION: Gestion d'erreur Axios >>>
        const message = err.response?.data?.message || err.message || 'Échec mise à jour';
        setError(message);
        // --- Fin de la correction ---
        setOrders(originalOrders); // 4. Rollback en cas d'erreur
    }
  };

  // --- Calcul Stats ---
  const totalOrders = filteredOrders.length;
  const pendingOrders = filteredOrders.filter(c => c.statut === 'En attente').length;
  const inProgressOrders = filteredOrders.filter(c => c.statut === 'En préparation').length;
  const readyOrders = filteredOrders.filter(c => c.statut === 'Prête').length;


  return (
    <div>
       <PageHeader
          title="Gestion des Commandes"
          subtitle="Suivez et mettez à jour les commandes en temps réel."
       />

       {error && (
          <div className="alert alert-danger">{error}</div>
       )}

      {/* C'est la ligne 145 (environ) qui posait problème. Elle est maintenant correcte. */}
      <InfoTileRow data-aos="fade-up" data-aos-delay="100" className="mb-4">
        <InfoTile value={<span>{totalOrders}</span>} label="Total Filtré" icon={<i className="bi bi-files"></i>} iconBgClass="icon-bg-1" />
        <InfoTile value={<span>{pendingOrders}</span>} label="En Attente" valueClassName="text-danger" icon={<i className="bi bi-clock-history"></i>} iconBgClass="icon-bg-3" />
        <InfoTile value={<span>{inProgressOrders}</span>} label="En Préparation" valueClassName="text-info" icon={<i className="bi bi-gear-fill"></i>} iconBgClass="icon-bg-2" />
        <InfoTile value={<span>{readyOrders}</span>} label="Prêtes" valueClassName="text-success" icon={<i className="bi bi-check2-all"></i>} iconBgClass="icon-bg-4" />
      </InfoTileRow>


      <div className="card mb-4" data-aos="fade-up" data-aos-delay="200">
          <div className="card-body" style={{paddingBottom: '0.5rem'}}>
              <div className="row g-3 align-items-end">
                 <div className="col-lg-5">
                     <label className="form-label">Statut</label>
                     <select className="form-select" value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} >
                         {ALL_STATUSES_ORDERS.map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                 </div>
                 <div className="col-lg-6">
                     <label className="form-label">Recherche</label>
                     <input type="text" className="form-control" placeholder="ID, Client..." value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} />
                 </div>
                 <div className="col-lg-1">
                     <button className="btn btn-outline-secondary w-100" onClick={clearFilters} title="Effacer les filtres">
                         <i className="bi bi-x-lg"></i>
                     </button>
                 </div>
              </div>
          </div>
       </div>

      {/* Tableau */}
      <div className="card" data-aos="fade-up" data-aos-delay="300">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>ID</th><th>Client</th><th>Date/Heure</th><th>Montant</th><th>Contenu</th><th>Statut</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (<tr><td colSpan={7} className="text-center p-4">Chargement...</td></tr>)}
                {!loading && !error && filteredOrders.length === 0 && (<tr><td colSpan={7} className="text-center p-4">Aucune commande trouvée.</td></tr>)}
                
                {!loading && !error && filteredOrders.map((order) => (
                  <tr key={order.id_commande}>
                    <td className="td-primary">#{order.id_commande}</td>
                    <td className="td-primary">{order.utilisateur?.prenom} {order.utilisateur?.nom}</td>
                    <td>{formatDate(order.date_commande)} à {formatTime(order.date_commande)}</td>
                    <td>{formatAmount(order.montant_total)}</td>
                    <td>
                        {order.lignes.map((ligne, idx) => (
                            <span key={idx} className="d-block" style={{fontSize: '0.8rem'}}>
                                {ligne.quantite}x {ligne.article.nom}
                            </span>
                        ))}
                    </td>
                    <td><span className={`badge ${getOrderStatusBadgeClass(order.statut)}`}>{order.statut}</span></td>
                    <td className="td-actions">
                      <Button variant="outline-secondary" size="sm" onClick={() => showOrderDetails(order)}>
                        <i className="bi bi-eye"></i>
                      </Button>
                      <Dropdown>
                        <Dropdown.Toggle variant="primary" size="sm" id={`dd-${order.id_commande}`} disabled={order.statut === 'Livrée'}>
                           <i className="bi bi-pencil-square"></i>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {STATUS_ACTIONS.map(status => (
                                <Dropdown.Item 
                                    key={status} 
                                    onClick={() => handleStatusUpdate(order.id_commande, status)}
                                    active={order.statut === status}
                                >
                                    {status}
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modale Détails */}
      <Modal show={showDetailsModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
           <Modal.Title>Détails Commande #{selectedOrder?.id_commande}</Modal.Title>
        </Modal.Header>
         <Modal.Body>
            {selectedOrder ? (
                <>
                   <div className="row">
                       <div className="col-md-6">
                           <p><strong>Client:</strong> {selectedOrder.utilisateur?.prenom} {selectedOrder.utilisateur?.nom}</p>
                           <p><strong>Date:</strong> {formatDate(selectedOrder.date_commande)} à {formatTime(selectedOrder.date_commande)}</p>
                       </div>
                       <div className="col-md-6">
                           <p><strong>Statut:</strong> <span className={`badge ${getOrderStatusBadgeClass(selectedOrder.statut)}`}>{selectedOrder.statut}</span></p>
                           <p><strong>Total:</strong> {formatAmount(selectedOrder.montant_total)}</p>
                       </div>
                   </div>
                   <hr/>
                   <p><strong>Contenu de la commande:</strong></p>
                   <table className="table table-sm">
                       <thead>
                           <tr><th>Article</th><th>Qté</th><th>P.U.</th><th>Sous-total</th></tr>
                       </thead>
                       <tbody>
                           {selectedOrder.lignes.map((ligne, idx) => (
                               <tr key={idx}>
                                   <td>{ligne.article.nom}</td>
                                   <td>{ligne.quantite}</td>
                                   <td>{formatAmount(ligne.prix_unitaire)}</td>
                                   <td>{formatAmount(ligne.quantite * ligne.prix_unitaire)}</td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
                </>
            ) : <p>Chargement...</p>}
         </Modal.Body>
         <Modal.Footer>
           <Button variant="secondary" onClick={handleCloseModal}>
             Fermer
           </Button>
         </Modal.Footer>
      </Modal>

    </div>
  );
};