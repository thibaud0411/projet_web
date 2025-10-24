# Backend Configuration Guide

This document explains the complete backend setup for Mon Miam Miam project.

## Project Structure

```
mon-miam-miam-api/          # Laravel Backend API
├── bootstrap/app/
│   ├── Http/
│   │   ├── Controllers/    # All API Controllers
│   │   └── Middleware/     # Custom Middleware
│   └── Models/            # Eloquent Models
├── routes/
│   └── api.php            # API Routes
├── config/
│   └── cors.php           # CORS Configuration
└── database/
    └── migrations/        # Database Migrations

mon-miam-miam-admin/        # React Admin Panel
├── src/
│   ├── api/
│   │   └── axios.js       # API Client Configuration
│   ├── components/        # React Components
│   ├── pages/            # Admin Pages
│   └── context/          # React Context (Auth)
└── .env                  # Frontend Environment Variables
```

## Backend Configuration

### 1. Laravel API Setup

#### Environment Variables (.env)

```env
APP_NAME="Mon Miam Miam"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database (Supabase PostgreSQL)
DB_CONNECTION=pgsql
DB_HOST=your-supabase-host.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres.your-project-ref
DB_PASSWORD=your-database-password
DB_SCHEMA=public

# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here

# Session & Cache
SESSION_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=sync
```

#### CORS Configuration

File: `config/cors.php`

```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_methods' => ['*'],
'allowed_origins' => [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
],
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

#### Middleware Configuration

File: `bootstrap/app.php`

- **CORS Middleware**: Prepended to handle all requests including errors
- **Role Middleware**: Custom middleware for role-based access control
- **Sanctum**: For API authentication

#### Authentication

- **Laravel Sanctum**: Token-based authentication
- **Supabase Auth**: External authentication provider
- **Custom Auth Flow**: Register/Login creates Supabase user + local profile

### 2. Controllers Overview

#### New Controllers Created

1. **ArticleController** - Menu items management
2. **CategorieController** - Category management
3. **CommandeController** - Order management with line items
4. **CommentaireController** - Review/comment management
5. **EvenementController** - Event management
6. **LigneCommandeController** - Order line items
7. **LivraisonController** - Delivery management
8. **PaiementController** - Payment processing
9. **ParrainageController** - Referral system
10. **ParticipationController** - Event participation
11. **PromotionController** - Promotion codes
12. **ReclamationController** - Complaint handling
13. **RoleController** - User role management
14. **UtilisateurController** - User management
15. **StatistiqueController** - User statistics

#### Existing Admin Controllers

Located in `bootstrap/app/Http/Controllers/Admin/`:
- EmployeeController
- ProductController
- OrderController
- PromotionController (Admin version)
- EventController
- ComplaintController
- StatisticsController
- SettingsController

### 3. API Routes Structure

#### Public Routes (No Authentication)

```
POST   /api/login
POST   /api/register
GET    /api/articles
GET    /api/categories-list
GET    /api/promotions
GET    /api/evenements
```

#### Customer Routes (Authentication Required)

```
API Resource: /api/commandes
API Resource: /api/commentaires
API Resource: /api/parrainages
API Resource: /api/participations
API Resource: /api/reclamations
GET    /api/utilisateurs/{id}/statistics
POST   /api/utilisateurs/{id}/points
```

#### Admin Routes (Admin/Manager Only)

All prefixed with `/admin`:

```
GET    /admin/statistics
GET    /admin/revenue
API Resource: /admin/employees (creation/deletion admin only)
API Resource: /admin/articles
API Resource: /admin/categories
API Resource: /admin/commandes-all
API Resource: /admin/livraisons
API Resource: /admin/paiements
API Resource: /admin/utilisateurs
API Resource: /admin/roles
API Resource: /admin/statistiques
GET    /admin/settings (admin only)
```

### 4. Role-Based Access Control

#### Roles
- `administrateur` - Full access
- `gerant` - Manager access (limited admin)
- `employe` - Employee access
- `etudiant` - Customer access

#### Middleware Usage

```php
// Admin & Manager only
Route::middleware('role:administrateur,gerant')->group(function () {
    // routes
});

