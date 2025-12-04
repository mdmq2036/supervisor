// Estado de la aplicación
let currentUser = null;

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    initSupabase();
    setupEventListeners();
    setCurrentDate();

    // Verificar si hay sesión activa
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showScreen('menuScreen');
        updateUserInfo();
    }
});

// Configurar event listeners
function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Set fecha actual por defecto
    const fechaInput = document.getElementById('fecha');
    if (fechaInput) {
        fechaInput.value = new Date().toISOString().split('T')[0];
    }
}

// Manejar login
async function handleLogin(e) {
    e.preventDefault();
    showLoading(true);

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        if (!supabase) {
            showMessage('Error: Supabase no está configurado', 'error');
            showLoading(false);
            return;
        }

        let userData = null;
        let isSpecialUser = false;

        // Primero intentar buscar en la tabla 'usuarios' (para prueba y admin)
        try {
            const { data: usuarioData, error: usuarioError } = await supabase
                .from('usuarios')
                .select('*')
                .eq('username', username)
                .eq('activo', true)
                .single();

            if (usuarioData && !usuarioError) {
                // Usuario encontrado en tabla usuarios
                // Por ahora validación simple (en producción usar bcrypt en backend)
                if ((username === 'prueba' && password === 'prueba2025') ||
                    (username === 'admin' && password === 'admin2025')) {
                    userData = usuarioData;
                    isSpecialUser = true;

                    // Adaptar estructura para compatibilidad
                    userData.usuario = userData.username;
                } else {
                    showMessage('Usuario o contraseña incorrectos', 'error');
                    showLoading(false);
                    return;
                }
            }
        } catch (err) {
            console.log('Usuario no encontrado en tabla usuarios, buscando en supervisores...');
        }

        // Si no se encontró en usuarios, buscar en supervisores
        if (!userData) {
            const { data: supervisorData, error: supervisorError } = await supabase
                .from('supervisores')
                .select('*')
                .eq('usuario', username)
                .eq('password', password)
                .eq('activo', true)
                .single();

            if (supervisorError || !supervisorData) {
                showMessage('Usuario o contraseña incorrectos', 'error');
                showLoading(false);
                return;
            }

            userData = supervisorData;
        }

        // Verificar límite de dispositivos para usuario "prueba"
        if (username === 'prueba' && typeof DeviceFingerprint !== 'undefined') {
            try {
                const deviceFP = new DeviceFingerprint();
                const fingerprint = await deviceFP.generate();

                // Verificar acceso del dispositivo
                const { data: accessCheck, error: accessError } = await supabase
                    .rpc('check_device_access', {
                        p_user_id: userData.id,
                        p_device_fingerprint: fingerprint
                    });

                if (accessError) {
                    console.error('Error verificando acceso:', accessError);
                } else if (accessCheck && !accessCheck.allowed) {
                    showMessage(accessCheck.message || 'Acceso denegado. Límite de dispositivos alcanzado.', 'error');
                    showLoading(false);
                    return;
                } else if (accessCheck && accessCheck.allowed) {
                    const deviceCount = accessCheck.device_count || 0;
                    if (deviceCount >= 4) {
                        setTimeout(() => {
                            alert(`⚠️ ADVERTENCIA: Tienes ${deviceCount} de 5 dispositivos registrados. Quedan ${5 - deviceCount} disponibles.`);
                        }, 1000);
                    }
                }
            } catch (fpError) {
                console.error('Error con device fingerprint:', fpError);
            }
        }

        // PASO CRÍTICO: Solicitar GPS OBLIGATORIO antes de permitir acceso
        showLoading(true);
        const gpsPermitido = await solicitarGPSObligatorio();
        
        if (!gpsPermitido) {
            showMessage('❌ GPS es obligatorio para usar la aplicación', 'error');
            showLoading(false);
            return;
        }

        currentUser = userData;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showScreen('menuScreen');
        updateUserInfo();

        // Limpiar formulario
        document.getElementById('loginForm').reset();

    } catch (error) {
        console.error('Error en login:', error);
        showMessage('Error al iniciar sesión', 'error');
    }

    showLoading(false);
}

