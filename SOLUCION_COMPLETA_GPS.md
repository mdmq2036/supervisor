# 🔧 SOLUCIÓN COMPLETA: GPS No Registra Ubicaciones

## 🎯 PROBLEMA IDENTIFICADO

**Síntoma:** Los equipos se conectan pero NO aparecen ubicaciones en el mapa.

**Causa Raíz:** Las funciones RPC de Supabase probablemente NO existen:
- `registrar_entrada_ubicacion()`
- `registrar_salida_ubicacion()`

Sin estas funciones, cuando el código frontend intenta guardar la ubicación, el servidor falla.

---

## ✅ SOLUCIÓN EN 3 PASOS

### PASO 1: Crear Funciones RPC en Supabase

**1. Ir a Supabase SQL Editor:**
```
https://supabase.com/dashboard/project/bvqmaaxtaetebjsgdphj/editor
```

**2. Click en "+ New query"**

**3. Copiar y pegar el script:**
[CREAR_FUNCIONES_RPC_SUPABASE.sql](CREAR_FUNCIONES_RPC_SUPABASE.sql)

**4. Click en "Run"**

**5. Verificar resultado:**
Deberías ver:
```
✅ Funciones RPC creadas exitosamente
📍 registrar_entrada_ubicacion() - Guarda ubicación al conectarse
🚪 registrar_salida_ubicacion() - Registra salida y calcula duración
```

Y una tabla mostrando las 2 funciones creadas.

---

### PASO 2: Probar Captura de Ubicación

**1. Abrir la aplicación:**
```
https://donet-supervision-system.onrender.com
```

**2. Abrir consola del navegador (F12)**

**3. Iniciar sesión:**
```
Usuario: prueba
Contraseña: prueba2025
```

**4. Permitir GPS cuando aparezca el popup**

**5. Verificar en consola (F12 → Console):**

Deberías ver:
```javascript
📍 Solicitando permisos de geolocalización...
✅ Ubicación GPS obtenida: {latitude: -12.0464, longitude: -77.0428, accuracy: 15}
✅ Rastreo de ubicación iniciado
✅ Rastreo de ubicación iniciado {sessionId: 1, deviceType: 'desktop', position: {...}}
```

**6. Verificar en Network (F12 → Network):**

Buscar la request:
```
POST /api/ubicaciones/entrada
Status: 200 OK
Response: {"success": true, "session_id": 1}
```

Si ves esto, ¡la ubicación se guardó correctamente!

---

### PASO 3: Verificar en el Mapa

**1. Ir al mapa:**
```
https://donet-supervision-system.onrender.com/mapa-ubicaciones.html
```

**2. Configurar filtros:**
- Usuario: **prueba**
- Fecha Inicio: **Hoy (fecha actual)**
- Fecha Fin: **Hoy (fecha actual)**
- Tipo Dispositivo: **Todos**

**3. Click en "Buscar"**

**4. Resultado esperado:**

✅ **Deberías ver:**
- 1 ubicación (la que acabas de capturar)
- 1 marcador en el mapa (tu ubicación actual)
- Estadísticas pobladas
- En "Historial de Ubicaciones" aparece tu registro

---

## 🔍 DIAGNÓSTICO DE PROBLEMAS

### Problema 1: Funciones RPC no se crearon

**Error en consola:**
```
Error al registrar entrada: 500
```

**Error en Supabase logs:**
```
function registrar_entrada_ubicacion does not exist
```

**Solución:**
Ejecutar [CREAR_FUNCIONES_RPC_SUPABASE.sql](CREAR_FUNCIONES_RPC_SUPABASE.sql) nuevamente

---

### Problema 2: GPS no se solicita

**Síntoma:** No aparece popup de ubicación

**Verificar:**

1. **¿Geolocalización soportada?**
```javascript
// En consola (F12):
'geolocation' in navigator
// Debe retornar: true
```

2. **¿HTTPS activo?**
- Render provee HTTPS automáticamente
- Localhost también funciona
- HTTP (no seguro) NO permite GPS

