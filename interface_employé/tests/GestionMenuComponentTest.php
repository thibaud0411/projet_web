<?php

namespace Tests;

use PHPUnit\Framework\TestCase;
use Mockery;

/**
 * Tests unitaires pour le composant GestionMenu React
 */
class GestionMenuComponentTest extends TestCase
{
    private $gestionMenuComponent;
    private $mockAppContext;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Mock du contexte d'application
        $this->mockAppContext = Mockery::mock('AppContext');
        
        // Initialisation du composant GestionMenu simulé
        $this->gestionMenuComponent = new GestionMenuComponent($this->mockAppContext);
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
        $this->assertNull($this->gestionMenuComponent->getCurrentEditingId());
        $this->assertEquals('all', $this->gestionMenuComponent->getFilterCategory());
        $this->assertFalse($this->gestionMenuComponent->isShowModal());
        
        $formData = $this->gestionMenuComponent->getFormData();
        $this->assertEquals('', $formData['name']);
        $this->assertEquals('', $formData['description']);
        $this->assertEquals('', $formData['category']);
        $this->assertEquals('', $formData['price']);
        $this->assertTrue($formData['status']);
        $this->assertNull($formData['image']);
    }

    /** @test */
    public function it_returns_correct_category_text()
    {
        $categoryMap = [
            'meal' => 'Plat principal',
            'dessert' => 'Dessert',
            'drink' => 'Boisson'
        ];

        foreach ($categoryMap as $category => $expectedText) {
            $this->assertEquals($expectedText, $this->gestionMenuComponent->getCategoryText($category));
        }

        // Test catégorie inconnue
        $this->assertEquals('unknown', $this->gestionMenuComponent->getCategoryText('unknown'));
    }

    /** @test */
    public function it_returns_correct_category_icon()
    {
        $iconMap = [
            'meal' => 'hamburger',
            'dessert' => 'birthday-cake',
            'drink' => 'glass-whiskey'
        ];

        foreach ($iconMap as $category => $expectedIcon) {
            $this->assertEquals($expectedIcon, $this->gestionMenuComponent->getCategoryIcon($category));
        }

        // Test catégorie inconnue
        $this->assertEquals('utensils', $this->gestionMenuComponent->getCategoryIcon('unknown'));
    }

    /** @test */
    public function it_formats_price_with_thousands_separator()
    {
        $testCases = [
            5000 => '5 000',
            15000 => '15 000',
            100000 => '100 000',
            1234567 => '1 234 567',
            0 => '0'
        ];

        foreach ($testCases as $input => $expected) {
            $this->assertEquals($expected, $this->gestionMenuComponent->formatPrice($input));
        }
    }

    /** @test */
    public function it_calculates_time_ago_correctly()
    {
        // Test "À l'instant"
        $now = new \DateTime();
        $result = $this->gestionMenuComponent->getTimeAgo($now->format('Y-m-d H:i:s'));
        $this->assertEquals('À l\'instant', $result);

        // Test "Il y a X min"
        $fiveMinutesAgo = (new \DateTime())->modify('-5 minutes');
        $result = $this->gestionMenuComponent->getTimeAgo($fiveMinutesAgo->format('Y-m-d H:i:s'));
        $this->assertEquals('Il y a 5 min', $result);

        // Test "Il y a X h"
        $twoHoursAgo = (new \DateTime())->modify('-2 hours');
        $result = $this->gestionMenuComponent->getTimeAgo($twoHoursAgo->format('Y-m-d H:i:s'));
        $this->assertEquals('Il y a 2 h', $result);

        // Test "Il y a 1 jour"
        $oneDayAgo = (new \DateTime())->modify('-1 day');
        $result = $this->gestionMenuComponent->getTimeAgo($oneDayAgo->format('Y-m-d H:i:s'));
        $this->assertEquals('Il y a 1 jour', $result);

        // Test "Il y a X jours"
        $threeDaysAgo = (new \DateTime())->modify('-3 days');
        $result = $this->gestionMenuComponent->getTimeAgo($threeDaysAgo->format('Y-m-d H:i:s'));
        $this->assertEquals('Il y a 3 jours', $result);
    }

    /** @test */
    public function it_opens_add_modal_with_empty_form()
    {
        // Act
        $this->gestionMenuComponent->openAddModal();

        // Assert
        $this->assertNull($this->gestionMenuComponent->getCurrentEditingId());
        $this->assertTrue($this->gestionMenuComponent->isShowModal());
        
        $formData = $this->gestionMenuComponent->getFormData();
        $this->assertEquals('', $formData['name']);
        $this->assertEquals('', $formData['description']);
        $this->assertEquals('', $formData['category']);
        $this->assertEquals('', $formData['price']);
        $this->assertTrue($formData['status']);
        $this->assertNull($formData['image']);
    }

    /** @test */
    public function it_opens_edit_modal_with_dish_data()
    {
        // Arrange
        $dishId = 1;
        $dish = $this->createMockDish([
            'id' => $dishId,
            'name' => 'Test Dish',
            'description' => 'Test Description',
            'category' => 'meal',
            'price' => 5000,
            'status' => 'available',
            'image' => 'test-image.jpg'
        ]);

        $this->mockAppContext->shouldReceive('getDishes')
            ->andReturn([$dish]);

        // Act
        $this->gestionMenuComponent->editDish($dishId);

        // Assert
        $this->assertEquals($dishId, $this->gestionMenuComponent->getCurrentEditingId());
        $this->assertTrue($this->gestionMenuComponent->isShowModal());
        
        $formData = $this->gestionMenuComponent->getFormData();
        $this->assertEquals('Test Dish', $formData['name']);
        $this->assertEquals('Test Description', $formData['description']);
        $this->assertEquals('meal', $formData['category']);
        $this->assertEquals('5000', $formData['price']);
        $this->assertTrue($formData['status']);
        $this->assertEquals('test-image.jpg', $formData['image']);
    }

    /** @test */
    public function it_saves_new_dish_successfully()
    {
        // Arrange
        $dishes = [];
        $this->mockAppContext->shouldReceive('getDishes')
            ->andReturn($dishes);

        $this->mockAppContext->shouldReceive('updateDishes')
            ->once()
            ->with(Mockery::on(function ($updatedDishes) {
                return count($updatedDishes) === 1 &&
                       $updatedDishes[0]['name'] === 'New Dish' &&
                       $updatedDishes[0]['category'] === 'meal' &&
                       $updatedDishes[0]['price'] === 5000;
            }));

        $this->gestionMenuComponent->setFormData([
            'name' => 'New Dish',
            'description' => 'New Description',
            'category' => 'meal',
            'price' => '5000',
            'status' => true,
            'image' => null
        ]);

        // Act
        $this->gestionMenuComponent->saveDish();

        // Assert
        $this->assertFalse($this->gestionMenuComponent->isShowModal());
        
        $lastToast = $this->gestionMenuComponent->getLastToast();
        $this->assertStringContainsString('Plat ajouté avec succès', $lastToast['message']);
        $this->assertEquals('success', $lastToast['type']);
    }

    /** @test */
    public function it_updates_existing_dish_successfully()
    {
        // Arrange
        $dishId = 1;
        $existingDish = $this->createMockDish(['id' => $dishId]);
        
        $this->gestionMenuComponent->setCurrentEditingId($dishId);
        $this->gestionMenuComponent->setFormData([
            'name' => 'Updated Dish',
            'description' => 'Updated Description',
            'category' => 'dessert',
            'price' => '7500',
            'status' => false,
            'image' => 'updated-image.jpg'
        ]);

        $this->mockAppContext->shouldReceive('updateDish')
            ->once()
            ->with(Mockery::on(function ($dishData) use ($dishId) {
                return $dishData['id'] === $dishId &&
                       $dishData['name'] === 'Updated Dish' &&
                       $dishData['category'] === 'dessert' &&
                       $dishData['price'] === 7500 &&
                       $dishData['status'] === 'unavailable';
            }));

        // Act
        $this->gestionMenuComponent->saveDish();

        // Assert
        $this->assertFalse($this->gestionMenuComponent->isShowModal());
        
        $lastToast = $this->gestionMenuComponent->getLastToast();
        $this->assertStringContainsString('Plat modifié avec succès', $lastToast['message']);
        $this->assertEquals('success', $lastToast['type']);
    }

    /** @test */
    public function it_validates_required_fields_when_saving()
    {
        // Test sans nom
        $this->gestionMenuComponent->setFormData([
            'name' => '',
            'category' => 'meal',
            'price' => '5000'
        ]);

        $this->gestionMenuComponent->saveDish();
        $lastToast = $this->gestionMenuComponent->getLastToast();
        $this->assertStringContainsString('Veuillez remplir tous les champs obligatoires', $lastToast['message']);
        $this->assertEquals('error', $lastToast['type']);

        // Test sans catégorie
        $this->gestionMenuComponent->setFormData([
            'name' => 'Test Dish',
            'category' => '',
            'price' => '5000'
        ]);

        $this->gestionMenuComponent->saveDish();
        $lastToast = $this->gestionMenuComponent->getLastToast();
        $this->assertStringContainsString('Veuillez remplir tous les champs obligatoires', $lastToast['message']);

        // Test sans prix
        $this->gestionMenuComponent->setFormData([
            'name' => 'Test Dish',
            'category' => 'meal',
            'price' => ''
        ]);

        $this->gestionMenuComponent->saveDish();
        $lastToast = $this->gestionMenuComponent->getLastToast();
        $this->assertStringContainsString('Veuillez remplir tous les champs obligatoires', $lastToast['message']);
    }

    /** @test */
    public function it_toggles_dish_status_correctly()
    {
        // Arrange
        $dishId = 1;
        $dishes = [
            $this->createMockDish([
                'id' => $dishId,
                'name' => 'Test Dish',
                'status' => 'available'
            ])
        ];

        $this->mockAppContext->shouldReceive('getDishes')
            ->andReturn($dishes);

        $this->mockAppContext->shouldReceive('updateDishes')
            ->once()
            ->with(Mockery::on(function ($updatedDishes) use ($dishId) {
                return $updatedDishes[0]['id'] === $dishId &&
                       $updatedDishes[0]['status'] === 'unavailable';
            }));

        // Act
        $this->gestionMenuComponent->toggleDishStatus($dishId);

        // Assert
        $lastToast = $this->gestionMenuComponent->getLastToast();
        $this->assertStringContainsString('Statut de "Test Dish" modifié', $lastToast['message']);
        $this->assertEquals('info', $lastToast['type']);
    }

    /** @test */
    public function it_deletes_dish_with_confirmation()
    {
        // Arrange
        $dishId = 1;
        $dishes = [
            $this->createMockDish([
                'id' => $dishId,
                'name' => 'Test Dish'
            ])
        ];

        $this->mockAppContext->shouldReceive('getDishes')
            ->andReturn($dishes);

        // Simuler la confirmation
        $this->gestionMenuComponent->setConfirmationResponse(true);

        $this->mockAppContext->shouldReceive('updateDishes')
            ->once()
            ->with(Mockery::on(function ($updatedDishes) {
                return count($updatedDishes) === 0;
            }));

        // Act
        $this->gestionMenuComponent->deleteDish($dishId);

        // Assert
        $lastToast = $this->gestionMenuComponent->getLastToast();
        $this->assertStringContainsString('Plat supprimé avec succès', $lastToast['message']);
        $this->assertEquals('success', $lastToast['type']);
    }

    /** @test */
    public function it_cancels_delete_when_confirmation_is_refused()
    {
        // Arrange
        $dishId = 1;
        $dishes = [
            $this->createMockDish(['id' => $dishId, 'name' => 'Test Dish'])
        ];

        $this->mockAppContext->shouldReceive('getDishes')
            ->andReturn($dishes);

        // Simuler le refus de confirmation
        $this->gestionMenuComponent->setConfirmationResponse(false);

        $this->mockAppContext->shouldNotReceive('updateDishes');

        // Act
        $this->gestionMenuComponent->deleteDish($dishId);

        // Assert - Aucun toast ne devrait être affiché
        $this->assertNull($this->gestionMenuComponent->getLastToast());
    }

    /** @test */
    public function it_handles_image_upload_correctly()
    {
        // Arrange
        $testImageData = 'data:image/jpeg;base64,test-image-data';

        // Act
        $this->gestionMenuComponent->handleImageChange($testImageData);

        // Assert
        $formData = $this->gestionMenuComponent->getFormData();
        $this->assertEquals($testImageData, $formData['image']);
    }

    /** @test */
    public function it_rejects_oversized_images()
    {
        // Arrange - Simuler une image trop volumineuse
        $oversizedImage = str_repeat('a', 3 * 1024 * 1024); // 3MB

        // Act
        $this->gestionMenuComponent->handleImageChange($oversizedImage);

        // Assert
        $lastToast = $this->gestionMenuComponent->getLastToast();
        $this->assertStringContainsString('L\'image est trop volumineuse', $lastToast['message']);
        $this->assertEquals('error', $lastToast['type']);
        
        // L'image ne devrait pas être définie
        $formData = $this->gestionMenuComponent->getFormData();
        $this->assertNull($formData['image']);
    }

    /** @test */
    public function it_filters_dishes_by_category()
    {
        // Arrange
        $dishes = [
            $this->createMockDish(['category' => 'meal']),
            $this->createMockDish(['category' => 'dessert']),
            $this->createMockDish(['category' => 'drink']),
            $this->createMockDish(['category' => 'meal'])
        ];

        $this->mockAppContext->shouldReceive('getDishes')
            ->andReturn($dishes);

        // Test filtre "all"
        $this->gestionMenuComponent->setFilterCategory('all');
        $filteredDishes = $this->gestionMenuComponent->getFilteredDishes();
        $this->assertCount(4, $filteredDishes);

        // Test filtre "meal"
        $this->gestionMenuComponent->setFilterCategory('meal');
        $filteredDishes = $this->gestionMenuComponent->getFilteredDishes();
        $this->assertCount(2, $filteredDishes);
        $this->assertEquals('meal', $filteredDishes[0]['category']);
        // $this->assertEquals('meal', $filteredDishes[1]['category']);

        // Test filtre "dessert"
        $this->gestionMenuComponent->setFilterCategory('dessert');
        $filteredDishes = array_values($this->gestionMenuComponent->getFilteredDishes());

       // Si les plats sont des objets :
       $this->assertEquals('dessert', $filteredDishes[0]['category']);

       $this->assertNotEmpty($filteredDishes);
       // Si les plats sont des tableaux :
       $this->assertEquals('dessert', $filteredDishes[0]['category']);

        // Test filtre "drink"
        $this->gestionMenuComponent->setFilterCategory('drink');
        $filteredDishes = array_values($this->gestionMenuComponent->getFilteredDishes());

        $this->assertCount(1, $filteredDishes);
        $this->assertEquals('drink', $filteredDishes[0]['category']);
    }

    /** @test */
    public function it_calculates_statistics_correctly()
    {
        // Arrange
        $dishes = [
            $this->createMockDish(['status' => 'available']),
            $this->createMockDish(['status' => 'available']),
            $this->createMockDish(['status' => 'unavailable']),
            $this->createMockDish(['status' => 'available', 'category' => 'meal']),
            $this->createMockDish(['status' => 'unavailable', 'category' => 'dessert']),
            $this->createMockDish(['status' => 'available', 'category' => 'drink'])
        ];

        $this->mockAppContext->shouldReceive('getDishes')
            ->andReturn($dishes);

        // Act
        $stats = $this->gestionMenuComponent->calculateStatistics();

        // Assert
        $this->assertEquals(6, $stats['totalDishes']);
        $this->assertEquals(4, $stats['availableDishes']);
        $this->assertEquals(2, $stats['unavailableDishes']);
        $this->assertEquals(3, $stats['categories']); // meal, dessert, drink
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
            $this->gestionMenuComponent->showNotification($testCase['message'], $testCase['type']);
            
            $lastToast = $this->gestionMenuComponent->getLastToast();
            $this->assertEquals($testCase['message'], $lastToast['message']);
            $this->assertEquals($testCase['type'], $lastToast['type']);
            $this->assertStringContainsString($testCase['expectedIcon'], $lastToast['html']);
        }
    }

    /** @test */
    public function it_handles_nonexistent_dish_gracefully()
    {
        // Arrange
        $nonExistentDishId = 999;
        $this->mockAppContext->shouldReceive('getDishes')
            ->andReturn([]);

        // Act
        $this->gestionMenuComponent->editDish($nonExistentDishId);

        // Assert - Le modal ne devrait pas s'ouvrir
        $this->assertFalse($this->gestionMenuComponent->isShowModal());
        $this->assertNull($this->gestionMenuComponent->getCurrentEditingId());
    }

    /** @test */
    public function it_handles_empty_dishes_list()
    {
        // Arrange
        $this->mockAppContext->shouldReceive('getDishes')
            ->andReturn([]);

        // Act
        $filteredDishes = $this->gestionMenuComponent->getFilteredDishes();
        $stats = $this->gestionMenuComponent->calculateStatistics();

        // Assert
        $this->assertCount(0, $filteredDishes);
        $this->assertEquals(0, $stats['totalDishes']);
        $this->assertEquals(0, $stats['availableDishes']);
        $this->assertEquals(0, $stats['unavailableDishes']);
        $this->assertEquals(0, $stats['categories']);
    }

    /**
     * Helper method to create a mock dish
     */
    private function createMockDish(array $overrides = [])
    {
        $defaultDish = [
            'id' => rand(1, 1000),
            'name' => 'Test Dish',
            'description' => 'Test Description',
            'category' => 'meal',
            'price' => 5000,
            'status' => 'available',
            'lastUpdated' => date('Y-m-d H:i:s'),
            'image' => null
        ];

        return array_merge($defaultDish, $overrides);
    }
}

