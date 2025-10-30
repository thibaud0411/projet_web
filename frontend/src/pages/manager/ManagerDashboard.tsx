import React from 'react';
import { QuickStats } from '../../components/shared/QuickStats';
import { RecentOrdersTable } from '../../components/shared/RecentOrdersTable';
import { ClaimsPreview } from '../../components/shared/ClaimsPreview';

export const ManagerDashboard: React.FC = () => {
  return (
    <div>
      <h2 className="mb-4">Tableau de bord - Gérant</h2>
      
      {/* 1. Les Stats Rapides */}
      <QuickStats />
      
      <div className="row g-4 mt-3">
        {/* 2. Le tableau des commandes (maintenant 70% de la largeur) */}
        <div className="col-lg-8">
          <RecentOrdersTable />
        </div>
        
        {/* 3. L'aperçu des réclamations (maintenant 30% de la largeur) */}
        <div className="col-lg-4">
          <ClaimsPreview />
        </div>
      </div>
    </div>
  );
};