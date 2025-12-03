-- ==========================================
-- SCRIPT PARA CREAR USUARIO DE PRUEBA NUEVO
-- ==========================================
-- Ejecuta este script en Supabase para crear un usuario
-- que no existía antes y probar el login.
-- ==========================================

-- 1. Crear usuario nuevo en tabla 'usuarios'
INSERT INTO usuarios (username, password, nombre, rol, activo)
VALUES 
('usuario_nuevo', 'test1234', 'Usuario de Prueba Nuevo', 'prueba', true);

-- 2. Verificar que se creó
SELECT * FROM usuarios WHERE username = 'usuario_nuevo';

-- ==========================================
-- INSTRUCCIONES DE PRUEBA:
-- 1. Ejecuta este script en Supabase SQL Editor.
-- 2. Ve a la app: https://supervisor-svkg.onrender.com
-- 3. Intenta ingresar con:
--    Usuario: usuario_nuevo
--    Clave:   test1234
-- ==========================================
