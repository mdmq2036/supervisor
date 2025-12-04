# Script para aplicar correcciones finales: GPS y Filtro Mapa

# 1. Corregir mapa-utils.js (Eliminar filtro de fecha por defecto)
$fileUtils = "mapa-utils.js"
if (Test-Path $fileUtils) {
    $contentUtils = Get-Content $fileUtils -Raw
    
    # Buscar y comentar/eliminar el bloque que fuerza la fecha de hoy
    $searchPattern = 'else if \(initialLoad\) \{[\s\S]*?const hoy = new Date\(\)\.toISOString\(\)\.split\(''T''\)\[0\];[\s\S]*?\}'
    $replacement = '// ELIMINADO: No forzar fecha de hoy para mostrar todo el historial por defecto'
    
    $contentUtils = $contentUtils -replace $searchPattern, $replacement
    Set-Content $fileUtils -Value $contentUtils -NoNewline
    Write-Host "✅ mapa-utils.js corregido (filtro de fecha eliminado)" -ForegroundColor Green
}

# 2. Mejorar geolocation-tracker.js (Solicitar permisos agresivamente)
$fileGeo = "geolocation-tracker.js"
if (Test-Path $fileGeo) {
    $contentGeo = Get-Content $fileGeo -Raw
    
    # Agregar método solicitarPermisosGPS antes de startTracking
    $newMethod = '
    /**
     * Solicitar permisos de GPS explícitamente con UI
     */
    async solicitarPermisosGPS() {
        if (!this.isGeolocationSupported()) {
            alert("Tu dispositivo no soporta geolocalización. Algunas funciones no estarán disponibles.");
            return false;
        }

        try {
            const result = await navigator.permissions.query({ name: "geolocation" });
            
            if (result.state === "denied") {
                alert("⚠️ ACCESO A UBICACIÓN DENEGADO\n\nPara usar esta aplicación, debes permitir el acceso a tu ubicación en la configuración de tu navegador.\n\nPor favor, habilita el GPS y recarga la página.");
                return false;
            }
            
            // Intentar obtener una posición para forzar el prompt del navegador
            await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
            });
            
            return true;
        } catch (error) {
            console.warn("Error verificando permisos:", error);
            // Si falla la verificación de permisos API, intentamos obtener posición directamente
            try {
                await this.getCurrentPosition();
                return true;
            } catch (e) {
                alert("⚠️ Por favor, activa el GPS de tu dispositivo para continuar.");
                return false;
            }
        }
    }

    '
    
    # Insertar el método en la clase
    $contentGeo = $contentGeo -replace 'async startTracking\(userId, activity = null, cuentaContrato = null\) \{', "$newMethod`n    async startTracking(userId, activity = null, cuentaContrato = null) {"
    
    # Agregar llamada a solicitarPermisosGPS dentro de startTracking
    $contentGeo = $contentGeo -replace '// Verificar permisos', '// Verificar permisos explícitamente`n            await this.solicitarPermisosGPS();'
    
    Set-Content $fileGeo -Value $contentGeo -NoNewline
    Write-Host "✅ geolocation-tracker.js mejorado (solicitud de permisos)" -ForegroundColor Green
}

# 3. Actualizar mapa-ubicaciones.html (Asegurar eventos onchange)
$fileHtml = "mapa-ubicaciones.html"
if (Test-Path $fileHtml) {
    $contentHtml = Get-Content $fileHtml -Raw
    
    # Asegurar que filterUsuario tenga onchange
    $contentHtml = $contentHtml -replace '<select id="filterUsuario">', '<select id="filterUsuario" onchange="cargarUbicaciones()">'
    
    # Asegurar que filterContrato tenga onchange
    $contentHtml = $contentHtml -replace '<select id="filterContrato">', '<select id="filterContrato" onchange="cargarUbicaciones()">'
    
    # Asegurar que filterFechaInicio tenga onchange
    $contentHtml = $contentHtml -replace '<input type="date" id="filterFechaInicio">', '<input type="date" id="filterFechaInicio" onchange="cargarUbicaciones()">'
    
    # Asegurar que filterFechaFin tenga onchange
    $contentHtml = $contentHtml -replace '<input type="date" id="filterFechaFin">', '<input type="date" id="filterFechaFin" onchange="cargarUbicaciones()">'
    
    Set-Content $fileHtml -Value $contentHtml -NoNewline
    Write-Host "✅ mapa-ubicaciones.html actualizado (eventos onchange)" -ForegroundColor Green
}
