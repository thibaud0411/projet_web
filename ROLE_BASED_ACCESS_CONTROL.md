# Role-Based Access Control (RBAC) Guide

## 🎭 Overview

Your application has **3 user roles** with different access levels:

1. **Client** - Regular customers (default role for new registrations)
2. **Gérant** (Manager) - Restaurant managers with elevated permissions
3. **Administrateur** (Admin) - Full system access

## 🔐 How Laravel Breeze Handles Roles

Laravel Breeze provides the **authentication foundation**, but role-based access control is implemented through:

1. **Custom Middleware** - `CheckRole` middleware
2. **Database Structure** - `role` table with `utilisateur` relationship
3. **Route Protection** - Middleware applied to route groups

### Architecture

```
┌─────────────────┐
│   User Login    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Laravel Sanctum │ ◄── Breeze handles this
│  Token Created  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  CheckRole      │ ◄── Custom middleware
│  Middleware     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Route Access   │
│   Granted/      │
│   Denied        │
└─────────────────┘
```

## 📊 Database Structure

### Role Table
```sql
CREATE TABLE role (
    id_role INT PRIMARY KEY AUTO_INCREMENT,
    nom_role VARCHAR(50) NOT NULL,  -- 'client', 'gerant', 'administrateur'
    description TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Utilisateur Table (User)
```sql
CREATE TABLE utilisateur (
    id_utilisateur INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    telephone VARCHAR(20),
    localisation VARCHAR(255),
    id_role INT,  -- Foreign key to role table
    statut_compte BOOLEAN DEFAULT TRUE,
    est_actif BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_role) REFERENCES role(id_role)
);
```

## 🛠️ Backend Implementation

### 1. CheckRole Middleware

**Location:** `backend/app/Http/Middleware/CheckRole.php`

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // Check if user is authenticated
        if (!$request->user()) {
            return response()->json(['message' => 'Non authentifié'], 401);
        }

        // Load the role relationship
        $user = $request->user();
        if (!$user->relationLoaded('role')) {
            $user->load('role');
        }

        // Get the user's role name
        $userRole = $user->role->nom_role ?? null;

        // Check if user has one of the required roles
        if (!$userRole || !in_array($userRole, $roles)) {
            return response()->json([
                'message' => 'Accès non autorisé. Rôle requis: ' . implode(', ', $roles),
                'user_role' => $userRole
            ], 403);
        }

        return $next($request);
    }
}
```

### 2. Middleware Registration

**Location:** `backend/bootstrap/app.php`

```php
->withMiddleware(function (Middleware $middleware): void {
    // Register custom middleware aliases
    $middleware->alias([
        'role' => \App\Http\Middleware\CheckRole::class,
    ]);
})
```

### 3. Route Protection Examples

**Location:** `backend/routes/api.php`

```php
// ✅ CLIENT ROUTES (All authenticated users)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    Route::apiResource('commandes', CommandeController::class);
    Route::apiResource('commentaires', CommentaireController::class);
});

// ✅ MANAGER & ADMIN ROUTES
Route::middleware(['auth:sanctum', 'role:administrateur,gerant'])->prefix('admin')->group(function () {
    Route::get('/statistics', [StatisticsController::class, 'dashboard']);
    Route::get('/employees', [EmployeeController::class, 'index']);
    Route::patch('/commandes/{id}', [CommandeController::class, 'update']);
});

// ✅ ADMIN ONLY ROUTES
Route::middleware(['auth:sanctum', 'role:administrateur'])->prefix('admin')->group(function () {
    Route::post('/employees', [EmployeeController::class, 'store']);
    Route::delete('/employees/{id}', [EmployeeController::class, 'destroy']);
    Route::apiResource('roles', RoleController::class);
});
```

## 🎨 Frontend Implementation

### 1. User Type Interface

**Location:** `frontend/src/types/index.ts`

```typescript
export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: 'administrateur' | 'gerant' | 'client';
  points_fidelite?: number;
}
```

