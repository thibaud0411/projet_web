// src/pages/employee/EmployeeStatsPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import AOS from 'aos';
import { type ChartConfiguration, Chart } from 'chart.js';
// import apiClient from '../../api/apiClient'; // API non requise pour l'instant
import ChartComponent from '../../components/shared/Chart';

// --- Types pour les données de statistiques Employé ---
interface ChartData {
  labels: string[];
  datasets: {
    label?: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string | string[];
    tension?: number;
    fill?: boolean;
  }[];
}

interface EmployeeStatsData {
  ordersProcessed: ChartData;
  averageHandlingTime: ChartData;
  claimsHandled: ChartData;
}

// --- Données Fictives ---
const mockStatsData: EmployeeStatsData = {
  ordersProcessed: {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [{
      label: 'Commandes Traitées',
      data: [15, 22, 18, 25, 20, 30, 28],
      borderColor: '#cfbd97',
      tension: 0.4,
      fill: false
    }]
  },
  averageHandlingTime: {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [{
      label: 'Temps Moyen (min)',
      data: [5.2, 4.8, 5.5, 4.5, 5.0, 6.1, 5.3],
      backgroundColor: '#a39473'
    }]
  },
  claimsHandled: {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [{
      label: 'Réclamations Traitées',
      data: [3, 1, 5, 2, 4, 1, 0],
      backgroundColor: '#8e8061'
    }]
  }
};
// --- Fin Données Fictives ---


export const EmployeeStatsPage: React.FC = () => {
  const [statsData, setStatsData] = useState<EmployeeStatsData | null>(mockStatsData); // Utilise les mocks
  const [loading, setLoading] = useState(false); // Mis à false
  const [error, setError] = useState<string | null>(null);
  const [activePeriod, setActivePeriod] = useState('7jours'); // 'jour', '7jours', 'mois'

  const ordersChartInstance = useRef<Chart | null>(null);
  const timeChartInstance = useRef<Chart | null>(null);
  const claimsChartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    AOS.init({ duration: 800, once: true, offset: 100 });
    // fetchStats(); // Appel API désactivé
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePeriod]);

  /*
  // Logique de fetch (mise en commentaire)
  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/employee/stats', {
        params: { period: activePeriod }
      });
      setStatsData(response.data);
    } catch (err: any) {
      console.error("Erreur chargement stats employé:", err);
      setError(err.response?.data?.message || "Impossible de charger les statistiques.");
    } finally {
      setLoading(false);
    }
  };
  */

  const handlePeriodChange = (period: string) => {
    setActivePeriod(period);
    // Simule un re-chargement
    setLoading(true);
    setError(null);
    console.log(`[SIMULATION] Chargement des stats pour: ${period}`);
    setTimeout(() => {
      // Ici, vous pourriez modifier mockStatsData pour refléter la période
      setStatsData(mockStatsData);
      setLoading(false);
    }, 500);
  };

  // --- Configurations Chart.js ---
  const lineChartOptions: ChartConfiguration['options'] = {
     plugins: { legend: { display: false } },
     scales: { y: { beginAtZero: true } }
  };
  const barChartOptions: ChartConfiguration['options'] = {
     plugins: { legend: { display: false } },
     scales: { x: { grid: { display: false } } }
  };


  return (
    <div>
      {/* En-tête */}
      <div className="d-flex justify-content-between align-items-center mb-4" data-aos="fade-up">
         <div>
            <h1 className="h2 page-title mb-1">Vos Statistiques</h1>
            <p className="page-subtitle text-muted mb-0">Suivez votre performance.</p>
         </div>
         {/* Filtre Période */}
         <div className="btn-group btn-group-sm">
             <button type={`button`} className={`btn ${activePeriod === 'jour' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => handlePeriodChange('jour')}>Jour</button>
             <button type={`button`} className={`btn ${activePeriod === '7jours' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => handlePeriodChange('7jours')}>7 Jours</button>
             <button type={`button`} className={`btn ${activePeriod === 'mois' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => handlePeriodChange('mois')}>Mois</button>
         </div>
      </div>

       {loading && <div className="text-center p-5"><span className="spinner-border" role="status"></span> Chargement...</div>}
       {error && <div className="alert alert-danger">{error}</div>}

       {!loading && statsData && (
          <div className="row g-4">
            {/* Graphique 1: Commandes Traitées */}
            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="100">
                <div className="card h-100">
                    <div className="card-header"><h5 className="card-title mb-0">Commandes Traitées</h5></div>
                    <div className="card-body">
                       <div style={{ height: '300px' }}>
                           {statsData.ordersProcessed ? (
                               <ChartComponent
                                   type="line"
                                   data={statsData.ordersProcessed}
                                   options={lineChartOptions}
                                   onChartReady={(instance) => ordersChartInstance.current = instance}
                               />
                           ) : <p className="text-muted text-center pt-5">Données indisponibles.</p>}
                       </div>
                    </div>
                </div>
            </div>

            {/* Graphique 2: Temps Moyen */}
             <div className="col-lg-6" data-aos="fade-up" data-aos-delay="200">
                <div className="card h-100">
                    <div className="card-header"><h5 className="card-title mb-0">Temps Moyen de Traitement (min)</h5></div>
                    <div className="card-body">
                        <div style={{ height: '300px' }}>
                            {statsData.averageHandlingTime ? (
                                <ChartComponent
                                    type="bar"
                                    data={statsData.averageHandlingTime}
                                    options={barChartOptions}
                                    onChartReady={(instance) => timeChartInstance.current = instance}
                                />
                             ) : <p className="text-muted text-center pt-5">Données indisponibles.</p>}
                        </div>
                    </div>
                </div>
            </div>

             {/* Graphique 3: Réclamations Gérées */}
             <div className="col-lg-6" data-aos="fade-up" data-aos-delay="300">
                <div className="card h-100">
                    <div className="card-header"><h5 className="card-title mb-0">Réclamations Traitées</h5></div>
                    <div className="card-body">
                        <div style={{ height: '300px' }}>
                            {statsData.claimsHandled ? (
                                <ChartComponent
                                    type="bar"
                                    data={statsData.claimsHandled}
                                    options={barChartOptions}
                                     onChartReady={(instance) => claimsChartInstance.current = instance}
                                />
                             ) : <p className="text-muted text-center pt-5">Données indisponibles.</p>}
                        </div>
                    </div>
                </div>
            </div>

          </div>
       )}
    </div>
  );
};