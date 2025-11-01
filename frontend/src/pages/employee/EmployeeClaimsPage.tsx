// src/pages/employee/EmployeeClaimsPage.tsx
import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import { Modal, Button, Form } from 'react-bootstrap';
import { getClaimStatusBadgeClass, formatDate } from '../../components/utils/formatters';
import { PageHeader } from '../../components/shared/PageHeader';
import { InfoTile } from '../../components/shared/InfoTile';
import { InfoTileRow } from '../../components/shared/InfoTileRow';
import apiClient from '../../apiClient'; // <<< CORRECTION: Import d'apiClient

// --- Types (Correspond à l'API) ---
interface Utilisateur { nom: string; prenom?: string; }
interface Claim {
  id_reclamation: number;
  id_commande: number | null;
  description: string;
  reponse: string | null;
  statut: 'Ouverte' | 'En cours' | 'Résolue' | 'Validée' | 'Rejetée';
  date_reclamation: string;
  utilisateur: Utilisateur;
}
type ClaimStatus = Claim['statut'] | 'Toutes';
const ALL_STATUSES_CLAIMS: ClaimStatus[] = ['Toutes', 'Ouverte', 'En cours', 'Résolue', 'Validée', 'Rejetée'];

export const EmployeeClaimsPage: React.FC = () => {
  // --- États ---
  const [claims, setClaims] = useState<Claim[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyLoading, setReplyLoading] = useState(false); // Pour le spinner de la modale

  const [filters, setFilters] = useState({
    status: 'Toutes' as ClaimStatus,
    date: '',
    search: ''
  });
  // const apiUrl = import.meta.env.VITE_API_URL; // (Plus nécessaire)


  // --- Fetch initial des données ---
  useEffect(() => {
    AOS.init({ duration: 800, once: true, offset: 100 });
    fetchClaims();
  }, []); // Dépendance apiUrl supprimée

  const fetchClaims = async () => {
      try {
          setLoading(true);
          setError(null);
          
          // <<< CORRECTION: Utilisation d'apiClient au lieu de fetch >>>
          const response = await apiClient.get<Claim[]>('/claims');
          const data = response.data; // La réponse d'Axios est dans .data
          // --- Fin de la correction ---

          setClaims(data);
      } catch (err: any) {
          // <<< CORRECTION: Gestion d'erreur Axios >>>
          const message = err.response?.data?.message || err.message || "Erreur chargement réclamations";
          setError(message);
          // --- Fin de la correction ---
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
    applyFilters();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, claims]);

  // --- Logique de filtre (inchangée) ---
  const applyFilters = () => {
    let tempClaims = [...claims];
    const search = filters.search.toLowerCase().trim();

    if (filters.status !== 'Toutes') {
      tempClaims = tempClaims.filter(c => c.statut === filters.status);
    }
    if (filters.date) {
      tempClaims = tempClaims.filter(c => c.date_reclamation.split('T')[0] === filters.date);
    }
    if (search) {
      tempClaims = tempClaims.filter(c =>
        c.id_reclamation.toString().includes(search) ||
        c.utilisateur?.nom?.toLowerCase().includes(search) ||
        c.utilisateur?.prenom?.toLowerCase().includes(search) ||
        c.description.toLowerCase().includes(search)
      );
    }
    
    setFilteredClaims(tempClaims);
  };
   const handleFilterChange = (filterType: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };
   const clearFilters = () => {
     setFilters({ status: 'Toutes', date: '', search: '' });
   };

  // --- Gestion Modales (inchangée) ---
  const showClaimDetails = (claim: Claim) => {
    setSelectedClaim(claim);
    setShowDetailsModal(true);
  };
  const openReplyModal = (claim: Claim) => {
    setSelectedClaim(claim);
    setReplyMessage(claim.reponse || '');
    setShowDetailsModal(false);
    setShowReplyModal(true);
  };
  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setShowReplyModal(false);
    setSelectedClaim(null);
    setReplyMessage('');
    setError(null); // Réinitialiser l'erreur de la modale
  };
  
  // --- Logique de Réponse (MAINTENANT CONNECTÉE) ---
  const sendReply = async () => { 
      if (!selectedClaim) return; 
      const claimToUpdate = selectedClaim;

      setReplyLoading(true);
      setError(null); 
      
      try {
          // <<< CORRECTION: Utilisation d'apiClient.patch au lieu de fetch >>>
          const response = await apiClient.patch(
              `/claims/${claimToUpdate.id_reclamation}/reply`, 
              { 
                  reponse: replyMessage, 
                  statut: 'En cours' // Force le statut à "En cours"
              }
          );
          
          const updatedClaim: Claim = response.data; // La réponse d'Axios est dans .data
          // --- Fin de la correction ---
          
          setClaims(prev => prev.map(c => 
              c.id_reclamation === updatedClaim.id_reclamation ? updatedClaim : c
          ));
          handleCloseModal();

      } catch (err: any) {
          // <<< CORRECTION: Gestion d'erreur Axios >>>
          const message = err.response?.data?.message || err.message || 'Échec envoi réponse';
          setError(message);
          // --- Fin de la correction ---
      } finally {
          setReplyLoading(false);
      }
  };
  // --- FIN DE LA
  // --- Calcul Stats (inchangé) ---
  const totalClaims = filteredClaims.length;
  const openClaims = filteredClaims.filter(c => c.statut === 'Ouverte').length;
  const inProgressClaims = filteredClaims.filter(c => c.statut === 'En cours').length;


  return (
    <div>
       <PageHeader
          title="Gestion des Réclamations"
          subtitle="Consultez et répondez aux réclamations des clients."
       />

       {/* Erreur générale (hors modale) */}
       {error && !showReplyModal && (
          <div className="alert alert-danger">{error}</div>
       )}

      <InfoTileRow data-aos="fade-up" data-aos-delay="100" className="mb-4">
        <InfoTile value={<span>{totalClaims}</span>} label="Total Filtré" icon={<i className="bi bi-files"></i>} iconBgClass="icon-bg-1" />
        <InfoTile value={<span>{openClaims}</span>} label="Ouvertes" valueClassName="text-danger" icon={<i className="bi bi-exclamation-triangle-fill"></i>} iconBgClass="icon-bg-3" />
        <InfoTile value={<span>{inProgressClaims}</span>} label="En Cours" valueClassName="text-info" icon={<i className="bi bi-pencil-square"></i>} iconBgClass="icon-bg-2" />
        <InfoTile value={<span>...</span>} label="Résolues" icon={<i className="bi bi-check2-all"></i>} iconBgClass="icon-bg-4" />
      </InfoTileRow>


      <div className="card mb-4" data-aos="fade-up" data-aos-delay="200">
          <div className="card-body" style={{paddingBottom: '0.5rem'}}>
              <div className="row g-3 align-items-end">
                 <div className="col-lg-4">
                     <label className="form-label">Statut</label>
                     <select className="form-select" value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} >
                         {ALL_STATUSES_CLAIMS.map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                 </div>
                 <div className="col-lg-3">
                    <label className="form-label">Date</label>
                    <input type="date" className="form-control" value={filters.date} onChange={(e) => handleFilterChange('date', e.target.value)} />
                 </div>
                 <div className="col-lg-4">
                     <label className="form-label">Recherche</label>
                     <input type="text" className="form-control" placeholder="ID, Client, Motif..." value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} />
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
                  <th>ID</th><th>Client</th><th>Cde #</th><th>Description</th><th>Date</th><th>Statut</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (<tr><td colSpan={7} className="text-center p-4">Chargement...</td></tr>)}
                {!loading && !error && filteredClaims.length === 0 && (<tr><td colSpan={7} className="text-center p-4">Aucune réclamation trouvée.</td></tr>)}
                
                {!loading && !error && filteredClaims.map((claim) => (
                  <tr key={claim.id_reclamation}>
                    <td className="td-primary">#{claim.id_reclamation}</td>
                    <td className="td-primary">{claim.utilisateur?.prenom} {claim.utilisateur?.nom}</td>
                    <td>{claim.id_commande ? `#${claim.id_commande}`: '-'}</td>
                    <td style={{minWidth: '250px', whiteSpace: 'normal'}}>{claim.description}</td>
                    <td>{formatDate(claim.date_reclamation)}</td>
                    <td><span className={`badge ${getClaimStatusBadgeClass(claim.statut)}`}>{claim.statut}</span></td>
                    <td className="td-actions">
                      <Button variant="outline-secondary" size="sm" onClick={() => showClaimDetails(claim)}>
                        <i className="bi bi-eye"></i>
                      </Button>
                       {(claim.statut === 'Ouverte' || claim.statut === 'En cours') && (
                          <Button variant="primary" size="sm" onClick={() => openReplyModal(claim)}>
                             <i className={`bi ${claim.reponse ? 'bi-pencil-square' : 'bi-reply-fill'}`}></i>
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

      {/* Modale Détails (inchangée) */}
      <Modal show={showDetailsModal} onHide={handleCloseModal} size="lg" centered>
         <Modal.Header closeButton>
           <Modal.Title>Détails Réclamation #{selectedClaim?.id_reclamation}</Modal.Title>
         </Modal.Header>
         <Modal.Body>
            {selectedClaim ? (
                <>
                   <p><strong>Client:</strong> {selectedClaim.utilisateur?.prenom} {selectedClaim.utilisateur?.nom}</p>
                   <p><strong>Date:</strong> {formatDate(selectedClaim.date_reclamation)}</p>
                   <p><strong>Statut:</strong> <span className={`badge ${getClaimStatusBadgeClass(selectedClaim.statut)}`}>{selectedClaim.statut}</span></p>
                   <hr/>
                   <p><strong>Description:</strong></p>
                   <p>{selectedClaim.description}</p>
                   <hr/>
                   <p><strong>Réponse:</strong></p>
                   <p>{selectedClaim.reponse || <em>(Aucune réponse pour le moment)</em>}</p>
                </>
            ) : <p>Chargement...</p>}
         </Modal.Body>
         <Modal.Footer>
           <Button variant="secondary" onClick={handleCloseModal}>
             Fermer
           </Button>
           {(selectedClaim?.statut === 'Ouverte' || selectedClaim?.statut === 'En cours') && (
                <Button variant="primary" onClick={() => openReplyModal(selectedClaim!)}>
                    <i className={`bi ${selectedClaim.reponse ? 'bi-pencil-square' : 'bi-reply-fill'} me-2`}></i>
                    {selectedClaim.reponse ? 'Modifier la réponse' : 'Répondre'}
                </Button>
           )}
         </Modal.Footer>
      </Modal>
      
      {/* Modale Réponse */}
      <Modal show={showReplyModal} onHide={handleCloseModal} centered>
         <Modal.Header closeButton>
           <Modal.Title>Répondre à la Réclamation #{selectedClaim?.id_reclamation}</Modal.Title>
         </Modal.Header>
         <Modal.Body>
            {/* Erreur spécifique à la modale */}
            {error && <div className="alert alert-danger">{error}</div>}
            
            <Form.Group>
                <Form.Label>Message de réponse :</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={5}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Saisissez votre réponse au client..."
                    disabled={replyLoading}
                />
            </Form.Group>
         </Modal.Body>
         <Modal.Footer>
           <Button variant="secondary" onClick={handleCloseModal} disabled={replyLoading}>
             Annuler
           </Button>
           <Button variant="primary" onClick={sendReply} disabled={replyLoading}>
             {replyLoading ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
             ) : (
                'Envoyer la réponse'
             )}
           </Button>
         </Modal.Footer>
      </Modal>
    </div>
  );
};