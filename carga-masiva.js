// Estado de la aplicación de carga masiva
let currentFile = null;
let excelData = [];
let currentUser = null;
let processedStats = {
    total: 0,
    success: 0,
    duplicates: 0,
    errors: 0
};
let errorLog = [];

// Mapeo de columnas del Excel a campos de la BD
const COLUMN_MAPPING = {
    'Instalación': 'instalacion',
    'Cuenta contrato': 'cuenta_contrato',
    'CLIENTE - DNI': 'cliente_dni',
    'Dirección de instalación - Distrito': 'direccion_instalacion',
    'DISTRITO': 'distrito',
    'Teléfono local': 'telefono_local',
    'TURNO': 'turno',
    'Puntos Corresponden Instalar': 'puntos_corresponden_instalar',
    'HS': 'hs',
    'MEDIDOR': 'medidor',
    'ORDEN DE ATENCIÓN': 'orden_atencion',
    'MONTANTE ENCUENTRO ACTIVO / PASIVO': 'montante_encuentro_activo_pasivo',
    'ENCUENTRO RAMAL ECTOGAS': 'encuentro_ramal_ectogas',
    'OBSERVACIONES': 'observaciones',
    'OBJETO EXACTO': 'objeto_exacto',
    'NOMBRE Y DNI DEL INSPECTOR': 'nombre_dni_inspector',
    'UBICACIÓN': 'ubicacion',
    'FISE UNICA': 'fise_unica',
    'EMPRESA INSTALADORA': 'empresa_instaladora',
    'NUMERO DE MEDIDOR': 'numero_medidor',
    'NUMERO DE CONTADOR': 'numero_contador',
    'HORARIO, COMENTARIO, RUSF DEL INSPECTO': 'horario_comentario_rusf_del_inspecto',
    'CELULAR 1': 'celular_1',
    'CELULAR 2': 'celular_2',
    'CELULAR 3': 'celular_3',
    'CELULAR 4': 'celular_4',
    'APELLIDOS DEL INSPECTO': 'apellidos_del_inspecto',
    'OBSERVACIONES ': 'observaciones_2',
    'NUMERO Y/O PISO': 'numero_piso'
};

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    initSupabase();
    setupEventListeners();
    checkUserSession();
});

// Verificar sesión de usuario
function checkUserSession() {
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) {
        alert('Debes iniciar sesión primero');
        window.location.href = 'index.html';
        return;
    }
    currentUser = JSON.parse(savedUser);
}

// Configurar event listeners
function setupEventListeners() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const processBtn = document.getElementById('processBtn');

    // Click en área de carga
    uploadArea.addEventListener('click', () => fileInput.click());

    // Selección de archivo
    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    // Botón de procesar
    processBtn.addEventListener('click', processExcelData);
}

// Manejar selección de archivo
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

// Procesar archivo
function handleFile(file) {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        showMessage('Por favor selecciona un archivo Excel válido (.xlsx o .xls)', 'error');
        return;
    }

    currentFile = file;
    displayFileInfo(file);
    readExcelFile(file);
}

// Mostrar información del archivo
function displayFileInfo(file) {
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatFileSize(file.size);
    document.getElementById('fileInfo').style.display = 'block';
}

// Formatear tamaño de archivo
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Leer archivo Excel
function readExcelFile(file) {
    showLoading(true);
    addLog('Leyendo archivo Excel...', 'info');

    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            // Leer la primera hoja
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Convertir a JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null });

            excelData = jsonData;
            document.getElementById('rowCount').textContent = jsonData.length;

            addLog(`✓ Archivo leído correctamente: ${jsonData.length} registros encontrados`, 'success');
            document.getElementById('processBtn').style.display = 'flex';

            showLoading(false);
        } catch (error) {
            console.error('Error al leer el archivo:', error);
            addLog(`✗ Error al leer el archivo: ${error.message}`, 'error');
            showLoading(false);
        }
    };

    reader.onerror = function() {
        addLog('✗ Error al cargar el archivo', 'error');
        showLoading(false);
    };

    reader.readAsArrayBuffer(file);
}

