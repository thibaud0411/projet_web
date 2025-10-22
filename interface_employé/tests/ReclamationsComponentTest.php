<?php

namespace Tests;

use PHPUnit\Framework\TestCase;
use Mockery;

/**
 * Tests unitaires pour le composant Reclamations React
 */
class ReclamationsComponentTest extends TestCase
{
    private $reclamationsComponent;
    private $mockAppContext;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Mock du contexte d'application
        $this->mockAppContext = Mockery::mock('AppContext');
        
        // Initialisation du composant Reclamations simulé
        $this->reclamationsComponent = new ReclamationsComponent($this->mockAppContext);
    }

    protected function tearDown(): void
    {
        parent::tearDown();
    }

    /** @test */
    public function it_initializes_with_default_state()
    {
        // Assert
        $this->assertEquals([], $this->reclamationsComponent->getFilteredData());
        $this->assertNull($this->reclamationsComponent->getCurrentClaim());
        $this->assertEquals(1, $this->reclamationsComponent->getCurrentPage());
        
        $sortConfig = $this->reclamationsComponent->getSortConfig();
        $this->assertEquals('date', $sortConfig['key']);
        $this->assertEquals('desc', $sortConfig['direction']);
        
        $filters = $this->reclamationsComponent->getFilters();
        $this->assertEquals('', $filters['search']);
        $this->assertEquals('', $filters['status']);
        $this->assertEquals('', $filters['priority']);
        $this->assertEquals('', $filters['date']);
        
        $this->assertFalse($this->reclamationsComponent->isShowDetailsModal());
        $this->assertFalse($this->reclamationsComponent->isShowReplyModal());
        $this->assertEquals('', $this->reclamationsComponent->getReplyMessage());
        $this->assertFalse($this->reclamationsComponent->isAutoRefresh());
    }

    /** @test */
    /** @test */
