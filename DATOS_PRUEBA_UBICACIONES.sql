-- =====================================================
-- DATOS DE PRUEBA PARA MAPA DE UBICACIONES
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- IMPORTANTE: Primero ejecuta AGREGAR_GEOLOCALIZACION.sql si no lo has hecho

-- Insertar ubicaciones de prueba en Lima, Perú
-- Estas ubicaciones simulan un recorrido de inspección

-- Ubicación 1: San Isidro (inicio del recorrido)
INSERT INTO auditoria_ubicaciones (
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
    cuenta_contrato,
    ip_address,
    user_agent
) VALUES (
    1, -- ID del usuario 'prueba'
    'test-device-001',
    'mobile',
    -12.0897,
    -77.0282,
    15.5,
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '1 hour 45 minutes',
    15,
    'Inspección de medidor',
    '10001',
    '192.168.1.100',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)'
);

-- Ubicación 2: Miraflores (segunda parada)
INSERT INTO auditoria_ubicaciones (
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
    cuenta_contrato,
    ip_address,
    user_agent
) VALUES (
    1,
    'test-device-001',
    'mobile',
    -12.1191,
    -77.0317,
    12.0,
    NOW() - INTERVAL '1 hour 30 minutes',
    NOW() - INTERVAL '1 hour 10 minutes',
    20,
    'Verificación de instalación',
    '10002',
    '192.168.1.100',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)'
);

-- Ubicación 3: Surco (tercera parada)
INSERT INTO auditoria_ubicaciones (
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
    cuenta_contrato,
    ip_address,
    user_agent
) VALUES (
    1,
    'test-device-001',
    'mobile',
    -12.1428,
    -77.0075,
    18.3,
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '35 minutes',
    25,
    'Lectura de medidor',
    '10003',
    '192.168.1.100',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)'
);

-- Ubicación 4: La Molina (cuarta parada)
INSERT INTO auditoria_ubicaciones (
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
    cuenta_contrato,
    ip_address,
    user_agent
) VALUES (
    1,
    'test-device-001',
    'mobile',
    -12.0823,
    -76.9413,
    14.8,
    NOW() - INTERVAL '30 minutes',
    NOW() - INTERVAL '5 minutes',
    25,
    'Inspección técnica',
    '10004',
    '192.168.1.100',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)'
);

-- Ubicación 5: Ate (última parada - aún en curso)
INSERT INTO auditoria_ubicaciones (
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
    cuenta_contrato,
    ip_address,
    user_agent
) VALUES (
    1,
    'test-device-001',
    'mobile',
    -12.0525,
    -76.9382,
    16.2,
    NOW() - INTERVAL '10 minutes',
    NULL, -- Aún no ha salido
    NULL, -- Duración se calculará al salir
    'Revisión de instalación',
    '10005',
    '192.168.1.100',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)'
);

-- Verificar que se insertaron correctamente
SELECT
    id,
    usuario_id,
    device_type,
    latitud,
    longitud,
    timestamp_entrada,
    timestamp_salida,
    duracion_minutos,
    actividad_realizada,
    cuenta_contrato
FROM auditoria_ubicaciones
ORDER BY timestamp_entrada DESC
LIMIT 10;

-- Mensaje de confirmación
SELECT '✅ 5 ubicaciones de prueba insertadas correctamente' as resultado;
SELECT '📍 Ubicaciones distribuidas en: San Isidro, Miraflores, Surco, La Molina, Ate' as info;
SELECT '🗺️ Ahora puedes ver el mapa con datos reales' as siguiente_paso;
