-- =====================================================
-- SCRIPT DE RESPALDO - RESTAURAR VISTAS ORIGINALES
-- Ejecutar SOLO si algo sale mal con la actualización
-- =====================================================

-- Este script restaura las vistas a su estado original
-- SIN incluir supervisores

-- 1. Eliminar vistas actuales
DROP VIEW IF EXISTS v_ubicaciones_tiempo_real CASCADE;
DROP VIEW IF EXISTS v_analisis_ubicaciones CASCADE;

-- 2. Recrear vista v_analisis_ubicaciones (ORIGINAL - solo usuarios)
CREATE OR REPLACE VIEW v_analisis_ubicaciones AS
SELECT 
    au.id,
    u.username,
    u.nombre,
    au.device_type,
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
JOIN usuarios u ON au.usuario_id = u.id
ORDER BY au.timestamp_entrada DESC;

-- 3. Recrear vista v_ubicaciones_tiempo_real (ORIGINAL - solo usuarios)
CREATE OR REPLACE VIEW v_ubicaciones_tiempo_real AS
SELECT 
    u.id,
    u.usuario_id,
    u.nombre,
    u.latitud,
    u.longitud,
    u.precision_metros,
    u.device_type,
    u.device_fingerprint,
    u.timestamp as timestamp_entrada,
    u.activo,
    u.created_at,
    EXTRACT(EPOCH FROM (NOW() - u.timestamp)) / 60 as duracion_minutos,
    'Ubicación registrada' as actividad_realizada
FROM ubicaciones_en_tiempo_real u
WHERE u.activo = true
ORDER BY u.timestamp DESC;

-- 4. Verificar restauración
SELECT '✅ VISTAS RESTAURADAS A ESTADO ORIGINAL' as resultado;
SELECT COUNT(*) FROM v_analisis_ubicaciones;
SELECT COUNT(*) FROM v_ubicaciones_tiempo_real;
