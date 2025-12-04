-- Script para insertar datos de prueba en ubicaciones_gps
-- Asegurarse de que la tabla existe y tiene la estructura correcta

-- Primero, verificar si hay datos
SELECT COUNT(*) as total_ubicaciones FROM ubicaciones_gps;

-- Insertar ubicaciones de prueba para el usuario admin
-- Nota: Necesitamos el ID del usuario admin primero
DO $$
DECLARE
    admin_id UUID;
BEGIN
    -- Obtener ID del usuario admin
    SELECT id INTO admin_id FROM usuarios WHERE username = 'admin' LIMIT 1;
    
    IF admin_id IS NOT NULL THEN
        -- Insertar 5 ubicaciones de prueba en Lima, Perú
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
            cuenta_contrato
        ) VALUES
        (admin_id, 'test-device-1', 'desktop', -12.0464, -77.0428, 10.0, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 30 minutes', 30, 'Prueba de Sistema', 'TEST-001'),
        (admin_id, 'test-device-1', 'desktop', -12.0500, -77.0450, 15.0, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '30 minutes', 30, 'Inspección', 'TEST-002'),
        (admin_id, 'test-device-1', 'mobile', -12.0520, -77.0470, 20.0, NOW() - INTERVAL '30 minutes', NULL, NULL, 'En curso', 'TEST-003'),
        (admin_id, 'test-device-2', 'mobile', -12.0480, -77.0440, 12.0, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours 15 minutes', 45, 'Supervisión', 'TEST-004'),
        (admin_id, 'test-device-1', 'desktop', -12.0550, -77.0500, 18.0, NOW() - INTERVAL '5 hours', NOW() - INTERVAL '4 hours', 60, 'Registro', 'TEST-005');
        
        RAISE NOTICE 'Datos de prueba insertados correctamente para usuario admin';
    ELSE
        RAISE NOTICE 'Usuario admin no encontrado';
    END IF;
END $$;

-- Verificar los datos insertados
SELECT 
    u.username,
    ug.device_type,
    ug.latitud,
    ug.longitud,
    ug.timestamp_entrada,
    ug.actividad_realizada,
    ug.cuenta_contrato
FROM ubicaciones_gps ug
LEFT JOIN usuarios u ON ug.usuario_id = u.id
ORDER BY ug.timestamp_entrada DESC
LIMIT 10;
