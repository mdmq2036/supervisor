-- =====================================================
-- ACTUALIZAR VISTAS PARA INCLUIR SUPERVISORES EN EL MAPA
-- Versión SEGURA - Elimina y recrea las vistas correctamente
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- PASO 1: Eliminar vistas existentes (si existen)
DROP VIEW IF EXISTS v_ubicaciones_tiempo_real CASCADE;
DROP VIEW IF EXISTS v_analisis_ubicaciones CASCADE;

-- PASO 2: Recrear vista v_analisis_ubicaciones con supervisores incluidos
CREATE OR REPLACE VIEW v_analisis_ubicaciones AS
-- Ubicaciones de usuarios regulares
SELECT 
    au.id,
    au.usuario_id,
    CAST(COALESCE(u.username, u.nombre, 'Usuario') AS VARCHAR(50)) as username,
    CAST(COALESCE(u.nombre, u.username, 'Sin nombre') AS VARCHAR(255)) as nombre,
    'usuario' as tipo_usuario,
    au.device_type,
    au.device_fingerprint,
    au.latitud,
    au.longitud,
    au.precision_metros,
    au.timestamp_entrada,
    au.timestamp_salida,
    au.duracion_minutos,
    au.actividad_realizada,
    au.cuenta_contrato,
    CASE 
        WHEN au.duracion_minutos IS NULL THEN 'En curso'
        WHEN au.duracion_minutos < 5 THEN 'Muy corta'
        WHEN au.duracion_minutos < 15 THEN 'Corta'
        WHEN au.duracion_minutos < 30 THEN 'Media'
        WHEN au.duracion_minutos < 60 THEN 'Larga'
        ELSE 'Muy larga'
    END as clasificacion_duracion
FROM auditoria_ubicaciones au
LEFT JOIN usuarios u ON au.usuario_id = u.id

UNION ALL

-- Ubicaciones de supervisores
SELECT 
    au.id,
    au.usuario_id,
    CAST(COALESCE(s.nombre, CAST(s.id AS VARCHAR), 'Supervisor') AS VARCHAR(50)) as username,
    CAST(COALESCE(s.nombre, CAST(s.id AS VARCHAR), 'Sin nombre') AS VARCHAR(255)) as nombre,
    'supervisor' as tipo_usuario,
    au.device_type,
    au.device_fingerprint,
    au.latitud,
    au.longitud,
    au.precision_metros,
    au.timestamp_entrada,
    au.timestamp_salida,
    au.duracion_minutos,
    au.actividad_realizada,
    au.cuenta_contrato,
    CASE 
        WHEN au.duracion_minutos IS NULL THEN 'En curso'
        WHEN au.duracion_minutos < 5 THEN 'Muy corta'
        WHEN au.duracion_minutos < 15 THEN 'Corta'
        WHEN au.duracion_minutos < 30 THEN 'Media'
        WHEN au.duracion_minutos < 60 THEN 'Larga'
        ELSE 'Muy larga'
    END as clasificacion_duracion
FROM auditoria_ubicaciones au
LEFT JOIN supervisores s ON au.usuario_id = s.id

ORDER BY timestamp_entrada DESC;

-- PASO 3: Recrear vista v_ubicaciones_tiempo_real con supervisores incluidos
CREATE OR REPLACE VIEW v_ubicaciones_tiempo_real AS
-- Ubicaciones en tiempo real de usuarios regulares
SELECT 
    u.id,
    u.usuario_id,
    CAST(COALESCE(usr.username, usr.nombre, 'Usuario') AS VARCHAR(50)) as username,
    CAST(COALESCE(usr.nombre, usr.username, 'Sin nombre') AS VARCHAR(255)) as nombre,
    'usuario' as tipo_usuario,
    u.latitud,
    u.longitud,
    u.precision_metros,
    u.device_type,
    u.device_fingerprint,
    u.timestamp as timestamp_entrada,
    NULL::timestamp as timestamp_salida,
    u.activo,
    u.created_at,
    EXTRACT(EPOCH FROM (NOW() - u.timestamp)) / 60 as duracion_minutos,
    'Ubicación registrada' as actividad_realizada,
    NULL::varchar(100) as cuenta_contrato
FROM ubicaciones_en_tiempo_real u
LEFT JOIN usuarios usr ON u.usuario_id = usr.id
WHERE u.activo = true

UNION ALL

-- Ubicaciones en tiempo real de supervisores
SELECT 
    u.id,
    u.usuario_id,
    CAST(COALESCE(s.nombre, CAST(s.id AS VARCHAR), 'Supervisor') AS VARCHAR(50)) as username,
    CAST(COALESCE(s.nombre, CAST(s.id AS VARCHAR), 'Sin nombre') AS VARCHAR(255)) as nombre,
    'supervisor' as tipo_usuario,
    u.latitud,
    u.longitud,
    u.precision_metros,
    u.device_type,
    u.device_fingerprint,
    u.timestamp as timestamp_entrada,
    NULL::timestamp as timestamp_salida,
    u.activo,
    u.created_at,
    EXTRACT(EPOCH FROM (NOW() - u.timestamp)) / 60 as duracion_minutos,
    'Ubicación registrada' as actividad_realizada,
    NULL::varchar(100) as cuenta_contrato
FROM ubicaciones_en_tiempo_real u
LEFT JOIN supervisores s ON u.usuario_id = s.id
WHERE u.activo = true

ORDER BY timestamp_entrada DESC;

-- PASO 4: Verificar que las vistas se crearon correctamente
SELECT 'Vista v_analisis_ubicaciones recreada' as status;
SELECT COUNT(*) as total_ubicaciones FROM v_analisis_ubicaciones;

SELECT 'Vista v_ubicaciones_tiempo_real recreada' as status;
SELECT COUNT(*) as total_ubicaciones_tiempo_real FROM v_ubicaciones_tiempo_real;

-- PASO 5: Verificar estructura de las vistas
SELECT 
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'v_analisis_ubicaciones'
ORDER BY ordinal_position;

-- PASO 6: Mostrar datos de ejemplo
SELECT 
    username,
    nombre,
    tipo_usuario,
    timestamp_entrada,
    duracion_minutos
FROM v_analisis_ubicaciones
LIMIT 5;

SELECT '✅ VISTAS ACTUALIZADAS CORRECTAMENTE - SUPERVISORES INCLUIDOS' as resultado;
