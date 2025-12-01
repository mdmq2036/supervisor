@echo off
chcp 65001 >nul
echo ========================================
echo    PUSH A GITHUB - Sistema DONET
echo ========================================
echo.
echo Este script te ayudará a subir los cambios a GitHub
echo.
echo IMPORTANTE:
echo - Tienes 3 commits pendientes de subir
echo - Necesitas las credenciales de la cuenta mdmq2036
echo.
echo ========================================
echo.

cd /d "c:\MARTIN\LUIGGY"

echo Verificando estado...
git status
echo.
echo ========================================
echo.

echo Commits pendientes:
git log origin/main..HEAD --oneline
echo.
echo ========================================
echo.

echo OPCIÓN 1: Push con autenticación
echo.
echo Se abrirá una ventana pidiendo tus credenciales de GitHub
echo Usuario: mdmq2036
echo Password: [tu password o Personal Access Token]
echo.
pause

git push origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✅ PUSH EXITOSO
    echo ========================================
    echo.
    echo Los cambios se subieron correctamente a:
    echo https://github.com/mdmq2036/supervisor
    echo.
    echo Ahora Render detectará los cambios automáticamente
    echo O puedes hacer deploy manual en:
    echo https://dashboard.render.com/web/srv-d4lsclu3jp1c739ibb2g/events
    echo.
) else (
    echo.
    echo ========================================
    echo ❌ ERROR EN PUSH
    echo ========================================
    echo.
    echo Posibles soluciones:
    echo.
    echo 1. USAR GITHUB DESKTOP (MÁS FÁCIL):
    echo    - Abre GitHub Desktop
    echo    - File → Add Local Repository
    echo    - Selecciona: c:\MARTIN\LUIGGY
    echo    - Clic en "Push origin"
    echo.
    echo 2. USAR PERSONAL ACCESS TOKEN:
    echo    a. Ve a: https://github.com/settings/tokens
    echo    b. Generate new token (classic)
    echo    c. Dale permisos de "repo"
    echo    d. Copia el token
    echo    e. Vuelve a ejecutar este script
    echo    f. Cuando pida password, pega el token
    echo.
    echo 3. VERIFICAR CREDENCIALES:
    echo    - Asegúrate de usar la cuenta: mdmq2036
    echo    - NO la cuenta: mdmq2037-cloud
    echo.
)

echo.
pause
