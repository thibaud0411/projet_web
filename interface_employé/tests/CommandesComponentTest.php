<?php

namespace Tests;

use PHPUnit\Framework\TestCase;
use Mockery;

/**
 * Tests unitaires pour le composant Commandes React
 * 
 * Ce test simule le comportement du composant Commandes.js
 * en utilisant une approche orientée objet PHP
 */
class CommandesComponentTest extends TestCase
{
    private $commandesComponent;
    private $mockAppContext;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Mock du contexte d'application
        $this->mockAppContext = Mockery::mock('AppContext');
        
        // Initialisation du composant Commandes simulé
        $this->commandesComponent = new CommandesComponent($this->mockAppContext);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    /** @test */
    public function it_initializes_with_default_state()
    {
        // Assert
        $this->assertEquals([], $this->commandesComponent->getFilteredOrders());
        
        $filters = $this->commandesComponent->getFilters();
        $this->assertEquals('all', $filters['status']);
        $this->assertEquals('', $filters['date']);
        $this->assertEquals('all', $filters['time']);
        $this->assertEquals('', $filters['search']);
        
        $this->assertFalse($this->commandesComponent->isRefreshing());
        $this->assertNull($this->commandesComponent->getLastToast());
    }

    /** @test */
    public function it_applies_status_filter_correctly()
    {
        // Arrange
        $orders = [
            $this->createMockOrder(['status' => 'pending']),
            $this->createMockOrder(['status' => 'preparing']),
            $this->createMockOrder(['status' => 'delivered'])
        ];

        $this->mockAppContext->shouldReceive('getOrders')
            ->andReturn($orders);

        // Act
        $this->commandesComponent->setFilters(['status' => 'pending']);
        $this->commandesComponent->applyFilters();

        // Assert
        $filteredOrders = $this->commandesComponent->getFilteredOrders();
        $this->assertCount(1, $filteredOrders);
        $this->assertEquals('pending', $filteredOrders[0]['status']);
        $this->assertNotEquals('preparing', $filteredOrders[0]['status']);
        $this->assertNotEquals('delivered', $filteredOrders[0]['status']);
        
        // Vérifier que les autres commandes sont filtrées
        $this->assertCount(1, array_filter($filteredOrders, function($order) {
            return $order['status'] === 'pending';
        }));
    }

    /** @test */
    public function it_applies_date_filter_correctly()
    {
        // Arrange
        $today = date('Y-m-d');
        $yesterday = date('Y-m-d', strtotime('-1 day'));
        $tomorrow = date('Y-m-d', strtotime('+1 day'));

        $orders = [
            $this->createMockOrder(['date' => $today]),
            $this->createMockOrder(['date' => $yesterday]),
            $this->createMockOrder(['date' => $tomorrow])
        ];

        $this->mockAppContext->shouldReceive('getOrders')
            ->andReturn($orders);

        // Act
        $this->commandesComponent->setFilters(['date' => $today]);
        $this->commandesComponent->applyFilters();

        // Assert
        $filteredOrders = $this->commandesComponent->getFilteredOrders();
        $this->assertCount(1, $filteredOrders);
        $this->assertEquals($today, $filteredOrders[0]['date']);
        $this->assertNotEquals($yesterday, $filteredOrders[0]['date']);
        $this->assertNotEquals($tomorrow, $filteredOrders[0]['date']);
    }

