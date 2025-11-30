-- ========================================
-- SCRIPT DE CREACIÓN DE TABLAS PARA DONET
-- Sistema de Gestión de Inspecciones
-- Base de Datos: PostgreSQL en Supabase
-- ========================================

-- ========================================
-- 1. TABLA DE SUPERVISORES
-- ========================================
DROP TABLE IF EXISTS supervisores CASCADE;

CREATE TABLE supervisores (
    id SERIAL PRIMARY KEY,
    usuario VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índice para búsquedas rápidas por usuario
CREATE INDEX idx_supervisores_usuario ON supervisores(usuario);

-- Insertar usuarios de prueba
INSERT INTO supervisores (usuario, password, nombre) VALUES
('admin', 'admin123', 'Administrador'),
('supervisor1', 'pass123', 'Supervisor 1'),
('supervisor2', 'pass456', 'Supervisor 2');

COMMENT ON TABLE supervisores IS 'Tabla de usuarios supervisores del sistema';
COMMENT ON COLUMN supervisores.usuario IS 'Nombre de usuario único para login';
COMMENT ON COLUMN supervisores.password IS 'Contraseña (debe ser hasheada en producción)';


-- ========================================
-- 2. TABLA PRINCIPAL DE INSPECCIONES
-- Basada en la estructura del Excel MULTIFAMILIAR
-- ========================================
DROP TABLE IF EXISTS inspecciones CASCADE;

CREATE TABLE inspecciones (
    -- Campos de control interno
    id SERIAL PRIMARY KEY,
    supervisor_id INTEGER REFERENCES supervisores(id),
    fecha_carga DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- CAMPO CLAVE (del Excel: "Cuenta contrato")
    cuenta_contrato VARCHAR(100) NOT NULL,

    -- Datos de instalación (columnas del Excel)
    instalacion VARCHAR(50),
    cliente_dni VARCHAR(255),
    direccion_instalacion VARCHAR(500),
    distrito VARCHAR(100),
    telefono_local VARCHAR(50),
    turno VARCHAR(50),
    puntos_corresponden_instalar INTEGER,
    hs VARCHAR(50),
    medidor VARCHAR(100),
    orden_atencion VARCHAR(100),
    montante_encuentro_activo_pasivo VARCHAR(50),
    encuentro_ramal_ectogas VARCHAR(50),
    observaciones TEXT,
    objeto_exacto VARCHAR(255),
    nombre_dni_inspector VARCHAR(255),
    ubicacion VARCHAR(255), -- Coordenadas lat,long
    fise_unica VARCHAR(50),
    empresa_instaladora VARCHAR(255),
    numero_medidor VARCHAR(100),
    numero_contador VARCHAR(100),
    horario_comentario_rusf_del_inspecto VARCHAR(255),
    celular_1 VARCHAR(50),
    celular_2 VARCHAR(50),
    celular_3 VARCHAR(50),
    celular_4 VARCHAR(50),
    apellidos_del_inspecto VARCHAR(255),
    observaciones_2 TEXT,
    numero_piso VARCHAR(50),

    -- Campos de fotos de inspección (5 fotos independientes)
    foto1 TEXT,
    foto2 TEXT,
    foto3 TEXT,
    foto4 TEXT,
    foto5 TEXT,

    -- Coordenadas separadas (extraídas de ubicacion)
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),

    -- Control de duplicados
    CONSTRAINT unique_cuenta_fecha UNIQUE (cuenta_contrato, fecha_carga)
);

-- ========================================
-- ÍNDICES PARA MEJORAR EL RENDIMIENTO
-- ========================================

-- Índice principal por cuenta contrato (CAMPO CLAVE)
CREATE INDEX idx_inspecciones_cuenta_contrato ON inspecciones(cuenta_contrato);

-- Índice por fecha de carga (para consultas diarias)
CREATE INDEX idx_inspecciones_fecha_carga ON inspecciones(fecha_carga);

-- Índice por supervisor
CREATE INDEX idx_inspecciones_supervisor ON inspecciones(supervisor_id);

-- Índice por distrito (para filtros geográficos)
CREATE INDEX idx_inspecciones_distrito ON inspecciones(distrito);

-- Índice por empresa instaladora
CREATE INDEX idx_inspecciones_empresa ON inspecciones(empresa_instaladora);

-- Índice por inspector
CREATE INDEX idx_inspecciones_inspector ON inspecciones(nombre_dni_inspector);

-- Índice compuesto para búsquedas por rango de fechas
CREATE INDEX idx_inspecciones_fecha_cuenta ON inspecciones(fecha_carga, cuenta_contrato);

-- Índice para coordenadas geográficas
CREATE INDEX idx_inspecciones_ubicacion ON inspecciones(latitud, longitud);


-- ========================================
-- COMENTARIOS DESCRIPTIVOS
-- ========================================

