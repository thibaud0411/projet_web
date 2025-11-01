# Laravel Breeze Authentication - Complete Setup Guide

## ✅ What Has Been Fixed

### Backend Changes

1. **✅ AuthenticatedSessionController.php** - Implemented complete login/logout functionality
   - Validates credentials against `Utilisateur` model
   - Checks account status (`statut_compte` and `est_actif`)
   - Returns Sanctum token with user data
   - Properly revokes tokens on logout

2. **✅ API Routes (routes/api.php)** - Replaced inline closures with Breeze controllers
   - Now uses `require __DIR__.'/auth.php'` to include authentication routes
   - Clean separation of concerns

3. **✅ Auth Routes (routes/auth.php)** - Updated for API authentication
   - Public routes: `/api/login`, `/api/register`, `/api/forgot-password`, `/api/reset-password`
   - Protected routes: `/api/logout` (requires Sanctum token)
   - Removed `guest` middleware (not needed for API)

### Frontend Changes

1. **✅ User Type Interface** - Updated to match backend response
   ```typescript
   interface User {
     id: number;
     nom: string;
     prenom: string;
     email: string;
     telephone?: string;
     role: 'administrateur' | 'gerant' | 'client';
     points_fidelite?: number;
   }
   ```

2. **✅ AuthContext.tsx** - Fixed token storage and API response handling
   - Changed token storage key from `'token'` to `'auth_token'` (matches axios.js)
   - Updated API response types to match backend structure
   - Fixed `/api/user` response parsing (no longer nested in `data.data`)

3. **✅ Token Storage Consistency**
   - Both `AuthContext.tsx` and `axios.js` now use `'auth_token'` key
   - Consistent token handling across the application

## 🚀 How to Use

### Backend Setup

1. **Ensure database is configured** in `.env`:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=your_database
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   ```

2. **Run migrations** (if not already done):
   ```bash
   cd backend
   php artisan migrate
   ```

3. **Start the Laravel server**:
   ```bash
   php artisan serve
   ```
   Server will run at `http://localhost:8000`

### Frontend Setup

1. **Install dependencies** (if not already done):
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment** - Create `.env` file:
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Frontend will run at `http://localhost:5173`

## 📋 API Endpoints

### Public Endpoints (No Authentication Required)

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/api/register` | Register new user | `{ nom, prenom, email, password, password_confirmation, telephone?, localisation? }` |
| POST | `/api/login` | Login user | `{ email, password, remember? }` |
| POST | `/api/forgot-password` | Request password reset | `{ email }` |
| POST | `/api/reset-password` | Reset password | `{ email, password, password_confirmation, token }` |

### Protected Endpoints (Requires Bearer Token)

| Method | Endpoint | Description | Headers |
|--------|----------|-------------|---------|
| GET | `/api/user` | Get authenticated user | `Authorization: Bearer {token}` |
| POST | `/api/logout` | Logout user | `Authorization: Bearer {token}` |

## 🔐 Authentication Flow

### Login Flow

1. **Frontend**: User enters email and password on `/login` page
2. **Frontend**: Sends POST request to `/api/login`
3. **Backend**: 
   - Validates credentials
   - Checks if account is active
   - Generates Sanctum token
   - Returns user data + token
4. **Frontend**: 
   - Stores token in localStorage as `'auth_token'`
   - Sets axios Authorization header
   - Redirects to `/dashboard`

### Registration Flow

1. **Frontend**: User fills registration form on `/register` page
2. **Frontend**: Sends POST request to `/api/register`
3. **Backend**:
   - Validates input
   - Creates new user with `client` role
   - Generates Sanctum token
   - Returns user data + token
4. **Frontend**:
   - Stores token in localStorage
   - Sets axios Authorization header
   - Redirects to `/dashboard`

### Logout Flow

1. **Frontend**: User clicks logout button
2. **Frontend**: Sends POST request to `/api/logout` with Bearer token
3. **Backend**: Revokes the current access token
4. **Frontend**:
   - Removes token from localStorage
   - Clears axios Authorization header
   - Redirects to `/login`

## 🧪 Testing the Authentication

### Test Login with cURL

```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "user": {
    "id": 1,
    "nom": "Doe",
    "prenom": "John",
    "email": "test@example.com",
    "telephone": "0123456789",
    "role": "client",
    "points_fidelite": 0
  },
  "token": "1|abcdef123456...",
  "message": "Connexion réussie"
}
```

### Test Registration with cURL

```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "nom": "Dupont",
    "prenom": "Marie",
    "email": "marie.dupont@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "telephone": "0612345678"
  }'