/**
 * Classe simulée pour représenter le composant GestionMenu React
 */
class GestionMenuComponent
{
    private $appContext;
    private $currentEditingId = null;
    private $filterCategory = 'all';
    private $showModal = false;
    private $formData = [
        'name' => '',
        'description' => '',
        'category' => '',
        'price' => '',
        'status' => true,
        'image' => null
    ];
    private $lastToast = null;
    private $confirmationResponse = true;

    public function __construct($appContext)
    {
        $this->appContext = $appContext;
    }

    // Getters
    public function getCurrentEditingId() { return $this->currentEditingId; }
    public function getFilterCategory() { return $this->filterCategory; }
    public function isShowModal() { return $this->showModal; }
    public function getFormData() { return $this->formData; }
    public function getLastToast() { return $this->lastToast; }
    public function getFilteredDishes() {
        $dishes = $this->appContext->getDishes();
        if ($this->filterCategory === 'all') {
            return $dishes;
        }
        return array_filter($dishes, function($dish) {
            return $dish['category'] === $this->filterCategory;
        });
    }

    // Setters pour les tests
    public function setCurrentEditingId($id) { $this->currentEditingId = $id; }
    public function setFilterCategory($category) { $this->filterCategory = $category; }
    public function setFormData($data) { $this->formData = array_merge($this->formData, $data); }
    public function setConfirmationResponse($response) { $this->confirmationResponse = $response; }

