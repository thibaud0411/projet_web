// src/pages/employee/EmployeeDashboard.tsx
import React, { useEffect, useState } from 'react';
import AOS from 'aos';
import { PageHeader } from '../../components/shared/PageHeader';
import { InfoTile } from '../../components/shared/InfoTile';
import { InfoTileRow } from '../../components/shared/InfoTileRow';
import { RecentClaimsWidget } from '../../components/shared/RecentClaimsWidget';

// Interface et Données Fictives (inchangées)
interface EmployeeDashboardData {
  ordersTodayCount?: number;
  activeTasksCount?: number;
  menuItemsAvailable?: number;
  satisfactionScore?: number;
}
const mockDashboardData: EmployeeDashboardData = {
  ordersTodayCount: 12,
  activeTasksCount: 5,
  menuItemsAvailable: 23,
  satisfactionScore: 92,
};
// --- Fin Données Fictives ---

export const EmployeeDashboard: React.FC = () => {
  const [data, setData] = useState<EmployeeDashboardData | null>(mockDashboardData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    AOS.init({ duration: 800, once: true, offset: 100 });
    
    // ... (Logique d'animation des compteurs inchangée) ...
    const animateCounter = (element: HTMLElement | null, target: number, duration = 1500) => {
        if (!element) return;
        let start = 0;
        const increment = target / (duration / 16);
        const timer = setInterval(() => {
          start += increment;
          if (start >= target) {
            element.textContent = target.toString();
            clearInterval(timer);
          } else {
            element.textContent = Math.floor(start).toString();
          }
        }, 16);
      };
    if (data) {
        setTimeout(() => {
           animateCounter(document.getElementById('live-orders'), data.ordersTodayCount ?? 0);
           animateCounter(document.getElementById('active-tasks'), data.activeTasksCount ?? 0);
           animateCounter(document.getElementById('menu-items'), data.menuItemsAvailable ?? 0);
           animateCounter(document.getElementById('satisfaction'), data.satisfactionScore ?? 0);
        }, 500);
    }

  }, [data]);

  return (
    <div>
      {/* PageHeader obtient mb-4 de son propre composant */}
      <PageHeader
        title="Accueil Employé"
        subtitle="Votre espace de travail quotidien."
      />

      {loading && <p>Chargement...</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* --- MODIFIÉ : Ajout de "mb-4" pour l'espacement --- */}
      {!loading && data && (
        <InfoTileRow data-aos="fade-up" data-aos-delay="100" className="mb-4">
          
          <InfoTile
            value={<span id="live-orders">{data.ordersTodayCount ?? 0}</span>}
            label="Commandes (Ajd.)"
            icon={<i className="bi bi-cart-check"></i>}
            iconBgClass="icon-bg-1"
          />
          <InfoTile
            value={<span id="active-tasks">{data.activeTasksCount ?? 0}</span>}
            label="Tâches Actives"
            icon={<i className="bi bi-list-task"></i>}
            iconBgClass="icon-bg-2"
          />
          <InfoTile
            value={<span id="menu-items">{data.menuItemsAvailable ?? 0}</span>}
            label="Plats Disponibles"
            icon={<i className="bi bi-journal-text"></i>}
            iconBgClass="icon-bg-4"
          />
          <InfoTile
            value={<><span id="satisfaction">{data.satisfactionScore ?? 'N/A'}</span>%</>}
            label="Satisfaction J-1"
            icon={<i className="bi bi-emoji-smile"></i>}
            iconBgClass="icon-bg-3"
          />
       
        </InfoTileRow>
      )}

      {/* --- MODIFIÉ : Ajout de "mb-4" pour l'espacement --- */}
      <div className="row g-4 mb-4">
         <div className="col-lg-8" data-aos="fade-up" data-aos-delay="200">
            <RecentClaimsWidget />
         </div>
         <div className="col-lg-4" data-aos="fade-up" data-aos-delay="300">
             <div className="card h-100">
                 <div className="card-header"><h5 className="card-title mb-0">Tâches Rapides</h5></div>
                 <div className="card-body">
                    <p className="text-muted">Liens ou boutons pour les actions fréquentes.</p>
                    <button className="btn btn-outline-secondary w-100 mb-2">Voir Menu du Jour</button>
                    <button className="btn btn-outline-secondary w-100">Signaler un problème</button>
                 </div>
             </div>
         </div>
      </div>

    </div>
  );
};