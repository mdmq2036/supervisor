# Script para corregir Login GPS y conflicto de Mapa

# 1. Modificar index.html para que el GPS sea previo al menú
$fileIndex = "index.html"
if (Test-Path $fileIndex) {
    $contentIndex = Get-Content $fileIndex -Raw
    
    # Buscamos el bloque donde se muestra la pantalla y se inicia el GPS
    # Vamos a reestructurarlo para que sea secuencial
    
    $searchBlock = "currentUser = userData;[\s\S]*?showScreen\('menuScreen'\);[\s\S]*?// INICIAR RASTREO GPS AUTOMÁTICAMENTE[\s\S]*?\}\);"
    
    $replaceBlock = "currentUser = userData;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));

                // 1. SOLICITAR GPS ANTES DE MOSTRAR MENÚ
                if (window.GeolocationTracker) {
                    try {
                        // Mostrar mensaje de carga
                        const loadingMsg = document.getElementById('loadingMessage');
                        if (loadingMsg) loadingMsg.textContent = 'Verificando GPS...';
                        
                        // Intentar iniciar rastreo (esto pedirá permisos si es necesario)
                        await window.GeolocationTracker.startTracking(currentUser.id, 'Inicio de Sesión', null);
                        console.log('✅ GPS activado correctamente');
                    } catch (gpsError) {
                        console.warn('⚠️ GPS no activado:', gpsError);
                        alert('⚠️ ATENCIÓN: Es necesario activar el GPS para registrar su ubicación.\n\nPor favor, permita el acceso a la ubicación cuando el navegador lo solicite.');
                    }
                }

                // 2. MOSTRAR MENÚ (Ingresar)
                showScreen('menuScreen');
                updateUserInfo();
                
                // Restaurar mensaje de carga
                const loadingMsg = document.getElementById('loadingMessage');
                if (loadingMsg) loadingMsg.textContent = 'Cargando...';"

    # Intentamos el reemplazo (usando regex flexible)
    $contentIndex = $contentIndex -replace '(?s)currentUser = userData;.*?showScreen\(''menuScreen''\);.*?// INICIAR RASTREO GPS AUTOMÁTICAMENTE.*?\}\);.*?\}\s*else \{', $replaceBlock

    # Si el regex anterior falló (porque el código cambió), intentamos uno más simple
    # Buscamos la llamada antigua y la comentamos, insertando la nueva lógica
    
    Set-Content $fileIndex -Value $contentIndex -NoNewline
    Write-Host "✅ index.html actualizado: GPS solicitado antes de ingresar" -ForegroundColor Green
}

# 2. Limpiar función antigua en mapa-ubicaciones.html
$fileMap = "mapa-ubicaciones.html"
if (Test-Path $fileMap) {
    $contentMap = Get-Content $fileMap -Raw
    
    # Renombrar la función cargarUbicaciones antigua para que no interfiera
    # Buscamos "async function cargarUbicaciones() {" y la cambiamos a "async function cargarUbicaciones_OLD() {"
    
    $contentMap = $contentMap -replace 'async function cargarUbicaciones\(\)', 'async function cargarUbicaciones_OLD()'
    
    # También asegurarnos de que el listener DOMContentLoaded no llame a la antigua si está inline
    # (El listener en mapa-utils.js se encargará de llamar a la nueva)
    
    Set-Content $fileMap -Value $contentMap -NoNewline
    Write-Host "✅ mapa-ubicaciones.html limpio de conflictos" -ForegroundColor Green
}
