-- =====================================================
-- SOLUCIÓN COMPLETA PARA MAPA DE UBICACIONES - CORREGIDA
-- Ejecutar este script en Supabase SQL Editor
-- =====================================================

-- PASO 1: Verificar que existe la tabla auditoria_ubicaciones
CREATE TABLE IF NOT EXISTS auditoria_ubicaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    device_fingerprint TEXT NOT NULL,
    device_type VARCHAR(50), -- 'mobile' o 'desktop'
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

-- PASO 2: Crear índices
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON auditoria_ubicaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_device ON auditoria_ubicaciones(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_auditoria_timestamp ON auditoria_ubicaciones(timestamp_entrada);
CREATE INDEX IF NOT EXISTS idx_auditoria_ubicacion ON auditoria_ubicaciones(latitud, longitud);

-- PASO 3: Crear función para calcular duración
CREATE OR REPLACE FUNCTION calcular_duracion_permanencia()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.timestamp_salida IS NOT NULL AND OLD.timestamp_salida IS NULL THEN
        NEW.duracion_minutos := EXTRACT(EPOCH FROM (NEW.timestamp_salida - NEW.timestamp_entrada)) / 60;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- PASO 4: Crear trigger
DROP TRIGGER IF EXISTS trigger_calcular_duracion ON auditoria_ubicaciones;
CREATE TRIGGER trigger_calcular_duracion
    BEFORE UPDATE ON auditoria_ubicaciones
    FOR EACH ROW
    EXECUTE FUNCTION calcular_duracion_permanencia();

-- PASO 5: ELIMINAR la vista existente antes de recrearla
DROP VIEW IF EXISTS v_analisis_ubicaciones CASCADE;

-- PASO 6: Crear vista de análisis (NUEVA ESTRUCTURA)
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
JOIN usuarios u ON au.usuario_id = u.id
ORDER BY au.timestamp_entrada DESC;

-- PASO 7: Crear función para registrar entrada de ubicación
CREATE OR REPLACE FUNCTION registrar_entrada_ubicacion(
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
        usuario_id,
        device_fingerprint,
        device_type,
        latitud,
        longitud,
        precision_metros,
        actividad_realizada,
        cuenta_contrato,
        ip_address,
        user_agent
    ) VALUES (
        p_usuario_id,
        p_device_fingerprint,
        p_device_type,
        p_latitud,
        p_longitud,
        p_precision,
        p_actividad,
        p_cuenta_contrato,
        p_ip,
        p_user_agent
    )
    RETURNING id INTO v_id;
    
    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- PASO 8: Crear función para registrar salida
CREATE OR REPLACE FUNCTION registrar_salida_ubicacion(
    p_id INTEGER
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE auditoria_ubicaciones
    SET timestamp_salida = CURRENT_TIMESTAMP
    WHERE id = p_id
        AND timestamp_salida IS NULL;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- PASO 9: Insertar datos de prueba (si no existen ubicaciones)
DO $$
DECLARE
    v_usuario_id INTEGER;
    v_count INTEGER;
BEGIN
    -- Obtener ID del usuario prueba
    SELECT id INTO v_usuario_id FROM usuarios WHERE username = 'prueba' LIMIT 1;
    
    -- Verificar si ya hay ubicaciones
    SELECT COUNT(*) INTO v_count FROM auditoria_ubicaciones;
    
    -- Si no hay ubicaciones y existe el usuario prueba, insertar datos de ejemplo
    IF v_count = 0 AND v_usuario_id IS NOT NULL THEN
        -- Lima Centro
        INSERT INTO auditoria_ubicaciones (usuario_id, device_fingerprint, device_type, latitud, longitud, precision_metros, actividad_realizada, timestamp_entrada, timestamp_salida, duracion_minutos)
        VALUES (v_usuario_id, 'test-device-1', 'mobile', -12.046374, -77.042793, 15.5, 'Inspección de campo', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 45 minutes', 15);
        
        -- Miraflores
        INSERT INTO auditoria_ubicaciones (usuario_id, device_fingerprint, device_type, latitud, longitud, precision_metros, actividad_realizada, timestamp_entrada, timestamp_salida, duracion_minutos)
        VALUES (v_usuario_id, 'test-device-1', 'mobile', -12.119294, -77.037541, 12.3, 'Verificación de instalación', NOW() - INTERVAL '1 hour 30 minutes', NOW() - INTERVAL '1 hour', 30);
        
        -- San Isidro
        INSERT INTO auditoria_ubicaciones (usuario_id, device_fingerprint, device_type, latitud, longitud, precision_metros, actividad_realizada, timestamp_entrada, timestamp_salida, duracion_minutos)
        VALUES (v_usuario_id, 'test-device-1', 'mobile', -12.094722, -77.034167, 18.7, 'Registro de actividad', NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '30 minutes', 15);
        
        -- Surco
        INSERT INTO auditoria_ubicaciones (usuario_id, device_fingerprint, device_type, latitud, longitud, precision_metros, actividad_realizada, timestamp_entrada, timestamp_salida, duracion_minutos)
        VALUES (v_usuario_id, 'test-device-1', 'mobile', -12.145833, -77.015278, 20.1, 'Consulta de datos', NOW() - INTERVAL '20 minutes', NOW() - INTERVAL '5 minutes', 15);
        
        -- Ubicación actual (en curso)
        INSERT INTO auditoria_ubicaciones (usuario_id, device_fingerprint, device_type, latitud, longitud, precision_metros, actividad_realizada, timestamp_entrada)
        VALUES (v_usuario_id, 'test-device-1', 'mobile', -12.087222, -77.050556, 10.5, 'Navegando en el sistema', NOW() - INTERVAL '5 minutes');
        
        RAISE NOTICE '✅ Se insertaron 5 ubicaciones de prueba';
    ELSE
        RAISE NOTICE 'ℹ️ Ya existen % ubicaciones en la base de datos', v_count;
    END IF;
END $$;

-- PASO 10: Verificar que todo funciona
SELECT '========================================' as separador;
SELECT '✅ VERIFICACIÓN DEL SISTEMA' as titulo;
SELECT '========================================' as separador;

-- Contar ubicaciones
SELECT 'TOTAL DE UBICACIONES:' as metrica, COUNT(*) as valor FROM auditoria_ubicaciones;

-- Verificar vista
SELECT 'UBICACIONES EN VISTA:' as metrica, COUNT(*) as valor FROM v_analisis_ubicaciones;

-- Mostrar últimas 5 ubicaciones
SELECT '========================================' as separador;
SELECT '📍 ÚLTIMAS 5 UBICACIONES REGISTRADAS:' as titulo;
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
LIMIT 5;

SELECT '========================================' as separador;
SELECT '✅ CONFIGURACIÓN COMPLETADA' as resultado;
SELECT '🗺️ El mapa ya debería mostrar las ubicaciones' as mensaje;
SELECT '========================================' as separador;
