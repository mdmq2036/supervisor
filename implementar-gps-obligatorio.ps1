# Script para implementar GPS obligatorio y mostrar usuarios conectados

# 1. Modificar index.html para solicitar GPS al login
$fileIndex = "index.html"
$content = Get-Content $fileIndex -Raw

# Buscar la sección después del login exitoso y antes de showScreen
$searchPattern = 'currentUser = userData;\s*localStorage\.setItem\(''currentUser'', JSON\.stringify\(currentUser\)\);'

$replacement = 'currentUser = userData;
                localStorage.setItem(''currentUser'', JSON.stringify(currentUser));
                
                // SOLICITAR GPS OBLIGATORIO
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

$content = $content -replace $searchPattern, $replacement

Set-Content $fileIndex -Value $content -NoNewline
Write-Host "✅ GPS obligatorio agregado a index.html" -ForegroundColor Green

# 2. Modificar mapa-utils.js para mostrar solo usuarios conectados hoy
$fileUtils = "mapa-utils.js"
$contentUtils = Get-Content $fileUtils -Raw

# Modificar la función cargarUbicaciones para filtrar por hoy por defecto
$searchLoadPattern = 'if \(initialLoad\) \{[\s\S]*?if \(fechaFin\) fechaFin\.value = '''';\s*\}'

$replaceLoad = 'if (initialLoad) {
            // Por defecto, mostrar solo ubicaciones de HOY (usuarios conectados)
            const hoy = new Date().toISOString().split(''T'')[0];
            const fechaInicio = document.getElementById(''filterFechaInicio'');
            const fechaFin = document.getElementById(''filterFechaFin'');
            if (fechaInicio) fechaInicio.value = hoy;
            if (fechaFin) fechaFin.value = hoy;
        }'

$contentUtils = $contentUtils -replace $searchLoadPattern, $replaceLoad

Set-Content $fileUtils -Value $contentUtils -NoNewline
Write-Host "✅ Filtro de fecha por defecto (hoy) agregado a mapa-utils.js" -ForegroundColor Green
