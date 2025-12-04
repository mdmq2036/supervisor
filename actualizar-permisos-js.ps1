# Script para actualizar permisos en archivos JS
# Reemplaza las condiciones de filtro para incluir a luiggy y admin en app_final.js y app.js

$files = @("app_final.js", "app.js")

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Procesando $file..." -ForegroundColor Yellow
        $content = Get-Content $file -Raw

        # Definir el patrón a buscar y el reemplazo
        # Nota: Usamos regex escape para caracteres especiales
        
        $searchPattern = "// Solo filtrar por supervisor_id si NO es usuario `"prueba`"`r`n        if \(currentUser\.usuario !== 'prueba'\) \{`r`n            query = query\.eq\('supervisor_id', currentUser\.id\);`r`n        \}"
        
        $replacement = "// Solo filtrar por supervisor_id si NO es usuario admin`r`n        // Usuarios con acceso total: prueba, admin, luiggy`r`n        const usuariosAdmin = ['prueba', 'admin', 'luiggy'];`r`n        if (!usuariosAdmin.includes(currentUser.usuario)) {`r`n            query = query.eq('supervisor_id', currentUser.id);`r`n        }"

        # Realizar el reemplazo
        $content = $content -replace $searchPattern, $replacement
        
        # Guardar cambios
        Set-Content $file -Value $content -NoNewline
        Write-Host "✅ $file actualizado." -ForegroundColor Green
    }
    else {
        Write-Host "⚠️ $file no encontrado." -ForegroundColor Red
    }
}

Write-Host "Proceso completado." -ForegroundColor Cyan
