# Complete CORS Fix - Step by Step

## Problem
Browser shows: `http://localhost:8000/register` instead of `http://localhost:8000/api/register`

This happens because:
1. ✅ **Fixed:** Duplicate routes in `web.php` and `api.php`
2. ⚠️ **Possible:** Browser is caching old JavaScript

## Solution

### Step 1: Clear Backend Route Cache ✅ DONE

```bash
cd backend
php artisan route:clear
php artisan config:clear
php artisan cache:clear
```

### Step 2: Restart Backend Server

**Stop the current server** (Ctrl+C in the terminal running `php artisan serve`)

Then restart:
```bash
cd backend
php artisan serve
```

### Step 3: Clear Browser Cache & Reload Frontend

**Option A: Hard Refresh (Recommended)**
1. Open `http://localhost:5173`
2. Press `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
3. This forces browser to reload all JavaScript files

**Option B: Clear Browser Cache**
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

**Option C: Incognito/Private Window**
1. Open a new incognito/private window
2. Navigate to `http://localhost:5173/signup`

### Step 4: Verify the Fix

Open browser DevTools (F12) → Network tab:

1. Go to `http://localhost:5173/signup`
2. Fill the form and submit
3. Check the Network tab

**You should see:**
```
POST http://localhost:8000/api/register  ← Correct!
Status: 201 Created
```

**NOT:**
```
POST http://localhost:8000/register  ← Wrong!
```

## Files Changed

### ✅ backend/routes/web.php
Removed duplicate `require __DIR__.'/auth.php';`

### ✅ backend/routes/api.php  
Kept `require __DIR__.'/auth.php';` (correct location)

### ✅ frontend/src/context/AuthContext.tsx
Now uses `apiClient` instead of `axios`

### ✅ backend/config/cors.php
Already configured correctly:
```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
```

## Verify Routes

Run this to see all register routes:
```bash
cd backend
php artisan route:list | findstr register
```

**Should show:**
```
POST  api/register  register  App\Http\Controllers\Auth\RegisteredUserController@store
```

**Should NOT show:**
```
POST  register  ← This would be wrong!
```

## Test the Complete Flow

### 1. Backend Running
```bash
cd backend
php artisan serve
```
Output: `Server running on [http://127.0.0.1:8000]`

### 2. Frontend Running
```bash
cd frontend
npm run dev
```
Output: `Local: http://localhost:5173/`

### 3. Test Sign Up
1. Open `http://localhost:5173/signup` in **incognito mode**
2. Fill the form:
   - Prénom: Test
   - Nom: User
   - Email: test@example.com
   - Téléphone: 0612345678
   - Ville: Paris
   - Password: Password123
   - Confirm: Password123
3. Click "Créer mon compte"

### 4. Expected Result
✅ Success! Redirected to `/dashboard`
✅ User created in database
✅ Token stored in localStorage

### 5. Check Network Tab
Should show:
```
POST /api/register
Status: 201
Response: { token: "...", user: {...}, message: "Inscription réussie" }
```

## Still Getting Errors?

### Error: "CORS Missing Allow Origin"
**Cause:** Browser cache
**Fix:** Use incognito window or clear cache completely

### Error: "Failed to fetch"
**Cause:** Backend not running
**Fix:** Start backend with `php artisan serve`

### Error: "419 CSRF Token Mismatch"
**Cause:** CSRF cookie not initialized
**Fix:** Already handled by `initSanctum()` in `main.tsx`

### Error: "422 Validation Error"
**Cause:** Missing or invalid form data
**Fix:** Check all required fields are filled

## Debug Commands

### Check if backend is accessible:
```bash
curl http://localhost:8000
```
Should return: `{"Laravel":"11.x.x"}`

### Check API endpoint:
```bash
curl http://localhost:8000/api/user
```
Should return: `{"message":"Unauthenticated."}`

### Check CORS preflight:
```bash
curl -X OPTIONS http://localhost:8000/api/register \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -v
```
Should include: `Access-Control-Allow-Origin: http://localhost:5173`

## Summary

✅ Removed duplicate auth routes from `web.php`
✅ Auth routes only in `api.php` (with CORS)
✅ Frontend uses `apiClient` (correct baseURL)
✅ CORS configured for `api/*` paths

**Next step:** Hard refresh browser (Ctrl+Shift+R) and test!

---

**Last Updated:** October 31, 2025
