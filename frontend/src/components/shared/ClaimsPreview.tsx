// src/components/shared/ClaimsPreview.tsx

import React, { useState, useEffect } from 'react'; // Importer les hooks
import { Link } from 'react-router-dom'; // Importer Link pour la navigation
import apiClient from '../../apiClient'; // Importer apiClient
import './ClaimsPreview.css';

// --- Interface Claim (peut être importée depuis ClaimsValidationPage si elle est globale) ---
interface Utilisateur {
  id_utilisateur: number;
  nom: string;
  prenom: string;
}
interface Claim {
  id_reclamation: number;
  id_commande: number | null;
  description: string;
  reponse: string | null;
  statut: 'Ouverte' | 'En cours' | 'Résolue' | 'Validée' | 'Rejetée';
  date_reclamation: string;
  utilisateur: Utilisateur;
}
// --- Fin Interface ---

export const ClaimsPreview: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- Chargement des données ---
  useEffect(() => {
    const fetchRecentClaims = async () => {
      setLoading(true);
      setError('');
      try {
        // On récupère toutes les réclamations ouvertes ou en cours
        const response = await apiClient.get<Claim[]>('/claims');
        // On ne garde que les plus récentes pour l'aperçu (ex: les 5 dernières)
        setClaims(response.data.slice(0, 5));
      } catch (err: any) {
        console.error("Erreur chargement aperçu réclamations:", err);
        setError("Impossible de charger l'aperçu.");
      } finally {
        setLoading(false);
      }
    };
    fetchRecentClaims();
  }, []); // [] = exécuter une seule fois

  // Calculer le nombre de réclamations en attente (Ouverte ou En cours)
  const pendingClaimsCount = claims.filter(c => c.statut === 'Ouverte' || c.statut === 'En cours').length;

  return (
    // On garde h-100 pour que la carte prenne toute la hauteur disponible
    <div className="claims-card card h-100">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">Réclamations</h5>
        {/* Afficher le nombre réel de réclamations en attente */}
        {!loading && !error && (
          <span className={`badge ${pendingClaimsCount > 0 ? 'bg-danger-light' : 'bg-success-light'}`}>
            {pendingClaimsCount > 0 ? `${pendingClaimsCount} En attente` : 'Aucune en attente'}
          </span>
        )}
         {/* Afficher un badge d'erreur si le chargement échoue */}
         {error && <span className="badge bg-secondary-light">Erreur</span>}
      </div>
      <div className="card-body">
        {/* Affichage pendant le chargement */}
        {loading && <p className="text-center text-muted">Chargement...</p>}

        {/* Affichage en cas d'erreur */}
        {error && <p className="text-center text-danger">{error}</p>}

        {/* Affichage si aucune réclamation (même après chargement) */}
        {!loading && !error && claims.length === 0 && (
          <p className="text-center text-muted">Aucune réclamation récente.</p>
        )}

        {/* Affichage des réclamations (limité aux 2 premières pour l'aperçu) */}
        {!loading && !error && claims.slice(0, 2).map((claim) => (
          <div className="claim-item" key={claim.id_reclamation}>
            <div className="claim-info">
              {/* Afficher l'ID de commande si disponible */}
              <p className="claim-title">
                {claim.id_commande ? `Commande #${claim.id_commande}` : `Réclamation #${claim.id_reclamation}`}
              </p>
              {/* Afficher le nom du client */}
              <span className="claim-client">Client: {claim.utilisateur?.prenom} {claim.utilisateur?.nom}</span>
            </div>
            {/* Lien vers la page de gestion complète */}
            <Link to="/manager/claims" className="btn btn-outline-secondary btn-sm">Traiter</Link>
          </div>
        ))}

         {/* Ajouter un lien "Voir tout" si plus de 2 réclamations sont chargées */}
         {!loading && !error && claims.length > 2 && (
             <div className="text-center mt-3">
                 <Link to="/manager/claims">Voir toutes les réclamations ({claims.length})</Link>
             </div>
         )}
      </div>
    </div>
  );
};

