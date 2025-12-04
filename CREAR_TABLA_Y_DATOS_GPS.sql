-- =====================================================
-- SCRIPT COMPLETO: CREAR TABLA ubicaciones_gps E INSERTAR DATOS DE PRUEBA
-- =====================================================

-- PASO 1: Crear la tabla ubicaciones_gps si no existe
CREATE TABLE IF NOT EXISTS ubicaciones_gps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID,
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

-- PASO 2: Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_ubicaciones_usuario ON ubicaciones_gps(usuario_id);
CREATE INDEX IF NOT EXISTS idx_ubicaciones_timestamp ON ubicaciones_gps(timestamp_entrada);
CREATE INDEX IF NOT EXISTS idx_ubicaciones_contrato ON ubicaciones_gps(cuenta_contrato);

-- PASO 3: Verificar si hay datos
SELECT COUNT(*) as total_ubicaciones FROM ubicaciones_gps;

-- PASO 4: Insertar ubicaciones de prueba para el usuario admin
DO $$
DECLARE
    admin_id UUID;
    prueba_id UUID;
BEGIN
    -- Obtener ID del usuario admin
    SELECT id INTO admin_id FROM usuarios WHERE username = 'admin' LIMIT 1;
    
    -- Obtener ID del usuario prueba
    SELECT id INTO prueba_id FROM usuarios WHERE username = 'prueba' LIMIT 1;
    
    -- Insertar datos para admin si existe
    IF admin_id IS NOT NULL THEN
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
        (admin_id, 'test-admin-device-1', 'desktop', -12.0464, -77.0428, 10.0, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 30 minutes', 30, 'Prueba de Sistema', 'ADMIN-001'),
        (admin_id, 'test-admin-device-1', 'desktop', -12.0500, -77.0450, 15.0, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '30 minutes', 30, 'Inspección', 'ADMIN-002'),
        (admin_id, 'test-admin-device-1', 'mobile', -12.0520, -77.0470, 20.0, NOW() - INTERVAL '30 minutes', NULL, NULL, 'En curso', 'ADMIN-003'),
        (admin_id, 'test-admin-device-2', 'mobile', -12.0480, -77.0440, 12.0, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours 15 minutes', 45, 'Supervisión', 'ADMIN-004'),
        (admin_id, 'test-admin-device-1', 'desktop', -12.0550, -77.0500, 18.0, NOW() - INTERVAL '5 hours', NOW() - INTERVAL '4 hours', 60, 'Registro', 'ADMIN-005');
        
        RAISE NOTICE 'Datos de prueba insertados para usuario admin';
    ELSE
        RAISE NOTICE 'Usuario admin no encontrado';
    END IF;
    
    -- Insertar datos para prueba si existe
    IF prueba_id IS NOT NULL THEN
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
        (prueba_id, 'test-prueba-device-1', 'mobile', -12.0600, -77.0550, 25.0, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '15 minutes', 45, 'Inspección de Campo', 'PRUEBA-001'),
        (prueba_id, 'test-prueba-device-1', 'mobile', -12.0620, -77.0570, 30.0, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3 hours', 60, 'Supervisión', 'PRUEBA-002'),
        (prueba_id, 'test-prueba-device-2', 'desktop', -12.0580, -77.0530, 15.0, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '5 hours 30 minutes', 30, 'Registro', 'PRUEBA-003');
        
        RAISE NOTICE 'Datos de prueba insertados para usuario prueba';
    ELSE
        RAISE NOTICE 'Usuario prueba no encontrado';
    END IF;
END $$;

-- PASO 5: Insertar datos para supervisores si existen
DO $$
DECLARE
    supervisor_rec RECORD;
BEGIN
    FOR supervisor_rec IN SELECT id, usuario FROM supervisores WHERE activo = true LIMIT 3
    LOOP
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
        (supervisor_rec.id, 'test-' || supervisor_rec.usuario || '-device-1', 'mobile', 
         -12.0464 + (random() * 0.02 - 0.01), 
         -77.0428 + (random() * 0.02 - 0.01), 
         20.0, 
         NOW() - INTERVAL '2 hours', 
         NOW() - INTERVAL '1 hour', 
         60, 
         'Supervisión de Contrato', 
         'CONTRATO-' || supervisor_rec.usuario || '-001');
        
        RAISE NOTICE 'Datos insertados para supervisor: %', supervisor_rec.usuario;
    END LOOP;
END $$;

-- PASO 6: Verificar los datos insertados
SELECT 
    COALESCE(u.username, s.usuario, 'Desconocido') as usuario,
    ug.device_type,
    ug.latitud,
    ug.longitud,
    ug.timestamp_entrada,
    ug.timestamp_salida,
    ug.duracion_minutos,
    ug.actividad_realizada,
    ug.cuenta_contrato
FROM ubicaciones_gps ug
LEFT JOIN usuarios u ON ug.usuario_id = u.id
LEFT JOIN supervisores s ON ug.usuario_id = s.id
ORDER BY ug.timestamp_entrada DESC
LIMIT 20;

-- PASO 7: Resumen final
SELECT 
    'Total de ubicaciones' as descripcion,
    COUNT(*) as cantidad
FROM ubicaciones_gps
UNION ALL
SELECT 
    'Ubicaciones hoy' as descripcion,
    COUNT(*) as cantidad
FROM ubicaciones_gps
WHERE timestamp_entrada >= CURRENT_DATE;

SELECT '✅ SCRIPT COMPLETADO - Tabla creada y datos de prueba insertados' as resultado;
