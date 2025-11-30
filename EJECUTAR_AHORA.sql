-- ========================================
-- EJECUTAR ESTE SCRIPT EN SUPABASE AHORA
-- ========================================
-- Copia y pega TODO este contenido en Supabase SQL Editor
-- Click en RUN
-- ========================================

-- PASO 1: Crear usuarios supervisores
INSERT INTO supervisores (usuario, password, nombre, activo)
VALUES
    ('carlos', '43803239', 'Carlos', true),
    ('wilmer', '46298703', 'Wilmer', true),
    ('marcelino', '9394061', 'Marcelino', true),
    ('manuel', '561773', 'Manuel', true),
    ('angelo', '76935270', 'Angelo', true)
ON CONFLICT (usuario) DO NOTHING;

-- PASO 2: Asignar contratos por inspector
UPDATE inspecciones
SET supervisor_id = (SELECT id FROM supervisores WHERE nombre = 'Carlos' LIMIT 1)
WHERE LOWER(nombre_dni_inspector) LIKE '%carlos%';

UPDATE inspecciones
SET supervisor_id = (SELECT id FROM supervisores WHERE nombre = 'Wilmer' LIMIT 1)
WHERE LOWER(nombre_dni_inspector) LIKE '%wilmer%';

UPDATE inspecciones
SET supervisor_id = (SELECT id FROM supervisores WHERE nombre = 'Marcelino' LIMIT 1)
WHERE LOWER(nombre_dni_inspector) LIKE '%marcelino%';

UPDATE inspecciones
SET supervisor_id = (SELECT id FROM supervisores WHERE nombre = 'Manuel' LIMIT 1)
WHERE LOWER(nombre_dni_inspector) LIKE '%manuel%';

UPDATE inspecciones
SET supervisor_id = (SELECT id FROM supervisores WHERE nombre = 'Angelo' LIMIT 1)
WHERE LOWER(nombre_dni_inspector) LIKE '%angelo%';

-- PASO 3: Verificar resultado
SELECT
    s.usuario,
    s.nombre,
    COUNT(i.id) as contratos_asignados
FROM supervisores s
LEFT JOIN inspecciones i ON s.id = i.supervisor_id
WHERE s.usuario IN ('carlos', 'wilmer', 'marcelino', 'manuel', 'angelo')
GROUP BY s.id, s.usuario, s.nombre
ORDER BY s.usuario;

-- ========================================
-- RESULTADO ESPERADO:
-- ========================================
-- usuario   | nombre     | contratos_asignados
-- ----------|------------|--------------------
-- angelo    | Angelo     | X
-- carlos    | Carlos     | X
-- manuel    | Manuel     | X
-- marcelino | Marcelino  | X
-- wilmer    | Wilmer     | X
-- ========================================
