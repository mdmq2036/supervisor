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

-- 3. Verificar que está vacío
SELECT COUNT(*) as "Total ubicaciones_en_tiempo_real" FROM ubicaciones_en_tiempo_real;
SELECT COUNT(*) as "Total ubicaciones_gps" FROM ubicaciones_gps;

-- ==========================================
-- RESULTADO ESPERADO:
-- Total ubicaciones_en_tiempo_real: 0
-- Total ubicaciones_gps: 0
-- ==========================================
-- 
-- NOTAS:
-- - Solo elimina datos, NO toca estructura
-- - Todas las tablas, índices, vistas siguen intactas
-- - RLS y políticas de seguridad NO se tocan
-- - Puedes ejecutar esto múltiples veces sin problemas
-- - El sistema sigue funcionando normalmente después
-- ==========================================
