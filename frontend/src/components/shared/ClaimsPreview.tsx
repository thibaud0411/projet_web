import React from 'react';
import './ClaimsPreview.css';

export const ClaimsPreview: React.FC = () => {
  return (
    <div className="claims-card card h-100">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">Réclamations</h5>
        <span className="badge bg-danger-light">4 En attente</span>
      </div>
      <div className="card-body">
        <div className="claim-item">
          <div className="claim-info">
            <p className="claim-title">Commande #1247</p>
            <span className="claim-client">Client: Marie Dubois</span>
          </div>
          <button className="btn btn-outline-secondary btn-sm">Traiter</button>
        </div>
        
        <div className="claim-item">
          <div className="claim-info">
            <p className="claim-title">Commande #1239</p>
            <span className="claim-client">Client: Pierre Martin</span>
          </div>
          <button className="btn btn-outline-secondary btn-sm">Traiter</button>
        </div>
      </div>
    </div>
  );
};