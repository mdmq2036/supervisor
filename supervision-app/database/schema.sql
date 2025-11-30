-- Crear extensión para UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de supervisores
CREATE TABLE IF NOT EXISTS supervisores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de supervisiones
CREATE TABLE IF NOT EXISTS supervisiones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supervisor_id UUID REFERENCES supervisores(id) ON DELETE CASCADE,
  cuenta_contrato VARCHAR(100) NOT NULL,
  observacion1 TEXT,
  observacion2 TEXT,
  cuenta_nueva VARCHAR(100),
  numero_medidor VARCHAR(100),
  fecha DATE NOT NULL,
  foto1_url TEXT,
  foto2_url TEXT,
  foto3_url TEXT,
  foto4_url TEXT,
  foto5_url TEXT,
  foto1_drive_id VARCHAR(255),
  foto2_drive_id VARCHAR(255),
  foto3_drive_id VARCHAR(255),
  foto4_drive_id VARCHAR(255),
  foto5_drive_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_supervisiones_supervisor ON supervisiones(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_supervisiones_fecha ON supervisiones(fecha);
CREATE INDEX IF NOT EXISTS idx_supervisiones_cuenta ON supervisiones(cuenta_contrato);

-- Insertar supervisor de ejemplo (password: admin123)
INSERT INTO supervisores (username, password, nombre, email)
VALUES ('admin', 'admin123', 'Administrador', 'admin@supervision.com')
ON CONFLICT (username) DO NOTHING;

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
DROP TRIGGER IF EXISTS update_supervisores_updated_at ON supervisores;
CREATE TRIGGER update_supervisores_updated_at
    BEFORE UPDATE ON supervisores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_supervisiones_updated_at ON supervisiones;
CREATE TRIGGER update_supervisiones_updated_at
    BEFORE UPDATE ON supervisiones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE supervisores ENABLE ROW LEVEL SECURITY;
ALTER TABLE supervisiones ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para supervisores
CREATE POLICY "Supervisores pueden ver su propia información"
    ON supervisores FOR SELECT
    USING (true);

-- Políticas de seguridad para supervisiones
CREATE POLICY "Supervisores pueden ver sus propias supervisiones"
    ON supervisiones FOR SELECT
    USING (true);

CREATE POLICY "Supervisores pueden insertar sus propias supervisiones"
    ON supervisiones FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Supervisores pueden actualizar sus propias supervisiones"
    ON supervisiones FOR UPDATE
    USING (true);
