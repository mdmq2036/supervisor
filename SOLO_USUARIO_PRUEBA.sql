-- ========================================
-- SCRIPT SOLO PARA USUARIO PRUEBA
-- ========================================
-- Ejecutar en Supabase SQL Editor
-- ========================================

-- PASO 1: Crear tabla device_tracking (si no existe)
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

-- PASO 2: Crear índices
CREATE INDEX IF NOT EXISTS idx_device_tracking_usuario ON device_tracking(usuario);
CREATE INDEX IF NOT EXISTS idx_device_tracking_fingerprint ON device_tracking(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_device_tracking_blocked ON device_tracking(blocked);

-- PASO 3: Crear usuario PRUEBA
INSERT INTO supervisores (usuario, password, nombre, activo)
VALUES ('prueba', 'prueba2025', 'Usuario Prueba', true)
ON CONFLICT (usuario) DO UPDATE
SET password = 'prueba2025', nombre = 'Usuario Prueba', activo = true;

-- PASO 4: Verificar que se creó
SELECT id, usuario, password, nombre, activo
FROM supervisores
WHERE usuario = 'prueba';

-- ========================================
-- RESULTADO ESPERADO:
-- ========================================
-- id | usuario | password   | nombre         | activo
-- ---|---------|------------|----------------|-------
-- X  | prueba  | prueba2025 | Usuario Prueba | true
-- ========================================

-- ========================================
-- CARACTERÍSTICAS DEL USUARIO PRUEBA:
-- ========================================
-- ✅ Puede ver TODOS los registros de TODOS los supervisores
-- ✅ Puede ver TODAS las cuentas contrato
-- ✅ Puede registrar y modificar inspecciones
-- ⚠️ Límite: 5 logins por dispositivo
-- 🔒 Bloqueo automático después del 5to login

-- ========================================
-- CONSULTAS ÚTILES:
-- ========================================

-- Ver dispositivos registrados para usuario prueba
-- SELECT
--     device_fingerprint,
--     login_count,
--     blocked,
--     first_login,
--     last_login
-- FROM device_tracking
-- WHERE usuario = 'prueba'
-- ORDER BY last_login DESC;

-- Ver estadísticas
-- SELECT
--     COUNT(*) as total_dispositivos,
--     SUM(CASE WHEN blocked THEN 1 ELSE 0 END) as bloqueados,
--     SUM(CASE WHEN NOT blocked THEN 1 ELSE 0 END) as activos,
--     SUM(login_count) as total_logins
-- FROM device_tracking
-- WHERE usuario = 'prueba';

-- Resetear un dispositivo específico
-- UPDATE device_tracking
-- SET login_count = 0, blocked = false
-- WHERE usuario = 'prueba' AND device_fingerprint = 'FINGERPRINT_AQUI';

-- Resetear TODOS los dispositivos
-- UPDATE device_tracking
-- SET login_count = 0, blocked = false
-- WHERE usuario = 'prueba';

-- Eliminar historial completo
-- DELETE FROM device_tracking WHERE usuario = 'prueba';

-- ========================================
-- CREDENCIALES PARA PROBAR:
-- ========================================
-- Usuario: prueba
-- Contraseña: prueba2025
-- URL: https://supervisor-ohtd.onrender.com
-- ========================================