COMMENT ON TABLE inspecciones IS 'Tabla principal de registros de inspecciones diarias';
COMMENT ON COLUMN inspecciones.cuenta_contrato IS 'Identificador único de la cuenta (CAMPO CLAVE)';
COMMENT ON COLUMN inspecciones.fecha_carga IS 'Fecha en que se cargó el registro (automática)';
COMMENT ON COLUMN inspecciones.supervisor_id IS 'Supervisor que realizó la carga';
COMMENT ON COLUMN inspecciones.ubicacion IS 'Coordenadas en formato: latitud,longitud';
COMMENT ON COLUMN inspecciones.foto1 IS 'Fotografía 1 en formato Base64 o URL';
COMMENT ON COLUMN inspecciones.foto2 IS 'Fotografía 2 en formato Base64 o URL';
COMMENT ON COLUMN inspecciones.foto3 IS 'Fotografía 3 en formato Base64 o URL';
COMMENT ON COLUMN inspecciones.foto4 IS 'Fotografía 4 en formato Base64 o URL';
COMMENT ON COLUMN inspecciones.foto5 IS 'Fotografía 5 en formato Base64 o URL';


-- ========================================
-- 3. TABLA DE HISTORIAL DE CARGAS
-- Para auditoría de cargas masivas
-- ========================================
DROP TABLE IF EXISTS historial_cargas CASCADE;

CREATE TABLE historial_cargas (
    id SERIAL PRIMARY KEY,
    supervisor_id INTEGER REFERENCES supervisores(id),
    fecha_carga TIMESTAMP DEFAULT NOW(),
    nombre_archivo VARCHAR(255),
    total_registros INTEGER,
    registros_exitosos INTEGER,
    registros_fallidos INTEGER,
    errores TEXT,
    estado VARCHAR(50) DEFAULT 'COMPLETADO' -- COMPLETADO, PARCIAL, FALLIDO
);

CREATE INDEX idx_historial_supervisor ON historial_cargas(supervisor_id);
CREATE INDEX idx_historial_fecha ON historial_cargas(fecha_carga);

COMMENT ON TABLE historial_cargas IS 'Auditoría de cargas masivas desde Excel';


-- ========================================
-- 4. TABLA DE REGISTROS DUPLICADOS
-- Para control de duplicados detectados
-- ========================================
DROP TABLE IF EXISTS registros_duplicados CASCADE;

CREATE TABLE registros_duplicados (
    id SERIAL PRIMARY KEY,
    cuenta_contrato VARCHAR(100),
    fecha_carga DATE,
    fecha_deteccion TIMESTAMP DEFAULT NOW(),
    supervisor_id INTEGER REFERENCES supervisores(id),
    accion VARCHAR(50), -- IGNORADO, ACTUALIZADO, REVISADO
    observacion TEXT
);

CREATE INDEX idx_duplicados_cuenta ON registros_duplicados(cuenta_contrato);
CREATE INDEX idx_duplicados_fecha ON registros_duplicados(fecha_carga);


-- ========================================
-- 5. VISTAS ÚTILES
-- ========================================

-- Vista de inspecciones con nombre de supervisor
CREATE OR REPLACE VIEW v_inspecciones_completas AS
SELECT
    i.*,
    s.nombre as supervisor_nombre,
    s.usuario as supervisor_usuario
FROM inspecciones i
LEFT JOIN supervisores s ON i.supervisor_id = s.id;

COMMENT ON VIEW v_inspecciones_completas IS 'Vista con datos completos incluyendo información del supervisor';


-- Vista de estadísticas diarias
CREATE OR REPLACE VIEW v_estadisticas_diarias AS
SELECT
    fecha_carga,
    COUNT(*) as total_inspecciones,
    COUNT(DISTINCT distrito) as total_distritos,
    COUNT(DISTINCT empresa_instaladora) as total_empresas,
    COUNT(DISTINCT nombre_dni_inspector) as total_inspectores,
    COUNT(foto1) as inspecciones_con_foto1,
    COUNT(foto2) as inspecciones_con_foto2,
    COUNT(foto3) as inspecciones_con_foto3,
    COUNT(foto4) as inspecciones_con_foto4,
    COUNT(foto5) as inspecciones_con_foto5
FROM inspecciones
GROUP BY fecha_carga
ORDER BY fecha_carga DESC;

COMMENT ON VIEW v_estadisticas_diarias IS 'Resumen estadístico por día';


-- Vista de inspecciones por distrito
CREATE OR REPLACE VIEW v_inspecciones_por_distrito AS
SELECT
    distrito,
    fecha_carga,
    COUNT(*) as total,
    COUNT(foto1) as con_fotos
FROM inspecciones
GROUP BY distrito, fecha_carga
ORDER BY fecha_carga DESC, distrito;


-- ========================================
-- 6. FUNCIONES ÚTILES
-- ========================================

-- Función para extraer coordenadas del campo ubicacion
CREATE OR REPLACE FUNCTION extraer_coordenadas()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ubicacion IS NOT NULL AND NEW.ubicacion LIKE '%,%' THEN
        BEGIN
            NEW.latitud := CAST(SPLIT_PART(NEW.ubicacion, ',', 1) AS DECIMAL(10, 8));
            NEW.longitud := CAST(SPLIT_PART(NEW.ubicacion, ',', 2) AS DECIMAL(11, 8));
        EXCEPTION WHEN OTHERS THEN
            NEW.latitud := NULL;
            NEW.longitud := NULL;
        END;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para extraer coordenadas automáticamente
