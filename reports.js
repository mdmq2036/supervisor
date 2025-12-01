// ==========================================
// SISTEMA DE REPORTES - DONET
// ==========================================

let reportData = [];
let currentFilterType = 'month';

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    initializeReports();
});

function initializeReports() {
    // Llenar selector de años (últimos 5 años + año actual + próximo año)
    const yearSelect = document.getElementById('reportYear');
    if (yearSelect) {
        const currentYear = new Date().getFullYear();
        yearSelect.innerHTML = '';
        for (let year = currentYear - 2; year <= currentYear + 1; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            if (year === currentYear) option.selected = true;
            yearSelect.appendChild(option);
        }
    }

    // Establecer mes actual
    const monthSelect = document.getElementById('reportMonth');
    if (monthSelect) {
        monthSelect.value = new Date().getMonth() + 1;
    }

    // Establecer fechas por defecto en el filtro de rango
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const startDate = document.getElementById('reportStartDate');
    const endDate = document.getElementById('reportEndDate');
    if (startDate) startDate.value = formatDateForInput(firstDay);
    if (endDate) endDate.value = formatDateForInput(lastDay);
}

// Cambiar tipo de filtro
function setFilterType(type) {
    currentFilterType = type;

    // Actualizar botones
    document.getElementById('btnMonthFilter').classList.toggle('active', type === 'month');
    document.getElementById('btnRangeFilter').classList.toggle('active', type === 'range');

    // Mostrar/ocultar filtros
    document.getElementById('monthFilter').classList.toggle('active', type === 'month');
    document.getElementById('rangeFilter').classList.toggle('active', type === 'range');
}