    /** @test */
    public function it_applies_search_filter_correctly()
    {
        // Arrange
        $orders = [
            $this->createMockOrder([
                'customer' => 'John Doe',
                'number' => 'CMD-001',
                'phone' => '+242 06 655 04 99'
            ]),
            $this->createMockOrder([
                'customer' => 'Jane Smith', 
                'number' => 'CMD-002',
                'phone' => '+242 06 655 04 98'
            ]),
            $this->createMockOrder([
                'customer' => 'Robert Johnson',
                'number' => 'CMD-003',
                'phone' => '+242 06 655 04 97'
            ])
        ];

        $this->mockAppContext->shouldReceive('getOrders')
            ->andReturn($orders);

        // Test recherche par nom client (insensible à la casse)
        $this->commandesComponent->setFilters(['search' => 'JOHN']);
        $this->commandesComponent->applyFilters();
        $filteredOrders = $this->commandesComponent->getFilteredOrders();
        $this->assertCount(2, $filteredOrders);
        $this->assertEquals('John Doe', $filteredOrders[0]['customer']);
        $this->assertEquals('CMD-001', $filteredOrders[0]['number']);

        // Test recherche par numéro de commande (partiel)
        $this->commandesComponent->setFilters(['search' => 'CMD-00']);
        $this->commandesComponent->applyFilters();
        $filteredOrders = $this->commandesComponent->getFilteredOrders();
        $this->assertCount(3, $filteredOrders); // Tous les CMD-00x

        // Test recherche par téléphone (partiel)
        $this->commandesComponent->setFilters(['search' => '655 04']);
        $this->commandesComponent->applyFilters();
        $filteredOrders = $this->commandesComponent->getFilteredOrders();
        $this->assertCount(3, $filteredOrders); // Tous les numéros avec "655 04"

        // Test recherche sans résultats
        $this->commandesComponent->setFilters(['search' => 'inexistant']);
        $this->commandesComponent->applyFilters();
        $filteredOrders = $this->commandesComponent->getFilteredOrders();
        $this->assertCount(0, $filteredOrders);
    }

    /** @test */
    public function it_clears_all_filters()
    {
        // Arrange
        $initialFilters = [
            'status' => 'pending',
            'date' => '2024-01-01',
            'time' => 'morning',
            'search' => 'test search'
        ];

        $this->commandesComponent->setFilters($initialFilters);

        // Vérifier l'état avant clear
        $filtersBefore = $this->commandesComponent->getFilters();
        $this->assertEquals('pending', $filtersBefore['status']);
        $this->assertEquals('2024-01-01', $filtersBefore['date']);
        $this->assertEquals('morning', $filtersBefore['time']);
        $this->assertEquals('test search', $filtersBefore['search']);

        // Act
        $this->commandesComponent->clearFilters();

        // Assert
        $filters = $this->commandesComponent->getFilters();
        $this->assertEquals('all', $filters['status']);
        $this->assertEquals('', $filters['date']);
        $this->assertEquals('all', $filters['time']);
        $this->assertEquals('', $filters['search']);
        
        // Vérifier que le toast a été affiché avec les bonnes propriétés
        $lastToast = $this->commandesComponent->getLastToast();
        $this->assertNotNull($lastToast);
        $this->assertEquals('Filtres réinitialisés', $lastToast['message']);
        $this->assertEquals('success', $lastToast['type']);
        $this->assertStringContainsString('check-circle', $lastToast['html']);
        $this->assertStringContainsString('bg-success', $lastToast['html']);
    }

    /** @test */
    public function it_handles_all_order_actions_correctly()
    {
        // Arrange
        $orderId = 'CMD-001';
        $order = $this->createMockOrder(['id' => $orderId]);

        $this->mockAppContext->shouldReceive('getOrders')
            ->andReturn([$order])
            ->times(6); // 6 appels pour les 6 actions

        // Test action "start"
        $this->mockAppContext->shouldReceive('updateOrderStatus')
            ->once()
            ->with($orderId, 'preparing')
            ->andReturn(true);

        $result = $this->commandesComponent->handleOrderAction($orderId, 'start');
        $this->assertTrue($result, "Action 'start' devrait retourner true");

        // Test action "ready"
        $this->mockAppContext->shouldReceive('updateOrderStatus')
            ->once()
            ->with($orderId, 'ready')
            ->andReturn(true);

        $result = $this->commandesComponent->handleOrderAction($orderId, 'ready');
        $this->assertTrue($result, "Action 'ready' devrait retourner true");

        // Test action "deliver"
        $this->mockAppContext->shouldReceive('updateOrderStatus')
            ->once()
            ->with($orderId, 'delivered')
            ->andReturn(true);

        $result = $this->commandesComponent->handleOrderAction($orderId, 'deliver');
        $this->assertTrue($result, "Action 'deliver' devrait retourner true");

        // Test action "cancel"
        $this->mockAppContext->shouldReceive('updateOrderStatus')
            ->once()
            ->with($orderId, 'cancelled')
            ->andReturn(true);

        $result = $this->commandesComponent->handleOrderAction($orderId, 'cancel');
        $this->assertTrue($result, "Action 'cancel' devrait retourner true");

        // Test action "delay"
        $this->mockAppContext->shouldReceive('getOrders')
            ->andReturn([$order]); // Pour delayOrder

        $result = $this->commandesComponent->handleOrderAction($orderId, 'delay');
        $this->assertTrue($result, "Action 'delay' devrait retourner true");
        
        // Vérifier le toast pour delay
        $lastToast = $this->commandesComponent->getLastToast();
        $this->assertStringContainsString('Délai ajouté pour', $lastToast['message']);

        // Test action "notify"
        $this->mockAppContext->shouldReceive('getOrders')
            ->andReturn([$order]); // Pour notifyCustomer

        $result = $this->commandesComponent->handleOrderAction($orderId, 'notify');
        $this->assertTrue($result, "Action 'notify' devrait retourner true");
        
        // Vérifier le toast pour notify
        $lastToast = $this->commandesComponent->getLastToast();
        $this->assertStringContainsString('Notification envoyée à', $lastToast['message']);
    }

