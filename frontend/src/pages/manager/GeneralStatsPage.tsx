// src/pages/manager/GeneralStatsPage.tsx

import React, { useState, useEffect } from 'react';
import './GeneralstatsPage.css'; // Attention: peut-être GeneralStatsPage.css ?
import { StatCard } from '../../components/shared/StatCard';
import { QuickStats } from '../../components/shared/QuickStats';
import { ClaimsPreview } from '../../components/shared/ClaimsPreview';
import { RecentOrdersTable } from '../../components/shared/RecentOrdersTable';
import apiClient from '../../apiClient';

// --- INTERFACE DashboardStats CORRIGÉE ---
// Elle doit correspondre exactement à la structure JSON renvoyée par DashboardController.php
interface DashboardStats {
  ordersTodayCount: number;
  totalSalesToday: number;
  newClientsTodayCount: number;
  loyaltyPointsEarnedToday: number; // Nom corrigé vs code précédent (était loyaltyPointsDistributedToday)
  quickStats: {
    salesByHour: { hour: number; total: number }[]; // Doit être un tableau d'objets
    loyaltyStats: {
      pointsUsed: number;
      newReferrals: number;
      rewardsGiven: number;
    };
  };
  // Ajout optionnel des stats de la veille pour calculer les variations
  ordersYesterdayCount?: number;
  totalSalesYesterday?: number;
}
// --- FIN CORRECTION INTERFACE ---

export const GeneralStatsPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Fetch des statistiques (inchangé)
  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get<DashboardStats>('/dashboard/stats');
        setStats(response.data);
      } catch (err: any) {
        console.error("Erreur chargement statistiques dashboard:", err);
        setError(err.response?.data?.message || "Impossible de charger les statistiques.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  // Fonction formatage monétaire (inchangée)
  const formatCurrency = (value: number | null | undefined): string => {
      if (value === null || value === undefined || isNaN(value)) return 'N/A';
      // Utilisation de XAF pour FCFA
      return value.toLocaleString('fr-FR') + ' F CFA';
  }

   // --- Calcul des variations (Exemple) ---
   const calculateChangePercentage = (current: number | undefined, previous: number | undefined): string => {
       if (current === undefined || previous === undefined || previous === 0) {
           return ""; // Pas de variation si données manquantes ou si le précédent est 0
       }
       const change = ((current - previous) / previous) * 100;
       if (change > 0) return `+${change.toFixed(0)}% vs hier`;
       if (change < 0) return `${change.toFixed(0)}% vs hier`;
       return "Stable vs hier";
   };

    const getChangeColor = (current: number | undefined, previous: number | undefined): 'text-success' | 'text-danger' | 'text-muted' => {
        if (current === undefined || previous === undefined || previous === 0 || current === previous) {
            return 'text-muted';
        }
        return current > previous ? 'text-success' : 'text-danger';
    };

  return (
    <div className="dashboard-container">
      {/* Titre (inchangé) */}
      <div className="dashboard-header">
        <h1>Tableau de Bord Principal</h1>
        <p>Vue d'ensemble de votre restaurant - Aujourd'hui, {currentDate}</p>
      </div>

      {/* Affichage d'erreur (inchangé) */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Indicateur de chargement (inchangé) */}
      {loading && <div className="text-center my-4">Chargement des statistiques...</div>}

      {/* Section 1: Cartes de stats (avec variations si possible) */}
      {!loading && stats && (
        <div className="row g-4">
          <div className="col-lg-3 col-md-6">
            <StatCard
              title="Commandes Aujourd'hui"
              value={stats.ordersTodayCount?.toString() ?? '0'}
              // Calcul de la variation
              changeText={calculateChangePercentage(stats.ordersTodayCount, stats.ordersYesterdayCount)}
              changeColor={getChangeColor(stats.ordersTodayCount, stats.ordersYesterdayCount)}
              iconClass="bi bi-receipt"
              iconBgColor="#FEF3C7" // Jaune clair
            />
          </div>
          <div className="col-lg-3 col-md-6">
            <StatCard
              title="Ventes Totales"
              value={formatCurrency(stats.totalSalesToday)}
              // Calcul de la variation
              changeText={calculateChangePercentage(stats.totalSalesToday, stats.totalSalesYesterday)}
              changeColor={getChangeColor(stats.totalSalesToday, stats.totalSalesYesterday)}
              iconClass="bi bi-cash-stack" // Icône plus générique pour l'argent
              iconBgColor="#E0E7FF" // Bleu clair
            />
          </div>
          <div className="col-lg-3 col-md-6">
            <StatCard
              title="Nouveaux Clients"
              value={stats.newClientsTodayCount?.toString() ?? '0'}
              changeText="" // Pas de calcul de variation pour l'instant
              changeColor="text-muted"
              iconClass="bi bi-person-plus-fill"
              iconBgColor="#E0F2FE" // Bleu ciel
            />
          </div>
          <div className="col-lg-3 col-md-6">
            <StatCard
              title="Points Fidélité (Gagnés)" // Nom exact de la stat backend
              value={stats.loyaltyPointsEarnedToday?.toString() ?? '0'}
              changeText="Gagnés Aujourd'hui" // Texte plus clair
              changeColor="text-muted"
              iconClass="bi bi-star-fill"
              iconBgColor="#FEE2E2" // Rouge clair
            />
          </div>
        </div>
      )}

      {/* Section 2: Stats Rapides et Réclamations (Maintenant on passe les props à QuickStats) */}
      <div className="row g-4 mt-3">
        <div className="col-lg-7">
          {/* --- PASSAGE DES PROPS CORRIGÉ --- */}
          <QuickStats quickStatsData={stats?.quickStats} loading={loading} />
          {/* --- FIN CORRECTION --- */}
        </div>
        <div className="col-lg-5">
          {/* ClaimsPreview gère son propre chargement */}
          <ClaimsPreview />
        </div>
      </div>

      {/* Section 3: Commandes Récentes (inchangé) */}
      <div className="row g-4 mt-3">
        <div className="col-12">
          {/* RecentOrdersTable gère son propre chargement */}
          <RecentOrdersTable />
        </div>
      </div>
    </div>
  );
};