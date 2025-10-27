// src/pages/employee/EmployeeDashboard.tsx
import React, { useEffect, useState } from 'react';
import AOS from 'aos';
// import apiClient from '../../api/apiClient'; // API non requise pour l'instant
import { PageHeader } from '../../components/shared/PageHeader';
import { InfoTile } from '../../components/shared/InfoTile';
import { InfoTileRow } from '../../components/shared/InfoTileRow';
import { RecentClaimsWidget } from '../../components/shared/RecentClaimsWidget';

// Interface pour les données du dashboard employé
interface EmployeeDashboardData {
  ordersTodayCount?: number;
  activeTasksCount?: number;
  menuItemsAvailable?: number;
  satisfactionScore?: number;
}

// --- Données Fictives ---
const mockDashboardData: EmployeeDashboardData = {
  ordersTodayCount: 12,
  activeTasksCount: 5,
  menuItemsAvailable: 23,
  satisfactionScore: 92,
};
// --- Fin Données Fictives ---

export const EmployeeDashboard: React.FC = () => {
  const [data, setData] = useState<EmployeeDashboardData | null>(mockDashboardData); // Utilise les mocks
  const [loading, setLoading] = useState(false); // Mis à false
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    AOS.init({ duration: 800, once: true, offset: 100 });

    /*
    // Logique de fetch (mise en commentaire)
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get('/employee/dashboard-stats');
        setData(response.data);
      } catch (err: any) {
        console.error("Erreur chargement dashboard employé:", err);
        setError("Impossible de charger les données.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
    */

    // --- Animation des compteurs (gardée) ---
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

    // Lance l'animation
    if (data) {
        setTimeout(() => {
           animateCounter(document.getElementById('live-orders'), data.ordersTodayCount ?? 0);
           animateCounter(document.getElementById('active-tasks'), data.activeTasksCount ?? 0);
           animateCounter(document.getElementById('menu-items'), data.menuItemsAvailable ?? 0);
           animateCounter(document.getElementById('satisfaction'), data.satisfactionScore ?? 0);
        }, 500); // Léger délai pour l'effet
    }

  }, [data]); // Se relance si data change pour animer

  return (
    <div>
      {/* Utilise le PageHeader partagé existant */}
      <PageHeader
        title="Accueil Employé"
        subtitle="Votre espace de travail quotidien."
      />

      {loading && <p>Chargement...</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* SECTION MODIFIÉE : Utilise InfoTileRow et InfoTile */}
      {!loading && data && (
        <InfoTileRow data-aos="fade-up" data-aos-delay="100">
          
          <InfoTile
            value={<span id="live-orders">{data.ordersTodayCount ?? 0}</span>}
            label="Commandes (Ajd.)"
          />
          <InfoTile
            value={<span id="active-tasks">{data.activeTasksCount ?? 0}</span>}
            label="Tâches Actives"
          />
          <InfoTile
            value={<span id="menu-items">{data.menuItemsAvailable ?? 0}</span>}
            label="Plats Disponibles"
          />
          <InfoTile
            value={<><span id="satisfaction">{data.satisfactionScore ?? 'N/A'}</span>%</>}
            label="Satisfaction J-1"
          />
       
        </InfoTileRow>
      )}

      {/* SECTION MODIFIÉE : Utilise RecentClaimsWidget */}
      <div className="row g-4">
         <div className="col-lg-8" data-aos="fade-up" data-aos-delay="200">
            {/* Le composant dynamique est appelé ici */}
            <RecentClaimsWidget />
         </div>
         <div className="col-lg-4" data-aos="fade-up" data-aos-delay="300">
             <div className="card h-100"> {/* h-100 pour s'aligner sur RecentClaimsWidget */}
                 <div className="card-header"><h5 className="card-title mb-0">Tâches Rapides</h5></div>
                 <div className="card-body">
                    <p className="text-muted">Liens ou boutons pour les actions fréquentes.</p>
                    {/* TODO: Lier ces boutons avec react-router-dom (Link) */}
                    <button className="btn btn-outline-primary w-100 mb-2">Voir Menu du Jour</button>
                    <button className="btn btn-outline-secondary w-100">Signaler un problème</button>
                 </div>
             </div>
         </div>
      </div>

    </div>
  );
};