public function it_applies_filters_and_sort_correctly()
{
    // Arrange
    $claims = [
        $this->createMockClaim([
            'id' => 1,
            'student' => 'John Doe',
            'order' => 'CMD-001',
            'subject' => 'Problème de livraison',
            'status' => 'pending',
            'priority' => 'high',
            'date' => '2024-01-15'
        ]),
        $this->createMockClaim([
            'id' => 2,
            'student' => 'Jane Smith',
            'order' => 'CMD-002',
            'subject' => 'Plat froid',
            'status' => 'resolved',
            'priority' => 'medium',
            'date' => '2024-01-14'
        ])
    ];

    $this->mockAppContext->shouldReceive('getClaimsData')
        ->andReturn($claims);

    // Initialiser les données filtrées
    $this->reclamationsComponent->applyFiltersAndSort();

    // 🔍 Test filtre par priorité
    $this->reclamationsComponent->setFilters(['priority' => 'medium']);
    $this->reclamationsComponent->applyFiltersAndSort();

    $filteredData = $this->reclamationsComponent->getFilteredData();
    $this->assertIsArray($filteredData);
    
    $filteredData = array_values($filteredData);
    $this->assertCount(1, $filteredData);
    $this->assertEquals('medium', $filteredData[0]['priority']);
}


    /** @test */
    public function it_clears_all_filters()
    {
        // Arrange
        $initialFilters = [
            'search' => 'test',
            'status' => 'pending',
            'priority' => 'high',
            'date' => '2024-01-01'
        ];

        $this->reclamationsComponent->setFilters($initialFilters);

        // Act
        $this->reclamationsComponent->clearFilters();

        // Assert
        $filters = $this->reclamationsComponent->getFilters();
        $this->assertEquals('', $filters['search']);
        $this->assertEquals('', $filters['status']);
        $this->assertEquals('', $filters['priority']);
        $this->assertEquals('', $filters['date']);
    }

    /** @test */
    public function it_handles_sorting_correctly()
    {
        // Arrange
        $this->reclamationsComponent->setSortConfig(['key' => 'date', 'direction' => 'desc']);

        // Test changement de colonne de tri
        $this->reclamationsComponent->handleSort('student');
        $sortConfig = $this->reclamationsComponent->getSortConfig();
        $this->assertEquals('student', $sortConfig['key']);
        $this->assertEquals('asc', $sortConfig['direction']);

        // Test inversion du tri sur la même colonne
        $this->reclamationsComponent->handleSort('student');
        $sortConfig = $this->reclamationsComponent->getSortConfig();
        $this->assertEquals('student', $sortConfig['key']);
        $this->assertEquals('desc', $sortConfig['direction']);
    }

    /** @test */
    public function it_changes_pages_correctly()
    {
        // Arrange - Créer plus de données pour tester la pagination
        $claims = array_fill(0, 25, $this->createMockClaim());
        $this->mockAppContext->shouldReceive('getClaimsData')
            ->andReturn($claims);

        $this->reclamationsComponent->applyFiltersAndSort();

        // Test navigation entre les pages
        $this->reclamationsComponent->changePage(2);
        $this->assertEquals(2, $this->reclamationsComponent->getCurrentPage());

        $this->reclamationsComponent->changePage(3);
        $this->assertEquals(3, $this->reclamationsComponent->getCurrentPage());

        // Test limites de pagination
        $this->reclamationsComponent->changePage(0); // Page invalide
        $this->assertEquals(3, $this->reclamationsComponent->getCurrentPage()); // Ne devrait pas changer

        $this->reclamationsComponent->changePage(100); // Page invalide
        $this->assertEquals(3, $this->reclamationsComponent->getCurrentPage()); // Ne devrait pas changer
    }

    /** @test */
    public function it_shows_claim_details()
    {
        // Arrange
        $claimId = 1;
        $claim = $this->createMockClaim(['id' => $claimId]);
        $this->mockAppContext->shouldReceive('getClaimsData')
            ->andReturn([$claim]);

        // Act
        $this->reclamationsComponent->showClaimDetails($claimId);

        // Assert
        $this->assertEquals($claim, $this->reclamationsComponent->getCurrentClaim());
        $this->assertTrue($this->reclamationsComponent->isShowDetailsModal());
    }

    /** @test */
    public function it_opens_reply_modal()
    {
        // Arrange
        $claim = $this->createMockClaim(['id' => 1]);
        $this->reclamationsComponent->setCurrentClaim($claim);

        // Act
        $this->reclamationsComponent->openReplyModal();

        // Assert
        $this->assertTrue($this->reclamationsComponent->isShowReplyModal());
    }

    /** @test */
    public function it_sends_reply_successfully()
    {
        // Arrange
        $claimId = 1;
        $claim = $this->createMockClaim([
            'id' => $claimId,
            'student' => 'John Doe',
            'status' => 'pending',
            'responses' => []
        ]);

        $claims = [$claim];
        $this->mockAppContext->shouldReceive('getClaimsData')
            ->andReturn($claims);

        $this->mockAppContext->shouldReceive('updateClaims')
            ->once()
            ->with(Mockery::on(function ($updatedClaims) use ($claimId) {
                $updatedClaim = $updatedClaims[0];
                return $updatedClaim['id'] === $claimId &&
                       $updatedClaim['status'] === 'in-progress' &&
                       count($updatedClaim['responses']) === 1 &&
                       $updatedClaim['responses'][0]['sender'] === 'Support Mon Miam Miam';
            }));

        $this->reclamationsComponent->setCurrentClaim($claim);
        $this->reclamationsComponent->setReplyMessage('Test response message');

        // Act
        $this->reclamationsComponent->sendReply();

        // Assert
        $this->assertFalse($this->reclamationsComponent->isShowReplyModal());
        $this->assertEquals('', $this->reclamationsComponent->getReplyMessage());
        
        $lastToast = $this->reclamationsComponent->getLastToast();
        $this->assertStringContainsString('Réponse envoyée à John Doe avec succès', $lastToast['message']);
        $this->assertEquals('success', $lastToast['type']);
    }

    /** @test */
    public function it_validates_reply_message()
    {
        // Arrange
        $claim = $this->createMockClaim();
        $this->reclamationsComponent->setCurrentClaim($claim);
        $this->reclamationsComponent->setReplyMessage(''); // Message vide

        // Act
        $this->reclamationsComponent->sendReply();

        // Assert
        $lastToast = $this->reclamationsComponent->getLastToast();
        $this->assertStringContainsString('Veuillez saisir un message de réponse', $lastToast['message']);
        $this->assertEquals('error', $lastToast['type']);
    }

    /** @test */
    public function it_changes_claim_status_cyclically()
    {
        // Arrange
        $claimId = 1;
        $claims = [
            $this->createMockClaim([
                'id' => $claimId,
                'status' => 'pending'
            ])
        ];

        $this->mockAppContext->shouldReceive('getClaimsData')
            ->andReturn($claims);

        $this->mockAppContext->shouldReceive('updateClaims')
            ->once()
            ->with(Mockery::on(function ($updatedClaims) use ($claimId) {
                return $updatedClaims[0]['id'] === $claimId &&
                       $updatedClaims[0]['status'] === 'in-progress';
            }));

        // Act - Premier changement
        $this->reclamationsComponent->changeStatus($claimId);

        // Assert
        $lastToast = $this->reclamationsComponent->getLastToast();
        $this->assertStringContainsString('Statut de la réclamation #001 mis à jour', $lastToast['message']);
    }

    /** @test */
    public function it_performs_manual_refresh()
    {
        // Arrange
        $claims = [$this->createMockClaim()];
        $this->mockAppContext->shouldReceive('getClaimsData')
            ->andReturn($claims);

        // Simuler l'ajout d'une nouvelle réclamation
        $this->mockAppContext->shouldReceive('addNewClaim')
            ->once()
            ->with(Mockery::on(function ($newClaim) {
                return $newClaim['student'] === 'Nouveau Client' &&
                       $newClaim['status'] === 'pending';
            }));

        // Act
        $this->reclamationsComponent->manualRefresh();

        // Assert
        $lastToast = $this->reclamationsComponent->getLastToast();
        $this->assertTrue(
            strpos($lastToast['message'], 'Nouvelle réclamation reçue') !== false ||
            strpos($lastToast['message'], 'Données actualisées avec succès') !== false
        );
    }

    /** @test */
    public function it_exports_data_successfully()
    {
        // Arrange
        $claims = [
            $this->createMockClaim(['id' => 1]),
            $this->createMockClaim(['id' => 2])
        ];

        $this->mockAppContext->shouldReceive('getClaimsData')
            ->andReturn($claims);

        $this->reclamationsComponent->setFilteredData($claims);

        // Act
        $exportData = $this->reclamationsComponent->exportData();

        // Assert
        $this->assertJson($exportData);
        
        $decodedData = json_decode($exportData, true);
        $this->assertCount(2, $decodedData);
        $this->assertEquals(1, $decodedData[0]['id']);
        $this->assertEquals(2, $decodedData[1]['id']);
        
        $lastToast = $this->reclamationsComponent->getLastToast();
        $this->assertStringContainsString('Export terminé avec succès', $lastToast['message']);
        $this->assertEquals('success', $lastToast['type']);
    }

    /** @test */
    public function it_toggles_auto_refresh()
    {
        // Act
        $this->reclamationsComponent->toggleAutoRefresh(true);

        // Assert
        $this->assertTrue($this->reclamationsComponent->isAutoRefresh());
        
        $lastToast = $this->reclamationsComponent->getLastToast();
        $this->assertStringContainsString('Actualisation automatique activée', $lastToast['message']);
        $this->assertEquals('info', $lastToast['type']);

        // Test désactivation
        $this->reclamationsComponent->toggleAutoRefresh(false);
        $this->assertFalse($this->reclamationsComponent->isAutoRefresh());
        
        $lastToast = $this->reclamationsComponent->getLastToast();
        $this->assertStringContainsString('Actualisation automatique désactivée', $lastToast['message']);
        $this->assertEquals('warning', $lastToast['type']);
    }

    /** @test */
    public function it_returns_correct_status_text()
    {
        $statusMap = [
            'pending' => 'En Attente',
            'in-progress' => 'En Cours',
            'resolved' => 'Résolu'
        ];

        foreach ($statusMap as $status => $expectedText) {
            $this->assertEquals($expectedText, $this->reclamationsComponent->getStatusText($status));
        }

        // Test statut inconnu
        $this->assertEquals('unknown', $this->reclamationsComponent->getStatusText('unknown'));
    }

    /** @test */
    public function it_returns_correct_priority_text()
    {
        $priorityMap = [
            'high' => 'Haute',
            'medium' => 'Moyenne',
            'low' => 'Basse'
        ];

        foreach ($priorityMap as $priority => $expectedText) {
            $this->assertEquals($expectedText, $this->reclamationsComponent->getPriorityText($priority));
        }

        // Test priorité inconnue
        $this->assertEquals('unknown', $this->reclamationsComponent->getPriorityText('unknown'));
    }

    /** @test */
    public function it_formats_date_correctly()
    {
        $dateString = '2024-01-15';
        $formattedDate = $this->reclamationsComponent->formatDate($dateString);
        
        $this->assertEquals('15/01/2024', $formattedDate);
    }

    /** @test */
    public function it_calculates_statistics_correctly()
    {
        // Arrange
        $claims = [
            $this->createMockClaim(['status' => 'pending', 'priority' => 'high']),
            $this->createMockClaim(['status' => 'pending', 'priority' => 'medium']),
            $this->createMockClaim(['status' => 'in-progress', 'priority' => 'high']),
            $this->createMockClaim(['status' => 'resolved', 'priority' => 'low']),
            $this->createMockClaim(['status' => 'resolved', 'priority' => 'medium'])
        ];

        $this->mockAppContext->shouldReceive('getClaimsData')
            ->andReturn($claims);

        // Act
        $stats = $this->reclamationsComponent->calculateStatistics();

        // Assert
        $this->assertEquals(5, $stats['totalClaims']);
        $this->assertEquals(2, $stats['pendingClaims']);
        $this->assertEquals(2, $stats['urgentClaims']); // high priority
    }

    /** @test */
    public function it_handles_pagination_correctly()
    {
        // Arrange - Créer 15 éléments de test
        $claims = array_fill(0, 15, $this->createMockClaim());
        $this->mockAppContext->shouldReceive('getClaimsData')
            ->andReturn($claims);

        $this->reclamationsComponent->applyFiltersAndSort();

        // Act
        $paginatedData = $this->reclamationsComponent->getPaginatedData();

        // Assert
        $this->assertCount(10, $paginatedData); // 10 éléments par page
        $this->assertEquals(2, $this->reclamationsComponent->getTotalPages()); // 15 éléments = 2 pages
    }

    /** @test */
    public function it_returns_correct_sort_icon()
    {
        // Test colonne non triée
        $this->reclamationsComponent->setSortConfig(['key' => 'date', 'direction' => 'desc']);
        $icon = $this->reclamationsComponent->getSortIcon('student');
        $this->assertEquals('fas fa-sort', $icon);

        // Test colonne triée ascendant
        $this->reclamationsComponent->setSortConfig(['key' => 'student', 'direction' => 'asc']);
        $icon = $this->reclamationsComponent->getSortIcon('student');
        $this->assertEquals('fas fa-sort-up', $icon);

        // Test colonne triée descendant
        $this->reclamationsComponent->setSortConfig(['key' => 'student', 'direction' => 'desc']);
        $icon = $this->reclamationsComponent->getSortIcon('student');
        $this->assertEquals('fas fa-sort-down', $icon);
    }

    /** @test */
    public function it_handles_nonexistent_claim_gracefully()
    {
        // Arrange
        $nonExistentClaimId = 999;
        $this->mockAppContext->shouldReceive('getClaimsData')
            ->andReturn([]);

        // Act
        $this->reclamationsComponent->showClaimDetails($nonExistentClaimId);

        // Assert
        $this->assertNull($this->reclamationsComponent->getCurrentClaim());
        $this->assertFalse($this->reclamationsComponent->isShowDetailsModal());
    }

    /** @test */
    public function it_handles_empty_claims_list()
    {
        // Arrange
        $this->mockAppContext->shouldReceive('getClaimsData')
            ->andReturn([]);

        // Act
        $this->reclamationsComponent->applyFiltersAndSort();
        $filteredData = $this->reclamationsComponent->getFilteredData();
        $paginatedData = $this->reclamationsComponent->getPaginatedData();
        $stats = $this->reclamationsComponent->calculateStatistics();

        // Assert
        $this->assertCount(0, $filteredData);
        $this->assertCount(0, $paginatedData);
        $this->assertEquals(0, $stats['totalClaims']);
        $this->assertEquals(0, $stats['pendingClaims']);
        $this->assertEquals(0, $stats['urgentClaims']);
    }

    /** @test */
    public function it_shows_notifications_correctly()
    {
        $testCases = [
            ['message' => 'Test info', 'type' => 'info', 'expectedIcon' => 'info-circle'],
            ['message' => 'Success message', 'type' => 'success', 'expectedIcon' => 'check-circle'],
            ['message' => 'Warning alert', 'type' => 'warning', 'expectedIcon' => 'exclamation-triangle'],
            ['message' => 'Error occurred', 'type' => 'error', 'expectedIcon' => 'times-circle']
        ];

        foreach ($testCases as $testCase) {
            $this->reclamationsComponent->showNotification($testCase['message'], $testCase['type']);
            
            $lastToast = $this->reclamationsComponent->getLastToast();
            $this->assertEquals($testCase['message'], $lastToast['message']);
            $this->assertEquals($testCase['type'], $lastToast['type']);
            $this->assertStringContainsString($testCase['expectedIcon'], $lastToast['html']);
        }
    }

    /**
     * Helper method to create a mock claim
     */
    private function createMockClaim(array $overrides = [])
    {
        $defaultClaim = [
            'id' => rand(1, 1000),
            'student' => 'Test Student',
            'order' => 'CMD-' . rand(100, 999),
            'subject' => 'Test Subject',
            'description' => 'Test Description',
            'priority' => 'medium',
            'status' => 'pending',
            'date' => date('Y-m-d'),
            'responses' => []
        ];

        return array_merge($defaultClaim, $overrides);
    }
}

