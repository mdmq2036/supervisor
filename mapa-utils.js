/**
 * Funciones auxiliares para mapa-ubicaciones.html
 * Incluye carga de usuarios y otras utilidades
 */

/**
 * Cargar usuarios para el filtro (Usuarios y Supervisores)
 */
async function cargarUsuarios() {
    const select = document.getElementById('filterUsuario');
    if (!select) {
        console.error('❌ Select filterUsuario no encontrado');
        return;
    }

    // Limpiar opciones excepto la primera ("Todos los usuarios")
    while (select.options.length > 1) {
        select.remove(1);
    }

    try {
        console.log('🔄 Cargando usuarios...');

        // 1. Obtener usuarios (admin, prueba, luiggy)
        const { data: usuarios, error: errorUsuarios } = await supabase
            .from('usuarios')
            .select('id, username, nombre')
            .eq('activo', true);

        // 2. Obtener supervisores
        const { data: supervisores, error: errorSupervisores } = await supabase
            .from('supervisores')
            .select('id, usuario, nombre')
            .eq('activo', true);

        if (errorUsuarios) {
            console.error('Error cargando usuarios:', errorUsuarios);
        }
        if (errorSupervisores) {
            console.error('Error cargando supervisores:', errorSupervisores);
        }

        // Combinar listas
        let todos = [];

        if (usuarios && usuarios.length > 0) {
            todos = todos.concat(usuarios.map(u => ({
                id: u.id,
                nombre: u.nombre || u.username,
                tipo: 'usuario'
            })));
        }

        if (supervisores && supervisores.length > 0) {
            todos = todos.concat(supervisores.map(s => ({
                id: s.id,
                nombre: s.nombre || s.usuario,
                tipo: 'supervisor'
            })));
        }

        // Ordenar alfabéticamente
        todos.sort((a, b) => a.nombre.localeCompare(b.nombre));

        // Llenar select
        todos.forEach(u => {
            const option = document.createElement('option');
            option.value = u.id;
            option.textContent = u.nombre;
            option.dataset.tipo = u.tipo;
            select.appendChild(option);
        });

        console.log(`✅ ${todos.length} usuarios cargados en el filtro`);

    } catch (error) {
        console.error('❌ Error al cargar usuarios:', error);
        if (typeof mostrarMensaje === 'function') {
            mostrarMensaje('Error al cargar lista de usuarios', 'error');
        }
    }
}