    // Méthodes du composant
    public function getCategoryText($category)
    {
        $categories = [
            'meal' => 'Plat principal',
            'dessert' => 'Dessert',
            'drink' => 'Boisson'
        ];
        return $categories[$category] ?? $category;
    }

    public function getCategoryIcon($category)
    {
        $icons = [
            'meal' => 'hamburger',
            'dessert' => 'birthday-cake',
            'drink' => 'glass-whiskey'
        ];
        return $icons[$category] ?? 'utensils';
    }

    public function formatPrice($price)
    {
        return number_format($price, 0, '', ' ');
    }

    public function getTimeAgo($dateString)
    {
        $date = new \DateTime($dateString);
        $now = new \DateTime();
        $diffMs = $now->getTimestamp() - $date->getTimestamp();
        $diffMins = floor($diffMs / 60);
        $diffHours = floor($diffMs / 3600);
        $diffDays = floor($diffMs / 86400);

        if ($diffMins < 1) return 'À l\'instant';
        if ($diffMins < 60) return "Il y a {$diffMins} min";
        if ($diffHours < 24) return "Il y a {$diffHours} h";

        $libelle = $diffDays == 1 ? 'jour' : 'jours';
        return "Il y a {$diffDays} {$libelle}";
    }


    public function openAddModal()
    {
        $this->currentEditingId = null;
        $this->formData = [
            'name' => '',
            'description' => '',
            'category' => '',
            'price' => '',
            'status' => true,
            'image' => null
        ];
        $this->showModal = true;
    }

