// ========================================
// SERVIDOR NODE.JS - SISTEMA DONET
// ========================================
// Servidor Express para despliegue en Render
// Versión: 2.1 - Fix despliegue y filtros de fecha
// ========================================

require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware para servir archivos estáticos
app.use(express.static('.'));
app.use(express.json());

// Middleware para inyectar variables de entorno en el cliente
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    next();
});

// Ruta para obtener configuración pública (sin exponer claves privadas)
app.get('/api/config', (req, res) => {
    res.json({
        SUPABASE_URL: process.env.SUPABASE_URL || '',
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
        APP_NAME: process.env.APP_NAME || 'DONET',
        APP_VERSION: process.env.APP_VERSION || '1.0',
        ENVIRONMENT: process.env.ENVIRONMENT || 'production'
    });
});

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Configuración de Supabase
const { createClient } = require('@supabase/supabase-js');

// Credenciales de Supabase (con fallback para producción)
// NOTA: En producción, idealmente usar variables de entorno
// Pero incluimos fallback para facilitar el despliegue en Render
const supabaseUrl = process.env.SUPABASE_URL || 'https://bvqmaaxtaetebjsgdphj.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cW1hYXh0YWV0ZWJqc2dkcGhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNjAyMzEsImV4cCI6MjA3OTkzNjIzMX0.p2dgaWGlQcUsKJ8Y92mQzwyCs32tcKGGEAMh8d_F9ms';

let supabase;

// Inicializar cliente Supabase
try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Cliente Supabase inicializado correctamente');
    console.log(`📊 Proyecto: ${supabaseUrl.split('//')[1].split('.')[0]}...`);
    if (process.env.SUPABASE_URL) {
        console.log('🔐 Usando credenciales de variables de entorno');
    } else {
        console.log('⚙️ Usando credenciales de configuración por defecto');
    }
} catch (error) {
    console.error('❌ Error al inicializar Supabase:', error.message);
}

// Middleware para verificar conexión a BD antes de procesar peticiones API
const checkDbConnection = (req, res, next) => {
    if (!supabase) {
        console.error('❌ Intento de acceso a BD sin configuración válida');
        return res.status(500).json({
            error: 'Error de configuración del servidor',
            details: 'La conexión a la base de datos no está configurada. Revise las variables de entorno SUPABASE_URL y SUPABASE_ANON_KEY.'
        });
    }
    next();
};

// ==========================================
// API DE GEOLOCALIZACIÓN
// ==========================================

// 1. Registrar entrada de ubicación
app.post('/api/ubicaciones/entrada', checkDbConnection, async (req, res) => {
    try {
        const {
            usuario_id, device_fingerprint, device_type,
            latitud, longitud, precision_metros,
            actividad_realizada, cuenta_contrato,
            ip_address, user_agent
        } = req.body;

        // Validar datos mínimos
        if (!usuario_id || !latitud || !longitud) {
            return res.status(400).json({ error: 'Faltan datos requeridos' });
        }

        // Llamar a la función RPC de Supabase
        const { data, error } = await supabase
            .rpc('registrar_entrada_ubicacion', {
                p_usuario_id: usuario_id,
                p_device_fingerprint: device_fingerprint,
                p_device_type: device_type,
                p_latitud: latitud,
                p_longitud: longitud,
                p_precision: precision_metros,
                p_actividad: actividad_realizada,
                p_cuenta_contrato: cuenta_contrato,
                p_ip: ip_address,
                p_user_agent: user_agent
            });

        if (error) throw error;

        res.json({ success: true, session_id: data });

    } catch (error) {
        console.error('Error al registrar entrada:', error);
        res.status(500).json({ error: error.message });
    }
});

// 2. Registrar salida de ubicación
app.post('/api/ubicaciones/salida', checkDbConnection, async (req, res) => {
    try {
        const { session_id } = req.body;

        if (!session_id) {
            return res.status(400).json({ error: 'Falta session_id' });
        }

        const { data, error } = await supabase
            .rpc('registrar_salida_ubicacion', {
                p_id: session_id
            });

        if (error) throw error;

        res.json({ success: true, updated: data });

    } catch (error) {
        console.error('Error al registrar salida:', error);
        res.status(500).json({ error: error.message });
    }
});