// Procesar datos del Excel y cargar a Supabase
async function processExcelData() {
    if (excelData.length === 0) {
        showMessage('No hay datos para procesar', 'error');
        return;
    }

    // Mostrar secciones de progreso
    document.getElementById('statsSection').style.display = 'block';
    document.getElementById('logSection').style.display = 'block';

    // Resetear estadísticas
    processedStats = { total: excelData.length, success: 0, duplicates: 0, errors: 0 };
    errorLog = [];

    updateStats();
    addLog('🚀 Iniciando proceso de carga masiva...', 'info');

    // Deshabilitar botón
    document.getElementById('processBtn').disabled = true;
    document.getElementById('processBtn').textContent = 'Procesando...';

    try {
        const startTime = Date.now();

        for (let i = 0; i < excelData.length; i++) {
            const row = excelData[i];
            const progress = ((i + 1) / excelData.length) * 100;
            updateProgress(progress);

            try {
                await processRow(row, i + 1);
            } catch (error) {
                console.error(`Error en fila ${i + 1}:`, error);
                processedStats.errors++;
                errorLog.push({
                    fila: i + 1,
                    cuenta: row['Cuenta contrato'] || 'N/A',
                    error: error.message
                });
                addLog(`✗ Error en fila ${i + 1}: ${error.message}`, 'error');
            }

            updateStats();
        }

        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        addLog(`✓ Proceso completado en ${duration} segundos`, 'success');
        addLog(`📊 Total: ${processedStats.total} | Exitosos: ${processedStats.success} | Duplicados: ${processedStats.duplicates} | Errores: ${processedStats.errors}`, 'info');

        // Guardar historial de carga
        await saveLoadHistory();

        if (errorLog.length > 0) {
            document.getElementById('downloadErrorsBtn').style.display = 'flex';
        }

        showMessage('Carga masiva completada', 'success');

    } catch (error) {
        console.error('Error en proceso de carga:', error);
        addLog(`✗ Error crítico: ${error.message}`, 'error');
        showMessage('Error en la carga masiva', 'error');
    }

    // Rehabilitar botón
    document.getElementById('processBtn').disabled = false;
    document.getElementById('processBtn').innerHTML = '<span>🚀</span><span>Procesar y Cargar Datos</span>';
}

// Mapear nombre de inspector a supervisor_id
async function mapInspectorToSupervisor(nombreInspector) {
    if (!nombreInspector || !supabase) {
        return currentUser.id; // Por defecto, asignar al usuario actual
    }

    try {
        // Normalizar nombre del inspector (minúsculas, sin espacios extras)
        const nombreNormalizado = nombreInspector.toLowerCase().trim();

        // Buscar supervisor cuyo nombre esté contenido en el campo inspector
        const { data, error } = await supabase
            .from('supervisores')
            .select('id, nombre, usuario');

        if (error || !data) {
            return currentUser.id;
        }

        // Buscar coincidencia por nombre o usuario
        for (const supervisor of data) {
            const nombreSupervisor = supervisor.nombre.toLowerCase();
            const usuarioSupervisor = supervisor.usuario.toLowerCase();

            // Si el nombre del supervisor está en el campo inspector
            if (nombreNormalizado.includes(nombreSupervisor) ||
                nombreNormalizado.includes(usuarioSupervisor)) {
                return supervisor.id;
            }
        }

        // Si no se encuentra coincidencia, asignar al usuario actual
        return currentUser.id;

    } catch (error) {
        console.error('Error al mapear inspector:', error);
        return currentUser.id;
    }
}

