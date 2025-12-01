/**
 * MÓDULO DE RASTREO DE GEOLOCALIZACIÓN
 * Sistema de captura de ubicación GPS y tiempo de permanencia
 * Compatible con PC y dispositivos móviles
 */

class GeolocationTracker {
    constructor() {
        this.currentSessionId = null;
        this.watchId = null;
        this.lastPosition = null;
        this.isTracking = false;
        this.deviceType = this.detectDeviceType();
        this.updateInterval = 60000; // Actualizar cada 60 segundos
        this.lastUpdateTime = null;
    }

    /**
     * Detectar si es PC o dispositivo móvil
     */
    detectDeviceType() {
        const userAgent = navigator.userAgent.toLowerCase();
        const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

        // También verificar por características táctiles
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        return isMobile || hasTouch ? 'mobile' : 'desktop';
    }

    /**
     * Verificar si el navegador soporta geolocalización
     */
    isGeolocationSupported() {
        return 'geolocation' in navigator;
    }

    /**
     * Solicitar permisos de geolocalización
     */
    async requestPermission() {
        if (!this.isGeolocationSupported()) {
            throw new Error('Geolocalización no soportada en este navegador');
        }

        try {
            // Intentar obtener la ubicación para verificar permisos
            const position = await this.getCurrentPosition();
            return {
                granted: true,
                position: position
            };
        } catch (error) {
            console.error('Error al solicitar permisos de geolocalización:', error);
            return {
                granted: false,
                error: error.message
            };
        }
    }

