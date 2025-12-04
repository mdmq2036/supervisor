/**
 * Funciones auxiliares para mapa-ubicaciones.html
 * Incluye carga de usuarios, contratos y lógica de filtrado
 */

/**
 * Cargar usuarios para el filtro (Usuarios y Supervisores)
 */
async function cargarUsuarios() {
    const select = document.getElementById('filterUsuario');
    if (!select) return;

    // Guardar selección actual si existe
    const valorPrevio = select.value;

    // Limpiar opciones excepto la primera
    while (select.options.length > 1) {
        select.remove(1);
    }

    try {
        console.log('🔄 Cargando usuarios...');
        let todos = [];

        // 1. Intentar cargar de Supabase
        const { data: usuarios } = await supabase.from('usuarios').select('id, username, nombre').eq('activo', true);
        const { data: supervisores } = await supabase.from('supervisores').select('id, usuario, nombre').eq('activo', true);

        if (usuarios) {
            todos = todos.concat(usuarios.map(u => ({
                id: u.id,
                nombre: u.nombre || u.username,
                tipo: 'usuario'
            })));
        }

        if (supervisores) {
            todos = todos.concat(supervisores.map(s => ({
                id: s.id,
                nombre: s.nombre || s.usuario,
                tipo: 'supervisor'
            })));
        }

        // 2. Fallback: Si no hay datos, agregar al menos al usuario actual y algunos conocidos
        if (todos.length === 0) {
            console.warn('⚠️ No se pudieron cargar usuarios. Usando fallback.');
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser) {
                todos.push({
                    id: currentUser.id,
                    nombre: currentUser.nombre || currentUser.usuario || 'Usuario Actual',
                    tipo: 'usuario'
                });
            }
        }

        // 3. Eliminar duplicados (por ID)
        const unicos = new Map();
        todos.forEach(u => unicos.set(u.id, u));
        todos = Array.from(unicos.values());

        // 4. Ordenar y llenar select
        todos.sort((a, b) => a.nombre.localeCompare(b.nombre));

        todos.forEach(u => {
            const option = document.createElement('option');
            option.value = u.id;
            option.textContent = u.nombre;
            option.dataset.tipo = u.tipo;
            select.appendChild(option);
        });

        // Restaurar selección si sigue existiendo
        if (valorPrevio && [...select.options].some(o => o.value === valorPrevio)) {
            select.value = valorPrevio;
        }

        console.log(`✅ ${todos.length} usuarios cargados`);

    } catch (error) {
        console.error('❌ Error crítico cargando usuarios:', error);
    }
}

/**
 * Cargar contratos disponibles
 */
async function cargarContratosMap() {
    const select = document.getElementById('filterContrato');
    if (!select) return;

    while (select.options.length > 1) select.remove(1);

    try {
        const { data } = await supabase
            .from('ubicaciones_gps')
            .select('cuenta_contrato')
            .not('cuenta_contrato', 'is', null)
            .order('cuenta_contrato')
            .limit(1000);

        if (data) {
            const contratos = [...new Set(data.map(d => d.cuenta_contrato))].sort();
            contratos.forEach(c => {
                if (c) {
                    const opt = document.createElement('option');
                    opt.value = c;
                    opt.textContent = c;
                    select.appendChild(opt);
                }
            });
        }
    } catch (e) { console.error(e); }
}

/**
 * Cargar Ubicaciones con filtros
 */
async function cargarUbicaciones(initialLoad = false) {
    showLoading(true);

    try {
        // 1. Limpiar fechas en carga inicial para mostrar TODO el historial
        if (initialLoad) {
            const fechaInicio = document.getElementById('filterFechaInicio');
            const fechaFin = document.getElementById('filterFechaFin');
            if (fechaInicio) fechaInicio.value = '';
            if (fechaFin) fechaFin.value = '';
        }

        let query = supabase
            .from('ubicaciones_gps')
            .select('*')
            .order('timestamp_entrada', { ascending: false });

        // 2. Obtener valores de filtros
        const usuarioId = document.getElementById('filterUsuario')?.value;
        const contrato = document.getElementById('filterContrato')?.value;
        const fechaInicio = document.getElementById('filterFechaInicio')?.value;
        const fechaFin = document.getElementById('filterFechaFin')?.value;
        const deviceType = document.getElementById('filterDeviceType')?.value;

        // 3. Aplicar filtros solo si tienen valor
        if (usuarioId) query = query.eq('usuario_id', usuarioId);
        if (contrato) query = query.eq('cuenta_contrato', contrato);

        if (fechaInicio) query = query.gte('timestamp_entrada', `${fechaInicio}T00:00:00`);
        if (fechaFin) query = query.lte('timestamp_entrada', `${fechaFin}T23:59:59`);

        if (deviceType && deviceType !== 'Todos') query = query.eq('device_type', deviceType);

        // 4. Limitar resultados (aumentado a 1000 para ver más historia)
        query = query.limit(1000);

        const { data, error } = await query;

        if (error) throw error;

        // 5. Actualizar interfaz
        actualizarMapa(data);
        actualizarEstadisticas(data);
        mostrarListaUbicaciones(data);

        if (data.length === 0) {
            console.log('ℹ️ No se encontraron ubicaciones con los filtros actuales');
        }

    } catch (error) {
        console.error('Error cargando ubicaciones:', error);
    } finally {
        showLoading(false);
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        cargarUsuarios();
        cargarContratosMap();
        // Cargar ubicaciones iniciales (limpiando fechas)
        cargarUbicaciones(true);
    }, 1000);
});