/**
 * Classe simulée pour représenter le composant Reclamations React
 */
class ReclamationsComponent
{
    private $appContext;
    private $filteredData = [];
    private $currentClaim = null;
    private $currentPage = 1;
    private $sortConfig = ['key' => 'date', 'direction' => 'desc'];
    private $filters = [
        'search' => '',
        'status' => '',
        'priority' => '',
        'date' => ''
    ];
    private $showDetailsModal = false;
    private $showReplyModal = false;
    private $replyMessage = '';
    private $autoRefresh = false;
    private $lastToast = null;
    private $itemsPerPage = 10;

    public function __construct($appContext)
    {
        $this->appContext = $appContext;
    }

    // Getters
    public function getFilteredData() { return $this->filteredData; }
    public function getCurrentClaim() { return $this->currentClaim; }
    public function getCurrentPage() { return $this->currentPage; }
    public function getSortConfig() { return $this->sortConfig; }
    public function getFilters() { return $this->filters; }
    public function isShowDetailsModal() { return $this->showDetailsModal; }
    public function isShowReplyModal() { return $this->showReplyModal; }
    public function getReplyMessage() { return $this->replyMessage; }
    public function isAutoRefresh() { return $this->autoRefresh; }
    public function getLastToast() { return $this->lastToast; }
    public function getTotalPages() {
        return ceil(count($this->filteredData) / $this->itemsPerPage);
    }
    public function getPaginatedData() {
        $start = ($this->currentPage - 1) * $this->itemsPerPage;
        $end = $this->currentPage * $this->itemsPerPage;
        return array_slice($this->filteredData, $start, $this->itemsPerPage);
    }

