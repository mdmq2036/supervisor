-- =====================================================
-- SCRIPT PARA AGREGAR FUNCIONALIDAD DE GEOLOCALIZACIÓN
-- Sistema de Rastreo de Ubicación y Tiempo de Permanencia
-- =====================================================

-- PASO 1: Crear tabla de auditoría de ubicaciones
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
    actividad_realizada VARCHAR(255), -- 'registro', 'consulta', 'reporte', etc.
    cuenta_contrato VARCHAR(100), -- Si está relacionado con una inspección específica
    ip_address VARCHAR(50),
    user_agent TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- PASO 2: Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON auditoria_ubicaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_device ON auditoria_ubicaciones(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_auditoria_timestamp ON auditoria_ubicaciones(timestamp_entrada);
CREATE INDEX IF NOT EXISTS idx_auditoria_ubicacion ON auditoria_ubicaciones(latitud, longitud);
CREATE INDEX IF NOT EXISTS idx_auditoria_cuenta ON auditoria_ubicaciones(cuenta_contrato);

-- PASO 3: Agregar campos de geolocalización a la tabla de inspecciones (si no existen)
ALTER TABLE inspecciones 
ADD COLUMN IF NOT EXISTS latitud_registro DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitud_registro DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS precision_gps DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS timestamp_gps TIMESTAMP;

-- PASO 4: Crear función para calcular duración de permanencia
CREATE OR REPLACE FUNCTION calcular_duracion_permanencia()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.timestamp_salida IS NOT NULL AND OLD.timestamp_salida IS NULL THEN
        NEW.duracion_minutos := EXTRACT(EPOCH FROM (NEW.timestamp_salida - NEW.timestamp_entrada)) / 60;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- PASO 5: Crear trigger para calcular duración automáticamente
DROP TRIGGER IF EXISTS trigger_calcular_duracion ON auditoria_ubicaciones;
CREATE TRIGGER trigger_calcular_duracion
    BEFORE UPDATE ON auditoria_ubicaciones
    FOR EACH ROW
    EXECUTE FUNCTION calcular_duracion_permanencia();

-- PASO 6: Crear vista para análisis de ubicaciones
CREATE OR REPLACE VIEW v_analisis_ubicaciones AS
SELECT 
    au.id,
    u.username,
    u.nombre,
    au.device_type,
    au.latitud,
    au.longitud,
    au.precision_metros,
    au.timestamp_entrada,
    au.timestamp_salida,
    au.duracion_minutos,
    au.actividad_realizada,
    au.cuenta_contrato,
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

-- PASO 7: Crear función para obtener historial de ubicaciones de un usuario
CREATE OR REPLACE FUNCTION obtener_historial_ubicaciones(
    p_usuario_id INTEGER,
    p_fecha_inicio TIMESTAMP DEFAULT NULL,
    p_fecha_fin TIMESTAMP DEFAULT NULL
)
RETURNS TABLE (
    id INTEGER,
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    timestamp_entrada TIMESTAMP,
    timestamp_salida TIMESTAMP,
    duracion_minutos INTEGER,
    actividad VARCHAR(255),
    cuenta_contrato VARCHAR(100)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        au.id,
        au.latitud,
        au.longitud,
        au.timestamp_entrada,
        au.timestamp_salida,
        au.duracion_minutos,
        au.actividad_realizada,
        au.cuenta_contrato
    FROM auditoria_ubicaciones au
    WHERE au.usuario_id = p_usuario_id
        AND (p_fecha_inicio IS NULL OR au.timestamp_entrada >= p_fecha_inicio)
        AND (p_fecha_fin IS NULL OR au.timestamp_entrada <= p_fecha_fin)
    ORDER BY au.timestamp_entrada DESC;
END;
$$ LANGUAGE plpgsql;

-- PASO 8: Crear función para registrar entrada de ubicación
CREATE OR REPLACE FUNCTION registrar_entrada_ubicacion(
    p_usuario_id INTEGER,
    p_device_fingerprint TEXT,
    p_device_type VARCHAR(50),
    p_latitud DECIMAL(10, 8),
    p_longitud DECIMAL(11, 8),
    p_precision DECIMAL(10, 2),
    p_actividad VARCHAR(255) DEFAULT NULL,
    p_cuenta_contrato VARCHAR(100) DEFAULT NULL,
    p_ip_address VARCHAR(50) DEFAULT NULL,
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
        p_ip_address,
        p_user_agent
    )
    RETURNING id INTO v_id;
    
    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- PASO 9: Crear función para registrar salida de ubicación
CREATE OR REPLACE FUNCTION registrar_salida_ubicacion(
    p_auditoria_id INTEGER
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE auditoria_ubicaciones
    SET timestamp_salida = CURRENT_TIMESTAMP
    WHERE id = p_auditoria_id
        AND timestamp_salida IS NULL;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- PASO 10: Crear vista de resumen por usuario
CREATE OR REPLACE VIEW v_resumen_ubicaciones_usuario AS
SELECT 
    u.id as usuario_id,
    u.username,
    u.nombre,
    COUNT(au.id) as total_registros,
    COUNT(DISTINCT DATE(au.timestamp_entrada)) as dias_activos,
    AVG(au.duracion_minutos) as promedio_duracion_minutos,
    SUM(au.duracion_minutos) as total_minutos,
    MIN(au.timestamp_entrada) as primera_actividad,
    MAX(au.timestamp_entrada) as ultima_actividad
FROM usuarios u
LEFT JOIN auditoria_ubicaciones au ON u.id = au.usuario_id
GROUP BY u.id, u.username, u.nombre;

-- PASO 11: Comentarios descriptivos
COMMENT ON TABLE auditoria_ubicaciones IS 'Registro de ubicaciones GPS y tiempo de permanencia de usuarios';
COMMENT ON COLUMN auditoria_ubicaciones.device_type IS 'Tipo de dispositivo: mobile o desktop';
COMMENT ON COLUMN auditoria_ubicaciones.precision_metros IS 'Precisión del GPS en metros';
COMMENT ON COLUMN auditoria_ubicaciones.duracion_minutos IS 'Tiempo de permanencia calculado automáticamente';
COMMENT ON COLUMN auditoria_ubicaciones.actividad_realizada IS 'Actividad que estaba realizando: registro, consulta, reporte, etc.';

-- PASO 12: Verificar creación
SELECT 'TABLA CREADA:' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'auditoria_ubicaciones';

SELECT 'FUNCIONES CREADAS:' as status;
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%ubicacion%';

SELECT '✅ SCRIPT DE GEOLOCALIZACIÓN EJECUTADO EXITOSAMENTE' as resultado;
