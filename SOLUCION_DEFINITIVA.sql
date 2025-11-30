-- ========================================
-- SOLUCIÓN DEFINITIVA - ASIGNAR CONTRATOS A SUPERVISORES
-- ========================================
-- EJECUTAR EN SUPABASE SQL EDITOR
-- ========================================

-- ========================================
-- PASO 1: VERIFICAR ESTADO ACTUAL
-- ========================================

-- Ver cuántos registros hay en total
SELECT COUNT(*) as total_inspecciones FROM inspecciones;

-- Ver inspectores únicos en los datos
SELECT DISTINCT nombre_dni_inspector
FROM inspecciones
WHERE nombre_dni_inspector IS NOT NULL
ORDER BY nombre_dni_inspector;

-- Ver supervisores disponibles
SELECT id, usuario, nombre FROM supervisores ORDER BY usuario;

-- Ver asignaciones actuales
SELECT
    supervisor_id,
    COUNT(*) as total_contratos
FROM inspecciones
GROUP BY supervisor_id
ORDER BY supervisor_id;

-- ========================================
-- PASO 2: CREAR USUARIOS SI NO EXISTEN
-- ========================================

-- Insertar usuarios supervisores (ejecutar solo si no existen)
INSERT INTO supervisores (usuario, password, nombre, activo)
VALUES
    ('carlos', '43803239', 'Carlos', true),
    ('wilmer', '46298703', 'Wilmer', true),
    ('marcelino', '9394061', 'Marcelino', true),
    ('manuel', '561773', 'Manuel', true),
    ('angelo', '76935270', 'Angelo', true)
ON CONFLICT (usuario) DO NOTHING;

-- Verificar que se crearon
SELECT id, usuario, nombre FROM supervisores WHERE usuario IN ('carlos', 'wilmer', 'marcelino', 'manuel', 'angelo');

-- ========================================
-- PASO 3: ASIGNAR CONTRATOS POR INSPECTOR
-- ========================================

-- Asignar automáticamente basándose en el nombre del inspector
-- El sistema busca si el nombre del supervisor está contenido en nombre_dni_inspector

-- Carlos
UPDATE inspecciones
SET supervisor_id = (SELECT id FROM supervisores WHERE nombre = 'Carlos' LIMIT 1)
WHERE LOWER(nombre_dni_inspector) LIKE '%carlos%'
  AND nombre_dni_inspector IS NOT NULL;

-- Wilmer
UPDATE inspecciones
SET supervisor_id = (SELECT id FROM supervisores WHERE nombre = 'Wilmer' LIMIT 1)
WHERE LOWER(nombre_dni_inspector) LIKE '%wilmer%'
  AND nombre_dni_inspector IS NOT NULL;

-- Marcelino
UPDATE inspecciones
SET supervisor_id = (SELECT id FROM supervisores WHERE nombre = 'Marcelino' LIMIT 1)
WHERE LOWER(nombre_dni_inspector) LIKE '%marcelino%'
  AND nombre_dni_inspector IS NOT NULL;

-- Manuel
UPDATE inspecciones
SET supervisor_id = (SELECT id FROM supervisores WHERE nombre = 'Manuel' LIMIT 1)
WHERE LOWER(nombre_dni_inspector) LIKE '%manuel%'
  AND nombre_dni_inspector IS NOT NULL;

-- Angelo
UPDATE inspecciones
SET supervisor_id = (SELECT id FROM supervisores WHERE nombre = 'Angelo' LIMIT 1)
WHERE LOWER(nombre_dni_inspector) LIKE '%angelo%'
  AND nombre_dni_inspector IS NOT NULL;

-- ========================================
-- PASO 4: VERIFICAR RESULTADO
-- ========================================

-- Ver cuántos contratos tiene cada supervisor
SELECT
    s.id,
    s.usuario,
    s.nombre,
    COUNT(i.id) as total_contratos
