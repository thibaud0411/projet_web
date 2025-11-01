# Test Your Routes

## Quick Test Commands

### 1. Test if backend is running
Open browser and go to:
```
http://localhost:8000
```
Should show: `{"Laravel":"11.x.x"}`

### 2. Test API register endpoint
Open browser and go to:
```
http://localhost:8000/api/register
```
Should show: `{"message":"The GET method is not supported for route api/register. Supported methods: POST."}`

This confirms the route exists!

### 3. Test with curl (if available)
```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Origin: http://localhost:5173" \
  -d "{\"nom\":\"Test\",\"prenom\":\"User\",\"email\":\"test@test.com\",\"password\":\"Password123\",\"password_confirmation\":\"Password123\"}"
```

## Frontend Browser Cache Issue

The error shows the browser is still trying `/register` instead of `/api/register`.

### Solution: Force Browser to Reload

**Method 1: Hard Refresh**
1. Open `http://localhost:5173/signup`
2. Open DevTools (F12)
3. Right-click the refresh button → "Empty Cache and Hard Reload"

**Method 2: Disable Cache in DevTools**
1. Open DevTools (F12)
2. Go to Network tab
3. Check "Disable cache" checkbox
4. Keep DevTools open
5. Refresh the page

**Method 3: Incognito Window (EASIEST)**
1. Open a new Incognito/Private window
2. Go to `http://localhost:5173/signup`
3. Try signing up

**Method 4: Clear localStorage**
1. Open DevTools (F12)
2. Go to Console tab
3. Type: `localStorage.clear()`
4. Press Enter
5. Refresh the page

## Verify the Fix

After clearing cache, open DevTools → Network tab and submit the form.

**You should see:**
```
Request URL: http://localhost:8000/api/register  ✅
Request Method: POST
Status Code: 201 Created (or 422 if validation fails)
```

**NOT:**
```
Request URL: http://localhost:8000/register  ❌
Status Code: 404
```

## Still Not Working?

### Check if Vite dev server recompiled
Look at the terminal running `npm run dev`. You should see:
```
✓ built in XXXms
```

If not, restart the dev server:
1. Press Ctrl+C
2. Run `npm run dev` again

### Check the actual code being served
1. Open DevTools (F12)
2. Go to Sources tab
3. Find `src/context/AuthContext.tsx`
4. Look for line with `apiClient.post('/register'`
5. If you see `axios.post('/api/register'` instead, the browser is using old code

### Nuclear Option: Restart Everything
```bash
# Terminal 1: Stop backend (Ctrl+C), then:
cd backend
php artisan config:clear
php artisan route:clear
php artisan serve

# Terminal 2: Stop frontend (Ctrl+C), then:
cd frontend
npm run dev

# Browser: Open Incognito window
http://localhost:5173/signup
```

---

**The issue is 99% browser cache. Use incognito mode to test!**
