-- ==========================================
-- LIMPIAR HISTORIAL DE UBICACIONES
-- ==========================================
-- SEGURO: Solo elimina datos, NO toca estructura
-- Fecha: Diciembre 3, 2025
-- ==========================================

-- 1. Limpiar tabla ubicaciones_en_tiempo_real
DELETE FROM ubicaciones_en_tiempo_real;

-- 2. Limpiar tabla ubicaciones_gps (si existe)
DELETE FROM ubicaciones_gps;

-- 3. Resetear secuencias (para que IDs comiencen desde 1)
ALTER SEQUENCE ubicaciones_en_tiempo_real_id_seq RESTART WITH 1;
ALTER SEQUENCE ubicaciones_gps_id_seq RESTART WITH 1;

-- 4. Verificar que está vacío
SELECT COUNT(*) as "Total ubicaciones_en_tiempo_real" FROM ubicaciones_en_tiempo_real;
SELECT COUNT(*) as "Total ubicaciones_gps" FROM ubicaciones_gps;

-- ==========================================
-- RESULTADO ESPERADO:
-- Total ubicaciones_en_tiempo_real: 0
-- Total ubicaciones_gps: 0
-- ==========================================
