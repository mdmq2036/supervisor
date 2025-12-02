// ========================================
// SERVIDOR NODE.JS - SISTEMA DONET
// ========================================
// Servidor Express para despliegue en Render
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

// Obtener credenciales SOLO de variables de entorno
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase;

// Validar que las credenciales estén configuradas
if (!supabaseUrl || !supabaseKey) {
    console.error('========================================');
    console.error('❌ ERROR CRÍTICO: Variables de entorno no configuradas');
    console.error('📝 Debe configurar:');
    console.error('   - SUPABASE_URL');
    console.error('   - SUPABASE_ANON_KEY');
    console.error('========================================');
    console.warn('⚠️ El servidor continuará ejecutándose pero sin funcionalidad de base de datos.');
    console.warn('⚠️ Configure las variables de entorno en Render o en su archivo .env local.');
} else {
    try {
        supabase = createClient(supabaseUrl, supabaseKey);
        console.log('✅ Cliente Supabase inicializado correctamente');
        console.log(`📊 Proyecto: ${supabaseUrl.split('//')[1].split('.')[0]}...`);
    } catch (error) {
        console.error('❌ Error al inicializar Supabase:', error.message);
    }
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

        let query = supabase
            .from('v_analisis_ubicaciones')
            .select('*')
            .order('timestamp_entrada', { ascending: false });

        // Aplicar filtros dinámicos
        if (usuario_id) query = query.eq('usuario_id', usuario_id);
        if (device_type) query = query.eq('device_type', device_type);

        if (fecha_inicio) {
            query = query.gte('timestamp_entrada', `${fecha_inicio}T00:00:00`);
        }
        if (fecha_fin) {
            query = query.lte('timestamp_entrada', `${fecha_fin}T23:59:59`);
        }

        // Limitar resultados para no saturar el mapa
        query = query.limit(500);

        const { data, error } = await query;

        if (error) throw error;

        res.json(data);

    } catch (error) {
        console.error('Error al obtener ubicaciones:', error);
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
