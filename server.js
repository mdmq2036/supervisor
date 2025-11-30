// ========================================
// SERVIDOR NODE.JS - SISTEMA DONET
// ========================================
// Servidor Express para despliegue en Render
// ========================================

require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware para servir archivos estáticos
app.use(express.static('.'));
app.use(express.json());

// Middleware para inyectar variables de entorno en el cliente
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    next();
});

// Ruta para obtener configuración pública (sin exponer claves privadas)
app.get('/api/config', (req, res) => {
    res.json({
        SUPABASE_URL: process.env.SUPABASE_URL || '',
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
        APP_NAME: process.env.APP_NAME || 'DONET',
        APP_VERSION: process.env.APP_VERSION || '1.0',
        ENVIRONMENT: process.env.ENVIRONMENT || 'production'
    });
});

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Rutas adicionales
app.get('/carga-masiva', (req, res) => {
    res.sendFile(path.join(__dirname, 'carga-masiva.html'));
});

app.get('/verificar-datos', (req, res) => {
    res.sendFile(path.join(__dirname, 'verificar-datos.html'));
});

// Health check para Render
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.ENVIRONMENT || 'production'
    });
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`✅ Servidor DONET corriendo`);
    console.log(`📡 Puerto: ${PORT}`);
    console.log(`🌍 Entorno: ${process.env.ENVIRONMENT || 'production'}`);
    console.log(`🔗 URL: http://localhost:${PORT}`);
    console.log(`========================================`);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
    console.error('❌ Error no manejado:', err);
});

process.on('uncaughtException', (err) => {
    console.error('❌ Excepción no capturada:', err);
    process.exit(1);
});
