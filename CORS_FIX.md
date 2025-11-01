# CORS Error Fix

## Problem

```
Access to XMLHttpRequest at 'http://localhost:8000/api/login' from origin 'http://localhost:5173' 
has been blocked by CORS policy: The 'Access-Control-Allow-Origin' header has a value 
'http://localhost:3000' that is not equal to the supplied origin.
```

## Root Cause

The Laravel backend CORS configuration was set to allow requests only from `http://localhost:3000`, but the Vite React frontend runs on `http://localhost:5173` by default.

## Solution

### 1. Updated CORS Configuration

**File**: `backend/config/cors.php`

Changed from:
```php
'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:3000')],
```

To:
```php
'allowed_origins' => [
    env('FRONTEND_URL', 'http://localhost:5173'),
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
],
```

This now allows requests from:
- Vite default port (5173)
- Create React App default port (3000)
- 127.0.0.1 variant of localhost

### 2. Updated Environment Example

**File**: `backend/.env.example`

Added:
```env
FRONTEND_URL=http://localhost:5173
```

## How to Apply the Fix

### Step 1: Stop the Laravel Server

If your Laravel backend is running, stop it (Ctrl+C in the terminal).

### Step 2: Clear Configuration Cache

```bash
cd backend
php artisan config:clear
php artisan cache:clear
```

### Step 3: Update Your .env File (Optional)

If you have a `backend/.env` file, add this line:
```env
FRONTEND_URL=http://localhost:5173
```

### Step 4: Restart Laravel Server

```bash
php artisan serve
```

### Step 5: Test the Fix

1. Make sure your frontend is running on `http://localhost:5173`
2. Try to login
3. The CORS error should be gone! ✅

## Verification

You should now see successful API calls in the browser console:
```
POST http://localhost:8000/api/login 200 OK
```

Instead of:
```
POST http://localhost:8000/api/login net::ERR_FAILED
```

## Additional Notes

### For Production

When deploying to production, make sure to:

1. Set `FRONTEND_URL` in your production `.env`:
   ```env
   FRONTEND_URL=https://yourdomain.com
   ```

2. Update `allowed_origins` in `config/cors.php` to only include your production domain:
   ```php
   'allowed_origins' => [env('FRONTEND_URL')],
   ```

### CORS Headers Explained

The current configuration allows:
- ✅ **All paths**: `'paths' => ['*']`
- ✅ **All HTTP methods**: `'allowed_methods' => ['*']`
- ✅ **All headers**: `'allowed_headers' => ['*']`
- ✅ **Credentials (cookies/auth)**: `'supports_credentials' => true`

This is perfect for development but should be restricted in production for security.

## Troubleshooting

### Still Getting CORS Errors?

1. **Clear browser cache**: Hard refresh (Ctrl+Shift+R)
2. **Check backend is running**: Visit `http://localhost:8000/api/user` in browser
3. **Verify frontend URL**: Check browser address bar shows `localhost:5173`
4. **Check Laravel logs**: `backend/storage/logs/laravel.log`

### Different Port?

If your frontend runs on a different port, add it to `config/cors.php`:
```php
'allowed_origins' => [
    'http://localhost:YOUR_PORT',
    // ... other origins
],
```

---

**Fixed Date**: October 30, 2025
**Issue**: CORS blocking API requests from Vite frontend
**Status**: ✅ RESOLVED
