/**
 * MAPA DE UBICACIONES GPS - VERSIÓN INLINE
 * Última actualización: 2025-12-02
 */

// Configuración de API
const MAP_API_URL = window.location.origin;

console.log('🗺️ Iniciando Mapa de Ubicaciones (Inline)');
console.log('📡 API URL:', MAP_API_URL);

// Variables globales
let map = null;
let markers = [];
let ubicacionesData = [];
let polyline = null;

/**
 * Inicializar mapa de Leaflet
 */
function initMap() {
    try {
        console.log('Creando mapa de Leaflet...');

        // Verificar que el contenedor existe
        const mapContainer = document.getElementById('map');
        if (!mapContainer) {
            console.error('❌ Contenedor #map no encontrado');
            return false;
        }

        // Crear mapa centrado en Lima, Perú
        map = L.map('map').setView([-12.0464, -77.0428], 12);

        // Agregar capa de tiles de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);

        // Forzar actualización del tamaño del mapa
        setTimeout(() => {
            if (map) {
                map.invalidateSize();
                console.log('✅ Mapa inicializado correctamente');
            }
        }, 100);

        return true;
    } catch (error) {
        console.error('❌ Error al inicializar mapa:', error);
        mostrarMensaje('Error al inicializar el mapa: ' + error.message, 'error');
        return false;
    }
}

/**
 * Cargar usuarios para el filtro
 */
async function cargarUsuarios() {
    try {
        const response = await fetch(`${MAP_API_URL}/api/usuarios`);
        if (!response.ok) throw new Error('Error al cargar usuarios');

        const usuarios = await response.json();
        const select = document.getElementById('filterUsuario');

        if (select) {
            usuarios.forEach(usuario => {
                const option = document.createElement('option');
                option.value = usuario.id;
                option.textContent = `${usuario.nombre} (${usuario.username})`;
                select.appendChild(option);
            });
        }

        console.log(`✅ ${usuarios.length} usuarios cargados`);
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
    }
}

/**
 * Cargar ubicaciones desde la API
 */
async function cargarUbicaciones(esCargaInicial = false) {
    showLoading(true);

    try {
        let url;

        if (esCargaInicial) {
            // Carga inicial: usar endpoint dedicado sin filtros
            url = `${MAP_API_URL}/api/ubicaciones/inicial`;
            console.log('🚀 Carga inicial sin filtros');
        } else {
            // Búsqueda con filtros
            const params = new URLSearchParams();
            const usuarioId = document.getElementById('filterUsuario')?.value || '';
            const fechaInicio = document.getElementById('filterFechaInicio')?.value || '';
            const fechaFin = document.getElementById('filterFechaFin')?.value || '';
            const deviceType = document.getElementById('filterDeviceType')?.value || '';

            if (usuarioId) params.append('usuario_id', usuarioId);
            if (fechaInicio) params.append('fecha_inicio', fechaInicio);
            if (fechaFin) params.append('fecha_fin', fechaFin);
            if (deviceType) params.append('device_type', deviceType);

            const queryString = params.toString();
            url = `${MAP_API_URL}/api/ubicaciones${queryString ? '?' + queryString : ''}`;
        }

        console.log(`📡 Consultando: ${url}`);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        ubicacionesData = await response.json();

        if (!Array.isArray(ubicacionesData)) {
            console.warn('Respuesta no es un array');
            ubicacionesData = [];
        }

        console.log(`✅ ${ubicacionesData.length} ubicaciones recibidas`);

        // Actualizar interfaz
        actualizarMapa(ubicacionesData);
        actualizarEstadisticas(ubicacionesData);
        mostrarListaUbicaciones(ubicacionesData);

        if (ubicacionesData.length === 0) {
            mostrarMensaje('⚠️ No se encontraron ubicaciones', 'warning');
        } else {
            mostrarMensaje(`✅ ${ubicacionesData.length} ubicaciones cargadas`, 'success');
        }

    } catch (error) {
        console.error('❌ Error al cargar ubicaciones:', error);
        mostrarMensaje('Error al cargar ubicaciones: ' + error.message, 'error');
        ubicacionesData = [];
        actualizarMapa([]);
        actualizarEstadisticas([]);
        mostrarListaUbicaciones([]);
    } finally {
        showLoading(false);
    }
}

/**
 * Actualizar marcadores en el mapa
 */
