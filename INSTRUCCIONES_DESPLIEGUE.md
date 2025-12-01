# 🚀 INSTRUCCIONES DE DESPLIEGUE - SISTEMA DONET

## ✅ CAMBIOS REALIZADOS

### Archivos Modificados:
- ✅ `index.html` - Agregado cache-busting (v=3) para forzar recarga
- ✅ `reports.js` - Módulo completo de reportes
- ✅ `styles.css` - Estilos para módulo de reportes

### Problema Solucionado:
- **Cache del navegador** impedía ver los cambios
- Agregados parámetros `?v=3` a todos los archivos JS y CSS
- Esto fuerza al navegador a descargar la versión más reciente

---

## 📱 PASO 1: VERIFICAR LOCALMENTE

### A. Limpiar Cache del Navegador

**Método Rápido (RECOMENDADO):**
1. Presiona **Ctrl + Shift + R** (Windows/Linux)
2. O abre http://localhost:8001 en **modo incógnito**:
   - Chrome/Edge: **Ctrl + Shift + N**
   - Firefox: **Ctrl + Shift + P**

**Método Manual:**
1. Presiona **F12** (DevTools)
2. Clic derecho en botón recargar (junto a URL)
3. Selecciona **"Vaciar caché y volver a cargar de forma forzada"**

### B. Verificar que Funcione

Después de limpiar cache, verifica:

✅ **Menú Principal** debe mostrar 4 tarjetas:
- 📝 Registrar Inspección
- 📤 Carga Masiva
- 🔍 Consultar Registros
- **📊 Reportes** ← NUEVA

✅ **Al hacer clic en Reportes** debe aparecer:
- **DOS botones toggle**: "📅 Mes Completo" y "📆 Rango Personalizado"
- Selector de Mes y Año (cuando "Mes Completo" está activo)
- Campos de fecha inicio/fin (cuando "Rango Personalizado" está activo)
- Botón "🔍 Buscar" en color cyan
- Sección de descarga con botones verdes (CSV) y rojos (PDF)
- Botones de WhatsApp en verde
- Tabla de preview en la parte inferior (después de hacer clic en Buscar)

---

## 🔧 PASO 2: ACTUALIZAR GITHUB

### Problema de Autenticación:

El error anterior fue:
```
remote: Permission to mdmq2036/supervisor.git denied to mdmq2037-cloud
```

Esto significa que el usuario actual (**mdmq2037-cloud**) no tiene permisos para escribir en el repositorio **mdmq2036/supervisor**.

### Soluciones:

#### **Opción A: Usar GitHub Desktop (MÁS FÁCIL)**

1. Abrir **GitHub Desktop**
2. Ir a **File → Add Local Repository**
3. Seleccionar carpeta: `c:\MARTIN\LUIGGY`
4. Hacer clic en **"Commit to main"** (ya hay un commit local)
5. Hacer clic en **"Push origin"**
6. GitHub Desktop pedirá autenticación automáticamente

#### **Opción B: Cambiar Usuario Git (Terminal)**

```bash
# 1. Ir a la carpeta del proyecto
cd c:\MARTIN\LUIGGY

# 2. Cambiar usuario de Git LOCAL (solo para este proyecto)
git config user.name "mdmq2036"
git config user.email "email-de-mdmq2036@example.com"

# 3. Ver el commit pendiente
git log -1

# 4. Hacer push
git push origin main
```

Cuando pida credenciales, usar las de **mdmq2036** (el dueño del repositorio).

#### **Opción C: Usar Personal Access Token**

1. Ir a GitHub.com → Settings → Developer settings → Personal access tokens
2. Generar nuevo token con permisos de **repo**
3. Copiar el token (se muestra solo una vez)
4. Al hacer push, usar:
   - Username: **mdmq2036**
   - Password: **[pegar token]**

```bash
cd c:\MARTIN\LUIGGY
git push https://github.com/mdmq2036/supervisor.git main
```

#### **Opción D: Cambiar Remote URL con Token**

```bash
cd c:\MARTIN\LUIGGY

# Cambiar URL del remote para incluir autenticación
git remote set-url origin https://TOKEN@github.com/mdmq2036/supervisor.git

# Hacer push
git push origin main
```

Reemplaza `TOKEN` con tu Personal Access Token de GitHub.

---

## 🌐 PASO 3: DESPLEGAR EN RENDER

### Después de que el Push sea exitoso:

1. **Ir a Render Dashboard:**
   https://dashboard.render.com/u/usr-d4ls6j2li9vc73efm940/settings

