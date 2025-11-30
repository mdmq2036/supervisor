-- ========================================
-- ✅ SCRIPT DEFINITIVO PARA SUPABASE
-- COPIA Y PEGA TODO ESTE CÓDIGO EN SQL EDITOR
-- ========================================

-- PASO 1: LIMPIAR TODO (Eliminar tablas antiguas)
-- ========================================
DROP TABLE IF EXISTS registros_inspeccion CASCADE;
DROP TABLE IF EXISTS supervisores CASCADE;

-- PASO 2: CREAR TABLA SUPERVISORES
-- ========================================
CREATE TABLE supervisores (
    id SERIAL PRIMARY KEY,
    usuario VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE supervisores IS 'Usuarios del sistema';

-- PASO 3: CREAR TABLA REGISTROS
-- ========================================
CREATE TABLE registros_inspeccion (
    id SERIAL PRIMARY KEY,
    supervisor_id INTEGER REFERENCES supervisores(id),
    cuenta_contrato VARCHAR(100) NOT NULL,
    fecha DATE NOT NULL,
    observacion1 TEXT,
    observacion2 TEXT,
    foto1 TEXT,
    foto2 TEXT,
    foto3 TEXT,
    foto4 TEXT,
    foto5 TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE registros_inspeccion IS 'Registros de inspecciones';

-- PASO 4: CREAR ÍNDICES
-- ========================================
CREATE INDEX idx_supervisores_usuario ON supervisores(usuario);
CREATE INDEX idx_registros_supervisor ON registros_inspeccion(supervisor_id);
CREATE INDEX idx_registros_cuenta ON registros_inspeccion(cuenta_contrato);
CREATE INDEX idx_registros_fecha ON registros_inspeccion(fecha);

-- PASO 5: INSERTAR USUARIOS
-- ========================================
INSERT INTO supervisores (usuario, password, nombre, activo) VALUES
('admin', 'admin123', 'Administrador', true),
('supervisor1', 'pass123', 'Supervisor 1', true),
('supervisor2', 'pass456', 'Supervisor 2', true);

-- PASO 6: DESHABILITAR RLS (MUY IMPORTANTE)
-- ========================================
ALTER TABLE supervisores DISABLE ROW LEVEL SECURITY;
ALTER TABLE registros_inspeccion DISABLE ROW LEVEL SECURITY;

-- PASO 7: ELIMINAR TODAS LAS POLÍTICAS EXISTENTES
-- ========================================
DO $$
DECLARE
    pol RECORD;
BEGIN
    -- Eliminar políticas de supervisores
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'supervisores'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON supervisores', pol.policyname);
    END LOOP;

    -- Eliminar políticas de registros_inspeccion
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'registros_inspeccion'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON registros_inspeccion', pol.policyname);
    END LOOP;
END $$;

-- PASO 8: INSERTAR REGISTRO DE EJEMPLO
-- ========================================
INSERT INTO registros_inspeccion (
    supervisor_id,
    cuenta_contrato,
    fecha,
    observacion1,
    observacion2
) VALUES (
    1,
    'EJEMPLO-001',
    CURRENT_DATE,
    'Registro de ejemplo',
    'Este es un registro de prueba'
);

-- ========================================
-- ✅ VERIFICACIÓN FINAL
-- ========================================

-- Mostrar mensaje de éxito
SELECT '✅ CONFIGURACIÓN COMPLETADA EXITOSAMENTE' as status;

-- Mostrar usuarios creados
SELECT
    '=== USUARIOS CREADOS ===' as info
UNION ALL
SELECT
    'Usuario: ' || usuario || ' | Contraseña: ' || password || ' | Nombre: ' || nombre
FROM supervisores
WHERE activo = true
ORDER BY id;

-- Verificar que RLS esté deshabilitado
SELECT
    '=== ESTADO DE SEGURIDAD ===' as info
UNION ALL
SELECT
    'Tabla: ' || tablename || ' | RLS: ' ||
    CASE WHEN rowsecurity THEN '❌ HABILITADO (Problema)' ELSE '✅ DESHABILITADO (Correcto)' END
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('supervisores', 'registros_inspeccion');

-- Contar registros
SELECT
    '=== TOTALES ===' as info
UNION ALL
SELECT 'Supervisores: ' || COUNT(*)::text FROM supervisores
UNION ALL
SELECT 'Registros: ' || COUNT(*)::text FROM registros_inspeccion;

-- Verificar políticas
SELECT
    '=== POLÍTICAS (Debería estar vacío) ===' as info
UNION ALL
SELECT
    'Tabla: ' || tablename || ' | Política: ' || policyname
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('supervisores', 'registros_inspeccion');

-- Mensaje final
SELECT
    '========================================' as resultado
UNION ALL
SELECT
    '✅ Base de datos lista para usar'
UNION ALL
SELECT
    '👥 Usuarios disponibles: 3'
UNION ALL
SELECT
    '🔓 RLS deshabilitado correctamente'
UNION ALL
SELECT
    '📋 Puedes iniciar sesión con:'
UNION ALL
SELECT
    '   • admin / admin123'
UNION ALL
SELECT
    '   • supervisor1 / pass123'
UNION ALL
SELECT
    '   • supervisor2 / pass456'
UNION ALL
SELECT
    '========================================';