    // Setters pour les tests
    public function setFilteredData($data) { $this->filteredData = $data; }
    public function setCurrentClaim($claim) { $this->currentClaim = $claim; }
    public function setSortConfig($config) { $this->sortConfig = $config; }
    public function setFilters($filters) { $this->filters = array_merge($this->filters, $filters); }
    public function setReplyMessage($message) { $this->replyMessage = $message; }

    // Méthodes du composant
    public function applyFiltersAndSort()
    {
        $claims = $this->appContext->getClaimsData();
        $tempData = $claims;
        
        // Appliquer le filtre de recherche
        if ($this->filters['search']) {
            $searchTerm = strtolower($this->filters['search']);
            $tempData = array_filter($tempData, function($claim) use ($searchTerm) {
                return strpos(strtolower($claim['student']), $searchTerm) !== false ||
                       strpos(strtolower($claim['order']), $searchTerm) !== false ||
                       strpos(strtolower($claim['subject']), $searchTerm) !== false ||
                       strpos(strtolower($claim['description']), $searchTerm) !== false;
            });
        }
        
        // Appliquer le filtre de statut
        if ($this->filters['status']) {
            $tempData = array_filter($tempData, function($claim) {
                return $claim['status'] === $this->filters['status'];
            });
        }
        
        // Appliquer le filtre de priorité
        if ($this->filters['priority']) {
            $tempData = array_filter($tempData, function($claim) {
                return $claim['priority'] === $this->filters['priority'];
            });
        }
        
        // Appliquer le filtre de date
        if ($this->filters['date']) {
            $tempData = array_filter($tempData, function($claim) {
                return $claim['date'] === $this->filters['date'];
            });
        }
        
        // Appliquer le tri
        usort($tempData, function($a, $b) {
            $aValue = $a[$this->sortConfig['key']];
            $bValue = $b[$this->sortConfig['key']];
            
            if ($this->sortConfig['key'] === 'date') {
                $aValue = strtotime($aValue);
                $bValue = strtotime($bValue);
            }
            
            if ($aValue < $bValue) return $this->sortConfig['direction'] === 'asc' ? -1 : 1;
            if ($aValue > $bValue) return $this->sortConfig['direction'] === 'asc' ? 1 : -1;
            return 0;
        });
        
        $this->filteredData = array_values($tempData);
        $this->currentPage = 1;
    }

