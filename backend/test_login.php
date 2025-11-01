<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Utilisateur;

echo "=== Testing Login Fix ===\n\n";

// Find admin user
$admin = Utilisateur::where('email', 'admin@test.com')->first();

if (!$admin) {
    echo "❌ Admin user not found!\n";
    echo "Run: php artisan db:seed --class=UtilisateurSeeder\n";
    exit(1);
}

echo "✓ Admin user found:\n";
echo "  - ID: {$admin->id_utilisateur}\n";
echo "  - Email: {$admin->email}\n";
echo "  - id_role: {$admin->id_role}\n";

// Map role
$roleMap = [
    1 => 'administrateur',
    2 => 'gerant',
    3 => 'employe',
    4 => 'etudiant',
];

$mappedRole = $roleMap[$admin->id_role] ?? 'etudiant';
echo "  - Mapped role: {$mappedRole}\n\n";

// Simulate what login returns
$userData = $admin->toArray();
$userData['id'] = $admin->id_utilisateur;
$userData['role'] = $mappedRole;
unset($userData['id_role']);

echo "✓ User data that will be returned:\n";
echo json_encode([
    'id' => $userData['id'],
    'email' => $userData['email'],
    'role' => $userData['role'],
    'nom' => $userData['nom'],
    'prenom' => $userData['prenom']
], JSON_PRETTY_PRINT);

echo "\n\n";

if ($mappedRole === 'administrateur') {
    echo "✅ Role mapping is CORRECT!\n";
    echo "   User should be able to access admin panel.\n";
} else {
    echo "❌ Role mapping is WRONG!\n";
    echo "   Expected: administrateur\n";
    echo "   Got: {$mappedRole}\n";
}
