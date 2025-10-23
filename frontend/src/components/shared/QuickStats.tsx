import React, { useState } from 'react';
import './QuickStats.css';

export const QuickStats: React.FC = () => {
  const [activeTab, setActiveTab] = useState('jour');

  return (
    <div className="quick-stats-card card h-100">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">Statistiques Rapides</h5>
        <div className="tabs-container">
          <button 
            className={`tab-btn ${activeTab === 'jour' ? 'active' : ''}`}
            onClick={() => setActiveTab('jour')}>
            Jour
          </button>
          <button 
            className={`tab-btn ${activeTab === 'semaine' ? 'active' : ''}`}
            onClick={() => setActiveTab('semaine')}>
            Semaine
          </button>
        </div>
      </div>
      <div className="card-body">
        {activeTab === 'jour' ? (
          <div className="stats-content">
            {/* Ventes par Heure */}
            <div className="mb-4">
              <h6 className="stats-subtitle">Ventes par Heure</h6>
              <div className="bar-chart-custom">
                <div className="bar-item">
                  <span className="bar-label">12h-13h</span>
                  <div className="bar-bg"><div className="bar-fg" style={{ width: '100%' }}></div></div>
                  <span className="bar-value">€425</span>
                </div>
                <div className="bar-item">
                  <span className="bar-label">19h-20h</span>
                  <div className="bar-bg"><div className="bar-fg" style={{ width: '85%' }}></div></div>
                  <span className="bar-value">€475</span>
                </div>
                <div className="bar-item">
                  <span className="bar-label">20h-21h</span>
                  <div className="bar-bg"><div className="bar-fg" style={{ width: '70%' }}></div></div>
                  <span className="bar-value">€350</span>
                </div>
              </div>
            </div>
            
            {/* Programme Fidélité */}
            <div>
              <h6 className="stats-subtitle">Programme Fidélité</h6>
              <ul className="stats-list">
                <li><span>Points utilisés</span> <strong>850</strong></li>
                <li><span>Nouveaux parrainages</span> <strong>3</strong></li>
                <li><span>Récompenses données</span> <strong>15</strong></li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center p-3 text-muted">Statistiques de la semaine</div>
        )}
      </div>
    </div>
  );
};