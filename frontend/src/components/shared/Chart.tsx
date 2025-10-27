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

  // MODIFICATION : Configuration par défaut (THÈME CLAIR)
  const defaultOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: type === 'doughnut',
        position: 'bottom',
        labels: {
          color: '#6B7280', // Texte gris (muet)
          padding: 15,
          font: { size: 11 }
        }
      },
      tooltip: {
        backgroundColor: '#ffffff', // Fond blanc
        titleColor: '#1F2937', // Texte foncé
        bodyColor: '#374151',
        borderColor: '#E5E7EB', // Bordure grise
        borderWidth: 1,
        bodyFont: { weight: 'bold' },
        titleFont: { weight: 'bold' }
      }
    },
    scales: type !== 'doughnut' ? {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' }, // Grille claire
        ticks: {
            color: '#6B7280', // Texte gris
            maxTicksLimit: 6,
        },
        ...(options?.scales?.y)
      },
      x: {
        grid: {
          color: 'transparent', // Pas de grille X
          display: type !== 'bar'
        },
        ticks: { color: '#6B7280' } // Texte gris
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