3. **¿Permisos bloqueados?**
- Click en candado 🔒 en barra de direcciones
- Verificar "Ubicación" → Debe estar en "Permitir"
- Si está "Bloqueado", cambiar a "Permitir" y recargar

---

### Problema 3: Error 500 al registrar

**Error en Network:**
```
POST /api/ubicaciones/entrada
Status: 500 Internal Server Error
```

**Posibles causas:**

1. **Tabla auditoria_ubicaciones no existe**

   **Verificar en Supabase:**
   ```sql
   SELECT * FROM auditoria_ubicaciones LIMIT 1;
   ```

   **Si retorna error:** Ejecutar [AGREGAR_GEOLOCALIZACION.sql](AGREGAR_GEOLOCALIZACION.sql)

2. **Funciones RPC no existen**

   **Verificar en Supabase:**
   ```sql
   SELECT routine_name FROM information_schema.routines
   WHERE routine_schema = 'public'
   AND routine_name LIKE 'registrar%ubicacion';
   ```

   **Si retorna 0 filas:** Ejecutar [CREAR_FUNCIONES_RPC_SUPABASE.sql](CREAR_FUNCIONES_RPC_SUPABASE.sql)

3. **Usuario no tiene permisos**

   **Verificar que usuario con ID=1 existe:**
   ```sql
   SELECT id, username, nombre FROM usuarios WHERE id = 1;
   ```

   **Si no existe:** El usuario 'prueba' debe tener ID=1

---

### Problema 4: Ubicación se guarda pero no aparece en mapa

**Verificar en Supabase:**

```sql
-- Ver ubicaciones guardadas
SELECT * FROM auditoria_ubicaciones
ORDER BY timestamp_entrada DESC
LIMIT 5;
```

**Si hay datos:**

```sql
-- Ver vista
SELECT * FROM v_analisis_ubicaciones
ORDER BY timestamp_entrada DESC
LIMIT 5;
```

**Si la tabla tiene datos pero la vista está vacía:**
- La vista no existe o está mal creada
- Ejecutar [VERIFICAR_Y_CORREGIR_MAPA.sql](VERIFICAR_Y_CORREGIR_MAPA.sql)

---

## 📊 FLUJO COMPLETO DE CAPTURA GPS

```
Usuario hace login
    ↓
app.js → requestGeolocationPermission()
    ↓
Navegador muestra popup "¿Permitir ubicación?"
    ↓
Usuario click en "Permitir"
    ↓
navigator.geolocation.getCurrentPosition() obtiene coordenadas
    ↓
app.js → initializeLocationTracking()
    ↓
GeolocationTracker.startTracking(userId, 'sesión activa', null)
    ↓
GeolocationTracker.registerLocationEntry()
    ↓
POST /api/ubicaciones/entrada
    ↓
server.js → supabase.rpc('registrar_entrada_ubicacion', {...})
    ↓
Supabase ejecuta función RPC
    ↓
INSERT INTO auditoria_ubicaciones (...)
    ↓
Retorna session_id
    ↓
✅ Ubicación guardada
    ↓
GeolocationTracker.startWatching() inicia monitoreo continuo
    ↓
Cada 60 segundos verifica si movió >50 metros
    ↓
Si se movió: registra nueva ubicación
    ↓
Todas las ubicaciones aparecen en el mapa
```

---

## 🧪 SCRIPT DE PRUEBA COMPLETO

Ejecuta este script en Supabase para verificar que todo funciona:

