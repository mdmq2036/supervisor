-- ========================================
-- CONSULTAS ÚTILES - SISTEMA DONET
-- Base de Datos: PostgreSQL en Supabase
-- ========================================

-- ========================================
-- CONSULTAS DIARIAS
-- ========================================

-- 1. Ver todos los registros del día
SELECT
    cuenta_contrato,
    distrito,
    nombre_dni_inspector,
    empresa_instaladora,
    created_at
FROM inspecciones
WHERE fecha_carga = CURRENT_DATE
ORDER BY created_at DESC;


-- 2. Contar registros del día por distrito
SELECT
    distrito,
    COUNT(*) as total
FROM inspecciones
WHERE fecha_carga = CURRENT_DATE
GROUP BY distrito
ORDER BY total DESC;


-- 3. Contar registros del día por inspector
SELECT
    nombre_dni_inspector,
    COUNT(*) as total
FROM inspecciones
WHERE fecha_carga = CURRENT_DATE
GROUP BY nombre_dni_inspector
ORDER BY total DESC;


-- 4. Ver últimos registros cargados (últimos 20)
SELECT
    cuenta_contrato,
    distrito,
    nombre_dni_inspector,
    created_at
FROM inspecciones
ORDER BY created_at DESC
LIMIT 20;


-- 5. Ver registros con fotos del día
SELECT
    cuenta_contrato,
    distrito,
    CASE WHEN foto1 IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN foto2 IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN foto3 IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN foto4 IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN foto5 IS NOT NULL THEN 1 ELSE 0 END as total_fotos
FROM inspecciones
WHERE fecha_carga = CURRENT_DATE
ORDER BY total_fotos DESC;


-- ========================================
-- ESTADÍSTICAS GENERALES
-- ========================================

-- 6. Resumen general del sistema
SELECT
    COUNT(*) as total_registros,
    COUNT(DISTINCT cuenta_contrato) as cuentas_unicas,
    COUNT(DISTINCT distrito) as distritos,
    COUNT(DISTINCT empresa_instaladora) as empresas,
    COUNT(DISTINCT nombre_dni_inspector) as inspectores,
    MIN(fecha_carga) as primera_carga,
    MAX(fecha_carga) as ultima_carga,
    COUNT(CASE WHEN foto1 IS NOT NULL THEN 1 END) as registros_con_foto1,
    COUNT(CASE WHEN foto2 IS NOT NULL THEN 1 END) as registros_con_foto2,
    COUNT(CASE WHEN foto3 IS NOT NULL THEN 1 END) as registros_con_foto3,
    COUNT(CASE WHEN foto4 IS NOT NULL THEN 1 END) as registros_con_foto4,
    COUNT(CASE WHEN foto5 IS NOT NULL THEN 1 END) as registros_con_foto5
FROM inspecciones;


-- 7. Registros por día (últimos 30 días)
SELECT
    fecha_carga,
    COUNT(*) as total_registros,
    COUNT(DISTINCT distrito) as distritos,
    COUNT(DISTINCT empresa_instaladora) as empresas
FROM inspecciones
WHERE fecha_carga >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY fecha_carga
ORDER BY fecha_carga DESC;


-- 8. Top 10 distritos con más inspecciones
SELECT
    distrito,
    COUNT(*) as total_inspecciones,
    MIN(fecha_carga) as primera_inspeccion,
    MAX(fecha_carga) as ultima_inspeccion
FROM inspecciones
WHERE distrito IS NOT NULL
GROUP BY distrito
ORDER BY total_inspecciones DESC
LIMIT 10;


-- 9. Top 10 inspectores más activos
SELECT
    nombre_dni_inspector,
    COUNT(*) as total_inspecciones,
    COUNT(DISTINCT distrito) as distritos_cubiertos,
    MIN(fecha_carga) as primera_inspeccion,
    MAX(fecha_carga) as ultima_inspeccion
FROM inspecciones
WHERE nombre_dni_inspector IS NOT NULL
GROUP BY nombre_dni_inspector
ORDER BY total_inspecciones DESC
LIMIT 10;


-- 10. Empresas instaladoras y su actividad
SELECT
    empresa_instaladora,
    COUNT(*) as total_instalaciones,
    COUNT(DISTINCT distrito) as distritos_atendidos,
    MIN(fecha_carga) as primera_instalacion,
    MAX(fecha_carga) as ultima_instalacion
FROM inspecciones
WHERE empresa_instaladora IS NOT NULL
GROUP BY empresa_instaladora
ORDER BY total_instalaciones DESC;


-- ========================================
-- BÚSQUEDAS ESPECÍFICAS
-- ========================================

