# 419 CSRF Token Mismatch - FIXED

## What Was the Problem

The 419 error means Laravel couldn't verify the CSRF token because:
- The CSRF cookie wasn't being fetched before making the POST request
- The `/sanctum/csrf-cookie` endpoint is NOT under `/api`, so `apiClient` was trying to hit `/api/sanctum/csrf-cookie` (wrong!)

## The Fix

Updated `AuthContext.tsx` to:
1. Fetch CSRF cookie using plain `axios` (not `apiClient`)
2. Use correct URL: `http://localhost:8000/sanctum/csrf-cookie`
3. Fetch CSRF cookie BEFORE every login/register request

### Code Changes

```typescript
// Before (WRONG)
await apiClient.get('/sanctum/csrf-cookie');  // Goes to /api/sanctum/csrf-cookie ❌

// After (CORRECT)
await axios.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true });  // ✅
```

## How It Works Now

### Registration Flow:
1. User fills sign-up form
2. Click "Créer mon compte"
3. **Step 1:** Fetch CSRF cookie from `/sanctum/csrf-cookie`
4. **Step 2:** POST to `/api/register` with CSRF token in cookie
5. Backend validates and creates user
6. Returns token + user data
7. Frontend stores token and redirects to dashboard

### Login Flow:
1. User enters credentials
2. Click login button
3. **Step 1:** Fetch CSRF cookie from `/sanctum/csrf-cookie`
4. **Step 2:** POST to `/api/login` with CSRF token
5. Backend validates credentials
6. Returns token + user data
7. Frontend stores token and redirects

## Test It Now

1. **Refresh the page** (the code has been updated)
2. Go to `http://localhost:5173/signup`
3. Fill the form:
   - Prénom: Test
   - Nom: User
   - Email: test@example.com
   - Téléphone: 0612345678
   - Ville: Paris
   - Password: Password123
   - Confirm: Password123
4. Click "Créer mon compte"

### Expected Result

✅ **Success!** You should be:
- Redirected to `/dashboard`
- Logged in automatically
- User created in database

### In DevTools Network Tab

You should see TWO requests:
```
1. GET /sanctum/csrf-cookie
   Status: 204 No Content
   Sets XSRF-TOKEN cookie

2. POST /api/register
   Status: 201 Created
   Response: { token: "...", user: {...}, message: "Inscription réussie" }
```

## Common Issues

### Still getting 419?
**Cause:** Browser cache
**Fix:** Hard refresh (Ctrl+Shift+R) or use incognito

### Getting 422 Validation Error?
**Cause:** Missing or invalid form data
**Fix:** Check all required fields are filled correctly

### Getting 500 Server Error?
**Cause:** Database issue or missing RegisteredUserController
**Fix:** Check Laravel logs in `backend/storage/logs/laravel.log`

## Files Changed

✅ `frontend/src/context/AuthContext.tsx`
- Added CSRF cookie fetch before login/register
- Uses plain `axios` for CSRF endpoint (not `apiClient`)

## Summary

The issue was that:
1. ❌ CSRF cookie wasn't being fetched
2. ❌ Wrong URL for CSRF endpoint

Now:
1. ✅ CSRF cookie fetched before every auth request
2. ✅ Correct URL: `/sanctum/csrf-cookie` (not `/api/sanctum/csrf-cookie`)
3. ✅ Uses `withCredentials: true` to send/receive cookies

**Try signing up now - it should work!** 🎉

---

**Status:** ✅ Fixed  
**Date:** October 31, 2025
