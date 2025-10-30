# Laravel Breeze Authentication Implementation

## Overview

This project now uses **Laravel Breeze** for authentication, providing a complete, production-ready authentication system for both the backend API and React frontend.

## Features Implemented

### Backend (Laravel)

- ✅ **Login** - User authentication with Sanctum tokens
- ✅ **Registration** - New user registration with role assignment
- ✅ **Logout** - Token revocation
- ✅ **Password Reset** - Email-based password reset flow
- ✅ **Forgot Password** - Request password reset link
- ✅ **Custom User Model** - Adapted to work with `Utilisateur` model

### Frontend (React)

- ✅ **Login Page** - `/login`
- ✅ **Registration Page** - `/register`
- ✅ **Forgot Password Page** - `/forgot-password`
- ✅ **Reset Password Page** - `/reset-password`
- ✅ **Protected Routes** - Admin dashboard and pages
- ✅ **Auth Context** - Centralized authentication state management

## API Endpoints

### Public Routes

```
POST /api/register
POST /api/login
POST /api/forgot-password
POST /api/reset-password
```

### Protected Routes (Requires Authentication)

```
POST /api/logout
GET  /api/user
```

## Backend Structure

### Controllers

**`app/Http/Controllers/Auth/`**

- `AuthenticatedSessionController.php` - Login/Logout
- `RegisteredUserController.php` - User registration
- `PasswordResetLinkController.php` - Send reset link
- `NewPasswordController.php` - Reset password
- `EmailVerificationNotificationController.php` - Email verification
- `VerifyEmailController.php` - Verify email

### Routes

**`routes/auth.php`** - Contains all Breeze authentication routes

**`routes/api.php`** - Includes auth routes via `require __DIR__.'/auth.php';`

### Configuration

**`config/auth.php`**
- Default guard: `api` (Sanctum)
- Provider: `utilisateurs` (Utilisateur model)
- Password broker: `utilisateurs`

## Frontend Structure

### Pages

- **`src/pages/Login.jsx`** - Login form with email/password
- **`src/pages/Register.jsx`** - Registration form with full user details
- **`src/pages/ForgotPassword.jsx`** - Request password reset email
- **`src/pages/ResetPassword.jsx`** - Set new password with token

### Context

**`src/context/AuthContext.jsx`**
- Manages authentication state
- Provides `login`, `logout`, `user` to components
- Handles token storage in localStorage

### API Client

**`src/api/axios.js`**
- Configured with base URL
- Automatically adds Bearer token to requests
- Handles 401 errors (redirects to login)

## Usage

### Backend Setup

1. **Install Dependencies** (if not already done):
```bash
cd backend
composer require laravel/breeze --dev
```

2. **Configure Mail** (for password reset):
Edit `.env`:
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@monmiammiam.com"
MAIL_FROM_NAME="${APP_NAME}"
```

3. **Run Migrations** (if not already done):
```bash
php artisan migrate
```

### Frontend Setup

1. **Install Dependencies** (if not already done):
```bash
cd frontend
npm install
```

2. **Configure API URL**:
Create `.env` file:
```env
VITE_API_URL=http://localhost:8000/api
```

3. **Start Development Server**:
```bash
npm run dev
```

## Authentication Flow

### Login Flow

1. User enters email and password on `/login`
2. Frontend sends POST to `/api/login`
3. Backend validates credentials
4. Backend returns user data and Sanctum token
5. Frontend stores token in localStorage
6. User is redirected to `/admin`

### Registration Flow

1. User fills registration form on `/register`
2. Frontend sends POST to `/api/register`
3. Backend creates new user with `client` role
4. Backend returns user data and token
5. Frontend stores token and redirects to `/admin`

### Password Reset Flow

1. User clicks "Forgot Password" on `/login`
2. User enters email on `/forgot-password`
3. Backend sends reset link email
4. User clicks link in email (goes to `/reset-password?token=...&email=...`)
5. User enters new password
6. Backend validates token and updates password
7. User is redirected to `/login`

### Logout Flow

1. User clicks logout button
2. Frontend sends POST to `/api/logout`
3. Backend revokes current token
4. Frontend clears localStorage
5. User is redirected to `/login`

## Security Features

- **Password Hashing** - Bcrypt hashing for all passwords
- **Token-Based Auth** - Sanctum tokens for API authentication
- **CSRF Protection** - Enabled for web routes
- **Password Validation** - Minimum 8 characters required
- **Email Validation** - Valid email format required
- **Account Status Check** - Inactive accounts cannot login
- **Role-Based Access** - Admin/Manager role check for admin panel

## Customization

### Custom Fields in Registration

The registration form includes:
- `nom` (Last name)
- `prenom` (First name)
- `email`
- `telephone` (Phone - optional)
- `localisation` (Location - optional)
- `password`
- `password_confirmation`

### User Model Mapping

The `Utilisateur` model uses custom field names:
- `mot_de_passe` instead of `password`
- `id_utilisateur` instead of `id`
- `date_inscription` instead of `created_at`
- `date_modification` instead of `updated_at`

### Role Assignment

New users are automatically assigned the `client` role. Admin users must be created manually or through a seeder.

## Testing

### Test Login

```bash
# Create a test user in database or use existing admin
# Then test login:
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

### Test Registration

```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom":"Dupont",
    "prenom":"Jean",
    "email":"jean.dupont@example.com",
    "password":"password123",
    "password_confirmation":"password123"
  }'
```

### Test Password Reset

```bash
# Request reset link
curl -X POST http://localhost:8000/api/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com"}'
```

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check if token is being sent in Authorization header
   - Verify token hasn't expired
   - Check if user account is active

2. **422 Validation Error**
   - Check all required fields are provided
   - Verify email format is valid
   - Ensure password meets minimum length

3. **Password Reset Email Not Sending**
   - Configure mail settings in `.env`
   - Check mail logs: `php artisan pail`
   - Use Mailtrap for testing

4. **CORS Errors**
   - Verify `config/cors.php` allows your frontend URL
   - Check `withCredentials: true` in axios config

## Next Steps

- [ ] Implement email verification
- [ ] Add two-factor authentication
- [ ] Implement "Remember Me" functionality
- [ ] Add social login (Google, Facebook)
- [ ] Implement rate limiting for auth endpoints
- [ ] Add password strength meter
- [ ] Implement account lockout after failed attempts

## Resources

- [Laravel Breeze Documentation](https://laravel.com/docs/11.x/starter-kits#breeze)
- [Laravel Sanctum Documentation](https://laravel.com/docs/11.x/sanctum)
- [React Router Documentation](https://reactrouter.com/)

---

**Implementation Date:** October 30, 2025
**Version:** 1.0.0
