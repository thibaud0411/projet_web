# Breeze + Sanctum for SPA - Why CSRF is Needed

## Your Current Setup (Correct!)

You're using **Laravel Breeze Controllers** with **Sanctum SPA Authentication**. This is the recommended approach for a React + Laravel setup.

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  React Frontend (SPA)          Laravel Backend              │
│  ─────────────────             ──────────────               │
│                                                              │
│  • AuthContext.tsx    ────►    • Breeze Controllers         │
│  • apiClient.ts                  (Login, Register, etc)     │
│  • SignUp.tsx                                               │
│                                • Sanctum Middleware          │
│                                  (CSRF + Token Auth)         │
│                                                              │
│                                • API Routes                  │
│                                  (Protected with Sanctum)    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## What is Laravel Breeze?

**Laravel Breeze** provides:
- ✅ **Authentication Controllers** (Login, Register, Logout, etc.)
- ✅ **Pre-built logic** for user authentication
- ✅ **Validation rules** for registration/login
- ❌ **NOT** a complete SPA solution (needs Sanctum for API)

### Breeze Has Two Modes:

1. **Blade (Server-Side Rendering)** - Traditional Laravel views
   - CSRF tokens embedded in HTML forms
   - No separate frontend needed
   
2. **API (for SPAs)** - What you're using!
   - Controllers only (no views)
   - Requires Sanctum for authentication
   - **Requires CSRF cookie for security**

## What is Laravel Sanctum?

**Laravel Sanctum** provides:
- ✅ **SPA Authentication** via cookies
- ✅ **CSRF Protection** for your API
- ✅ **Token-based auth** for mobile apps
- ✅ **Stateful authentication** for same-domain SPAs

### How Sanctum Works for SPAs:

```
1. Frontend requests CSRF cookie
   GET /sanctum/csrf-cookie
   ← Sets XSRF-TOKEN cookie

2. Frontend makes authenticated request
   POST /api/login
   → Sends XSRF-TOKEN in header
   ← Backend validates CSRF token
   ← Returns user token

3. All subsequent requests
   → Include Bearer token
   → Include CSRF token (for state-changing requests)
```

## Why You Need CSRF with Breeze + Sanctum

### The Problem CSRF Solves

**Cross-Site Request Forgery (CSRF)** is when a malicious site tricks your browser into making requests to your API:

```
Bad Site (evil.com)          Your Browser          Your API
     │                            │                    │
     │  "Click here to win!"      │                    │
     ├───────────────────────────►│                    │
     │                            │                    │
     │  Hidden: POST /api/delete  │                    │
     │          (uses your cookies)│                   │
     │                            ├───────────────────►│
     │                            │                    │
     │                            │  ❌ Without CSRF:  │
     │                            │  Request succeeds! │
     │                            │                    │
     │                            │  ✅ With CSRF:     │
     │                            │  Token missing!    │
     │                            │  Request blocked!  │
```

### Why Sanctum Requires CSRF

When you use **cookie-based authentication** (Sanctum SPA mode):
- Cookies are **automatically sent** by the browser
- Malicious sites can trigger requests with your cookies
- **CSRF tokens prevent this** because they can't be accessed cross-origin

## Your Setup is Correct!

### What You Have:

1. ✅ **Breeze Controllers** - Handle authentication logic
   ```php
   // backend/app/Http/Controllers/Auth/AuthenticatedSessionController.php
   public function store(Request $request) {
       // Login logic from Breeze
   }
   ```

2. ✅ **Sanctum Middleware** - Handles CSRF + authentication
   ```php
   // backend/bootstrap/app.php
   $middleware->api(append: [
       \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
       // ... CSRF middleware
   ]);
   ```

3. ✅ **CSRF Cookie Endpoint** - Sanctum provides this
   ```
   GET /sanctum/csrf-cookie
   ```

4. ✅ **Frontend fetches CSRF** - Before each auth request
   ```typescript
   // frontend/src/context/AuthContext.tsx
   await axios.get('http://localhost:8000/sanctum/csrf-cookie', { 
     withCredentials: true 
   });
   ```

## Alternative: Pure Token-Based (No CSRF)

If you want to **avoid CSRF** entirely, you'd need to:

### Option A: Use Bearer Tokens Only (Stateless)

```typescript
// No cookies, no CSRF needed
const response = await axios.post('/api/login', credentials);
const token = response.data.token;

// All requests use Bearer token
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

**Pros:**
- ✅ No CSRF needed
- ✅ Works cross-domain easily
- ✅ Good for mobile apps

**Cons:**
- ❌ Tokens in localStorage (XSS vulnerable)
- ❌ No automatic refresh
- ❌ Manual token management

### Option B: What You're Using (Stateful SPA)

```typescript
// Cookies + CSRF tokens
await axios.get('/sanctum/csrf-cookie');  // Get CSRF
const response = await axios.post('/api/login', credentials);
```

**Pros:**
- ✅ More secure (HttpOnly cookies)
- ✅ CSRF protection
- ✅ Automatic cookie handling
- ✅ Better for same-domain SPAs

**Cons:**
- ⚠️ Requires CSRF cookie fetch
- ⚠️ More setup

## Why Your Approach is Recommended

Laravel's official documentation recommends **Sanctum SPA authentication** for React + Laravel:

> "If you are building a SPA that will be powered by a Laravel backend, you should use Laravel Sanctum."
> — Laravel Documentation

### Benefits:

1. **Security** - HttpOnly cookies + CSRF protection
2. **Simplicity** - Breeze controllers handle auth logic
3. **Official** - Recommended by Laravel
4. **Scalable** - Easy to add mobile app support later

## Summary

### You're NOT doing anything wrong!

- ✅ Using **Breeze controllers** for auth logic
- ✅ Using **Sanctum** for SPA authentication
- ✅ Fetching **CSRF cookies** before auth requests
- ✅ This is the **official recommended approach**

### The CSRF cookie fetch is REQUIRED because:

1. You're using **cookie-based authentication** (Sanctum SPA mode)
2. Cookies need **CSRF protection** to prevent attacks
3. Sanctum provides `/sanctum/csrf-cookie` for this purpose
4. You must fetch it **before** making state-changing requests (POST, PUT, DELETE)

### This is NOT a workaround - it's the design!

From Laravel Sanctum docs:
> "To authenticate your SPA, your SPA's login page should first make a request to the /sanctum/csrf-cookie endpoint to initialize CSRF protection for the application."

## Quick Reference

### When to Fetch CSRF Cookie:

```typescript
// ✅ Before login
await axios.get('/sanctum/csrf-cookie');
await apiClient.post('/login', credentials);

// ✅ Before register
await axios.get('/sanctum/csrf-cookie');
await apiClient.post('/register', userData);

// ❌ NOT needed for GET requests
await apiClient.get('/user');  // No CSRF needed

// ✅ Needed for state-changing requests
await axios.get('/sanctum/csrf-cookie');
await apiClient.post('/logout');
```

### Your Current Flow (Perfect!):

```
1. App loads → initSanctum() fetches CSRF cookie
2. User signs up → Fetch CSRF → POST /api/register
3. User logs in → Fetch CSRF → POST /api/login
4. User logs out → Fetch CSRF → POST /api/logout
```

---

**Bottom Line:** You're using Laravel's recommended architecture. The CSRF cookie fetch is a required security feature, not a bug or workaround!

**Status:** ✅ Your setup is correct and secure!  
**Date:** October 31, 2025
