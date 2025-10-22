// src/components/Chart.js
import React, { useRef, useEffect, useCallback } from 'react';
import { Chart, registerables } from 'chart.js';

// Enregistrer tous les composants de Chart.js
Chart.register(...registerables);

const ChartComponent = ({ data, type, options, onChartReady }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Configuration par défaut pour les graphiques
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: type === 'doughnut',
        position: 'bottom',
        labels: {
          color: '#aaa',
          padding: 15,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(26, 26, 26, 0.9)',
        titleColor: '#cfbd97',
        bodyColor: '#ffffff',
        borderColor: '#cfbd97',
        borderWidth: 1
      }
    },
    scales: type !== 'doughnut' ? {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#aaa',
          maxTicksLimit: 6,
          callback: type === 'revenue' ? function(value) {
            return value + 'k';
          } : undefined
        },
        ...(type === 'satisfaction' && { min: 85, max: 100 })
      },
      x: {
        grid: {
          color: type === 'bar' ? 'transparent' : 'rgba(255, 255, 255, 0.1)',
          display: type !== 'bar'
        },
        ticks: {
          color: '#aaa'
        }
      }
    } : {}
  };

  // Initialiser le graphique
  const initializeChart = useCallback(() => {
    if (!chartRef.current || !data) return;

    // Détruire l'instance précédente si elle existe
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    try {
      chartInstance.current = new Chart(chartRef.current, {
        type: type,
        data: data,
        options: { ...defaultOptions, ...options }
      });

      // Notifier le parent que le graphique est prêt
      if (onChartReady) {
        onChartReady(chartInstance.current);
      }
    } catch (error) {
      console.error('Erreur lors de la création du graphique:', error);
    }
  }, [data, type, options, onChartReady]);

  // Mettre à jour le graphique quand les données changent
  const updateChart = useCallback(() => {
    if (chartInstance.current && data) {
      chartInstance.current.data = data;
      chartInstance.current.update('none');
    }
  }, [data]);

  useEffect(() => {
    initializeChart();
  }, [initializeChart]);

  useEffect(() => {
    updateChart();
  }, [updateChart]);

  // Nettoyer le graphique lors du démontage
  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return <canvas ref={chartRef} />;
};

// Composant spécifique pour chaque type de graphique
export const OrdersChart = ({ data, onChartReady }) => (
  <ChartComponent
    type="line"
    data={data}
    onChartReady={onChartReady}
    options={{
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true },
        x: { grid: { color: 'rgba(255, 255, 255, 0.1)' } }
      }
    }}
  />
);

export const DeliveryChart = ({ data, onChartReady }) => (
  <ChartComponent
    type="doughnut"
    data={data}
    onChartReady={onChartReady}
    options={{
      cutout: '60%'
    }}
  />
);

export const ProductsChart = ({ data, onChartReady }) => (
  <ChartComponent
    type="bar"
    data={data}
    onChartReady={onChartReady}
    options={{
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } }
      }
    }}
  />
);

export const SatisfactionChart = ({ data, onChartReady }) => (
  <ChartComponent
    type="line"
    data={data}
    onChartReady={onChartReady}
    options={{
      plugins: { legend: { display: false } },
      scales: {
        y: { min: 85, max: 100 }
      }
    }}
  />
);

export const RevenueChart = ({ data, onChartReady }) => (
  <ChartComponent
    type="line"
    data={data}
    onChartReady={onChartReady}
    options={{
      plugins: { legend: { display: false } },
      scales: {
        y: {
          ticks: {
            callback: function(value) {
              return value + 'k';
            }
          }
        }
      }
    }}
  />
);

export const HoursChart = ({ data, onChartReady }) => (
  <ChartComponent
    type="bar"
    data={data}
    onChartReady={onChartReady}
    options={{
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } }
      }
    }}
  />
);

// Hook personnalisé pour la gestion des données des graphiques
export const useChartData = (initialData) => {
  const [chartData, setChartData] = React.useState(initialData);

  const updateData = useCallback((newData) => {
    setChartData(prev => ({ ...prev, ...newData }));
  }, []);

  const randomUpdate = useCallback((variation = 10) => {
    const updatedData = { ...chartData };
    
    Object.keys(updatedData).forEach(key => {
      if (updatedData[key]?.datasets) {
        updatedData[key].datasets = updatedData[key].datasets.map(dataset => ({
          ...dataset,
          data: dataset.data.map(value => 
            Math.max(0, value + (Math.random() * variation * 2 - variation))
          )
        }));
      }
    });

    setChartData(updatedData);
  }, [chartData]);

  return { chartData, updateData, randomUpdate };
};

export default ChartComponent;