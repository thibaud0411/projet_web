// src/components/shared/QuickStats.tsx

import React, { useState } from 'react';
import './QuickStats.css';

// --- Interfaces (Mises à jour) ---
interface SaleByHour { hour: number; total: number; }
interface SaleByDay { day: number; total: number; } // Ajouté
interface LoyaltyStats { pointsUsed: number; newReferrals: number; rewardsGiven: number; }

interface QuickStatsData {
  salesByHour: SaleByHour[];
  loyaltyStats: LoyaltyStats;
  // Ajout des données de la semaine
  salesByDayOfWeek: SaleByDay[]; 
  loyaltyStatsWeekly: LoyaltyStats;
}
interface QuickStatsProps {
  quickStatsData?: Partial<QuickStatsData> | null; // Partial<> rend les clés optionnelles
  loading: boolean;
}
// --- Fin Interfaces ---


// --- Fonctions utilitaires (Mises à jour) ---

const formatCurrency = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';
    return value.toLocaleString('fr-FR') + ' F CFA';
}

// Fonction générique pour trouver le max
const findMaxTotal = (data: { total: number }[] | undefined): number => {
    if (!data || data.length === 0) return 1;
    return Math.max(...data.map(item => item.total), 1);
}

// --- AJOUT : Traduction des jours de la semaine ---
// (PostgreSQL DOW: 0=Dim, 1=Lun, 2=Mar, 3=Mer, 4=Jeu, 5=Ven, 6=Sam)
// On réorganise pour le graphique (Lun -> Dim)
const WEEK_DAYS_ORDERED = [
    { day: 1, label: 'Lun' },
    { day: 2, label: 'Mar' },
    { day: 3, label: 'Mer' },
    { day: 4, label: 'Jeu' },
    { day: 5, label: 'Ven' },
    { day: 6, label: 'Sam' },
    { day: 0, label: 'Dim' },
];
// --- FIN AJOUT ---


export const QuickStats: React.FC<QuickStatsProps> = ({ quickStatsData, loading }) => {
  const [activeTab, setActiveTab] = useState('jour');

  // --- Accès sécurisé aux données (Jour) ---
  const salesByHourData = quickStatsData?.salesByHour || [];
  const loyaltyData = quickStatsData?.loyaltyStats;
  const maxSalesTotal = findMaxTotal(salesByHourData);
  const topSalesHours = salesByHourData.slice(0, 3); // Garde le top 3 pour le jour

  // --- AJOUT : Accès sécurisé aux données (Semaine) ---
  const salesByDayData = quickStatsData?.salesByDayOfWeek || [];
  const loyaltyDataWeekly = quickStatsData?.loyaltyStatsWeekly;
  const maxWeeklySalesTotal = findMaxTotal(salesByDayData);
  
  // Crée un map pour un accès facile (ex: {0: 15000, 1: 30000})
  const salesByDayMap = new Map(salesByDayData.map(item => [item.day, item.total]));
  // --- FIN AJOUT ---

  return (
    <div className="quick-stats-card card h-100">
      {/* En-tête avec onglets (inchangé) */}
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">Statistiques Rapides</h5>
        <div className="tabs-container">
          <button className={`tab-btn ${activeTab === 'jour' ? 'active' : ''}`} onClick={() => setActiveTab('jour')}>Jour</button>
          <button className={`tab-btn ${activeTab === 'semaine' ? 'active' : ''}`} onClick={() => setActiveTab('semaine')}>Semaine</button>
        </div>
      </div>
      <div className="card-body">
        {loading && <p className="text-center text-muted">Chargement...</p>}

        {/* --- Affichage Jour --- */}
        {!loading && activeTab === 'jour' && quickStatsData && (
          <div className="stats-content">
            {/* Graphique Ventes (Jour) */}
            <div className="mb-4">
              <h6 className="stats-subtitle">Top Ventes par Heure (Ajd.)</h6>
              {topSalesHours.length > 0 ? (
                 <div className="bar-chart-custom">
                    {topSalesHours.map((item) => (
                      <div className="bar-item" key={item.hour}>
                        <span className="bar-label">{item.hour}h-{item.hour + 1}h</span>
                        <div className="bar-bg">
                            <div className="bar-fg" style={{ width: `${maxSalesTotal > 0 ? (item.total / maxSalesTotal) * 100 : 0}%` }}></div>
                        </div>
                        <span className="bar-value">{formatCurrency(item.total)}</span>
                      </div>
                    ))}
                 </div>
              ) : ( <p className="text-muted"><small>Pas de ventes enregistrées aujourd'hui.</small></p> )}
            </div>

            {/* Programme Fidélité (Jour) (inchangé) */}
            <div>
              <h6 className="stats-subtitle">Programme Fidélité (Ajd.)</h6>
              {loyaltyData ? (
                <ul className="stats-list">
                  <li><span>Points utilisés</span> <strong>{loyaltyData?.pointsUsed ?? 0}</strong></li>
                  <li><span>Nouveaux parrainages</span> <strong>{loyaltyData?.newReferrals ?? 0}</strong></li>
                  <li><span>Récompenses données</span> <strong>{loyaltyData?.rewardsGiven ?? 0}</strong></li>
                </ul>
              ) : ( <p className="text-muted"><small>Données de fidélité non disponibles.</small></p> )}
            </div>
          </div>
        )}

        {/* --- DÉBUT MODIFICATION : Affichage Semaine --- */}
        {!loading && activeTab === 'semaine' && quickStatsData && (
           <div className="stats-content">
            {/* Graphique Ventes (Semaine) */}
            <div className="mb-4">
              <h6 className="stats-subtitle">Ventes par Jour (Cette Semaine)</h6>
              {salesByDayData.length > 0 ? (
                 <div className="bar-chart-custom">
                    {/* On boucle sur les jours de la semaine (Lun-Dim) */}
                    {WEEK_DAYS_ORDERED.map((dayInfo) => {
                      const totalDuJour = salesByDayMap.get(dayInfo.day) || 0;
                      return (
                        <div className="bar-item" key={dayInfo.day}>
                          <span className="bar-label">{dayInfo.label}</span>
                          <div className="bar-bg">
                              <div className="bar-fg" style={{ width: `${maxWeeklySalesTotal > 0 ? (totalDuJour / maxWeeklySalesTotal) * 100 : 0}%` }}></div>
                          </div>
                          <span className="bar-value">{formatCurrency(totalDuJour)}</span>
                        </div>
                      );
                    })}
                 </div>
              ) : ( <p className="text-muted"><small>Pas de ventes enregistrées cette semaine.</small></p> )}
            </div>

            {/* Programme Fidélité (Semaine) */}
            <div>
              <h6 className="stats-subtitle">Programme Fidélité (Cette Semaine)</h6>
              {loyaltyDataWeekly ? (
                <ul className="stats-list">
                  <li><span>Points utilisés</span> <strong>{loyaltyDataWeekly?.pointsUsed ?? 0}</strong></li>
                  <li><span>Nouveaux parrainages</span> <strong>{loyaltyDataWeekly?.newReferrals ?? 0}</strong></li>
                  <li><span>Récompenses données</span> <strong>{loyaltyDataWeekly?.rewardsGiven ?? 0}</strong></li>
                </ul>
              ) : ( <p className="text-muted"><small>Données de fidélité non disponibles.</small></p> )}
            </div>
          </div>
        )}
        {/* --- FIN MODIFICATION --- */}


        {/* Message si pas de données (inchangé) */}
         {!loading && !quickStatsData && (
            <p className="text-center text-muted">Données non disponibles.</p>
         )}
      </div>
    </div>
  );
};