    /** @test */
    public function it_delays_order_and_shows_notification()
    {
        // Arrange
        $orderId = 'CMD-001';
        $order = $this->createMockOrder([
            'id' => $orderId,
            'number' => 'CMD-001',
            'customer' => 'Test Customer'
        ]);

        $this->mockAppContext->shouldReceive('getOrders')
            ->andReturn([$order]);

        // Act
        $result = $this->commandesComponent->delayOrder($orderId);

        // Assert
        $this->assertTrue($result, "delayOrder devrait retourner true pour une commande existante");
        
        $lastToast = $this->commandesComponent->getLastToast();
        $this->assertNotNull($lastToast, "Un toast devrait être affiché");
        $this->assertStringContainsString('Délai ajouté pour CMD-001', $lastToast['message']);
        $this->assertStringContainsString('+15 minutes', $lastToast['message']);
        $this->assertEquals('warning', $lastToast['type']);
        $this->assertStringContainsString('exclamation-triangle', $lastToast['html']);
        $this->assertStringContainsString('bg-warning', $lastToast['html']);
    }

    /** @test */
    public function it_notifies_customer_and_shows_notification()
    {
        // Arrange
        $orderId = 'CMD-001';
        $order = $this->createMockOrder([
            'id' => $orderId,
            'customer' => 'John Doe',
            'number' => 'CMD-001'
        ]);

        $this->mockAppContext->shouldReceive('getOrders')
            ->andReturn([$order]);

        // Act
        $result = $this->commandesComponent->notifyCustomer($orderId);

        // Assert
        $this->assertTrue($result, "notifyCustomer devrait retourner true pour une commande existante");
        
        $lastToast = $this->commandesComponent->getLastToast();
        $this->assertNotNull($lastToast, "Un toast devrait être affiché");
        $this->assertEquals('Notification envoyée à John Doe', $lastToast['message']);
        $this->assertEquals('info', $lastToast['type']);
        $this->assertStringContainsString('info-circle', $lastToast['html']);
        $this->assertStringContainsString('bg-primary', $lastToast['html']);
    }

    /** @test */
    public function it_refreshes_orders_and_adds_new_one()
    {
        // Arrange
        $initialOrders = [
            $this->createMockOrder(['id' => 'CMD-001']),
            $this->createMockOrder(['id' => 'CMD-002'])
        ];

        $this->mockAppContext->shouldReceive('getOrders')
            ->andReturn($initialOrders);

        // Simuler l'ajout d'une nouvelle commande
        $this->mockAppContext->shouldReceive('addNewOrder')
            ->once()
            ->with(Mockery::on(function ($order) {
                return $order['customer'] === 'Nouveau Client' &&
                       strpos($order['id'], 'CMD-') === 0 &&
                       $order['status'] === 'pending' &&
                       $order['total'] === 5000;
            }))
            ->andReturnUsing(function ($newOrder) use ($initialOrders) {
                $initialOrders[] = $newOrder;
                return true;
            });

        // Vérifier l'état initial
        $this->assertFalse($this->commandesComponent->isRefreshing());

        // Act
        $this->commandesComponent->refreshOrders();

        // Assert
        $this->assertFalse($this->commandesComponent->isRefreshing(), "isRefreshing devrait être false après le rafraîchissement");
        
        $lastToast = $this->commandesComponent->getLastToast();
        $this->assertNotNull($lastToast, "Un toast devrait être affiché");
        $this->assertStringContainsString('Nouvelle commande reçue', $lastToast['message']);
        $this->assertEquals('info', $lastToast['type']);
    }

