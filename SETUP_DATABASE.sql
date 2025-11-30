-- ========================================
-- SCRIPT DE CONFIGURACIÓN COMPLETA - DONET
-- Ejecutar en Supabase SQL Editor o DBeaver
-- ========================================

-- PASO 1: Eliminar tablas existentes (si existen)
-- ========================================
DROP TABLE IF EXISTS registros_inspeccion CASCADE;
DROP TABLE IF EXISTS supervisores CASCADE;

-- PASO 2: Crear tabla de supervisores
-- ========================================
CREATE TABLE supervisores (
    id SERIAL PRIMARY KEY,
    usuario VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- PASO 3: Crear tabla de registros de inspección
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

-- PASO 4: Crear índices para mejorar rendimiento
-- ========================================
CREATE INDEX idx_registros_supervisor ON registros_inspeccion(supervisor_id);
CREATE INDEX idx_registros_cuenta ON registros_inspeccion(cuenta_contrato);
CREATE INDEX idx_registros_fecha ON registros_inspeccion(fecha);

-- PASO 5: Insertar usuarios de prueba
-- ========================================
INSERT INTO supervisores (usuario, password, nombre) VALUES
('admin', 'admin123', 'Administrador'),
('supervisor1', 'pass123', 'Supervisor 1'),
('supervisor2', 'pass456', 'Supervisor 2');

-- PASO 6: DESHABILITAR Row Level Security (RLS)
-- ========================================
-- Esto es CRÍTICO para que el login funcione
ALTER TABLE supervisores DISABLE ROW LEVEL SECURITY;
ALTER TABLE registros_inspeccion DISABLE ROW LEVEL SECURITY;

-- Si ya existían políticas, eliminarlas
DROP POLICY IF EXISTS "Los supervisores pueden ver sus propios datos" ON supervisores;
DROP POLICY IF EXISTS "Todos pueden ver registros" ON registros_inspeccion;
DROP POLICY IF EXISTS "Los supervisores pueden insertar registros" ON registros_inspeccion;
DROP POLICY IF EXISTS "Permitir lectura pública" ON supervisores;
DROP POLICY IF EXISTS "Permitir lectura pública registros" ON registros_inspeccion;
DROP POLICY IF EXISTS "Permitir inserción registros" ON registros_inspeccion;

-- PASO 7: Crear políticas que permitan acceso completo
-- ========================================
-- Solo si quieres habilitar RLS después, descomenta estas líneas:
/*
ALTER TABLE supervisores ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_inspeccion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir todo supervisores" ON supervisores
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir todo registros" ON registros_inspeccion
    FOR ALL USING (true) WITH CHECK (true);
*/

-- PASO 8: Verificar que todo se creó correctamente
-- ========================================
SELECT 'CONFIGURACIÓN COMPLETADA EXITOSAMENTE' as status;

-- Verificar supervisores creados
SELECT
    'Usuarios creados:' as info,
    COUNT(*) as total
FROM supervisores;

-- Mostrar usuarios
SELECT
    id,
    usuario,
    password,
    nombre,
    activo
FROM supervisores
ORDER BY id;

-- Verificar que RLS está deshabilitado
SELECT
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('supervisores', 'registros_inspeccion');
