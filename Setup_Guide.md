# Mon Miam Miam - Admin Panel Setup Guide

## Prerequisites

- Node.js 18+ and npm
- PHP 8.1+
- Composer
- Supabase account and project

## Frontend Setup (React)

### 1. Install Dependencies

```bash
cd mon-miam-miam-admin
npm install
```

### 2. Configure Environment

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```
VITE_API_URL=http://localhost:8000/api
```

### 3. Configure Tailwind CSS

Update `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50;
  }
}
```

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Backend Setup (Laravel)

### 1. Install Laravel

```bash
composer create-project laravel/laravel mon-miam-miam-api
cd mon-miam-miam-api
```

### 2. Install Required Packages

```bash
composer require laravel/sanctum
composer require supabase/supabase-php
```

### 3. Configure Database (.env)

```env
DB_CONNECTION=pgsql
DB_HOST=db.your-supabase-project.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=your_database_password

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_service_role_key
```

### 4. Configure Sanctum

Publish Sanctum config:
```bash
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

Update `config/sanctum.php`:
```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost,localhost:5173,127.0.0.1')),
```

Add to `app/Http/Kernel.php`:
```php
'api' => [
    \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    'throttle:api',
    \Illuminate\Routing\Middleware\SubstituteBindings::class,
],
```

### 5. Configure CORS

Update `config/cors.php`:
```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => ['http://localhost:5173'],
'supports_credentials' => true,
```

### 6. Create Middleware

Create `app/Http/Middleware/CheckRole.php`:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        if (!$request->user() || !in_array($request->user()->role, $roles)) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        return $next($request);
    }
}
```

Register in `app/Http/Kernel.php`:
```php
protected $routeMiddleware = [
    // ...
    'role' => \App\Http\Middleware\CheckRole::class,
];
```

### 7. Run Database Migrations

Execute the SQL script from `CREATE_DB.sql` in your Supabase SQL editor.

### 8. Start Laravel Server

```bash
php artisan serve
```

API will be available at `http://localhost:8000`

## Supabase Configuration

### 1. Enable Row Level Security

All RLS policies are included in the `CREATE_DB.sql` script.

### 2. Create Storage Bucket for Images

In Supabase Dashboard:
1. Go to Storage
2. Create new bucket named `product-images`
3. Make it public
4. Set up policies for authenticated users to upload

### 3. Configure Authentication

1. Go to Authentication > Settings
2. Enable Email provider
3. Configure email templates
4. Set site URL to `http://localhost:5173`

## Testing

### Test Admin Login

Default admin credentials (you need to create this manually):

```sql
-- Insert test admin
INSERT INTO auth.users (email, encrypted_password) 
VALUES ('admin@monmiammiam.com', crypt('Admin123', gen_salt('bf')));

INSERT INTO users (id, nom, prenom, email, telephone, role)
SELECT 
  id,
  'Admin',
  'Test',
  'admin@monmiammiam.com',
  '+237600000000',
  'administrateur'
FROM auth.users WHERE email = 'admin@monmiammiam.com';
```

## Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Backend (Laravel)

Choose your hosting platform:
- Laravel Forge
- DigitalOcean App Platform
- AWS Elastic Beanstalk
- Heroku

Configure:
1. Set environment variables
2. Run migrations
3. Configure domain and SSL

## Common Issues

### CORS Errors

Make sure:
- Laravel CORS is configured correctly
- Sanctum stateful domains include your frontend URL
- `withCredentials: true` is set in axios

### Authentication Issues

Check:
- Sanctum middleware is applied
- Cookie domain matches
- CSRF token is being sent

### Database Connection

Verify:
- Supabase connection pooler settings
- SSL mode is configured
- User has proper permissions

## Project Structure Overview

```
mon-miam-miam-admin/
├── src/
│   ├── api/              # API calls
│   ├── components/       # Reusable components
│   ├── context/          # React context
│   ├── hooks/            # Custom hooks
│   ├── pages/            # Page components
│   ├── utils/            # Helper functions
│   ├── App.jsx           # Main app
│   └── main.jsx          # Entry point
├── public/               # Static assets
└── package.json

mon-miam-miam-api/
├── app/
│   ├── Http/
│   │   ├── Controllers/  # API controllers
│   │   └── Middleware/   # Custom middleware
│   └── Models/           # Eloquent models (optional)
├── config/               # Configuration files
├── database/
│   └── migrations/       # Database migrations
├── routes/
│   └── api.php          # API routes
└── .env                 # Environment config
```

## Next Steps

1. Implement remaining pages (Promotions, Events, Complaints, Settings)
2. Add form validation
3. Implement file upload for product images
4. Add real-time updates using Supabase Realtime
5. Implement comprehensive error handling
6. Add loading states and skeleton screens
7. Write tests (Jest for frontend, PHPUnit for backend)
8. Set up CI/CD pipeline
9. Configure monitoring and logging
10. Optimize performance

## Support

For issues or questions:
- Check Supabase documentation: https://supabase.com/docs
- Laravel documentation: https://laravel.com/docs
- React documentation: https://react.dev