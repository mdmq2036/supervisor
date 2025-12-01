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
            downloadCSVPlain(type); // CSV simple sin formato
        } else if (format === 'excel') {
            downloadCSV(type); // Excel con formato (sobrescrito por reports-excel-formatter.js)
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

// Generar y descargar CSV simple (sin formato)
function downloadCSVPlain(type) {
    let csvContent = '';
    let filename = '';

    if (type === 'detailed') {
        // CSV Detallado - Todos los campos importantes
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
        // CSV Resumido - Datos más importantes consolidados
        const headers = [
            'Fecha Reporte', 'Supervisor', 'Total Inspecciones', 'Distrito Principal',
            'Empresa Instaladora', 'Turno Predominante', 'Inspectores Activos', 'Observaciones Clave'
        ];
        csvContent = headers.join(',') + '\n';

        // Calcular estadísticas importantes
        const distritos = {};
        const empresas = {};
        const turnos = {};
        const inspectores = new Set();
        let observacionesKey = [];

        reportData.forEach(registro => {
            const distrito = registro.distrito || 'Sin Especificar';
            const empresa = registro.empresa_instaladora || 'Sin Especificar';
            const turno = registro.turno || 'Sin Especificar';
            
            distritos[distrito] = (distritos[distrito] || 0) + 1;
            empresas[empresa] = (empresas[empresa] || 0) + 1;
            turnos[turno] = (turnos[turno] || 0) + 1;
            inspectores.add(registro.nombre_dni_inspector);
            
            if (registro.observaciones_2) {
                observacionesKey.push(registro.observaciones_2);
            }
        });

        // Encontrar valores predominantes
        const distritoPrincipal = Object.entries(distritos).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
        const empresaPrincipal = Object.entries(empresas).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
        const turnoPrincipal = Object.entries(turnos).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
        const obsResumen = observacionesKey.slice(0, 3).join('; ') || 'Sin observaciones';

        const row = [
            new Date().toLocaleDateString('es-ES'),
            `"${currentUser.nombre || 'N/A'}"`,
            reportData.length,
            `"${distritoPrincipal}"`,
            `"${empresaPrincipal}"`,
            `"${turnoPrincipal}"`,
            inspectores.size,
            `"${obsResumen}"`
        ];
        csvContent += row.join(',') + '\n';

        // Agregar resumen por categoría
        csvContent += '\n\nRESUMEN POR DISTRITO\n';
        csvContent += 'Distrito,Cantidad\n';
        Object.entries(distritos).forEach(([distrito, count]) => {
            csvContent += `"${distrito}",${count}\n`;
        });

        csvContent += '\n\nRESUMEN POR EMPRESA\n';
        csvContent += 'Empresa,Cantidad\n';
        Object.entries(empresas).forEach(([empresa, count]) => {
            csvContent += `"${empresa}",${count}\n`;
        });

        filename = `reporte_resumido_${getCurrentDateStr()}.csv`;
    }

    // Descargar archivo
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();

    showMessage(`Archivo descargado: ${filename}`, 'success');
}

// Generar y descargar PDF
function downloadPDF(type) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // ===== ENCABEZADO PROFESIONAL =====
    // Fondo del encabezado
    doc.setFillColor(10, 22, 40);
    doc.rect(0, 0, pageWidth, 35, 'F');

    // Línea decorativa azul
    doc.setFillColor(0, 212, 255);
    doc.rect(0, 35, pageWidth, 2, 'F');

    // Logo/Título principal
    doc.setFontSize(22);
    doc.setTextColor(0, 212, 255);
    doc.setFont(undefined, 'bold');
    doc.text('DONET', 14, 18);

    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.setFont(undefined, 'normal');
    doc.text('Sistema de Gestión de Inspecciones', 14, 26);

    // Información del reporte en encabezado
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    const reportDate = new Date().toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
    });
    doc.text(`Reporte: ${type === 'detailed' ? 'DETALLADO' : 'RESUMIDO'}`, pageWidth - 70, 18);
    doc.text(`Fecha: ${reportDate}`, pageWidth - 70, 26);

    // ===== INFORMACIÓN DEL USUARIO =====
    let yPosition = 42;
    doc.setFontSize(10);
    doc.setTextColor(10, 22, 40);
    doc.setFont(undefined, 'bold');
    doc.text('INFORMACIÓN DEL REPORTE', 14, yPosition);

    yPosition += 7;
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(50, 50, 50);
    
    // Crear tabla de información
    const infoData = [
        ['Supervisor:', currentUser.nombre || 'N/A'],
        ['Total de Inspecciones:', reportData.length.toString()],
        ['Período:', type === 'detailed' ? 'Detallado' : 'Resumido'],
        ['Generado:', new Date().toLocaleString('es-ES')]
    ];

    let infoY = yPosition;
    infoData.forEach((row, index) => {
        doc.setFont(undefined, 'bold');
        doc.text(row[0], 14, infoY);
        doc.setFont(undefined, 'normal');
        doc.text(row[1], 50, infoY);
        infoY += 5;
    });

    yPosition = infoY + 3;

    if (type === 'detailed') {
        // ===== PDF DETALLADO =====
        
        // Estadísticas principales
        const distritos = {};
        const empresas = {};
        const turnos = {};
        
        reportData.forEach(registro => {
            const distrito = registro.distrito || 'Sin Especificar';
            const empresa = registro.empresa_instaladora || 'Sin Especificar';
            const turno = registro.turno || 'Sin Especificar';
            
            distritos[distrito] = (distritos[distrito] || 0) + 1;
            empresas[empresa] = (empresas[empresa] || 0) + 1;
            turnos[turno] = (turnos[turno] || 0) + 1;
        });

        // Sección de estadísticas
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 212, 255);
        doc.text('ESTADÍSTICAS PRINCIPALES', 14, yPosition);
        
        yPosition += 6;
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(50, 50, 50);

        const distritoPrincipal = Object.entries(distritos).sort((a, b) => b[1] - a[1])[0];
        const empresaPrincipal = Object.entries(empresas).sort((a, b) => b[1] - a[1])[0];
        const turnoPrincipal = Object.entries(turnos).sort((a, b) => b[1] - a[1])[0];

        doc.text(`• Distrito Principal: ${distritoPrincipal ? distritoPrincipal[0] : 'N/A'} (${distritoPrincipal ? distritoPrincipal[1] : 0} registros)`, 14, yPosition);
        yPosition += 4;
        doc.text(`• Empresa Principal: ${empresaPrincipal ? empresaPrincipal[0] : 'N/A'} (${empresaPrincipal ? empresaPrincipal[1] : 0} registros)`, 14, yPosition);
        yPosition += 4;
        doc.text(`• Turno Predominante: ${turnoPrincipal ? turnoPrincipal[0] : 'N/A'} (${turnoPrincipal ? turnoPrincipal[1] : 0} registros)`, 14, yPosition);
        yPosition += 4;
        doc.text(`• Total de Distritos: ${Object.keys(distritos).length}`, 14, yPosition);
        yPosition += 4;
        doc.text(`• Total de Empresas: ${Object.keys(empresas).length}`, 14, yPosition);

        yPosition += 8;

        // Tabla detallada
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
            startY: yPosition,
            head: [['Fecha', 'Cuenta', 'Distrito', 'Dirección', 'Inspector', 'Turno', 'Empresa']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [0, 212, 255],
                textColor: [10, 22, 40],
                fontStyle: 'bold',
                fontSize: 8,
                cellPadding: 3
            },
            bodyStyles: {
                fontSize: 7,
                cellPadding: 2
            },
            alternateRowStyles: {
                fillColor: [245, 248, 250]
            },
            rowPageBreak: 'avoid',
            columnStyles: {
                0: { cellWidth: 18 },
                1: { cellWidth: 22 },
                2: { cellWidth: 28 },
                3: { cellWidth: 55 },
                4: { cellWidth: 45 },
                5: { cellWidth: 18 },
                6: { cellWidth: 45 }
            },
            margin: { top: 10, right: 10, bottom: 10, left: 10 }
        });

    } else {
        // ===== PDF RESUMIDO =====
        
        // Calcular estadísticas importantes
        const distritos = {};
        const empresas = {};
        const turnos = {};
        const inspectores = new Set();
        let observacionesKey = [];

        reportData.forEach(registro => {
            const distrito = registro.distrito || 'Sin Especificar';
            const empresa = registro.empresa_instaladora || 'Sin Especificar';
            const turno = registro.turno || 'Sin Especificar';
            
            distritos[distrito] = (distritos[distrito] || 0) + 1;
            empresas[empresa] = (empresas[empresa] || 0) + 1;
            turnos[turno] = (turnos[turno] || 0) + 1;
            inspectores.add(registro.nombre_dni_inspector);
            
            if (registro.observaciones_2) {
                observacionesKey.push(registro.observaciones_2);
            }
        });

        // Sección de resumen ejecutivo
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 212, 255);
        doc.text('RESUMEN EJECUTIVO', 14, yPosition);
        
        yPosition += 8;
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(50, 50, 50);

        const summaryData = [
            ['Total de Inspecciones:', reportData.length.toString(), ''],
            ['Inspectores Activos:', inspectores.size.toString(), ''],
            ['Distritos Cubiertos:', Object.keys(distritos).length.toString(), ''],
            ['Empresas Involucradas:', Object.keys(empresas).length.toString(), ''],
            ['Turnos Registrados:', Object.keys(turnos).length.toString(), '']
        ];

        summaryData.forEach((row) => {
            doc.setFont(undefined, 'bold');
            doc.text(row[0], 14, yPosition);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(0, 212, 255);
            doc.setFontSize(11);
            doc.text(row[1], 70, yPosition);
            doc.setTextColor(50, 50, 50);
            doc.setFontSize(9);
            yPosition += 6;
        });

        yPosition += 5;

        // Tabla de resumen por distrito
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 212, 255);
        doc.text('DISTRIBUCIÓN POR DISTRITO', 14, yPosition);
        
        yPosition += 6;

        const distritoTableData = Object.entries(distritos)
            .sort((a, b) => b[1] - a[1])
            .map(([distrito, count]) => [
                distrito,
                count.toString(),
                `${((count / reportData.length) * 100).toFixed(1)}%`
            ]);

        doc.autoTable({
            startY: yPosition,
            head: [['Distrito', 'Cantidad', 'Porcentaje']],
            body: distritoTableData,
            theme: 'grid',
            headStyles: {
                fillColor: [0, 212, 255],
                textColor: [10, 22, 40],
                fontStyle: 'bold',
                fontSize: 9,
                cellPadding: 3
            },
            bodyStyles: {
                fontSize: 8,
                cellPadding: 2
            },
            alternateRowStyles: {
                fillColor: [245, 248, 250]
            },
            columnStyles: {
                0: { cellWidth: 100 },
                1: { cellWidth: 30 },
                2: { cellWidth: 30 }
            },
            margin: { left: 14, right: 14 }
        });

        yPosition = doc.lastAutoTable.finalY + 10;

        // Tabla de resumen por empresa
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 212, 255);
        doc.text('DISTRIBUCIÓN POR EMPRESA', 14, yPosition);
        
        yPosition += 6;

        const empresaTableData = Object.entries(empresas)
            .sort((a, b) => b[1] - a[1])
            .map(([empresa, count]) => [
                empresa,
                count.toString(),
                `${((count / reportData.length) * 100).toFixed(1)}%`
            ]);

        doc.autoTable({
            startY: yPosition,
            head: [['Empresa', 'Cantidad', 'Porcentaje']],
            body: empresaTableData,
            theme: 'grid',
            headStyles: {
                fillColor: [0, 212, 255],
                textColor: [10, 22, 40],
                fontStyle: 'bold',
                fontSize: 9,
                cellPadding: 3
            },
            bodyStyles: {
                fontSize: 8,
                cellPadding: 2
            },
            alternateRowStyles: {
                fillColor: [245, 248, 250]
            },
            columnStyles: {
                0: { cellWidth: 100 },
                1: { cellWidth: 30 },
                2: { cellWidth: 30 }
            },
            margin: { left: 14, right: 14 }
        });
    }

    // ===== PIE DE PÁGINA =====
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.setFont(undefined, 'normal');
        
        // Línea separadora
        doc.setDrawColor(200, 200, 200);
        doc.line(10, pageHeight - 10, pageWidth - 10, pageHeight - 10);
        
        // Texto del pie
        doc.text('© 2025 DONET - Sistema de Gestión de Inspecciones', 14, pageHeight - 5);
        doc.text(`Página ${i} de ${totalPages}`, pageWidth - 30, pageHeight - 5);
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
