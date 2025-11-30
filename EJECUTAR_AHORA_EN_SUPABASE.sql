-- =====================================================
-- SCRIPT SIMPLE PARA CREAR USUARIO PRUEBA
-- EJECUTAR DIRECTAMENTE EN SUPABASE SQL EDITOR
-- =====================================================

-- PASO 1: Crear tabla usuarios si no existe
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    rol VARCHAR(50) DEFAULT 'inspector',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PASO 2: Eliminar usuario prueba si existe (para evitar duplicados)
DELETE FROM usuarios WHERE username = 'prueba';

-- PASO 3: Crear usuario PRUEBA
-- Usuario: prueba
-- Contraseña: prueba2025
INSERT INTO usuarios (username, password, nombre, rol, activo)
VALUES (
    'prueba',
    '$2b$10$yHImJh8QOpAY6h4wVmVFTu9ij2odoMo2JpoCv/PKQb6pt9zJGHPaW',
    'Usuario de Prueba',
    'inspector',
    true
);

-- PASO 4: Eliminar usuario admin si existe
DELETE FROM usuarios WHERE username = 'admin';

-- PASO 5: Crear usuario ADMIN
-- Usuario: admin
-- Contraseña: admin2025
INSERT INTO usuarios (username, password, nombre, rol, activo)
VALUES (
    'admin',
    '$2b$10$h9zRR3oQjIGYs9uDgmkdMe07yS/sp4QsD7W1VuB1.6orrkuSo0oiK',
    'Administrador del Sistema',
    'admin',
    true
);

-- PASO 6: Crear tabla de control de dispositivos
CREATE TABLE IF NOT EXISTS device_access_control (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    device_fingerprint TEXT NOT NULL,
    first_access TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_access TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    access_count INTEGER DEFAULT 1,
    is_blocked BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, device_fingerprint),
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- PASO 7: Crear índices
CREATE INDEX IF NOT EXISTS idx_device_user ON device_access_control(user_id);
CREATE INDEX IF NOT EXISTS idx_device_fingerprint ON device_access_control(device_fingerprint);

-- PASO 8: Crear función para verificar acceso
CREATE OR REPLACE FUNCTION check_device_access(
    p_user_id INTEGER,
    p_device_fingerprint TEXT
) RETURNS JSON AS $$
DECLARE
    v_device_count INTEGER;
    v_device_record RECORD;
    v_result JSON;
BEGIN
    -- Verificar si el dispositivo ya existe
    SELECT * INTO v_device_record
    FROM device_access_control
    WHERE user_id = p_user_id 
    AND device_fingerprint = p_device_fingerprint;
    
    IF FOUND THEN
        -- Dispositivo existe, actualizar
        UPDATE device_access_control
        SET last_access = CURRENT_TIMESTAMP,
            access_count = access_count + 1
        WHERE user_id = p_user_id 
        AND device_fingerprint = p_device_fingerprint;
        
        IF v_device_record.is_blocked THEN
            v_result := json_build_object(
                'allowed', false,
                'reason', 'device_blocked',
                'message', 'Este dispositivo ha sido bloqueado'
            );
        ELSE
            v_result := json_build_object(
                'allowed', true,
                'device_count', (SELECT COUNT(*) FROM device_access_control WHERE user_id = p_user_id),
                'message', 'Acceso permitido'
            );
        END IF;
    ELSE
        -- Nuevo dispositivo
        SELECT COUNT(*) INTO v_device_count
        FROM device_access_control
        WHERE user_id = p_user_id;
        
        IF v_device_count >= 5 THEN
            v_result := json_build_object(
                'allowed', false,
                'reason', 'device_limit_reached',
                'message', 'Límite de 5 dispositivos alcanzado',
                'device_count', v_device_count
            );
        ELSE
            INSERT INTO device_access_control (user_id, device_fingerprint)
            VALUES (p_user_id, p_device_fingerprint);
            
            v_result := json_build_object(
                'allowed', true,
                'device_count', v_device_count + 1,
                'message', 'Dispositivo registrado'
            );
        END IF;
    END IF;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- PASO 9: Verificar que todo se creó correctamente
SELECT 'USUARIOS CREADOS:' as status;
SELECT id, username, nombre, rol, activo FROM usuarios WHERE username IN ('prueba', 'admin');

SELECT 'TABLAS CREADAS:' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('usuarios', 'device_access_control');

SELECT '✅ SCRIPT EJECUTADO EXITOSAMENTE' as resultado;
SELECT '👤 Usuario: prueba | Contraseña: prueba2025' as credenciales_prueba;
SELECT '🛡️ Usuario: admin | Contraseña: admin2025' as credenciales_admin;