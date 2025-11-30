-- ========================================
-- SCRIPT PARA CREAR USUARIOS - SISTEMA DONET
-- ========================================
-- Ejecutar este script en Supabase SQL Editor
-- ========================================

-- Insertar los supervisores en la tabla
INSERT INTO supervisores (usuario, password, nombre, activo) VALUES
('carlos', '43803239', 'Carlos', true),
('wilmer', '46298703', 'Wilmer', true),
('marcelino', '9394061', 'Marcelino', true),
('manuel', '561773', 'Manuel', true),
('angelo', '76935270', 'Angelo', true);

-- Verificar que se crearon correctamente
SELECT * FROM supervisores ORDER BY id;

-- ========================================
-- NOTA IMPORTANTE:
-- ========================================
-- El sistema ya está configurado para que cada supervisor
-- solo vea sus propios contratos asignados mediante:
--
-- 1. Login: Valida usuario y contraseña
-- 2. Filtro automático: .eq('supervisor_id', currentUser.id)
-- 3. Dropdown: Solo muestra cuentas del supervisor
-- 4. Consultas: Solo muestra registros del supervisor
--
-- Cada supervisor verá únicamente los contratos que fueron
-- cargados con su supervisor_id en la carga masiva del Excel.
-- ========================================