FROM supervisores s
LEFT JOIN inspecciones i ON s.id = i.supervisor_id
WHERE s.usuario IN ('carlos', 'wilmer', 'marcelino', 'manuel', 'angelo')
GROUP BY s.id, s.usuario, s.nombre
ORDER BY s.usuario;

-- Ver detalle de asignaciones
SELECT
    s.usuario,
    i.cuenta_contrato,
    i.nombre_dni_inspector,
    i.distrito
FROM inspecciones i
JOIN supervisores s ON i.supervisor_id = s.id
WHERE s.usuario IN ('carlos', 'wilmer', 'marcelino', 'manuel', 'angelo')
ORDER BY s.usuario, i.cuenta_contrato
LIMIT 50;

-- Ver contratos SIN asignar
SELECT
    cuenta_contrato,
    nombre_dni_inspector,
    distrito
FROM inspecciones
WHERE supervisor_id IS NULL
   OR supervisor_id NOT IN (
       SELECT id FROM supervisores
       WHERE usuario IN ('carlos', 'wilmer', 'marcelino', 'manuel', 'angelo', 'demo', 'mdonet')
   );

-- ========================================
-- PASO 5: SI HAY CONTRATOS SIN ASIGNAR
-- ========================================

-- Ver los nombres de inspectores que no se asignaron
SELECT DISTINCT
    nombre_dni_inspector,
    COUNT(*) as total
FROM inspecciones
WHERE supervisor_id IS NULL
GROUP BY nombre_dni_inspector
ORDER BY nombre_dni_inspector;

-- Asignar manualmente los que quedaron sin asignar
-- Ejemplo: Si hay un inspector "Juan Perez - 12345678"
-- UPDATE inspecciones
-- SET supervisor_id = (SELECT id FROM supervisores WHERE nombre = 'Carlos')
-- WHERE nombre_dni_inspector = 'Juan Perez - 12345678';

-- O asignarlos todos a un supervisor por defecto (demo)
-- UPDATE inspecciones
-- SET supervisor_id = (SELECT id FROM supervisores WHERE usuario = 'demo')
-- WHERE supervisor_id IS NULL;

-- ========================================
-- RESUMEN FINAL
-- ========================================

-- Este query muestra el resumen completo
SELECT
    '=== RESUMEN DE ASIGNACIONES ===' as titulo;

SELECT
    s.usuario,
    s.nombre,
    COUNT(i.id) as contratos_asignados,
    CASE
        WHEN COUNT(i.id) > 0 THEN '✅ Asignado'
        ELSE '⚠️ Sin contratos'
    END as estado
FROM supervisores s
LEFT JOIN inspecciones i ON s.id = i.supervisor_id
WHERE s.activo = true
GROUP BY s.id, s.usuario, s.nombre
ORDER BY s.usuario;

-- Total general
SELECT
    COUNT(*) as total_inspecciones,
    COUNT(DISTINCT supervisor_id) as supervisores_con_contratos,
    COUNT(CASE WHEN supervisor_id IS NULL THEN 1 END) as sin_asignar
FROM inspecciones;

-- ========================================
-- INSTRUCCIONES DE USO:
-- ========================================
--
-- 1. Ejecuta PASO 1 para ver el estado actual
-- 2. Si no hay datos (total = 0):
--    → Ve a la app: http://localhost:8000
--    → Login: demo / demo123
--    → Carga Masiva → Sube MULTIFAMILIAR.xlsx
--
-- 3. Ejecuta PASO 2 para crear usuarios
-- 4. Ejecuta PASO 3 para asignar contratos
-- 5. Ejecuta PASO 4 para verificar
-- 6. Si hay contratos sin asignar, ejecuta PASO 5
--
-- 7. Prueba en la app:
--    → Login: carlos / 43803239
--    → Registrar Inspección → Dropdown debe mostrar cuentas
--    → Consultar Registros → Debe mostrar registros
--
-- ========================================