function actualizarMapa(ubicaciones) {
    if (!map) {
        console.error('❌ Mapa no inicializado');
        return;
    }

    // Limpiar marcadores existentes
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    // Limpiar polilínea
    if (polyline) {
        map.removeLayer(polyline);
        polyline = null;
    }

    if (ubicaciones.length === 0) {
        console.log('⚠️ No hay ubicaciones para mostrar');
        return;
    }

    console.log(`📍 Agregando ${ubicaciones.length} marcadores al mapa`);

    const bounds = [];
    const routePoints = [];

    // Crear marcadores
    ubicaciones.forEach((ubicacion, index) => {
        const lat = parseFloat(ubicacion.latitud);
        const lon = parseFloat(ubicacion.longitud);

        if (isNaN(lat) || isNaN(lon)) {
            console.warn(`Coordenadas inválidas en ubicación ${index}`);
            return;
        }

        bounds.push([lat, lon]);
        routePoints.push([lat, lon]);

        // Color según duración
        const color = getMarkerColor(ubicacion.duracion_minutos);

        // Crear icono personalizado
        const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="
                        background: ${color};
                        width: 30px;
                        height: 30px;
                        border-radius: 50%;
                        border: 3px solid white;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: bold;
                        font-size: 12px;
                    ">${index + 1}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        // Crear marcador
        const marker = L.marker([lat, lon], { icon: icon }).addTo(map);

        // Crear popup
        const popupContent = crearPopupContent(ubicacion, index + 1);
        marker.bindPopup(popupContent);

        markers.push(marker);
    });

    // Dibujar ruta si hay múltiples puntos
    if (routePoints.length > 1) {
        polyline = L.polyline(routePoints, {
            color: '#00d9ff',
            weight: 3,
            opacity: 0.6,
            dashArray: '10, 5'
        }).addTo(map);
    }

    // Ajustar vista del mapa
    if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
    }

    console.log(`✅ ${markers.length} marcadores agregados`);
}

/**
 * Obtener color del marcador según duración
 */
function getMarkerColor(duracionMinutos) {
    if (!duracionMinutos) return '#718096'; // Gris - en curso
    if (duracionMinutos < 5) return '#48bb78'; // Verde - muy corta
    if (duracionMinutos < 15) return '#4299e1'; // Azul - corta
    if (duracionMinutos < 30) return '#ed8936'; // Naranja - media
    if (duracionMinutos < 60) return '#f56565'; // Rojo - larga
    return '#9f7aea'; // Púrpura - muy larga
}

/**
 * Crear contenido del popup
 */
function crearPopupContent(ubicacion, numero) {
    const fechaEntrada = new Date(ubicacion.timestamp_entrada);
    const fechaSalida = ubicacion.timestamp_salida ? new Date(ubicacion.timestamp_salida) : null;

    const duracion = ubicacion.duracion_minutos
        ? formatearDuracion(ubicacion.duracion_minutos)
        : 'En curso';

    return `
                <div class="popup-title">📍 Ubicación #${numero}</div>
                <div class="popup-info">
                    <strong>Usuario:</strong> ${ubicacion.nombre || ubicacion.username || 'N/A'}<br>
                    <strong>Dispositivo:</strong> ${ubicacion.device_type === 'mobile' ? '📱 Móvil' : '💻 PC'}<br>
                    <strong>Entrada:</strong> ${fechaEntrada.toLocaleString('es-PE')}<br>
                    ${fechaSalida ? `<strong>Salida:</strong> ${fechaSalida.toLocaleString('es-PE')}<br>` : ''}
                    <strong>Actividad:</strong> ${ubicacion.actividad_realizada || 'N/A'}<br>
                    ${ubicacion.cuenta_contrato ? `<strong>Cuenta:</strong> ${ubicacion.cuenta_contrato}<br>` : ''}
                    <strong>Precisión:</strong> ${Math.round(ubicacion.precision_metros)} metros<br>
                    <strong>Coordenadas:</strong> ${ubicacion.latitud.toFixed(6)}, ${ubicacion.longitud.toFixed(6)}
                </div>
                <div class="popup-duration">⏱️ ${duracion}</div>
            `;
}

/**
 * Actualizar estadísticas
 */
function actualizarEstadisticas(ubicaciones) {
    const totalUbicaciones = ubicaciones.length;

    // Calcular tiempo promedio
    const duraciones = ubicaciones
        .filter(u => u.duracion_minutos)
        .map(u => u.duracion_minutos);

    const tiempoPromedio = duraciones.length > 0
        ? Math.round(duraciones.reduce((a, b) => a + b, 0) / duraciones.length)
        : 0;

    // Contar dispositivos únicos
    const dispositivosUnicos = new Set(ubicaciones.map(u => u.device_fingerprint)).size;

    // Calcular distancia total
    let distanciaTotal = 0;
    for (let i = 1; i < ubicaciones.length; i++) {
        const prev = ubicaciones[i - 1];
        const curr = ubicaciones[i];

        if (prev.latitud && prev.longitud && curr.latitud && curr.longitud) {
            distanciaTotal += calcularDistancia(
                prev.latitud, prev.longitud,
                curr.latitud, curr.longitud
            );
        }
    }

    // Actualizar UI
    const elTotal = document.getElementById('statTotalUbicaciones');
    const elTiempo = document.getElementById('statTiempoPromedio');
    const elDispositivos = document.getElementById('statDispositivos');
    const elDistancia = document.getElementById('statDistanciaTotal');

    if (elTotal) elTotal.textContent = totalUbicaciones;
    if (elTiempo) elTiempo.textContent = `${tiempoPromedio} min`;
    if (elDispositivos) elDispositivos.textContent = dispositivosUnicos;
    if (elDistancia) elDistancia.textContent = `${(distanciaTotal / 1000).toFixed(2)} km`;
}

