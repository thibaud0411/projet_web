# Authentication Quick Reference

## 🚀 Quick Start

### Start Backend
```bash
cd backend
php artisan serve
# Runs at http://localhost:8000
```

### Start Frontend
```bash
cd frontend
npm run dev
# Runs at http://localhost:5173
```

## 📋 API Endpoints Cheat Sheet

### Public Routes (No Token Required)

```bash
# Login
POST /api/login
Body: { "email": "user@example.com", "password": "password123" }

# Register
POST /api/register
Body: {
  "nom": "Doe",
  "prenom": "John",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "telephone": "0123456789"  // optional
}

# Forgot Password
POST /api/forgot-password
Body: { "email": "user@example.com" }

# Reset Password
POST /api/reset-password
Body: {
  "email": "user@example.com",
  "password": "newpassword123",
  "password_confirmation": "newpassword123",
  "token": "reset_token_from_email"
}
```

### Protected Routes (Token Required)

```bash
# Get Current User
GET /api/user
Headers: { "Authorization": "Bearer YOUR_TOKEN" }

# Logout
POST /api/logout
Headers: { "Authorization": "Bearer YOUR_TOKEN" }
```

## 💻 Frontend Usage

### Using AuthContext in Components

```tsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, login, logout, isAuthenticated, isAdmin } = useAuth();

  // Login
  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password123');
      // User is now logged in
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // Logout
  const handleLogout = async () => {
    await logout();
    // User is now logged out
  };

  // Check authentication
  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  // Check role
  if (isAdmin) {
    return <div>Admin Panel</div>;
  }

  return <div>Welcome {user?.prenom}!</div>;
}
```

### Making Authenticated API Calls

```tsx
import api from '../api/axios';

// The token is automatically added by axios interceptor
const fetchData = async () => {
  try {
    const response = await api.get('/some-protected-endpoint');
    console.log(response.data);
  } catch (error) {
    console.error('API call failed:', error);
  }
};
```

## 🔐 User Object Structure

```typescript
interface User {
  id: number;
  nom: string;           // Last name
  prenom: string;        // First name
  email: string;
  telephone?: string;
  role: 'administrateur' | 'gerant' | 'client';
  points_fidelite?: number;
}
```

## 🛠️ Common Tasks

### Create a Test User (Backend)

```bash
cd backend
php artisan tinker
```

```php
use App\Models\Utilisateur;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

$clientRole = Role::where('nom_role', 'client')->first();

Utilisateur::create([
    'nom' => 'Test',
    'prenom' => 'User',
    'email' => 'test@example.com',
    'mot_de_passe' => Hash::make('password123'),
    'telephone' => '0123456789',
    'code_parrainage' => 'TEST1234',
    'id_role' => $clientRole->id_role,
    'points_fidelite' => 0,
    'statut_compte' => true,
    'est_actif' => true,
]);
```

### Check Current Token (Frontend)

```javascript
// In browser console
console.log(localStorage.getItem('auth_token'));
```

### Clear Authentication (Frontend)

```javascript
// In browser console
localStorage.removeItem('auth_token');
localStorage.removeItem('user');
window.location.reload();
```

### Test API with Postman

1. **Login Request:**
   - Method: POST
   - URL: `http://localhost:8000/api/login`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
     ```json
     {
       "email": "test@example.com",
       "password": "password123"
     }
     ```

2. **Copy the token from response**

3. **Use Token for Protected Routes:**
   - Method: GET
   - URL: `http://localhost:8000/api/user`
   - Headers:
     - `Content-Type: application/json`
     - `Authorization: Bearer YOUR_TOKEN_HERE`

## 🐛 Quick Debugging

### Check if Backend is Running
```bash
curl http://localhost:8000/api/user
# Should return 401 if not authenticated
```

### Check if Frontend Can Reach Backend
```javascript
// In browser console on http://localhost:5173
fetch('http://localhost:8000/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

### Check CORS Configuration
```bash
# In backend
cat backend/config/cors.php | grep allowed_origins
```

### View Laravel Logs
```bash
cd backend
tail -f storage/logs/laravel.log
```

## 📊 Response Examples

### Successful Login Response
```json
{
  "user": {
    "id": 1,
    "nom": "Doe",
    "prenom": "John",
    "email": "john@example.com",
    "telephone": "0123456789",
    "role": "client",
    "points_fidelite": 0
  },
  "token": "1|abcdefghijklmnopqrstuvwxyz123456",
  "message": "Connexion réussie"
}
```

### Failed Login Response
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": [
      "Les identifiants fournis sont incorrects."
    ]
  }
}
```

### Get User Response
```json
{
  "id": 1,
  "nom": "Doe",
  "prenom": "John",
  "email": "john@example.com",
  "telephone": "0123456789",
  "role": "client",
  "points_fidelite": 0
}
```

## 🔑 Environment Variables

### Backend (.env)
```env
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password

SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173
SESSION_DOMAIN=localhost
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api
```

## ⚡ Pro Tips

1. **Always check the browser console** for frontend errors
2. **Check Laravel logs** for backend errors: `storage/logs/laravel.log`
3. **Use browser DevTools Network tab** to inspect API requests/responses
4. **Clear localStorage** if you encounter token issues
5. **Restart both servers** after making configuration changes

---

**Need Help?** Check `AUTH_SETUP_COMPLETE.md` for detailed documentation.