```

### Test Get User with cURL

```bash
curl -X GET http://localhost:8000/api/user \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test Logout with cURL

```bash
curl -X POST http://localhost:8000/api/logout \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🔧 Configuration Files

### Backend Configuration

**`config/auth.php`**
- Default guard: `api` (Sanctum)
- Provider: `utilisateurs` (Utilisateur model)
- Password broker: `utilisateurs`

**`config/cors.php`**
- Allowed origins: `http://localhost:5173`, `http://localhost:3000`
- Supports credentials: `true`
- Allowed methods: All
- Allowed headers: All

### Frontend Configuration

**`src/api/axios.js`**
- Base URL: `http://localhost:8000/api`
- Token storage key: `'auth_token'`
- Automatic token injection via interceptor
- 401 error handling (auto-redirect to login)

**`src/context/AuthContext.tsx`**
- Manages global authentication state
- Provides `login`, `logout`, `register` functions
- Auto-fetches user on app load if token exists
- Token storage key: `'auth_token'`

## 🐛 Troubleshooting

### Issue: 401 Unauthorized

**Possible Causes:**
- Token not being sent in Authorization header
- Token expired or invalid
- User account is inactive

**Solution:**
```javascript
// Check if token exists
console.log(localStorage.getItem('auth_token'));

// Check axios headers
console.log(axios.defaults.headers.common['Authorization']);
```

### Issue: CORS Errors

**Solution:**
1. Verify `config/cors.php` includes your frontend URL
2. Ensure `withCredentials: true` in axios config
3. Check backend is running on correct port

### Issue: 422 Validation Error

**Possible Causes:**
- Missing required fields
- Invalid email format
- Password too short (minimum 8 characters)
- Password confirmation doesn't match

**Solution:**
Check the error response for specific validation messages:
```javascript
catch (error) {
  console.log(error.response?.data?.errors);
}
```

### Issue: Token Not Persisting

**Solution:**
Ensure both files use the same storage key:
- `AuthContext.tsx`: `localStorage.getItem('auth_token')`
- `axios.js`: `localStorage.getItem('auth_token')`

## 🔒 Security Features

- ✅ **Password Hashing** - Bcrypt hashing via Laravel Hash facade
- ✅ **Token-Based Auth** - Laravel Sanctum for API authentication
- ✅ **CSRF Protection** - CSRF cookie for session-based requests
- ✅ **Account Status Check** - Validates `statut_compte` and `est_actif`
- ✅ **Role-Based Access** - User roles (administrateur, gerant, client)
- ✅ **Token Revocation** - Tokens properly revoked on logout

## 📝 Next Steps

### Recommended Enhancements

1. **Email Verification**
   - Implement email verification flow
   - Use existing `VerifyEmailController`

2. **Password Reset**
   - Test forgot password functionality
   - Configure mail settings in `.env`

3. **Remember Me**
   - Implement longer token expiration for "remember me"

4. **Rate Limiting**
   - Add throttling to auth endpoints
   - Prevent brute force attacks

5. **Two-Factor Authentication**
   - Add 2FA for enhanced security

6. **Social Login**
   - Integrate Google/Facebook OAuth

## 📚 Resources

- [Laravel Breeze Documentation](https://laravel.com/docs/11.x/starter-kits#breeze)
- [Laravel Sanctum Documentation](https://laravel.com/docs/11.x/sanctum)
- [React Context API](https://react.dev/reference/react/useContext)
- [Axios Documentation](https://axios-http.com/docs/intro)

---

**Last Updated:** October 31, 2025  
**Status:** ✅ Fully Functional
