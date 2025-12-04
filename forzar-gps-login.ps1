# Script para forzar GPS al login en index.html

$file = "index.html"
$content = Get-Content $file -Raw

# Reemplazar la llamada simple por la lógica completa de rastreo
$search = '// Solicitar permisos de geolocalización automáticamente\s*requestGeolocationPermission\(\);'
$replace = '// INICIAR RASTREO GPS AUTOMÁTICAMENTE
                if (window.GeolocationTracker) {
                    console.log("📍 Iniciando rastreo GPS al iniciar sesión...");
                    // Pequeño delay para asegurar que la UI cargó
                    setTimeout(() => {
                        window.GeolocationTracker.startTracking(
                            currentUser.id, 
                            "Inicio de Sesión", 
                            null // Sin contrato específico al login
                        ).then(() => {
                            console.log("✅ Rastreo iniciado correctamente");
                        }).catch(err => {
                            console.error("❌ Error iniciando rastreo:", err);
                            alert("⚠️ Es necesario activar el GPS para registrar su asistencia y ubicación.");
                        });
                    }, 500);
                } else {
                    console.error("❌ GeolocationTracker no está cargado");
                }'

$content = $content -replace $search, $replace

Set-Content $file -Value $content -NoNewline
Write-Host "✅ index.html actualizado para forzar GPS al login" -ForegroundColor Green
