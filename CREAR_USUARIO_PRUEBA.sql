-- ========================================
-- CREAR USUARIO DE PRUEBA CON LÍMITE DE 5 INGRESOS
-- ========================================

-- PASO 1: Crear tabla para tracking de dispositivos
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

-- PASO 2: Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_device_tracking_usuario ON device_tracking(usuario);
CREATE INDEX IF NOT EXISTS idx_device_tracking_fingerprint ON device_tracking(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_device_tracking_blocked ON device_tracking(blocked);

-- PASO 3: Insertar usuario "prueba" en tabla supervisores
INSERT INTO supervisores (usuario, password, nombre, activo)
VALUES ('prueba', 'prueba2025', 'Usuario Prueba', true)
ON CONFLICT (usuario) DO UPDATE
SET password = 'prueba2025',
    nombre = 'Usuario Prueba',
    activo = true;

-- PASO 4: Verificar que se creó
SELECT id, usuario, nombre, activo
FROM supervisores
WHERE usuario = 'prueba';

-- ========================================
-- FUNCIONALIDAD:
-- ========================================
-- 1. Usuario "prueba" puede ver TODOS los registros
-- 2. Puede registrar y modificar inspecciones
-- 3. Máximo 5 logins por dispositivo
-- 4. Después del 5to login, el dispositivo se bloquea
-- 5. Fingerprint basado en: navegador, OS, resolución, plugins
-- ========================================

-- ========================================
-- CONSULTAS ÚTILES:
-- ========================================

-- Ver dispositivos registrados para usuario prueba
SELECT
    device_fingerprint,
    login_count,
    blocked,
    first_login,
    last_login,
    user_agent
FROM device_tracking
WHERE usuario = 'prueba'
ORDER BY last_login DESC;

-- Ver total de dispositivos bloqueados
SELECT
    COUNT(*) as total_dispositivos,
    SUM(CASE WHEN blocked THEN 1 ELSE 0 END) as dispositivos_bloqueados,
    SUM(CASE WHEN NOT blocked THEN 1 ELSE 0 END) as dispositivos_activos
FROM device_tracking
WHERE usuario = 'prueba';

-- Resetear un dispositivo específico (SI ES NECESARIO)
-- UPDATE device_tracking
-- SET login_count = 0, blocked = false
-- WHERE usuario = 'prueba' AND device_fingerprint = 'FINGERPRINT_AQUI';

-- Resetear TODOS los dispositivos de prueba (SI ES NECESARIO)
-- UPDATE device_tracking
-- SET login_count = 0, blocked = false
-- WHERE usuario = 'prueba';

-- Eliminar todos los registros de tracking (RESET COMPLETO)
-- DELETE FROM device_tracking WHERE usuario = 'prueba';

-- ========================================
-- NOTAS IMPORTANTES:
-- ========================================
-- 1. El fingerprint se genera con navegador + OS + resolución + canvas
-- 2. Cambiar navegador = nuevo dispositivo (5 ingresos más)
-- 3. Limpiar caché NO cambia el fingerprint
-- 4. Modo incógnito puede generar nuevo fingerprint
-- 5. Diferentes usuarios en mismo PC = diferentes fingerprints
-- ========================================
