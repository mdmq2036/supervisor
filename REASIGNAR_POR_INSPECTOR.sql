-- ========================================
-- REASIGNAR CONTRATOS SEGÚN INSPECTOR
-- ========================================
-- Este script asigna cada contrato al supervisor correcto
-- basándose en el campo "nombre_dni_inspector"
-- ========================================

-- PASO 1: Ver qué inspectores hay en los datos
SELECT DISTINCT nombre_dni_inspector
FROM inspecciones
WHERE nombre_dni_inspector IS NOT NULL
ORDER BY nombre_dni_inspector;

-- PASO 2: Ver los supervisores disponibles
SELECT id, usuario, nombre FROM supervisores ORDER BY id;

-- ========================================
-- PASO 3: ASIGNAR AUTOMÁTICAMENTE
-- ========================================
-- El sistema busca si el nombre del supervisor está contenido
-- en el campo nombre_dni_inspector

-- Carlos
UPDATE inspecciones
SET supervisor_id = (SELECT id FROM supervisores WHERE nombre = 'Carlos')
WHERE LOWER(nombre_dni_inspector) LIKE '%carlos%';

-- Wilmer
UPDATE inspecciones
SET supervisor_id = (SELECT id FROM supervisores WHERE nombre = 'Wilmer')
WHERE LOWER(nombre_dni_inspector) LIKE '%wilmer%';

-- Marcelino
UPDATE inspecciones
SET supervisor_id = (SELECT id FROM supervisores WHERE nombre = 'Marcelino')
WHERE LOWER(nombre_dni_inspector) LIKE '%marcelino%';

-- Manuel
UPDATE inspecciones
SET supervisor_id = (SELECT id FROM supervisores WHERE nombre = 'Manuel')
WHERE LOWER(nombre_dni_inspector) LIKE '%manuel%';

-- Angelo
UPDATE inspecciones
SET supervisor_id = (SELECT id FROM supervisores WHERE nombre = 'Angelo')
WHERE LOWER(nombre_dni_inspector) LIKE '%angelo%';

-- ========================================
-- PASO 4: VERIFICAR RESULTADO
-- ========================================

-- Ver cuántos contratos tiene cada supervisor
SELECT
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
ORDER BY s.usuario, i.cuenta_contrato;

-- Ver contratos sin asignar (si hay)
SELECT
    cuenta_contrato,
    nombre_dni_inspector,
    distrito
FROM inspecciones
WHERE supervisor_id IS NULL
   OR supervisor_id NOT IN (
       SELECT id FROM supervisores
       WHERE usuario IN ('carlos', 'wilmer', 'marcelino', 'manuel', 'angelo')
   );

-- ========================================
-- PASO 5: ASIGNACIONES MANUALES (SI ES NECESARIO)
-- ========================================
-- Si hay inspectores que no coinciden con los nombres de supervisores

-- Ver qué nombres de inspectores no se asignaron
SELECT DISTINCT
    i.nombre_dni_inspector,
    COUNT(*) as total_contratos
FROM inspecciones i
LEFT JOIN supervisores s ON i.supervisor_id = s.id
WHERE s.usuario NOT IN ('carlos', 'wilmer', 'marcelino', 'manuel', 'angelo')
   OR i.supervisor_id IS NULL
GROUP BY i.nombre_dni_inspector
ORDER BY i.nombre_dni_inspector;

-- Ejemplo de asignación manual por nombre específico:
-- UPDATE inspecciones
-- SET supervisor_id = (SELECT id FROM supervisores WHERE nombre = 'Carlos')
-- WHERE nombre_dni_inspector = 'Carlos Rodriguez 12345678';

-- ========================================
-- EJEMPLO COMPLETO DE EJECUCIÓN
-- ========================================

-- 1. Ver inspectores únicos
SELECT DISTINCT nombre_dni_inspector FROM inspecciones ORDER BY nombre_dni_inspector;

-- 2. Resultado ejemplo:
-- carlos - 43803239
-- wilmer garcia - 46298703
-- marcelino lopez - 9394061
-- manuel torres - 561773
-- angelo diaz - 76935270

-- 3. Asignar automáticamente
UPDATE inspecciones SET supervisor_id = (SELECT id FROM supervisores WHERE nombre = 'Carlos') WHERE LOWER(nombre_dni_inspector) LIKE '%carlos%';
UPDATE inspecciones SET supervisor_id = (SELECT id FROM supervisores WHERE nombre = 'Wilmer') WHERE LOWER(nombre_dni_inspector) LIKE '%wilmer%';
UPDATE inspecciones SET supervisor_id = (SELECT id FROM supervisores WHERE nombre = 'Marcelino') WHERE LOWER(nombre_dni_inspector) LIKE '%marcelino%';
UPDATE inspecciones SET supervisor_id = (SELECT id FROM supervisores WHERE nombre = 'Manuel') WHERE LOWER(nombre_dni_inspector) LIKE '%manuel%';
UPDATE inspecciones SET supervisor_id = (SELECT id FROM supervisores WHERE nombre = 'Angelo') WHERE LOWER(nombre_dni_inspector) LIKE '%angelo%';

-- 4. Verificar
SELECT s.usuario, COUNT(i.id) as contratos FROM supervisores s LEFT JOIN inspecciones i ON s.id = i.supervisor_id WHERE s.usuario IN ('carlos', 'wilmer', 'marcelino', 'manuel', 'angelo') GROUP BY s.usuario ORDER BY s.usuario;

-- ========================================
-- NOTAS IMPORTANTES:
-- ========================================
-- 1. El script busca coincidencias parciales (LIKE '%nombre%')
-- 2. Si el nombre del inspector no contiene el nombre del supervisor,
--    necesitarás asignación manual
-- 3. Los nombres en el Excel pueden incluir DNI o apellidos
-- 4. El mapeo es case-insensitive (LOWER())
-- ========================================
