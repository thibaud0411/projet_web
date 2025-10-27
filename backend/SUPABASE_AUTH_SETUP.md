# 🔐 Supabase Authentication Setup Guide

## Overview

Your system uses **Supabase Auth** for password management. Passwords are stored securely in Supabase's `auth.users` table, while user profiles are in your `users` table.

## 📋 Step-by-Step Setup

### 1. Add Supabase Credentials to `.env`

Add these to your `.env` file:

```env
# Database Connection
DB_CONNECTION=pgsql
DB_HOST=aws-0-[region].pooler.supabase.com
DB_PORT=6543
DB_DATABASE=postgres
DB_USERNAME=postgres.[your-project-ref]
DB_PASSWORD=your-database-password
DB_SCHEMA=public

# Supabase Auth API
SUPABASE_URL=https://[your-project-ref].supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

**To get these values:**
1. Go to your Supabase Dashboard
2. Click **Settings** → **API**
3. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **Project API keys** → `anon public` → `SUPABASE_ANON_KEY`
   - **Project API keys** → `service_role` → `SUPABASE_SERVICE_KEY`

### 2. Create Admin User in Supabase

#### Option A: Via Supabase Dashboard (Easiest)

1. Go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Fill in:
   ```
   Email: admin@monmiammiam.com
   Password: Admin123!
   Auto Confirm User: ✅ (check this)
   ```
4. Click **Create user**
5. **Copy the UUID** shown in the user list (you'll need it next)

#### Option B: Via SQL Editor

In Supabase SQL Editor, run:

```sql
-- Create auth user (managed by Supabase)
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@monmiammiam.com',
    crypt('Admin123!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '',
    ''
);
```

### 3. Add User Profile to Your `users` Table

After creating the auth user, add their profile:

```sql
-- Get the UUID from the auth.users table
SELECT id, email FROM auth.users WHERE email = 'admin@monmiammiam.com';

-- Insert into your users table (replace 'uuid-from-above' with actual UUID)
INSERT INTO users (
    id, 
    nom, 
    prenom, 
    email, 
    telephone, 
    role, 
    statut_compte,
    email_verified_at,
    created_at,
    updated_at
) VALUES (
    'uuid-from-above',  -- Must match auth.users id
    'Admin',
    'Super',
    'admin@monmiammiam.com',
    '+229 90000001',
    'administrateur',
    'actif',
    NOW(),
    NOW(),
    NOW()
);
```

### 4. Create Additional Users

For **Gérant**:

```sql
-- In Supabase Dashboard: Create user with email gerant@monmiammiam.com, password Gerant123!
-- Then get UUID and insert profile:

INSERT INTO users (
    id, 
    nom, 
    prenom, 
    email, 
    telephone, 
    role, 
    statut_compte,
    email_verified_at,
    created_at,
    updated_at
) VALUES (
    'gerant-uuid-here',
    'Durand',
    'Jean',
    'gerant@monmiammiam.com',
    '+229 90000002',
    'gerant',
    'actif',
    NOW(),
    NOW(),
    NOW()
);
```

## 🧪 Testing Authentication

### Test with curl:

```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@monmiammiam.com",
    "password": "Admin123!"
  }'
```

### Expected Response:

```json
{
  "user": {
    "id": "uuid-here",
    "nom": "Admin",
    "prenom": "Super",
    "email": "admin@monmiammiam.com",
    "role": "administrateur"
  },
  "token": "your-sanctum-token",
  "supabase_token": "supabase-jwt-token",
  "message": "Connexion réussie"
}
```

## 🔄 How Login Works

1. User sends email + password to Laravel API
2. Laravel forwards credentials to Supabase Auth API
3. Supabase validates password (stored in `auth.users`)
4. If valid, Supabase returns user UUID
5. Laravel fetches user profile from `users` table using UUID
6. Laravel generates Sanctum token for API access
7. Returns both tokens to client

## 📝 User Registration Flow

When users register:

1. Laravel calls Supabase Auth API to create `auth.users` entry
2. Supabase returns new user UUID
3. Laravel inserts profile into `users` table with that UUID
4. User can now login

## 🔧 Troubleshooting

### "Profil utilisateur non trouvé" Error

This means the auth user exists but has no profile in your `users` table.

**Fix:**
```sql
-- Find orphaned auth users
SELECT au.id, au.email 
FROM auth.users au
LEFT JOIN users u ON u.id = au.id
WHERE u.id IS NULL;

-- Add missing profiles
INSERT INTO users (id, nom, prenom, email, telephone, role, statut_compte, created_at, updated_at)
VALUES ('orphaned-uuid', 'Nom', 'Prenom', 'email@example.com', '+229 90000000', 'etudiant', 'actif', NOW(), NOW());
```

### Password Change

To change a user's password:

1. In Supabase Dashboard → **Authentication** → **Users**
2. Click the user
3. Click **Reset password**
4. OR run SQL:

```sql
UPDATE auth.users 
SET encrypted_password = crypt('NewPassword123!', gen_salt('bf'))
WHERE email = 'user@example.com';
```

## 🎯 Admin Credentials

After setup, you can login with:

| Role | Email | Password |
|------|-------|----------|
| Administrateur | admin@monmiammiam.com | Admin123! |
| Gérant | gerant@monmiammiam.com | Gerant123! |

---

**Note**: Never store passwords in your Laravel `users` table. Always use Supabase Auth for authentication!
