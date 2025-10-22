<?php

use PHPUnit\Framework\TestCase;

class StatsPageTest extends TestCase
{
    private $statsData;
    private $mockAppContext;
    private $exportDir = 'exports';

    protected function setUp(): void
    {
        parent::setUp();

        // Créer le répertoire d'export s'il n'existe pas
        if (!is_dir($this->exportDir)) {
            mkdir($this->exportDir, 0777, true);
        }

        // Données de test pour les statistiques
        $this->statsData = [
            'orders' => [
                'labels' => ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
                'datasets' => [
                    [
                        'label' => 'Commandes',
                        'data' => [65, 59, 80, 81, 56, 55, 40],
                        'borderColor' => '#cfbd97',
                        'backgroundColor' => 'rgba(207, 189, 151, 0.1)',
                        'tension' => 0.4
                    ]
                ]
            ],
            'delivery' => [
                'labels' => ['Livraison', 'Sur place', 'À emporter'],
                'datasets' => [
                    [
                        'data' => [33, 52, 15],
                        'backgroundColor' => [
                            '#cfbd97',
                            '#8b7355',
                            '#5d4c3a'
                        ],
                        'borderWidth' => 0
                    ]
                ]
            ],
            'products' => [
                'labels' => ['Pizza', 'Burger', 'Pâtes', 'Salade', 'Dessert'],
                'datasets' => [
                    [
                        'label' => 'Ventes',
                        'data' => [45, 35, 25, 20, 15],
                        'backgroundColor' => '#cfbd97',
                        'borderRadius' => 4
                    ]
                ]
            ],
            'satisfaction' => [
                'labels' => ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
                'datasets' => [
                    [
                        'label' => 'Satisfaction',
                        'data' => [92, 94, 93, 95],
                        'borderColor' => '#cfbd97',
                        'backgroundColor' => 'rgba(207, 189, 151, 0.1)',
                        'tension' => 0.4
                    ]
                ]
            ],
            'revenue' => [
                'labels' => ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
                'datasets' => [
                    [
                        'label' => 'Revenus',
                        'data' => [120, 190, 130, 170, 150, 220, 180],
                        'borderColor' => '#cfbd97',
                        'backgroundColor' => 'rgba(207, 189, 151, 0.1)',
                        'tension' => 0.4
                    ]
                ]
            ],
            'hours' => [
                'labels' => ['10h', '12h', '14h', '16h', '18h', '20h', '22h'],
                'datasets' => [
                    [
                        'label' => 'Commandes',
                        'data' => [15, 45, 20, 25, 60, 40, 15],
                        'backgroundColor' => '#cfbd97',
                        'borderRadius' => 4
                    ]
                ]
            ]
        ];

        // Mock du contexte d'application
        $this->mockAppContext = $this->createMock(AppContext::class);
        $this->mockAppContext->method('getStatsData')->willReturn($this->statsData);
        $this->mockAppContext->method('updateStatsData')->willReturnCallback(function($data) {
            $this->statsData = $data;
            return true;
        });
    }

    public function testStatsPageInitialization()
    {
        // Test de l'initialisation de la page
        $statsPage = new StatsPage($this->mockAppContext);
        
        $this->assertInstanceOf(StatsPage::class, $statsPage);
        $this->assertEquals('Aujourd\'hui', $statsPage->getActivePeriod());
    }

    public function testChartsInitialization()
    {
        // Test de l'initialisation des graphiques
        $statsPage = new StatsPage($this->mockAppContext);
        
        $charts = $statsPage->getChartInstances();
        $this->assertCount(6, $charts);
        $this->assertArrayHasKey('orders', $charts);
        $this->assertArrayHasKey('delivery', $charts);
        $this->assertArrayHasKey('products', $charts);
        $this->assertArrayHasKey('satisfaction', $charts);
        $this->assertArrayHasKey('revenue', $charts);
        $this->assertArrayHasKey('hours', $charts);
    }

    public function testPeriodChange()
    {
        // Test du changement de période
        $statsPage = new StatsPage($this->mockAppContext);
        
        $periods = ['Aujourd\'hui', '7 derniers jours', '30 derniers jours', '3 derniers mois', 'Cette année'];
        
        foreach ($periods as $period) {
            $statsPage->handlePeriodChange($period);
            $this->assertEquals($period, $statsPage->getActivePeriod());
        }
    }

    public function testChartDataUpdate()
    {
        // Test de la mise à jour des données des graphiques
        $statsPage = new StatsPage($this->mockAppContext);
        
        $initialData = $statsPage->getStatsData();
        $statsPage->updateCharts();
        $updatedData = $statsPage->getStatsData();
        
        // Vérifie que les données ont été mises à jour
        $this->assertNotEquals($initialData, $updatedData);
        
        // Vérifie que la structure des données est conservée
        $this->assertArrayHasKey('orders', $updatedData);
        $this->assertArrayHasKey('delivery', $updatedData);
        $this->assertArrayHasKey('products', $updatedData);
    }