    /** @test */
    public function it_exports_orders_as_valid_json()
    {
        // Arrange
        $orders = [
            $this->createMockOrder([
                'id' => 'CMD-001',
                'customer' => 'John Doe',
                'total' => 15000
            ]),
            $this->createMockOrder([
                'id' => 'CMD-002',
                'customer' => 'Jane Smith',
                'total' => 25000
            ])
        ];

        $this->mockAppContext->shouldReceive('getOrders')
            ->andReturn($orders);

        $this->commandesComponent->setFilteredOrders($orders);

        // Act
        $exportData = $this->commandesComponent->exportOrders();

        // Assert
        $this->assertJson($exportData, "Les données exportées devraient être du JSON valide");
        
        $decodedData = json_decode($exportData, true);
        $this->assertIsArray($decodedData, "Les données décodées devraient être un tableau");
        $this->assertCount(2, $decodedData);
        
        // Vérifier la structure des données
        $firstOrder = $decodedData[0];
        $this->assertArrayHasKey('id', $firstOrder);
        $this->assertArrayHasKey('customer', $firstOrder);
        $this->assertArrayHasKey('number', $firstOrder);
        $this->assertArrayHasKey('phone', $firstOrder);
        $this->assertArrayHasKey('date', $firstOrder);
        $this->assertArrayHasKey('time', $firstOrder);
        $this->assertArrayHasKey('status', $firstOrder);
        $this->assertArrayHasKey('items', $firstOrder);
        $this->assertArrayHasKey('total', $firstOrder);
        
        $this->assertEquals('CMD-001', $firstOrder['id']);
        $this->assertEquals('John Doe', $firstOrder['customer']);
        $this->assertEquals(15000, $firstOrder['total']);
        
        $secondOrder = $decodedData[1];
        $this->assertEquals('CMD-002', $secondOrder['id']);
        $this->assertEquals('Jane Smith', $secondOrder['customer']);
        $this->assertEquals(25000, $secondOrder['total']);
        
        // Vérifier le toast
        $lastToast = $this->commandesComponent->getLastToast();
        $this->assertStringContainsString('Export des commandes téléchargé', $lastToast['message']);
        $this->assertEquals('success', $lastToast['type']);
    }

    /** @test */
    public function it_returns_correct_status_text_for_all_statuses()
    {
        // Test tous les statuts connus
        $statusMap = [
            'pending' => 'En attente',
            'preparing' => 'En préparation',
            'ready' => 'Prête',
            'delivered' => 'Livrée',
            'cancelled' => 'Annulée'
        ];

        foreach ($statusMap as $status => $expectedText) {
            $result = $this->commandesComponent->getStatusText($status);
            $this->assertEquals($expectedText, $result, "Le statut '$status' devrait être traduit en '$expectedText'");
        }

        // Test statut inconnu
        $unknownStatus = 'unknown_status';
        $result = $this->commandesComponent->getStatusText($unknownStatus);
        $this->assertEquals($unknownStatus, $result, "Un statut inconnu devrait être retourné tel quel");
        
        // Test statut vide
        $emptyStatus = '';
        $result = $this->commandesComponent->getStatusText($emptyStatus);
        $this->assertEquals($emptyStatus, $result, "Un statut vide devrait être retourné tel quel");
        
        // Test statut null
        $nullStatus = null;
        $result = $this->commandesComponent->getStatusText($nullStatus);
        $this->assertEquals($nullStatus, $result, "Un statut null devrait être retourné tel quel");
    }

    // ... (les autres tests restent similaires mais avec plus d'assertions)

