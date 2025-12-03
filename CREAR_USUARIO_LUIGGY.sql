-- ========================================
-- CREAR USUARIO ADMIN: LUIGGY
-- Sistema DONET - Nuevo Administrador
-- ========================================
-- Ejecutar en Supabase SQL Editor
-- ========================================

-- Insertar usuario luiggy con rol admin
INSERT INTO usuarios (username, password, nombre, rol, activo)
VALUES ('luiggy', 'luiggy2025', 'Luiggy', 'admin', true)
ON CONFLICT (username) DO UPDATE
SET password = 'luiggy2025', nombre = 'Luiggy', rol = 'admin', activo = true;

-- Verificar que se creó correctamente
SELECT * FROM usuarios WHERE username = 'luiggy';

-- ========================================
-- RESULTADO ESPERADO:
-- ========================================
-- username: luiggy
-- nombre: Luiggy
-- rol: admin
-- activo: true
-- ========================================

SELECT '✅ Usuario luiggy creado exitosamente' as resultado;