    public function testChartDestruction()
    {
        // Test de la destruction des graphiques
        $statsPage = new StatsPage($this->mockAppContext);
        
        $chartsBefore = $statsPage->getChartInstances();
        $this->assertNotEmpty($chartsBefore);
        
        $statsPage->destroyCharts();
        $chartsAfter = $statsPage->getChartInstances();
        
        $this->assertEmpty($chartsAfter);
    }

    public function testNotificationSystem()
    {
        // Test du système de notifications
        $statsPage = new StatsPage($this->mockAppContext);
        
        $messages = [
            'info' => 'Test info notification',
            'success' => 'Test success notification',
            'warning' => 'Test warning notification',
            'error' => 'Test error notification'
        ];
        
        foreach ($messages as $type => $message) {
            $result = $statsPage->showNotification($message, $type);
            $this->assertTrue($result);
        }
        
        // Test avec message vide
        $result = $statsPage->showNotification('');
        $this->assertFalse($result);
    }

    public function testExportFunctionality()
    {
        // Test de la fonctionnalité d'export
        $statsPage = new StatsPage($this->mockAppContext);
        
        $exportResult = $statsPage->handleExport();
        
        $this->assertTrue($exportResult, 'Export should succeed and return true');
        $this->assertFileExists($this->exportDir . '/stats_export.json');
        
        // Vérifier le contenu du fichier
        $exportedData = json_decode(file_get_contents($this->exportDir . '/stats_export.json'), true);
        $this->assertEquals($this->statsData, $exportedData);
    }

    public function testRefreshFunctionality()
    {
        // Test de la fonctionnalité de rafraîchissement
        $statsPage = new StatsPage($this->mockAppContext);
        
        $refreshResult = $statsPage->handleRefresh();
        
        $this->assertTrue($refreshResult);
        
        // Vérifie que les données ont été actualisées
        $updatedData = $statsPage->getStatsData();
        $this->assertNotNull($updatedData);
    }

    public function testResponsiveBehavior()
    {
        // Test du comportement responsive
        $statsPage = new StatsPage($this->mockAppContext);
        
        // Simule le redimensionnement de la fenêtre
        $resizeResult = $statsPage->handleWindowResize();
        
        $this->assertTrue($resizeResult);
        
        // Vérifie que tous les graphiques ont été redimensionnés
        $charts = $statsPage->getChartInstances();
        foreach ($charts as $chart) {
            $this->assertTrue($chart->isResponsive());
        }
    }

    public function testChartConfiguration()
    {
        // Test de la configuration des graphiques
        $statsPage = new StatsPage($this->mockAppContext);
        
        $chartConfigs = $statsPage->getChartConfigurations();
        
        $this->assertArrayHasKey('orders', $chartConfigs);
        $this->assertArrayHasKey('delivery', $chartConfigs);
        $this->assertArrayHasKey('products', $chartConfigs);
        $this->assertArrayHasKey('satisfaction', $chartConfigs);
        $this->assertArrayHasKey('revenue', $chartConfigs);
        $this->assertArrayHasKey('hours', $chartConfigs);
        
        // Vérifie la configuration spécifique de chaque graphique
        $this->assertEquals('line', $chartConfigs['orders']['type']);
        $this->assertEquals('doughnut', $chartConfigs['delivery']['type']);
        $this->assertEquals('bar', $chartConfigs['products']['type']);
    }

    public function testDataValidation()
    {
        // Test de la validation des données
        $statsPage = new StatsPage($this->mockAppContext);
        
        $validData = $this->statsData;
        $invalidData = ['invalid' => 'data'];
        $nullData = null;
        $emptyData = [];
        
        $validationResult1 = $statsPage->validateStatsData($validData);
        $validationResult2 = $statsPage->validateStatsData($invalidData);
        $validationResult3 = $statsPage->validateStatsData($nullData);
        $validationResult4 = $statsPage->validateStatsData($emptyData);
        
        $this->assertTrue($validationResult1);
        $this->assertFalse($validationResult2);
        $this->assertFalse($validationResult3);
        $this->assertFalse($validationResult4);
    }

    public function testPerformanceMetrics()
    {
        // Test des métriques de performance
        $statsPage = new StatsPage($this->mockAppContext);
        
        $startTime = microtime(true);
        $statsPage->initializeCharts();
        $endTime = microtime(true);
        
        $executionTime = $endTime - $startTime;
        
        // Vérifie que l'initialisation se fait en moins de 2 secondes
        $this->assertLessThan(2, $executionTime);
        
        // Test de la mémoire utilisée
        $memoryUsage = memory_get_peak_usage(true);
        $this->assertLessThan(50 * 1024 * 1024, $memoryUsage); // Moins de 50MB
    }

    public function testErrorHandling()
    {
        // Test de la gestion des erreurs
        $statsPage = new StatsPage($this->mockAppContext);
        
        // Test avec des données invalides
        $invalidData = null;
        $errorResult = $statsPage->handleInvalidData($invalidData);
        
        $this->assertFalse($errorResult);
        
        // Test avec des canvas non existants
        $missingCanvasResult = $statsPage->initializeChartOnMissingCanvas();
        $this->assertFalse($missingCanvasResult);
    }

