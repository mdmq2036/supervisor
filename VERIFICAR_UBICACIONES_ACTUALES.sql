-- Verificar ubicaciones actuales en la base de datos

-- 1. Contar ubicaciones totales
SELECT 'Total ubicaciones' as tipo, COUNT(*) as cantidad
FROM auditoria_ubicaciones;

-- 2. Ver todas las ubicaciones con detalles
SELECT 
    id,
    usuario_id,
    device_type,
    latitud,
    longitud,
    timestamp_entrada,
    actividad_realizada,
    device_fingerprint
FROM auditoria_ubicaciones
ORDER BY timestamp_entrada DESC;

-- 3. Contar por tipo de dispositivo
SELECT 
    device_type,
    COUNT(*) as cantidad
FROM auditoria_ubicaciones
GROUP BY device_type;

-- 4. Verificar la vista
SELECT COUNT(*) as ubicaciones_en_vista
FROM v_analisis_ubicaciones;