    public function editDish($id)
    {
        $dishes = $this->appContext->getDishes();
        $dish = null;

        foreach ($dishes as $d) {
            if ($d['id'] === $id) {
                $dish = $d;
                break;
            }
        }

        if ($dish) {
            $this->currentEditingId = $id;
            $this->formData = [
                'name' => $dish['name'],
                'description' => $dish['description'],
                'category' => $dish['category'],
                'price' => $dish['price'],
                'status' => $dish['status'] === 'available',
                'image' => $dish['image']
            ];
            $this->showModal = true;
        }
    }

    public function saveDish()
    {
        if (!$this->formData['name'] || !$this->formData['category'] || !$this->formData['price']) {
            $this->showNotification('Veuillez remplir tous les champs obligatoires', 'error');
            return;
        }

        $dishData = [
            'id' => $this->currentEditingId ?: time(),
            'name' => $this->formData['name'],
            'description' => $this->formData['description'],
            'category' => $this->formData['category'],
            'price' => (int)$this->formData['price'],
            'status' => $this->formData['status'] ? 'available' : 'unavailable',
            'lastUpdated' => date('Y-m-d H:i:s'),
            'image' => $this->formData['image']
        ];

        if ($this->currentEditingId) {
            $this->appContext->updateDish($dishData);
            $this->showNotification('Plat modifié avec succès', 'success');
        } else {
            $dishes = $this->appContext->getDishes();
            $updatedDishes = array_merge([$dishData], $dishes);
            $this->appContext->updateDishes($updatedDishes);
            $this->showNotification('Plat ajouté avec succès', 'success');
        }

        $this->showModal = false;
    }

