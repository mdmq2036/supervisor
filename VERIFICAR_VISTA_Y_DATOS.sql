-- =====================================================
-- VERIFICAR VISTA Y DATOS DEL MAPA
-- =====================================================

-- 1. Contar ubicaciones en tabla principal
SELECT '=== PASO 1: Ubicaciones en Tabla Principal ===' as paso;
SELECT COUNT(*) as total_ubicaciones FROM auditoria_ubicaciones;

-- 2. Ver datos de la tabla principal
SELECT '=== PASO 2: Datos de la Tabla Principal ===' as paso;
SELECT 
    id,
    usuario_id,
    device_type,
    latitud,
    longitud,
    timestamp_entrada,
    actividad_realizada
FROM auditoria_ubicaciones
ORDER BY timestamp_entrada DESC
LIMIT 5;

-- 3. Verificar que la vista existe
SELECT '=== PASO 3: Verificar Vista Existe ===' as paso;
SELECT COUNT(*) as vista_existe
FROM pg_views
WHERE viewname = 'v_analisis_ubicaciones';

-- 4. Contar ubicaciones en la vista
SELECT '=== PASO 4: Ubicaciones en Vista ===' as paso;
SELECT COUNT(*) as total_en_vista FROM v_analisis_ubicaciones;

-- 5. Ver datos de la vista
SELECT '=== PASO 5: Datos de la Vista ===' as paso;
SELECT * FROM v_analisis_ubicaciones
ORDER BY timestamp_entrada DESC
LIMIT 5;

-- 6. Verificar usuario existe
SELECT '=== PASO 6: Verificar Usuario ===' as paso;
SELECT id, username, nombre FROM usuarios LIMIT 5;

-- RESULTADO ESPERADO:
-- Si PASO 1 tiene datos pero PASO 4 está vacío = La vista tiene un problema
-- Si ambos tienen datos = El problema está en el frontend
