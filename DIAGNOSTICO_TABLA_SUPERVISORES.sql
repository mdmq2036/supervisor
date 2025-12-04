-- =====================================================
-- DIAGNÓSTICO: Verificar estructura de tabla supervisores
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- 1. Verificar si la tabla supervisores existe
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'supervisores';

-- 2. Ver todas las columnas de la tabla supervisores
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'supervisores'
ORDER BY ordinal_position;

-- 3. Ver algunos datos de ejemplo de supervisores
SELECT * FROM supervisores LIMIT 5;

-- 4. Ver estructura de tabla usuarios para comparar
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'usuarios'
ORDER BY ordinal_position;

-- 5. Ver algunos datos de ejemplo de usuarios
SELECT * FROM usuarios LIMIT 5;
