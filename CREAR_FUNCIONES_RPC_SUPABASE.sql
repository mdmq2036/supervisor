-- =====================================================
-- CREAR FUNCIONES RPC PARA GEOLOCALIZACIÓN
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- FUNCIÓN 1: Registrar entrada de ubicación
CREATE OR REPLACE FUNCTION registrar_entrada_ubicacion(
    p_usuario_id INTEGER,
    p_device_fingerprint TEXT,
    p_device_type VARCHAR(50),
    p_latitud DECIMAL(10, 8),
    p_longitud DECIMAL(11, 8),
    p_precision DECIMAL(10, 2),
    p_actividad VARCHAR(255),
    p_cuenta_contrato VARCHAR(100),
    p_ip TEXT,
    p_user_agent TEXT
)
RETURNS INTEGER AS $$
DECLARE
    v_session_id INTEGER;
BEGIN
    INSERT INTO auditoria_ubicaciones (
        usuario_id,
        device_fingerprint,
        device_type,
        latitud,
        longitud,
        precision_metros,
        timestamp_entrada,
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
        NOW(),
        p_actividad,
        p_cuenta_contrato,
        p_ip,
        p_user_agent
    )
    RETURNING id INTO v_session_id;

    RETURN v_session_id;
END;
$$ LANGUAGE plpgsql;

-- FUNCIÓN 2: Registrar salida de ubicación
CREATE OR REPLACE FUNCTION registrar_salida_ubicacion(
    p_session_id INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    v_entrada TIMESTAMP;
    v_duracion INTEGER;
BEGIN
    -- Obtener timestamp de entrada
    SELECT timestamp_entrada INTO v_entrada
    FROM auditoria_ubicaciones
    WHERE id = p_session_id;

    -- Calcular duración en minutos
    v_duracion := EXTRACT(EPOCH FROM (NOW() - v_entrada)) / 60;

    -- Actualizar registro
    UPDATE auditoria_ubicaciones
    SET
        timestamp_salida = NOW(),
        duracion_minutos = v_duracion
    WHERE id = p_session_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Verificar que las funciones se crearon
SELECT
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('registrar_entrada_ubicacion', 'registrar_salida_ubicacion')
ORDER BY routine_name;

-- Mensaje de confirmación
SELECT '✅ Funciones RPC creadas exitosamente' as resultado;
SELECT '📍 registrar_entrada_ubicacion() - Guarda ubicación al conectarse' as info1;
SELECT '🚪 registrar_salida_ubicacion() - Registra salida y calcula duración' as info2;