    /**
     * Obtener posición actual
     */
    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            const options = {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            };

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const locationData = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: new Date(position.timestamp),
                        altitude: position.coords.altitude,
                        heading: position.coords.heading,
                        speed: position.coords.speed
                    };
                    resolve(locationData);
                },
                (error) => {
                    reject(this.handleGeolocationError(error));
                },
                options
            );
        });
    }

    /**
     * Manejar errores de geolocalización
     */
    handleGeolocationError(error) {
        let message = '';
        switch (error.code) {
            case error.PERMISSION_DENIED:
                message = 'Permiso de ubicación denegado. Por favor, habilite la ubicación en la configuración.';
                break;
            case error.POSITION_UNAVAILABLE:
                message = 'Información de ubicación no disponible.';
                break;
            case error.TIMEOUT:
                message = 'Tiempo de espera agotado al obtener la ubicación.';
                break;
            default:
                message = 'Error desconocido al obtener la ubicación.';
        }
        return new Error(message);
    }

    /**
     * Iniciar rastreo de ubicación
     */
    async startTracking(userId, activity = null, cuentaContrato = null) {
        if (this.isTracking) {
            console.warn('El rastreo ya está activo');
            return;
        }

        try {
            // Verificar permisos
            const permission = await this.requestPermission();
            if (!permission.granted) {
                throw new Error('Permisos de geolocalización no concedidos');
            }

            // Obtener ubicación inicial
            const position = await this.getCurrentPosition();
            this.lastPosition = position;

            // Registrar entrada en la base de datos
            const sessionId = await this.registerLocationEntry(
                userId,
                position,
                activity,
                cuentaContrato
            );

            this.currentSessionId = sessionId;
            this.isTracking = true;
            this.lastUpdateTime = Date.now();

            // Iniciar monitoreo continuo
            this.startWatching(userId, activity, cuentaContrato);

            console.log('✅ Rastreo de ubicación iniciado', {
                sessionId: sessionId,
                deviceType: this.deviceType,
                position: position
            });

            return {
                success: true,
                sessionId: sessionId,
                position: position
            };

        } catch (error) {
            console.error('Error al iniciar rastreo:', error);
            throw error;
        }
    }

    /**
     * Monitorear cambios de ubicación
     */
    startWatching(userId, activity, cuentaContrato) {
        const options = {
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 0
        };

        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                const locationData = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: new Date(position.timestamp)
                };

                // Verificar si ha pasado suficiente tiempo desde la última actualización
                const now = Date.now();
                if (now - this.lastUpdateTime >= this.updateInterval) {
                    this.updateLocationIfChanged(userId, locationData, activity, cuentaContrato);
                    this.lastUpdateTime = now;
                }

                this.lastPosition = locationData;
            },
            (error) => {
                console.error('Error en watchPosition:', error);
            },
            options
        );
    }

    /**
     * Actualizar ubicación si ha cambiado significativamente
     */
    async updateLocationIfChanged(userId, newPosition, activity, cuentaContrato) {
        if (!this.lastPosition) {
            return;
        }

        // Calcular distancia entre posiciones (en metros)
        const distance = this.calculateDistance(
            this.lastPosition.latitude,
            this.lastPosition.longitude,
            newPosition.latitude,
            newPosition.longitude
        );

        // Si se movió más de 50 metros, registrar nueva ubicación
        if (distance > 50) {
            console.log(`📍 Cambio de ubicación detectado: ${distance.toFixed(2)} metros`);

            // Cerrar sesión anterior
            if (this.currentSessionId) {
                await this.registerLocationExit(this.currentSessionId);
            }

            // Registrar nueva entrada
            const newSessionId = await this.registerLocationEntry(
                userId,
                newPosition,
                activity,
                cuentaContrato
            );

            this.currentSessionId = newSessionId;
        }
    }

    /**
     * Calcular distancia entre dos puntos GPS (fórmula de Haversine)
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
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
     * Detener rastreo de ubicación
     */
    async stopTracking() {
        if (!this.isTracking) {
            return;
        }

        // Detener watchPosition
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }

        // Registrar salida en la base de datos
        if (this.currentSessionId) {
            await this.registerLocationExit(this.currentSessionId);
        }

        this.isTracking = false;
        this.currentSessionId = null;

        console.log('⏹️ Rastreo de ubicación detenido');
    }

    /**
     * Registrar entrada de ubicación en la base de datos
     */
    async registerLocationEntry(userId, position, activity, cuentaContrato) {
        try {
            const deviceFingerprint = await window.DeviceFingerprint?.getFingerprint() || 'unknown';

            const response = await fetch(`${API_URL}/api/ubicaciones/entrada`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    usuario_id: userId,
                    device_fingerprint: deviceFingerprint,
                    device_type: this.deviceType,
                    latitud: position.latitude,
                    longitud: position.longitude,
                    precision_metros: position.accuracy,
                    actividad_realizada: activity,
                    cuenta_contrato: cuentaContrato,
                    ip_address: await this.getIPAddress(),
                    user_agent: navigator.userAgent
                })
            });

            if (!response.ok) {
                throw new Error('Error al registrar entrada de ubicación');
            }

            const data = await response.json();
            return data.session_id;

        } catch (error) {
            console.error('Error al registrar entrada:', error);
            throw error;
        }
    }

    /**
     * Registrar salida de ubicación en la base de datos
     */
    async registerLocationExit(sessionId) {
        try {
            const response = await fetch(`${API_URL}/api/ubicaciones/salida`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    session_id: sessionId
                })
            });

            if (!response.ok) {
                throw new Error('Error al registrar salida de ubicación');
            }

            return await response.json();

        } catch (error) {
            console.error('Error al registrar salida:', error);
            throw error;
        }
    }

    /**
     * Obtener dirección IP del usuario
     */
    async getIPAddress() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'unknown';
        }
    }

    /**
     * Obtener historial de ubicaciones
     */
    async getLocationHistory(userId, fechaInicio = null, fechaFin = null) {
        try {
            const params = new URLSearchParams({
                usuario_id: userId
            });

            if (fechaInicio) params.append('fecha_inicio', fechaInicio);
            if (fechaFin) params.append('fecha_fin', fechaFin);

            const response = await fetch(`${API_URL}/api/ubicaciones/historial?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al obtener historial de ubicaciones');
            }

            return await response.json();

        } catch (error) {
            console.error('Error al obtener historial:', error);
            throw error;
        }
    }

    /**
     * Formatear dirección desde coordenadas (geocodificación inversa)
     */
    async getAddressFromCoordinates(latitude, longitude) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            return data.display_name || 'Dirección no disponible';
        } catch (error) {
            console.error('Error al obtener dirección:', error);
            return 'Dirección no disponible';
        }
    }
}

// Exportar instancia global
window.GeolocationTracker = new GeolocationTracker();