// NUEVA FUNCIÓN: Solicitar GPS OBLIGATORIO al login
async function solicitarGPSObligatorio() {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            alert('⚠️ Tu navegador no soporta geolocalización. Por favor usa un navegador moderno.');
            resolve(false);
            return;
        }

        // Crear modal de solicitud
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(15, 23, 42, 0.95);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        modal.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #1e293b, #0f172a);
                padding: 40px;
                border-radius: 16px;
                text-align: center;
                max-width: 450px;
                border: 2px solid #00f2fe;
                box-shadow: 0 0 30px rgba(0, 242, 254, 0.2);
            ">
                <h2 style="color: #00f2fe; margin-top: 0; font-size: 1.8em;">📍 ACTIVAR GPS - OBLIGATORIO</h2>
                <p style="color: #94a3b8; line-height: 1.8; font-size: 1.1em; margin: 20px 0;">
                    Para usar esta aplicación, <strong>debes activar tu ubicación GPS</strong>.
                </p>
                <div style="background: rgba(0, 242, 254, 0.1); padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #00f2fe;">
                    <p style="margin: 0; color: #94a3b8; font-size: 0.95em; line-height: 1.6;">
                        ✓ Precisión: ±10 metros<br>
                        ✓ Datos encriptados<br>
                        ✓ Solo para supervisión<br>
                        <strong style="color: #ef4444;">⚠️ OBLIGATORIO PARA CONTINUAR</strong>
                    </p>
                </div>
                <p style="color: #f59e0b; font-weight: 600; margin: 15px 0;">
                    Selecciona una opción:
                </p>
                <button id="btnActivarGPS" style="
                    background: linear-gradient(135deg, #00f2fe, #4facfe);
                    color: #0f172a;
                    border: none;
                    padding: 14px 40px;
                    border-radius: 8px;
                    font-weight: 700;
                    cursor: pointer;
                    font-size: 1.05em;
                    margin: 10px 5px;
                    transition: all 0.3s ease;
                    width: 100%;
                ">
                    ✓ ACTIVAR SIEMPRE
                </button>
                <button id="btnActivarSoloUso" style="
                    background: rgba(79, 172, 254, 0.2);
                    color: #4facfe;
                    border: 2px solid #4facfe;
                    padding: 14px 40px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    font-size: 1.05em;
                    margin: 10px 5px;
                    transition: all 0.3s ease;
                    width: 100%;
                ">
                    ⏱️ SOLO CUANDO ESTÁ EN USO
                </button>
                <button id="btnDenegarGPS" style="
                    background: rgba(239, 68, 68, 0.1);
                    color: #fca5a5;
                    border: 2px solid #ef4444;
                    padding: 14px 40px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    font-size: 1.05em;
                    margin: 10px 5px;
                    transition: all 0.3s ease;
                    width: 100%;
                ">
                    ✗ DENEGAR
                </button>
                <p style="color: #64748b; font-size: 0.85em; margin-top: 20px;">
                    Nota: Debes seleccionar una opción para continuar
                </p>
            </div>
        `;

        document.body.appendChild(modal);

        // Botón: Activar Siempre
        document.getElementById('btnActivarGPS').addEventListener('click', () => {
            modal.remove();
            navigator.geolocation.watchPosition(
                async (position) => {
                    console.log('✅ GPS Activado (SIEMPRE) - Precisión:', Math.round(position.coords.accuracy), 'metros');
                    
                    // Guardar ubicación
                    await guardarUbicacionLogin(position, 'always');
                    localStorage.setItem('gpsPermiso', 'always');
                    resolve(true);
                },
                (error) => {
                    console.error('❌ Error GPS:', error);
                    alert('❌ No se pudo acceder al GPS. Acceso denegado.');
                    resolve(false);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });

        // Botón: Solo Cuando Está en Uso
        document.getElementById('btnActivarSoloUso').addEventListener('click', () => {
            modal.remove();
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    console.log('✅ GPS Activado (SOLO EN USO) - Precisión:', Math.round(position.coords.accuracy), 'metros');
                    
                    // Guardar ubicación
                    await guardarUbicacionLogin(position, 'while_using');
                    localStorage.setItem('gpsPermiso', 'while_using');
                    resolve(true);
                },
                (error) => {
                    console.error('❌ Error GPS:', error);
                    alert('❌ No se pudo acceder al GPS. Acceso denegado.');
                    resolve(false);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });

        // Botón: Denegar
        document.getElementById('btnDenegarGPS').addEventListener('click', () => {
            modal.remove();
            alert('❌ GPS es obligatorio. No puedes continuar sin activarlo.');
            resolve(false);
        });
    });
}

// NUEVA FUNCIÓN: Guardar ubicación al login
async function guardarUbicacionLogin(position, permiso) {
    try {
        if (!currentUser) return;

        const response = await fetch('/api/ubicaciones/guardar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                usuario_id: currentUser.id,
                nombre: currentUser.nombre || currentUser.usuario || 'Usuario',
                latitud: position.coords.latitude,
                longitud: position.coords.longitude,
                precision_metros: Math.round(position.coords.accuracy),
                device_type: /mobile/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
                device_fingerprint: getDeviceFingerprint(),
                actividad: `Login - GPS ${permiso}`
            })
        });

        if (response.ok) {
            console.log('✅ Ubicación de login guardada en servidor');
        }
    } catch (error) {
        console.error('Error guardando ubicación:', error);
    }
}

// NUEVA FUNCIÓN: Obtener fingerprint del dispositivo
function getDeviceFingerprint() {
    const userAgent = navigator.userAgent;
    const language = navigator.language;
    const screenResolution = `${screen.width}x${screen.height}`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    const fingerprint = `${userAgent}|${language}|${screenResolution}|${timezone}`;
    return btoa(fingerprint).substring(0, 32);
}

// Manejar logout
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showScreen('loginScreen');
    document.getElementById('loginForm').reset();
}

// Actualizar información del usuario
function updateUserInfo() {
    const supervisorName = document.getElementById('supervisorName');
    if (supervisorName && currentUser) {
        supervisorName.textContent = currentUser.nombre;
    }
}

// Establecer fecha actual
function setCurrentDate() {
    const dateDisplay = document.getElementById('currentDate');
    if (dateDisplay) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateDisplay.textContent = new Date().toLocaleDateString('es-ES', options);
    }
}

// Manejar registro de inspección
async function handleRegister(e) {
    e.preventDefault();
    showLoading(true);

    try {
        // Obtener datos del formulario
        const formData = {
            supervisor_id: currentUser.id,
            cuenta_contrato: document.getElementById('cuentaContrato').value,
            fecha: document.getElementById('fecha').value,
            observacion1: document.getElementById('observacion1').value,
            observacion2: document.getElementById('observacion2').value
        };

        // Procesar las fotos
        const fotos = [];
        for (let i = 1; i <= 5; i++) {
            const fileInput = document.getElementById(`foto${i}`);
            if (fileInput.files.length > 0) {
                const base64 = await fileToBase64(fileInput.files[0]);
                fotos.push(base64);
            } else {
                fotos.push(null);
            }
        }

        formData.foto1 = fotos[0];
        formData.foto2 = fotos[1];
        formData.foto3 = fotos[2];
        formData.foto4 = fotos[3];
        formData.foto5 = fotos[4];

        if (!supabase) {
            // Modo de desarrollo
            console.log('Datos a guardar:', formData);
            showMessage('Registro guardado correctamente (modo desarrollo)', 'success');
            resetForm();
            showLoading(false);
            return;
        }

        // Actualizar en Supabase (UPDATE, no INSERT)
        // Los registros ya existen desde la carga masiva, solo agregamos fotos y observaciones
        const { data, error } = await supabase
            .from('inspecciones')
            .update({
                foto1: formData.foto1,
                foto2: formData.foto2,
                foto3: formData.foto3,
                foto4: formData.foto4,
                foto5: formData.foto5,
                observaciones: formData.observacion1,
                observaciones_2: formData.observacion2
            })
            .eq('cuenta_contrato', formData.cuenta_contrato)
            .eq('supervisor_id', currentUser.id)
            .select();

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {
            throw new Error('No se encontró la cuenta contrato para actualizar');
        }

        showMessage('Fotos y observaciones guardadas correctamente', 'success');
        resetForm();

    } catch (error) {
        console.error('Error al guardar registro:', error);
        showMessage('Error al guardar el registro', 'error');
    }

    showLoading(false);
}

// Buscar registros
async function buscarRegistros() {
    showLoading(true);

    const cuenta = document.getElementById('searchCuenta').value;
    const fechaInicio = document.getElementById('searchFechaInicio').value;
    const fechaFin = document.getElementById('searchFechaFin').value;

    try {
        if (!supabase) {
            // Modo de desarrollo - datos de ejemplo
            const ejemploRegistros = [
                {
                    id: 1,
                    cuenta_contrato: '12345',
                    fecha: '2025-01-15',
                    observacion1: 'Inspección inicial realizada',
                    observacion2: 'Todo en orden',
                    foto1: null,
                    foto2: null,
                    foto3: null,
                    foto4: null,
                    foto5: null
                }
            ];
            displayResults(ejemploRegistros);
            showLoading(false);
            return;
        }

        // Construir query - FILTRAR POR SUPERVISOR (excepto usuario "prueba")
        let query = supabase
            .from('inspecciones')
            .select('*')
            .order('fecha_carga', { ascending: false });

        // **NUEVO: Solo filtrar por supervisor si NO es usuario "prueba"**
        if (currentUser.usuario !== 'prueba') {
            query = query.eq('supervisor_id', currentUser.id);
        }

        if (cuenta) {
            query = query.ilike('cuenta_contrato', `%${cuenta}%`);
        }

        if (fechaInicio) {
            query = query.gte('fecha_carga', fechaInicio);
        }

        if (fechaFin) {
            query = query.lte('fecha_carga', fechaFin);
        }

        const { data, error } = await query;

        if (error) {
            throw error;
        }

        displayResults(data);

    } catch (error) {
        console.error('Error al buscar registros:', error);
        showMessage('Error al buscar registros', 'error');
    }

    showLoading(false);
}

// Mostrar resultados de búsqueda
function displayResults(registros) {
    const container = document.getElementById('resultsContainer');

    if (!registros || registros.length === 0) {
        container.innerHTML = '<p class="no-results">No se encontraron registros</p>';
        return;
    }

    container.innerHTML = '';

    registros.forEach(registro => {
        const card = document.createElement('div');
        card.className = 'result-card';

        card.innerHTML = `
            <div class="result-header">
                <h4>Cuenta: ${registro.cuenta_contrato}</h4>
                <span class="date-badge">${formatDate(registro.fecha_carga)}</span>
            </div>

            <div class="result-info">
                <div class="info-item">
                    <span class="info-label">Distrito:</span>
                    <span class="info-value">${registro.distrito || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Dirección:</span>
                    <span class="info-value">${registro.direccion_instalacion || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Inspector:</span>
                    <span class="info-value">${registro.nombre_dni_inspector || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Observaciones:</span>
                    <span class="info-value">${registro.observaciones || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Observaciones 2:</span>
                    <span class="info-value">${registro.observaciones_2 || 'N/A'}</span>
                </div>
            </div>

            <div class="result-photos">
                ${generatePhotoHTML(registro.foto1, 1)}
                ${generatePhotoHTML(registro.foto2, 2)}
                ${generatePhotoHTML(registro.foto3, 3)}
                ${generatePhotoHTML(registro.foto4, 4)}
                ${generatePhotoHTML(registro.foto5, 5)}
            </div>
        `;

        container.appendChild(card);
    });
}

// Generar HTML para foto
function generatePhotoHTML(foto, index) {
    if (foto) {
        return `
            <div class="result-photo" onclick="viewPhoto('${foto}')">
                <img src="${foto}" alt="Foto ${index}">
            </div>
        `;
    } else {
        return `
            <div class="result-photo empty-photo">
                <span>-</span>
            </div>
        `;
    }
}

// Ver foto en grande
function viewPhoto(fotoUrl) {
    window.open(fotoUrl, '_blank');
}

// Formatear fecha
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

// Preview de imagen
function previewImage(index) {
    const fileInput = document.getElementById(`foto${index}`);
    const preview = document.getElementById(`preview${index}`);

    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();

        reader.onload = function (e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview ${index}">`;
            preview.classList.add('has-image');
        };

        reader.readAsDataURL(fileInput.files[0]);
    }
}

// Convertir archivo a Base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Resetear formulario
function resetForm() {
    document.getElementById('registerForm').reset();

    // Limpiar previews de fotos
    for (let i = 1; i <= 5; i++) {
        const preview = document.getElementById(`preview${i}`);
        preview.innerHTML = `
            <span class="upload-icon">📷</span>
            <span class="upload-text">Foto ${i}</span>
        `;
        preview.classList.remove('has-image');
    }

    // Restablecer fecha actual
    document.getElementById('fecha').value = new Date().toISOString().split('T')[0];
}

// Cargar cuentas contrato del supervisor
async function loadCuentasContrato() {
    if (!currentUser || !supabase) {
        console.log('No hay usuario o supabase no está configurado');
        return;
    }

    try {
        // **NUEVO: Usuario "prueba" ve TODAS las cuentas**
        let query = supabase
            .from('inspecciones')
            .select('cuenta_contrato, supervisor_id, supervisores(nombre)')
            .order('cuenta_contrato');

        // Solo filtrar por supervisor_id si NO es usuario admin
        // Usuarios con acceso total: prueba, admin, luiggy
        const usuariosAdmin = ['prueba', 'admin', 'luiggy'];
        if (!usuariosAdmin.includes(currentUser.usuario)) {
            query = query.eq('supervisor_id', currentUser.id);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Obtener cuentas únicas
        const cuentasUnicas = [...new Set(data.map(item => item.cuenta_contrato))];

        // Llenar el select
        const selectElement = document.getElementById('cuentaContrato');
        if (selectElement) {
            selectElement.innerHTML = '<option value="">Seleccione una cuenta contrato</option>';
            cuentasUnicas.forEach(cuenta => {
                const option = document.createElement('option');
                option.value = cuenta;
                option.textContent = cuenta;
                selectElement.appendChild(option);
            });

            const userType = currentUser.usuario === 'prueba' ? 'TODAS las' : 'las';
            console.log(`Cargadas ${cuentasUnicas.length} ${userType} cuentas contrato`);
        }
    } catch (error) {
        console.error('Error al cargar cuentas contrato:', error);
    }
}

// Cambiar de pantalla
function showScreen(screenId) {
    // Ocultar todas las pantallas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // Mostrar la pantalla solicitada
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');

        // Si es la pantalla de registro, cargar las cuentas contrato
        if (screenId === 'registerScreen') {
            loadCuentasContrato();
        }

        // Si es la pantalla de consulta, cargar todos los registros automáticamente
        if (screenId === 'consultScreen') {
            cargarTodosLosRegistros();
        }
    }
}

// Cargar todos los registros del supervisor automáticamente
async function cargarTodosLosRegistros() {
    showLoading(true);

    try {
        if (!supabase || !currentUser) {
            showMessage('Error: No hay sesión activa', 'error');
            showLoading(false);
            return;
        }

        // **NUEVO: Usuario "prueba" ve TODOS los registros**
        let query = supabase
            .from('inspecciones')
            .select('*')
            .order('fecha_carga', { ascending: false })
            .limit(100); // Limitar a 100 para no sobrecargar

        // Solo filtrar por supervisor_id si NO es usuario admin
        // Usuarios con acceso total: prueba, admin, luiggy
        const usuariosAdmin = ['prueba', 'admin', 'luiggy'];
        if (!usuariosAdmin.includes(currentUser.usuario)) {
            query = query.eq('supervisor_id', currentUser.id);
        }

        const { data, error } = await query;

        if (error) {
            throw error;
        }

        const userType = currentUser.usuario === 'prueba' ? 'TODOS los supervisores' : `el supervisor ${currentUser.nombre}`;
        console.log(`Se encontraron ${data.length} registros de ${userType}`);
        displayResults(data);

    } catch (error) {
        console.error('Error al cargar registros:', error);
        showMessage(`Error al cargar registros: ${error.message}`, 'error');
        displayResults([]);
    }

    showLoading(false);
}

// Mostrar/ocultar loading
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        if (show) {
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    }
}

// Mostrar mensajes
function showMessage(message, type = 'info') {
    // Crear elemento de mensaje
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;

    // Estilos del mensaje
    Object.assign(messageDiv.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 25px',
        borderRadius: '8px',
        color: '#fff',
        fontWeight: '600',
        zIndex: '10000',
        animation: 'slideInRight 0.3s ease',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
    });

    // Color según tipo
    if (type === 'success') {
        messageDiv.style.background = '#00d4ff';
        messageDiv.style.color = '#0a1628';
    } else if (type === 'error') {
        messageDiv.style.background = '#ff4444';
    } else {
        messageDiv.style.background = '#2a3f5f';
    }

    document.body.appendChild(messageDiv);

    // Remover después de 3 segundos
    setTimeout(() => {
        messageDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 300);
    }, 3000);
}