/**
 * Mostrar lista de ubicaciones
 */
function mostrarListaUbicaciones(ubicaciones) {
    const container = document.getElementById('locationsList');
    if (!container) return;

    if (ubicaciones.length === 0) {
        container.innerHTML = '<p style="color: #718096;">No hay ubicaciones para mostrar</p>';
        return;
    }

    container.innerHTML = ubicaciones.map((ubicacion, index) => {
        const fechaEntrada = new Date(ubicacion.timestamp_entrada);
        const duracion = ubicacion.duracion_minutos
            ? formatearDuracion(ubicacion.duracion_minutos)
            : 'En curso';

        return `
                    <div class="location-item" onclick="centrarMapa(${ubicacion.latitud}, ${ubicacion.longitud}, ${index})" data-id="${ubicacion.id}">
                        <div class="location-header">
                            <span class="location-time">
                                ${ubicacion.device_type === 'mobile' ? '📱' : '💻'}
                                ${fechaEntrada.toLocaleString('es-PE')}
                            </span>
                            <span class="location-duration">⏱️ ${duracion}</span>
                        </div>
                        <div class="location-details">
                            <strong>${ubicacion.nombre || ubicacion.username || 'Usuario desconocido'}</strong><br>
                            ${ubicacion.actividad_realizada ? `Actividad: ${ubicacion.actividad_realizada}<br>` : ''}
                            ${ubicacion.cuenta_contrato ? `Cuenta: ${ubicacion.cuenta_contrato}<br>` : ''}
                            <span class="location-coords">
                                📍 ${ubicacion.latitud.toFixed(6)}, ${ubicacion.longitud.toFixed(6)}
                            </span>
                        </div>
                    </div>
                `;
    }).join('');
}

/**
 * Centrar mapa en una ubicación
 */
function centrarMapa(lat, lon, markerIndex) {
    if (!map) return;

    map.setView([lat, lon], 16);

    if (markers[markerIndex]) {
        markers[markerIndex].openPopup();
    }
}

/**
 * Calcular distancia entre dos puntos (Haversine)
 */
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distancia en metros
}

/**
 * Formatear duración
 */
function formatearDuracion(minutos) {
    if (minutos < 60) {
        return `${Math.round(minutos)} min`;
    } else {
        const horas = Math.floor(minutos / 60);
        const mins = Math.round(minutos % 60);
        return `${horas}h ${mins}min`;
    }
}

/**
 * Limpiar filtros
 */
function limpiarFiltros() {
    const u = document.getElementById('filterUsuario');
    const fi = document.getElementById('filterFechaInicio');
    const ff = document.getElementById('filterFechaFin');
    const dt = document.getElementById('filterDeviceType');

    if (u) u.value = '';
    if (fi) fi.value = '';
    if (ff) ff.value = '';
    if (dt) dt.value = '';

    cargarUbicaciones(true);
}

/**
 * Mostrar/ocultar loading
 */
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        if (show) {
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    }
}

/**
 * Mostrar mensaje temporal
 */
function mostrarMensaje(mensaje, tipo = 'info') {
    let messageEl = document.getElementById('tempMessage');
    if (!messageEl) {
        messageEl = document.createElement('div');
        messageEl.id = 'tempMessage';
        messageEl.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 8px;
                    color: white;
                    font-weight: 500;
                    z-index: 10000;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                    max-width: 400px;
                `;
        document.body.appendChild(messageEl);
    }

    const colores = {
        info: '#4299e1',
        error: '#f56565',
        success: '#48bb78',
        warning: '#ed8936'
    };

    messageEl.style.background = colores[tipo] || colores.info;
    messageEl.textContent = mensaje;
    messageEl.style.display = 'block';

    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 5000);
}

/**
 * Verificar autenticación
 */
function verificarAutenticacion() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        alert('Debe iniciar sesión para acceder a esta página');
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

/**
 * Inicialización del documento
 */
document.addEventListener('DOMContentLoaded', function () {
    console.log('📄 DOM cargado - Script Inline');

    // Verificar autenticación
    if (!verificarAutenticacion()) {
        return;
    }

    console.log('✅ Usuario autenticado');

    // Verificar que Leaflet esté disponible
    if (typeof L === 'undefined') {
        console.error('❌ Leaflet no está cargado');
        mostrarMensaje('Error: Librería de mapas no disponible', 'error');
        return;
    }

    console.log('✅ Leaflet disponible');

    // Inicializar mapa
    const mapaOk = initMap();
    if (!mapaOk) {
        console.error('❌ Fallo al inicializar mapa');
        return;
    }

    // Cargar usuarios
    cargarUsuarios();

    // Limpiar campos de fecha
    const fi = document.getElementById('filterFechaInicio');
    const ff = document.getElementById('filterFechaFin');
    if (fi) fi.value = '';
    if (ff) ff.value = '';

    // Cargar ubicaciones iniciales después de un breve delay
    setTimeout(() => {
        console.log('🚀 Cargando ubicaciones iniciales...');
        cargarUbicaciones(true);
    }, 1000);
});