2. **Encontrar el servicio "supervisor"** (o como se llame el frontend)

3. **Render Auto-Despliega** cuando detecta cambios en GitHub:
   - Espera 2-3 minutos después del push
   - Verás un mensaje: "Deploying..." en el dashboard
   - Cuando termine dirá: "Live"

4. **Si no auto-despliega:**
   - Hacer clic en el servicio
   - Clic en botón **"Manual Deploy"**
   - Seleccionar **"Clear build cache & deploy"**

5. **Verificar el despliegue:**
   - Abrir la URL de producción
   - Presionar **Ctrl + Shift + R** para limpiar cache
   - Verificar que aparezca el módulo de Reportes

---

## 🔍 PASO 4: VERIFICACIÓN FINAL

### En Producción (Render):

1. **Abrir la app en modo incógnito** (evita cache)
2. **Hacer login** con usuario de prueba
3. **Ir a Reportes**
4. **Verificar que aparezcan:**
   - ✅ Dos botones de toggle (Mes Completo / Rango Personalizado)
   - ✅ Filtros de mes y año
   - ✅ Botón "Buscar" funcional
   - ✅ Botones de descarga (verde para CSV, rojo para PDF)
   - ✅ Botones de WhatsApp
5. **Hacer una prueba:**
   - Seleccionar mes actual
   - Clic en "Buscar"
   - Debe aparecer tabla con registros del mes
   - Probar descargar CSV
   - Probar descargar PDF

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Si después del despliegue no se ven los cambios:

#### 1. Cache del Navegador:
```bash
# En la URL de producción
Presionar: Ctrl + Shift + R
O abrir en modo incógnito
```

#### 2. Cache de Render:
```bash
# En Render Dashboard
Manual Deploy → Clear build cache & deploy
```

#### 3. Verificar que el Push funcionó:
```bash
# Ir a GitHub.com
https://github.com/mdmq2036/supervisor

# Verificar que aparezcan los últimos commits
# Debe aparecer: "Fix: Módulo de reportes - cache busting v3"
# Con fecha reciente
```

#### 4. Verificar archivos en GitHub:
- Abrir `index.html` en GitHub
- Buscar la línea: `<link rel="stylesheet" href="styles.css?v=3">`
- Buscar la línea: `<script src="reports.js?v=3"></script>`
- Si no aparecen, el push no fue exitoso

#### 5. Logs de Render:
```
En Render Dashboard:
1. Clic en el servicio
2. Ir a pestaña "Logs"
3. Verificar que no haya errores
4. Buscar mensaje: "Build successful"
```

---

## 📋 RESUMEN DE COMANDOS GIT

```bash
# Ver estado actual
git status

# Ver commits locales pendientes
git log origin/main..HEAD

# Ver diferencias con GitHub
git diff origin/main

# Forzar push (USAR CON CUIDADO)
git push -f origin main

# Ver configuración de usuario
git config user.name
git config user.email

# Cambiar usuario local
git config user.name "mdmq2036"
git config user.email "tu-email@example.com"
```

---

## ✅ CHECKLIST COMPLETO

```
□ Limpiar cache del navegador local
□ Verificar módulo de reportes en http://localhost:8001
□ Confirmar que aparecen los dos botones de toggle
□ Confirmar que aparece la tabla de preview
□ Hacer commit local (YA HECHO)
□ Configurar usuario Git correcto (mdmq2036)
□ Hacer push a GitHub
□ Verificar push exitoso en GitHub.com
□ Esperar auto-deploy de Render (2-3 min)
□ O hacer deploy manual en Render
□ Abrir app en producción en modo incógnito
□ Verificar módulo de reportes funcional
□ Probar generar reporte
□ Probar descargar CSV
□ Probar descargar PDF
□ Probar compartir WhatsApp
```

---

## 🎯 RESULTADO ESPERADO

Al finalizar todos los pasos:

1. ✅ Aplicación local muestra módulo de reportes completo
2. ✅ Código subido a GitHub correctamente
3. ✅ Render desplegó la última versión
4. ✅ Aplicación en producción tiene módulo de reportes
5. ✅ Usuarios pueden generar y descargar reportes
6. ✅ Compartir por WhatsApp funciona

---

## 📞 CONTACTO

Si algún paso falla, revisar:
- `SOLUCION_CACHE.md` - Para problemas de cache
- `MEJORAS_REALIZADAS.md` - Para detalles técnicos
- `GUIA_RAPIDA_USO.md` - Para instrucciones de uso

---

**Fecha:** 2025-01-30
**Versión:** 1.1.0
**Cache Busting:** v3