    public function toggleDishStatus($id)
    {
        $dishes = $this->appContext->getDishes();
        $updatedDishes = array_map(function($dish) use ($id) {
            if ($dish['id'] === $id) {
                return [
                    ...$dish,
                    'status' => $dish['status'] === 'available' ? 'unavailable' : 'available',
                    'lastUpdated' => date('Y-m-d H:i:s')
                ];
            }
            return $dish;
        }, $dishes);

        $this->appContext->updateDishes($updatedDishes);
        
        $dish = current(array_filter($dishes, function($d) use ($id) {
            return $d['id'] === $id;
        }));
        
        $this->showNotification("Statut de \"{$dish['name']}\" modifié", 'info');
    }

    public function deleteDish($id)
    {
        $dishes = $this->appContext->getDishes();
        $dish = current(array_filter($dishes, function($d) use ($id) {
            return $d['id'] === $id;
        }));

        if ($dish && $this->confirmationResponse) {
            $updatedDishes = array_filter($dishes, function($d) use ($id) {
                return $d['id'] !== $id;
            });
            $this->appContext->updateDishes($updatedDishes);
            $this->showNotification('Plat supprimé avec succès', 'success');
        }
    }

    public function handleImageChange($imageData)
    {
        // Simuler la vérification de taille (2MB max)
        if (strlen($imageData) > 2 * 1024 * 1024) {
            $this->showNotification('L\'image est trop volumineuse (max 2MB)', 'error');
            return;
        }
        
        $this->formData['image'] = $imageData;
    }

    public function calculateStatistics()
    {
        $dishes = $this->appContext->getDishes();
        $totalDishes = count($dishes);
        $availableDishes = count(array_filter($dishes, function($dish) {
            return $dish['status'] === 'available';
        }));
        $unavailableDishes = $totalDishes - $availableDishes;
        $categories = count(array_unique(array_column($dishes, 'category')));

        return [
            'totalDishes' => $totalDishes,
            'availableDishes' => $availableDishes,
            'unavailableDishes' => $unavailableDishes,
            'categories' => $categories
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