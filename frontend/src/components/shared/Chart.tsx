// src/components/shared/Chart.tsx
import React, { useRef, useEffect } from 'react';
import { 
  Chart, 
  registerables, 
  type ChartConfiguration, 
  type ChartType
} from 'chart.js';

// Enregistrer tous les composants nécessaires
Chart.register(...registerables);

interface ChartComponentProps {
  data: ChartConfiguration['data'];
  type: ChartType;
  options?: ChartConfiguration['options'];
  onChartReady?: (chartInstance: Chart) => void;
}

const ChartComponent: React.FC<ChartComponentProps> = ({ data, type, options, onChartReady }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null); // Le ref pour garder l'instance

  // Configuration par défaut (THÈME CLAIR/MAQUETTE)
  const defaultOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: type === 'doughnut',
        position: 'bottom',
        labels: {
          color: 'var(--color-text-secondary)',
          padding: 15,
          font: { size: 12, family: 'var(--font-family-sans)' }
        }
      },
      tooltip: {
        backgroundColor: 'var(--color-text-primary)',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: 'var(--color-border)',
        borderWidth: 1,
        bodyFont: { weight: 'bold', family: 'var(--font-family-sans)' },
        titleFont: { weight: 'bold', family: 'var(--font-family-sans)' },
        cornerRadius: 8, // 8px
        padding: 10,
      }
    },
    scales: type !== 'doughnut' ? {
      y: {
        beginAtZero: true,
        grid: { color: 'var(--color-border)' },
        ticks: {
            color: 'var(--color-text-secondary)',
            maxTicksLimit: 6,
            font: { family: 'var(--font-family-sans)' }
        },
        ...(options?.scales?.y)
      },
      x: {
        grid: {
          color: 'transparent',
          display: type !== 'bar'
        },
        ticks: { 
          color: 'var(--color-text-secondary)',
          font: { family: 'var(--font-family-sans)' }
        }
      }
    } : {}
  };

  // Ce hook gère TOUT : création, mise à jour, destruction
  useEffect(() => {
    if (!chartRef.current) return;

    // 1. Détruit l'instance précédente si elle existe
    // C'est le bloc que vous avez mentionné
    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }

    // 2. Crée la nouvelle instance de graphique
    try {
      const config: ChartConfiguration = {
         type: type,
         data: data,
         options: { ...defaultOptions, ...options } // Fusionne les options
      };
      
      // Crée et stocke la nouvelle instance dans le ref
      const newChartInstance = new Chart(chartRef.current, config);
      chartInstance.current = newChartInstance;

      if (onChartReady) {
        onChartReady(newChartInstance);
      }
    } catch (error) {
      console.error('Erreur création graphique:', error);
    }

    // 3. Fonction de nettoyage
    // Sera appelée lorsque le composant est retiré (démonté)
    // ou JUSTE AVANT que cet effet ne se ré-exécute (si data, type, etc. changent)
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [data, type, options, onChartReady]); // Se ré-exécute si ces props changent

  return <canvas ref={chartRef} />;
};

export default ChartComponent;