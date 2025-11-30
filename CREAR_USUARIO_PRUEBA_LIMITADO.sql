-- =====================================================
-- SCRIPT PARA CREAR USUARIO DE PRUEBA CON LÍMITE DE 5 DISPOSITIVOS
-- Y USUARIO ADMINISTRADOR PARA MÓDULO DE ADMINISTRACIÓN
-- =====================================================

-- 1. CREAR TABLA PARA CONTROL DE DISPOSITIVOS
-- =====================================================
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

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_device_user ON device_access_control(user_id);
CREATE INDEX IF NOT EXISTS idx_device_fingerprint ON device_access_control(device_fingerprint);

-- 2. CREAR FUNCIÓN PARA VALIDAR ACCESO POR DISPOSITIVO
-- =====================================================
CREATE OR REPLACE FUNCTION check_device_access(
    p_user_id INTEGER,
    p_device_fingerprint TEXT
) RETURNS JSON AS $$
DECLARE
    v_device_count INTEGER;
    v_device_record RECORD;
    v_result JSON;
BEGIN
    -- Verificar si el dispositivo ya existe para este usuario
    SELECT * INTO v_device_record
    FROM device_access_control
    WHERE user_id = p_user_id 
    AND device_fingerprint = p_device_fingerprint;
    
    IF FOUND THEN
        -- El dispositivo ya existe, actualizar último acceso
        UPDATE device_access_control
        SET last_access = CURRENT_TIMESTAMP,
            access_count = access_count + 1
        WHERE user_id = p_user_id 
        AND device_fingerprint = p_device_fingerprint;
        
        -- Verificar si está bloqueado
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
        -- Nuevo dispositivo, verificar si ya alcanzó el límite
        SELECT COUNT(*) INTO v_device_count
        FROM device_access_control
        WHERE user_id = p_user_id;
        
        IF v_device_count >= 5 THEN
            -- Ya tiene 5 dispositivos registrados, denegar acceso
            v_result := json_build_object(
                'allowed', false,
                'reason', 'device_limit_reached',
                'message', 'Ha alcanzado el límite de 5 dispositivos. Contacte al administrador.',
                'device_count', v_device_count
            );
        ELSE
            -- Registrar nuevo dispositivo
            INSERT INTO device_access_control (user_id, device_fingerprint)
            VALUES (p_user_id, p_device_fingerprint);
            
            v_result := json_build_object(
                'allowed', true,
                'device_count', v_device_count + 1,
                'message', 'Nuevo dispositivo registrado exitosamente'
            );
        END IF;
    END IF;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- 3. ELIMINAR USUARIO DE PRUEBA SI EXISTE
-- =====================================================
DELETE FROM device_access_control WHERE user_id IN (SELECT id FROM usuarios WHERE username = 'prueba');
DELETE FROM usuarios WHERE username = 'prueba';

-- 4. CREAR USUARIO DE PRUEBA
-- =====================================================
-- Contraseña: prueba2025
-- Hash bcrypt de 'prueba2025' (10 rounds)
INSERT INTO usuarios (username, password, nombre, rol, activo)
VALUES (
    'prueba',
    '$2b$10$yHImJh8QOpAY6h4wVmVFTu9ij2odoMo2JpoCv/PKQb6pt9zJGHPaW', -- prueba2025
    'Usuario de Prueba',
    'inspector',
    true
);

-- Nota: Para generar el hash de la contraseña 'prueba2025', ejecuta en Node.js:
-- const bcrypt = require('bcrypt');
-- bcrypt.hash('prueba2025', 10, (err, hash) => console.log(hash));

-- 5. CREAR USUARIO ADMINISTRADOR PARA MÓDULO DE ADMINISTRACIÓN
-- =====================================================
-- Eliminar si existe
DELETE FROM usuarios WHERE username = 'admin';

-- Crear usuario administrador
-- Contraseña: admin2025
-- Hash bcrypt de 'admin2025' (10 rounds)
INSERT INTO usuarios (username, password, nombre, rol, activo)
VALUES (
    'admin',
    '$2b$10$h9zRR3oQjIGYs9uDgmkdMe07yS/sp4QsD7W1VuB1.6orrkuSo0oiK', -- admin2025
    'Administrador del Sistema',
    'admin',
    true
);

-- 6. CREAR TABLA DE ROLES SI NO EXISTE
-- =====================================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'usuarios' AND column_name = 'rol') THEN
        ALTER TABLE usuarios ADD COLUMN rol VARCHAR(50) DEFAULT 'inspector';
    END IF;
END $$;

-- Actualizar roles existentes
UPDATE usuarios SET rol = 'inspector' WHERE rol IS NULL;

-- 7. FUNCIÓN PARA RESETEAR DISPOSITIVOS DE UN USUARIO (SOLO ADMIN)
-- =====================================================
CREATE OR REPLACE FUNCTION reset_user_devices(
    p_username TEXT,
    p_admin_username TEXT
) RETURNS JSON AS $$
DECLARE
    v_user_id INTEGER;
    v_admin_rol TEXT;
    v_deleted_count INTEGER;
    v_result JSON;
