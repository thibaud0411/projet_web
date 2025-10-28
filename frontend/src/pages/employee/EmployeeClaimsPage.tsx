// src/pages/employee/EmployeeClaimsPage.tsx
import React, { useState, useEffect, type ChangeEvent } from 'react';
import AOS from 'aos';
import { Modal, Button, Form } from 'react-bootstrap';
import { getClaimStatusBadgeClass, formatDate } from '../../components/utils/formatters';
import { PageHeader } from '../../components/shared/PageHeader';
import { InfoTile } from '../../components/shared/InfoTile';
import { InfoTileRow } from '../../components/shared/InfoTileRow';

// --- Types (inchangés) ---
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

// --- Données Fictives (inchangées) ---
const mockClaims: Claim[] = [
    {
    id_reclamation: 201,
    id_commande: 101,
    description: "Ma pizza est arrivée froide et la boisson n'était pas la bonne. Je suis très déçu.",
    reponse: "Bonjour, nous sommes sincèrement désolés... (réponse exemple)",
    statut: 'En cours',
    date_reclamation: new Date(Date.now() - 1 * 60 * 60000).toISOString(),
    utilisateur: { nom: 'Dupont', prenom: 'Jean' }
  },
  {
    id_reclamation: 202,
    id_commande: 98,
    description: "Le livreur a mis plus d'une heure à arriver.",
    reponse: null,
    statut: 'Ouverte',
    date_reclamation: new Date(Date.now() - 5 * 60 * 60000).toISOString(),
    utilisateur: { nom: 'Kouassi', prenom: 'Amina' }
  },
    {
    id_reclamation: 200,
    id_commande: 95,
    description: "Problème de paiement sur l'application.",
    reponse: "Le problème a été identifié et résolu par notre équipe technique.",
    statut: 'Résolue',
    date_reclamation: new Date(Date.now() - 2 * 24 * 60 * 60000).toISOString(),
    utilisateur: { nom: 'Gomez', prenom: 'Carlos' }
  }
];
// --- Fin Données Fictives ---

export const EmployeeClaimsPage: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>(mockClaims);
  const [filteredClaims, setFilteredClaims] = useState<Claim[]>(mockClaims);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    AOS.init({ duration: 800, once: true, offset: 100 });
  }, []);

  useEffect(() => {
    applyFilters();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, claims]);

  // --- MODIFIÉ : Logique de filtre implémentée ---
  const applyFilters = () => {
    let tempClaims = [...claims];
    const search = filters.search.toLowerCase().trim();

    // 1. Filtre par Statut
    if (filters.status !== 'Toutes') {
      tempClaims = tempClaims.filter(c => c.statut === filters.status);
    }

    // 2. Filtre par Date
    if (filters.date) {
      tempClaims = tempClaims.filter(c => c.date_reclamation.split('T')[0] === filters.date);
    }
    
    // 3. Filtre par Recherche (ID, Nom, Prénom, Description)
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
    setError(null);
  };
  const sendReply = async () => { /* ... (logique inchangée) ... */ };

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

       {error && !showReplyModal && !showDetailsModal && (
          <div className="alert alert-danger">{error}</div>
       )}

      {/* --- MODIFIÉ : Ajout de "mb-4" pour l'espacement --- */}
      <InfoTileRow data-aos="fade-up" data-aos-delay="100" className="mb-4">
        <InfoTile
            value={<span>{totalClaims}</span>}
            label="Total Filtré"
            icon={<i className="bi bi-files"></i>}
            iconBgClass="icon-bg-1"
        />
        <InfoTile
            value={<span>{openClaims}</span>}
            label="Ouvertes"
            valueClassName="text-danger"
            icon={<i className="bi bi-exclamation-triangle-fill"></i>}
            iconBgClass="icon-bg-3"
        />
        <InfoTile
            value={<span>{inProgressClaims}</span>}
            label="En Cours"
            valueClassName="text-info"
            icon={<i className="bi bi-pencil-square"></i>}
            iconBgClass="icon-bg-2"
        />
        <InfoTile
            value={<span>...</span>}
            label="Résolues"
            icon={<i className="bi bi-check2-all"></i>}
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

      {/* Modales (inchangées) */}
      <Modal show={showDetailsModal} onHide={handleCloseModal} size="lg" centered>
        {/* ... (Contenu Modal inchangé) ... */}
      </Modal>
      <Modal show={showReplyModal} onHide={handleCloseModal} centered>
         {/* ... (Contenu Modal inchangé) ... */}
      </Modal>

    </div>
  );
};