// Agregar animaciones CSS para mensajes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    .date-badge {
        background: var(--cyan);
        color: var(--primary-bg);
        padding: 5px 15px;
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: 600;
    }
`;
document.head.appendChild(style);

// ==========================================
// FUNCIONES PARA ACCESO ADMINISTRATIVO
// ==========================================

function requestAdminAccess() {
    const modal = document.getElementById('adminLoginModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    }
}

function closeAdminModal() {
    const modal = document.getElementById('adminLoginModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        document.getElementById('adminAccessForm').reset();
    }
}

// Manejar env�o del formulario de acceso administrativo
document.addEventListener('DOMContentLoaded', () => {
    const adminForm = document.getElementById('adminAccessForm');
    if (adminForm) {
        adminForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const user = document.getElementById('adminAccessUser').value;
            const pass = document.getElementById('adminAccessPass').value;
            
            if (!user || !pass) {
                showMessage('Por favor ingrese usuario y contrase�a', 'error');
                return;
            }

            showLoading(true);

            try {
                // Verificar credenciales de administrador
                // Primero intentamos validaci�n directa si es el admin por defecto
                if (user === 'admin' && pass === 'admin2025') {
                    showMessage('Acceso concedido', 'success');
                    setTimeout(() => {
                        window.location.href = 'carga-masiva.html';
                    }, 1000);
                    return;
                }

                // Si no es el default, verificamos en base de datos
                const { data, error } = await supabase
                    .from('usuarios')
                    .select('*')
                    .eq('username', user)
                    .eq('rol', 'admin')
                    .eq('activo', true)
                    .single();

                if (error || !data) {
                    throw new Error('Credenciales inv�lidas');
                }
                
                // Validaci�n simplificada para otros admins (si los hubiera)
                // En producci�n usar bcrypt
                showMessage('Solo el administrador principal puede acceder a esta funci�n por ahora', 'error');

            } catch (error) {
                console.error('Error de acceso:', error);
                showMessage('Credenciales de administrador incorrectas', 'error');
            } finally {
                showLoading(false);
            }
        });
    }
});

// ==========================================
// FUNCIONES DE GEOLOCALIZACIÓN AUTOMÁTICA
// ==========================================

/**
 * Solicitar permisos de geolocalización al usuario
 * Se ejecuta automáticamente después del login exitoso
 */
async function requestGeolocationPermission() {
    // Verificar soporte de geolocalización
    if (!('geolocation' in navigator)) {
        console.warn('⚠️ Geolocalización no soportada en este navegador');
        showMessage('⚠️ Tu navegador no soporta geolocalización', 'warning');
        return;
    }

    try {
        console.log('📍 Solicitando permisos de geolocalización...');

        // Solicitar permiso y obtener ubicación
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                resolve,
                reject,
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0
                }
            );
        });

        const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
        };

        console.log('✅ Ubicación GPS obtenida:', locationData);

        // Guardar en localStorage
        localStorage.setItem('lastKnownLocation', JSON.stringify(locationData));

        // NUEVO: Registrar inmediatamente en la base de datos
        await registerLocationImmediately(locationData);

        // Mostrar notificación al usuario
        showMessage(`📍 Ubicación GPS activada (Precisión: ${Math.round(locationData.accuracy)}m)`, 'success');

        // Iniciar rastreo continuo si GeolocationTracker está disponible
        if (typeof GeolocationTracker !== 'undefined' && currentUser) {
            initializeLocationTracking();
        } else {
            console.warn('⚠️ GeolocationTracker no disponible, solo se registró ubicación inicial');
        }

    } catch (error) {
        console.error('❌ Error al obtener ubicación GPS:', error);

        let errorMessage = '';
        if (error.code === 1) {
            errorMessage = '⚠️ Permiso de ubicación denegado. Por favor, habilite la ubicación en la configuración de su navegador.';
        } else if (error.code === 2) {
            errorMessage = '⚠️ Ubicación no disponible. Verifique que el GPS esté habilitado.';
        } else if (error.code === 3) {
            errorMessage = '⚠️ Tiempo de espera agotado. Intente nuevamente.';
        } else {
            errorMessage = `⚠️ No se pudo obtener la ubicación GPS: ${error.message}`;
        }

        showMessage(errorMessage, 'warning');
    }
}

/**
 * Registrar ubicación inmediatamente en la base de datos
 */
async function registerLocationImmediately(locationData) {
    try {
        console.log('💾 Registrando ubicación en base de datos...');

        // Obtener device fingerprint (simplificado para evitar errores)
        let deviceFingerprint = `device-${currentUser.id}-${Date.now()}`;
        try {
            if (window.DeviceFingerprint) {
                const fp = new window.DeviceFingerprint();
                if (typeof fp.generate === 'function') {
                    deviceFingerprint = await fp.generate();
                    console.log('✅ Device fingerprint generado');
                }
            }
        } catch (fpError) {
            console.warn('⚠️ No se pudo generar device fingerprint, usando fallback:', fpError.message);
        }

        // Detectar tipo de dispositivo
        const userAgent = navigator.userAgent.toLowerCase();
        const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
        const deviceType = isMobile ? 'mobile' : 'desktop';

        // Obtener IP (simplificado)
        let ipAddress = 'unknown';
        try {
            const ipResponse = await fetch('https://api.ipify.org?format=json', { timeout: 3000 });
            const ipData = await ipResponse.json();
            ipAddress = ipData.ip;
        } catch (ipError) {
            console.warn('No se pudo obtener IP:', ipError);
        }

        // Llamar al endpoint de registro
        const response = await fetch(`${window.location.origin}/api/ubicaciones/entrada`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usuario_id: currentUser.id,
                device_fingerprint: deviceFingerprint,
                device_type: deviceType,
                latitud: locationData.latitude,
                longitud: locationData.longitude,
                precision_metros: locationData.accuracy,
                actividad_realizada: 'sesión activa',
                cuenta_contrato: null,
                ip_address: ipAddress,
                user_agent: navigator.userAgent
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
            throw new Error(errorData.error || `Error ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Ubicación registrada exitosamente:', data);

        // Guardar session_id para posible uso posterior
        if (data.session_id) {
            localStorage.setItem('currentLocationSessionId', data.session_id);
        }

        return data.session_id;

    } catch (error) {
        console.error('❌ Error al registrar ubicación:', error);
        showMessage('⚠️ No se pudo guardar la ubicación en el servidor', 'warning');
        throw error;
    }
}

/**
 * Inicializar rastreo continuo de ubicación
 */
function initializeLocationTracking() {
    try {
        if (!window.geoTracker) {
            window.geoTracker = new GeolocationTracker();
        }

        // Iniciar rastreo automático
        window.geoTracker.startTracking(
            currentUser.id,
            'sesión activa',
            null
        );

        console.log('✅ Rastreo de ubicación iniciado');
    } catch (error) {
        console.error('Error al inicializar rastreo:', error);
    }
}

/**
 * Verificar y solicitar ubicación si hay sesión activa
 */
document.addEventListener('DOMContentLoaded', () => {
    // Si ya hay un usuario logueado, solicitar permisos
    setTimeout(() => {
        if (currentUser) {
            requestGeolocationPermission();
        }
    }, 1000);
});

