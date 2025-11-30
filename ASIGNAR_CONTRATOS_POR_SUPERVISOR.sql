-- ========================================
-- ASIGNAR CONTRATOS A SUPERVISORES
-- ========================================
-- Este script permite asignar contratos específicos a cada supervisor
-- Ejecutar en Supabase SQL Editor DESPUÉS de cargar los datos del Excel
-- ========================================

-- ========================================
-- OPCIÓN 1: ASIGNAR TODOS LOS CONTRATOS A UN SUPERVISOR
-- ========================================
-- Usar esto si un supervisor debe manejar TODOS los contratos existentes

-- Ejemplo: Asignar todos a Carlos (ID = 3)
-- UPDATE inspecciones SET supervisor_id = 3;

-- Ejemplo: Asignar todos a Wilmer (ID = 4)
-- UPDATE inspecciones SET supervisor_id = 4;

-- ========================================
-- OPCIÓN 2: ASIGNAR POR DISTRITO
-- ========================================
-- Dividir contratos geográficamente

-- Carlos maneja distrito LIMA
-- UPDATE inspecciones
-- SET supervisor_id = 3
-- WHERE UPPER(distrito) LIKE '%LIMA%';

-- Wilmer maneja distrito CALLAO
-- UPDATE inspecciones
-- SET supervisor_id = 4
-- WHERE UPPER(distrito) LIKE '%CALLAO%';

-- Marcelino maneja distrito SAN MARTIN DE PORRES
-- UPDATE inspecciones
-- SET supervisor_id = 5
-- WHERE UPPER(distrito) LIKE '%SAN MARTIN%';

-- ========================================
-- OPCIÓN 3: ASIGNAR POR CUENTAS ESPECÍFICAS
-- ========================================
-- Asignar cuentas contrato específicas a cada supervisor

-- Carlos recibe estas cuentas:
-- UPDATE inspecciones
-- SET supervisor_id = 3
-- WHERE cuenta_contrato IN (
--     '100041301',
--     '100041302',
--     '100041303',
--     '100041304',
--     '100041305'
-- );

-- Wilmer recibe estas cuentas:
-- UPDATE inspecciones
-- SET supervisor_id = 4
-- WHERE cuenta_contrato IN (
--     '100041306',
--     '100041307',
--     '100041308'
-- );

-- ========================================
-- OPCIÓN 4: ASIGNAR POR RANGO DE CUENTAS
-- ========================================
-- Si las cuentas son numéricas y consecutivas

-- Carlos: cuentas del 1 al 15
-- UPDATE inspecciones
-- SET supervisor_id = 3
-- WHERE cuenta_contrato::bigint BETWEEN 100041301 AND 100041315;

-- Wilmer: cuentas del 16 al 30
-- UPDATE inspecciones
-- SET supervisor_id = 4
-- WHERE cuenta_contrato::bigint BETWEEN 100041316 AND 100041330;

-- ========================================
-- OPCIÓN 5: DISTRIBUCIÓN EQUITATIVA AUTOMÁTICA
-- ========================================
-- Distribuir contratos equitativamente entre supervisores

-- Primero, ver cuántos contratos hay:
SELECT COUNT(*) as total_contratos FROM inspecciones;

-- Distribuir en 5 supervisores (20% cada uno)
-- Supervisor Carlos (20% primeros)
-- UPDATE inspecciones
-- SET supervisor_id = 3
-- WHERE id IN (
--     SELECT id FROM inspecciones
--     ORDER BY id
--     LIMIT (SELECT COUNT(*) * 0.20 FROM inspecciones)::int
-- );

-- Supervisor Wilmer (siguiente 20%)
-- UPDATE inspecciones
-- SET supervisor_id = 4
-- WHERE id IN (
--     SELECT id FROM inspecciones
--     WHERE supervisor_id IS NULL
--     ORDER BY id
--     LIMIT (SELECT COUNT(*) * 0.20 FROM inspecciones WHERE supervisor_id IS NULL)::int
-- );

