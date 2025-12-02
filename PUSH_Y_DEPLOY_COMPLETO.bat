@echo off
echo ========================================
echo DESPLIEGUE COMPLETO - SUPERVISOR
echo ========================================
echo.
echo [1/4] Agregando todos los cambios a Git...
git add -A
echo.
echo [2/4] Creando commit con timestamp...
git commit -m "DEPLOY FORZADO: Actualizacion completa %date% %time%"
echo.
echo [3/4] Subiendo a GitHub...
set GIT_TERMINAL_PROMPT=0
git push origin main
echo.
echo [4/4] Abriendo URLs importantes...
start "" "https://dashboard.render.com/web/srv-d4lsclu3jp1c739ibb2g/events"
timeout /t 2 >nul
start "" "https://supervisor-svkg.onrender.com/mapa-simple.html"
echo.
echo ========================================
echo DEPLOY COMPLETADO
echo ========================================
echo.
echo IMPORTANTE:
echo 1. Espera 3-5 minutos a que Render despliegue
echo 2. En el navegador presiona: Ctrl+Shift+R
echo 3. Esto limpiara el cache y cargara la version nueva
echo.
echo Si mapa-ubicaciones.html sigue con fechas:
echo - Presiona Ctrl+Shift+R (OBLIGATORIO)
echo - O usa mapa-simple.html en su lugar
echo.
pause
