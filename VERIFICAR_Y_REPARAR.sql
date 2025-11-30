-- ========================================
-- SCRIPT DE VERIFICACIÓN Y REPARACIÓN RÁPIDA
-- Ejecuta esto si ya tienes las tablas creadas
-- ========================================

-- 1. VERIFICAR SI EXISTEN LOS USUARIOS
-- ========================================
SELECT
    'Estado actual de usuarios:' as info;

SELECT
    id,
    usuario,
    password,
    nombre,
    activo
FROM supervisores
ORDER BY id;

-- Si no aparece ningún usuario, ejecuta esto:
-- ========================================

-- Eliminar usuarios existentes (opcional)
-- DELETE FROM supervisores;

-- Insertar/Actualizar usuarios
INSERT INTO supervisores (usuario, password, nombre, activo)
VALUES
    ('admin', 'admin123', 'Administrador', true),
    ('supervisor1', 'pass123', 'Supervisor 1', true),
    ('supervisor2', 'pass456', 'Supervisor 2', true)
ON CONFLICT (usuario) DO UPDATE
SET
    password = EXCLUDED.password,
    nombre = EXCLUDED.nombre,
    activo = EXCLUDED.activo;


-- 2. DESHABILITAR RLS (Problema más común)
-- ========================================
ALTER TABLE supervisores DISABLE ROW LEVEL SECURITY;
ALTER TABLE registros_inspeccion DISABLE ROW LEVEL SECURITY;

-- Eliminar todas las políticas existentes
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename IN ('supervisores', 'registros_inspeccion')
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.tablename;
    END LOOP;
END $$;


-- 3. VERIFICACIÓN FINAL
-- ========================================
SELECT
    'VERIFICACIÓN COMPLETADA' as status;

-- Ver usuarios finales
SELECT
    '--- USUARIOS DISPONIBLES ---' as info;

SELECT
    usuario,
    password,
    nombre
FROM supervisores
WHERE activo = true;

-- Verificar RLS
SELECT
    '--- ESTADO DE SEGURIDAD ---' as info;

SELECT
    tablename,
    CASE WHEN rowsecurity THEN 'HABILITADO ⚠️' ELSE 'DESHABILITADO ✅' END as rls_estado
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('supervisores', 'registros_inspeccion');

-- Contar registros
SELECT
    '--- TOTALES ---' as info;

SELECT
    'supervisores' as tabla,
    COUNT(*) as total_registros
FROM supervisores
UNION ALL
SELECT
    'registros_inspeccion' as tabla,
    COUNT(*) as total_registros
FROM registros_inspeccion;
