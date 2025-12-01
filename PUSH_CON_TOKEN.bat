@echo off
chcp 65001 >nul
cls
echo ========================================
echo   PUSH A GITHUB CON PERSONAL ACCESS TOKEN
echo ========================================
echo.
echo PASO 1: Crea un Personal Access Token
echo ----------------------------------------
echo.
echo 1. Abre este link en tu navegador:
echo    https://github.com/settings/tokens/new
echo.
echo 2. Configuración del token:
echo    - Note: Token para DONET supervisor
echo    - Expiration: 90 days
echo    - Scopes: Marca "repo" (y todos sus sub-items)
echo.
echo 3. Clic en "Generate token"
echo.
echo 4. COPIA EL TOKEN (se muestra solo una vez)
echo    Formato: ghp_xxxxxxxxxxxxxxxxxxxx
echo.
echo ========================================
echo.
pause
echo.
echo PASO 2: Ingresa el token
echo ----------------------------------------
echo.
set /p TOKEN="Pega aquí el token que copiaste: "
echo.
echo PASO 3: Ingresa tu usuario de GitHub
echo ----------------------------------------
echo.
set /p USERNAME="Tu usuario de GitHub: "
echo.
echo ========================================
echo   Haciendo push a GitHub...
echo ========================================
echo.

cd /d "c:\MARTIN\LUIGGY"

git push https://%USERNAME%:%TOKEN%@github.com/mdmq2036/supervisor.git main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   ✅ PUSH EXITOSO!
    echo ========================================
    echo.
    echo Los cambios se subieron a GitHub correctamente.
    echo.
    echo Verifica en: https://github.com/mdmq2036/supervisor
    echo Debe mostrar 33 commits (antes tenía 29)
    echo.
    echo ========================================
    echo   Ahora ve a Render para ver el deploy
    echo ========================================
    echo.
    echo Abriendo Render Dashboard...
    start https://dashboard.render.com/web/srv-d4lsclu3jp1c739ibb2g/events
    echo.
    echo Espera 2-3 minutos a que Render detecte los cambios
    echo y haga el deploy automático.
    echo.
) else (
    echo.
    echo ========================================
    echo   ❌ ERROR EN PUSH
    echo ========================================
    echo.
    echo Posibles causas:
    echo 1. Token inválido o expirado
    echo 2. No marcaste permisos de "repo" al crear el token
    echo 3. Usuario incorrecto
    echo.
    echo Soluciones:
    echo 1. Vuelve a ejecutar este script
    echo 2. Crea un nuevo token
    echo 3. Verifica tu usuario de GitHub
    echo.
    echo O usa GitHub Desktop (más fácil):
    echo https://desktop.github.com/
    echo.
)

pause