### 2. AuthContext with Role Checks

**Location:** `frontend/src/context/AuthContext.tsx`

```typescript
const value: AuthContextType = {
  user,
  loading,
  login,
  logout,
  register,
  isAuthenticated: !!user,
  isAdmin: user?.role === 'administrateur',
  isGerant: user?.role === 'gerant',
};
```

### 3. Protected Routes

**Location:** `frontend/src/App.tsx` (example)

```tsx
import { useAuth } from './context/AuthContext';
import { Navigate } from 'react-router-dom';

// Admin Only Route
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/unauthorized" />;
  
  return <>{children}</>;
}

// Manager or Admin Route
function ManagerRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, isGerant, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!isAdmin && !isGerant) return <Navigate to="/unauthorized" />;
  
  return <>{children}</>;
}

// Usage in routes
<Routes>
  <Route path="/admin/users" element={
    <AdminRoute>
      <UserManagement />
    </AdminRoute>
  } />
  
  <Route path="/admin/dashboard" element={
    <ManagerRoute>
      <Dashboard />
    </ManagerRoute>
  } />
</Routes>
```

### 4. Conditional Rendering

```tsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, isAdmin, isGerant } = useAuth();

  return (
    <div>
      {/* Show to all authenticated users */}
      <h1>Welcome {user?.prenom}!</h1>
      
      {/* Show only to managers and admins */}
      {(isAdmin || isGerant) && (
        <button>View Statistics</button>
      )}
      
      {/* Show only to admins */}
      {isAdmin && (
        <button>Manage Users</button>
      )}
      
      {/* Show role-specific content */}
      {user?.role === 'client' && (
        <div>Your loyalty points: {user.points_fidelite}</div>
      )}
    </div>
  );
}
```

## 🚀 Usage Examples

### Backend: Protecting Routes

```php
// Single role
Route::middleware(['auth:sanctum', 'role:administrateur'])->group(function () {
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
});

// Multiple roles (OR condition)
Route::middleware(['auth:sanctum', 'role:administrateur,gerant'])->group(function () {
    Route::get('/reports', [ReportController::class, 'index']);
});

// Nested protection
Route::middleware('auth:sanctum')->group(function () {
    // All authenticated users
    Route::get('/profile', [ProfileController::class, 'show']);
    
    // Only managers and admins
    Route::middleware('role:administrateur,gerant')->group(function () {
        Route::get('/employees', [EmployeeController::class, 'index']);
    });
});
```

### Frontend: Role-Based UI

```tsx
// Hide/Show elements
{isAdmin && <AdminPanel />}
{(isAdmin || isGerant) && <ManagerDashboard />}

// Redirect based on role
useEffect(() => {
  if (user) {
    if (user.role === 'administrateur') {
      navigate('/admin/dashboard');
    } else if (user.role === 'gerant') {
      navigate('/manager/dashboard');
    } else {
      navigate('/client/dashboard');
    }
  }
}, [user]);

// Conditional styling
<button 
  className={`btn ${isAdmin ? 'btn-admin' : 'btn-default'}`}
>
  {isAdmin ? 'Admin Action' : 'User Action'}
</button>
```

## 🧪 Testing Role-Based Access

### Test with cURL

```bash
# 1. Login as admin
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Save the token from response

# 2. Access admin-only endpoint
curl -X GET http://localhost:8000/api/admin/employees \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"

# 3. Try accessing with client role (should get 403)
curl -X POST http://localhost:8000/api/admin/employees \
  -H "Authorization: Bearer CLIENT_TOKEN" \
  -H "Accept: application/json"
```

### Expected Responses

**✅ Success (200):**
```json
{
  "data": [...]
}
```

**❌ Unauthorized (401):**
```json
{
  "message": "Non authentifié"
}
```

**❌ Forbidden (403):**
```json
{
  "message": "Accès non autorisé. Rôle requis: administrateur, gerant",
  "user_role": "client"
}
```

## 📋 Role Permissions Matrix

