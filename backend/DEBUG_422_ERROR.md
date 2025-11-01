# 🔍 Debug 422 Validation Error

## Current Situation
✅ **Authentication works** - Token is sent correctly  
❌ **POST /api/admin/employees returns 422** - Validation fails

## 🧪 How to Debug

### 1. Check the Response Body in Browser
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Find the failed request: `POST /api/admin/employees`
4. Click on it
5. Go to **Response** tab
6. Copy the JSON error

You should see something like:
```json
{
  "message": "Erreur de validation",
  "errors": {
    "password": ["Le mot de passe doit contenir au moins une majuscule et un chiffre."],
    "email": ["Cet email existe déjà."]
  }
}
```

### 2. Common Validation Errors

#### Password Requirements
```php
'password' => [
    'required',
    'string',
    'min:8',  // Minimum 8 characters
    'regex:/^(?=.*[A-Z])(?=.*\d)/',  // Must have 1 uppercase + 1 digit
]
```

**Valid passwords:**
- ✅ `Password123`
- ✅ `Employe2024!`
- ✅ `Gerant1234`

**Invalid passwords:**
- ❌ `password` (no uppercase, no digit)
- ❌ `Password` (no digit)
- ❌ `password123` (no uppercase)
- ❌ `Pass1` (too short)

#### Email Must Be Unique
```php
'email' => 'required|email|unique:users,email'
```

If you try to create an employee with email `admin@monmiammiam.com`, it will fail because it already exists.

#### Required Fields
All these are required:
- `nom` (string, max 100 chars)
- `prenom` (string, max 100 chars)
- `email` (valid email, unique)
- `telephone` (string, max 20 chars)
- `role` (must be 'employe' or 'gerant')
- `password` (min 8 chars, 1 uppercase, 1 digit)

### 3. Test with Valid Data

Use the browser console to test:

```javascript
const token = localStorage.getItem('auth_token');

fetch('http://localhost:8000/api/admin/employees', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@test.com',  // Use unique email
    telephone: '+229 90000002',
    role: 'employe',
    password: 'Employe123!'  // Valid password
  })
})
.then(r => r.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
```

### 4. Check React Form Validation

In your `Employees.jsx`, add validation before submit:

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Log data being sent
  console.log('Sending data:', formData);
  
  // Validate password format
  if (!editingEmployee && formData.password) {
    if (formData.password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    if (!/[A-Z]/.test(formData.password)) {
      toast.error('Le mot de passe doit contenir au moins une majuscule');
      return;
    }
    if (!/\d/.test(formData.password)) {
      toast.error('Le mot de passe doit contenir au moins un chiffre');
      return;
    }
  }
  
  try {
    if (editingEmployee) {
      await api.put(`/admin/employees/${editingEmployee.id}`, formData);
      toast.success('Employé modifié avec succès');
    } else {
      await api.post('/admin/employees', formData);
      toast.success('Employé créé avec succès');
    }
    
    setShowModal(false);
    resetForm();
    fetchEmployees();
  } catch (error) {
    // Log full error
    console.error('Full error:', error);
    console.error('Error response:', error.response?.data);
    
    // Show specific validation errors
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      Object.keys(errors).forEach(field => {
        errors[field].forEach(msg => toast.error(msg));
      });
    } else {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'opération');
    }
  }
};
```

### 5. Common Issues

#### Issue: Email already exists
**Solution:** Use a different email for each employee

#### Issue: Password invalid
**Solution:** Ensure password has:
- At least 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 digit (0-9)

#### Issue: Missing required field
**Solution:** Check all fields are filled in the form

---

## 🎯 Quick Fix

**If you just want to test**, use these values:

```javascript
{
  nom: "Test",
  prenom: "Employee",
  email: "test" + Date.now() + "@example.com",  // Unique email
  telephone: "+229 97000001",
  role: "employe",
  password: "Password123!"  // Valid password
}
```

---

## 📝 Next Steps

1. **Check the Network tab** - Get the exact validation error
2. **Fix the validation error** - Adjust your form input
3. **Try again** - Submit with valid data

Once you show me the exact error message from the Network tab Response, I can give you the exact fix! 🚀
