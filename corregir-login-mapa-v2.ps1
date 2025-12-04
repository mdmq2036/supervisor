# Script corregido para Login GPS y Mapa

# 1. Modificar index.html
$fileIndex = "index.html"
if (Test-Path $fileIndex) {
    $contentIndex = Get-Content $fileIndex -Raw
    
    # Definir el bloque nuevo (usando comillas dobles para el string de PowerShell y simples para JS)
    $newLogic = "
                currentUser = userData;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));

                // 1. SOLICITAR GPS ANTES DE MOSTRAR MENU
                if (window.GeolocationTracker) {
                    try {
                        const loadingMsg = document.getElementById('loadingMessage');
                        if (loadingMsg) loadingMsg.textContent = 'Verificando GPS...';
                        
                        await window.GeolocationTracker.startTracking(currentUser.id, 'Inicio de Sesion', null);
                        console.log('GPS activado correctamente');
                    } catch (gpsError) {
                        console.warn('GPS no activado:', gpsError);
                        alert('ATENCION: Es necesario activar el GPS para registrar su ubicacion. Por favor, permita el acceso.');
                    }
                }

                // 2. MOSTRAR MENU
                showScreen('menuScreen');
                updateUserInfo();
                
                const loadingMsg = document.getElementById('loadingMessage');
                if (loadingMsg) loadingMsg.textContent = 'Cargando...';
    "

    # Reemplazar el bloque antiguo. Buscamos una cadena única que identifique el lugar.
    # El bloque antiguo terminaba con "showScreen('menuScreen');" y luego tenía el bloque de GPS.
    # Vamos a buscar desde "currentUser = userData;" hasta el final del bloque GPS antiguo.
    
    # Estrategia: Leer todo el archivo y reemplazar el bloque específico conocido
    # Bloque conocido (simplificado para regex):
    # currentUser = userData;[\s\S]*?// INICIAR RASTREO GPS AUTOMÁTICAMENTE[\s\S]*?\}\s*else \{
    
    # Para evitar errores de regex complejos, vamos a hacer un reemplazo más directo si es posible.
    # O mejor, sobrescribimos la función handleLogin completa si la tenemos clara, pero es arriesgado.
    
    # Vamos a intentar reemplazar solo la parte que modificamos la última vez.
    $search = "// INICIAR RASTREO GPS AUTOMÁTICAMENTE[\s\S]*?\}\s*else \{[\s\S]*?console.error\(""❌ GeolocationTracker no está cargado""\);[\s\S]*?\}"
    
    # Primero eliminamos el bloque antiguo que estaba AL FINAL
    $contentIndex = $contentIndex -replace $search, ""
    
    # Ahora insertamos el nuevo bloque ANTES de showScreen
    $searchShowScreen = "showScreen\('menuScreen'\);"
    
    # Verificamos si ya existe la lógica nueva para no duplicar
    if ($contentIndex -notmatch "SOLICITAR GPS ANTES DE MOSTRAR MENU") {
        # Reemplazamos la llamada simple a showScreen por toda la lógica nueva
        # Nota: $newLogic ya incluye showScreen('menuScreen') al final
        $contentIndex = $contentIndex -replace $searchShowScreen, $newLogic
    }
    
    Set-Content $fileIndex -Value $contentIndex -NoNewline
    Write-Host "index.html actualizado" -ForegroundColor Green
}

# 2. Limpiar mapa-ubicaciones.html
$fileMap = "mapa-ubicaciones.html"
if (Test-Path $fileMap) {
    $contentMap = Get-Content $fileMap -Raw
    
    # Reemplazo simple de string
    $contentMap = $contentMap.Replace("async function cargarUbicaciones()", "async function cargarUbicaciones_OLD()")
    
    Set-Content $fileMap -Value $contentMap -NoNewline
    Write-Host "mapa-ubicaciones.html actualizado" -ForegroundColor Green
}
