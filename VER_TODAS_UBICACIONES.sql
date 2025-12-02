-- Ver TODAS las ubicaciones con detalles completos
SELECT 
    id,
    usuario_id,
    device_type,
    ROUND(latitud::numeric, 6) as latitud,
    ROUND(longitud::numeric, 6) as longitud,
    TO_CHAR(timestamp_entrada, 'YYYY-MM-DD HH24:MI:SS') as fecha_entrada,
    actividad_realizada,
    device_fingerprint
FROM auditoria_ubicaciones
ORDER BY timestamp_entrada DESC;

-- Contar por tipo de dispositivo
SELECT 
    device_type,
    COUNT(*) as cantidad
FROM auditoria_ubicaciones
GROUP BY device_type;
