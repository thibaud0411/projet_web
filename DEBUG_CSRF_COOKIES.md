# Debug CSRF Cookie Issue

## Step-by-Step Debugging

### Step 1: Verify Backend Restarted
**Did you restart the backend server?** `.env` changes require a restart!

```bash
# In the terminal running php artisan serve:
# Press Ctrl+C to stop
# Then run:
cd backend
php artisan config:clear
php artisan serve
```

You should see:
```
INFO  Server running on [http://127.0.0.1:8000]
```

### Step 2: Check Cookies in Browser

1. Open DevTools (F12)
2. Go to **Network** tab
3. Click on the `/sanctum/csrf-cookie` request
4. Look at **Response Headers**

**Should see:**
```
Set-Cookie: XSRF-TOKEN=...; path=/; domain=localhost; samesite=lax
Set-Cookie: laravel_session=...; path=/; domain=localhost; httponly; samesite=lax
```

5. Go to **Application** tab → **Cookies** → `http://localhost:8000`

**Should see:**
- `XSRF-TOKEN` cookie
- `laravel_session` cookie (or similar)

### Step 3: Check if Cookies are Sent

1. In Network tab, click on the `/api/login` request
2. Look at **Request Headers**

**Should see:**
```
Cookie: XSRF-TOKEN=...; laravel_session=...
X-XSRF-TOKEN: ... (decoded token value)
```

**If you DON'T see these cookies**, the problem is cookie domain/path mismatch.

## Common Issues & Fixes

### Issue 1: Cookies Not Being Set

**Symptom:** No `Set-Cookie` headers in `/sanctum/csrf-cookie` response

**Cause:** Backend not restarted or config cached

**Fix:**
```bash
cd backend
php artisan config:clear
php artisan cache:clear
# Stop server (Ctrl+C)
php artisan serve
```

### Issue 2: Cookies Set But Not Sent

**Symptom:** Cookies visible in Application tab, but not in request headers

**Cause:** Domain/path mismatch or SameSite issue

**Fix:** Check cookie domain in Application tab. Should be `localhost` (not `localhost:8000`)

### Issue 3: X-XSRF-TOKEN Header Missing

**Symptom:** Cookie sent, but no `X-XSRF-TOKEN` header

**Cause:** Axios not reading the cookie properly

**Fix:** The issue is that axios needs to read the `XSRF-TOKEN` cookie and send it as `X-XSRF-TOKEN` header. This should be automatic, but let's verify.

## Quick Test: Manual Cookie Check

Open browser console and run:
```javascript
// Check if cookies exist
document.cookie

// Should show something like:
// "XSRF-TOKEN=...; laravel_session=..."
```

If you see the cookies, they're being set correctly.

## The Real Issue: Cookie Reading

If cookies are set but not sent, the problem is that **axios isn't reading the cookie** to create the `X-XSRF-TOKEN` header.

### Solution: Update apiClient

The `X-XSRF-TOKEN` header should be automatically added by axios when `withCredentials: true` is set, BUT it only reads from cookies named `XSRF-TOKEN`.

Let me check your Laravel config to ensure the cookie name is correct.

## Verify Laravel Cookie Names

Run in backend:
```bash
php artisan tinker
```

Then:
```php
config('sanctum.cookie');  // Should be 'XSRF-TOKEN'
```

## Alternative: Add XSRF Header Manually

If automatic header isn't working, we can add it manually in apiClient:

```typescript
// Add interceptor to read cookie and set header
apiClient.interceptors.request.use((config) => {
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];
  
  if (token) {
    config.headers['X-XSRF-TOKEN'] = decodeURIComponent(token);
  }
  
  return config;
});
```

## Next Steps

1. **Restart backend** (if not done)
2. **Clear all cookies** in browser
3. Open **Network tab** in DevTools
4. Try login again
5. **Check:**
   - Does `/sanctum/csrf-cookie` set cookies?
   - Does `/api/login` send cookies?
   - Does `/api/login` have `X-XSRF-TOKEN` header?

**Report back what you see in the Network tab!**

---

**Most likely issue:** Backend not restarted after `.env` change