    /** @test */
    public function it_handles_complex_multiple_filters_combinations()
    {
        // Arrange - Créer des données de test plus complexes
        $orders = [
            $this->createMockOrder([
                'status' => 'pending',
                'date' => '2024-01-15',
                'customer' => 'John Doe',
                'number' => 'CMD-001',
                'phone' => '+242 06 655 04 99'
            ]),
            $this->createMockOrder([
                'status' => 'pending',
                'date' => '2024-01-15', 
                'customer' => 'Jane Smith',
                'number' => 'CMD-002',
                'phone' => '+242 06 655 04 98'
            ]),
            $this->createMockOrder([
                'status' => 'preparing',
                'date' => '2024-01-15',
                'customer' => 'John Doe',
                'number' => 'CMD-003',
                'phone' => '+242 06 655 04 97'
            ]),
            $this->createMockOrder([
                'status' => 'pending',
                'date' => '2024-01-16',
                'customer' => 'Robert Brown',
                'number' => 'CMD-004',
                'phone' => '+242 06 655 04 96'
            ])
        ];

        $this->mockAppContext->shouldReceive('getOrders')
            ->andReturn($orders);

        // Test 1: Filtre par statut et date
        $this->commandesComponent->setFilters([
            'status' => 'pending',
            'date' => '2024-01-15'
        ]);
        $this->commandesComponent->applyFilters();
        $filteredOrders = $this->commandesComponent->getFilteredOrders();
        $this->assertCount(2, $filteredOrders);
        $this->assertEquals('CMD-001', $filteredOrders[0]['number']);
        $this->assertEquals('CMD-002', $filteredOrders[1]['number']);

        // Test 2: Filtre par statut, date et recherche
        $this->commandesComponent->setFilters([
            'status' => 'pending',
            'date' => '2024-01-15',
            'search' => 'john'
        ]);
        $this->commandesComponent->applyFilters();
        $filteredOrders = $this->commandesComponent->getFilteredOrders();
        $this->assertCount(1, $filteredOrders);
        $this->assertEquals('John Doe', $filteredOrders[0]['customer']);
        $this->assertEquals('CMD-001', $filteredOrders[0]['number']);

        // Test 3: Aucun filtre
        $this->commandesComponent->setFilters([
            'status' => 'all',
            'date' => '',
            'search' => ''
        ]);
        $this->commandesComponent->applyFilters();
        $filteredOrders = $this->commandesComponent->getFilteredOrders();
        $this->assertCount(4, $filteredOrders);
    }

    /** @test */
    public function it_handles_edge_cases_for_order_actions()
    {
        // Test avec une commande qui n'existe pas
        $nonExistentOrderId = 'CMD-999';
        $this->mockAppContext->shouldReceive('getOrders')
            ->andReturn([]);

        $result = $this->commandesComponent->handleOrderAction($nonExistentOrderId, 'start');
        $this->assertFalse($result, "Devrait retourner false pour une commande inexistante");

        // Test avec une action invalide
        $orderId = 'CMD-001';
        $order = $this->createMockOrder(['id' => $orderId]);
        $this->mockAppContext->shouldReceive('getOrders')
            ->andReturn([$order]);

        $result = $this->commandesComponent->handleOrderAction($orderId, 'invalid_action');
        $this->assertFalse($result, "Devrait retourner false pour une action invalide");

        // Test delayOrder avec commande inexistante
        $result = $this->commandesComponent->delayOrder($nonExistentOrderId);
        $this->assertFalse($result, "delayOrder devrait retourner false pour une commande inexistante");

        // Test notifyCustomer avec commande inexistante
        $result = $this->commandesComponent->notifyCustomer($nonExistentOrderId);
        $this->assertFalse($result, "notifyCustomer devrait retourner false pour une commande inexistante");
    }

    /**
     * Helper method to create a mock order
     */
    private function createMockOrder(array $overrides = [])
    {
        $defaultOrder = [
            'id' => 'CMD-' . rand(100, 999),
            'number' => 'CMD-' . rand(100, 999),
            'customer' => 'Test Customer',
            'phone' => '+242 06 655 04 99',
            'date' => date('Y-m-d'),
            'time' => '12:00',
            'status' => 'pending',
            'items' => [
                [
                    'name' => 'Test Item',
                    'price' => 5000,
                    'quantity' => 1,
                    'image' => 'https://example.com/image.jpg'
                ]
            ],
            'total' => 5000
        ];

        return array_merge($defaultOrder, $overrides);
    }
}

// ... (la classe CommandesComponent reste identique)

/**
 * Classe simulée pour représenter le composant Commandes React
 */
