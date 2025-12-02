-- ============================================
-- SCRIPT DE VERIFICACIÓN Y CORRECCIÓN
-- Para el Mapa de Ubicaciones
-- ============================================

-- PASO 1: Verificar si existe la vista v_analisis_ubicaciones
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_views WHERE viewname = 'v_analisis_ubicaciones'
    ) THEN
        RAISE NOTICE '❌ Vista v_analisis_ubicaciones NO existe - Creándola ahora...';

        -- Crear la vista con los nombres CORRECTOS de columnas
        CREATE OR REPLACE VIEW v_analisis_ubicaciones AS
        SELECT
            au.id,
            au.usuario_id,
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

        RAISE NOTICE '✅ Vista v_analisis_ubicaciones creada exitosamente';
    ELSE
        RAISE NOTICE '✅ Vista v_analisis_ubicaciones ya existe';
    END IF;
END $$;

-- PASO 2: Verificar si hay datos en auditoria_ubicaciones
DO $$
DECLARE
    total_ubicaciones INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_ubicaciones FROM auditoria_ubicaciones;

    RAISE NOTICE '📊 Total de ubicaciones en la tabla: %', total_ubicaciones;

    IF total_ubicaciones = 0 THEN
        RAISE NOTICE '⚠️ No hay datos de ubicaciones - Se recomienda insertar datos de prueba';
        RAISE NOTICE '💡 Ejecuta el archivo DATOS_PRUEBA_UBICACIONES.sql para agregar datos de prueba';
    ELSE
        RAISE NOTICE '✅ Hay % ubicaciones registradas', total_ubicaciones;
    END IF;
END $$;

-- PASO 3: Mostrar las últimas 5 ubicaciones registradas
SELECT
    id,
    usuario_id,
    latitud,
    longitud,
    device_type,
    timestamp_entrada,
    duracion_minutos
FROM auditoria_ubicaciones
ORDER BY timestamp_entrada DESC
LIMIT 5;

-- PASO 4: Verificar usuarios disponibles
SELECT
    u.id,
    u.username,
    u.nombre,
    COUNT(au.id) as total_ubicaciones
FROM usuarios u
LEFT JOIN auditoria_ubicaciones au ON u.id = au.usuario_id
GROUP BY u.id, u.username, u.nombre
ORDER BY total_ubicaciones DESC;

-- PASO 5: Verificar que la vista funciona correctamente
SELECT COUNT(*) as total_en_vista FROM v_analisis_ubicaciones;

-- PASO 6: Mostrar resumen de ubicaciones por usuario
SELECT
    usuario_id,
    username,
    nombre,
    COUNT(*) as total_ubicaciones,
    MAX(timestamp_entrada) as ultima_ubicacion
FROM v_analisis_ubicaciones
GROUP BY usuario_id, username, nombre
ORDER BY total_ubicaciones DESC;

-- RESULTADO ESPERADO:
-- Si todo está correcto, deberías ver:
-- ✅ Vista existe
-- ✅ Hay ubicaciones en la tabla
-- ✅ La vista retorna datos
-- ✅ Usuarios tienen ubicaciones asociadas
