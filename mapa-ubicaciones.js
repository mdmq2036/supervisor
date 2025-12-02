/**
 * MAPA DE UBICACIONES GPS - VERSIÓN CORREGIDA
 * SIN FILTROS DE FECHA POR DEFECTO - MUESTRA TODAS LAS UBICACIONES
 * Última actualización: 2025-12-02 - Fix definitivo filtros de fecha
 */

// Configuración de API - Detectar automáticamente la URL base
const API_URL = window.location.origin;

console.log('🔥 VERSIÓN CORREGIDA - SIN FILTROS DE FECHA POR DEFECTO');

let map;
let markers = [];
let ubicacionesData = [];
let polyline = null;

/**
 * Inicializar mapa
 */
function initMap() {
    // Crear mapa centrado en Lima, Perú
    map = L.map('map').setView([-12.0464, -77.0428], 12);

    // Agregar capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    console.log('✅ Mapa inicializado');
}

/**
 * Cargar usuarios para el filtro
 */
async function cargarUsuarios() {
    try {
        const response = await fetch(`${API_URL}/api/usuarios`);

        if (!response.ok) throw new Error('Error al cargar usuarios');

        const usuarios = await response.json();
        const select = document.getElementById('filterUsuario');

        usuarios.forEach(usuario => {
            const option = document.createElement('option');
            option.value = usuario.id;
            option.textContent = `${usuario.nombre} (${usuario.username})`;
            select.appendChild(option);
        });

    } catch (error) {
        console.error('Error al cargar usuarios:', error);
    }
}

/**
 * Cargar ubicaciones desde la API
 */
async function cargarUbicaciones() {
    showLoading(true);

    try {
        const params = new URLSearchParams();

        const usuarioId = document.getElementById('filterUsuario').value;
        const fechaInicio = document.getElementById('filterFechaInicio').value;
        const fechaFin = document.getElementById('filterFechaFin').value;
        const deviceType = document.getElementById('filterDeviceType').value;

        if (usuarioId) params.append('usuario_id', usuarioId);
        if (fechaInicio) params.append('fecha_inicio', fechaInicio);
        if (fechaFin) params.append('fecha_fin', fechaFin);
        if (deviceType) params.append('device_type', deviceType);

        console.log('🔍 Filtros aplicados:', {
            usuario: usuarioId || 'Todos',
            fechaInicio: fechaInicio || 'Sin límite',
            fechaFin: fechaFin || 'Sin límite',
            dispositivo: deviceType || 'Todos'
        });

        const response = await fetch(`${API_URL}/api/ubicaciones?${params}`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
            throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
        }

        ubicacionesData = await response.json();

        // Validar que sea un array
        if (!Array.isArray(ubicacionesData)) {
            console.warn('Respuesta no es un array:', ubicacionesData);
            ubicacionesData = [];
        }

        // Actualizar mapa y estadísticas
        actualizarMapa(ubicacionesData);
        actualizarEstadisticas(ubicacionesData);
        mostrarListaUbicaciones(ubicacionesData);

        console.log(`✅ ${ubicacionesData.length} ubicaciones cargadas`);

        if (ubicacionesData.length === 0) {
            mostrarMensaje('⚠️ No se encontraron ubicaciones. Click en "Limpiar" y luego "Buscar" para ver todas.', 'warning');
        } else {
            mostrarMensaje(`✅ Se cargaron ${ubicacionesData.length} ubicaciones`, 'success');
        }

    } catch (error) {
        console.error('Error al cargar ubicaciones:', error);
        mostrarMensaje(`Error al cargar ubicaciones: ${error.message}`, 'error');

        // Limpiar UI en caso de error
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
    // Limpiar marcadores existentes
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    // Limpiar polilínea
    if (polyline) {
        map.removeLayer(polyline);
        polyline = null;
    }

    if (ubicaciones.length === 0) {
        console.warn('⚠️ No se encontraron ubicaciones con los filtros aplicados');
        // No mostrar alert intrusivo, el mensaje ya aparece en la UI
        return;
    }

    const bounds = [];
    const routePoints = [];

    // Crear marcadores para cada ubicación
    ubicaciones.forEach((ubicacion, index) => {
        const lat = parseFloat(ubicacion.latitud);
        const lon = parseFloat(ubicacion.longitud);

        if (isNaN(lat) || isNaN(lon)) return;

        bounds.push([lat, lon]);
        routePoints.push([lat, lon]);

        // Determinar color del marcador según duración
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

        // Evento click
        marker.on('click', () => {
            resaltarUbicacionEnLista(ubicacion.id);
        });

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
    document.getElementById('statTotalUbicaciones').textContent = totalUbicaciones;
    document.getElementById('statTiempoPromedio').textContent = `${tiempoPromedio} min`;
    document.getElementById('statDispositivos').textContent = dispositivosUnicos;
    document.getElementById('statDistanciaTotal').textContent = `${(distanciaTotal / 1000).toFixed(2)} km`;
}

/**
 * Mostrar lista de ubicaciones
 */
function mostrarListaUbicaciones(ubicaciones) {
    const container = document.getElementById('locationsList');

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
    map.setView([lat, lon], 16);

    if (markers[markerIndex]) {
        markers[markerIndex].openPopup();
    }
}

/**
 * Resaltar ubicación en la lista
 */
function resaltarUbicacionEnLista(ubicacionId) {
    const items = document.querySelectorAll('.location-item');
    items.forEach(item => {
        if (item.dataset.id == ubicacionId) {
            item.style.borderLeftColor = '#f6e05e';
            item.scrollIntoView({ behavior: 'smooth', block: 'center' });

            setTimeout(() => {
                item.style.borderLeftColor = '#00d9ff';
            }, 2000);
        }
    });
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
 * Formatear duración en formato legible
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
    document.getElementById('filterUsuario').value = '';
    document.getElementById('filterFechaInicio').value = '';
    document.getElementById('filterFechaFin').value = '';
    document.getElementById('filterDeviceType').value = '';
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
    // Crear elemento de mensaje si no existe
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
            animation: slideIn 0.3s ease;
            max-width: 400px;
        `;
        document.body.appendChild(messageEl);
    }

    // Establecer color según tipo
    const colores = {
        info: '#4299e1',
        error: '#f56565',
        success: '#48bb78',
        warning: '#ed8936'
    };

    messageEl.style.background = colores[tipo] || colores.info;
    messageEl.textContent = mensaje;
    messageEl.style.display = 'block';

    // Ocultar después de 5 segundos
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
 * Inicialización
 */
document.addEventListener('DOMContentLoaded', () => {
    if (!verificarAutenticacion()) return;

    initMap();
    cargarUsuarios();

    // FORZAR limpieza INMEDIATA de campos de fecha
    const fechaInicio = document.getElementById('filterFechaInicio');
    const fechaFin = document.getElementById('filterFechaFin');

    if (fechaInicio) {
        fechaInicio.value = '';
        fechaInicio.removeAttribute('value');
    }

    if (fechaFin) {
        fechaFin.value = '';
        fechaFin.removeAttribute('value');
    }

    console.log('✅ Campos de fecha limpiados');
    console.log('📅 Mostrando TODAS las ubicaciones (sin filtros de fecha)');

    // Mostrar mensaje informativo
    setTimeout(() => {
        mostrarMensaje('💡 Tip: Los filtros de fecha están vacíos para mostrar TODAS las ubicaciones', 'info');
    }, 1000);

    // Cargar ubicaciones iniciales SIN FILTROS
    setTimeout(() => {
        cargarUbicaciones();
    }, 500);
});
