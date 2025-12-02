// ========================================
// CONFIGURACIÓN DE SUPABASE - SISTEMA DONET
// ========================================
//
// OPCIÓN 1 (RECOMENDADA): Usar archivo .env
// - Edita el archivo .env con tus credenciales
// - Las credenciales se cargan automáticamente
//
// OPCIÓN 2: Configurar directamente aquí
// - Reemplaza los valores de SUPABASE_CONFIG
// - Solo si no usas .env
//
// ========================================

const SUPABASE_CONFIG = {
    // Credenciales obtenidas desde el endpoint /api/config del servidor
    // NUNCA coloques credenciales directamente aquí por seguridad
    url: '',
    anonKey: ''
};

// Inicializar cliente de Supabase
let supabase;

async function initSupabase() {
    try {
        // Obtener credenciales desde el servidor (más seguro)
        const response = await fetch('/api/config');
        if (response.ok) {
            const config = await response.json();
            SUPABASE_CONFIG.url = config.SUPABASE_URL;
            SUPABASE_CONFIG.anonKey = config.SUPABASE_ANON_KEY;
            console.log('✅ Credenciales obtenidas del servidor');
        } else {
            console.warn('⚠️ No se pudieron obtener credenciales del servidor');
        }
    } catch (error) {
        console.warn('⚠️ Error al obtener configuración del servidor:', error.message);
    }

    // Validar que las credenciales estén configuradas
    if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
        console.error('❌ Credenciales de Supabase no configuradas');
        console.info('📝 Configure las variables de entorno SUPABASE_URL y SUPABASE_ANON_KEY');
        console.info('📖 Consulte la documentación para más detalles');
        return false;
    }

    try {
        supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        console.log('✅ Supabase inicializado correctamente');
        const projectId = SUPABASE_CONFIG.url.split('//')[1]?.split('.')[0] || 'unknown';
        console.log(`📊 Proyecto: ${projectId}...`);
        return true;
    } catch (error) {
        console.error('❌ Error al inicializar Supabase:', error);
        return false;
    }
}

// SQL para crear las tablas necesarias en Supabase
/*
-- Tabla de supervisores
CREATE TABLE supervisores (
    id SERIAL PRIMARY KEY,
    usuario VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de registros de inspección
CREATE TABLE registros_inspeccion (
    id SERIAL PRIMARY KEY,
    supervisor_id INTEGER REFERENCES supervisores(id),
    cuenta_contrato VARCHAR(100) NOT NULL,
    fecha DATE NOT NULL,
    observacion1 TEXT,
    observacion2 TEXT,
    foto1 TEXT,
    foto2 TEXT,
    foto3 TEXT,
    foto4 TEXT,
    foto5 TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_registros_supervisor ON registros_inspeccion(supervisor_id);
CREATE INDEX idx_registros_cuenta ON registros_inspeccion(cuenta_contrato);
CREATE INDEX idx_registros_fecha ON registros_inspeccion(fecha);

-- Insertar un usuario de prueba (la contraseña debe estar hasheada en producción)
-- Usuario: admin, Contraseña: admin123
INSERT INTO supervisores (usuario, password, nombre)
VALUES ('admin', 'admin123', 'Administrador');

-- Habilitar Row Level Security (RLS) - Opcional pero recomendado
ALTER TABLE supervisores ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_inspeccion ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso (ejemplo básico)
CREATE POLICY "Los supervisores pueden ver sus propios datos" ON supervisores
    FOR SELECT USING (auth.uid() = id::text OR true);

CREATE POLICY "Todos pueden ver registros" ON registros_inspeccion
    FOR SELECT USING (true);

CREATE POLICY "Los supervisores pueden insertar registros" ON registros_inspeccion
    FOR INSERT WITH CHECK (true);
*/
