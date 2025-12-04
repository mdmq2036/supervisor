# Script para hacer el GPS no bloqueante

$file = "index.html"
$content = Get-Content $file -Raw

# Cambiar el bloque de GPS para que NO use await y sea completamente no bloqueante
$searchGPS = '// 1\. SOLICITAR GPS ANTES DE MOSTRAR MENU[\s\S]*?if \(window\.GeolocationTracker\) \{[\s\S]*?await window\.GeolocationTracker\.startTracking[\s\S]*?\}[\s\S]*?\}'

$replaceGPS = '// 1. SOLICITAR GPS (NO BLOQUEANTE)
                if (window.GeolocationTracker) {
                    // Iniciar en segundo plano sin bloquear el login
                    window.GeolocationTracker.startTracking(currentUser.id, ''Inicio de Sesion'', null)
                        .then(() => console.log(''GPS activado correctamente''))
                        .catch(err => console.warn(''GPS no activado:'', err));
                }'

$content = $content -replace $searchGPS, $replaceGPS

Set-Content $file -Value $content -NoNewline
Write-Host "✅ GPS configurado como no bloqueante" -ForegroundColor Green
