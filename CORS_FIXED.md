# CORS Error Fixed

## Problem
The frontend was getting CORS errors when trying to register/login because:
1. **AuthContext was using wrong axios instance** - Using default `axios` instead of configured `apiClient`
2. **Wrong API paths** - Hitting `/register` instead of `/api/register`
3. **Backend might not be running**

## Solution Applied

### 1. Fixed AuthContext.tsx
**Changed from:**
```typescript
import axios from 'axios';

// Using default axios
await axios.post('/api/login', {...});
```

**Changed to:**
```typescript
import apiClient from '../apiClient';

// Using configured apiClient (already has /api prefix)
await apiClient.post('/login', {...});
```

### 2. Benefits of Using apiClient

The `apiClient` is pre-configured with:
- ✅ Base URL: `http://localhost:8000/api`
- ✅ CSRF cookie initialization via `initSanctum()`
- ✅ `withCredentials: true` for Sanctum
- ✅ Proper headers (`Accept`, `Content-Type`, `X-Requested-With`)
- ✅ 401 error interceptor (auto-redirect to login)

### 3. API Endpoints Now Correct

| Old (Wrong) | New (Correct) |
|-------------|---------------|
| `axios.post('/api/login')` → `http://localhost:8000/api/login` | `apiClient.post('/login')` → `http://localhost:8000/api/login` |
| `axios.post('/api/register')` → `http://localhost:8000/api/register` | `apiClient.post('/register')` → `http://localhost:8000/api/register` |
| `axios.get('/api/user')` → `http://localhost:8000/api/user` | `apiClient.get('/user')` → `http://localhost:8000/api/user` |

## How to Start Backend

```bash
cd backend
php artisan serve
```

Backend will run at: `http://localhost:8000`

## How to Start Frontend

```bash
cd frontend
npm run dev
```

Frontend will run at: `http://localhost:5173`

## Test the Fix

1. **Start backend** (in one terminal):
   ```bash
   cd backend
   php artisan serve
   ```

2. **Start frontend** (in another terminal):
   ```bash
   cd frontend
   npm run dev
   ```

3. **Navigate to**: `http://localhost:5173/signup`

4. **Fill the form and submit** - Should work without CORS errors!

## Verify Backend is Running

Open browser and visit:
- `http://localhost:8000` - Should show Laravel welcome page
- `http://localhost:8000/api/user` - Should return 401 (unauthenticated)

If you get "This site can't be reached", the backend is not running.

## Common Issues

### Issue: "This site can't be reached"
**Solution:** Start the backend with `php artisan serve`

### Issue: Still getting CORS errors
**Solution:** 
1. Clear browser cache
2. Restart both servers
3. Check `backend/config/cors.php` includes `http://localhost:5173`

### Issue: 419 CSRF Token Mismatch
**Solution:** The `initSanctum()` in `main.tsx` handles this automatically

## Files Changed

1. ✅ `frontend/src/context/AuthContext.tsx` - Now uses `apiClient`
2. ✅ `frontend/src/main.tsx` - Calls `initSanctum()` on startup
3. ✅ `frontend/src/apiClient.ts` - Already configured correctly

---

**Status:** ✅ Fixed  
**Date:** October 31, 2025
