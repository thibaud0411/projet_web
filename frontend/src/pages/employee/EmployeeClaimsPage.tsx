// src/pages/employee/EmployeeClaimsPage.tsx
import React, { useState, useEffect, useRef, type ChangeEvent } from 'react';
import AOS from 'aos';
import { Modal, Button, Form } from 'react-bootstrap';
// import apiClient from '../../api/apiClient'; // API non requise pour l'instant
import '../manager/ClaimsValidationPage.css'; // Exemple de réutilisation

// Import des utilitaires centralisés
import { getClaimStatusBadgeClass, formatDate } from '../../components/utils/formatters';

// --- Types ---
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

// --- Données Fictives ---
const mockClaims: Claim[] = [
  {
    id_reclamation: 201,
    id_commande: 101,
    description: "Ma pizza est arrivée froide et la boisson n'était pas la bonne. Je suis très déçu.",
    reponse: "Bonjour, nous sommes sincèrement désolés... (réponse exemple)",
    statut: 'En cours',
    date_reclamation: new Date(Date.now() - 1 * 60 * 60000).toISOString(), // 1h ago
    utilisateur: { nom: 'Dupont', prenom: 'Jean' }
  },
  {
    id_reclamation: 202,
    id_commande: 98,
    description: "Le livreur a mis plus d'une heure à arriver.",
    reponse: null,
    statut: 'Ouverte',
    date_reclamation: new Date(Date.now() - 5 * 60 * 60000).toISOString(), // 5h ago
    utilisateur: { nom: 'Kouassi', prenom: 'Amina' }
  },
    {
    id_reclamation: 200,
    id_commande: 95,
    description: "Problème de paiement sur l'application.",
    reponse: "Le problème a été identifié et résolu par notre équipe technique.",
    statut: 'Résolue',
    date_reclamation: new Date(Date.now() - 2 * 24 * 60 * 60000).toISOString(), // 2 jours ago
    utilisateur: { nom: 'Gomez', prenom: 'Carlos' }
  }
];
// --- Fin Données Fictives ---


