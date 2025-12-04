-- =====================================================
-- CERRAR SESIONES GPS ACTIVAS AL HACER LOGOUT
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- 1. Crear función para cerrar sesión GPS de un usuario
CREATE OR REPLACE FUNCTION cerrar_sesion_gps_usuario(
    p_usuario_id BIGINT
)
RETURNS void AS $$
BEGIN
    -- Desactivar todas las ubicaciones en tiempo real del usuario
    UPDATE ubicaciones_en_tiempo_real
    SET activo = false,
        updated_at = NOW()
    WHERE usuario_id = p_usuario_id
    AND activo = true;
    
    -- Cerrar todas las sesiones abiertas en auditoria_ubicaciones
    UPDATE auditoria_ubicaciones
    SET timestamp_salida = NOW(),
        duracion_minutos = EXTRACT(EPOCH FROM (NOW() - timestamp_entrada)) / 60
    WHERE usuario_id = p_usuario_id
    AND timestamp_salida IS NULL;
    
    RAISE NOTICE 'Sesiones GPS cerradas para usuario %', p_usuario_id;
END;
$$ LANGUAGE plpgsql;

-- 2. Crear función para cerrar TODAS las sesiones GPS activas (útil para mantenimiento)
CREATE OR REPLACE FUNCTION cerrar_todas_sesiones_gps()
RETURNS TABLE(
    usuario_id BIGINT,
    sesiones_cerradas INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH ubicaciones_actualizadas AS (
        UPDATE ubicaciones_en_tiempo_real
        SET activo = false,
            updated_at = NOW()
        WHERE activo = true
        RETURNING usuario_id
    ),
    auditoria_actualizada AS (
        UPDATE auditoria_ubicaciones
        SET timestamp_salida = NOW(),
            duracion_minutos = EXTRACT(EPOCH FROM (NOW() - timestamp_entrada)) / 60
        WHERE timestamp_salida IS NULL
        RETURNING usuario_id
    )
    SELECT 
        COALESCE(u.usuario_id, a.usuario_id) as usuario_id,
        COUNT(*)::INTEGER as sesiones_cerradas
    FROM ubicaciones_actualizadas u
    FULL OUTER JOIN auditoria_actualizada a ON u.usuario_id = a.usuario_id
    GROUP BY COALESCE(u.usuario_id, a.usuario_id);
END;
$$ LANGUAGE plpgsql;

-- 3. Crear endpoint para cerrar sesión GPS (se usará desde el frontend)
-- NOTA: Este es un comentario para el backend, no se ejecuta en SQL
-- Agregar en server.js:
-- app.post('/api/ubicaciones/cerrar-sesion', async (req, res) => {
--     const { usuario_id } = req.body;
--     await supabase.rpc('cerrar_sesion_gps_usuario', { p_usuario_id: usuario_id });
--     res.json({ success: true });
-- });

-- 4. Verificar funciones creadas
SELECT 'Función cerrar_sesion_gps_usuario creada' as status;
SELECT 'Función cerrar_todas_sesiones_gps creada' as status;

-- 5. Probar cerrar sesiones de un usuario específico (ejemplo)
-- SELECT cerrar_sesion_gps_usuario(1);

-- 6. Ver sesiones activas actuales
SELECT 
    u.usuario_id,
    COUNT(*) as sesiones_activas
FROM ubicaciones_en_tiempo_real u
WHERE u.activo = true
GROUP BY u.usuario_id;

SELECT '✅ FUNCIONES PARA CERRAR SESIONES GPS CREADAS' as resultado;
