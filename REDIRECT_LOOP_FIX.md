# Redirect Loop Fix - Documentation

## Problem

The application was experiencing an infinite redirect loop with the following errors:
```
Maximum update depth exceeded
Trop d'appels aux API Location ou History dans un court laps de temps
DOMException: The operation is insecure
```

## Root Causes

1. **Catch-all route redirecting to `/admin`**: The wildcard route was redirecting all unknown paths to `/admin`, which would then redirect unauthenticated users back to `/login`, creating a loop.

2. **Missing loading state checks**: Components were trying to render `<Navigate>` components while the authentication state was still being initialized, causing multiple rapid redirects.

3. **Auth checks in multiple places**: Both individual pages (Login, Register) and the layout (AdminLayout) were checking authentication and redirecting, leading to conflicting navigation attempts.

## Solutions Implemented

### 1. Created `ProtectedRoute` Component

**File**: `frontend/src/components/ProtectedRoute.jsx`

A dedicated component that:
- Waits for auth initialization to complete
- Shows a loading spinner during auth check
- Redirects to `/login` if user is not authenticated or doesn't have admin/gerant role
- Renders children if authentication is valid

```jsx
const ProtectedRoute = ({ children }) => {
  const { user, loading, isAdmin, isGerant } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user || (!isAdmin && !isGerant)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
```

### 2. Updated Route Configuration

**File**: `frontend/src/App.jsx`

Changes:
- Wrapped `/admin` routes with `<ProtectedRoute>`
- Changed default redirect from `/admin` to `/login`
- Added explicit root path (`/`) redirect to `/login`

```jsx
<Route path="/admin" element={
  <ProtectedRoute>
    <AdminLayout />
  </ProtectedRoute>
}>
  {/* Admin routes */}
</Route>

<Route path="/" element={<Navigate to="/login" replace />} />
<Route path="*" element={<Navigate to="/login" replace />} />
```

### 3. Simplified AdminLayout

**File**: `frontend/src/components/layout/AdminLayout.jsx`

Removed:
- Auth state checking
- Loading state handling
- Navigate redirect logic

The `ProtectedRoute` wrapper now handles all authentication logic, making `AdminLayout` a pure presentational component.

### 4. Added Loading Checks to Auth Pages

**Files**: 
- `frontend/src/pages/Login.jsx`
- `frontend/src/pages/Register.jsx`

Added loading state checks to prevent redirects during auth initialization:

```jsx
if (authLoading) {
  return <LoadingSpinner />;
}

if (user) {
  return <Navigate to="/admin" replace />;
}
```

## Authentication Flow (Fixed)

### Initial Load
1. App starts → `AuthContext` initializes with `loading: true`
2. `checkAuth()` runs → Checks localStorage for token
3. If token exists → Sets user from localStorage
4. Sets `loading: false`
5. Routes render based on auth state

### Login Flow
1. User visits `/` or any unknown route → Redirects to `/login`
2. User enters credentials → Calls `/api/login`
3. Backend validates → Returns token and user data
4. Frontend stores token → Updates auth context
5. Login page detects user → Redirects to `/admin`
6. ProtectedRoute validates → Renders AdminLayout

### Logout Flow
1. User clicks logout → Clears localStorage
2. Auth context updates → Sets `user: null`
3. ProtectedRoute detects no user → Redirects to `/login`

### Protected Route Access
1. User tries to access `/admin/*` → ProtectedRoute checks auth
2. If loading → Shows spinner
3. If not authenticated → Redirects to `/login`
4. If authenticated but not admin/gerant → Redirects to `/login`
5. If valid → Renders requested page

## Benefits

✅ **Single source of truth**: Authentication logic centralized in `ProtectedRoute`
✅ **No more loops**: Proper loading state handling prevents premature redirects
✅ **Cleaner code**: Components focus on their primary responsibility
✅ **Better UX**: Loading spinners during auth checks
✅ **Maintainable**: Easy to add more protected routes

## Testing

To verify the fix works:

1. **Test unauthenticated access**:
   - Visit `http://localhost:5173/` → Should redirect to `/login`
   - Visit `http://localhost:5173/admin` → Should redirect to `/login`
   - No console errors should appear

2. **Test login flow**:
   - Login with valid credentials → Should redirect to `/admin`
   - Should see dashboard without errors

3. **Test logout flow**:
   - Click logout → Should redirect to `/login`
   - Try accessing `/admin` → Should redirect to `/login`

4. **Test page refresh**:
   - While logged in, refresh page → Should stay on current page
   - Should see brief loading spinner, then content

## Files Modified

- ✅ `frontend/src/components/ProtectedRoute.jsx` (NEW)
- ✅ `frontend/src/App.jsx`
- ✅ `frontend/src/components/layout/AdminLayout.jsx`
- ✅ `frontend/src/pages/Login.jsx`
- ✅ `frontend/src/pages/Register.jsx`

## Files Not Modified (Already Correct)

- ✅ `frontend/src/context/AuthContext.jsx`
- ✅ `frontend/src/pages/ForgotPassword.jsx`
- ✅ `frontend/src/pages/ResetPassword.jsx`

---

**Fixed Date**: October 30, 2025
**Issue**: Infinite redirect loop causing "Maximum update depth exceeded"
**Status**: ✅ RESOLVED
