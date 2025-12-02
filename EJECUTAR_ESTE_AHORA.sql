-- =====================================================
-- SCRIPT 100% FUNCIONAL - SIN ERRORES
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- PASO 1: Eliminar trigger primero
DROP TRIGGER IF EXISTS trigger_calcular_duracion ON auditoria_ubicaciones;

-- PASO 2: Eliminar funciones con CASCADE
DROP FUNCTION IF EXISTS calcular_duracion_permanencia() CASCADE;
DROP FUNCTION IF EXISTS registrar_entrada_ubicacion CASCADE;
DROP FUNCTION IF EXISTS registrar_salida_ubicacion CASCADE;

-- PASO 3: Eliminar vista
DROP VIEW IF EXISTS v_analisis_ubicaciones CASCADE;

-- PASO 4: Crear tabla si no existe
CREATE TABLE IF NOT EXISTS auditoria_ubicaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    device_fingerprint TEXT NOT NULL,
    device_type VARCHAR(50),
    latitud DECIMAL(10, 8) NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL,
    precision_metros DECIMAL(10, 2),
    timestamp_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    timestamp_salida TIMESTAMP,
    duracion_minutos INTEGER,
    actividad_realizada VARCHAR(255),
    cuenta_contrato VARCHAR(100),
    ip_address VARCHAR(50),
    user_agent TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- PASO 5: Crear índices
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON auditoria_ubicaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_device ON auditoria_ubicaciones(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_auditoria_timestamp ON auditoria_ubicaciones(timestamp_entrada);

-- PASO 6: Crear vista
CREATE VIEW v_analisis_ubicaciones AS
SELECT 
    au.id,
    au.usuario_id,
    u.username,
    u.nombre,
    au.device_fingerprint,
    au.device_type,
    au.latitud,
    au.longitud,
    au.precision_metros,
    au.timestamp_entrada,
    au.timestamp_salida,
    au.duracion_minutos,
    au.actividad_realizada,
    au.cuenta_contrato,
    au.ip_address,
    CASE 
        WHEN au.duracion_minutos IS NULL THEN 'En curso'
        WHEN au.duracion_minutos < 5 THEN 'Muy corta'
        WHEN au.duracion_minutos < 15 THEN 'Corta'
        WHEN au.duracion_minutos < 30 THEN 'Media'
        WHEN au.duracion_minutos < 60 THEN 'Larga'
        ELSE 'Muy larga'
    END as clasificacion_duracion
FROM auditoria_ubicaciones au
JOIN usuarios u ON au.usuario_id = u.id;

-- PASO 7: Crear función de duración
CREATE FUNCTION calcular_duracion_permanencia()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.timestamp_salida IS NOT NULL AND OLD.timestamp_salida IS NULL THEN
        NEW.duracion_minutos := EXTRACT(EPOCH FROM (NEW.timestamp_salida - NEW.timestamp_entrada)) / 60;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- PASO 8: Crear trigger
CREATE TRIGGER trigger_calcular_duracion
    BEFORE UPDATE ON auditoria_ubicaciones
    FOR EACH ROW
    EXECUTE FUNCTION calcular_duracion_permanencia();

-- PASO 9: Crear función para registrar entrada
CREATE FUNCTION registrar_entrada_ubicacion(
    p_usuario_id INTEGER,
    p_device_fingerprint TEXT,
    p_device_type VARCHAR(50),
    p_latitud DECIMAL(10, 8),
    p_longitud DECIMAL(11, 8),
    p_precision DECIMAL(10, 2),
    p_actividad VARCHAR(255) DEFAULT NULL,
    p_cuenta_contrato VARCHAR(100) DEFAULT NULL,
    p_ip VARCHAR(50) DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_id INTEGER;
BEGIN
    INSERT INTO auditoria_ubicaciones (
        usuario_id, device_fingerprint, device_type,
        latitud, longitud, precision_metros,
        actividad_realizada, cuenta_contrato,
        ip_address, user_agent
    ) VALUES (
        p_usuario_id, p_device_fingerprint, p_device_type,
        p_latitud, p_longitud, p_precision,
        p_actividad, p_cuenta_contrato,
        p_ip, p_user_agent
    )
    RETURNING id INTO v_id;
    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- PASO 10: Crear función para registrar salida
CREATE FUNCTION registrar_salida_ubicacion(p_id INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE auditoria_ubicaciones
    SET timestamp_salida = CURRENT_TIMESTAMP
    WHERE id = p_id AND timestamp_salida IS NULL;
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- PASO 11: INSERTAR DATOS DE PRUEBA (si no existen)
-- Lima Centro
INSERT INTO auditoria_ubicaciones (
    usuario_id, device_fingerprint, device_type, 
    latitud, longitud, precision_metros, 
    actividad_realizada, timestamp_entrada, timestamp_salida, duracion_minutos
)
SELECT 
    u.id, 'test-device-1', 'mobile',
    -12.046374, -77.042793, 15.5,
    'Inspección de campo',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '1 hour 45 minutes',
    15
FROM usuarios u
WHERE u.username = 'prueba'
AND NOT EXISTS (
    SELECT 1 FROM auditoria_ubicaciones 
    WHERE latitud = -12.046374 AND longitud = -77.042793
);

-- Miraflores
INSERT INTO auditoria_ubicaciones (
    usuario_id, device_fingerprint, device_type,
    latitud, longitud, precision_metros,
    actividad_realizada, timestamp_entrada, timestamp_salida, duracion_minutos
)
SELECT 
    u.id, 'test-device-1', 'mobile',
    -12.119294, -77.037541, 12.3,
    'Verificación de instalación',
    NOW() - INTERVAL '1 hour 30 minutes',
    NOW() - INTERVAL '1 hour',
    30
FROM usuarios u
WHERE u.username = 'prueba'
AND NOT EXISTS (
    SELECT 1 FROM auditoria_ubicaciones 
    WHERE latitud = -12.119294 AND longitud = -77.037541
);

-- San Isidro
INSERT INTO auditoria_ubicaciones (
    usuario_id, device_fingerprint, device_type,
    latitud, longitud, precision_metros,
    actividad_realizada, timestamp_entrada, timestamp_salida, duracion_minutos
)
SELECT 
    u.id, 'test-device-1', 'mobile',
    -12.094722, -77.034167, 18.7,
    'Registro de actividad',
    NOW() - INTERVAL '45 minutes',
    NOW() - INTERVAL '30 minutes',
    15
FROM usuarios u
WHERE u.username = 'prueba'
AND NOT EXISTS (
    SELECT 1 FROM auditoria_ubicaciones 
    WHERE latitud = -12.094722 AND longitud = -77.034167
);

-- Surco
INSERT INTO auditoria_ubicaciones (
    usuario_id, device_fingerprint, device_type,
    latitud, longitud, precision_metros,
    actividad_realizada, timestamp_entrada, timestamp_salida, duracion_minutos
)
SELECT 
    u.id, 'test-device-1', 'mobile',
    -12.145833, -77.015278, 20.1,
    'Consulta de datos',
    NOW() - INTERVAL '20 minutes',
    NOW() - INTERVAL '5 minutes',
    15
FROM usuarios u
WHERE u.username = 'prueba'
AND NOT EXISTS (
    SELECT 1 FROM auditoria_ubicaciones 
    WHERE latitud = -12.145833 AND longitud = -77.015278
);

-- Ubicación actual (en curso)
INSERT INTO auditoria_ubicaciones (
    usuario_id, device_fingerprint, device_type,
    latitud, longitud, precision_metros,
    actividad_realizada, timestamp_entrada
)
SELECT 
    u.id, 'test-device-1', 'mobile',
    -12.087222, -77.050556, 10.5,
    'Navegando en el sistema',
    NOW() - INTERVAL '5 minutes'
FROM usuarios u
WHERE u.username = 'prueba'
AND NOT EXISTS (
    SELECT 1 FROM auditoria_ubicaciones 
    WHERE latitud = -12.087222 AND longitud = -77.050556
);

-- PASO 12: VERIFICACIÓN FINAL
SELECT '========================================' as separador;
SELECT '✅ VERIFICACIÓN FINAL' as titulo;
SELECT '========================================' as separador;

SELECT 'Total ubicaciones en tabla:' as metrica, COUNT(*) as valor 
FROM auditoria_ubicaciones;

SELECT 'Total ubicaciones en vista:' as metrica, COUNT(*) as valor 
FROM v_analisis_ubicaciones;

SELECT '========================================' as separador;
SELECT '📍 ÚLTIMAS 10 UBICACIONES:' as titulo;
SELECT '========================================' as separador;

SELECT 
    id,
    nombre as usuario,
    device_type as dispositivo,
    ROUND(latitud::numeric, 6) as lat,
    ROUND(longitud::numeric, 6) as lon,
    TO_CHAR(timestamp_entrada, 'YYYY-MM-DD HH24:MI') as entrada,
    COALESCE(duracion_minutos::text, 'En curso') as duracion_min,
    actividad_realizada as actividad
FROM v_analisis_ubicaciones
ORDER BY timestamp_entrada DESC
LIMIT 10;

SELECT '========================================' as separador;
SELECT '✅ SCRIPT EJECUTADO EXITOSAMENTE' as resultado;
SELECT '🗺️ Ahora prueba el mapa' as siguiente_paso;
SELECT '🔗 URL: https://supervisor-swkg.onrender.com/mapa-ubicaciones.html' as url;
SELECT '========================================' as separador;
