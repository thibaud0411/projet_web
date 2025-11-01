# Persistent Authentication Setup Guide

This guide explains how to set up and use the persistent authentication system for your Mon Miam Miam application.

## Overview

The application now features **persistent authentication** using:
- **Backend**: Laravel Sanctum API tokens
- **Frontend**: localStorage for token persistence
- **Auto-login**: Automatic re-authentication on page refresh

## Features

✅ **Persistent Login** - Users stay logged in even after closing the browser  
✅ **Test Student Account** - Pre-configured test account for development  
✅ **Secure Token Storage** - API tokens stored in localStorage  
✅ **Auto-redirect** - Users are automatically redirected to their dashboard  

---

## Backend Setup

### 1. Run Database Seeder

The test user accounts need to be seeded into your database. Run this command in your backend directory:

```bash
cd backend
php artisan db:seed --class=UserSeeder
```

Or run all seeders:

```bash
php artisan db:seed
```

### 2. Test Accounts Created

The seeder creates the following test accounts:

| Role     | Email               | Password   | Points |
|----------|---------------------|------------|--------|
| Student  | student@test.com    | password   | 50     |
| Admin    | admin@test.com      | password   | 0      |
| Employee | employee@test.com   | password   | 0      |

---

## Frontend Setup

### 1. No Additional Setup Required

The frontend is already configured with:
- ✅ `authService` in `src/services/authService.ts`
- ✅ Persistent auth loading in `App.tsx`
- ✅ Updated `LoginPage.tsx` with new auth flow

### 2. How It Works

1. **On Login**: User credentials are sent to `/api/login`
2. **Token Storage**: API token and user data stored in `localStorage`
3. **On Page Load**: App checks for stored auth and auto-restores session
4. **On Logout**: Token and data cleared from `localStorage`

---

## Usage Instructions

### Regular Login

1. Navigate to the login page
2. Enter credentials:
   - **Email**: `student@test.com`
   - **Password**: `password`
3. Click "Se connecter"
4. You'll be redirected to the student dashboard
5. **Refresh the page** - You'll stay logged in! ✨

### Test the Persistence

1. Log in with the test student account
2. Close the browser tab
3. Open the application again
4. **You'll be automatically logged in** and redirected to your dashboard

### Logout

1. Click the logout button in the dashboard
2. Your session will be cleared
3. You'll be redirected to the home page

---

## Developer Notes

### Auth Service API

The `authService` provides the following methods:

```typescript
// Login with credentials
authService.login(email, password)

// Auto-login as test student
authService.autoLoginAsTestStudent()

// Logout
authService.logout()

// Check if authenticated
authService.isAuthenticated()

// Get current auth state
authService.getCurrentAuth()

// Load persisted auth
authService.loadAuth()
```

### Storage Key

Auth data is stored in localStorage under the key:
```
mon_miam_miam_auth
```

### Auth State Structure

```typescript
{
  user: {
    id: number,
    name: string,
    email: string,
    points_balance?: number
  },
  token: string,
  role: 'student' | 'employee' | 'admin' | 'gerant',
  isAuthenticated: boolean
}
```

---

## Troubleshooting

### Issue: User not staying logged in

**Solution**: Clear browser cache and localStorage:
```javascript
// Open browser console
localStorage.clear()
// Then refresh and try logging in again
```

### Issue: "Email ou mot de passe incorrect"

**Solution**: Ensure the seeder has been run:
```bash
php artisan db:seed --class=UserSeeder
```

### Issue: CORS errors

**Solution**: Check your Laravel backend `config/cors.php`:
```php
'supports_credentials' => true,
```

And ensure your `apiClient.ts` has:
```typescript
withCredentials: true
```

---

## Security Notes

⚠️ **Development Only**: The test accounts with simple passwords are for development only.  
⚠️ **Production**: In production, use strong passwords and proper security measures.  
⚠️ **Token Expiry**: Consider implementing token expiration and refresh logic for production.

---

## Next Steps

- [ ] Test the login flow with test accounts
- [ ] Verify persistence by refreshing the page
- [ ] Test logout functionality
- [ ] Customize the student dashboard with real data

---

## Files Modified

**Backend:**
- `database/seeders/UserSeeder.php` (new)
- `database/seeders/DatabaseSeeder.php` (updated)

**Frontend:**
- `src/services/authService.ts` (new)
- `src/App.tsx` (updated)
- `src/pages/LoginPage.tsx` (updated)

---

**Created**: 2025-01-01  
**Version**: 1.0  
**Status**: ✅ Ready to use
