// ==========================================
// FORMATEADOR DE EXCEL CON ESTILO PROFESIONAL
// Cabecera azul y filas alternadas en verde
// ==========================================

// Generar Excel con formato HTML (permite estilos CSS)
function downloadExcelFormatted(type) {
    let filename = '';
    let htmlContent = '';

    if (type === 'detailed') {
        // Excel Detallado con formato profesional
        const headers = [
            'FECHA CARGA', 'CUENTA CONTRATO', 'INSTALACIÓN', 'CLIENTE DNI',
            'DIRECCIÓN', 'DISTRITO', 'TELÉFONO', 'TURNO', 'PUNTOS INSTALAR',
            'HS', 'MEDIDOR', 'ORDEN ATENCIÓN', 'MONTANTE', 'ENCUENTRO RAMAL',
            'OBSERVACIONES', 'INSPECTOR', 'UBICACIÓN', 'FISE', 'EMPRESA INSTALADORA',
            'NÚMERO MEDIDOR', 'NÚMERO CONTADOR', 'HORARIO/COMENTARIO', 'CELULAR 1',
            'CELULAR 2', 'CELULAR 3', 'CELULAR 4', 'APELLIDOS', 'OBSERVACIONES 2',
            'NÚMERO PISO'
        ];

        // Iniciar HTML con estilos
        htmlContent = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="UTF-8">
    <style>
        table {
            border-collapse: collapse;
            width: 100%;
            font-family: Calibri, Arial, sans-serif;
            font-size: 11pt;
        }
        th {
            background-color: #305496;
            color: white;
            font-weight: bold;
            text-align: center;
            padding: 12px 8px;
            border: 1px solid #1F3864;
            font-size: 10pt;
        }
        td {
            padding: 10px 8px;
            border: 1px solid #BFBFBF;
            text-align: left;
            font-size: 10pt;
        }
        tr:nth-child(even) {
            background-color: #D9E2F3;
        }
        tr:nth-child(odd) {
            background-color: #FFFFFF;
        }
        tr:hover {
            background-color: #FFF2CC;
        }
    </style>
</head>
<body>
    <table border="1">
        <thead>
            <tr>`;

        // Agregar cabeceras
        headers.forEach(header => {
            htmlContent += `<th>${header}</th>`;
        });
        htmlContent += `</tr></thead><tbody>`;

        // Agregar datos
        reportData.forEach((registro, index) => {
            htmlContent += `<tr>`;
            htmlContent += `<td>${formatDateDisplay(registro.fecha_carga)}</td>`;
            htmlContent += `<td>${registro.cuenta_contrato || ''}</td>`;
            htmlContent += `<td>${registro.instalacion || ''}</td>`;
            htmlContent += `<td>${registro.cliente_dni || ''}</td>`;
            htmlContent += `<td>${registro.direccion_instalacion || ''}</td>`;
            htmlContent += `<td>${registro.distrito || ''}</td>`;
            htmlContent += `<td>${registro.telefono_local || ''}</td>`;
            htmlContent += `<td>${registro.turno || ''}</td>`;
            htmlContent += `<td>${registro.puntos_corresponden_instalar || ''}</td>`;
            htmlContent += `<td>${registro.hs || ''}</td>`;
            htmlContent += `<td>${registro.medidor || ''}</td>`;
            htmlContent += `<td>${registro.orden_atencion || ''}</td>`;
            htmlContent += `<td>${registro.montante_encuentro_activo_pasivo || ''}</td>`;
            htmlContent += `<td>${registro.encuentro_ramal_ectogas || ''}</td>`;
            htmlContent += `<td>${registro.observaciones || ''}</td>`;
            htmlContent += `<td>${registro.nombre_dni_inspector || ''}</td>`;
            htmlContent += `<td>${registro.ubicacion || ''}</td>`;
            htmlContent += `<td>${registro.fise_unica || ''}</td>`;
            htmlContent += `<td>${registro.empresa_instaladora || ''}</td>`;
            htmlContent += `<td>${registro.numero_medidor || ''}</td>`;
            htmlContent += `<td>${registro.numero_contador || ''}</td>`;
            htmlContent += `<td>${registro.horario_comentario_rusf_del_inspecto || ''}</td>`;
            htmlContent += `<td>${registro.celular_1 || ''}</td>`;
            htmlContent += `<td>${registro.celular_2 || ''}</td>`;
            htmlContent += `<td>${registro.celular_3 || ''}</td>`;
            htmlContent += `<td>${registro.celular_4 || ''}</td>`;
            htmlContent += `<td>${registro.apellidos_del_inspecto || ''}</td>`;
            htmlContent += `<td>${registro.observaciones_2 || ''}</td>`;
            htmlContent += `<td>${registro.numero_piso || ''}</td>`;
            htmlContent += `</tr>`;
        });

        htmlContent += `</tbody></table></body></html>`;
        filename = `reporte_detallado_${getCurrentDateStr()}.xls`;

    } else {
        // Excel Resumido
        const headers = [
            'FECHA REPORTE', 'SUPERVISOR', 'TOTAL INSPECCIONES', 'DISTRITO PRINCIPAL',
            'EMPRESA INSTALADORA', 'TURNO PREDOMINANTE', 'INSPECTORES ACTIVOS', 'OBSERVACIONES CLAVE'
        ];

        // Calcular estadísticas
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

        const distritoPrincipal = Object.entries(distritos).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
        const empresaPrincipal = Object.entries(empresas).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
        const turnoPrincipal = Object.entries(turnos).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
        const obsResumen = observacionesKey.slice(0, 3).join('; ') || 'Sin observaciones';

        htmlContent = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="UTF-8">
    <style>
        table {
            border-collapse: collapse;
            width: 100%;
            font-family: Calibri, Arial, sans-serif;
            font-size: 11pt;
            margin-bottom: 20px;
        }
        th {
            background-color: #305496;
            color: white;
            font-weight: bold;
            text-align: center;
            padding: 12px 8px;
            border: 1px solid #1F3864;
            font-size: 10pt;
        }
        td {
            padding: 10px 8px;
            border: 1px solid #BFBFBF;
            font-size: 10pt;
        }
        tr:nth-child(even) {
            background-color: #D9E2F3;
        }
        tr:nth-child(odd) {
            background-color: #FFFFFF;
        }
        h2 {
            color: #305496;
            margin-top: 20px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <h2>RESUMEN GENERAL</h2>
    <table border="1">
        <thead>
            <tr>`;

        headers.forEach(header => {
            htmlContent += `<th>${header}</th>`;
        });
        htmlContent += `</tr></thead><tbody><tr>`;

        htmlContent += `<td>${new Date().toLocaleDateString('es-ES')}</td>`;
        htmlContent += `<td>${currentUser.nombre || 'N/A'}</td>`;
        htmlContent += `<td>${reportData.length}</td>`;
        htmlContent += `<td>${distritoPrincipal}</td>`;
        htmlContent += `<td>${empresaPrincipal}</td>`;
        htmlContent += `<td>${turnoPrincipal}</td>`;
        htmlContent += `<td>${inspectores.size}</td>`;
        htmlContent += `<td>${obsResumen}</td>`;
        htmlContent += `</tr></tbody></table>`;

        // Tabla de resumen por distrito
        htmlContent += `<h2>RESUMEN POR DISTRITO</h2><table border="1"><thead><tr><th>DISTRITO</th><th>CANTIDAD</th></tr></thead><tbody>`;
        Object.entries(distritos).forEach(([distrito, count]) => {
            htmlContent += `<tr><td>${distrito}</td><td>${count}</td></tr>`;
        });
        htmlContent += `</tbody></table>`;

        // Tabla de resumen por empresa
        htmlContent += `<h2>RESUMEN POR EMPRESA</h2><table border="1"><thead><tr><th>EMPRESA</th><th>CANTIDAD</th></tr></thead><tbody>`;
        Object.entries(empresas).forEach(([empresa, count]) => {
            htmlContent += `<tr><td>${empresa}</td><td>${count}</td></tr>`;
        });
        htmlContent += `</tbody></table></body></html>`;

        filename = `reporte_resumido_${getCurrentDateStr()}.xls`;
    }

    // Descargar archivo
    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();

    showMessage(`Reporte Excel ${type === 'detailed' ? 'detallado' : 'resumido'} descargado exitosamente con formato profesional`, 'success');
}

// Sobrescribir la función downloadCSV original para usar el nuevo formateador
const originalDownloadCSV = window.downloadCSV;
window.downloadCSV = function(type) {
    // Usar el nuevo formateador de Excel con estilos
    downloadExcelFormatted(type);
};
