<?php

/**
 * Script de test des endpoints API
 * Usage: php test_endpoints.php
 */

require __DIR__.'/vendor/autoload.php';

$baseUrl = 'http://localhost:8000/api';
$passed = 0;
$failed = 0;

echo "=== Test des Endpoints API ===\n\n";

// Fonction pour tester un endpoint
function testEndpoint($url, $method = 'GET', $data = null, $token = null) {
    $ch = curl_init($url);
    
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    
    $headers = ['Accept: application/json', 'Content-Type: application/json'];
    if ($token) {
        $headers[] = "Authorization: Bearer $token";
    }
    
    if ($data) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return ['code' => $httpCode, 'response' => json_decode($response, true)];
}

// 1. Test Routes Publiques
echo "📂 ROUTES PUBLIQUES\n";
echo str_repeat('-', 50) . "\n";

$publicTests = [
    ['GET', '/articles', 'Articles'],
    ['GET', '/categories-list', 'Catégories'],
    ['GET', '/promotions', 'Promotions'],
    ['GET', '/evenements', 'Événements'],
];

foreach ($publicTests as [$method, $endpoint, $name]) {
    $result = testEndpoint($baseUrl . $endpoint, $method);
    if ($result['code'] === 200) {
        echo "✅ $name: OK (200)\n";
        $passed++;
    } else {
        echo "❌ $name: FAIL ({$result['code']})\n";
        $failed++;
    }
}

echo "\n";

// 2. Test Login
echo "🔐 TEST AUTHENTIFICATION\n";
echo str_repeat('-', 50) . "\n";

$loginResult = testEndpoint($baseUrl . '/login', 'POST', [
    'email' => 'admin@test.com',
    'password' => 'password'
]);

if ($loginResult['code'] === 200 && isset($loginResult['response']['token'])) {
    echo "✅ Login: OK (200)\n";
    echo "   Token: " . substr($loginResult['response']['token'], 0, 20) . "...\n";
    $token = $loginResult['response']['token'];
    $passed++;
} else {
    echo "❌ Login: FAIL ({$loginResult['code']})\n";
    if (isset($loginResult['response']['message'])) {
        echo "   Error: {$loginResult['response']['message']}\n";
    }
    $token = null;
    $failed++;
}

echo "\n";

// 3. Test Routes Authentifiées
if ($token) {
    echo "🔒 ROUTES AUTHENTIFIÉES\n";
    echo str_repeat('-', 50) . "\n";
    
    $authTests = [
        ['GET', '/user', 'User Info'],
        ['GET', '/commandes', 'Mes Commandes'],
        ['GET', '/reclamations', 'Mes Réclamations'],
    ];
    
    foreach ($authTests as [$method, $endpoint, $name]) {
        $result = testEndpoint($baseUrl . $endpoint, $method, null, $token);
        if ($result['code'] === 200) {
            echo "✅ $name: OK (200)\n";
            $passed++;
        } else {
            echo "❌ $name: FAIL ({$result['code']})\n";
            $failed++;
        }
    }
    
    echo "\n";
    
    // 4. Test Routes Admin
    echo "👨‍💼 ROUTES ADMIN\n";
    echo str_repeat('-', 50) . "\n";
    
    $adminTests = [
        ['GET', '/admin/statistics', 'Statistics'],
        ['GET', '/admin/employees', 'Employés'],
        ['GET', '/admin/commandes-all', 'Toutes Commandes'],
        ['GET', '/admin/reclamations-all', 'Toutes Réclamations'],
    ];
    
    foreach ($adminTests as [$method, $endpoint, $name]) {
        $result = testEndpoint($baseUrl . $endpoint, $method, null, $token);
        if ($result['code'] === 200) {
            echo "✅ $name: OK (200)\n";
            $passed++;
        } else {
            echo "❌ $name: FAIL ({$result['code']})\n";
            $failed++;
        }
    }
}

echo "\n";
echo str_repeat('=', 50) . "\n";
echo "RÉSULTATS: $passed passés, $failed échoués\n";
echo str_repeat('=', 50) . "\n";

if ($failed === 0) {
    echo "\n🎉 Tous les tests sont passés!\n";
    exit(0);
} else {
    echo "\n⚠️ Certains tests ont échoué. Vérifiez:\n";
    echo "  - Le serveur est démarré (php artisan serve)\n";
    echo "  - La base de données est migrée (php artisan migrate)\n";
    echo "  - Les seeders sont exécutés (php artisan db:seed)\n";
    exit(1);
}