class CommandesComponent
{
    private $appContext;
    private $filteredOrders = [];
    private $filters = [
        'status' => 'all',
        'date' => '',
        'time' => 'all',
        'search' => ''
    ];
    private $isRefreshing = false;
    private $lastToast = null;

    public function __construct($appContext)
    {
        $this->appContext = $appContext;
    }

    public function getFilteredOrders()
    {
        return $this->filteredOrders;
    }

    public function setFilteredOrders($orders)
    {
        $this->filteredOrders = $orders;
    }

    public function getFilters()
    {
        return $this->filters;
    }

    public function setFilters($filters)
    {
        $this->filters = array_merge($this->filters, $filters);
    }

    public function isRefreshing()
    {
        return $this->isRefreshing;
    }

    public function getLastToast()
    {
        return $this->lastToast;
    }

    public function applyFilters()
    {
        $orders = $this->appContext->getOrders();
        $tempOrders = $orders;

        // Filtre par statut
        if ($this->filters['status'] !== 'all') {
            $tempOrders = array_filter($tempOrders, function($order) {
                return $order['status'] === $this->filters['status'];
            });
        }

        // Filtre par date
        if ($this->filters['date']) {
            $tempOrders = array_filter($tempOrders, function($order) {
                return $order['date'] === $this->filters['date'];
            });
        }

        // Filtre par recherche
        if ($this->filters['search']) {
            $searchTerm = strtolower($this->filters['search']);
            $tempOrders = array_filter($tempOrders, function($order) use ($searchTerm) {
                return strpos(strtolower($order['customer']), $searchTerm) !== false ||
                       strpos(strtolower($order['number']), $searchTerm) !== false ||
                       strpos($order['phone'], $searchTerm) !== false;
            });
        }

        $this->filteredOrders = array_values($tempOrders);
    }

    public function clearFilters()
    {
        $this->filters = [
            'status' => 'all',
            'date' => '',
            'time' => 'all',
            'search' => ''
        ];
        $this->showToast('Filtres réinitialisés', 'success');
    }

    public function handleOrderAction($orderId, $action)
    {
        $orders = $this->appContext->getOrders();
        $order = null;

        foreach ($orders as $o) {
            if ($o['id'] === $orderId) {
                $order = $o;
                break;
            }
        }

        if (!$order) {
            return false;
        }

        $actions = [
            'start' => function() use ($orderId) {
                $this->appContext->updateOrderStatus($orderId, 'preparing');
            },
            'ready' => function() use ($orderId) {
                $this->appContext->updateOrderStatus($orderId, 'ready');
            },
            'deliver' => function() use ($orderId) {
                $this->appContext->updateOrderStatus($orderId, 'delivered');
            },
            'cancel' => function() use ($orderId) {
                $this->appContext->updateOrderStatus($orderId, 'cancelled');
            },
            'delay' => function() use ($orderId) {
                $this->delayOrder($orderId);
            },
            'notify' => function() use ($orderId) {
                $this->notifyCustomer($orderId);
            }
        ];

        if (isset($actions[$action])) {
            $actions[$action]();
            return true;
        }

        return false;
    }

    public function delayOrder($orderId)
    {
        $orders = $this->appContext->getOrders();
        $order = null;

        foreach ($orders as $o) {
            if ($o['id'] === $orderId) {
                $order = $o;
                break;
            }
        }

        if ($order) {
            $this->showToast("Délai ajouté pour {$order['number']} (+15 minutes)", 'warning');
            return true;
        }

        return false;
    }

    public function notifyCustomer($orderId)
    {
        $orders = $this->appContext->getOrders();
        $order = null;

        foreach ($orders as $o) {
            if ($o['id'] === $orderId) {
                $order = $o;
                break;
            }
        }

        if ($order) {
            $this->showToast("Notification envoyée à {$order['customer']}", 'info');
            return true;
        }

        return false;
    }

