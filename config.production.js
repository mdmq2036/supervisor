// ========================================
// CONFIGURACIÓN DE SUPABASE - PRODUCCIÓN
// ========================================
// Este archivo carga las credenciales de forma segura desde el servidor
// NO contiene claves hardcodeadas
// ========================================

// Configuración de Supabase
let SUPABASE_CONFIG = {
    url: '',
    anonKey: ''
};

// Cargar configuración desde el servidor (variables de entorno de Render)
async function loadConfig() {
    try {
        const response = await fetch('/api/config');
        if (response.ok) {
            const config = await response.json();
            SUPABASE_CONFIG.url = config.SUPABASE_URL;
            SUPABASE_CONFIG.anonKey = config.SUPABASE_ANON_KEY;
            console.log('✅ Configuración cargada desde servidor (Render)');
            return true;
        } else {
            throw new Error('No se pudo cargar la configuración del servidor');
        }
    } catch (error) {
        console.error('❌ Error al cargar configuración:', error);
        return false;
    }
}

// Inicializar cliente de Supabase
let supabase;

async function initSupabase() {
    // Cargar configuración primero
    const configLoaded = await loadConfig();

    if (!configLoaded || !SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
        console.error('❌ No se pudo cargar la configuración de Supabase');
        console.error('📝 Verifica las variables de entorno en Render');
        return false;
    }

    try {
        supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        console.log('✅ Supabase inicializado correctamente');
        console.log('📊 Proyecto:', SUPABASE_CONFIG.url);
        return true;
    } catch (error) {
        console.error('❌ Error al inicializar Supabase:', error);
        return false;
    }
}
