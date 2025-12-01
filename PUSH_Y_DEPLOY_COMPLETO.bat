@echo off
chcp 65001 >nul
cls
color 0A
echo.
echo ═══════════════════════════════════════════════════════════
echo            PUSH A GITHUB Y DEPLOY EN RENDER
echo         Sistema DONET - Automatización Completa
echo ═══════════════════════════════════════════════════════════
echo.
echo.
echo CAMBIOS LISTOS PARA SUBIR:
echo.
echo   ✓ Formato Excel profesional
echo   ✓ Cabecera azul y filas verdes alternadas
echo   ✓ Compatible con Excel, LibreOffice y Google Sheets
echo.
echo ═══════════════════════════════════════════════════════════
echo.
echo.

cd /d "c:\MARTIN\LUIGGY"

echo [PASO 1/4] Verificando estado del repositorio...
echo.
git status
echo.
echo ═══════════════════════════════════════════════════════════
echo.

echo [PASO 2/4] Mostrando commit listo para push...
echo.
git log -1 --oneline
echo.
echo ═══════════════════════════════════════════════════════════
echo.

echo.
echo AHORA VOY A HACER EL PUSH A GITHUB
echo.
echo Si te pide credenciales:
echo   - Usuario: mdmq2036 (o tu usuario de GitHub)
echo   - Password: tu contraseña O Personal Access Token
echo.
pause
echo.

echo [PASO 3/4] Haciendo push a GitHub...
echo.
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo ═══════════════════════════════════════════════════════════
    echo              ✓✓✓ PUSH EXITOSO A GITHUB ✓✓✓
    echo ═══════════════════════════════════════════════════════════
    echo.
    echo Los cambios están en: https://github.com/mdmq2036/supervisor
    echo.
    echo.
    echo [PASO 4/4] Abriendo Render para deploy...
    echo.
    echo Opciones en Render:
    echo   1. Esperar 2-3 minutos (auto-deploy automático^)
    echo   2. O hacer clic en "Manual Deploy" → "Deploy latest commit"
    echo.
    start https://dashboard.render.com/web/srv-d4lsclu3jp1c739ibb2g/events
    echo.
    echo ═══════════════════════════════════════════════════════════
    echo.
    echo ✓ COMPLETADO - RENDER SE ABRIÓ EN TU NAVEGADOR
    echo.
    echo   Verifica en Render que aparezca "Deploying..."
    echo   Espera 3-5 minutos hasta que diga "Live"
    echo.
    echo Después:
    echo   1. Abre la app en producción en modo incógnito
    echo   2. Ve a Reportes
    echo   3. Descarga un Excel
    echo   4. Verifica cabecera azul y filas verdes
    echo.
    echo ═══════════════════════════════════════════════════════════
    echo.

) else (
    echo.
    echo ═══════════════════════════════════════════════════════════
    echo                    ✗✗✗ ERROR EN PUSH ✗✗✗
    echo ═══════════════════════════════════════════════════════════
    echo.
    echo Error al hacer push. Código de error: %errorlevel%
    echo.
    echo SOLUCIONES:
    echo.
    echo 1. USA GITHUB DESKTOP (MÁS FÁCIL^):
    echo    a. Abre GitHub Desktop
    echo    b. File → Add Local Repository
    echo    c. Selecciona: c:\MARTIN\LUIGGY
    echo    d. Clic en "Push origin"
    echo    e. Luego vuelve a ejecutar este script
    echo.
    echo 2. USA PERSONAL ACCESS TOKEN:
    echo    a. Ve a: https://github.com/settings/tokens/new
    echo    b. Crea token con permisos "repo"
    echo    c. Copia el token
    echo    d. Ejecuta este comando:
    echo.
    echo    git push https://TU-USUARIO:TU-TOKEN@github.com/mdmq2036/supervisor.git main
    echo.
    echo 3. VERIFICA CREDENCIALES:
    echo    - Usuario debe tener permisos en mdmq2036/supervisor
    echo    - NO usar cuenta mdmq2037-cloud
    echo.
    echo ═══════════════════════════════════════════════════════════
    echo.
    echo Abriendo GitHub para que verifiques...
    start https://github.com/mdmq2036/supervisor
    echo.
)

echo.
echo Presiona cualquier tecla para cerrar...
pause > nul
