@echo off
echo ========================================
echo Complete Reset Script for 431 Error
echo ========================================
echo.

echo Step 1: Clearing Laravel cache...
cd /d "%~dp0backend"
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
echo Laravel cache cleared!
echo.

echo Step 2: Clearing Vite cache...
cd /d "%~dp0frontend"
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo Vite cache deleted!
) else (
    echo No Vite cache found.
)
echo.

echo ========================================
echo Reset complete!
echo.
echo Now do the following:
echo 1. Close ALL browser tabs with localhost
echo 2. Clear browser cookies manually (F12 > Application > Cookies)
echo 3. Start Laravel: cd backend ^&^& php artisan serve
echo 4. Start Vite: cd frontend ^&^& npm run dev
echo 5. Open http://localhost:5173 in INCOGNITO mode
echo ========================================
pause