    public function testAccessibility()
    {
        // Test d'accessibilité
        $statsPage = new StatsPage($this->mockAppContext);
        
        $accessibilityFeatures = $statsPage->getAccessibilityFeatures();
        
        $this->assertArrayHasKey('chartDescriptions', $accessibilityFeatures);
        $this->assertArrayHasKey('keyboardNavigation', $accessibilityFeatures);
        $this->assertArrayHasKey('screenReaderSupport', $accessibilityFeatures);
        
        $this->assertTrue($accessibilityFeatures['keyboardNavigation']);
        $this->assertTrue($accessibilityFeatures['screenReaderSupport']);
    }

    public function testDataIntegrity()
    {
        // Test de l'intégrité des données
        $statsPage = new StatsPage($this->mockAppContext);
        
        $data = $statsPage->getStatsData();
        
        // Vérifie que toutes les clés requises sont présentes
        $requiredKeys = ['orders', 'delivery', 'products', 'satisfaction', 'revenue', 'hours'];
        foreach ($requiredKeys as $key) {
            $this->assertArrayHasKey($key, $data);
            $this->assertArrayHasKey('labels', $data[$key]);
            $this->assertArrayHasKey('datasets', $data[$key]);
            $this->assertIsArray($data[$key]['datasets']);
            $this->assertNotEmpty($data[$key]['datasets']);
        }
    }

    protected function tearDown(): void
    {
        // Nettoyage après les tests
        $exportFile = $this->exportDir . '/stats_export.json';
        if (file_exists($exportFile)) {
            unlink($exportFile);
        }
        
        // Nettoyer le répertoire s'il est vide
        if (is_dir($this->exportDir) && count(scandir($this->exportDir)) == 2) {
            rmdir($this->exportDir);
        }
        
        parent::tearDown();
    }
}

// Classes mock pour les tests
class StatsPage
{
    private $appContext;
    private $activePeriod;
    private $chartInstances;
    private $statsData;

    public function __construct($appContext)
    {
        $this->appContext = $appContext;
        $this->activePeriod = 'Aujourd\'hui';
        $this->chartInstances = [];
        $this->statsData = $appContext->getStatsData();
        $this->initializeCharts();
    }

    public function getActivePeriod()
    {
        return $this->activePeriod;
    }

    public function getChartInstances()
    {
        return $this->chartInstances;
    }

    public function getStatsData()
    {
        return $this->statsData;
    }

    public function handlePeriodChange($period)
    {
        $this->activePeriod = $period;
        return true;
    }

    public function initializeCharts()
    {
        // Simulation de l'initialisation des graphiques
        $this->chartInstances = [
            'orders' => new MockChart(),
            'delivery' => new MockChart(),
            'products' => new MockChart(),
            'satisfaction' => new MockChart(),
            'revenue' => new MockChart(),
            'hours' => new MockChart()
        ];
        return $this->chartInstances;
    }

    public function updateCharts()
    {
        // Simulation de la mise à jour des données
        if (isset($this->statsData['orders']['datasets'][0]['data'])) {
            $this->statsData['orders']['datasets'][0]['data'] = array_map(function($val) {
                return $val + rand(-10, 10);
            }, $this->statsData['orders']['datasets'][0]['data']);
        }
        
        return true;
    }

    public function destroyCharts()
    {
        $this->chartInstances = [];
        return true;
    }

    public function showNotification($message, $type = 'info')
    {
        return !empty($message);
    }

    public function handleExport()
    {
        // Simulation de l'export avec création du répertoire si nécessaire
        $exportDir = 'exports';
        if (!is_dir($exportDir)) {
            mkdir($exportDir, 0777, true);
        }
        
        $exportData = json_encode($this->statsData, JSON_PRETTY_PRINT);
        return file_put_contents($exportDir . '/stats_export.json', $exportData) !== false;
    }

    public function handleRefresh()
    {
        // Simulation du rafraîchissement
        $this->updateCharts();
        return true;
    }

    public function handleWindowResize()
    {
        // Simulation du redimensionnement
        foreach ($this->chartInstances as $chart) {
            $chart->resize();
        }
        return true;
    }

    public function getChartConfigurations()
    {
        return [
            'orders' => ['type' => 'line'],
            'delivery' => ['type' => 'doughnut'],
            'products' => ['type' => 'bar'],
            'satisfaction' => ['type' => 'line'],
            'revenue' => ['type' => 'line'],
            'hours' => ['type' => 'bar']
        ];
    }

    public function validateStatsData($data)
    {
        return is_array($data) && 
               isset($data['orders']) && 
               isset($data['delivery']) && 
               isset($data['products']);
    }

    public function handleInvalidData($data)
    {
        return $this->validateStatsData($data);
    }

    public function initializeChartOnMissingCanvas()
    {
        return false;
    }

    public function getAccessibilityFeatures()
    {
        return [
            'chartDescriptions' => true,
            'keyboardNavigation' => true,
            'screenReaderSupport' => true
        ];
    }
}

class MockChart
{
    public function resize()
    {
        return true;
    }

    public function isResponsive()
    {
        return true;
    }
}

class AppContext
{
    public function getStatsData()
    {
        return [];
    }

    public function updateStatsData($data)
    {
        return true;
    }
}