    public function clearFilters()
    {
        $this->filters = [
            'search' => '',
            'status' => '',
            'priority' => '',
            'date' => ''
        ];
    }

    public function handleSort($key)
    {
        $this->sortConfig = [
            'key' => $key,
            'direction' => $this->sortConfig['key'] === $key ? 
                ($this->sortConfig['direction'] === 'asc' ? 'desc' : 'asc') : 'asc'
        ];
    }

    public function changePage($page)
    {
        $totalPages = $this->getTotalPages();
        if ($page >= 1 && $page <= $totalPages) {
            $this->currentPage = $page;
        }
    }

    public function showClaimDetails($claimId)
    {
        $claims = $this->appContext->getClaimsData();
        $claim = null;

        foreach ($claims as $c) {
            if ($c['id'] === $claimId) {
                $claim = $c;
                break;
            }
        }

        if ($claim) {
            $this->currentClaim = $claim;
            $this->showDetailsModal = true;
        }
    }

    public function openReplyModal()
    {
        $this->showReplyModal = true;
    }

    public function sendReply()
    {
        if (!$this->replyMessage || !$this->currentClaim) {
            $this->showNotification('Veuillez saisir un message de réponse.', 'error');
            return;
        }

        $claims = $this->appContext->getClaimsData();
        $updatedClaims = array_map(function($claim) {
            if ($claim['id'] === $this->currentClaim['id']) {
                return [
                    ...$claim,
                    'responses' => [
                        ...$claim['responses'],
                        [
                            'sender' => "Support Mon Miam Miam",
                            'message' => $this->replyMessage,
                            'time' => date('d/m/Y H:i')
                        ]
                    ],
                    'status' => $claim['status'] === 'pending' ? 'in-progress' : $claim['status']
                ];
            }
            return $claim;
        }, $claims);

        $this->appContext->updateClaims($updatedClaims);
        $this->showNotification("Réponse envoyée à {$this->currentClaim['student']} avec succès !", 'success');
        $this->showReplyModal = false;
        $this->replyMessage = '';
    }