    public function refreshOrders()
    {
        $this->isRefreshing = true;

        // Simulation du comportement asynchrone
        $orders = $this->appContext->getOrders();

        if (rand(0, 1) > 0.5) {
            $newOrder = [
                'id' => 'CMD-' . str_pad(count($orders) + 1, 3, '0', STR_PAD_LEFT),
                'number' => 'CMD-' . str_pad(count($orders) + 1, 3, '0', STR_PAD_LEFT),
                'customer' => 'Nouveau Client',
                'phone' => '+242 06 655 04 99',
                'date' => date('Y-m-d'),
                'time' => '15:30',
                'status' => 'pending',
                'items' => [
                    [
                        'name' => 'Plat du Jour',
                        'price' => 5000,
                        'quantity' => 1,
                        'image' => 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&h=120&fit=crop'
                    ]
                ],
                'total' => 5000
            ];

            $this->appContext->addNewOrder($newOrder);
            $this->showToast('Nouvelle commande reçue !', 'info');
        } else {
            $this->showToast('Liste des commandes actualisée', 'info');
        }

        $this->isRefreshing = false;
    }

    public function exportOrders()
    {
        $data = json_encode($this->filteredOrders, JSON_PRETTY_PRINT);
        $this->showToast('Export des commandes téléchargé', 'success');
        return $data;
    }

    public function getStatusText($status)
    {
        $statusMap = [
            'pending' => 'En attente',
            'preparing' => 'En préparation',
            'ready' => 'Prête',
            'delivered' => 'Livrée',
            'cancelled' => 'Annulée'
        ];

        return $statusMap[$status] ?? $status;
    }

    public function formatDate($dateString)
    {
        $date = new \DateTime($dateString . 'T00:00:00');
        $formatter = new \IntlDateFormatter('fr_FR', \IntlDateFormatter::LONG, \IntlDateFormatter::NONE);
        return $formatter->format($date);
    }

    public function formatPrice($price)
    {
        return number_format($price, 0, '', ' ');
    }

    public function getActionButtons($order)
    {
        $buttons = [
            'pending' => '<button class="btn-status btn-start"><i class="fas fa-play"></i> Démarrer</button>
                         <button class="btn-status btn-cancel"><i class="fas fa-times"></i> Annuler</button>',
            'preparing' => '<button class="btn-status btn-ready"><i class="fas fa-check"></i> Prête</button>
                           <button class="btn-status btn-delay"><i class="fas fa-clock"></i> Retarder</button>',
            'ready' => '<button class="btn-status btn-deliver"><i class="fas fa-truck"></i> Livrer</button>
                       <button class="btn-status btn-notify"><i class="fas fa-bell"></i> Notifier</button>',
            'delivered' => '<span class="text-muted small"><i class="fas fa-check-circle me-1"></i>Commande livrée</span>',
            'cancelled' => '<span class="text-muted small"><i class="fas fa-times-circle me-1"></i>Commande annulée</span>'
        ];

        return $buttons[$order['status']] ?? '';
    }

    public function showToast($message, $type = 'info')
    {
        $bgColor = [
            'success' => 'bg-success',
            'warning' => 'bg-warning',
            'error' => 'bg-danger',
            'info' => 'bg-primary'
        ][$type] ?? 'bg-primary';

        $icon = [
            'success' => 'check-circle',
            'warning' => 'exclamation-triangle',
            'error' => 'times-circle',
            'info' => 'info-circle'
        ][$type] ?? 'info-circle';

        $html = "
            <div class=\"toast align-items-center text-white {$bgColor} border-0 show\" role=\"alert\">
                <div class=\"d-flex\">
                    <div class=\"toast-body\">
                        <i class=\"fas fa-{$icon} me-2\"></i>
                        {$message}
                    </div>
                    <button type=\"button\" class=\"btn-close btn-close-white me-2 m-auto\" data-bs-dismiss=\"toast\"></button>
                </div>
            </div>
        ";

        $this->lastToast = [
            'message' => $message,
            'type' => $type,
            'html' => $html
        ];
    }

    public function calculateStatistics()
    {
        return [
            'totalOrders' => count($this->filteredOrders),
            'pendingOrders' => count(array_filter($this->filteredOrders, function($order) {
                return $order['status'] === 'pending';
            })),
            'preparingOrders' => count(array_filter($this->filteredOrders, function($order) {
                return $order['status'] === 'preparing';
            })),
            'readyOrders' => count(array_filter($this->filteredOrders, function($order) {
                return $order['status'] === 'ready';
            }))
        ];
    }

    public function handleImageError($imageUrl)
    {
        return 'https://via.placeholder.com/60x60/2d2d2d/cfbd97?text=🍽️';
    }
}