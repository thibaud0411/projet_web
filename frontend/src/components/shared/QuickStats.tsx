// src/components/shared/QuickStats.tsx

import React, { useState } from 'react';
import './QuickStats.css';

// Interface pour les données reçues
interface SaleByHour {
    hour: number;
    total: number;
}
interface LoyaltyStats {
    pointsUsed: number;
    newReferrals: number;
    rewardsGiven: number;
}
interface QuickStatsData {
    salesByHour: SaleByHour[];
    loyaltyStats: LoyaltyStats; // Garder la structure attendue
}
interface QuickStatsProps {
    quickStatsData?: QuickStatsData | null; // Peut être null ou undefined
    loading: boolean;
}

// Fonction formatage monétaire
const formatCurrency = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';
    // Utilisation de XAF pour FCFA Camerounais
    return value.toLocaleString('fr-FR') + ' F CFA'; // Adapte si nécessaire
}

// Fonction pour trouver le total max pour le graphique
const findMaxTotal = (data: SaleByHour[]): number => {
    if (!data || data.length === 0) return 1;
    return Math.max(...data.map(item => item.total), 1);
}

export const QuickStats: React.FC<QuickStatsProps> = ({ quickStatsData, loading }) => {
  const [activeTab, setActiveTab] = useState('jour');

  // Utilisation de l'optional chaining '?.' pour accéder aux données de manière sûre
  const salesByHourData = quickStatsData?.salesByHour || [];
  const loyaltyData = quickStatsData?.loyaltyStats; // Récupère l'objet loyaltyStats (peut être undefined)

  const maxSalesTotal = findMaxTotal(salesByHourData);
  const topSalesHours = salesByHourData.slice(0, 3);

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
        {loading && <p className="text-center text-muted">Chargement...</p>}

        {!loading && activeTab === 'jour' && quickStatsData && (
          <div className="stats-content">
            {/* Ventes par Heure - Graphique */}
            <div className="mb-4">
              <h6 className="stats-subtitle">Top Ventes par Heure (Ajd.)</h6>
              {topSalesHours.length > 0 ? (
                 <div className="bar-chart-custom">
                    {topSalesHours.map((item) => (
                      <div className="bar-item" key={item.hour}>
                        <span className="bar-label">{item.hour}h-{item.hour + 1}h</span>
                        <div className="bar-bg">
                            <div className="bar-fg" style={{ width: `${(item.total / maxSalesTotal) * 100}%` }}></div>
                        </div>
                        <span className="bar-value">{formatCurrency(item.total)}</span>
                      </div>
                    ))}
                 </div>
              ) : (
                  <p className="text-muted"><small>Pas de ventes enregistrées aujourd'hui.</small></p>
              )}
            </div>

            {/* Programme Fidélité - Liste (avec vérification et optional chaining '?.' ) */}
            <div>
              <h6 className="stats-subtitle">Programme Fidélité (Ajd.)</h6>
              {/* Vérifie si loyaltyData existe avant d'essayer d'afficher */}
              {loyaltyData ? (
                <ul className="stats-list">
                  {/* Utilise '?.' et '?? 0' pour accéder aux propriétés de manière sûre */}
                  <li><span>Points utilisés</span> <strong>{loyaltyData?.pointsUsed ?? 0}</strong></li>
                  <li><span>Nouveaux parrainages</span> <strong>{loyaltyData?.newReferrals ?? 0}</strong></li>
                  <li><span>Récompenses données</span> <strong>{loyaltyData?.rewardsGiven ?? 0}</strong></li>
                </ul>
              ) : (
                   <p className="text-muted"><small>Données de fidélité non disponibles.</small></p>
              )}
            </div>
          </div>
        )}

        {/* Placeholder pour l'onglet Semaine */}
        {!loading && activeTab === 'semaine' && (
          <div className="text-center p-3 text-muted">Statistiques de la semaine (à implémenter).</div>
        )}

        {/* Message si pas de données */}
         {!loading && !quickStatsData && activeTab === 'jour' && (
             <p className="text-center text-muted">Données non disponibles.</p>
         )}
      </div>
    </div>
  );
};