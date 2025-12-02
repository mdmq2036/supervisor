-- Query rápida para verificar el problema

SELECT 'Ubicaciones en tabla' as tipo, COUNT(*) as total FROM auditoria_ubicaciones
UNION ALL
SELECT 'Ubicaciones en vista' as tipo, COUNT(*) as total FROM v_analisis_ubicaciones;

-- Si la tabla tiene 1 pero la vista tiene 0, la vista está mal
-- Si ambas tienen 1, el problema está en el frontend