BEGIN
    -- Verificar que quien ejecuta es admin
    SELECT rol INTO v_admin_rol
    FROM usuarios
    WHERE username = p_admin_username;
    
    IF v_admin_rol != 'admin' THEN
        v_result := json_build_object(
            'success', false,
            'message', 'Solo los administradores pueden resetear dispositivos'
        );
        RETURN v_result;
    END IF;
    
    -- Obtener ID del usuario
    SELECT id INTO v_user_id
    FROM usuarios
    WHERE username = p_username;
    
    IF v_user_id IS NULL THEN
        v_result := json_build_object(
            'success', false,
            'message', 'Usuario no encontrado'
        );
        RETURN v_result;
    END IF;
    
    -- Eliminar todos los dispositivos del usuario
    DELETE FROM device_access_control
    WHERE user_id = v_user_id;
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    v_result := json_build_object(
        'success', true,
        'message', 'Dispositivos reseteados exitosamente',
        'devices_deleted', v_deleted_count
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- 8. FUNCIÓN PARA LISTAR DISPOSITIVOS DE UN USUARIO
-- =====================================================
CREATE OR REPLACE FUNCTION list_user_devices(p_username TEXT)
RETURNS TABLE (
    device_id INTEGER,
    device_fingerprint TEXT,
    first_access TIMESTAMP,
    last_access TIMESTAMP,
    access_count INTEGER,
    is_blocked BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dac.id,
        dac.device_fingerprint,
        dac.first_access,
        dac.last_access,
        dac.access_count,
        dac.is_blocked
    FROM device_access_control dac
    INNER JOIN usuarios u ON dac.user_id = u.id
    WHERE u.username = p_username
    ORDER BY dac.first_access DESC;
END;
$$ LANGUAGE plpgsql;

-- 9. FUNCIÓN PARA BLOQUEAR/DESBLOQUEAR DISPOSITIVO
-- =====================================================
CREATE OR REPLACE FUNCTION toggle_device_block(
    p_device_id INTEGER,
    p_admin_username TEXT
) RETURNS JSON AS $$
DECLARE
    v_admin_rol TEXT;
    v_new_status BOOLEAN;
    v_result JSON;
BEGIN
    -- Verificar que quien ejecuta es admin
    SELECT rol INTO v_admin_rol
    FROM usuarios
    WHERE username = p_admin_username;
    
    IF v_admin_rol != 'admin' THEN
        v_result := json_build_object(
            'success', false,
            'message', 'Solo los administradores pueden bloquear/desbloquear dispositivos'
        );
        RETURN v_result;
    END IF;
    
    -- Cambiar estado de bloqueo
    UPDATE device_access_control
    SET is_blocked = NOT is_blocked
    WHERE id = p_device_id
    RETURNING is_blocked INTO v_new_status;
    
    v_result := json_build_object(
        'success', true,
        'message', CASE 
            WHEN v_new_status THEN 'Dispositivo bloqueado'
            ELSE 'Dispositivo desbloqueado'
        END,
        'is_blocked', v_new_status
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- 10. VISTA PARA ESTADÍSTICAS DE DISPOSITIVOS
-- =====================================================
CREATE OR REPLACE VIEW device_statistics AS
SELECT 
    u.username,
    u.nombre,
    COUNT(dac.id) as total_devices,
    COUNT(CASE WHEN dac.is_blocked THEN 1 END) as blocked_devices,
    MAX(dac.last_access) as last_device_access
FROM usuarios u
LEFT JOIN device_access_control dac ON u.id = dac.user_id
GROUP BY u.id, u.username, u.nombre;

-- =====================================================
-- INSTRUCCIONES DE USO
-- =====================================================
-- 
-- 1. GENERAR HASHES DE CONTRASEÑAS:
--    Ejecuta en Node.js o en tu backend:
--    
--    const bcrypt = require('bcrypt');
--    bcrypt.hash('prueba2025', 10, (err, hash) => {
--        console.log('Hash para prueba:', hash);
--    });
--    bcrypt.hash('admin2025', 10, (err, hash) => {
--        console.log('Hash para admin:', hash);
--    });
--
-- 2. REEMPLAZAR HASHES:
--    Actualiza las líneas con '$2a$10$YourBcryptHashHere' con los hashes generados
--
-- 3. VALIDAR ACCESO EN TU APLICACIÓN:
--    SELECT check_device_access(user_id, device_fingerprint);
--
-- 4. LISTAR DISPOSITIVOS (ADMIN):
--    SELECT * FROM list_user_devices('prueba');
--
-- 5. RESETEAR DISPOSITIVOS (ADMIN):
--    SELECT reset_user_devices('prueba', 'admin');
--
-- 6. BLOQUEAR/DESBLOQUEAR DISPOSITIVO (ADMIN):
--    SELECT toggle_device_block(device_id, 'admin');
--
-- 7. VER ESTADÍSTICAS:
--    SELECT * FROM device_statistics;
--
-- =====================================================

-- VERIFICACIÓN FINAL
SELECT 'Script ejecutado exitosamente' as status;
SELECT 'Usuarios creados:' as info;
SELECT username, nombre, rol FROM usuarios WHERE username IN ('prueba', 'admin');
