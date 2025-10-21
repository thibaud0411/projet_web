import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'aos/dist/aos.css';
import AOS from 'aos';
import { Chart, registerables } from 'chart.js';

// Components
import Header from './Header';
import Footer from './Footer';

// Styles
import '../styles/GlobalStyles.css';

// Enregistrer tous les composants de Chart.js
Chart.register(...registerables);

const Stats = () => {
  const [theme, setTheme] = useState('dark');
  const [activePeriod, setActivePeriod] = useState('Aujourd\'hui');
  
  // Références pour les canvas des graphiques
  const ordersChartRef = useRef(null);
  const deliveryChartRef = useRef(null);
  const productsChartRef = useRef(null);
  const satisfactionChartRef = useRef(null);
  const revenueChartRef = useRef(null);
  const hoursChartRef = useRef(null);
  
  // Références pour les instances Chart
  const ordersChartInstance = useRef(null);
  const deliveryChartInstance = useRef(null);
  const productsChartInstance = useRef(null);
  const satisfactionChartInstance = useRef(null);
  const revenueChartInstance = useRef(null);
  const hoursChartInstance = useRef(null);

  // Données dynamiques pour les graphiques (identique à votre JS original)
  const [statsData] = useState({
    orders: {
      labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      datasets: [{
        label: 'Commandes',
        data: [180, 210, 190, 230, 250, 200, 180],
        backgroundColor: '#cfbd97',
        borderColor: '#b8a885',
        borderWidth: 2,
        tension: 0.4,
        fill: false
      }]
    },
    delivery: {
      labels: ['Livraison', 'Sur Place', 'À emporter'],
      datasets: [{
        data: [33, 52, 15],
        backgroundColor: ['#cfbd97', '#b8a885', '#a39473'],
        borderWidth: 0
      }]
    },
    products: {
      labels: ['Pizza', 'Burger', 'Pâtes', 'Salade', 'Dessert'],
      datasets: [{
        label: 'Ventes',
        data: [45, 30, 25, 20, 15],
        backgroundColor: [
          '#cfbd97',
          '#b8a885',
          '#a39473',
          '#8e8061',
          '#796c4f'
        ],
        borderWidth: 0
      }]
    },
    satisfaction: {
      labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      datasets: [{
        label: 'Satisfaction (%)',
        data: [92, 94, 93, 95, 96, 94, 95],
        backgroundColor: 'rgba(207, 189, 151, 0.2)',
        borderColor: '#cfbd97',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    },
    revenue: {
      labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      datasets: [{
        label: 'Revenus (k XAF)',
        data: [120, 140, 130, 160, 180, 150, 130],
        backgroundColor: 'rgba(207, 189, 151, 0.3)',
        borderColor: '#cfbd97',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    },
    hours: {
      labels: ['8h', '10h', '12h', '14h', '16h', '18h', '20h', '22h'],
      datasets: [{
        label: 'Commandes',
        data: [15, 45, 120, 85, 65, 95, 70, 25],
        backgroundColor: 'rgba(207, 189, 151, 0.6)',
        borderColor: '#cfbd97',
        borderWidth: 2
      }]
    }
  });

  useEffect(() => {
    // Initialiser AOS
    AOS.init({
      duration: 800,
      once: true,
      offset: 100
    });

    document.body.setAttribute('data-theme', theme);

    // Initialiser les graphiques après le rendu
    initializeCharts();

    // Nettoyer les graphiques lors du démontage
    return () => {
      destroyCharts();
    };
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  const initializeCharts = () => {
    // Configuration des graphiques (identique à votre JS original)
    const chartConfigs = {
      orders: {
        type: 'line',
        data: statsData.orders,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(26, 26, 26, 0.9)',
              titleColor: '#cfbd97',
              bodyColor: '#ffffff',
              borderColor: '#cfbd97',
              borderWidth: 1
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: '#aaa',
                maxTicksLimit: 6
              }
            },
            x: {
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: '#aaa'
              }
            }
          }
        }
      },
      delivery: {
        type: 'doughnut',
        data: statsData.delivery,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '60%',
          plugins: {
            legend: {
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
              bodyColor: '#ffffff'
            }
          }
        }
      },
      products: {
        type: 'bar',
        data: statsData.products,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(26, 26, 26, 0.9)',
              titleColor: '#cfbd97',
              bodyColor: '#ffffff'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: '#aaa',
                maxTicksLimit: 5
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#aaa',
                font: {
                  size: 11
                }
              }
            }
          }
        }
      },
      satisfaction: {
        type: 'line',
        data: statsData.satisfaction,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(26, 26, 26, 0.9)',
              titleColor: '#cfbd97',
              bodyColor: '#ffffff',
              borderColor: '#cfbd97',
              borderWidth: 1
            }
          },
          scales: {
            y: {
              min: 85,
              max: 100,
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: '#aaa',
                maxTicksLimit: 5
              }
            },
            x: {
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: '#aaa'
              }
            }
          }
        }
      },
      revenue: {
        type: 'line',
        data: statsData.revenue,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(26, 26, 26, 0.9)',
              titleColor: '#cfbd97',
              bodyColor: '#ffffff',
              borderColor: '#cfbd97',
              borderWidth: 1
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: '#aaa',
                maxTicksLimit: 6,
                callback: function(value) {
                  return value + 'k';
                }
              }
            },
            x: {
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: '#aaa'
              }
            }
          }
        }
      },
      hours: {
        type: 'bar',
        data: statsData.hours,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(26, 26, 26, 0.9)',
              titleColor: '#cfbd97',
              bodyColor: '#ffffff'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: '#aaa',
                maxTicksLimit: 6
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#aaa'
              }
            }
          }
        }
      }
    };

    // Fonction pour créer un graphique avec gestion d'erreur (identique à votre JS)
    function createChart(canvasId, config) {
      const canvas = document.getElementById(canvasId);
      if (!canvas) {
        console.warn(`Canvas ${canvasId} non trouvé`);
        return null;
      }
      
      try {
        return new Chart(canvas, config);
      } catch (error) {
        console.error(`Erreur lors de la création du graphique ${canvasId}:`, error);
        return null;
      }
    }

    // Créer tous les graphiques
    ordersChartInstance.current = createChart('ordersChart', chartConfigs.orders);
    deliveryChartInstance.current = createChart('deliveryChart', chartConfigs.delivery);
    productsChartInstance.current = createChart('productsChart', chartConfigs.products);
    satisfactionChartInstance.current = createChart('satisfactionChart', chartConfigs.satisfaction);
    revenueChartInstance.current = createChart('revenueChart', chartConfigs.revenue);
    hoursChartInstance.current = createChart('hoursChart', chartConfigs.hours);

    // Gestion des boutons de période
    document.querySelectorAll('.period-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        updateChartsForPeriod(this.textContent);
      });
    });

    // Redimensionnement responsive des graphiques
    window.addEventListener('resize', function() {
      const charts = [
        ordersChartInstance.current, 
        deliveryChartInstance.current, 
        productsChartInstance.current, 
        satisfactionChartInstance.current, 
        revenueChartInstance.current, 
        hoursChartInstance.current
      ];
      charts.forEach(chart => {
        if (chart) chart.resize();
      });
    });

    // Simulation de mise à jour dynamique des données
    setInterval(updateCharts, 10000);
  };

  const destroyCharts = () => {
    // Détruire toutes les instances de graphiques
    [
      ordersChartInstance,
      deliveryChartInstance,
      productsChartInstance,
      satisfactionChartInstance,
      revenueChartInstance,
      hoursChartInstance
    ].forEach(chartRef => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    });
  };

  // Fonctions identiques à votre JS original
  const updateChartsForPeriod = (period) => {
    showNotification(`Mise à jour des données pour: ${period}`, 'info');
  };

  // Fonction identique à votre JS original pour mettre à jour dynamiquement les graphiques
  const updateCharts = () => {
    // Mise à jour aléatoire des données pour la démonstration
    const randomUpdate = (base, variation) => 
      Math.max(0, base + (Math.random() * variation * 2 - variation));
    
    // Mettre à jour les données des commandes
    statsData.orders.datasets[0].data = statsData.orders.datasets[0].data.map(
      value => randomUpdate(value, 15)
    );
    
    // Mettre à jour le graphique de livraison
    statsData.delivery.datasets[0].data = [
      randomUpdate(33, 3),
      randomUpdate(52, 3),
      randomUpdate(15, 2)
    ];
    
    // Mettre à jour les produits
    statsData.products.datasets[0].data = statsData.products.datasets[0].data.map(
      value => randomUpdate(value, 3)
    );
    
    // Mettre à jour la satisfaction
    statsData.satisfaction.datasets[0].data = statsData.satisfaction.datasets[0].data.map(
      value => randomUpdate(value, 1)
    );
    
    // Mettre à jour les revenus
    statsData.revenue.datasets[0].data = statsData.revenue.datasets[0].data.map(
      value => randomUpdate(value, 10)
    );
    
    // Mettre à jour les heures d'affluence
    statsData.hours.datasets[0].data = statsData.hours.datasets[0].data.map(
      value => randomUpdate(value, 5)
    );
    
    // Forcer la mise à jour des graphiques
    if (ordersChartInstance.current) ordersChartInstance.current.update();
    if (deliveryChartInstance.current) deliveryChartInstance.current.update();
    if (productsChartInstance.current) productsChartInstance.current.update();
    if (satisfactionChartInstance.current) satisfactionChartInstance.current.update();
    if (revenueChartInstance.current) revenueChartInstance.current.update();
    if (hoursChartInstance.current) hoursChartInstance.current.update();
    
    // Mettre à jour les pourcentages affichés
    updateDisplayedPercentages();
  };

  // Fonction pour mettre à jour les pourcentages affichés
  const updateDisplayedPercentages = () => {
    const deliveryData = statsData.delivery.datasets[0].data;
    const total = deliveryData[0] + deliveryData[1] + deliveryData[2];
    
    // Mettre à jour les éléments DOM
    const deliveryPercentElement = document.getElementById('delivery-percent');
    const onsitePercentElement = document.getElementById('onsite-percent');
    
    if (deliveryPercentElement) {
      deliveryPercentElement.textContent = ((deliveryData[0] / total) * 100).toFixed(1) + '%';
    }
    if (onsitePercentElement) {
      onsitePercentElement.textContent = ((deliveryData[1] / total) * 100).toFixed(1) + '%';
    }
  };

  const showNotification = (message, type = 'info') => {
    // Implémentation identique à votre JS
    const toastContainer = document.createElement('div');
    toastContainer.className = 'custom-toast';
    
    const bgColor = {
      'success': 'bg-success',
      'warning': 'bg-warning',
      'error': 'bg-danger',
      'info': 'bg-primary'
    }[type] || 'bg-primary';

    const icon = {
      'success': 'check-circle',
      'warning': 'exclamation-triangle',
      'error': 'times-circle',
      'info': 'info-circle'
    }[type] || 'info-circle';

    toastContainer.innerHTML = `
      <div class="toast align-items-center text-white ${bgColor} border-0 show" role="alert">
        <div class="d-flex">
          <div class="toast-body">
            <i class="fas fa-${icon} me-2"></i>
            ${message}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
      </div>
    `;

    document.body.appendChild(toastContainer);

    // Supprimer après 3 secondes
    setTimeout(() => {
      toastContainer.remove();
    }, 3000);
  };

  const handlePeriodChange = (period) => {
    setActivePeriod(period);
    updateChartsForPeriod(period);
  };

  const handleExport = () => {
    showNotification('Export des données en cours...', 'info');
  };

  const handleRefresh = () => {
    showNotification('Actualisation des données...', 'info');
    // Simuler une mise à jour des données
    setTimeout(() => {
      showNotification('Données actualisées avec succès', 'success');
    }, 1000);
  };

  const periods = ['Aujourd\'hui', '7 derniers jours', '30 derniers jours', '3 derniers mois', 'Cette année'];

  return (
    <div className="App">
      <Header theme={theme} toggleTheme={toggleTheme} activePage="stats" />
      
      {/* Section principale - structure identique à votre HTML */}
      <main className="main-content">
        <div className="container">
          {/* En-tête de la page */}
          <div className="mb-4" data-aos="fade-up">
            <h1 className="page-title">Tableau de Bord Statistiques</h1>
            <p className="page-subtitle">Analysez les performances et les tendances de votre restaurant</p>
          </div>

          {/* Filtres de période */}
          <div className="period-filters" data-aos="fade-up" data-aos-delay="100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0 text-primary">Période d'analyse</h5>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-primary btn-sm" onClick={handleExport}>
                  <i className="fas fa-download"></i> Exporter
                </button>
                <button className="btn btn-primary btn-sm" onClick={handleRefresh}>
                  <i className="fas fa-sync-alt"></i> Actualiser
                </button>
              </div>
            </div>
            <div className="period-buttons">
              {periods.map(period => (
                <button
                  key={period}
                  className={`period-btn ${activePeriod === period ? 'active' : ''}`}
                  onClick={() => handlePeriodChange(period)}
                >
                  {period}
                </button>
              ))}
              <div className="d-flex gap-2">
                <input type="date" className="form-control form-control-sm" style={{width: '150px'}} />
                <span className="align-self-center">à</span>
                <input type="date" className="form-control form-control-sm" style={{width: '150px'}} />
              </div>
            </div>
          </div>

          {/* Cartes de statistiques principales */}
          <div className="stats-grid" data-aos="fade-up" data-aos-delay="150">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-shopping-cart"></i>
              </div>
              <div className="stat-value" id="total-orders">1,247</div>
              <div className="stat-label">Commandes Totales</div>
              <div className="stat-trend positive">+5.2%</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-money-bill-wave"></i>
              </div>
              <div className="stat-value" id="total-revenue">700 000 XAF</div>
              <div className="stat-label">Revenu Total</div>
              <div className="stat-trend positive">+12.7%</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="stat-value" id="total-customers">856</div>
              <div className="stat-label">Clients Uniques</div>
              <div className="stat-trend positive">+8.3%</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-star"></i>
              </div>
              <div className="stat-value" id="satisfaction">94.2%</div>
              <div className="stat-label">Satisfaction Clients</div>
              <div className="stat-trend positive">+2.1%</div>
            </div>
          </div>

          {/* Section des graphiques */}
          <div className="section" data-aos="fade-up" data-aos-delay="200">
            <h2>Analyse des Performances</h2>

            {/* Structure identique à votre HTML */}
            <div className="stats-container">
              {/* Colonne de gauche */}
              <div className="chart-column">
                <div className="chart-container">
                  <div className="chart-title">Commandes par Jour</div>
                  <div className="chart-wrapper">
                    <canvas ref={ordersChartRef} id="ordersChart"></canvas>
                  </div>
                </div>
                
                <div className="chart-container chart-small">
                  <div className="chart-title">Répartition des Commandes</div>
                  <div className="chart-wrapper">
                    <canvas ref={deliveryChartRef} id="deliveryChart"></canvas>
                  </div>
                  <div className="delivery-stats">
                    <div className="delivery-stat">
                      <div className="delivery-value" id="delivery-percent">33.0%</div>
                      <div className="delivery-label">Livraison</div>
                    </div>
                    <div className="delivery-stat">
                      <div className="delivery-value" id="onsite-percent">67.0%</div>
                      <div className="delivery-label">Sur Place</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Colonne de droite */}
              <div className="chart-column">
                <div className="chart-container">
                  <div className="chart-title">Top Produits</div>
                  <div className="chart-wrapper">
                    <canvas ref={productsChartRef} id="productsChart"></canvas>
                  </div>
                </div>
                
                <div className="chart-container chart-small">
                  <div className="chart-title">Taux de Satisfaction</div>
                  <div className="chart-wrapper">
                    <canvas ref={satisfactionChartRef} id="satisfactionChart"></canvas>
                  </div>
                  <div className="stat-value" style={{textAlign: 'center', marginTop: '10px'}} id="avg-satisfaction">94.2%</div>
                </div>
              </div>
            </div>

            {/* Graphiques supplémentaires */}
            <div className="stats-container mt-4">
              <div className="chart-container">
                <div className="chart-title">Revenus par Jour</div>
                <div className="chart-wrapper">
                  <canvas ref={revenueChartRef} id="revenueChart"></canvas>
                </div>
              </div>
              <div className="chart-container">
                <div className="chart-title">Heures d'Affluence</div>
                <div className="chart-wrapper">
                  <canvas ref={hoursChartRef} id="hoursChart"></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Stats;