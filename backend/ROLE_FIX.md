# 🔧 Role Authentication Fix

## ❌ Problem

**Symptom**: Admin user logging in gets `role: "client"` instead of `role: "administrateur"`

**Frontend Error**:
```javascript
user: { 
  id: 1, 
  nom: "Admin", 
  prenom: "System", 
  email: "admin@test.com", 
  role: "client"  // ❌ WRONG - should be "administrateur"
}
isAdmin: false  // ❌ Access denied
```

## ✅ Root Cause

The `Utilisateur` model was returning raw database fields without mapping `id_role` to the actual role name.

### Database Structure:
- Table `utilisateur` has `id_role` (integer: 1, 2, 3, 4)
- Table `role` has the role names (administrateur, gerant, employe, etudiant)
- The API was NOT loading the relationship or mapping the role name

## 🔧 What Was Fixed

### 1. Added Role Accessor to `Utilisateur` Model

**File**: `app/Models/Utilisateur.php`

```php
// Added this accessor method
public function getRoleAttribute(): string
{
    $roleMap = [
        1 => 'administrateur',  // Admin
        2 => 'gerant',         // Manager
        3 => 'employe',        // Employee
        4 => 'etudiant',       // Student/Client
    ];
    
    return $roleMap[$this->id_role] ?? 'etudiant';
}
```

### 2. Added `appends` Property

```php
protected $appends = [
    'role',  // Automatically include role in JSON
    'id',    // Map id_utilisateur to id
];
```

### 3. Hidden Raw Database Fields

```php
protected $hidden = [
    'mot_de_passe',
    'id_role',  // Hide raw role ID, show mapped role name instead
];
```

### 4. Added ID Accessor for Frontend Compatibility

```php
public function getIdAttribute(): int
{
    return $this->id_utilisateur;  // Maps id_utilisateur -> id
}
```

## ✅ Expected Result Now

After the fix, when you login as admin:

```javascript
user: {
  id: 1,                          // ✅ Mapped from id_utilisateur
  nom: "Admin",
  prenom: "System", 
  email: "admin@test.com",
  telephone: "+237690000001",
  role: "administrateur",         // ✅ CORRECT - mapped from id_role = 1
  points_fidelite: 0
}
isAdmin: true   // ✅ Access granted
isGerant: false
```

## 🔍 Role Mapping Table

| id_role | Database | API Response | isAdmin | isGerant |
|---------|----------|--------------|---------|----------|
| 1 | Administrateur | `administrateur` | ✅ true | ❌ false |
| 2 | Gerant | `gerant` | ❌ false | ✅ true |
| 3 | Employe | `employe` | ❌ false | ❌ false |
| 4 | Etudiant | `etudiant` | ❌ false | ❌ false |

## 📋 How Frontend Checks Roles

**File**: `frontend/src/context/AuthContext.tsx`

```typescript
isAdmin: user?.role === 'administrateur',
isGerant: user?.role === 'gerant'
```

**File**: `frontend/src/components/ProtectedRoute.tsx`

```typescript
// Allows access only to admin and gerant
if (!user || (!isAdmin && !isGerant)) {
  return <Navigate to="/login" replace />;
}
```

## 🧪 Testing the Fix

### 1. Clear Browser Cache and Cookies
```bash
# In browser console
localStorage.clear();
sessionStorage.clear();
```

### 2. Re-login with Admin Account
```
Email: admin@test.com
Password: password
```

### 3. Check Console Output
You should see:
```
ProtectedRoute - loading: false 
user: { id: 1, role: "administrateur", ... }
isAdmin: true 
isGerant: false
ProtectedRoute: Access granted  // ✅
```

### 4. Test All Role Accounts

| Email | Password | Expected Role | Should Access Admin Panel |
|-------|----------|---------------|---------------------------|
| admin@test.com | password | `administrateur` | ✅ Yes |
| gerant@test.com | password | `gerant` | ✅ Yes |
| employe@test.com | password | `employe` | ❌ No |
| etudiant@test.com | password | `etudiant` | ❌ No |

## 🔄 If Still Not Working

### Option 1: Restart Backend Server
```bash
# Stop current server (Ctrl+C)
php artisan serve
```

### Option 2: Clear Laravel Cache
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

### Option 3: Check API Response Directly
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password"}' | jq
```

**Expected Response**:
```json
{
  "user": {
    "id": 1,
    "nom": "Admin",
    "prenom": "System",
    "email": "admin@test.com",
    "telephone": "+237690000001",
    "role": "administrateur",  // ✅ Must be "administrateur"
    "points_fidelite": 0,
    ...
  },
  "token": "...",
  "message": "Connexion réussie"
}
```

### Option 4: Debug in Frontend
Add this to `AuthContext.tsx` login function:
```typescript
const response = await authAPI.login(credentials);
console.log('🔍 API Response:', response); // Check what API returns
console.log('🔍 User Role:', response.user.role); // Should be "administrateur"
```

## ⚙️ Technical Details

### Why This Works

1. **Laravel Accessors**: Automatically transform attributes when models are converted to JSON
2. **Appends Property**: Tells Laravel to always include these computed attributes
3. **Role Mapping**: Converts database integer IDs to frontend-friendly strings
4. **Hidden Fields**: Prevents exposing internal IDs to frontend

### Alternative Approaches (Not Used)

**Approach 1**: Load relationship in controller
```php
// Could do this in AuthController
$user = Utilisateur::with('roleRelation')->where('email', $email)->first();
return ['user' => [...$user->toArray(), 'role' => $user->roleRelation->nom_role]];
```

**Approach 2**: Use API Resources
```php
// Create a UserResource
class UserResource extends JsonResource {
    public function toArray($request) {
        return [
            'id' => $this->id_utilisateur,
            'role' => $this->roleRelation->nom_role,
            ...
        ];
    }
}
```

**Why We Used Accessors**: Simpler, works everywhere automatically, no need to remember to load relationships.

## 🎯 Summary

✅ **Fixed**: `Utilisateur` model now automatically maps `id_role` to role name
✅ **Result**: Admin users get `role: "administrateur"` 
✅ **Impact**: ProtectedRoute now correctly identifies admins and gérants
✅ **Benefit**: No need to modify AuthController or add Resources

The fix is at the model level, so it works everywhere the User model is returned!
