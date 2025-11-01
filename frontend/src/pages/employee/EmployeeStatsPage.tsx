// src/pages/employee/EmployeeStatsPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import AOS from 'aos';
import { type ChartConfiguration, Chart } from 'chart.js';
import ChartComponent from '../../components/shared/Chart';
import { PageHeader } from '../../components/shared/PageHeader';
import './EmployeeMenuPage.css';

// --- Types et Données Fictives (inchangés) ---
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
const mockStatsData: EmployeeStatsData = {
  ordersProcessed: {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [{
      label: 'Commandes Traitées',
      data: [15, 22, 18, 25, 20, 30, 28],
      borderColor: '#000000',
      backgroundColor: 'rgba(0,0,0,0.1)',
      tension: 0.4,
      fill: true
    }]
  },
  averageHandlingTime: {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [{
      label: 'Temps Moyen (min)',
      data: [5.2, 4.8, 5.5, 4.5, 5.0, 6.1, 5.3],
      backgroundColor: '#FEF6E6'
    }]
  },
  claimsHandled: {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [{
      label: 'Réclamations Traitées',
      data: [3, 1, 5, 2, 4, 1, 0],
      backgroundColor: '#F3E8FF'
    }]
  }
};
// --- Fin Données Fictives ---


export const EmployeeStatsPage: React.FC = () => {
  const [statsData, setStatsData] = useState<EmployeeStatsData | null>(mockStatsData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePeriod, setActivePeriod] = useState('7jours');

  useEffect(() => {
    AOS.init({ duration: 800, once: true, offset: 100 });
  }, [activePeriod]);


  const handlePeriodChange = (period: string) => {
    setActivePeriod(period);
  };

  const lineChartOptions: ChartConfiguration['options'] = {
     plugins: { legend: { display: false } },
  };
  const barChartOptions: ChartConfiguration['options'] = {
     plugins: { legend: { display: false } },
  };


  return (
    <div>
      <PageHeader
        title="Vos Statistiques"
        subtitle="Suivez votre performance."
        actionButton={
          <div className="filter-buttons">
             <button
                type="button"
                className={`btn-filter ${activePeriod === 'jour' ? 'active' : ''}`}
                onClick={() => handlePeriodChange('jour')}
             >
               Jour
             </button>
             <button
                type="button"
                className={`btn-filter ${activePeriod === '7jours' ? 'active' : ''}`}
                onClick={() => handlePeriodChange('7jours')}
             >
               7 Jours
             </button>
             <button
                type="button"
                className={`btn-filter ${activePeriod === 'mois' ? 'active' : ''}`}
                onClick={() => handlePeriodChange('mois')}
             >
               Mois
             </button>
         </div>
        }
      />

       {loading && <div className="text-center p-5">Chargement...</div>}
       {error && <div className="alert alert-danger">{error}</div>}

       {!loading && statsData && (
          // --- MODIFIÉ : Ajout de "mb-4" pour l'espacement ---
          <div className="row g-4 mb-4"> 
            
            <div className="col-lg-12" data-aos="fade-up" data-aos-delay="100">
                <div className="card h-100">
                    <div className="card-header"><h5 className="card-title">Commandes Traitées</h5></div>
                    <div className="card-body">
                       <div style={{ height: '350px' }}>
                           {statsData.ordersProcessed ? (
                               <ChartComponent
                                   type="line"
                                   data={statsData.ordersProcessed}
                                   options={lineChartOptions}
                               />
                           ) : <p>Données indisponibles.</p>}
                       </div>
                    </div>
                </div>
            </div>

            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="200">
                <div className="card h-100">
                    <div className="card-header"><h5 className="card-title">Temps Moyen de Traitement (min)</h5></div>
                    <div className="card-body">
                        <div style={{ height: '300px' }}>
                            {statsData.averageHandlingTime ? (
                                <ChartComponent
                                    type="bar"
                                    data={statsData.averageHandlingTime}
                                    options={barChartOptions}
                                />
                             ) : <p>Données indisponibles.</p>}
                        </div>
                    </div>
                </div>
            </div>

             <div className="col-lg-6" data-aos="fade-up" data-aos-delay="300">
                <div className="card h-100">
                    <div className="card-header"><h5 className="card-title">Réclamations Traitées</h5></div>
                    <div className="card-body">
                        <div style={{ height: '300px' }}>
                            {statsData.claimsHandled ? (
                                <ChartComponent
                                    type="bar"
                                    data={statsData.claimsHandled}
                                    options={barChartOptions}
                                />
                             ) : <p>Données indisponibles.</p>}
                        </div>
                    </div>
                </div>
            </div>

          </div>
       )}
    </div>
  );
};