DROP TRIGGER IF EXISTS trigger_extraer_coordenadas ON inspecciones;
CREATE TRIGGER trigger_extraer_coordenadas
    BEFORE INSERT OR UPDATE ON inspecciones
    FOR EACH ROW
    EXECUTE FUNCTION extraer_coordenadas();


-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar timestamp
DROP TRIGGER IF EXISTS trigger_actualizar_timestamp_inspecciones ON inspecciones;
CREATE TRIGGER trigger_actualizar_timestamp_inspecciones
    BEFORE UPDATE ON inspecciones
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp();

DROP TRIGGER IF EXISTS trigger_actualizar_timestamp_supervisores ON supervisores;
CREATE TRIGGER trigger_actualizar_timestamp_supervisores
    BEFORE UPDATE ON supervisores
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp();


-- ========================================
-- 7. POLÍTICAS DE SEGURIDAD (RLS)
-- Row Level Security - Opcional
-- ========================================

-- Habilitar RLS (descomenta si lo necesitas)
-- ALTER TABLE supervisores ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE inspecciones ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE historial_cargas ENABLE ROW LEVEL SECURITY;

-- Política: Los supervisores pueden ver todos los registros
-- CREATE POLICY "Supervisores pueden ver inspecciones" ON inspecciones
--     FOR SELECT USING (true);

-- Política: Los supervisores pueden insertar registros
-- CREATE POLICY "Supervisores pueden insertar inspecciones" ON inspecciones
--     FOR INSERT WITH CHECK (true);

-- Política: Los supervisores pueden actualizar sus propios registros
-- CREATE POLICY "Supervisores pueden actualizar sus inspecciones" ON inspecciones
--     FOR UPDATE USING (supervisor_id = current_setting('app.current_user_id')::integer);


-- ========================================
-- 8. DATOS DE EJEMPLO (OPCIONAL)
-- ========================================

-- Insertar un registro de ejemplo
INSERT INTO inspecciones (
    supervisor_id,
    cuenta_contrato,
    instalacion,
    cliente_dni,
    direccion_instalacion,
    distrito,
    turno,
    medidor,
    nombre_dni_inspector,
    ubicacion,
    empresa_instaladora
) VALUES (
    1,
    '12345678',
    'DONET',
    'CLIENTE DE PRUEBA - DNI: 12345678',
    'AV. EJEMPLO 123',
    'SAN ISIDRO',
    'TURNO 1',
    'TURNO 3',
    'Emilio Motoche Tenazoa - DNI 42119022',
    '-12.1234567,-77.1234567',
    'DONISUGAS S.A.C'
);


-- ========================================
-- 9. CONSULTAS ÚTILES PARA VERIFICACIÓN
-- ========================================

-- Ver todas las tablas creadas
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Ver todos los índices
-- SELECT indexname, tablename FROM pg_indexes
-- WHERE schemaname = 'public' ORDER BY tablename, indexname;

-- Ver todas las vistas
-- SELECT table_name FROM information_schema.views
-- WHERE table_schema = 'public';

-- Contar registros por fecha
-- SELECT fecha_carga, COUNT(*) as total
-- FROM inspecciones
-- GROUP BY fecha_carga
-- ORDER BY fecha_carga DESC;

-- Ver estadísticas de la tabla
-- SELECT COUNT(*) as total_registros,
--        COUNT(DISTINCT cuenta_contrato) as cuentas_unicas,
--        MIN(fecha_carga) as primera_carga,
--        MAX(fecha_carga) as ultima_carga
-- FROM inspecciones;


-- ========================================
-- 10. CONSULTAS PARA MANTENIMIENTO
-- ========================================

-- Eliminar registros duplicados (mantener el más reciente)
-- DELETE FROM inspecciones a
-- USING inspecciones b
-- WHERE a.cuenta_contrato = b.cuenta_contrato
--   AND a.fecha_carga = b.fecha_carga
--   AND a.id < b.id;

-- Vaciar todas las tablas (¡CUIDADO!)
-- TRUNCATE TABLE inspecciones, historial_cargas, registros_duplicados RESTART IDENTITY CASCADE;

-- Hacer backup de registros del día
-- CREATE TABLE inspecciones_backup_2025_01_28 AS
-- SELECT * FROM inspecciones WHERE fecha_carga = '2025-01-28';


-- ========================================
-- FIN DEL SCRIPT
-- ========================================

-- Verificación final
SELECT 'Script ejecutado correctamente' as mensaje,
       NOW() as fecha_ejecucion;

-- Mostrar resumen de tablas creadas
SELECT
    'supervisores' as tabla,
    COUNT(*) as registros
FROM supervisores
UNION ALL
SELECT
    'inspecciones' as tabla,
    COUNT(*) as registros
FROM inspecciones
UNION ALL
SELECT
    'historial_cargas' as tabla,
    COUNT(*) as registros
FROM historial_cargas;
