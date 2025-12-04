# Script para reparar la función handleLogin

$file = "index.html"
$content = Get-Content $file -Raw

# 1. Hacer la función handleLogin async
$content = $content -replace 'function handleLogin\(\) \{', 'async function handleLogin() {'

# 2. Eliminar duplicados de currentUser
$content = $content -replace 'currentUser = userData;\s*localStorage\.setItem\(''currentUser'', JSON\.stringify\(currentUser\)\);\s*currentUser = userData;\s*localStorage\.setItem\(''currentUser'', JSON\.stringify\(currentUser\)\);', 'currentUser = userData;
                localStorage.setItem(''currentUser'', JSON.stringify(currentUser));'

# 3. Eliminar duplicado de updateUserInfo
$content = $content -replace 'updateUserInfo\(\);\s*const loadingMsg = document\.getElementById\(''loadingMessage''\);\s*if \(loadingMsg\) loadingMsg\.textContent = ''Cargando\.\.\.'';\s*updateUserInfo\(\);', 'updateUserInfo();
                
                const loadingMsg = document.getElementById(''loadingMessage'');
                if (loadingMsg) loadingMsg.textContent = ''Cargando...'';'

Set-Content $file -Value $content -NoNewline
Write-Host "✅ handleLogin reparado" -ForegroundColor Green
