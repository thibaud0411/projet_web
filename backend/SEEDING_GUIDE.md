# 🌱 Database Seeding Guide - Mon Miam Miam

## Quick Commands

### Seed Everything (Recommended)
```bash
php artisan migrate:fresh --seed
```

### Seed Only Utilisateurs
```bash
php artisan db:seed --class=UtilisateurSeeder
```

### Seed Specific Tables
```bash
php artisan db:seed --class=RoleSeeder
php artisan db:seed --class=UtilisateurSeeder
php artisan db:seed --class=CategorieSeeder
php artisan db:seed --class=ArticleSeeder
```

---

## 👥 Test Accounts Created

### Staff Accounts (3 users)

| Role | Name | Email | Password | Phone |
|------|------|-------|----------|-------|
| **Admin** | System Admin | `admin@test.com` | `password` | +237690000001 |
| **Gérant** | Jean Dupont | `gerant@test.com` | `password` | +237690000002 |
| **Employé** | Sophie Martin | `employe@test.com` | `password` | +237690000003 |

### Student/Customer Accounts (5 users)

| Name | Email | Password | Points | Referral Code | Phone |
|------|-------|----------|--------|---------------|-------|
| Marie Nguyen | `etudiant@test.com` | `password` | 150 | `MARIE2024` | +237690000004 |
| Paul Kamga | `paul.kamga@test.com` | `password` | 320 | `PAUL2024` | +237690000005 |
| Alice Mbida | `alice.mbida@test.com` | `password` | 75 | `ALICE2024` | +237690000006 |
| David Tchoumi | `david.tchoumi@test.com` | `password` | 500 | `DAVID2024` | +237690000007 |
| Emilie Fotso | `emilie.fotso@test.com` | `password` | 200 | `EMILIE2024` | +237690000008 |

### Referral System Test
- **Marie Nguyen** is the referrer
- **Paul Kamga** was referred by Marie
- **Alice Mbida** was referred by Marie

---

## 🎯 What Gets Seeded

### 1. Roles (4 roles)
- Administrateur
- Gérant
- Employé
- Étudiant

### 2. Utilisateurs (8 users)
- 3 staff members
- 5 student customers
- Includes referral relationships

### 3. Other Seeders Available
- `CategorieSeeder` - Menu categories
- `ArticleSeeder` - Menu items
- `CommandeSeeder` - Sample orders
- `PaiementSeeder` - Payment records
- `ParrainageSeeder` - Referral records
- `ReclamationSeeder` - Customer complaints
- `TodayDataSeeder` - Today's special data

---

## 🔄 Seeding Workflow

### Option 1: Fresh Start (Recommended for Development)
```bash
# Drop all tables, recreate them, and seed data
php artisan migrate:fresh --seed
```

### Option 2: Add Seed Data to Existing Database
```bash
# Just run seeders without dropping tables
php artisan db:seed
```

### Option 3: Specific Seeder Only
```bash
# Run a specific seeder
php artisan db:seed --class=UtilisateurSeeder
```

---

## ⚠️ Important Notes

### Before Seeding
1. Make sure your `.env` database configuration is correct
2. Ensure database exists and is accessible
3. Run migrations first if not using `migrate:fresh`

### After Seeding
- Check created users: `php artisan tinker` then `\App\Models\Utilisateur::count()`
- Test login with any account (password: `password`)
- Verify referral relationships work

---

## 🐛 Troubleshooting

### Error: "SQLSTATE[23000]: Integrity constraint violation"
**Cause**: Trying to seed when data already exists

**Solution**:
```bash
# Option A: Fresh start
php artisan migrate:fresh --seed

# Option B: Clear specific table
php artisan tinker
>>> \App\Models\Utilisateur::truncate();
>>> exit
php artisan db:seed --class=UtilisateurSeeder
```

### Error: "Class 'RoleSeeder' not found"
**Cause**: Composer autoload needs refresh

**Solution**:
```bash
composer dump-autoload
php artisan db:seed
```

### Error: Foreign key constraint fails
**Cause**: Trying to seed utilisateurs before roles

**Solution**:
```bash
# Seed in correct order
php artisan db:seed --class=RoleSeeder
php artisan db:seed --class=UtilisateurSeeder
```

---

## 📊 Verify Seeding Success

### Check Users Created
```bash
php artisan tinker
```

```php
// Count all users
\App\Models\Utilisateur::count(); // Should be 8

// Get all admins
\App\Models\Utilisateur::where('id_role', 1)->get();

// Get all students
\App\Models\Utilisateur::where('id_role', 4)->get();

// Check referral relationships
$marie = \App\Models\Utilisateur::where('email', 'etudiant@test.com')->first();
$marie->parrainages; // Should show Paul and Alice

exit
```

---

## 🎨 Customizing Seed Data

### Add More Users
Edit `database/seeders/UtilisateurSeeder.php` and add to `$studentUsers` array:

```php
[
    'nom' => 'YourName',
    'prenom' => 'YourFirstName',
    'email' => 'your.email@test.com',
    'mot_de_passe' => Hash::make('password'),
    'telephone' => '+237690000009',
    'localisation' => 'Your Location',
    'points_fidelite' => 100,
    'code_parrainage' => 'YOURCODE2024',
    'id_parrain' => null,
    'id_role' => 4,
    'statut_compte' => true,
],
```

### Change Default Password
Find all instances of `Hash::make('password')` and change to:
```php
Hash::make('your_secure_password')
```

---

## 🚀 Production Considerations

### DO NOT use default seeder in production!

**Reasons:**
- Hardcoded passwords are insecure
- Test emails may conflict with real users
- Fake data pollutes real database

### For Production Setup:
1. Create admin user manually
2. Use strong passwords
3. Use real email addresses
4. Don't seed fake customer data

---

## 📝 Seeder Execution Order

The `DatabaseSeeder.php` calls seeders in this order:
1. `RoleSeeder` - Must run first (foreign key dependency)
2. `UtilisateurSeeder` - Requires roles to exist
3. `CommandeSeeder` - Requires users to exist

To add more seeders, update `database/seeders/DatabaseSeeder.php`:
```php
$this->call([
    RoleSeeder::class,
    UtilisateurSeeder::class,
    CategorieSeeder::class,
    ArticleSeeder::class,
    CommandeSeeder::class,
    // Add more here
]);
```

---

## ✅ Quick Test

After seeding, test login:
```bash
# Start server
php artisan serve

# Test API login (use Postman or curl)
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password"}'
```

Expected response:
```json
{
  "user": {
    "id_utilisateur": 1,
    "nom": "Admin",
    "prenom": "System",
    "email": "admin@test.com",
    ...
  },
  "token": "your_api_token_here"
}
```
