// src/components/shared/Chart.tsx
import React, { useRef, useEffect, useCallback } from 'react';
import { 
  Chart, 
  registerables, 
  type ChartConfiguration, 
  type ChartType // <-- CORRECTION: Remplacer ChartTypeRegistry par ChartType
 // <-- CORRECTION: Remplacer ChartTypeRegistry par ChartType
} from 'chart.js';

// Enregistrer tous les composants nécessaires
Chart.register(...registerables);

interface ChartComponentProps {
  data: ChartConfiguration['data'];
  type: ChartType; // <-- CORRECTION: Utiliser ChartType
  options?: ChartConfiguration['options'];
  onChartReady?: (chartInstance: Chart) => void;
}

const ChartComponent: React.FC<ChartComponentProps> = ({ data, type, options, onChartReady }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  // Configuration par défaut (adaptée du style sombre de l'ancien projet)
  const defaultOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: type === 'doughnut',
        position: 'bottom',
        labels: {
          color: '#aaa', // Couleur du thème sombre
          padding: 15,
          font: { size: 11 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(26, 26, 26, 0.9)', // Thème sombre
        titleColor: '#cfbd97',
        bodyColor: '#ffffff',
        borderColor: '#cfbd97',
        borderWidth: 1
      }
    },
    scales: type !== 'doughnut' ? {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.1)' }, // Thème sombre
        ticks: {
            color: '#aaa', // Thème sombre
            maxTicksLimit: 6,
        },
        ...(options?.scales?.y) // Permet de surcharger via les props
      },
      x: {
        grid: {
          color: type === 'bar' ? 'transparent' : 'rgba(255, 255, 255, 0.1)', // Thème sombre
          display: type !== 'bar'
        },
        ticks: { color: '#aaa' } // Thème sombre
      }
    } : {}
  };

  const initializeChart = useCallback(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    try {
        const config: ChartConfiguration = {
           type: type,
           data: data,
           options: { ...defaultOptions, ...options } // Fusionne les options
        };
      chartInstance.current = new Chart(chartRef.current, config);

      if (onChartReady) {
        onChartReady(chartInstance.current);
      }
    } catch (error) {
      console.error('Erreur création graphique:', error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, type, options]); // Recrée si data, type ou options changent

  // Nettoyage
  useEffect(() => {
    initializeChart(); // Initialise
    return () => { // Nettoie au démontage
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [initializeChart]); // Exécute seulement quand initializeChart change

  return <canvas ref={chartRef} />;
};

export default ChartComponent;