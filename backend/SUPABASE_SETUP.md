# Supabase Configuration for Mon Miam Miam API

## 📋 Prerequisites

- Laravel 11 installed
- Supabase account with a project created
- PostgreSQL database access

## 🔧 Configuration Steps

### 1. Update your `.env` file

Copy the following configuration and update with your Supabase credentials:

```env
DB_CONNECTION=pgsql
DB_HOST=db.bhxhrvtekkqaautdapvl.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=your_database_password_here
DB_SCHEMA=public
```

**To get your Supabase credentials:**

1. Go to your Supabase project dashboard
2. Click on **Settings** (gear icon)
3. Go to **Database** section
4. Under **Connection string**, select **URI** mode
5. Copy the password from there or reset it

### 2. Run Migrations

Since your Supabase database already has the schema from `CREATE_DB.sql`, you have two options:

#### Option A: Skip Migrations (Recommended)
If you've already created the database using `CREATE_DB.sql`:

```bash
# Just mark migrations as run without executing them
php artisan migrate --pretend
```

#### Option B: Fresh Migration
If you want Laravel to create the tables:

```bash
# This will drop all tables and recreate them
php artisan migrate:fresh --seed
```

### 3. Seed Admin Accounts

Run the seeder to create default admin and gérant accounts:

```bash
php artisan db:seed
```

This will create:
- **Administrateur**: `admin@monmiammiam.com` / `Admin123!`
- **Gérant**: `gerant@monmiammiam.com` / `Gerant123!`

### 4. Test the API

Start the Laravel development server:

```bash
php artisan serve
```

The API will be available at `http://localhost:8000`

### 5. Test Login Endpoint

```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@monmiammiam.com",
    "password": "Admin123!"
  }'
```

You should receive a response with a token:

```json
{
  "user": {
    "id": "uuid-here",
    "nom": "Admin",
    "prenom": "Super",
    "email": "admin@monmiammiam.com",
    "role": "administrateur"
  },
  "token": "your-api-token-here",
  "message": "Connexion réussie"
}
```

## 🔑 Admin Panel Login

Use these credentials in your React admin panel:

- **Email**: `admin@monmiammiam.com`
- **Password**: `Admin123!`

Or for manager access:

- **Email**: `gerant@monmiammiam.com`
- **Password**: `Gerant123!`

## 🌐 CORS Configuration

Update `config/cors.php` to allow requests from your React app:

```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],

'allowed_origins' => ['http://localhost:5173'],

'allowed_methods' => ['*'],

'allowed_headers' => ['*'],

'supports_credentials' => true,
```

## 🔐 Sanctum Configuration

Make sure `config/sanctum.php` is configured:

```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost,localhost:5173,127.0.0.1,127.0.0.1:8000,::1')),
```

## ⚙️ React Admin Configuration

Update your React admin `.env` file:

```env
VITE_API_URL=http://localhost:8000/api
```

Then update the API service to use the new field names (`nom`, `prenom` instead of `name`).

## 🧪 Troubleshooting

### Migration Issues

If you get errors about tables already existing:

```bash
# Drop all tables first
php artisan db:wipe

# Then run migrations
php artisan migrate:fresh --seed
```

### UUID Issues

If you get UUID errors, ensure the PostgreSQL extension is enabled:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Connection Issues

Test your database connection:

```bash
php artisan tinker
> DB::connection()->getPdo();
```

## 📚 API Endpoints

### Authentication
- `POST /api/login` - Login
- `POST /api/register` - Register new user
- `POST /api/logout` - Logout (requires auth)
- `GET /api/user` - Get authenticated user (requires auth)

### Admin Routes (requires `administrateur` or `gerant` role)
- `GET /api/admin/statistics` - Dashboard statistics
- `GET /api/admin/employees` - List employees
- `GET /api/admin/orders` - List orders
- `GET /api/admin/products` - List products
- And more...

## 🎯 Next Steps

1. ✅ Configure `.env` with Supabase credentials
2. ✅ Run migrations/seeders
3. ✅ Test API login endpoint
4. ✅ Update React admin app to use new field names
5. ✅ Test admin panel login

---

**Note**: The TailwindCSS lint warnings in your admin app are harmless and can be ignored. They occur because the CSS linter doesn't recognize TailwindCSS directives.
