-- ==========================================================
-- SCRIPT COMPLETO: CREAR USUARIOS Y DATOS SIMULADOS
-- ==========================================================
-- Ejecuta este script COMPLETO en el SQL Editor de Supabase
-- para crear todos los usuarios y datos de prueba
-- ==========================================================

-- 1. CREAR/REPARAR TABLA DE USUARIOS ESPECIALES
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT,
    nombre TEXT,
    rol TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INSERTAR USUARIOS ESPECIALES (admin, demo, mdonet, prueba)
INSERT INTO usuarios (username, password, nombre, rol, activo) VALUES
('admin', 'admin2025', 'Administrador Sistema', 'admin', true),
('demo', 'demo123', 'Usuario Demo', 'prueba', true),
('mdonet', 'mdonet123', 'Usuario Mdonet', 'prueba', true),
('prueba', 'prueba2025', 'Usuario Prueba', 'prueba', true)
ON CONFLICT (username) DO UPDATE SET 
    password = EXCLUDED.password,
    nombre = EXCLUDED.nombre,
    rol = EXCLUDED.rol,
    activo = true;

-- 3. CREAR/REPARAR TABLA DE SUPERVISORES
CREATE TABLE IF NOT EXISTS supervisores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    nombre TEXT NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. INSERTAR SUPERVISORES (carlos, wilmer, marcelino, manuel, angelo)
INSERT INTO supervisores (usuario, password, nombre, activo) VALUES
('carlos', '43803239', 'Carlos', true),
('wilmer', '46298703', 'Wilmer', true),
('marcelino', '9394061', 'Marcelino', true),
('manuel', '561773', 'Manuel', true),
('angelo', '76935270', 'Angelo', true)
ON CONFLICT (usuario) DO UPDATE SET 
    password = EXCLUDED.password,
    nombre = EXCLUDED.nombre,
    activo = true;

-- 5. CREAR DATOS SIMULADOS DE UBICACIONES GPS
-- Primero verificamos que la tabla existe
CREATE TABLE IF NOT EXISTS ubicaciones_gps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID REFERENCES usuarios(id),
    device_fingerprint TEXT,
    device_type TEXT,
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    precision_metros DECIMAL(10, 2),
    timestamp_entrada TIMESTAMPTZ DEFAULT NOW(),
    timestamp_salida TIMESTAMPTZ,
    duracion_minutos INTEGER,
    actividad_realizada TEXT,
    cuenta_contrato TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. INSERTAR UBICACIONES SIMULADAS PARA CADA USUARIO
-- Ubicaciones para usuario 'prueba'
INSERT INTO ubicaciones_gps (
    usuario_id,
    device_fingerprint,
    device_type,
    latitud,
    longitud,
    precision_metros,
    timestamp_entrada,
    timestamp_salida,
    duracion_minutos,
    actividad_realizada,
    cuenta_contrato,
    ip_address,
    user_agent
)
SELECT 
    u.id,
    'sim-' || u.username || '-device-1',
    'desktop',
    -12.0464 + (random() * 0.1 - 0.05), -- Lima, Perú con variación
    -77.0428 + (random() * 0.1 - 0.05),
    15.5,
    NOW() - (interval '1 hour' * generate_series),
    NOW() - (interval '1 hour' * generate_series) + interval '30 minutes',
    30,
    'Inspección de campo',
    'CUENTA-' || LPAD(generate_series::text, 5, '0'),
    '192.168.1.' || (100 + generate_series),
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
FROM usuarios u, generate_series(1, 5)
WHERE u.username = 'prueba';

-- Ubicaciones para supervisores
INSERT INTO ubicaciones_gps (
    usuario_id,
    device_fingerprint,
    device_type,
    latitud,
    longitud,
    precision_metros,
    timestamp_entrada,
    timestamp_salida,
    duracion_minutos,
    actividad_realizada,
    cuenta_contrato,
    ip_address,
    user_agent
)
SELECT 
    s.id,
    'sim-' || s.usuario || '-device-1',
    'mobile',
    -12.0464 + (random() * 0.1 - 0.05), -- Lima, Perú con variación
    -77.0428 + (random() * 0.1 - 0.05),
    20.0,
    NOW() - (interval '1 hour' * generate_series),
    NOW() - (interval '1 hour' * generate_series) + interval '45 minutes',
    45,
    'Supervisión de contrato',
    'CONTRATO-' || s.usuario || '-' || LPAD(generate_series::text, 3, '0'),
    '192.168.2.' || (100 + generate_series),
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
FROM supervisores s, generate_series(1, 3)
WHERE s.activo = true;

-- 7. VERIFICACIÓN FINAL
SELECT '=== USUARIOS ESPECIALES ===' as info;
SELECT username, password, nombre, rol, activo FROM usuarios ORDER BY username;

SELECT '=== SUPERVISORES ===' as info;
SELECT usuario, password, nombre, activo FROM supervisores ORDER BY usuario;

SELECT '=== UBICACIONES GPS ===' as info;
SELECT 
    COALESCE(u.username, s.usuario) as usuario,
    COUNT(*) as total_ubicaciones,
    MIN(ug.timestamp_entrada) as primera_ubicacion,
    MAX(ug.timestamp_entrada) as ultima_ubicacion
FROM ubicaciones_gps ug
LEFT JOIN usuarios u ON ug.usuario_id = u.id
LEFT JOIN supervisores s ON ug.usuario_id = s.id
GROUP BY COALESCE(u.username, s.usuario)
ORDER BY usuario;

-- 8. MENSAJE FINAL
SELECT '✅ SCRIPT COMPLETADO - Todos los usuarios y datos simulados han sido creados' as resultado;
