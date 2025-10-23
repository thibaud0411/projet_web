import React from 'react';
import './GeneralstatsPage.css'; // On importe le CSS pour les styles du titre
import { StatCard } from '../../components/shared/StatCard';
import { QuickStats } from '../../components/shared/QuickStats';
import { ClaimsPreview } from '../../components/shared/ClaimsPreview';
import { RecentOrdersTable } from '../../components/shared/RecentOrdersTable';

// Ce fichier est le "Tableau de Bord Principal"
export const GeneralStatsPage: React.FC = () => {
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="dashboard-container">
      {/* Titre de la page (stylisé par ManagerDashboard.css) */}
      <div className="dashboard-header">
        <h1>Tableau de Bord Principal</h1>
        <p>Vue d'ensemble de votre restaurant - Aujourd'hui, {currentDate}</p>
      </div>

      {/* Section 1: Cartes de stats (stylisées par main.css) */}
      <div className="row g-4">
        <div className="col-lg-3 col-md-6">
          <StatCard
            title="Commandes Aujourd'hui"
            value="47"
            changeText="+12% vs hier"
            changeColor="text-success"
            iconClass="bi bi-receipt"
            iconBgColor="#FEF3C7" // Jaune clair
          />
        </div>
        <div className="col-lg-3 col-md-6">
          <StatCard
            title="Ventes Totales"
            value="€1,847"
            changeText="+8% vs hier"
            changeColor="text-success"
            iconClass="bi bi-currency-euro"
            iconBgColor="#E0E7FF" // Bleu clair
          />
        </div>
        <div className="col-lg-3 col-md-6">
          <StatCard
            title="Nouveaux Clients"
            value="12"
            changeText="+25% vs hier"
            changeColor="text-success"
            iconClass="bi bi-person-plus-fill"
            iconBgColor="#E0F2FE" // Cyan clair
          />
        </div>
        <div className="col-lg-3 col-md-6">
          <StatCard
            title="Points Fidélité"
            value="1,250"
            changeText="Distribués"
            changeColor="text-muted"
            iconClass="bi bi-star-fill"
            iconBgColor="#FEE2E2" // Rouge clair
          />
        </div>
      </div>

      {/* Section 2: Stats Rapides et Réclamations (stylisées par main.css) */}
      <div className="row g-4 mt-3">
        <div className="col-lg-7">
          <QuickStats />
        </div>
        <div className="col-lg-5">
          <ClaimsPreview />
        </div>
      </div>

      {/* Section 3: Commandes Récentes (stylisées par main.css) */}
      <div className="row g-4 mt-3">
        <div className="col-12">
          <RecentOrdersTable />
        </div>
      </div>
    </div>
  );
};