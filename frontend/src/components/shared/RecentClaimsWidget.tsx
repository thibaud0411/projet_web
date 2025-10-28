// src/components/shared/RecentClaimsWidget.tsx
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './RecentClaimsWidget.css';
import { getClaimStatusBadgeClass, formatDate } from '../../components/utils/formatters';

// --- Types et Données Fictives (inchangées) ---
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
  const [claims, setClaims] = useState<ClaimPreview[]>(mockRecentClaims);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ... (logique de fetch désactivée inchangée) ...
  }, []);

  return (
    <div className="card h-100">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">Réclamations Ouvertes</h5>
        
        {/* --- MODIFIÉ : btn-outline-primary -> btn-outline-secondary --- */}
        <NavLink to="/employee/claims" className="btn btn-sm btn-outline-secondary">
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
                to="/employee/claims" 
                key={claim.id_reclamation} 
                className="list-group-item list-group-item-action"
                style={{
                    backgroundColor: 'var(--card-bg)', 
                    color: 'var(--text-color)', 
                    borderBottomColor: 'var(--border-color)'
                }}
              >
                <div className="d-flex w-100 justify-content-between">
                  <h6 className="mb-1" style={{ color: 'var(--color-text-primary)'}}>
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
                  <span className={`badge ${getClaimStatusBadgeClass(claim.statut)}`}>
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
};s