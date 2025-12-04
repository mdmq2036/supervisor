# Script para agregar filtro de contrato en mapa-ubicaciones.html

$file = "mapa-ubicaciones.html"
$content = Get-Content $file -Raw

# Definir el bloque a buscar (filtro de usuario)
$searchPattern = '<div class="filter-group">\s*<label>Usuario</label>\s*<select id="filterUsuario">\s*<option value="">Todos los usuarios</option>\s*</select>\s*</div>'

# Definir el nuevo bloque (usuario + contrato)
$replacement = '<div class="filter-group">
                    <label>Usuario</label>
                    <select id="filterUsuario">
                        <option value="">Todos los usuarios</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Cuenta Contrato</label>
                    <select id="filterContrato">
                        <option value="">Todos los contratos</option>
                    </select>
                </div>'

# Realizar el reemplazo (usando regex para manejar espacios en blanco)
$content = $content -replace '(?s)<div class="filter-group">\s*<label>Usuario</label>.*?</div>', $replacement

# Guardar cambios
Set-Content $file -Value $content -NoNewline

Write-Host "✅ Filtro de contrato agregado al HTML" -ForegroundColor Green
