# Script para agregar funciones de formato a mapa-utils.js

$file = "mapa-utils.js"
$content = Get-Content $file -Raw

# Definir las funciones faltantes
$funcionesFormato = '
/**
 * Formatear fecha para Perú (UTC-5)
 */
function formatearFechaPerú(fecha) {
    if (!fecha) return "N/A";
    const date = new Date(fecha);
    return date.toLocaleString("es-PE", {
        timeZone: "America/Lima",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
}

/**
 * Formatear duración en minutos a formato legible
 */
function formatearDuracion(minutos) {
    if (!minutos) return "0 min";
    if (minutos < 60) return `${Math.round(minutos)} min`;
    const horas = Math.floor(minutos / 60);
    const mins = Math.round(minutos % 60);
    return `${horas}h ${mins}m`;
}

/**
 * Calcular distancia entre dos puntos (Haversine)
 */
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distancia en km
}
'

# Agregar al final del archivo
$content = $content + "`n" + $funcionesFormato

Set-Content $file -Value $content -NoNewline
Write-Host "✅ Funciones de formato agregadas a mapa-utils.js" -ForegroundColor Green