export const EmployeeClaimsPage: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>(mockClaims); // Utilise les mocks
  const [filteredClaims, setFilteredClaims] = useState<Claim[]>(mockClaims);
  const [loading, setLoading] = useState(false); // Mis à false
  const [error, setError] = useState<string | null>(null);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  const [filters, setFilters] = useState({
    status: 'Toutes' as ClaimStatus,
    date: '',
    search: ''
  });

  // --- Chargement et Filtrage ---
  useEffect(() => {
    AOS.init({ duration: 800, once: true, offset: 100 });
    // fetchClaims(); // Appel API désactivé
  }, []);

  useEffect(() => {
    applyFilters();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, claims]);

  /*
  // Logique de fetch (mise en commentaire)
  const fetchClaims = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/employee/claims');
      setClaims(response.data.data || response.data);
    } catch (err: any) {
      console.error("Erreur chargement réclamations employé:", err);
      setError(err.response?.data?.message || "Impossible de charger les réclamations.");
    } finally {
      setLoading(false);
    }
  };
  */

  const applyFilters = () => {
    let tempClaims = [...claims];
    if (filters.status !== 'Toutes') {
      tempClaims = tempClaims.filter(c => c.statut === filters.status);
    }
    if (filters.date) {
      tempClaims = tempClaims.filter(c => c.date_reclamation.startsWith(filters.date));
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      tempClaims = tempClaims.filter(c =>
          (c.utilisateur?.nom?.toLowerCase().includes(searchTerm)) ||
          (c.utilisateur?.prenom?.toLowerCase().includes(searchTerm)) ||
          (c.description.toLowerCase().includes(searchTerm)) ||
          (c.id_reclamation.toString().includes(searchTerm)) ||
          (c.id_commande?.toString().includes(searchTerm))
      );
    }
    tempClaims.sort((a, b) => new Date(b.date_reclamation).getTime() - new Date(a.date_reclamation).getTime());
    setFilteredClaims(tempClaims);
  };

   const handleFilterChange = (filterType: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

   const clearFilters = () => {
     setFilters({ status: 'Toutes', date: '', search: '' });
   };

  // --- Gestion des Modales ---
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
    setError(null);
  };

  // --- Envoyer/Modifier Réponse ---
  const sendReply = async () => {
    if (!selectedClaim || !replyMessage.trim()) {
      setError("Veuillez saisir une réponse.");
      return;
    }
    setError(null);
    console.log(`[SIMULATION] Réponse à #${selectedClaim.id_reclamation}: ${replyMessage}`);

    // Logique de mise à jour (commentée)
    /*
    try {
      const response = await apiClient.patch(`/employee/claims/${selectedClaim.id_reclamation}/reply`, {
        reponse: replyMessage
      });
      setClaims(prevClaims =>
        prevClaims.map(c =>
          c.id_reclamation === selectedClaim.id_reclamation ? response.data.data : c
        )
      );
      handleCloseModal();
      showToast(`Réponse envoyée pour #${selectedClaim.id_reclamation}`, 'success');

    } catch (err: any) {
      console.error("Erreur envoi réponse:", err);
      setError(err.response?.data?.message || "Erreur lors de l'envoi de la réponse.");
    }
    */
    
    // Mise à jour fictive
    setClaims(prevClaims =>
        prevClaims.map(c =>
          c.id_reclamation === selectedClaim.id_reclamation 
            ? { ...c, reponse: replyMessage, statut: 'En cours' } 
            : c
        )
    );
    handleCloseModal();
    showToast(`Réponse envoyée pour #${selectedClaim.id_reclamation}`, 'success');
  };

   const showToast = (message: string, type: string) => console.log(`${type}: ${message}`);

   // --- Calcul Stats ---
   const totalClaims = filteredClaims.length;
   const openClaims = filteredClaims.filter(c => c.statut === 'Ouverte').length;
   const inProgressClaims = filteredClaims.filter(c => c.statut === 'En cours').length;


  return (
    <div>
      {/* En-tête */}
       <div className="d-flex justify-content-between align-items-center mb-4" data-aos="fade-up">
         <div>
            <h1 className="h2 page-title mb-1">Gestion des Réclamations</h1>
            <p className="page-subtitle text-muted mb-0">Consultez et répondez aux réclamations des clients.</p>
         </div>
      </div>

       {/* Affichage d'erreur globale */}
       {error && !showReplyModal && !showDetailsModal && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
             {error}
             <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
          </div>
       )}

       {/* Stats rapides */}
      <div className="row g-3 mb-4" data-aos="fade-up" data-aos-delay="100">
         <div className="col"><div className="card p-3 text-center small"><div className="fs-4 fw-bold">{totalClaims}</div><div className="text-muted">Total Filtré</div></div></div>
         <div className="col"><div className="card p-3 text-center small"><div className="fs-4 fw-bold text-danger">{openClaims}</div><div className="text-muted">Ouvertes</div></div></div>
         <div className="col"><div className="card p-3 text-center small"><div className="fs-4 fw-bold text-info">{inProgressClaims}</div><div className="text-muted">En Cours</div></div></div>
      </div>

       {/* Filtres */}
       <div className="card filters-section mb-4" data-aos="fade-up" data-aos-delay="200">
          <div className="card-body">
              <div className="row g-3 align-items-end">
                 <div className="col-md-4">
                     <label className="form-label small text-muted">Statut</label>
                     <select className="form-select form-select-sm" value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} >
                         {ALL_STATUSES_CLAIMS.map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                 </div>
                 <div className="col-md-3">
                    <label className="form-label small text-muted">Date</label>
                    <input type="date" className="form-control form-control-sm" value={filters.date} onChange={(e) => handleFilterChange('date', e.target.value)} />
                 </div>
                 <div className="col-md-4">
                     <label className="form-label small text-muted">Recherche</label>
                     <input type="text" className="form-control form-control-sm" placeholder="ID, Client, Motif..." value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} />
                 </div>
                 <div className="col-md-1">
                     <button className="btn btn-sm btn-outline-secondary w-100" onClick={clearFilters} title="Effacer les filtres">
                         <i className="bi bi-x-lg"></i>
                     </button>
                 </div>
              </div>
          </div>
       </div>

      {/* Tableau des réclamations */}
      <div className="card" data-aos="fade-up" data-aos-delay="300">
        <div className="card-header d-none d-lg-block">
          <h5 className="card-title mb-0">Liste des Réclamations</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th><th>Client</th><th>Cde #</th><th>Description</th><th>Date</th><th>Statut</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (<tr><td colSpan={7} className="text-center p-4">Chargement...</td></tr>)}
                {!loading && filteredClaims.length === 0 && (<tr><td colSpan={7} className="text-center p-4 text-muted">Aucune réclamation trouvée.</td></tr>)}
                {!loading && filteredClaims.map((claim) => (
                  <tr key={claim.id_reclamation}>
                    <td className="fw-bold">#{claim.id_reclamation}</td>
                    <td>{claim.utilisateur?.prenom} {claim.utilisateur?.nom}</td>
                    <td>{claim.id_commande ? `#${claim.id_commande}`: '-'}</td>
                    <td style={{maxWidth: '300px', whiteSpace: 'normal', fontSize: '0.9rem'}}>{claim.description}</td>
                    <td>{formatDate(claim.date_reclamation)}</td>
                    <td><span className={`status-badge ${getClaimStatusBadgeClass(claim.statut)}`}>{claim.statut}</span></td>
                    <td>
                      <Button variant="outline-primary" size="sm" className="me-2" title="Voir détails" onClick={() => showClaimDetails(claim)}>
                        <i className="bi bi-eye"></i>
                      </Button>
                       {(claim.statut === 'Ouverte' || claim.statut === 'En cours') && (
                          <Button variant="success" size="sm" title={claim.reponse ? 'Modifier Réponse' : 'Répondre'} onClick={() => openReplyModal(claim)}>
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

      {/* --- Modales --- */}

      {/* Modal Détails */}
      <Modal show={showDetailsModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Détails Réclamation #{selectedClaim?.id_reclamation}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedClaim && (
            <div>
              <p><strong>Client:</strong> {selectedClaim.utilisateur?.prenom} {selectedClaim.utilisateur?.nom}</p>
              <p><strong>Commande:</strong> {selectedClaim.id_commande ? `#${selectedClaim.id_commande}` : 'N/A'}</p>
              <p><strong>Date:</strong> {formatDate(selectedClaim.date_reclamation)}</p>
              <p><strong>Statut:</strong> <span className={`status-badge ${getClaimStatusBadgeClass(selectedClaim.statut)}`}>{selectedClaim.statut}</span></p>
              <hr />
              <p><strong>Description Client:</strong></p>
              <p style={{whiteSpace: 'pre-wrap'}} className='bg-light p-2 rounded border text-dark'><em>{selectedClaim.description}</em></p>
              <hr />
              <p><strong>Réponse Employé:</strong></p>
              {selectedClaim.reponse
                ? <p style={{whiteSpace: 'pre-wrap'}}>{selectedClaim.reponse}</p>
                : <p className="text-muted">Aucune réponse pour le moment.</p>}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Fermer</Button>
           {selectedClaim && (selectedClaim.statut === 'Ouverte' || selectedClaim.statut === 'En cours') && (
             <Button variant="success" onClick={() => openReplyModal(selectedClaim)}>
                 <i className={`bi ${selectedClaim.reponse ? 'bi-pencil-square' : 'bi-reply-fill'} me-2`}></i>
                 {selectedClaim.reponse ? 'Modifier Réponse' : 'Répondre'}
             </Button>
           )}
        </Modal.Footer>
      </Modal>

      {/* Modal Réponse */}
      <Modal show={showReplyModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Répondre à #{selectedClaim?.id_reclamation}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={(e) => { e.preventDefault(); sendReply(); }}>
            <Modal.Body>
                {error && <div className="alert alert-danger">{error}</div>}
                <Form.Group controlId="replyMessage">
                <Form.Label>Votre réponse :</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={4}
                    value={replyMessage}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setReplyMessage(e.target.value)}
                    required
                />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseModal}>Annuler</Button>
                <Button variant="primary" type="submit">
                    <i className="bi bi-send me-2"></i> Envoyer
                </Button>
            </Modal.Footer>
        </Form>
      </Modal>

    </div>
  );
};