// 3. Obtener historial de ubicaciones (con filtros)
app.get('/api/ubicaciones', checkDbConnection, async (req, res) => {
    try {
        const { usuario_id, fecha_inicio, fecha_fin, device_type } = req.query;

        // Intentar primero con v_ubicaciones_tiempo_real (nueva tabla)
        let query = supabase
            .from('v_ubicaciones_tiempo_real')
            .select('*')
            .order('timestamp_entrada', { ascending: false });

        // Aplicar filtros dinámicos
        if (usuario_id) query = query.eq('usuario_id', usuario_id);
        if (device_type) query = query.eq('device_type', device_type);

        // Validar que las fechas sean válidas y no vacías
        if (fecha_inicio && fecha_inicio.trim() !== '') {
            query = query.gte('timestamp_entrada', `${fecha_inicio}T00:00:00`);
        }
        if (fecha_fin && fecha_fin.trim() !== '') {
            query = query.lte('timestamp_entrada', `${fecha_fin}T23:59:59`);
        }

        // Limitar resultados para no saturar el mapa
        query = query.limit(500);

        let { data, error } = await query;

        // Si no hay datos en v_ubicaciones_tiempo_real, intentar con v_analisis_ubicaciones
        if (error || !data || data.length === 0) {
            console.log('⚠️ No hay datos en v_ubicaciones_tiempo_real, intentando v_analisis_ubicaciones...');
            
            query = supabase
                .from('v_analisis_ubicaciones')
                .select('*')
                .order('timestamp_entrada', { ascending: false });

            if (usuario_id) query = query.eq('usuario_id', usuario_id);
            if (device_type) query = query.eq('device_type', device_type);
            if (fecha_inicio && fecha_inicio.trim() !== '') {
                query = query.gte('timestamp_entrada', `${fecha_inicio}T00:00:00`);
            }
            if (fecha_fin && fecha_fin.trim() !== '') {
                query = query.lte('timestamp_entrada', `${fecha_fin}T23:59:59`);
            }
            query = query.limit(500);

            const result = await query;
            data = result.data;
            error = result.error;
        }

        if (error) throw error;

        console.log(`📍 GET /api/ubicaciones - Filtros: usuario=${usuario_id}, device=${device_type}, desde=${fecha_inicio}, hasta=${fecha_fin}`);
        console.log(`📊 Ubicaciones encontradas: ${data?.length || 0}`);

        res.json(data || []);

    } catch (error) {
        console.error('Error al obtener ubicaciones:', error);
        res.status(500).json({ error: error.message });
    }
});

// 3.1 VÍA RÁPIDA: Obtener ubicaciones iniciales (IGNORA TODOS LOS FILTROS)
app.get('/api/ubicaciones/inicial', checkDbConnection, async (req, res) => {
    try {
        console.log('🚀 GET /api/ubicaciones/inicial - Solicitando datos sin filtros');

        const { data, error } = await supabase
            .from('v_analisis_ubicaciones')
            .select('*')
            .order('timestamp_entrada', { ascending: false })
            .limit(100);

        if (error) throw error;

        console.log(`✅ Vía Rápida: Enviando ${data?.length || 0} ubicaciones`);
        res.json(data || []);

    } catch (error) {
        console.error('Error en vía rápida:', error);
        res.status(500).json({ error: error.message });
    }
});

// 3.5 DEBUG: Obtener TODAS las ubicaciones sin filtros
app.get('/api/ubicaciones/todas', checkDbConnection, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('v_analisis_ubicaciones')
            .select('*')
            .order('timestamp_entrada', { ascending: false })
            .limit(100);

        if (error) throw error;

        console.log(`🔍 DEBUG: Total ubicaciones en vista: ${data?.length || 0}`);

        res.json({
            total: data?.length || 0,
            ubicaciones: data || []
        });

    } catch (error) {
        console.error('Error al obtener todas las ubicaciones:', error);
        res.status(500).json({ error: error.message });
    }
});

// 3.6 NUEVO: Guardar ubicación en tiempo real (para el mapa)
app.post('/api/ubicaciones/guardar', checkDbConnection, async (req, res) => {
    try {
        const {
            usuario_id, nombre, latitud, longitud, 
            precision_metros, device_type, device_fingerprint
        } = req.body;

        // Validar datos mínimos
        if (!usuario_id || !latitud || !longitud) {
            return res.status(400).json({ error: 'Faltan datos requeridos (usuario_id, latitud, longitud)' });
        }

        // Insertar en tabla de ubicaciones_en_tiempo_real
        const { data, error } = await supabase
            .from('ubicaciones_en_tiempo_real')
            .insert([{
                usuario_id,
                nombre: nombre || 'Usuario',
                latitud: parseFloat(latitud),
                longitud: parseFloat(longitud),
                precision_metros: parseInt(precision_metros) || 0,
                device_type: device_type || 'desktop',
                device_fingerprint: device_fingerprint || 'unknown',
                timestamp: new Date().toISOString(),
                activo: true
            }])
            .select();

        if (error) throw error;

        console.log(`✅ Ubicación guardada - Usuario: ${nombre}, Precisión: ${precision_metros}m`);
        res.json({ success: true, data: data[0] });

    } catch (error) {
        console.error('Error al guardar ubicación:', error);
        res.status(500).json({ error: error.message });
    }
});

// 4. Obtener lista de usuarios (para el filtro)
app.get('/api/usuarios', checkDbConnection, async (req, res) => {
    try {
        // Consultar tabla de usuarios (ajustar campos según tu esquema real)
        const { data, error } = await supabase
            .from('usuarios')
            .select('id, username, nombre')
            .order('nombre');

        if (error) throw error;

        res.json(data);

    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: error.message });
    }
});

// Rutas adicionales
app.get('/carga-masiva', (req, res) => {
    res.sendFile(path.join(__dirname, 'carga-masiva.html'));
});

app.get('/verificar-datos', (req, res) => {
    res.sendFile(path.join(__dirname, 'verificar-datos.html'));
});

// Health check para Render
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.ENVIRONMENT || 'production'
    });
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`✅ Servidor DONET corriendo`);
    console.log(`📡 Puerto: ${PORT}`);
    console.log(`🌍 Entorno: ${process.env.ENVIRONMENT || 'production'}`);
    console.log(`🔗 URL: http://localhost:${PORT}`);
    console.log(`========================================`);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
    console.error('❌ Error no manejado:', err);
});

process.on('uncaughtException', (err) => {
    console.error('❌ Excepción no capturada:', err);
    process.exit(1);
});
