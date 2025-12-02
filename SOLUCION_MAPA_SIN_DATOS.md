# 🗺️ SOLUCIÓN: Mapa sin Ubicaciones

## 📋 PROBLEMA IDENTIFICADO

**Síntoma:** El mapa de ubicaciones aparece vacío con "0 ubicaciones" aunque hay equipos conectados.

**Causa posible:**
1. La vista `v_analisis_ubicaciones` no existe en Supabase
2. No hay datos en la tabla `auditoria_ubicaciones`
3. El GPS no se activó correctamente al iniciar sesión

---

## ✅ SOLUCIÓN PASO A PASO

### PASO 1: Verificar la Base de Datos

**Ir a Supabase:**
```
https://supabase.com/dashboard/project/bvqmaaxtaetebjsgdphj/editor
```

**Ejecutar el script de verificación:**

1. Click en "SQL Editor" (ícono de base de datos en el menú lateral)
2. Click en "+ New query"
3. Copiar y pegar el contenido del archivo: [VERIFICAR_Y_CORREGIR_MAPA.sql](VERIFICAR_Y_CORREGIR_MAPA.sql)
4. Click en "Run" o presionar Ctrl + Enter
5. Revisar los resultados

**Qué buscar en los resultados:**

✅ **Si dice:** "Vista v_analisis_ubicaciones ya existe"
   → La vista está creada correctamente

❌ **Si dice:** "Vista v_analisis_ubicaciones NO existe"
   → El script la creará automáticamente

✅ **Si muestra:** "Total de ubicaciones: 5" (o cualquier número > 0)
   → Hay datos en la base de datos

❌ **Si muestra:** "Total de ubicaciones: 0"
   → NO hay datos, necesitas insertar datos de prueba

---

### PASO 2: Insertar Datos de Prueba (Si no hay ubicaciones)

**Si el PASO 1 mostró 0 ubicaciones:**

1. En Supabase SQL Editor, crear otra "New query"
2. Copiar y pegar el contenido del archivo: [DATOS_PRUEBA_UBICACIONES.sql](DATOS_PRUEBA_UBICACIONES.sql)
3. Click en "Run"
4. Deberías ver: "INSERT 0 5" (5 filas insertadas)

**Datos de prueba que se insertarán:**

| Ubicación | Latitud | Longitud | Usuario |
|-----------|---------|----------|---------|
| Plaza Mayor, Lima | -12.0464 | -77.0428 | prueba (ID: 1) |
| Miraflores | -12.1196 | -77.0350 | prueba |
| San Isidro | -12.0941 | -77.0364 | prueba |
| Surco | -12.1500 | -77.0100 | prueba |
| La Molina | -12.0800 | -76.9400 | prueba |

---

### PASO 3: Verificar en la Aplicación

**Abrir el mapa:**
```
https://donet-supervision-system.onrender.com/mapa-ubicaciones.html
```

**Configurar filtros:**

1. **Usuario:** Seleccionar "prueba" (o "Todos los usuarios")
2. **Fecha Inicio:** `2025-12-01`
3. **Fecha Fin:** `2025-12-01`
4. **Tipo Dispositivo:** "Todos"
5. Click en **"Buscar"**

**Resultado esperado:**

✅ **Deberías ver:**
- 5 ubicaciones en las estadísticas
- 5 marcadores en el mapa (Lima, Perú)
- Tiempo promedio de permanencia
- Lista de ubicaciones con detalles

❌ **Si aún aparece vacío:**
- Revisar consola del navegador (F12 → Console)
- Buscar errores en rojo
- Verificar que el filtro de fecha incluya el 1 de diciembre 2025

---

### PASO 4: Activar GPS en Tiempo Real

Para que se guarden ubicaciones reales (no de prueba):

**1. Iniciar sesión en la aplicación:**
```
https://donet-supervision-system.onrender.com
Usuario: prueba
Contraseña: prueba2025
```

**2. Permitir GPS cuando aparezca el popup del navegador:**
```
[Permitir] ← Click aquí
```

**3. Verificar en consola (F12):**
```
✅ Ubicación GPS obtenida: {latitude: -12.0464, longitude: -77.0428}
✅ Rastreo de ubicación iniciado
```

**4. Esperar 1-2 minutos y verificar en Supabase:**
```sql
SELECT * FROM auditoria_ubicaciones
ORDER BY entrada_timestamp DESC
LIMIT 5;
```

Deberías ver una nueva fila con tu ubicación GPS real.

---

## 🔍 DIAGNÓSTICO DE PROBLEMAS

### Problema 1: "Not Found" en la API

**Síntoma:**
```
GET /api/ubicaciones → 404 Not Found
```

**Solución:**
- Verificar que Render haya desplegado correctamente
- Ir a: https://dashboard.render.com/web/srv-d4lsclu3jp1c739ibb2g
- Buscar "Your service is live" en los logs
- Si no aparece, hacer un nuevo deploy manual

**Comandos para verificar:**
```bash
curl https://donet-supervision-system.onrender.com/api/usuarios
```

Debería retornar JSON con lista de usuarios.

---

### Problema 2: Vista no existe

**Síntoma en logs de Supabase:**
```
ERROR: relation "v_analisis_ubicaciones" does not exist
```

**Solución:**
Ejecutar [VERIFICAR_Y_CORREGIR_MAPA.sql](VERIFICAR_Y_CORREGIR_MAPA.sql) en Supabase SQL Editor.