-- 11. Buscar por cuenta contrato
SELECT *
FROM inspecciones
WHERE cuenta_contrato = '551089731';


-- 12. Buscar por distrito
SELECT
    cuenta_contrato,
    direccion_instalacion,
    nombre_dni_inspector,
    fecha_carga
FROM inspecciones
WHERE distrito ILIKE '%MIRAFLORES%'
ORDER BY fecha_carga DESC;


-- 13. Buscar por inspector
SELECT
    cuenta_contrato,
    distrito,
    direccion_instalacion,
    fecha_carga
FROM inspecciones
WHERE nombre_dni_inspector ILIKE '%Emilio%'
ORDER BY fecha_carga DESC;


-- 14. Buscar por empresa instaladora
SELECT
    cuenta_contrato,
    distrito,
    nombre_dni_inspector,
    fecha_carga
FROM inspecciones
WHERE empresa_instaladora ILIKE '%DONISUGAS%'
ORDER BY fecha_carga DESC;


-- 15. Buscar por rango de fechas
SELECT
    cuenta_contrato,
    distrito,
    nombre_dni_inspector,
    fecha_carga
FROM inspecciones
WHERE fecha_carga BETWEEN '2025-01-01' AND '2025-01-31'
ORDER BY fecha_carga DESC;


-- ========================================
-- HISTORIAL Y AUDITORÍA
-- ========================================

-- 16. Ver historial de cargas masivas
SELECT
    h.id,
    h.fecha_carga,
    h.nombre_archivo,
    h.total_registros,
    h.registros_exitosos,
    h.registros_fallidos,
    h.estado,
    s.nombre as supervisor
FROM historial_cargas h
LEFT JOIN supervisores s ON h.supervisor_id = s.id
ORDER BY h.fecha_carga DESC;


-- 17. Ver duplicados detectados hoy
SELECT
    cuenta_contrato,
    fecha_carga,
    fecha_deteccion,
    accion,
    observacion
FROM registros_duplicados
WHERE DATE(fecha_deteccion) = CURRENT_DATE
ORDER BY fecha_deteccion DESC;


-- 18. Ver todos los duplicados
SELECT
    cuenta_contrato,
    fecha_carga,
    COUNT(*) as veces_duplicado
FROM registros_duplicados
GROUP BY cuenta_contrato, fecha_carga
ORDER BY veces_duplicado DESC;


-- 19. Actividad por supervisor
SELECT
    s.nombre,
    COUNT(i.id) as total_registros,
    MIN(i.fecha_carga) as primera_carga,
    MAX(i.fecha_carga) as ultima_carga
FROM supervisores s
LEFT JOIN inspecciones i ON s.id = i.supervisor_id
GROUP BY s.id, s.nombre
ORDER BY total_registros DESC;


-- 20. Cargas del último mes
SELECT
    DATE(fecha_carga) as fecha,
    COUNT(*) as total_cargas,
    SUM(total_registros) as total_registros,
    SUM(registros_exitosos) as exitosos,
    SUM(registros_fallidos) as fallidos
FROM historial_cargas
WHERE fecha_carga >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(fecha_carga)
ORDER BY fecha DESC;


-- ========================================
-- DATOS GEOGRÁFICOS
-- ========================================

-- 21. Ver registros con coordenadas
SELECT
    cuenta_contrato,
    distrito,
    ubicacion,
    latitud,
    longitud
FROM inspecciones
WHERE latitud IS NOT NULL
  AND longitud IS NOT NULL
ORDER BY fecha_carga DESC
LIMIT 100;


-- 22. Registros por distrito con coordenadas
SELECT
    distrito,
    COUNT(*) as total,
    COUNT(CASE WHEN latitud IS NOT NULL THEN 1 END) as con_coordenadas,
    ROUND(
        COUNT(CASE WHEN latitud IS NOT NULL THEN 1 END)::numeric /
        COUNT(*)::numeric * 100,
        2
    ) as porcentaje_con_coordenadas
FROM inspecciones
WHERE distrito IS NOT NULL
GROUP BY distrito
ORDER BY total DESC;


-- 23. Coordenadas promedio por distrito
SELECT
    distrito,
    COUNT(*) as total_registros,
    ROUND(AVG(latitud)::numeric, 6) as latitud_promedio,
    ROUND(AVG(longitud)::numeric, 6) as longitud_promedio
FROM inspecciones
WHERE latitud IS NOT NULL
  AND longitud IS NOT NULL
  AND distrito IS NOT NULL
GROUP BY distrito
ORDER BY total_registros DESC;


