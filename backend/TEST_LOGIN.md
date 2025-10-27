# 🔐 Testing Login - Quick Guide

## ⚠️ Important: Login Uses POST, Not GET

The error you saw is **normal**:
```
"The GET method is not supported for route api/login. Supported methods: POST."
```

**Why?** Authentication endpoints **MUST use POST** for security reasons. GET requests are logged in server logs and browser history, which would expose passwords!

---

## 3️⃣ Ways to Test Login

### 1. Using cURL (Command Line) ✅

```bash
# Basic login request
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@example.com\",\"password\":\"password123\"}"

# Pretty printed response
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@example.com\",\"password\":\"password123\"}" \
  | json_pp
```

**Expected Response (Success):**
```json
{
  "user": {
    "id_utilisateur": 1,
    "nom": "Admin",
    "prenom": "User",
    "email": "admin@example.com",
    ...
  },
  "token": "1|eyJ0eXAiOiJKV1QiLCJhbGc...",
  "message": "Connexion réussie"
}
```

---

### 2. Using Postman 📬

#### Step-by-Step:

1. **Open Postman**
2. **Create New Request**
   - Method: `POST` (NOT GET!)
   - URL: `http://localhost:8000/api/login`

3. **Set Headers**
   - Click "Headers" tab
   - Add: `Content-Type` = `application/json`
   - Add: `Accept` = `application/json`

4. **Set Body**
   - Click "Body" tab
   - Select "raw"
   - Select "JSON" from dropdown
   - Enter:
   ```json
   {
     "email": "admin@example.com",
     "password": "password123"
   }
   ```

5. **Click Send** 🚀

#### Test Other Endpoints:
After getting the token, test authenticated endpoints:
```
GET http://localhost:8000/api/user
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
  Accept: application/json
```

---

### 3. Using Your React Admin Panel 💻

Your frontend is already configured correctly in `src/api/axios.js`:

```javascript
// This is correct - uses POST
const response = await api.post('/login', {
  email: email,
  password: password
});
```

#### Test from Browser Console:

Open your admin panel and run in console:

```javascript
// Test login
fetch('http://localhost:8000/api/login', {
  method: 'POST',  // ← Must be POST!
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'password123'
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));
```

---

## 🧪 Create Test User

If you don't have a user yet, create one via Tinker:

```bash
php artisan tinker
```

```php
// Create admin role
$role = App\Models\Role::create([
    'nom_role' => 'administrateur',
    'description' => 'Administrator role'
]);

// Create admin user
$user = App\Models\Utilisateur::create([
    'nom' => 'Admin',
    'prenom' => 'User',
    'email' => 'admin@example.com',
    'mot_de_passe' => Hash::make('password123'),
    'telephone' => '0123456789',
    'id_role' => $role->id_role,
    'statut_compte' => 'actif',
    'code_parrainage' => 'ADMIN001',
    'points_fidelite' => 0
]);

echo "User created! Email: admin@example.com, Password: password123\n";
```

---

## 📋 Test Checklist

### ✅ Test These Endpoints:

#### 1. **Login (POST)**
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

#### 2. **Get Current User (GET with token)**
```bash
curl -X GET http://localhost:8000/api/user \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

#### 3. **Get Public Articles (GET)**
```bash
curl -X GET http://localhost:8000/api/articles \
  -H "Accept: application/json"
```

#### 4. **Get Public Categories (GET)**
```bash
curl -X GET http://localhost:8000/api/categories-list \
  -H "Accept: application/json"
```

#### 5. **Admin: Get Statistics (GET with admin token)**
```bash
curl -X GET http://localhost:8000/api/admin/statistics \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Accept: application/json"
```

---

## 🐛 Common Issues

### Issue 1: "Method Not Allowed" ❌
**Error:** `The GET method is not supported for route api/login`

**Solution:** Change to POST request!
- ❌ DON'T: Open `http://localhost:8000/api/login` in browser
- ✅ DO: Use POST request with cURL, Postman, or fetch

### Issue 2: "Unauthenticated" ❌
**Error:** `{"message":"Unauthenticated."}`

**Solution:** Include Authorization header
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Issue 3: "CORS Error" ❌
**Error:** `Access to fetch at 'http://localhost:8000/api/login' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Solution:** Already configured! Make sure:
- Backend is running: `php artisan serve`
- Frontend is on port 5173: `npm run dev`
- CORS config includes `http://localhost:5173`

### Issue 4: "Invalid Credentials" ❌
**Error:** `{"message":"Identifiants incorrects"}`

**Solution:** 
- Check user exists in database
- Verify password is correct
- Create test user with Tinker (see above)

---

## 🎯 Quick Test Script

Save this as `test_login.sh`:

```bash
#!/bin/bash

echo "🧪 Testing Mon Miam Miam API"
echo "================================"

# Test login
echo "\n1️⃣ Testing LOGIN (POST)..."
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}' \
  -w "\nHTTP Status: %{http_code}\n\n"

# Test public articles
echo "2️⃣ Testing PUBLIC ARTICLES (GET)..."
curl -X GET http://localhost:8000/api/articles \
  -H "Accept: application/json" \
  -w "\nHTTP Status: %{http_code}\n\n"

# Test public categories
echo "3️⃣ Testing PUBLIC CATEGORIES (GET)..."
curl -X GET http://localhost:8000/api/categories-list \
  -H "Accept: application/json" \
  -w "\nHTTP Status: %{http_code}\n\n"

echo "✅ Tests complete!"
```

Run with: `bash test_login.sh`

---

## 📚 Related Files

- **Routes**: `routes/api.php`
- **AuthController**: `app/Http/Controllers/AuthController.php`
- **User Model**: `app/Models/Utilisateur.php`
- **Admin Axios**: `mon-miam-miam-admin/src/api/axios.js`

---

## ✨ Summary

**Remember:**
- ✅ Login = POST (with JSON body)
- ❌ Login ≠ GET (that's what you tried!)
- 🔑 Save the token from login response
- 📬 Use token in `Authorization: Bearer TOKEN` header
- 🎯 Test with cURL, Postman, or browser fetch()

Happy testing! 🚀