```sql
-- 1. Verificar tabla existe
SELECT COUNT(*) as existe_tabla
FROM information_schema.tables
WHERE table_name = 'auditoria_ubicaciones';
-- Debe retornar: 1

-- 2. Verificar funciones RPC existen
SELECT COUNT(*) as total_funciones
FROM information_schema.routines
WHERE routine_name IN ('registrar_entrada_ubicacion', 'registrar_salida_ubicacion');
-- Debe retornar: 2

-- 3. Verificar vista existe
SELECT COUNT(*) as existe_vista
FROM pg_views
WHERE viewname = 'v_analisis_ubicaciones';
-- Debe retornar: 1

-- 4. Verificar usuario prueba existe
SELECT id, username, nombre
FROM usuarios
WHERE username = 'prueba';
-- Debe retornar: id=1, username=prueba, nombre=Usuario Prueba

-- 5. Contar ubicaciones actuales
SELECT COUNT(*) as total_ubicaciones
FROM auditoria_ubicaciones;
-- Puede ser 0 si nunca se capturó GPS

-- 6. Ver últimas ubicaciones (si existen)
SELECT
    id,
    usuario_id,
    device_type,
    latitud,
    longitud,
    timestamp_entrada,
    actividad_realizada
FROM auditoria_ubicaciones
ORDER BY timestamp_entrada DESC
LIMIT 5;

-- SI TODOS LOS PASOS ANTERIORES ESTÁN BIEN:
-- ✅ Tabla existe
-- ✅ Funciones RPC existen
-- ✅ Vista existe
-- ✅ Usuario existe
-- → El problema está en el frontend o en la conexión
```

---

## 📝 CHECKLIST DE VERIFICACIÓN

### Base de Datos:
- [ ] Tabla `auditoria_ubicaciones` existe
- [ ] Función `registrar_entrada_ubicacion()` existe
- [ ] Función `registrar_salida_ubicacion()` existe
- [ ] Vista `v_analisis_ubicaciones` existe
- [ ] Usuario con ID=1 (prueba) existe

### Backend (Render):
- [ ] Servicio está "Live"
- [ ] Endpoint `/api/ubicaciones/entrada` responde
- [ ] Variable `API_URL` definida en geolocation-tracker.js
- [ ] Logs no muestran errores

### Frontend:
- [ ] Navegador soporta geolocalización
- [ ] HTTPS habilitado (Render lo provee automáticamente)
- [ ] Permisos de ubicación permitidos (no bloqueados)
- [ ] Popup de GPS aparece al login
- [ ] Consola muestra "Ubicación GPS obtenida"
- [ ] Network muestra POST /api/ubicaciones/entrada → 200 OK

### Mapa:
- [ ] Filtros configurados correctamente
- [ ] Fecha coincide con hoy
- [ ] Usuario seleccionado tiene ubicaciones
- [ ] Sin errores en consola

---

## 🚀 RESUMEN DE ARCHIVOS

| Archivo | Propósito | Cuándo Usar |
|---------|-----------|-------------|
| [CREAR_FUNCIONES_RPC_SUPABASE.sql](CREAR_FUNCIONES_RPC_SUPABASE.sql) | Crear funciones para guardar ubicaciones | **EJECUTAR AHORA** (si no existen) |
| [AGREGAR_GEOLOCALIZACION.sql](AGREGAR_GEOLOCALIZACION.sql) | Crear tabla auditoria_ubicaciones | Si la tabla no existe |
| [VERIFICAR_Y_CORREGIR_MAPA.sql](VERIFICAR_Y_CORREGIR_MAPA.sql) | Crear vista v_analisis_ubicaciones | Si la vista no existe |
| [DATOS_PRUEBA_UBICACIONES.sql](DATOS_PRUEBA_UBICACIONES.sql) | Insertar datos de prueba | Para testing (opcional) |

---

## ✅ PASOS FINALES

1. **Ejecutar en Supabase:**
   - [CREAR_FUNCIONES_RPC_SUPABASE.sql](CREAR_FUNCIONES_RPC_SUPABASE.sql)

2. **Probar en la aplicación:**
   - Login → Permitir GPS → Verificar consola

3. **Ver en el mapa:**
   - Configurar filtros → Buscar → Ver ubicación

4. **Si funciona:**
   - Cada vez que inicies sesión se guardará tu ubicación
   - El mapa mostrará todas tus ubicaciones
   - Podrás ver tiempo de permanencia en cada lugar

---

**EJECUTA EL PASO 1 AHORA (crear funciones RPC) y luego prueba iniciar sesión nuevamente.**