-- ========================================
-- REPORTES ESPECIALES
-- ========================================

-- 24. Reporte de productividad diaria
SELECT
    fecha_carga,
    COUNT(*) as total_inspecciones,
    COUNT(DISTINCT nombre_dni_inspector) as inspectores_activos,
    ROUND(COUNT(*)::numeric / COUNT(DISTINCT nombre_dni_inspector)::numeric, 2) as promedio_por_inspector
FROM inspecciones
WHERE fecha_carga >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY fecha_carga
ORDER BY fecha_carga DESC;


-- 25. Reporte de calidad de datos
SELECT
    COUNT(*) as total_registros,
    COUNT(CASE WHEN distrito IS NULL THEN 1 END) as sin_distrito,
    COUNT(CASE WHEN ubicacion IS NULL THEN 1 END) as sin_ubicacion,
    COUNT(CASE WHEN nombre_dni_inspector IS NULL THEN 1 END) as sin_inspector,
    COUNT(CASE WHEN empresa_instaladora IS NULL THEN 1 END) as sin_empresa,
    ROUND(
        COUNT(CASE WHEN distrito IS NOT NULL
                   AND ubicacion IS NOT NULL
                   AND nombre_dni_inspector IS NOT NULL
                   AND empresa_instaladora IS NOT NULL
              THEN 1 END)::numeric / COUNT(*)::numeric * 100,
        2
    ) as porcentaje_completo
FROM inspecciones;


-- 26. Inspecciones pendientes de fotos
SELECT
    cuenta_contrato,
    distrito,
    direccion_instalacion,
    fecha_carga,
    CASE WHEN foto1 IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN foto2 IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN foto3 IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN foto4 IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN foto5 IS NOT NULL THEN 1 ELSE 0 END as fotos_subidas
FROM inspecciones
WHERE foto1 IS NULL
   OR foto2 IS NULL
   OR foto3 IS NULL
   OR foto4 IS NULL
   OR foto5 IS NULL
ORDER BY fecha_carga DESC;


-- 27. Distribución de turnos
SELECT
    turno,
    COUNT(*) as total,
    ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM inspecciones)::numeric * 100, 2) as porcentaje
FROM inspecciones
WHERE turno IS NOT NULL
GROUP BY turno
ORDER BY total DESC;


-- 28. Inspecciones por tipo de medidor
SELECT
    medidor,
    COUNT(*) as total
FROM inspecciones
WHERE medidor IS NOT NULL
GROUP BY medidor
ORDER BY total DESC;


-- ========================================
-- MANTENIMIENTO Y LIMPIEZA
-- ========================================

-- 29. Encontrar posibles duplicados (misma cuenta, diferentes fechas)
SELECT
    cuenta_contrato,
    COUNT(*) as apariciones,
    STRING_AGG(fecha_carga::text, ', ' ORDER BY fecha_carga) as fechas
FROM inspecciones
GROUP BY cuenta_contrato
HAVING COUNT(*) > 1
ORDER BY apariciones DESC;


-- 30. Registros con datos incompletos
SELECT
    id,
    cuenta_contrato,
    distrito,
    fecha_carga,
    CASE
        WHEN distrito IS NULL THEN 'Sin distrito, '
        ELSE ''
    END ||
    CASE
        WHEN ubicacion IS NULL THEN 'Sin ubicación, '
        ELSE ''
    END ||
    CASE
        WHEN nombre_dni_inspector IS NULL THEN 'Sin inspector, '
        ELSE ''
    END ||
    CASE
        WHEN empresa_instaladora IS NULL THEN 'Sin empresa'
        ELSE ''
    END as campos_faltantes
FROM inspecciones
WHERE distrito IS NULL
   OR ubicacion IS NULL
   OR nombre_dni_inspector IS NULL
   OR empresa_instaladora IS NULL
ORDER BY fecha_carga DESC;


-- ========================================
-- EXPORTACIONES
-- ========================================

-- 31. Exportar datos completos del día (para Excel)
SELECT
    cuenta_contrato,
    instalacion,
    cliente_dni,
    direccion_instalacion,
    distrito,
    telefono_local,
    turno,
    medidor,
    nombre_dni_inspector,
    empresa_instaladora,
    ubicacion,
    observaciones,
    fecha_carga
FROM inspecciones
WHERE fecha_carga = CURRENT_DATE
ORDER BY cuenta_contrato;


-- 32. Exportar resumen mensual
SELECT
    DATE_TRUNC('month', fecha_carga) as mes,
    COUNT(*) as total_inspecciones,
    COUNT(DISTINCT distrito) as distritos,
    COUNT(DISTINCT empresa_instaladora) as empresas,
    COUNT(DISTINCT nombre_dni_inspector) as inspectores
