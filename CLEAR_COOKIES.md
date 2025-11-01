# Fix 431 Error - Clear Cookies

## Method 1: Browser DevTools (Recommended)

1. Open your browser at `http://localhost:5173`
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Paste this code and press Enter:

```javascript
// Clear all cookies for localhost
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});
console.log("Cookies cleared!");
location.reload();
```

## Method 2: Manual Cookie Deletion

1. Open DevTools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Expand **Cookies** in the left sidebar
4. Click on `http://localhost:5173`
5. Right-click → **Clear** or select all and delete
6. Repeat for `http://localhost:8000` if it appears
7. Refresh the page

## Method 3: Clear All Browser Data

1. Chrome: Settings → Privacy → Clear browsing data
2. Select "Cookies and other site data"
3. Time range: "Last hour"
4. Click "Clear data"

## After Clearing Cookies

1. Close all browser tabs with localhost
2. Restart the Vite dev server:
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```
3. Open `http://localhost:5173` in a fresh tab

## Why This Happens

The XSRF-TOKEN cookie was being set multiple times, growing the Cookie header beyond the server's limit (usually 8KB). This happens when:
- Multiple failed authentication attempts
- CSRF endpoint called repeatedly
- Browser not clearing old cookies

The Vite proxy configuration we added will prevent this in the future.
