/**
 * ENDPOINTS DE API PARA GEOLOCALIZACIÓN
 * Ejemplo de implementación para Node.js/Express con Supabase
 */

const express = require('express');
const router = express.Router();

// Middleware de autenticación (ajustar según tu implementación)
const authenticateToken = require('../middleware/auth');

/**
 * POST /api/ubicaciones/entrada
 * Registrar entrada de ubicación
 */
router.post('/entrada', authenticateToken, async (req, res) => {
    try {
        const {
            usuario_id,
            device_fingerprint,
            device_type,
            latitud,
            longitud,
            precision_metros,
            actividad_realizada,
            cuenta_contrato,
            ip_address,
            user_agent
        } = req.body;

        // Validar datos requeridos
        if (!usuario_id || !latitud || !longitud) {
            return res.status(400).json({
                error: 'Faltan datos requeridos: usuario_id, latitud, longitud'
            });
        }

        // Llamar a la función SQL
        const { data, error } = await supabase.rpc('registrar_entrada_ubicacion', {
            p_usuario_id: usuario_id,
            p_device_fingerprint: device_fingerprint || 'unknown',
            p_device_type: device_type || 'unknown',
            p_latitud: latitud,
            p_longitud: longitud,
            p_precision: precision_metros || null,
            p_actividad: actividad_realizada || null,
            p_cuenta_contrato: cuenta_contrato || null,
            p_ip_address: ip_address || null,
            p_user_agent: user_agent || null
        });

        if (error) {
            console.error('Error al registrar entrada:', error);
            return res.status(500).json({ error: 'Error al registrar ubicación' });
        }

        res.json({
            success: true,
            session_id: data
        });

    } catch (error) {
        console.error('Error en endpoint de entrada:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

/**
 * POST /api/ubicaciones/salida
 * Registrar salida de ubicación
 */
router.post('/salida', authenticateToken, async (req, res) => {
    try {
        const { session_id } = req.body;

        if (!session_id) {
            return res.status(400).json({
                error: 'Se requiere session_id'
            });
        }

        // Llamar a la función SQL
        const { data, error } = await supabase.rpc('registrar_salida_ubicacion', {
            p_auditoria_id: session_id
        });

        if (error) {
            console.error('Error al registrar salida:', error);
            return res.status(500).json({ error: 'Error al registrar salida' });
        }

        // Obtener la duración calculada
        const { data: ubicacion } = await supabase
            .from('auditoria_ubicaciones')
            .select('duracion_minutos')
            .eq('id', session_id)
            .single();

        res.json({
            success: data,
            duracion_minutos: ubicacion?.duracion_minutos || null
        });

    } catch (error) {
        console.error('Error en endpoint de salida:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

/**
 * GET /api/ubicaciones
 * Obtener historial de ubicaciones con filtros
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const {
            usuario_id,
            fecha_inicio,
            fecha_fin,
            device_type
        } = req.query;

        // Construir query
        let query = supabase
            .from('v_analisis_ubicaciones')
            .select('*')
            .order('timestamp_entrada', { ascending: false });

        // Aplicar filtros
        if (usuario_id) {
            query = query.eq('usuario_id', usuario_id);
        }

        if (fecha_inicio) {
            query = query.gte('timestamp_entrada', fecha_inicio);
        }

        if (fecha_fin) {
            query = query.lte('timestamp_entrada', fecha_fin);
        }

        if (device_type) {
            query = query.eq('device_type', device_type);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error al obtener ubicaciones:', error);
            return res.status(500).json({ error: 'Error al obtener ubicaciones' });
        }

        res.json(data || []);

    } catch (error) {
        console.error('Error en endpoint de ubicaciones:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

/**
 * GET /api/ubicaciones/historial/:usuario_id
 * Obtener historial de un usuario específico usando la función SQL
 */
router.get('/historial/:usuario_id', authenticateToken, async (req, res) => {
    try {
        const { usuario_id } = req.params;
        const { fecha_inicio, fecha_fin } = req.query;

        const { data, error } = await supabase.rpc('obtener_historial_ubicaciones', {
            p_usuario_id: parseInt(usuario_id),
            p_fecha_inicio: fecha_inicio || null,
            p_fecha_fin: fecha_fin || null
        });

        if (error) {
            console.error('Error al obtener historial:', error);
            return res.status(500).json({ error: 'Error al obtener historial' });
        }

        res.json(data || []);

    } catch (error) {
        console.error('Error en endpoint de historial:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

/**
 * GET /api/ubicaciones/estadisticas/:usuario_id
 * Obtener estadísticas de ubicaciones de un usuario
 */
router.get('/estadisticas/:usuario_id', authenticateToken, async (req, res) => {
    try {
        const { usuario_id } = req.params;

        const { data, error } = await supabase
            .from('v_resumen_ubicaciones_usuario')
            .select('*')
            .eq('usuario_id', usuario_id)
            .single();

        if (error) {
            console.error('Error al obtener estadísticas:', error);
            return res.status(500).json({ error: 'Error al obtener estadísticas' });
        }

        res.json(data || {});

    } catch (error) {
        console.error('Error en endpoint de estadísticas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

/**
 * GET /api/usuarios
 * Listar todos los usuarios (para filtros)
 */
router.get('/usuarios', authenticateToken, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('usuarios')
            .select('id, username, nombre')
            .eq('activo', true)
            .order('nombre');

        if (error) {
            console.error('Error al obtener usuarios:', error);
            return res.status(500).json({ error: 'Error al obtener usuarios' });
        }

        res.json(data || []);

    } catch (error) {
        console.error('Error en endpoint de usuarios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

/**
 * DELETE /api/ubicaciones/:id
 * Eliminar una ubicación (solo admin)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        // Verificar que el usuario sea admin
        if (req.user.rol !== 'admin') {
            return res.status(403).json({ error: 'No autorizado' });
        }

        const { id } = req.params;

        const { error } = await supabase
            .from('auditoria_ubicaciones')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error al eliminar ubicación:', error);
            return res.status(500).json({ error: 'Error al eliminar ubicación' });
        }

        res.json({ success: true });

    } catch (error) {
        console.error('Error en endpoint de eliminación:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

/**
 * PUT /api/ubicaciones/:id/cerrar
 * Cerrar manualmente una sesión de ubicación (registrar salida)
 */
router.put('/:id/cerrar', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase.rpc('registrar_salida_ubicacion', {
            p_auditoria_id: parseInt(id)
        });

        if (error) {
            console.error('Error al cerrar sesión:', error);
            return res.status(500).json({ error: 'Error al cerrar sesión' });
        }

        res.json({ success: data });

    } catch (error) {
        console.error('Error en endpoint de cierre:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

/**
 * GET /api/ubicaciones/activas
 * Obtener ubicaciones activas (sin timestamp_salida)
 */
router.get('/activas', authenticateToken, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('v_analisis_ubicaciones')
            .select('*')
            .is('timestamp_salida', null)
            .order('timestamp_entrada', { ascending: false });

        if (error) {
            console.error('Error al obtener ubicaciones activas:', error);
            return res.status(500).json({ error: 'Error al obtener ubicaciones activas' });
        }

        res.json(data || []);

    } catch (error) {
        console.error('Error en endpoint de ubicaciones activas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