// Generar reporte
async function generateReport() {
    showLoading(true);

    try {
        if (!supabase || !currentUser) {
            showMessage('Error: No hay sesión activa', 'error');
            return;
        }

        let startDate, endDate;

        if (currentFilterType === 'month') {
            const month = parseInt(document.getElementById('reportMonth').value);
            const year = parseInt(document.getElementById('reportYear').value);
            startDate = new Date(year, month - 1, 1);
            endDate = new Date(year, month, 0);
        } else {
            startDate = new Date(document.getElementById('reportStartDate').value);
            endDate = new Date(document.getElementById('reportEndDate').value);
        }

        // Formatear fechas para la consulta
        const startStr = formatDateForDB(startDate);
        const endStr = formatDateForDB(endDate);

        // Consultar registros
        let query = supabase
            .from('inspecciones')
            .select('*')
            .gte('fecha_carga', startStr)
            .lte('fecha_carga', endStr)
            .order('fecha_carga', { ascending: false });

        // Filtrar por supervisor excepto usuario "prueba"
        if (currentUser.usuario !== 'prueba' && currentUser.usuario !== 'admin') {
            query = query.eq('supervisor_id', currentUser.id);
        }

        const { data, error } = await query;

        if (error) throw error;

        reportData = data || [];
        console.log(`Reporte generado: ${reportData.length} registros encontrados`);

        // Actualizar contador
        const countBadge = document.getElementById('previewCount');
        if (countBadge) {
            countBadge.textContent = `${reportData.length} registros`;
        }

        // Mostrar preview de datos
        displayReportPreview(reportData);

        if (reportData.length === 0) {
            showMessage('No se encontraron registros para el periodo seleccionado', 'info');
        } else {
            showMessage(`Se encontraron ${reportData.length} registros`, 'success');
        }

    } catch (error) {
        console.error('Error generando reporte:', error);
        showMessage(`Error al generar reporte: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

// Mostrar preview de los datos
function displayReportPreview(data) {
    const container = document.getElementById('reportPreviewTable');
    if (!container) return;

    if (!data || data.length === 0) {
        container.innerHTML = '<p class="no-results">No hay registros para mostrar</p>';
        return;
    }

    // Crear tabla HTML
    let html = `
        <div class="report-table-container">
            <table class="report-preview-table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Cuenta Contrato</th>
                        <th>Distrito</th>
                        <th>Dirección</th>
                        <th>Inspector</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
    `;

    data.forEach((registro, index) => {
        html += `
            <tr>
                <td>${formatDateDisplay(registro.fecha_carga)}</td>
                <td>${registro.cuenta_contrato || 'N/A'}</td>
                <td>${registro.distrito || 'N/A'}</td>
                <td>${registro.direccion_instalacion || 'N/A'}</td>
                <td>${registro.nombre_dni_inspector || 'N/A'}</td>
                <td>
                    <button onclick="viewReportDetails(${index})" class="btn-view-detail">Ver</button>
                </td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = html;
}

// Ver detalles de un registro
function viewReportDetails(index) {
    if (!reportData[index]) return;

    const registro = reportData[index];
    let detailsHTML = '<div class="detail-modal-content">';

    // Agregar todos los campos importantes
    const fields = [
        { label: 'Cuenta Contrato', value: registro.cuenta_contrato },
        { label: 'Fecha', value: formatDateDisplay(registro.fecha_carga) },
        { label: 'Instalación', value: registro.instalacion },
        { label: 'Cliente/DNI', value: registro.cliente_dni },
        { label: 'Dirección', value: registro.direccion_instalacion },
        { label: 'Distrito', value: registro.distrito },
        { label: 'Teléfono', value: registro.telefono_local },
        { label: 'Turno', value: registro.turno },
        { label: 'Medidor', value: registro.medidor },
        { label: 'Inspector', value: registro.nombre_dni_inspector },
        { label: 'Empresa Instaladora', value: registro.empresa_instaladora },
        { label: 'Observaciones', value: registro.observaciones },
        { label: 'Observaciones 2', value: registro.observaciones_2 }
    ];

    fields.forEach(field => {
        if (field.value) {
            detailsHTML += `
                <div class="detail-row">
                    <strong>${field.label}:</strong> ${field.value}
                </div>
            `;
        }
    });

    detailsHTML += '</div>';

    // Mostrar en un alert o modal (puedes crear un modal personalizado)
    const modal = document.createElement('div');
    modal.className = 'detail-modal';
    modal.innerHTML = `
        <div class="detail-modal-box">
            <h3>Detalles del Registro</h3>
            ${detailsHTML}
            <button onclick="this.parentElement.parentElement.remove()" class="btn-primary">Cerrar</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Descargar reporte
async function downloadReport(format, type) {
    if (!reportData || reportData.length === 0) {
        showMessage('Primero debe generar un reporte con el botón Buscar', 'warning');
        return;
    }

    showLoading(true);

    try {
        if (format === 'csv') {
            downloadCSV(type);
        } else if (format === 'pdf') {
            downloadPDF(type);
        }
    } catch (error) {
        console.error('Error descargando reporte:', error);
        showMessage(`Error al descargar: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

// Generar y descargar CSV
function downloadCSV(type) {
    let csvContent = '';
    let filename = '';

    if (type === 'detailed') {
        // CSV Detallado - Todos los campos
        const headers = [
            'Fecha Carga', 'Cuenta Contrato', 'Instalación', 'Cliente DNI',
            'Dirección', 'Distrito', 'Teléfono', 'Turno', 'Puntos Instalar',
            'HS', 'Medidor', 'Orden Atención', 'Montante', 'Encuentro Ramal',
            'Observaciones', 'Inspector', 'Ubicación', 'FISE', 'Empresa Instaladora',
            'Número Medidor', 'Número Contador', 'Horario/Comentario', 'Celular 1',
            'Celular 2', 'Celular 3', 'Celular 4', 'Apellidos', 'Observaciones 2',
            'Número Piso'
        ];

        csvContent = headers.join(',') + '\n';

        reportData.forEach(registro => {
            const row = [
                formatDateDisplay(registro.fecha_carga),
                `"${registro.cuenta_contrato || ''}"`,
                `"${registro.instalacion || ''}"`,
                `"${registro.cliente_dni || ''}"`,
                `"${registro.direccion_instalacion || ''}"`,
                `"${registro.distrito || ''}"`,
                `"${registro.telefono_local || ''}"`,
                `"${registro.turno || ''}"`,
                registro.puntos_corresponden_instalar || '',
                `"${registro.hs || ''}"`,
                `"${registro.medidor || ''}"`,
                `"${registro.orden_atencion || ''}"`,
                `"${registro.montante_encuentro_activo_pasivo || ''}"`,
                `"${registro.encuentro_ramal_ectogas || ''}"`,
                `"${registro.observaciones || ''}"`,
                `"${registro.nombre_dni_inspector || ''}"`,
                `"${registro.ubicacion || ''}"`,
                `"${registro.fise_unica || ''}"`,
                `"${registro.empresa_instaladora || ''}"`,
                `"${registro.numero_medidor || ''}"`,
                `"${registro.numero_contador || ''}"`,
                `"${registro.horario_comentario_rusf_del_inspecto || ''}"`,
                `"${registro.celular_1 || ''}"`,
                `"${registro.celular_2 || ''}"`,
                `"${registro.celular_3 || ''}"`,
                `"${registro.celular_4 || ''}"`,
                `"${registro.apellidos_del_inspecto || ''}"`,
                `"${registro.observaciones_2 || ''}"`,
                `"${registro.numero_piso || ''}"`
            ];
            csvContent += row.join(',') + '\n';
        });

        filename = `reporte_detallado_${getCurrentDateStr()}.csv`;

    } else {
        // CSV Resumido - Consolidado
        const headers = ['Categoría', 'Pacientes', 'Acciones'];
        csvContent = headers.join(',') + '\n';

        // Agrupar por área/categoría
        const areas = {};
        reportData.forEach(registro => {
            const area = registro.turno || 'Sin Categoría';
            areas[area] = (areas[area] || 0) + 1;
        });

        Object.entries(areas).forEach(([area, count]) => {
            csvContent += `"${area}",${count},"📋 Ver"\n`;
        });

        // Agregar totales
        csvContent += `\nTOTAL,${reportData.length},-\n`;

        filename = `reporte_resumido_${getCurrentDateStr()}.csv`;
    }

    // Descargar archivo
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();

    showMessage(`Archivo CSV descargado: ${filename}`, 'success');
}

// Generar y descargar PDF
function downloadPDF(type) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape

    // Agregar logo (si existe)
    // doc.addImage('logo-donet.png', 'PNG', 10, 10, 30, 30);

    // Título
    doc.setFontSize(18);
    doc.setTextColor(0, 212, 255);
    doc.text('DONET - Reporte de Inspecciones', 14, 20);

    // Fecha del reporte
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 14, 28);
    doc.text(`Usuario: ${currentUser.nombre}`, 14, 33);
    doc.text(`Total de registros: ${reportData.length}`, 14, 38);

    if (type === 'detailed') {
        // PDF Detallado - Tabla con todos los campos importantes
        const tableData = reportData.map(registro => [
            formatDateDisplay(registro.fecha_carga),
            registro.cuenta_contrato || 'N/A',
            registro.distrito || 'N/A',
            registro.direccion_instalacion || 'N/A',
            registro.nombre_dni_inspector || 'N/A',
            registro.turno || 'N/A',
            registro.empresa_instaladora || 'N/A'
        ]);

        doc.autoTable({
            startY: 45,
            head: [['Fecha', 'Cuenta', 'Distrito', 'Dirección', 'Inspector', 'Turno', 'Empresa']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [0, 212, 255],
                textColor: [10, 22, 40],
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [240, 248, 255]
            },
            styles: {
                fontSize: 8,
                cellPadding: 2
            },
            columnStyles: {
                0: { cellWidth: 22 },
                1: { cellWidth: 25 },
                2: { cellWidth: 30 },
                3: { cellWidth: 60 },
                4: { cellWidth: 50 },
                5: { cellWidth: 20 },
                6: { cellWidth: 50 }
            }
        });

    } else {
        // PDF Resumido - Consolidado por categoría
        const areas = {};
        reportData.forEach(registro => {
            const area = registro.turno || 'Emergencia';
            areas[area] = (areas[area] || 0) + 1;
        });

        const tableData = Object.entries(areas).map(([area, count]) => [
            area,
            count,
            '📋 Ver'
        ]);

        // Agregar fila de total
        tableData.push(['TOTAL', reportData.length, '-']);

        doc.autoTable({
            startY: 45,
            head: [['Área', 'Pacientes', 'Acciones']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [0, 212, 255],
                textColor: [10, 22, 40],
                fontStyle: 'bold'
            },
            footStyles: {
                fillColor: [200, 200, 200],
                fontStyle: 'bold'
            },
            styles: {
                fontSize: 10,
                cellPadding: 4
            }
        });
    }

    // Descargar
    const filename = type === 'detailed'
        ? `reporte_detallado_${getCurrentDateStr()}.pdf`
        : `reporte_resumido_${getCurrentDateStr()}.pdf`;

    doc.save(filename);
    showMessage(`Archivo PDF descargado: ${filename}`, 'success');
}

// Compartir por WhatsApp
function shareWhatsApp(type) {
    if (!reportData || reportData.length === 0) {
        showMessage('Primero debe generar un reporte con el botón Buscar', 'warning');
        return;
    }

    let message = '';

    if (type === 'detailed') {
        // Mensaje detallado
        message = `*📊 REPORTE DONET - DETALLADO*\n\n`;
        message += `Fecha: ${new Date().toLocaleDateString('es-ES')}\n`;
        message += `Usuario: ${currentUser.nombre}\n`;
        message += `Total de registros: ${reportData.length}\n\n`;
        message += `---REGISTROS---\n\n`;

        reportData.slice(0, 10).forEach((registro, index) => { // Máximo 10 para no saturar
            message += `${index + 1}. *${registro.cuenta_contrato}*\n`;
            message += `   📅 ${formatDateDisplay(registro.fecha_carga)}\n`;
            message += `   📍 ${registro.distrito || 'N/A'}\n`;
            message += `   🏠 ${registro.direccion_instalacion || 'N/A'}\n`;
            message += `   👤 ${registro.nombre_dni_inspector || 'N/A'}\n\n`;
        });

        if (reportData.length > 10) {
            message += `... y ${reportData.length - 10} registros más.\n\n`;
        }

    } else {
        // Mensaje resumido
        message = `*📊 REPORTE DONET - RESUMIDO*\n\n`;
        message += `Fecha: ${new Date().toLocaleDateString('es-ES')}\n`;
        message += `Usuario: ${currentUser.nombre}\n`;
        message += `Total: ${reportData.length} registros\n\n`;

        // Agrupar por turno/área
        const areas = {};
        reportData.forEach(registro => {
            const area = registro.turno || 'Emergencia';
            areas[area] = (areas[area] || 0) + 1;
        });

        message += `---RESUMEN POR ÁREA---\n\n`;
        Object.entries(areas).forEach(([area, count]) => {
            message += `• ${area}: *${count}*\n`;
        });
    }

    message += `\n_Generado con Sistema DONET_`;

    // Codificar mensaje para URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/?text=${encodedMessage}`;

    // Abrir WhatsApp
    window.open(whatsappURL, '_blank');
    showMessage('Abriendo WhatsApp...', 'info');
}

// Funciones auxiliares
function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDateForDB(date) {
    return formatDateForInput(date);
}

function formatDateDisplay(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getCurrentDateStr() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}
