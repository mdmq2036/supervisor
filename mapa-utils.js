/**
 * Funciones auxiliares para mapa-ubicaciones.html
 * Incluye carga de usuarios, contratos y lógica de filtrado
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
        // Intentamos obtener todos, ignorando RLS si es posible (aunque desde cliente está limitado)
        const { data: usuarios, error: errorUsuarios } = await supabase
            .from('usuarios')
            .select('id, username, nombre')
            .eq('activo', true);

        // 2. Obtener supervisores
        const { data: supervisores, error: errorSupervisores } = await supabase
            .from('supervisores')
            .select('id, usuario, nombre')
            .eq('activo', true);

        if (errorUsuarios) console.warn('Aviso cargando usuarios:', errorUsuarios);
        if (errorSupervisores) console.warn('Aviso cargando supervisores:', errorSupervisores);

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

        // Si la lista está vacía, intentar obtener usuarios únicos de la tabla de ubicaciones
        if (todos.length === 0) {
            console.log('⚠️ Tablas de usuarios vacías o inaccesibles. Intentando extraer de historial...');
            const { data: historial } = await supabase
                .from('ubicaciones_gps')
                .select('username, nombre')
                .limit(1000);

            if (historial) {
                const unicos = new Map();
                historial.forEach(h => {
                    if (h.username && !unicos.has(h.username)) {
                        unicos.set(h.username, {
                            id: h.username, // Usamos username como ID temporal
                            nombre: h.nombre || h.username,
                            tipo: 'historial'
                        });
                    }
                });
                todos = Array.from(unicos.values());
            }
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
    }
}

/**
 * Cargar contratos disponibles para el filtro
 */
async function cargarContratosMap() {
    const select = document.getElementById('filterContrato');
    if (!select) return;

    // Limpiar opciones
    while (select.options.length > 1) {
        select.remove(1);
    }

    try {
        console.log('🔄 Cargando contratos...');

        // Obtener contratos únicos de la tabla de ubicaciones
        const { data, error } = await supabase
            .from('ubicaciones_gps')
            .select('cuenta_contrato')
            .not('cuenta_contrato', 'is', null)
            .order('cuenta_contrato');

        if (error) throw error;

        // Filtrar únicos
        const contratosUnicos = [...new Set(data.map(item => item.cuenta_contrato))];
        contratosUnicos.sort();

        // Llenar select
        contratosUnicos.forEach(contrato => {
            if (contrato && contrato.trim() !== '') {
                const option = document.createElement('option');
                option.value = contrato;
                option.textContent = contrato;
                select.appendChild(option);
            }
        });

        console.log(`✅ ${contratosUnicos.length} contratos cargados`);

    } catch (error) {
        console.error('❌ Error al cargar contratos:', error);
    }
}

/**
 * Sobrescribir función cargarUbicaciones para incluir filtro de contrato
 */
async function cargarUbicaciones(initialLoad = false) {
    showLoading(true);

    try {
        let query = supabase
            .from('ubicaciones_gps')
            .select('*')
            .order('timestamp_entrada', { ascending: false });

        // Filtros
        const usuarioId = document.getElementById('filterUsuario')?.value;
        const contrato = document.getElementById('filterContrato')?.value;
        const fechaInicio = document.getElementById('filterFechaInicio')?.value;
        const fechaFin = document.getElementById('filterFechaFin')?.value;
        const deviceType = document.getElementById('filterDeviceType')?.value;

        // Aplicar filtros
        if (usuarioId) {
            // Verificar si es ID numérico (usuario/supervisor) o texto (username del historial)
            if (!isNaN(usuarioId)) {
                // Es ID numérico, pero en ubicaciones_gps no guardamos el ID del usuario directamente
                // Guardamos username. Necesitamos buscar el username asociado a este ID
                // OJO: Esto es complejo. Mejor filtramos por username si es posible.
                // Simplificación: Si el filtro tiene un dataset tipo, usar lógica específica
                const select = document.getElementById('filterUsuario');
                const selectedOption = select.options[select.selectedIndex];
                const tipo = selectedOption.dataset.tipo;

                if (tipo === 'historial') {
                    query = query.eq('username', usuarioId);
                } else {
                    // Intentar filtrar por nombre o username que coincida con el texto de la opción
                    // Esto no es ideal pero funciona si no tenemos la relación directa
                    const nombre = selectedOption.textContent;
                    query = query.or(`username.eq.${nombre},nombre.eq.${nombre}`);
                }
            } else {
                query = query.eq('username', usuarioId);
            }
        }

        if (contrato) {
            query = query.eq('cuenta_contrato', contrato);
        }

        if (fechaInicio) {
            query = query.gte('timestamp_entrada', `${fechaInicio}T00:00:00`);
        }

        if (fechaFin) {
            query = query.lte('timestamp_entrada', `${fechaFin}T23:59:59`);
        } else if (initialLoad) {
            // Por defecto hoy
            const hoy = new Date().toISOString().split('T')[0];
            query = query.gte('timestamp_entrada', `${hoy}T00:00:00`);

            // Actualizar inputs de fecha
            if (document.getElementById('filterFechaInicio')) {
                document.getElementById('filterFechaInicio').value = hoy;
            }
            if (document.getElementById('filterFechaFin')) {
                document.getElementById('filterFechaFin').value = hoy;
            }
        }

        if (deviceType) {
            query = query.eq('device_type', deviceType);
        }

        // Limitar resultados para no saturar el mapa
        query = query.limit(500);

        const { data, error } = await query;

        if (error) throw error;

        actualizarMapa(data);
        actualizarEstadisticas(data);
        mostrarListaUbicaciones(data);

    } catch (error) {
        console.error('Error al cargar ubicaciones:', error);
        if (typeof mostrarMensaje === 'function') {
            mostrarMensaje('Error al cargar datos del mapa', 'error');
        }
    } finally {
        showLoading(false);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Esperar un poco para asegurar que Supabase esté listo
    setTimeout(() => {
        cargarUsuarios();
        cargarContratosMap();
    }, 1000);
});