// Procesar una fila del Excel
async function processRow(row, rowNumber) {
    // Validar cuenta contrato (campo clave)
    if (!row['Cuenta contrato']) {
        throw new Error('Cuenta contrato vacía');
    }

    // Obtener supervisor_id basado en el nombre del inspector
    const nombreInspector = row['NOMBRE Y DNI DEL INSPECTOR'];
    const supervisorId = await mapInspectorToSupervisor(nombreInspector);

    // Mapear datos del Excel a la estructura de la BD
    const registro = {
        supervisor_id: supervisorId,
        fecha_carga: new Date().toISOString().split('T')[0]
    };

    // Mapear todas las columnas
    for (const [excelCol, dbCol] of Object.entries(COLUMN_MAPPING)) {
        registro[dbCol] = row[excelCol] || null;
    }

    // Convertir puntos a número si existe
    if (registro.puntos_corresponden_instalar) {
        registro.puntos_corresponden_instalar = parseInt(registro.puntos_corresponden_instalar) || null;
    }

    if (!supabase) {
        // Modo de desarrollo
        console.log('Registro a insertar (modo dev):', registro);
        processedStats.success++;
        addLog(`✓ Fila ${rowNumber}: ${registro.cuenta_contrato}`, 'success');
        return;
    }

    // Verificar si ya existe (duplicado)
    const { data: existing } = await supabase
        .from('inspecciones')
        .select('id')
        .eq('cuenta_contrato', registro.cuenta_contrato)
        .eq('fecha_carga', registro.fecha_carga)
        .single();

    if (existing) {
        processedStats.duplicates++;
        addLog(`⚠ Fila ${rowNumber}: Duplicado - ${registro.cuenta_contrato}`, 'warning');

        // Registrar duplicado
        await supabase.from('registros_duplicados').insert([{
            cuenta_contrato: registro.cuenta_contrato,
            fecha_carga: registro.fecha_carga,
            supervisor_id: currentUser.id,
            accion: 'IGNORADO',
            observacion: `Detectado en carga masiva - fila ${rowNumber}`
        }]);

        return;
    }

    // Insertar registro
    const { error } = await supabase
        .from('inspecciones')
        .insert([registro]);

    if (error) {
        throw new Error(error.message);
    }

    processedStats.success++;
    addLog(`✓ Fila ${rowNumber}: ${registro.cuenta_contrato}`, 'success');
}

// Guardar historial de carga
async function saveLoadHistory() {
    if (!supabase) return;

    const historial = {
        supervisor_id: currentUser.id,
        nombre_archivo: currentFile.name,
        total_registros: processedStats.total,
        registros_exitosos: processedStats.success,
        registros_fallidos: processedStats.errors,
        errores: errorLog.length > 0 ? JSON.stringify(errorLog) : null,
        estado: processedStats.errors > 0 ? 'PARCIAL' : 'COMPLETADO'
    };

    try {
        await supabase.from('historial_cargas').insert([historial]);
        addLog('✓ Historial de carga guardado', 'info');
    } catch (error) {
        console.error('Error al guardar historial:', error);
    }
}

// Actualizar estadísticas
function updateStats() {
    document.getElementById('statTotal').textContent = processedStats.total;
    document.getElementById('statSuccess').textContent = processedStats.success;
    document.getElementById('statDuplicates').textContent = processedStats.duplicates;
    document.getElementById('statErrors').textContent = processedStats.errors;
}

// Actualizar barra de progreso
function updateProgress(percent) {
    const progressBar = document.getElementById('progressBar');
    progressBar.style.width = percent + '%';
    progressBar.textContent = Math.round(percent) + '%';
}

// Agregar entrada al log
function addLog(message, type = 'info') {
    const logContainer = document.getElementById('logContainer');
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;

    const timestamp = new Date().toLocaleTimeString();
    entry.textContent = `[${timestamp}] ${message}`;

    logContainer.appendChild(entry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

// Resetear carga
function resetUpload() {
    currentFile = null;
    excelData = [];
    document.getElementById('fileInput').value = '';
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('statsSection').style.display = 'none';
    document.getElementById('logSection').style.display = 'none';
    document.getElementById('processBtn').style.display = 'none';
    document.getElementById('downloadErrorsBtn').style.display = 'none';
    document.getElementById('logContainer').innerHTML = '';
    processedStats = { total: 0, success: 0, duplicates: 0, errors: 0 };
    errorLog = [];
    updateProgress(0);
    updateStats();
}

// Descargar reporte de errores
document.getElementById('downloadErrorsBtn').addEventListener('click', () => {
    if (errorLog.length === 0) {
        showMessage('No hay errores para descargar', 'info');
        return;
    }

    const csvContent = [
        ['Fila', 'Cuenta Contrato', 'Error'].join(','),
        ...errorLog.map(e => [e.fila, e.cuenta, e.error].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `errores_carga_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
});

// Mostrar loading
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.toggle('active', show);
    }
}

// Mostrar mensajes
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;

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

    if (type === 'success') {
        messageDiv.style.background = '#00d4ff';
        messageDiv.style.color = '#0a1628';
    } else if (type === 'error') {
        messageDiv.style.background = '#ff4444';
    } else {
        messageDiv.style.background = '#2a3f5f';
    }

    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => document.body.removeChild(messageDiv), 300);
    }, 3000);
}
