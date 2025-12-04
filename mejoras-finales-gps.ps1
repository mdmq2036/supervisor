# Script para mejorar GPS, Mapa y Leyenda

# 1. MEJORAR LOGIN EN index.html
$fileIndex = "index.html"
$contentIndex = Get-Content $fileIndex -Raw

# Reemplazar requestGeolocationPermission() con lógica completa
$searchLogin = 'requestGeolocationPermission\(\);'
$replaceLogin = '// SOLICITAR GPS OBLIGATORIO Y REGISTRAR
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        async function(position) {
                            console.log(''GPS obtenido:'', position.coords);
                            // Registrar ubicación en la base de datos
                            try {
                                await supabase.from(''ubicaciones_gps'').insert({
                                    usuario_id: currentUser.id,
                                    device_fingerprint: await window.DeviceFingerprint?.getFingerprint() || ''unknown'',
                                    device_type: /mobile/i.test(navigator.userAgent) ? ''mobile'' : ''desktop'',
                                    latitud: position.coords.latitude,
                                    longitud: position.coords.longitude,
                                    precision_metros: position.coords.accuracy,
                                    timestamp_entrada: new Date().toISOString(),
                                    actividad_realizada: ''Inicio de Sesion'',
                                    ip_address: ''unknown'',
                                    user_agent: navigator.userAgent
                                });
                                console.log(''Ubicacion registrada correctamente'');
                            } catch (error) {
                                console.error(''Error registrando ubicacion:'', error);
                            }
                        },
                        function(error) {
                            console.warn(''Error GPS:'', error);
                            alert(''Es necesario activar el GPS para usar esta aplicacion. Por favor, permita el acceso a su ubicacion.'');
                        },
                        {
                            enableHighAccuracy: true,
                            timeout: 10000,
                            maximumAge: 0
                        }
                    );
                } else {
                    alert(''Su navegador no soporta geolocalizacion.'');
                }'

$contentIndex = $contentIndex -replace $searchLogin, $replaceLogin
Set-Content $fileIndex -Value $contentIndex -NoNewline
Write-Host "✅ index.html actualizado con GPS obligatorio" -ForegroundColor Green

# 2. AGREGAR LEYENDA EN mapa-ubicaciones.html
$fileMapHtml = "mapa-ubicaciones.html"
$contentMapHtml = Get-Content $fileMapHtml -Raw

# Buscar el cierre del div map para insertar la leyenda antes
$searchMap = '<div id="map"></div>'
$replaceMap = '<div id="map" style="position: relative;"></div>
        
        <!-- Leyenda de Colores -->
        <div class="map-legend" style="background: white; padding: 10px; border-radius: 8px; margin-top: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); display: flex; flex-wrap: wrap; gap: 15px; justify-content: center; font-size: 0.9em;">
            <div style="display: flex; align-items: center;"><span style="width: 12px; height: 12px; background: #48bb78; border-radius: 50%; display: inline-block; margin-right: 5px;"></span> < 5 min</div>
            <div style="display: flex; align-items: center;"><span style="width: 12px; height: 12px; background: #4299e1; border-radius: 50%; display: inline-block; margin-right: 5px;"></span> 5-15 min</div>
            <div style="display: flex; align-items: center;"><span style="width: 12px; height: 12px; background: #ed8936; border-radius: 50%; display: inline-block; margin-right: 5px;"></span> 15-30 min</div>
            <div style="display: flex; align-items: center;"><span style="width: 12px; height: 12px; background: #f56565; border-radius: 50%; display: inline-block; margin-right: 5px;"></span> 30-60 min</div>
            <div style="display: flex; align-items: center;"><span style="width: 12px; height: 12px; background: #9f7aea; border-radius: 50%; display: inline-block; margin-right: 5px;"></span> > 60 min</div>
            <div style="display: flex; align-items: center;"><span style="width: 12px; height: 12px; background: #718096; border-radius: 50%; display: inline-block; margin-right: 5px;"></span> En curso</div>
        </div>'

$contentMapHtml = $contentMapHtml -replace $searchMap, $replaceMap
Set-Content $fileMapHtml -Value $contentMapHtml -NoNewline
Write-Host "✅ mapa-ubicaciones.html actualizado con leyenda" -ForegroundColor Green

# 3. FILTRAR POR HOY EN mapa-utils.js
$fileUtils = "mapa-utils.js"
$contentUtils = Get-Content $fileUtils -Raw

# Modificar cargarUbicaciones para filtrar por hoy
$searchUtils = 'if \(initialLoad\) \{[\s\S]*?\}'
$replaceUtils = 'if (initialLoad) {
            // Por defecto, mostrar solo ubicaciones de HOY
            const hoy = new Date().toISOString().split(''T'')[0];
            const fechaInicio = document.getElementById(''filterFechaInicio'');
            const fechaFin = document.getElementById(''filterFechaFin'');
            if (fechaInicio) fechaInicio.value = hoy;
            if (fechaFin) fechaFin.value = hoy;
        }'

# Solo reemplazar si encontramos el patrón exacto de initialLoad
if ($contentUtils -match 'if \(initialLoad\)') {
    $contentUtils = $contentUtils -replace 'if \(initialLoad\) \{\s*//.*?\s*\}', $replaceUtils
    # Si el reemplazo anterior no funcionó porque el bloque estaba vacío o diferente, intentamos uno más genérico
    if (-not ($contentUtils -match 'const hoy')) {
         $contentUtils = $contentUtils -replace 'if \(initialLoad\) \{', $replaceUtils
    }
}

Set-Content $fileUtils -Value $contentUtils -NoNewline
Write-Host "✅ mapa-utils.js actualizado con filtro de hoy" -ForegroundColor Green
