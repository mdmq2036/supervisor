@echo off
echo ========================================
echo VERIFICACION DE DESPLIEGUE - SUPERVISOR
echo ========================================
echo.
echo [1/3] Verificando API de ubicaciones...
curl -s "https://supervisor-svkg.onrender.com/api/ubicaciones/todas" | python -m json.tool | findstr "total"
echo.
echo [2/3] Verificando que mapa-simple.html existe...
curl -s -I "https://supervisor-svkg.onrender.com/mapa-simple.html" | findstr "200"
echo.
echo [3/3] Verificando version del JavaScript...
curl -s "https://supervisor-svkg.onrender.com/mapa-ubicaciones.js" | findstr "VERSIÓN CORREGIDA"
echo.
echo ========================================
echo URLs PARA ABRIR:
echo ========================================
echo Mapa Simple (RECOMENDADO):
echo https://supervisor-svkg.onrender.com/mapa-simple.html
echo.
echo Mapa Original (con filtros):
echo https://supervisor-svkg.onrender.com/mapa-ubicaciones.html
echo.
echo Dashboard Render:
echo https://dashboard.render.com/web/srv-d4lsclu3jp1c739ibb2g/events
echo ========================================
echo.
echo INSTRUCCIONES:
echo 1. Espera 3-5 minutos a que Render termine el deploy
echo 2. Abre el mapa en el navegador
echo 3. Presiona Ctrl+Shift+R para limpiar cache
echo 4. Verifica en consola (F12) que aparezca: "VERSIÓN CORREGIDA"
echo.
pause
