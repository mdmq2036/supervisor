// ========================================
// CARGADOR DE VARIABLES DE ENTORNO
// Sistema DONET
// ========================================

/**
 * Carga las variables de entorno desde el archivo .env
 * Este archivo debe cargarse ANTES de config.js
 */

const ENV = {
    SUPABASE_URL: '',
    SUPABASE_ANON_KEY: '',
    APP_NAME: 'DONET',
    APP_VERSION: '1.0',
    ENVIRONMENT: 'development'
};

/**
 * Carga el archivo .env
 * Nota: En navegador necesitamos una forma alternativa ya que fetch de archivos locales
 * puede tener restricciones CORS
 */
async function loadEnvFile() {
    try {
        // Intentar cargar el archivo .env
        const response = await fetch('.env');

        if (!response.ok) {
            console.warn('⚠️ No se pudo cargar .env, usando valores por defecto');
            return false;
        }

        const text = await response.text();
        parseEnvFile(text);
        console.log('✅ Variables de entorno cargadas desde .env');
        return true;
    } catch (error) {
        console.warn('⚠️ Error al cargar .env:', error.message);
        console.info('ℹ️ Usando configuración de config.js');
        return false;
    }
}

/**
 * Parsea el contenido del archivo .env
 */
function parseEnvFile(content) {
    const lines = content.split('\n');

    lines.forEach(line => {
        // Ignorar comentarios y líneas vacías
        line = line.trim();
        if (!line || line.startsWith('#')) {
            return;
        }

        // Parsear línea KEY=VALUE
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            let value = match[2].trim();

            // Remover comillas si existen
            value = value.replace(/^["']|["']$/g, '');

            ENV[key] = value;
        }
    });
}

/**
 * Obtiene una variable de entorno
 */
function getEnv(key, defaultValue = '') {
    return ENV[key] || defaultValue;
}

/**
 * Verifica si las variables de entorno están configuradas
 */
function isEnvConfigured() {
    return ENV.SUPABASE_URL !== 'TU_SUPABASE_URL_AQUI' &&
           ENV.SUPABASE_URL !== '' &&
           ENV.SUPABASE_ANON_KEY !== 'TU_SUPABASE_ANON_KEY_AQUI' &&
           ENV.SUPABASE_ANON_KEY !== '';
}

// Exportar para uso global
window.ENV = ENV;
window.getEnv = getEnv;
window.loadEnvFile = loadEnvFile;
window.isEnvConfigured = isEnvConfigured;