| Feature | Client | Gérant | Administrateur |
|---------|--------|--------|----------------|
| View own profile | ✅ | ✅ | ✅ |
| Place orders | ✅ | ✅ | ✅ |
| View own orders | ✅ | ✅ | ✅ |
| Leave reviews | ✅ | ✅ | ✅ |
| View statistics | ❌ | ✅ | ✅ |
| Manage orders | ❌ | ✅ | ✅ |
| View employees | ❌ | ✅ | ✅ |
| Create employees | ❌ | ❌ | ✅ |
| Delete employees | ❌ | ❌ | ✅ |
| Manage roles | ❌ | ❌ | ✅ |
| System settings | ❌ | ❌ | ✅ |

## 🔧 Creating Users with Different Roles

### Via Tinker

```bash
cd backend
php artisan tinker
```

```php
use App\Models\Utilisateur;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

// Get roles
$adminRole = Role::where('nom_role', 'administrateur')->first();
$gerantRole = Role::where('nom_role', 'gerant')->first();
$clientRole = Role::where('nom_role', 'client')->first();

// Create Admin
Utilisateur::create([
    'nom' => 'Admin',
    'prenom' => 'Super',
    'email' => 'admin@example.com',
    'mot_de_passe' => Hash::make('password123'),
    'telephone' => '0123456789',
    'code_parrainage' => 'ADMIN001',
    'id_role' => $adminRole->id_role,
    'statut_compte' => true,
    'est_actif' => true,
]);

// Create Manager
Utilisateur::create([
    'nom' => 'Manager',
    'prenom' => 'John',
    'email' => 'manager@example.com',
    'mot_de_passe' => Hash::make('password123'),
    'telephone' => '0123456790',
    'code_parrainage' => 'MNGR001',
    'id_role' => $gerantRole->id_role,
    'statut_compte' => true,
    'est_actif' => true,
]);

// Create Client (or use registration endpoint)
Utilisateur::create([
    'nom' => 'Client',
    'prenom' => 'Jane',
    'email' => 'client@example.com',
    'mot_de_passe' => Hash::make('password123'),
    'telephone' => '0123456791',
    'code_parrainage' => 'CLNT001',
    'id_role' => $clientRole->id_role,
    'statut_compte' => true,
    'est_actif' => true,
]);
```

## 🐛 Troubleshooting

### Issue: 403 Forbidden for valid role

**Possible Causes:**
- Role relationship not loaded
- Role name mismatch in database
- Middleware not registered

**Solution:**
```php
// Check user's role
$user = Utilisateur::with('role')->find(1);
dd($user->role->nom_role);

// Verify middleware is registered
php artisan route:list --path=admin
```

### Issue: Frontend shows wrong permissions

**Solution:**
```javascript
// Clear localStorage and re-login
localStorage.clear();
window.location.reload();

// Check user object in console
console.log(user);
console.log('Is Admin:', isAdmin);
console.log('Is Gerant:', isGerant);
```

## 📚 Best Practices

1. **Always use middleware** - Never rely on frontend-only checks
2. **Load relationships** - Ensure role is loaded when checking permissions
3. **Consistent naming** - Use exact role names: `'administrateur'`, `'gerant'`, `'client'`
4. **Test all roles** - Create test users for each role
5. **Graceful errors** - Provide clear error messages for unauthorized access
6. **Audit logs** - Consider logging role-based access attempts

## 🎯 Summary

- **Laravel Breeze** handles authentication (login/logout/register)
- **Custom CheckRole middleware** handles authorization (role-based access)
- **3 roles**: Client (default), Gérant (manager), Administrateur (admin)
- **Backend**: Protect routes with `middleware('role:administrateur,gerant')`
- **Frontend**: Use `isAdmin`, `isGerant` from AuthContext for UI control
- **Database**: Role stored in `role` table, linked via `id_role` in `utilisateur`

---

**Last Updated:** October 31, 2025  
**Status:** ✅ Fully Implemented
