// src/pages/employee/EmployeeDashboard.tsx
import React, { useEffect, useState } from 'react';
import AOS from 'aos';
import { PageHeader } from '../../components/shared/PageHeader';
import { InfoTile } from '../../components/shared/InfoTile';
import { InfoTileRow } from '../../components/shared/InfoTileRow';
import { RecentClaimsWidget } from '../../components/shared/RecentClaimsWidget';
import apiClient from '../../apiClient'; // <<< CORRECTION: Import d'apiClient

// Interface (correspond à l'API)
interface EmployeeDashboardData {
  ordersTodayCount: number;
  activeTasksCount: number;
  menuItemsAvailable: number;
  satisfactionScore: number;
}
// SUPPRIMER LES MOCK DATA
// const mockDashboardData: EmployeeDashboardData = { ... };

export const EmployeeDashboard: React.FC = () => {
  // Nouveaux états
  const [data, setData] = useState<EmployeeDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = import.meta.env.VITE_API_URL; // (apiUrl n'est plus nécessaire si on utilise apiClient)

  // Fonction d'animation (vous l'avez déjà)
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

  useEffect(() => {
    AOS.init({ duration: 800, once: true, offset: 100 });

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // <<< CORRECTION: Utilisation d'apiClient au lieu de fetch >>>
            const response = await apiClient.get<EmployeeDashboardData>('/dashboard-stats');
            const apiData = response.data; // La réponse d'Axios est dans .data
            // --- Fin de la correction ---
            
            setData(apiData);
            
            // Lancer les animations APRÈS le fetch
            setTimeout(() => {
                animateCounter(document.getElementById('live-orders'), apiData.ordersTodayCount ?? 0);
                animateCounter(document.getElementById('active-tasks'), apiData.activeTasksCount ?? 0);
                animateCounter(document.getElementById('menu-items'), apiData.menuItemsAvailable ?? 0);
                animateCounter(document.getElementById('satisfaction'), apiData.satisfactionScore ?? 0);
            }, 300); // Laisse le temps au DOM de se mettre à jour

        } catch (err: any) {
            // <<< CORRECTION: Gestion d'erreur Axios >>>
            const message = err.response?.data?.message || err.message || "Impossible de charger les statistiques.";
            setError(message);
            // --- Fin de la correction ---

            // Charger des données par défaut en cas d'erreur
            const defaultData = { ordersTodayCount: 0, activeTasksCount: 0, menuItemsAvailable: 0, satisfactionScore: 0 };
            setData(defaultData);
            // Animer les zéros
             setTimeout(() => {
                animateCounter(document.getElementById('live-orders'), defaultData.ordersTodayCount);
                animateCounter(document.getElementById('active-tasks'), defaultData.activeTasksCount);
                animateCounter(document.getElementById('menu-items'), defaultData.menuItemsAvailable);
                animateCounter(document.getElementById('satisfaction'), defaultData.satisfactionScore);
            }, 300);
        } finally {
            setLoading(false);
        }
    };

    fetchDashboardData();
    
  }, []); // Dépendance à apiUrl supprimée

  return (
    <div>
      <PageHeader
        title="Accueil Employé"
        subtitle="Votre espace de travail quotidien."
      />

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Affiche les tuiles (même pendant le chargement) ou un loader */}
      {(loading || data) && (
        <InfoTileRow data-aos="fade-up" data-aos-delay="100" className="mb-4">
          <InfoTile
            value={<span id="live-orders">{loading ? '...' : data?.ordersTodayCount}</span>}
            label="Commandes (Ajd.)"
            icon={<i className="bi bi-cart-check"></i>}
            iconBgClass="icon-bg-1"
          />
          <InfoTile
            value={<span id="active-tasks">{loading ? '...' : data?.activeTasksCount}</span>}
            label="Tâches Actives"
            icon={<i className="bi bi-list-task"></i>}
            iconBgClass="icon-bg-2"
          />
          <InfoTile
            value={<span id="menu-items">{loading ? '...' : data?.menuItemsAvailable}</span>}
            label="Plats Disponibles"
            icon={<i className="bi bi-journal-text"></i>}
            iconBgClass="icon-bg-4"
          />
          <InfoTile
            value={<>{loading ? '...' : <span id="satisfaction">{data?.satisfactionScore}</span>}%</>}
            label="Satisfaction J-1"
            icon={<i className="bi bi-emoji-smile"></i>}
            iconBgClass="icon-bg-3"
          />
        </InfoTileRow>
      )}

      {/* Reste de la page */}
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