-- =====================================================
-- DIAGNÓSTICO COMPLETO DEL SISTEMA GPS
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- 1. Verificar que la tabla existe
SELECT '=== PASO 1: Verificar Tabla ===' as paso;
SELECT
    table_name,
    CASE WHEN table_name = 'auditoria_ubicaciones' THEN '✅ Existe' ELSE '❌ No existe' END as estado
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'auditoria_ubicaciones';

-- 2. Verificar estructura de la tabla
SELECT '=== PASO 2: Estructura de la Tabla ===' as paso;
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'auditoria_ubicaciones'
ORDER BY ordinal_position;

-- 3. Verificar funciones RPC
SELECT '=== PASO 3: Funciones RPC ===' as paso;
SELECT
    routine_name,
    routine_type,
    CASE WHEN routine_name IN ('registrar_entrada_ubicacion', 'registrar_salida_ubicacion')
        THEN '✅ Existe'
        ELSE '⚠️ Otra función'
    END as estado
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%ubicacion%'
ORDER BY routine_name;

-- 4. Contar ubicaciones totales
SELECT '=== PASO 4: Total de Ubicaciones ===' as paso;
SELECT
    COUNT(*) as total_ubicaciones,
    CASE
        WHEN COUNT(*) = 0 THEN '❌ NO hay ubicaciones - GPS no se ha activado'
        WHEN COUNT(*) > 0 THEN '✅ Hay ubicaciones guardadas'
    END as estado
FROM auditoria_ubicaciones;

-- 5. Ver últimas ubicaciones (si existen)
SELECT '=== PASO 5: Últimas 5 Ubicaciones ===' as paso;
SELECT
    id,
    usuario_id,
    device_type,
    latitud,
    longitud,
    timestamp_entrada,
    timestamp_salida,
    duracion_minutos,
    actividad_realizada
FROM auditoria_ubicaciones
ORDER BY timestamp_entrada DESC
LIMIT 5;

-- 6. Verificar usuarios
SELECT '=== PASO 6: Usuarios Disponibles ===' as paso;
SELECT
    u.id,
    u.username,
    u.nombre,
    COUNT(au.id) as ubicaciones_registradas,
    MAX(au.timestamp_entrada) as ultima_ubicacion
FROM usuarios u
LEFT JOIN auditoria_ubicaciones au ON u.id = au.usuario_id
GROUP BY u.id, u.username, u.nombre
ORDER BY u.id;

-- 7. Verificar vista v_analisis_ubicaciones
SELECT '=== PASO 7: Vista del Mapa ===' as paso;
SELECT
    COUNT(*) as ubicaciones_en_vista,
    CASE
        WHEN COUNT(*) = 0 THEN '❌ Vista vacía - No hay datos para el mapa'
        WHEN COUNT(*) > 0 THEN '✅ Vista tiene datos'
    END as estado
FROM v_analisis_ubicaciones;

-- 8. Probar función de entrada manualmente
SELECT '=== PASO 8: Prueba Manual de Función RPC ===' as paso;
SELECT registrar_entrada_ubicacion(
    1,                          -- usuario_id (prueba)
    'test-diagnostic',          -- device_fingerprint
    'desktop',                  -- device_type
    -12.0464,                   -- latitud (Lima)
    -77.0428,                   -- longitud (Lima)
    10.5,                       -- precision_metros
    'Prueba diagnóstico',       -- actividad
    'TEST-001',                 -- cuenta_contrato
    '127.0.0.1',               -- ip
    'Diagnostic Test'           -- user_agent
) as session_id_creado;

-- 9. Verificar que la prueba manual se insertó
SELECT '=== PASO 9: Verificar Inserción de Prueba ===' as paso;
SELECT
    id,
    usuario_id,
    device_fingerprint,
    latitud,
    longitud,
    timestamp_entrada,
    actividad_realizada
FROM auditoria_ubicaciones
WHERE device_fingerprint = 'test-diagnostic'
ORDER BY id DESC
LIMIT 1;

-- 10. Eliminar registro de prueba (cleanup)
DELETE FROM auditoria_ubicaciones
WHERE device_fingerprint = 'test-diagnostic';

SELECT '=== DIAGNÓSTICO COMPLETO ===' as resumen;
SELECT '✅ Si llegaste aquí sin errores, la base de datos está correcta' as resultado;
SELECT '⚠️ El problema puede estar en el frontend (JavaScript)' as conclusion;
