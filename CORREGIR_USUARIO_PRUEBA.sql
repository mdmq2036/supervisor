-- ========================================
-- DIAGNÓSTICO Y CORRECCIÓN - USUARIO PRUEBA
-- ========================================
-- Ejecutar en Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/bvqmaaxtaetebjsgdphj/sql/new
-- ========================================

-- ========================================
-- PASO 1: VERIFICAR SI EXISTE EL USUARIO
-- ========================================
SELECT id, usuario, password, nombre, activo
FROM supervisores
WHERE usuario = 'prueba';

-- Si no aparece nada, el usuario NO existe
-- Si aparece, verificar que password = 'prueba2025' y activo = true

-- ========================================
-- PASO 2: ELIMINAR USUARIO SI EXISTE (para empezar limpio)
-- ========================================
DELETE FROM supervisores WHERE usuario = 'prueba';

-- ========================================
-- PASO 3: CREAR USUARIO PRUEBA DESDE CERO
-- ========================================
INSERT INTO supervisores (usuario, password, nombre, activo)
VALUES ('prueba', 'prueba2025', 'Usuario Prueba', true);

-- ========================================
-- PASO 4: VERIFICAR QUE SE CREÓ CORRECTAMENTE
-- ========================================
SELECT id, usuario, password, nombre, activo
FROM supervisores
WHERE usuario = 'prueba';

-- RESULTADO ESPERADO:
-- id | usuario | password   | nombre         | activo
-- ---|---------|------------|----------------|-------
-- X  | prueba  | prueba2025 | Usuario Prueba | true

-- ========================================
-- PASO 5: CREAR TABLA DEVICE_TRACKING (si no existe)
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
-- PASO 6: CREAR ÍNDICES
-- ========================================
CREATE INDEX IF NOT EXISTS idx_device_tracking_usuario ON device_tracking(usuario);
CREATE INDEX IF NOT EXISTS idx_device_tracking_fingerprint ON device_tracking(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_device_tracking_blocked ON device_tracking(blocked);

-- ========================================
-- PASO 7: LIMPIAR DISPOSITIVOS BLOQUEADOS (opcional)
-- ========================================
-- Si quieres resetear los dispositivos bloqueados:
DELETE FROM device_tracking WHERE usuario = 'prueba';

-- O solo desbloquear sin eliminar historial:
-- UPDATE device_tracking
-- SET login_count = 0, blocked = false
-- WHERE usuario = 'prueba';

-- ========================================
-- PASO 8: VERIFICACIÓN FINAL
-- ========================================

-- Verificar usuario
SELECT 'Usuario prueba' as verificacion,
       CASE
         WHEN COUNT(*) = 1 THEN '✅ EXISTE'
         ELSE '❌ NO EXISTE'
       END as estado
FROM supervisores
WHERE usuario = 'prueba'
  AND password = 'prueba2025'
  AND activo = true;

-- Verificar tabla device_tracking
SELECT 'Tabla device_tracking' as verificacion,
       CASE
         WHEN EXISTS (
           SELECT FROM information_schema.tables
           WHERE table_name = 'device_tracking'
         ) THEN '✅ EXISTE'
         ELSE '❌ NO EXISTE'
       END as estado;

-- Ver todos los usuarios activos
SELECT usuario, nombre, activo
FROM supervisores
WHERE activo = true
ORDER BY usuario;

-- ========================================
-- CREDENCIALES PARA PROBAR:
-- ========================================
-- Usuario: prueba
-- Contraseña: prueba2025
-- URL: https://supervisor-ohtd.onrender.com
-- ========================================

-- ========================================
-- SI SIGUE SIN FUNCIONAR:
-- ========================================
-- 1. Verificar que la tabla supervisores existe:
--    SELECT * FROM information_schema.tables WHERE table_name = 'supervisores';
--
-- 2. Ver estructura de la tabla:
--    SELECT column_name, data_type
--    FROM information_schema.columns
--    WHERE table_name = 'supervisores';
--
-- 3. Ver TODOS los usuarios:
--    SELECT * FROM supervisores;
-- ========================================