---

### Problema 3: GPS no se activa

**Síntoma:**
No aparece popup de ubicación al iniciar sesión.

**Verificar:**

1. **Navegador soporta GPS:**
```javascript
// En consola del navegador (F12):
'geolocation' in navigator
// Debería retornar: true
```

2. **Permisos del sitio:**
- Click en el candado 🔒 en la barra de direcciones
- Verificar "Ubicación" → debe estar en "Permitir"
- Si está en "Bloqueado", cambiar a "Permitir"
- Recargar la página (F5)

3. **GPS activado en el dispositivo:**
- En móviles: Activar GPS en configuración
- En PC: Activar "Servicios de ubicación" en Windows

---

### Problema 4: No se guardan ubicaciones

**Síntoma:**
GPS se activa pero no aparecen en el mapa.

**Verificar en consola (F12 → Network):**

1. Buscar request: `POST /api/ubicaciones/entrada`
2. Verificar:
   - Status: 200 OK ✅
   - Response: `{"success": true, "session_id": "..."}`

**Si retorna error:**
- Ver el mensaje de error en Response
- Verificar que las funciones RPC existan en Supabase:
  - `registrar_entrada_ubicacion`
  - `registrar_salida_ubicacion`

---

## 📝 COMANDOS ÚTILES

### Verificar datos en Supabase (SQL Editor):

```sql
-- Total de ubicaciones
SELECT COUNT(*) FROM auditoria_ubicaciones;

-- Últimas 10 ubicaciones
SELECT
    id,
    usuario_id,
    latitud,
    longitud,
    entrada_timestamp,
    duracion_minutos,
    device_type
FROM auditoria_ubicaciones
ORDER BY entrada_timestamp DESC
LIMIT 10;

-- Ubicaciones por usuario
SELECT
    u.username,
    COUNT(au.id) as total,
    MAX(au.entrada_timestamp) as ultima
FROM usuarios u
LEFT JOIN auditoria_ubicaciones au ON u.id = au.usuario_id
GROUP BY u.username;

-- Verificar que la vista funciona
SELECT * FROM v_analisis_ubicaciones LIMIT 5;
```

---

### Verificar API desde terminal:

```bash
# Usuarios
curl https://donet-supervision-system.onrender.com/api/usuarios

# Ubicaciones (todas)
curl https://donet-supervision-system.onrender.com/api/ubicaciones

# Ubicaciones (filtradas por usuario prueba = ID 1)
curl "https://donet-supervision-system.onrender.com/api/ubicaciones?usuario_id=1"

# Ubicaciones (filtradas por fecha)
curl "https://donet-supervision-system.onrender.com/api/ubicaciones?fecha_inicio=2025-12-01&fecha_fin=2025-12-01"
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

### Base de Datos:
- [ ] Vista `v_analisis_ubicaciones` existe
- [ ] Tabla `auditoria_ubicaciones` tiene datos
- [ ] Funciones RPC `registrar_entrada_ubicacion` y `registrar_salida_ubicacion` existen
- [ ] Hay al menos 1 usuario con ID = 1 (prueba)

### Backend (Render):
- [ ] Servicio está "Live" (no suspended)
- [ ] Endpoint `/api/ubicaciones` responde 200 OK
- [ ] Endpoint `/api/usuarios` responde 200 OK
- [ ] Variable `API_URL` definida en geolocation-tracker.js

### Frontend:
- [ ] GPS se solicita al iniciar sesión
- [ ] Popup de ubicación aparece en el navegador
- [ ] Consola muestra "Ubicación GPS obtenida"
- [ ] Consola muestra "Rastreo de ubicación iniciado"
- [ ] No hay errores en consola (F12)

### Mapa:
- [ ] Página mapa-ubicaciones.html carga correctamente
- [ ] Filtros aparecen con opciones
- [ ] Al buscar, se muestran ubicaciones
- [ ] Marcadores aparecen en el mapa
- [ ] Estadísticas muestran números correctos

---

## 🚀 RESUMEN DE ARCHIVOS

| Archivo | Propósito |
|---------|-----------|
| [VERIFICAR_Y_CORREGIR_MAPA.sql](VERIFICAR_Y_CORREGIR_MAPA.sql) | Verificar y crear vista si no existe |
| [DATOS_PRUEBA_UBICACIONES.sql](DATOS_PRUEBA_UBICACIONES.sql) | Insertar 5 ubicaciones de prueba |
| [geolocation-tracker.js](geolocation-tracker.js) | Módulo de rastreo GPS (con API_URL corregido) |
| [mapa-ubicaciones.js](mapa-ubicaciones.js) | Script del mapa (con API_URL corregido) |
| [server.js](server.js) | Backend con endpoints de ubicaciones |

---

## 📞 SOPORTE

Si después de seguir todos los pasos el mapa sigue vacío:

1. **Captura de pantalla de:**
   - Consola del navegador (F12 → Console)
   - Pestaña Network (F12 → Network) mostrando la llamada a `/api/ubicaciones`
   - Resultado del script VERIFICAR_Y_CORREGIR_MAPA.sql en Supabase

2. **Información adicional:**
   - ¿Apareció el popup de GPS al iniciar sesión?
   - ¿Qué mensaje apareció después de permitir GPS?
   - ¿Hay errores en rojo en la consola?

---

**Fecha:** 2025-12-01
**Última actualización:** Commit 85a2398
**Estado:** Documentación completa para diagnóstico y corrección
