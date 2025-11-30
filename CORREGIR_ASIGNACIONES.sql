-- ========================================
-- CORREGIR ASIGNACIONES DE SUPERVISORES
-- ========================================
-- Este script asigna cada contrato al supervisor correcto
-- basándose en el campo nombre_dni_inspector de la tabla inspecciones
-- ========================================

-- ========================================
-- PASO 1: Ver qué inspectores hay en los datos
-- ========================================
SELECT
    nombre_dni_inspector,
    COUNT(*) as total_contratos
FROM inspecciones
WHERE nombre_dni_inspector IS NOT NULL
GROUP BY nombre_dni_inspector
ORDER BY nombre_dni_inspector;

-- Este query te mostrará EXACTAMENTE qué nombres hay en el Excel
-- Copia los nombres que veas y úsalos en el PASO 3

-- ========================================
-- PASO 2: Crear usuarios supervisores
-- ========================================
INSERT INTO supervisores (usuario, password, nombre, activo)
VALUES
    ('carlos', '43803239', 'Carlos', true),
    ('wilmer', '46298703', 'Wilmer', true),
    ('marcelino', '9394061', 'Marcelino', true),
    ('manuel', '561773', 'Manuel', true),
    ('angelo', '76935270', 'Angelo', true)
ON CONFLICT (usuario) DO NOTHING;

-- ========================================
-- PASO 3: Asignar contratos según el inspector
-- ========================================

-- Opción A: Si los nombres en el Excel contienen "carlos", "wilmer", etc.
-- El sistema busca coincidencias parciales (case insensitive)

UPDATE inspecciones
SET supervisor_id = (SELECT id FROM supervisores WHERE LOWER(nombre) = 'carlos' LIMIT 1)
WHERE LOWER(nombre_dni_inspector) LIKE '%carlos%'
  AND nombre_dni_inspector IS NOT NULL;

UPDATE inspecciones
SET supervisor_id = (SELECT id FROM supervisores WHERE LOWER(nombre) = 'wilmer' LIMIT 1)
WHERE LOWER(nombre_dni_inspector) LIKE '%wilmer%'
  AND nombre_dni_inspector IS NOT NULL;

UPDATE inspecciones
SET supervisor_id = (SELECT id FROM supervisores WHERE LOWER(nombre) = 'marcelino' LIMIT 1)
WHERE LOWER(nombre_dni_inspector) LIKE '%marcelino%'
  AND nombre_dni_inspector IS NOT NULL;

UPDATE inspecciones
SET supervisor_id = (SELECT id FROM supervisores WHERE LOWER(nombre) = 'manuel' LIMIT 1)
WHERE LOWER(nombre_dni_inspector) LIKE '%manuel%'
  AND nombre_dni_inspector IS NOT NULL;

UPDATE inspecciones
SET supervisor_id = (SELECT id FROM supervisores WHERE LOWER(nombre) = 'angelo' LIMIT 1)
WHERE LOWER(nombre_dni_inspector) LIKE '%angelo%'
  AND nombre_dni_inspector IS NOT NULL;

-- Opción B: Si los nombres en el Excel son EXACTOS
-- Descomenta estas líneas y reemplaza con los nombres EXACTOS del PASO 1

-- UPDATE inspecciones
-- SET supervisor_id = (SELECT id FROM supervisores WHERE LOWER(nombre) = 'carlos')
-- WHERE nombre_dni_inspector = 'Carlos Rodriguez - 43803239';

-- UPDATE inspecciones
-- SET supervisor_id = (SELECT id FROM supervisores WHERE LOWER(nombre) = 'wilmer')
-- WHERE nombre_dni_inspector = 'Wilmer Garcia - 46298703';

-- Y así sucesivamente...

-- ========================================
-- PASO 4: Verificar asignaciones
-- ========================================

-- Ver cuántos contratos tiene cada supervisor
SELECT
    s.usuario,
    s.nombre,
    COUNT(i.id) as total_contratos,
    CASE
        WHEN COUNT(i.id) > 0 THEN '✅ Tiene contratos'
        ELSE '❌ Sin contratos'
    END as estado
FROM supervisores s
LEFT JOIN inspecciones i ON s.id = i.supervisor_id
WHERE s.usuario IN ('carlos', 'wilmer', 'marcelino', 'manuel', 'angelo')
GROUP BY s.id, s.usuario, s.nombre
ORDER BY s.usuario;

-- Ver ejemplos de asignaciones
SELECT
    s.usuario,
    i.cuenta_contrato,
    i.nombre_dni_inspector,
    i.distrito
FROM inspecciones i
JOIN supervisores s ON i.supervisor_id = s.id
WHERE s.usuario IN ('carlos', 'wilmer', 'marcelino', 'manuel', 'angelo')
ORDER BY s.usuario, i.cuenta_contrato
LIMIT 20;

-- Ver contratos SIN asignar (si hay)
SELECT
    cuenta_contrato,
    nombre_dni_inspector,
    distrito,
    'SIN ASIGNAR' as estado
FROM inspecciones
WHERE supervisor_id IS NULL
LIMIT 20;

-- ========================================
-- PASO 5: Asignación manual (si es necesario)
-- ========================================

-- Si después del PASO 4 ves contratos SIN ASIGNAR,
-- es porque el nombre del inspector no coincide con ningún supervisor

-- Ver todos los inspectores sin asignar
SELECT DISTINCT
    nombre_dni_inspector,
    COUNT(*) as total
FROM inspecciones
WHERE supervisor_id IS NULL
GROUP BY nombre_dni_inspector;

-- Asignar manualmente (ejemplo)
-- Reemplaza con los nombres EXACTOS que veas

-- UPDATE inspecciones
-- SET supervisor_id = (SELECT id FROM supervisores WHERE nombre = 'Carlos')
-- WHERE nombre_dni_inspector = 'Nombre Exacto Del Inspector - DNI';

-- ========================================
-- RESUMEN FINAL
-- ========================================
SELECT
    'Total inspecciones' as descripcion,
    COUNT(*) as cantidad
FROM inspecciones
UNION ALL
SELECT
    'Asignadas a supervisores',
    COUNT(*)
FROM inspecciones
WHERE supervisor_id IN (
    SELECT id FROM supervisores
    WHERE usuario IN ('carlos', 'wilmer', 'marcelino', 'manuel', 'angelo')
)
UNION ALL
SELECT
    'Sin asignar',
    COUNT(*)
FROM inspecciones
WHERE supervisor_id IS NULL;

-- ========================================
-- INSTRUCCIONES:
-- ========================================
-- 1. Ejecuta PASO 1 para ver qué nombres hay en los datos
-- 2. Anota los nombres EXACTOS que veas
-- 3. Ejecuta PASO 2 para crear usuarios
-- 4. Ejecuta PASO 3 (Opción A para coincidencias parciales)
-- 5. Ejecuta PASO 4 para verificar
-- 6. Si hay contratos sin asignar, ejecuta PASO 5
-- 7. Prueba en la app: Login carlos → Debe ver contratos
-- ========================================
