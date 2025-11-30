// Script para generar hashes bcrypt de las contraseñas
// Ejecutar con: node generar-hashes.js

const bcrypt = require('bcrypt');

const passwords = {
    'prueba2025': 'Usuario de Prueba',
    'admin2025': 'Usuario Administrador'
};

console.log('='.repeat(60));
console.log('GENERANDO HASHES BCRYPT PARA CONTRASEÑAS');
console.log('='.repeat(60));
console.log('');

async function generateHashes() {
    for (const [password, description] of Object.entries(passwords)) {
        try {
            const hash = await bcrypt.hash(password, 10);
            console.log(`${description}:`);
            console.log(`  Contraseña: ${password}`);
            console.log(`  Hash: ${hash}`);
            console.log('');
        } catch (error) {
            console.error(`Error generando hash para ${password}:`, error);
        }
    }
    
    console.log('='.repeat(60));
    console.log('COPIA ESTOS HASHES EN EL SCRIPT SQL');
    console.log('='.repeat(60));
}

generateHashes().catch(console.error);
