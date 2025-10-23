import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
// On importe le CSS au cas où on voudrait des styles spécifiques plus tard


// --- Types définis localement ---
interface Claim {
  id: string;
  studentName: string;
  orderId: string;
  reason: string;
  employeeResponse: string | null;
  status: 'Ouverte' | 'En cours' | 'Résolue' | 'Validée' | 'Rejetée';
}
// --- Fin des Types ---

// --- Données de simulation ---
const mockClaims: Claim[] = [
  { id: 'R001', studentName: 'Amina Sadi', orderId: 'C1002', reason: 'Le poisson était froid.', employeeResponse: 'Nous proposons un bon de -10% sur la prochaine commande.', status: 'En cours' },
  { id: 'R002', studentName: 'Marc Eto\'o', orderId: 'C1003', reason: 'Temps de livraison trop long (1h).', employeeResponse: 'Le livreur a eu un imprévu, nous nous excusons.', status: 'En cours' },
  { id: 'R003', studentName: 'Jean Dupont', orderId: 'C1001', reason: 'Mauvaise boisson livrée.', employeeResponse: null, status: 'Ouverte' },
];
// --- Fin des Données ---

export const ClaimsValidationPage: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>(mockClaims);
  const [showModal, setShowModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [actionType, setActionType] = useState<'validate' | 'reject'>('validate');

  const handleActionClick = (claim: Claim, action: 'validate' | 'reject') => {
    setSelectedClaim(claim);
    setActionType(action);
    setShowModal(true);
  };

  const handleConfirmAction = () => {
    if (selectedClaim) {
      setClaims(claims.map(c => 
        c.id === selectedClaim.id 
          ? { ...c, status: actionType === 'validate' ? 'Validée' : 'Rejetée' } 
          : c
      ));
    }
    setShowModal(false);
    setSelectedClaim(null);
  };

  const handleCloseModal = () => setShowModal(false);

  return (
    <div>
      <h2 className="mb-4">Gestion des Réclamations</h2>
      <p className="text-muted">Valider ou rejeter les réponses proposées par les employés.</p>

      {/* La classe "card" est stylisée globalement */}
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">Réclamations à Traiter</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            {/* On utilise les classes globales */}
            <table className="table align-middle mb-0">
              <thead className="table-custom-header">
                <tr>
                  <th>ID Réclamation</th>
                  <th>Étudiant</th>
                  <th>Motif</th>
                  <th>Réponse Employé</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {claims
                  .filter(c => c.status === 'En cours' || c.status === 'Ouverte')
                  .map((claim) => (
                  <tr key={claim.id}>
                    <td className="table-custom-cell">{claim.id}</td>
                    <td className="table-custom-cell">{claim.studentName} (Cde: {claim.orderId})</td>
                    <td className="table-custom-cell">{claim.reason}</td>
                    <td className="table-custom-cell">
                      {claim.employeeResponse 
                        ? <em className="text-primary">"{claim.employeeResponse}"</em> 
                        : <span className="text-muted">Pas de réponse</span>}
                    </td>
                    <td className="table-custom-cell">
                      {/* On utilise le style global "btn-primary" */}
                      <button 
                        className="btn btn-primary btn-sm me-2"
                        onClick={() => handleActionClick(claim, 'validate')}
                        disabled={!claim.employeeResponse}
                      >
                        Valider
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleActionClick(claim, 'reject')}
                        disabled={!claim.employeeResponse}
                      >
                        Rejeter
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal - On remplace le bouton "Valider" par le btn-primary global */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Êtes-vous sûr de vouloir <strong>{actionType === 'validate' ? 'valider' : 'rejeter'}</strong> cette réponse ?
          <br/>
          <small className="text-muted">{selectedClaim?.employeeResponse}</small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Annuler</Button>
          <Button 
            variant={actionType === 'validate' ? 'primary' : 'danger'} 
            onClick={handleConfirmAction}
          >
            {actionType === 'validate' ? 'Valider' : 'Rejeter'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};