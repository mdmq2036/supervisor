-- ========================================
-- SOLUCIÓN RÁPIDA - ASIGNAR CONTRATOS YA
-- ========================================
-- Ejecutar este script EN ORDEN en Supabase SQL Editor
-- ========================================

-- PASO 1: Ver cuántos registros hay en total
SELECT COUNT(*) as total_inspecciones FROM inspecciones;
-- Si retorna 0, necesitas cargar el Excel primero desde Carga Masiva

-- PASO 2: Ver quién tiene los contratos actualmente
SELECT
    supervisor_id,
    COUNT(*) as total_contratos
FROM inspecciones
GROUP BY supervisor_id
ORDER BY supervisor_id;

-- PASO 3: Ver IDs de los supervisores
SELECT id, usuario, nombre FROM supervisores ORDER BY id;
-- Anota los IDs:
-- ID | Usuario
-- ---|----------
-- 1  | demo
-- 2  | mdonet
-- 3  | carlos
-- 4  | wilmer
-- 5  | marcelino
-- 6  | manuel
-- 7  | angelo

-- ========================================
-- SOLUCIÓN A: SI YA HAY 47 REGISTROS CARGADOS
-- ========================================
-- Distribuir los 47 contratos entre los 5 supervisores

-- Carlos recibe 10 contratos (primeros)
UPDATE inspecciones
SET supervisor_id = 3
WHERE id IN (
    SELECT id FROM inspecciones
    ORDER BY id
    LIMIT 10
);

-- Wilmer recibe 10 contratos (siguientes)
UPDATE inspecciones
SET supervisor_id = 4
WHERE id IN (
    SELECT id FROM inspecciones
    WHERE supervisor_id != 3
    ORDER BY id
    LIMIT 10
);

-- Marcelino recibe 10 contratos
UPDATE inspecciones
SET supervisor_id = 5
WHERE id IN (
    SELECT id FROM inspecciones
    WHERE supervisor_id NOT IN (3, 4)
    ORDER BY id
    LIMIT 10
);

-- Manuel recibe 10 contratos
UPDATE inspecciones
SET supervisor_id = 6
WHERE id IN (
    SELECT id FROM inspecciones
    WHERE supervisor_id NOT IN (3, 4, 5)
    ORDER BY id
    LIMIT 10
);

-- Angelo recibe el resto (7 contratos)
UPDATE inspecciones
SET supervisor_id = 7
WHERE supervisor_id NOT IN (3, 4, 5, 6);

-- VERIFICAR resultado
SELECT
    s.usuario,
    COUNT(i.id) as contratos_asignados
FROM supervisores s
LEFT JOIN inspecciones i ON s.id = i.supervisor_id
WHERE s.usuario IN ('carlos', 'wilmer', 'marcelino', 'manuel', 'angelo')
GROUP BY s.usuario
ORDER BY s.usuario;

-- ========================================
-- SOLUCIÓN B: SI NO HAY REGISTROS (Total = 0)
-- ========================================
-- 1. Ve a: http://localhost:8000
-- 2. Login con: demo / demo123
-- 3. Click en "Carga Masiva"
-- 4. Sube el archivo MULTIFAMILIAR.xlsx
-- 5. Click en "Procesar y Cargar Datos"
-- 6. Espera a que termine (47 exitosos)
-- 7. LUEGO ejecuta la SOLUCIÓN A arriba

-- ========================================
-- VERIFICACIÓN FINAL
-- ========================================
-- Ver detalles de asignaciones
SELECT
    s.usuario,
    s.nombre,
    i.cuenta_contrato,
    i.distrito
FROM supervisores s
JOIN inspecciones i ON s.id = i.supervisor_id
WHERE s.usuario IN ('carlos', 'wilmer', 'marcelino', 'manuel', 'angelo')
ORDER BY s.usuario, i.cuenta_contrato
LIMIT 50;

-- ========================================
-- DESPUÉS DE EJECUTAR ESTE SCRIPT:
-- ========================================
-- 1. Ve a: http://localhost:8000
-- 2. Login con: carlos / 43803239
-- 3. Click en "Registrar Inspección"
-- 4. El dropdown debe mostrar 10 cuentas
-- 5. Click en "Consultar Registros"
-- 6. Debe mostrar 10 registros automáticamente
-- ========================================