-- ========================================
-- VERIFICAR ASIGNACIONES
-- ========================================

-- Ver total de contratos por supervisor:
SELECT
    s.id,
    s.usuario,
    s.nombre,
    COUNT(i.id) as total_contratos,
    ROUND(COUNT(i.id) * 100.0 / NULLIF((SELECT COUNT(*) FROM inspecciones), 0), 2) as porcentaje
FROM supervisores s
LEFT JOIN inspecciones i ON s.id = i.supervisor_id
GROUP BY s.id, s.usuario, s.nombre
ORDER BY s.usuario;

-- Ver primeros 5 contratos de cada supervisor:
SELECT
    s.usuario,
    i.cuenta_contrato,
    i.distrito,
    i.direccion_instalacion
FROM inspecciones i
JOIN supervisores s ON i.supervisor_id = s.id
ORDER BY s.usuario, i.cuenta_contrato
LIMIT 50;

-- Ver contratos sin asignar (si hay):
SELECT COUNT(*) as sin_asignar
FROM inspecciones
WHERE supervisor_id IS NULL;

-- ========================================
-- RESETEAR ASIGNACIONES (SI ES NECESARIO)
-- ========================================
-- CUIDADO: Esto elimina TODAS las asignaciones

-- UPDATE inspecciones SET supervisor_id = NULL;

-- ========================================
-- IDs DE SUPERVISORES (PARA REFERENCIA)
-- ========================================
-- Ejecuta esto para ver los IDs de cada supervisor:

SELECT id, usuario, nombre FROM supervisores ORDER BY id;

-- Resultado esperado:
-- id | usuario    | nombre
-- ---|------------|------------
-- 1  | demo       | Usuario Demo
-- 2  | mdonet     | Administrador DONET
-- 3  | carlos     | Carlos
-- 4  | wilmer     | Wilmer
-- 5  | marcelino  | Marcelino
-- 6  | manuel     | Manuel
-- 7  | angelo     | Angelo

-- ========================================
-- EJEMPLO COMPLETO DE ASIGNACIÓN
-- ========================================
-- Basado en el Excel MULTIFAMILIAR (47 registros)

-- Paso 1: Ver todas las cuentas disponibles
SELECT cuenta_contrato, distrito FROM inspecciones ORDER BY cuenta_contrato;

-- Paso 2: Asignar por distrito (ejemplo)
-- Carlos: San Miguel
UPDATE inspecciones
SET supervisor_id = 3
WHERE UPPER(distrito) LIKE '%SAN MIGUEL%';

-- Wilmer: San Juan de Lurigancho
UPDATE inspecciones
SET supervisor_id = 4
WHERE UPPER(distrito) LIKE '%SAN JUAN%';

-- Marcelino: Los Olivos
UPDATE inspecciones
SET supervisor_id = 5
WHERE UPPER(distrito) LIKE '%LOS OLIVOS%';

-- Manuel: Lima (centro)
UPDATE inspecciones
SET supervisor_id = 6
WHERE UPPER(distrito) = 'LIMA';

-- Angelo: Otros distritos
UPDATE inspecciones
SET supervisor_id = 7
WHERE supervisor_id IS NULL;

-- Paso 3: Verificar resultado
SELECT
    s.usuario,
    COUNT(i.id) as contratos
FROM supervisores s
LEFT JOIN inspecciones i ON s.id = i.supervisor_id
WHERE s.usuario IN ('carlos', 'wilmer', 'marcelino', 'manuel', 'angelo')
GROUP BY s.usuario
ORDER BY s.usuario;

-- ========================================
-- NOTAS IMPORTANTES:
-- ========================================
-- 1. Los IDs de supervisores dependen del orden de inserción
-- 2. Verifica los IDs reales con: SELECT id, usuario FROM supervisores;
-- 3. Descomenta (quita --) solo las líneas que necesites ejecutar
-- 4. Ejecuta las consultas de verificación después de cada asignación
-- 5. Puedes combinar varios criterios (distrito + rango, etc.)
-- ========================================
