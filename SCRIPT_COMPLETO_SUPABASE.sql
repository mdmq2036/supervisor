-- ========================================
-- SCRIPT COMPLETO PARA SUPABASE
-- Sistema DONET - Gestión de Inspecciones
-- ========================================
-- EJECUTAR TODO ESTE SCRIPT EN SUPABASE SQL EDITOR
-- ========================================

-- ========================================
-- PASO 1: CREAR TABLA DEVICE_TRACKING
-- ========================================
CREATE TABLE IF NOT EXISTS device_tracking (
    id BIGSERIAL PRIMARY KEY,
    usuario VARCHAR(50) NOT NULL,
    device_fingerprint TEXT NOT NULL,
    login_count INTEGER DEFAULT 0,
    blocked BOOLEAN DEFAULT false,
    first_login TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP DEFAULT NOW(),
    user_agent TEXT,
    ip_address TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(usuario, device_fingerprint)
);

-- ========================================
-- PASO 2: CREAR ÍNDICES
-- ========================================
CREATE INDEX IF NOT EXISTS idx_device_tracking_usuario ON device_tracking(usuario);
CREATE INDEX IF NOT EXISTS idx_device_tracking_fingerprint ON device_tracking(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_device_tracking_blocked ON device_tracking(blocked);

-- ========================================
-- PASO 3: CREAR/ACTUALIZAR USUARIOS SUPERVISORES
-- ========================================

-- Usuario DEMO (Administrador)
INSERT INTO supervisores (usuario, password, nombre, activo)
VALUES ('demo', 'demo123', 'Administrador Demo', true)
ON CONFLICT (usuario) DO UPDATE
SET password = 'demo123', nombre = 'Administrador Demo', activo = true;

-- Usuario MDONET (Administrador)
INSERT INTO supervisores (usuario, password, nombre, activo)
VALUES ('mdonet', 'mdonet123', 'Administrador DONET', true)
ON CONFLICT (usuario) DO UPDATE
SET password = 'mdonet123', nombre = 'Administrador DONET', activo = true;

-- Usuario PRUEBA (Ver todos los registros, máximo 5 logins por dispositivo)
INSERT INTO supervisores (usuario, password, nombre, activo)
VALUES ('prueba', 'prueba2025', 'Usuario Prueba', true)
ON CONFLICT (usuario) DO UPDATE
SET password = 'prueba2025', nombre = 'Usuario Prueba', activo = true;

-- Supervisores
INSERT INTO supervisores (usuario, password, nombre, activo)
VALUES
    ('carlos', '43803239', 'Carlos', true),
    ('wilmer', '46298703', 'Wilmer', true),
    ('marcelino', '9394061', 'Marcelino', true),
    ('manuel', '561773', 'Manuel', true),
    ('angelo', '76935270', 'Angelo', true)
ON CONFLICT (usuario) DO UPDATE
SET activo = true;

-- ========================================
-- PASO 4: ASIGNAR CONTRATOS A SUPERVISORES
-- ========================================
-- Este paso solo se ejecuta SI ya tienes datos cargados en la tabla inspecciones
-- Si aún NO has cargado el Excel, OMITE este paso

-- Carlos
UPDATE inspecciones
SET supervisor_id = (SELECT id FROM supervisores WHERE LOWER(nombre) = 'carlos' LIMIT 1)
WHERE LOWER(nombre_dni_inspector) LIKE '%carlos%'
  AND nombre_dni_inspector IS NOT NULL;

-- Wilmer
UPDATE inspecciones
SET supervisor_id = (SELECT id FROM supervisores WHERE LOWER(nombre) = 'wilmer' LIMIT 1)
WHERE LOWER(nombre_dni_inspector) LIKE '%wilmer%'
  AND nombre_dni_inspector IS NOT NULL;

-- Marcelino
UPDATE inspecciones
SET supervisor_id = (SELECT id FROM supervisores WHERE LOWER(nombre) = 'marcelino' LIMIT 1)
WHERE LOWER(nombre_dni_inspector) LIKE '%marcelino%'
  AND nombre_dni_inspector IS NOT NULL;

-- Manuel
UPDATE inspecciones
SET supervisor_id = (SELECT id FROM supervisores WHERE LOWER(nombre) = 'manuel' LIMIT 1)
WHERE LOWER(nombre_dni_inspector) LIKE '%manuel%'
  AND nombre_dni_inspector IS NOT NULL;

-- Angelo
UPDATE inspecciones
SET supervisor_id = (SELECT id FROM supervisores WHERE LOWER(nombre) = 'angelo' LIMIT 1)
WHERE LOWER(nombre_dni_inspector) LIKE '%angelo%'
  AND nombre_dni_inspector IS NOT NULL;

-- ========================================
-- PASO 5: VERIFICACIÓN
-- ========================================

-- Ver usuarios creados
SELECT id, usuario, nombre, activo
FROM supervisores
ORDER BY usuario;

-- Ver asignaciones de contratos (solo si ya cargaste datos)
SELECT
    s.usuario,
    s.nombre,
    COUNT(i.id) as total_contratos
FROM supervisores s
LEFT JOIN inspecciones i ON s.id = i.supervisor_id
GROUP BY s.id, s.usuario, s.nombre
ORDER BY s.usuario;

-- Ver dispositivos de prueba (si ya hubo logins)
SELECT
    usuario,
    device_fingerprint,
    login_count,
    blocked,
    last_login
FROM device_tracking
WHERE usuario = 'prueba'
ORDER BY last_login DESC;

-- ========================================
-- RESULTADO ESPERADO:
-- ========================================
--
-- USUARIOS CREADOS:
-- - demo (demo123) - Administrador
-- - mdonet (mdonet123) - Administrador
-- - prueba (prueba2025) - Usuario prueba con límite de 5 logins
-- - carlos (43803239) - Supervisor
-- - wilmer (46298703) - Supervisor
-- - marcelino (9394061) - Supervisor
-- - manuel (561773) - Supervisor
-- - angelo (76935270) - Supervisor
--
-- TABLA device_tracking: Creada y lista
-- ÍNDICES: Creados
--
-- ========================================

-- ========================================
-- CONSULTAS ÚTILES PARA ADMINISTRACIÓN:
-- ========================================

-- Resetear dispositivos de usuario prueba
-- UPDATE device_tracking SET login_count = 0, blocked = false WHERE usuario = 'prueba';

-- Ver inspectores sin asignar
-- SELECT DISTINCT nombre_dni_inspector, COUNT(*) as total
-- FROM inspecciones
-- WHERE supervisor_id IS NULL
-- GROUP BY nombre_dni_inspector;

-- Ver total de inspecciones
-- SELECT COUNT(*) as total FROM inspecciones;

-- Ver inspecciones asignadas vs sin asignar
-- SELECT
--     CASE WHEN supervisor_id IS NULL THEN 'Sin asignar' ELSE 'Asignado' END as estado,
--     COUNT(*) as total
-- FROM inspecciones
-- GROUP BY estado;
