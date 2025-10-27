// src/components/shared/RecentClaimsWidget.tsx
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
// import apiClient from '../../api/apiClient'; // API non requise
// Import corrigé et centralisé
import { getClaimStatusBadgeClass, formatDate } from '../../components/utils/formatters';

// Type simplifié pour un aperçu de réclamation
interface ClaimPreview {
  id_reclamation: number;
  description: string;
  statut: 'Ouverte' | 'En cours' | 'Résolue' | 'Validée' | 'Rejetée';
  date_reclamation: string;
  utilisateur: {
    nom: string;
    prenom?: string;
  }
}

// --- Données Fictives ---
const mockRecentClaims: ClaimPreview[] = [
    {
    id_reclamation: 202,
    description: "Le livreur a mis plus d'une heure à arriver.",
    statut: 'Ouverte',
    date_reclamation: new Date(Date.now() - 5 * 60 * 60000).toISOString(),
    utilisateur: { nom: 'Kouassi', prenom: 'Amina' }
  },
  {
    id_reclamation: 203,
    description: "Il manque un article dans ma commande.",
    statut: 'Ouverte',
    date_reclamation: new Date(Date.now() - 8 * 60 * 60000).toISOString(),
    utilisateur: { nom: 'Ba', prenom: 'Moussa' }
  }
];
// --- Fin Données Fictives ---


export const RecentClaimsWidget: React.FC = () => {
  const [claims, setClaims] = useState<ClaimPreview[]>(mockRecentClaims); // Utilise les mocks
  const [loading, setLoading] = useState(false); // Mis à false
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // const fetchRecentClaims = async () => {
    //   setLoading(true);
    //   setError(null);
    //   try {
    //     // Récupère les 5 réclamations "Ouvertes" les plus récentes
    //     const response = await apiClient.get('/employee/claims', {
    //       params: {
    //         statut: 'Ouverte',
    //         limit: 5,
    //         sortBy: 'date_reclamation',
    //         order: 'desc'
    //       }
    //     });
    //     setClaims(response.data.data || response.data);
    //   } catch (err: any) {
    //     console.error("Erreur chargement aperçu réclamations:", err);
    //     setError("Impossible de charger l'aperçu.");
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchRecentClaims(); // Appel API désactivé
  }, []);

  return (
    <div className="card h-100">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">Réclamations Ouvertes</h5>
        <NavLink to="/employee/claims" className="btn btn-sm btn-outline-primary">
          Voir tout
        </NavLink>
      </div>
      <div className="card-body p-0">
        {loading && <div className="text-center p-4 text-muted">Chargement...</div>}
        {error && <div className="alert alert-danger m-3">{error}</div>}
        
        {!loading && !error && claims.length === 0 && (
          <p className="text-center text-muted p-4 mb-0">Aucune réclamation ouverte.</p>
        )}

        {!loading && !error && claims.length > 0 && (
          <div className="list-group list-group-flush">
            {claims.map((claim) => (
              <NavLink 
                to="/employee/claims" // TODO: Lier à la réclamation spécifique
                key={claim.id_reclamation} 
                className="list-group-item list-group-item-action"
                style={{
                    backgroundColor: 'var(--card-bg)', 
                    color: 'var(--text-color)', 
                    borderBottomColor: 'var(--border-color)'
                }}
              >
                <div className="d-flex w-100 justify-content-between">
                  <h6 className="mb-1 text-primary">
                    #{claim.id_reclamation} - {claim.utilisateur?.prenom} {claim.utilisateur?.nom}
                  </h6>
                  <small className="text-muted">{formatDate(claim.date_reclamation)}</small>
                </div>
                <p className="mb-1" style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%'
                }}>
                  {claim.description}
                </p>
                <small>
                  <span className={`status-badge ${getClaimStatusBadgeClass(claim.statut)}`}>
                    {claim.statut}
                  </span>
                </small>
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};