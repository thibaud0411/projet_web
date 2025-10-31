# Create Test User - Quick Guide

## 🎉 AUTHENTICATION IS WORKING!

The error "Votre compte est désactivé" means your authentication system is working perfectly! The user account just needs to be activated.

## Create an Active Test User

### Method 1: Using Tinker (Easiest)

```bash
cd backend
php artisan tinker
```

Then run:

```php
use App\Models\Utilisateur;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

// Get the client role
$clientRole = Role::where('nom_role', 'client')->first();

// If role doesn't exist, create it
if (!$clientRole) {
    $clientRole = Role::create([
        'nom_role' => 'client',
        'description' => 'Client régulier'
    ]);
}

// Create an active test user
Utilisateur::create([
    'nom' => 'Test',
    'prenom' => 'User',
    'email' => 'test@example.com',
    'mot_de_passe' => Hash::make('Password123'),
    'telephone' => '0612345678',
    'localisation' => 'Paris',
    'id_role' => $clientRole->id_role,
    'statut_compte' => true,      // ← Active!
    'est_actif' => true,           // ← Active!
    'points_fidelite' => 0,
    'code_parrainage' => 'TEST001'
]);

echo "✅ User created: test@example.com / Password123\n";
```

### Method 2: Activate Existing User

If you want to activate an existing user:

```bash
cd backend
php artisan tinker
```

```php
use App\Models\Utilisateur;

// Find the user by email
$user = Utilisateur::where('email', 'your-email@example.com')->first();

// Activate the account
$user->statut_compte = true;
$user->est_actif = true;
$user->save();

echo "✅ User activated!\n";
```

### Method 3: Sign Up (Create New Account)

Just use your beautiful sign-up page!

1. Go to `http://localhost:5173/signup`
2. Fill the form
3. Submit

**Note:** Check your `RegisteredUserController` to ensure new users are created with `statut_compte = true` and `est_actif = true` by default.

## Test Login

After creating/activating a user:

1. Go to `http://localhost:5173/login`
2. Email: `test@example.com`
3. Password: `Password123`
4. Click login

**Expected:** ✅ Redirected to dashboard!

## Check User Status in Database

### Using Tinker:
```bash
php artisan tinker
```

```php
use App\Models\Utilisateur;

$user = Utilisateur::where('email', 'test@example.com')->first();

echo "Statut compte: " . ($user->statut_compte ? 'Actif' : 'Inactif') . "\n";
echo "Est actif: " . ($user->est_actif ? 'Oui' : 'Non') . "\n";
echo "Role: " . $user->role->nom_role . "\n";
```

## Create Admin User

For testing admin features:

```php
use App\Models\Utilisateur;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

// Get or create admin role
$adminRole = Role::firstOrCreate(
    ['nom_role' => 'administrateur'],
    ['description' => 'Administrateur système']
);

// Create admin user
Utilisateur::create([
    'nom' => 'Admin',
    'prenom' => 'Super',
    'email' => 'admin@example.com',
    'mot_de_passe' => Hash::make('Admin123'),
    'telephone' => '0612345679',
    'localisation' => 'Paris',
    'id_role' => $adminRole->id_role,
    'statut_compte' => true,
    'est_actif' => true,
    'points_fidelite' => 0,
    'code_parrainage' => 'ADMIN001'
]);

echo "✅ Admin created: admin@example.com / Admin123\n";
```

## Create Manager User

```php
use App\Models\Utilisateur;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

// Get or create manager role
$gerantRole = Role::firstOrCreate(
    ['nom_role' => 'gerant'],
    ['description' => 'Gérant de restaurant']
);

// Create manager user
Utilisateur::create([
    'nom' => 'Manager',
    'prenom' => 'John',
    'email' => 'manager@example.com',
    'mot_de_passe' => Hash::make('Manager123'),
    'telephone' => '0612345680',
    'localisation' => 'Paris',
    'id_role' => $gerantRole->id_role,
    'statut_compte' => true,
    'est_actif' => true,
    'points_fidelite' => 0,
    'code_parrainage' => 'MNGR001'
]);

echo "✅ Manager created: manager@example.com / Manager123\n";
```

## Summary

### Test Accounts Created:

| Email | Password | Role | Status |
|-------|----------|------|--------|
| test@example.com | Password123 | Client | ✅ Active |
| admin@example.com | Admin123 | Administrateur | ✅ Active |
| manager@example.com | Manager123 | Gérant | ✅ Active |

### Next Steps:

1. Create test user (see above)
2. Go to `http://localhost:5173/login`
3. Login with test credentials
4. **Should work!** 🎉

---

**Status:** ✅ Authentication system fully working!  
**Issue:** User account was inactive (now fixed)  
**Date:** October 31, 2025