FROM inspecciones
GROUP BY DATE_TRUNC('month', fecha_carga)
ORDER BY mes DESC;


-- ========================================
-- VISTAS PREDEFINIDAS
-- ========================================

-- 33. Usar vista de inspecciones completas
SELECT *
FROM v_inspecciones_completas
ORDER BY fecha_carga DESC
LIMIT 100;


-- 34. Usar vista de estadísticas diarias
SELECT *
FROM v_estadisticas_diarias
ORDER BY fecha_carga DESC
LIMIT 30;


-- 35. Usar vista de inspecciones por distrito
SELECT *
FROM v_inspecciones_por_distrito
WHERE fecha_carga >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY fecha_carga DESC, total DESC;


-- ========================================
-- CONSULTAS AVANZADAS
-- ========================================

-- 36. Tendencia de inspecciones (últimos 30 días)
WITH daily_stats AS (
    SELECT
        fecha_carga,
        COUNT(*) as total
    FROM inspecciones
    WHERE fecha_carga >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY fecha_carga
)
SELECT
    fecha_carga,
    total,
    AVG(total) OVER (ORDER BY fecha_carga ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as promedio_7_dias
FROM daily_stats
ORDER BY fecha_carga;


-- 37. Ranking de inspectores por mes
WITH monthly_ranking AS (
    SELECT
        DATE_TRUNC('month', fecha_carga) as mes,
        nombre_dni_inspector,
        COUNT(*) as total,
        RANK() OVER (PARTITION BY DATE_TRUNC('month', fecha_carga) ORDER BY COUNT(*) DESC) as ranking
    FROM inspecciones
    WHERE nombre_dni_inspector IS NOT NULL
    GROUP BY DATE_TRUNC('month', fecha_carga), nombre_dni_inspector
)
SELECT
    mes,
    nombre_dni_inspector,
    total,
    ranking
FROM monthly_ranking
WHERE ranking <= 10
ORDER BY mes DESC, ranking;


-- 38. Análisis de cobertura por distrito
SELECT
    distrito,
    COUNT(*) as total_inspecciones,
    COUNT(DISTINCT empresa_instaladora) as empresas_activas,
    COUNT(DISTINCT nombre_dni_inspector) as inspectores_activos,
    ROUND(AVG(puntos_corresponden_instalar), 2) as promedio_puntos
FROM inspecciones
WHERE distrito IS NOT NULL
GROUP BY distrito
ORDER BY total_inspecciones DESC;


-- 39. Tiempo entre primera y última inspección por cuenta
WITH first_last AS (
    SELECT
        cuenta_contrato,
        MIN(fecha_carga) as primera,
        MAX(fecha_carga) as ultima,
        COUNT(*) as veces
    FROM inspecciones
    GROUP BY cuenta_contrato
)
SELECT
    cuenta_contrato,
    primera,
    ultima,
    veces,
    ultima - primera as dias_entre_inspecciones
FROM first_last
WHERE veces > 1
ORDER BY dias_entre_inspecciones DESC;


-- 40. Inspecciones completadas vs pendientes
SELECT
    'Completas (5 fotos)' as estado,
    COUNT(*) as total
FROM inspecciones
WHERE foto1 IS NOT NULL
  AND foto2 IS NOT NULL
  AND foto3 IS NOT NULL
  AND foto4 IS NOT NULL
  AND foto5 IS NOT NULL
UNION ALL
SELECT
    'Parciales (1-4 fotos)' as estado,
    COUNT(*) as total
FROM inspecciones
WHERE (foto1 IS NOT NULL OR foto2 IS NOT NULL OR foto3 IS NOT NULL OR foto4 IS NOT NULL OR foto5 IS NOT NULL)
  AND NOT (foto1 IS NOT NULL AND foto2 IS NOT NULL AND foto3 IS NOT NULL AND foto4 IS NOT NULL AND foto5 IS NOT NULL)
UNION ALL
SELECT
    'Sin fotos' as estado,
    COUNT(*) as total
FROM inspecciones
WHERE foto1 IS NULL
  AND foto2 IS NULL
  AND foto3 IS NULL
  AND foto4 IS NULL
  AND foto5 IS NULL;


-- ========================================
-- FIN DE CONSULTAS ÚTILES
-- ========================================

-- Nota: Estas consultas están listas para copiar y pegar en:
-- - Supabase SQL Editor
-- - DBeaver
-- - pgAdmin
-- - Cualquier cliente PostgreSQL
