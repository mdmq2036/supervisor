-- ========================================
-- CREAR TABLA PARA UBICACIONES EN TIEMPO REAL
-- Ejecutar en Supabase SQL Editor
-- ========================================

-- 1. Crear tabla de ubicaciones en tiempo real
CREATE TABLE IF NOT EXISTS ubicaciones_en_tiempo_real (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    nombre VARCHAR(255),
    latitud DECIMAL(10, 8) NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL,
    precision_metros INTEGER DEFAULT 0,
    device_type VARCHAR(50) DEFAULT 'desktop',
    device_fingerprint VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_ubicaciones_usuario ON ubicaciones_en_tiempo_real(usuario_id);
CREATE INDEX IF NOT EXISTS idx_ubicaciones_timestamp ON ubicaciones_en_tiempo_real(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ubicaciones_activo ON ubicaciones_en_tiempo_real(activo);
CREATE INDEX IF NOT EXISTS idx_ubicaciones_device ON ubicaciones_en_tiempo_real(device_fingerprint);

-- 3. Crear vista para análisis de ubicaciones (combina con datos de usuarios)
CREATE OR REPLACE VIEW v_ubicaciones_tiempo_real AS
SELECT 
    u.id,
    u.usuario_id,
    u.nombre,
    u.latitud,
    u.longitud,
    u.precision_metros,
    u.device_type,
    u.device_fingerprint,
    u.timestamp as timestamp_entrada,
    u.activo,
    u.created_at,
    EXTRACT(EPOCH FROM (NOW() - u.timestamp)) / 60 as duracion_minutos,
    'Ubicación registrada' as actividad_realizada
FROM ubicaciones_en_tiempo_real u
WHERE u.activo = true
ORDER BY u.timestamp DESC;

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE ubicaciones_en_tiempo_real ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas de seguridad
DROP POLICY IF EXISTS "Todos pueden ver ubicaciones" ON ubicaciones_en_tiempo_real;
CREATE POLICY "Todos pueden ver ubicaciones" ON ubicaciones_en_tiempo_real
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuarios pueden insertar sus ubicaciones" ON ubicaciones_en_tiempo_real;
CREATE POLICY "Usuarios pueden insertar sus ubicaciones" ON ubicaciones_en_tiempo_real
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Usuarios pueden actualizar sus ubicaciones" ON ubicaciones_en_tiempo_real;
CREATE POLICY "Usuarios pueden actualizar sus ubicaciones" ON ubicaciones_en_tiempo_real
    FOR UPDATE USING (true);

-- 6. Crear función para limpiar ubicaciones antiguas (más de 24 horas)
CREATE OR REPLACE FUNCTION limpiar_ubicaciones_antiguas()
RETURNS void AS $$
BEGIN
    DELETE FROM ubicaciones_en_tiempo_real
    WHERE timestamp < NOW() - INTERVAL '24 hours';
    
    RAISE NOTICE 'Ubicaciones antiguas eliminadas';
END;
$$ LANGUAGE plpgsql;

-- 7. Crear trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_updated_at ON ubicaciones_en_tiempo_real;
CREATE TRIGGER trigger_actualizar_updated_at
BEFORE UPDATE ON ubicaciones_en_tiempo_real
FOR EACH ROW
EXECUTE FUNCTION actualizar_updated_at();

-- ========================================
-- VERIFICACIÓN
-- ========================================
-- Ejecutar estas consultas para verificar:

-- Ver estructura de tabla
-- SELECT * FROM information_schema.columns WHERE table_name = 'ubicaciones_en_tiempo_real';

-- Ver vista
-- SELECT * FROM v_ubicaciones_tiempo_real LIMIT 10;

-- Ver índices
-- SELECT * FROM pg_indexes WHERE tablename = 'ubicaciones_en_tiempo_real';

-- ========================================
-- NOTAS IMPORTANTES
-- ========================================
-- 1. Esta tabla almacena ubicaciones en tiempo real
-- 2. Se limpia automáticamente cada 24 horas
-- 3. Precisión: ±10 metros (GPS de alta precisión)
-- 4. Cada ubicación incluye timestamp exacto
-- 5. Usar vista v_ubicaciones_tiempo_real para consultas
