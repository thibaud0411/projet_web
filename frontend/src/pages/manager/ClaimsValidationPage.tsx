import React, { useState, useEffect } from 'react'; // Ajoutez useEffect
import { Modal, Button } from 'react-bootstrap';
import apiClient from '../../apiClient'; // Importez votre apiClient

// --- Types définis localement (MODIFIÉS pour correspondre à Laravel) ---
interface Utilisateur { // Type pour l'utilisateur imbriqué
  id_utilisateur: number;
  nom: string;
  prenom: string;
  // Ajoutez d'autres champs si nécessaire
}
interface Claim {
  id_reclamation: number; // Clé primaire de Laravel
  id_commande: number | null; // Peut être null
  description: string; // Renommé de 'reason'
  reponse: string | null; // Renommé de 'employeeResponse'
  statut: 'Ouverte' | 'En cours' | 'Résolue' | 'Validée' | 'Rejetée'; // Statuts de Laravel
  date_reclamation: string; // Date de la réclamation
  utilisateur: Utilisateur; // Utilisateur associé
  // Ajoutez d'autres champs si nécessaire (ex: date_traitement)
}
// --- Fin des Types ---

// --- Données de simulation (Supprimées) ---
// const mockClaims: Claim[] = [ ... ]; // SUPPRIMEZ CECI

export const ClaimsValidationPage: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]); // Initialisé à vide
  const [loading, setLoading] = useState(true); // Pour l'indicateur de chargement
  const [errorMessage, setErrorMessage] = useState(''); // Pour les erreurs
  const [showModal, setShowModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [actionType, setActionType] = useState<'validate' | 'reject'>('validate');

  // --- CHARGEMENT DES DONNÉES VIA API ---
  useEffect(() => {
    const fetchClaims = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        const response = await apiClient.get('/claims'); // Appel GET vers /api/claims
        setClaims(response.data);
      } catch (error: any) {
        console.error("Erreur chargement réclamations:", error);
        setErrorMessage(error.response?.data?.message || "Impossible de charger les réclamations.");
      } finally {
        setLoading(false);
      }
    };
    fetchClaims();
  }, []); // [] = exécuter une seule fois au montage

  // --- ACTIONS (VALIDER/REJETER) VIA API ---
  const handleActionClick = (claim: Claim, action: 'validate' | 'reject') => {
    setSelectedClaim(claim);
    setActionType(action);
    setShowModal(true);
  };

  const handleConfirmAction = async () => { // Transformé en fonction async
    if (selectedClaim) {
      const newStatus = actionType === 'validate' ? 'Validée' : 'Rejetée';
      try {
        // Appel PATCH vers /api/claims/{id_reclamation}
        const response = await apiClient.patch(`/claims/${selectedClaim.id_reclamation}`, {
          statut: newStatus // Envoyer le nouveau statut
        });

        // Mettre à jour l'état local après succès
        setClaims(claims.filter(c => c.id_reclamation !== selectedClaim.id_reclamation));
        // Ou, si vous voulez juste mettre à jour le statut au lieu de supprimer:
        // setClaims(claims.map(c =>
        //   c.id_reclamation === selectedClaim.id_reclamation ? response.data : c
        // ));

      } catch (error: any) {
        console.error(`Erreur ${actionType === 'validate' ? 'validation' : 'rejet'} réclamation:`, error);
        // Afficher une erreur à l'utilisateur si nécessaire
        setErrorMessage(error.response?.data?.message || `Erreur lors de la mise à jour de la réclamation.`);
      } finally {
          setShowModal(false);
          setSelectedClaim(null);
      }
    }
  };

  const handleCloseModal = () => {
      setShowModal(false);
      // Réinitialiser l'erreur quand on ferme manuellement
      setErrorMessage('');
  }

  return (
    <div>
      <h2 className="mb-4">Gestion des Réclamations</h2>
      <p className="text-muted">Valider ou rejeter les réponses proposées par les employés.</p>

      {/* Afficher l'erreur principale */}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">Réclamations à Traiter</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
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
                {/* Indicateur de chargement */}
                {loading && (
                  <tr><td colSpan={5} className="text-center p-4">Chargement...</td></tr>
                )}
                {/* Affichage si pas de réclamations */}
                {!loading && claims.length === 0 && (
                  <tr><td colSpan={5} className="text-center p-4 text-muted">Aucune réclamation à traiter.</td></tr>
                )}
                {/* Liste des réclamations */}
                {!loading && claims.map((claim) => (
                  <tr key={claim.id_reclamation}> {/* Utiliser la clé primaire de Laravel */}
                    <td className="table-custom-cell">#{claim.id_reclamation}</td>
                    {/* Afficher nom/prénom et ID commande */}
                    <td className="table-custom-cell">
                        {claim.utilisateur?.prenom} {claim.utilisateur?.nom}
                        {claim.id_commande && <small className="d-block text-muted">Cde: #{claim.id_commande}</small>}
                    </td>
                    <td className="table-custom-cell">{claim.description}</td>
                    <td className="table-custom-cell">
                      {claim.reponse
                        ? <em className="text-primary">"{claim.reponse}"</em>
                        : <span className="text-muted">Pas de réponse</span>}
                    </td>
                    <td className="table-custom-cell">
                      <button
                        className="btn btn-primary btn-sm me-2"
                        onClick={() => handleActionClick(claim, 'validate')}
                        disabled={!claim.reponse || claim.statut !== 'En cours'} // Désactiver si pas de réponse ou déjà traitée
                      >
                        Valider
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleActionClick(claim, 'reject')}
                        disabled={!claim.reponse || claim.statut !== 'En cours'} // Désactiver si pas de réponse ou déjà traitée
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
          <small className="text-muted">{selectedClaim?.reponse}</small>
           {/* Afficher l'erreur dans la modale si elle survient pendant la confirmation */}
           {errorMessage && <div className="alert alert-danger mt-2">{errorMessage}</div>}
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