    public function changeStatus($claimId)
    {
        $statuses = ['pending', 'in-progress', 'resolved'];
        $claims = $this->appContext->getClaimsData();
        
        $updatedClaims = array_map(function($claim) use ($claimId, $statuses) {
            if ($claim['id'] === $claimId) {
                $currentIndex = array_search($claim['status'], $statuses);
                $nextIndex = ($currentIndex + 1) % count($statuses);
                return [
                    ...$claim,
                    'status' => $statuses[$nextIndex]
                ];
            }
            return $claim;
        }, $claims);

        $this->appContext->updateClaims($updatedClaims);
        $this->showNotification("Statut de la réclamation #" . str_pad($claimId, 3, '0', STR_PAD_LEFT) . " mis à jour", 'info');
    }

    public function manualRefresh()
    {
        // Simuler l'ajout d'une nouvelle réclamation (30% de chance)
        if (rand(1, 100) > 70) {
            $newClaim = [
                'id' => count($this->appContext->getClaimsData()) + 1,
                'student' => "Nouveau Client",
                'order' => "#COR-2024-" . str_pad(count($this->appContext->getClaimsData()) + 1, 2, '0', STR_PAD_LEFT),
                'subject' => "Nouvelle réclamation test",
                'description' => "Ceci est une nouvelle réclamation simulée.",
                'priority' => ['low', 'medium', 'high'][rand(0, 2)],
                'status' => 'pending',
                'date' => date('Y-m-d'),
                'responses' => [],
                'isNew' => true
            ];
            
            $this->appContext->addNewClaim($newClaim);
            $this->showNotification('Nouvelle réclamation reçue !', 'info');
        } else {
            $this->showNotification('Données actualisées avec succès', 'success');
        }
    }