// Admin only
Route::middleware('role:administrateur')->group(function () {
    // routes
});
```

### 5. Models & Relationships

All models are located in `bootstrap/app/Models/`:

**Main Relationships:**
- `Utilisateur` has many `Commande`, `Reclamation`, `Participation`
- `Utilisateur` has one `Employe`, `Statistique`
- `Commande` has many `LigneCommande`, `Commentaire`
- `Commande` has one `Paiement`, `Livraison`
- `Article` belongs to `Categorie`
- `Evenement` has many `Participation`
- `Role` has many `Utilisateur`

### 6. Database Schema

The database uses custom timestamp fields:
- `date_creation` - Created at
- `date_modification` - Updated at
- `date_inscription` - User registration
- `date_commande` - Order date
- etc.

Models are configured to use these custom timestamp columns.

## Frontend Configuration

### 1. Admin Panel Setup

#### Environment Variables (.env)

```env
VITE_API_URL=http://localhost:8000/api
```

#### API Client Configuration

File: `src/api/axios.js`

```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Error interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 2. Admin Pages

Located in `src/pages/`:
- **Dashboard.jsx** - Main dashboard with statistics
- **Menu.jsx** - Product/Article management
- **orders.jsx** - Order management
- **Employees.jsx** - Employee management
- **promotions.jsx** - Promotion management
- **Events.jsx** - Event management
- **Complaints.jsx** - Complaint handling
- **Settings.jsx** - System settings
- **Login.jsx** - Authentication page

## Running the Application

### Backend (Laravel)

```bash
cd mon-miam-miam-api

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Configure your .env file with database credentials

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate

# Start development server
php artisan serve
# Server runs on http://localhost:8000
```

### Frontend (React Admin Panel)

```bash
cd mon-miam-miam-admin

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure VITE_API_URL in .env

# Start development server
npm run dev
# Server runs on http://localhost:5173
```

## API Testing

### Using cURL

```bash
# Login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Get articles (with token)
curl -X GET http://localhost:8000/api/articles \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create article (admin)
curl -X POST http://localhost:8000/api/admin/articles \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nom":"Pizza Margherita",
    "description":"Pizza classique",
    "prix":12.99,
    "id_categorie":1,
    "disponible":true
  }'
```

### Using Postman

1. Import the API documentation
2. Set base URL to `http://localhost:8000/api`
3. Use Bearer token authentication
4. Test all endpoints

## Security Considerations

1. **Token Management**: Tokens stored in localStorage (consider httpOnly cookies for production)
2. **CORS**: Configured for local development (update for production)
3. **Role Validation**: Enforced at route level with middleware
4. **Password Hashing**: Using Laravel's Hash facade (bcrypt)
5. **SQL Injection**: Protected via Eloquent ORM
6. **XSS Protection**: Laravel's built-in protections

## Production Deployment

### Backend

1. Set `APP_ENV=production` in `.env`
2. Set `APP_DEBUG=false`
3. Update `allowed_origins` in CORS config
4. Use HTTPS for API
5. Configure proper database credentials
6. Set up proper session/cache drivers (Redis recommended)
7. Run `php artisan config:cache`
8. Run `php artisan route:cache`

### Frontend

1. Update `VITE_API_URL` to production API URL
2. Build for production: `npm run build`
3. Deploy `dist/` folder to web server
4. Configure HTTPS
5. Set proper CORS headers

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check `config/cors.php` and frontend URL
2. **Authentication Fails**: Verify Sanctum configuration and token storage
3. **404 on API Routes**: Ensure `api.php` routes are loaded
4. **Database Connection**: Verify Supabase credentials
5. **Role Middleware**: Ensure user has proper role assigned

### Debug Mode

Enable detailed error messages:
```env
APP_DEBUG=true
LOG_LEVEL=debug
```

## Additional Resources

- API Documentation: `API_DOCUMENTATION.md`
- Laravel Documentation: https://laravel.com/docs
- React Documentation: https://react.dev
- Sanctum Documentation: https://laravel.com/docs/sanctum
