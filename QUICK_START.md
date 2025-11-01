# Mon Miam Miam - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- PostgreSQL (Supabase)

---

## Backend Setup (Laravel API)

### 1. Navigate to API directory
```bash
cd mon-miam-miam-api
```

### 2. Install dependencies
```bash
composer install
```

### 3. Configure environment
```bash
# Copy the example env file
cp .env.example .env

# Edit .env and update these variables:
# - DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD
# - SUPABASE_URL, SUPABASE_ANON_KEY
```

### 4. Generate app key
```bash
php artisan key:generate
```

### 5. Run migrations
```bash
php artisan migrate
```

### 6. Start the server
```bash
php artisan serve
```

✅ Backend running at: **http://localhost:8000**

---

## Frontend Setup (Admin Panel)

### 1. Navigate to admin directory
```bash
cd mon-miam-miam-admin
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
```bash
# Create .env file
echo "VITE_API_URL=http://localhost:8000/api" > .env
```

### 4. Start the dev server
```bash
npm run dev
```

✅ Admin panel running at: **http://localhost:5173**

---

## 📚 Available Routes

### API Base URL
```
http://localhost:8000/api
```

### Admin Panel URL
```
http://localhost:5173
```

---

## 🔑 Test Authentication

### Create Test User (via Tinker)
```bash
php artisan tinker

# Create admin role
$role = App\Models\Role::create(['nom_role' => 'administrateur', 'description' => 'Administrator']);

# Create admin user
$user = App\Models\Utilisateur::create([
    'nom' => 'Admin',
    'prenom' => 'User',
    'email' => 'admin@example.com',
    'mot_de_passe' => Hash::make('password123'),
    'telephone' => '0123456789',
    'id_role' => $role->id_role,
    'statut_compte' => 'actif',
    'code_parrainage' => 'ADMIN001',
    'points_fidelite' => 0
]);
```

### Login Credentials
```
Email: admin@example.com
Password: password123
```

---

## 🧪 Test API Endpoints

### Login
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

### Get Articles (Public)
```bash
curl http://localhost:8000/api/articles
```

### Create Article (Admin)
```bash
curl -X POST http://localhost:8000/api/admin/articles \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Pizza Margherita",
    "description": "Classic pizza",
    "prix": 12.99,
    "id_categorie": 1,
    "disponible": true
  }'
```

---

## 📖 Documentation

- **Complete API Docs**: `mon-miam-miam-api/API_DOCUMENTATION.md`
- **Backend Setup Guide**: `BACKEND_SETUP.md`
- **Database Schema**: `BD Miam Miam.md`

---

## 🎯 Key Features

### Backend (16 Controllers)
✅ Article Management  
✅ Category Management  
✅ Order Management (with line items)  
✅ Payment Processing  
✅ Delivery Management  
✅ User Management  
✅ Role-Based Access Control  
✅ Promotion & Discount Codes  
✅ Event Management  
✅ Referral System  
✅ Complaint Handling  
✅ Review System  
✅ Statistics & Analytics  
✅ Employee Management  

### Frontend (Admin Panel)
✅ Dashboard with real-time stats  
✅ Product/Menu management  
✅ Order tracking  
✅ Employee management  
✅ Promotion management  
✅ Event management  
✅ Complaint handling  
✅ System settings  

---

## 🔧 Common Commands

### Backend
```bash
# Clear cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# List all routes
php artisan route:list

# Run migrations
php artisan migrate

# Rollback migrations
php artisan migrate:rollback

# Seed database
php artisan db:seed

# Run tests
php artisan test
```

### Frontend
```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## 🐛 Troubleshooting

### Backend Issues

**CORS Error**
- Check `config/cors.php` allowed origins
- Ensure frontend URL matches

**Database Connection Failed**
- Verify .env database credentials
- Test connection: `php artisan migrate:status`

**401 Unauthorized**
- Check if token is being sent in Authorization header
- Verify token hasn't expired

**Role Middleware Error**
- Ensure user has proper role assigned
- Check middleware configuration in `bootstrap/app.php`

### Frontend Issues

**API Connection Failed**
- Verify VITE_API_URL in .env
- Check if backend is running
- Inspect browser console for CORS errors

**Login Not Working**
- Check network tab for API response
- Verify credentials
- Ensure token is being stored in localStorage

**Routes Not Working**
- Check React Router configuration
- Ensure all pages are imported correctly

---

## 📊 Project Structure

```
projet_web/
├── mon-miam-miam-api/          # Laravel Backend
│   ├── bootstrap/app/
│   │   ├── Http/Controllers/   # 16 Controllers
│   │   ├── Models/             # 17 Models
│   │   └── Middleware/         # Custom middleware
│   ├── routes/api.php          # All API routes
│   ├── config/cors.php         # CORS config
│   └── database/migrations/    # Database schema
│
├── mon-miam-miam-admin/        # React Admin Panel
│   ├── src/
│   │   ├── api/axios.js        # API client
│   │   ├── pages/              # Admin pages
│   │   ├── components/         # React components
│   │   └── context/            # Auth context
│   └── .env                    # Frontend config
│
├── API_DOCUMENTATION.md        # Complete API docs
├── BACKEND_SETUP.md           # Detailed setup guide
└── QUICK_START.md             # This file
```

---

## 🚀 Next Steps

1. **Test all API endpoints** using Postman or cURL
2. **Create sample data** via Tinker or seeders
3. **Test admin panel** functionality
4. **Configure production environment**
5. **Set up deployment** (Vercel/Netlify for frontend, Laravel Forge/Vapor for backend)

---

## 📞 Support

For issues or questions:
1. Check documentation files
2. Review Laravel logs: `storage/logs/laravel.log`
3. Check browser console for frontend errors
4. Verify API responses in network tab

---

## ✨ API Highlights

### Public Endpoints (No Auth)
- GET `/articles` - List all articles
- GET `/categories-list` - List categories
- GET `/promotions` - Active promotions
- GET `/evenements` - Events
- POST `/login` - User login
- POST `/register` - User registration

### Customer Endpoints (Auth Required)
- CRUD `/commandes` - Orders
- CRUD `/commentaires` - Reviews
- CRUD `/parrainages` - Referrals
- CRUD `/participations` - Event participation
- CRUD `/reclamations` - Complaints

### Admin Endpoints (Admin/Manager Only)
- CRUD `/admin/articles` - Manage articles
- CRUD `/admin/categories` - Manage categories
- CRUD `/admin/utilisateurs` - Manage users
- CRUD `/admin/roles` - Manage roles
- CRUD `/admin/livraisons` - Manage deliveries
- CRUD `/admin/paiements` - Manage payments
- GET `/admin/statistics` - Dashboard stats
- POST `/admin/utilisateurs/{id}/suspend` - Suspend user
- And many more...

---

**🎉 You're all set! Start building with Mon Miam Miam API**
