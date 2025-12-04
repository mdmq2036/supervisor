-- Verificar usuarios en la base de datos
SELECT 'USUARIOS EN TABLA usuarios:' as info;
SELECT id, username, password, nombre, rol, activo FROM usuarios ORDER BY username;

SELECT 'USUARIOS EN TABLA supervisores:' as info;
SELECT id, usuario, password, nombre, activo FROM supervisores ORDER BY usuario;
