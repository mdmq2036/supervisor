# Script para actualizar permisos de usuarios admin
# Reemplaza las condiciones de filtro para incluir a luiggy y admin

$file = "index.html"
$content = Get-Content $file -Raw

# Reemplazo 1: Función buscarRegistros
$content = $content -replace "if \(currentUser\.usuario !== 'prueba'\) \{`r`n                    query = query\.eq\('supervisor_id', currentUser\.id\);`r`n                \}", "// Usuarios con acceso total: prueba, admin, luiggy`r`n                const usuariosAdmin = ['prueba', 'admin', 'luiggy'];`r`n                if (!usuariosAdmin.includes(currentUser.usuario)) {`r`n                    query = query.eq('supervisor_id', currentUser.id);`r`n                }"

# Reemplazo 2: Función loadCuentasContrato
$content = $content -replace "// Solo filtrar por supervisor_id si NO es usuario `"prueba`"`r`n                if \(currentUser\.usuario !== 'prueba'\) \{`r`n                    query = query\.eq\('supervisor_id', currentUser\.id\);`r`n                \}", "// Solo filtrar por supervisor_id si NO es usuario admin`r`n                // Usuarios con acceso total: prueba, admin, luiggy`r`n                const usuariosAdmin = ['prueba', 'admin', 'luiggy'];`r`n                if (!usuariosAdmin.includes(currentUser.usuario)) {`r`n                    query = query.eq('supervisor_id', currentUser.id);`r`n                }"

# Guardar cambios
Set-Content $file -Value $content -NoNewline

Write-Host "✅ Permisos actualizados exitosamente" -ForegroundColor Green
Write-Host "Usuarios con acceso total: prueba, admin, luiggy" -ForegroundColor Cyan