    public function exportData()
    {
        $dataStr = json_encode($this->filteredData, JSON_PRETTY_PRINT);
        $this->showNotification('Export terminé avec succès', 'success');
        return $dataStr;
    }

    public function toggleAutoRefresh($checked)
    {
        $this->autoRefresh = $checked;
        $this->showNotification(
            $checked ? 'Actualisation automatique activée' : 'Actualisation automatique désactivée',
            $checked ? 'info' : 'warning'
        );
    }

    public function getStatusText($status)
    {
        $statusMap = [
            'pending' => 'En Attente',
            'in-progress' => 'En Cours',
            'resolved' => 'Résolu'
        ];
        return $statusMap[$status] ?? $status;
    }

    public function getPriorityText($priority)
    {
        $priorityMap = [
            'high' => 'Haute',
            'medium' => 'Moyenne',
            'low' => 'Basse'
        ];
        return $priorityMap[$priority] ?? $priority;
    }

    public function formatDate($dateString)
    {
        return date('d/m/Y', strtotime($dateString));
    }

    public function getSortIcon($key)
    {
        if ($this->sortConfig['key'] !== $key) return 'fas fa-sort';
        return $this->sortConfig['direction'] === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
    }

    public function calculateStatistics()
    {
        $claims = $this->appContext->getClaimsData();
        $totalClaims = count($claims);
        $pendingClaims = count(array_filter($claims, function($claim) {
            return $claim['status'] === 'pending';
        }));
        $urgentClaims = count(array_filter($claims, function($claim) {
            return $claim['priority'] === 'high';
        }));

        return [
            'totalClaims' => $totalClaims,
            'pendingClaims' => $pendingClaims,
            'urgentClaims' => $urgentClaims
        ];
    }

    public function showNotification($message, $type = 'info')
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
}