-- =====================================================
-- SCRIPT DE VERIFICACIÓN Y DIAGNÓSTICO
-- Ejecutar PRIMERO en Supabase para diagnosticar
-- =====================================================

-- 1. Verificar si existe la tabla
SELECT 
    'TABLA auditoria_ubicaciones:' as verificacion,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'auditoria_ubicaciones')
        THEN '✅ EXISTE'
        ELSE '❌ NO EXISTE'
    END as estado;

-- 2. Contar registros en la tabla
SELECT 
    'REGISTROS en auditoria_ubicaciones:' as verificacion,
    COUNT(*) as cantidad
FROM auditoria_ubicaciones;

-- 3. Verificar si existe la vista
SELECT 
    'VISTA v_analisis_ubicaciones:' as verificacion,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'v_analisis_ubicaciones')
        THEN '✅ EXISTE'
        ELSE '❌ NO EXISTE'
    END as estado;

-- 4. Contar registros en la vista
SELECT 
    'REGISTROS en vista:' as verificacion,
    COUNT(*) as cantidad
FROM v_analisis_ubicaciones;

-- 5. Verificar funciones
SELECT 
    'FUNCIONES:' as verificacion,
    routine_name as nombre
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%ubicacion%';

-- 6. Mostrar datos de ejemplo si existen
SELECT 
    '========================================' as separador;
SELECT 
    'DATOS DE EJEMPLO:' as titulo;
SELECT 
    id,
    usuario_id,
    latitud,
    longitud,
    timestamp_entrada,
    actividad_realizada
FROM auditoria_ubicaciones
LIMIT 3;

-- 7. Verificar usuario prueba
SELECT 
    '========================================' as separador;
SELECT 
    'USUARIO PRUEBA:' as verificacion,
    id,
    username,
    nombre
FROM usuarios
WHERE username = 'prueba';
