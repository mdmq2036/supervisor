# 🚀 GUÍA RÁPIDA DE IMPLEMENTACIÓN - GEOLOCALIZACIÓN

## ⚡ Pasos para Activar el Sistema

### PASO 1: Ejecutar Script SQL en Supabase ✅

1. Abrir Supabase Dashboard
2. Ir a **SQL Editor**
3. Abrir el archivo `AGREGAR_GEOLOCALIZACION.sql`
4. Copiar todo el contenido
5. Pegar en el editor SQL
6. Hacer clic en **RUN**
7. Verificar que aparezca: ✅ SCRIPT DE GEOLOCALIZACIÓN EJECUTADO EXITOSAMENTE

**Verificación:**
```sql
-- Ejecutar esta consulta para verificar
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'auditoria_ubicaciones';
```

---

### PASO 2: Implementar Endpoints en el Backend 🔧

**Opción A: Si tienes backend Node.js/Express**

1. Copiar el archivo `api-ubicaciones-ejemplo.js`
2. Renombrar a `ubicaciones.routes.js`
3. Colocar en la carpeta `routes/` de tu backend
4. Agregar en tu `app.js` o `server.js`:

```javascript
const ubicacionesRoutes = require('./routes/ubicaciones.routes');
app.use('/api/ubicaciones', ubicacionesRoutes);
```

**Opción B: Si usas otro framework**

Implementar estos 4 endpoints básicos:

1. **POST** `/api/ubicaciones/entrada` - Registrar entrada
2. **POST** `/api/ubicaciones/salida` - Registrar salida
3. **GET** `/api/ubicaciones` - Listar ubicaciones con filtros
4. **GET** `/api/usuarios` - Listar usuarios

Ver `api-ubicaciones-ejemplo.js` para la lógica de cada endpoint.

---

### PASO 3: Configurar Variable de API en Frontend 🌐

Editar `config.js` y asegurarse de que `API_URL` apunte a tu backend:

```javascript
const API_URL = 'https://tu-backend.com'; // O tu URL de backend
```

---

### PASO 4: Probar en Navegador 🧪

1. Abrir `index.html` en el navegador
2. Iniciar sesión con un usuario
3. Ir a **"Mapa de Ubicaciones"**
4. El navegador pedirá permiso para acceder a la ubicación
5. Hacer clic en **"Permitir"**

**Si todo funciona:**
- ✅ Verás el mapa cargado
- ✅ Podrás ver filtros y estadísticas
- ✅ Al hacer clic en "Buscar" se cargarán las ubicaciones

---

## 🔍 Cómo Funciona el Rastreo Automático

### Cuando el usuario hace un registro:

```javascript
// En app.js, agregar al inicio de la función de registro:
async function guardarRegistro() {
    const userId = getCurrentUserId(); // Tu función para obtener ID del usuario
    const cuentaContrato = document.getElementById('cuentaContrato').value;
    
    // Iniciar rastreo de ubicación
    try {
        await GeolocationTracker.startTracking(userId, 'registro', cuentaContrato);
        console.log('✅ Rastreo de ubicación iniciado');
    } catch (error) {
        console.warn('⚠️ No se pudo iniciar rastreo GPS:', error.message);
        // Continuar con el registro aunque falle el GPS
    }
    
    // ... resto del código de registro
}
```

### Cuando el usuario termina o sale:

```javascript
// Al finalizar el registro o cerrar sesión
async function finalizarRegistro() {
    // Detener rastreo
    await GeolocationTracker.stopTracking();
    console.log('⏹️ Rastreo de ubicación detenido');
    
    // ... resto del código
}
```

---

## 📱 Pruebas en Dispositivos

### En PC (Chrome/Firefox/Edge):

1. Abrir DevTools (F12)
2. Ir a la pestaña **Console**
3. Buscar mensajes como:
   - ✅ Rastreo de ubicación iniciado
   - 📍 Ubicación actual: lat, lon

### En Móvil:

1. Abrir la aplicación en el navegador móvil
2. Permitir acceso a ubicación cuando se solicite
3. Verificar que aparece el ícono de GPS activo en la barra de estado
4. Completar un registro
5. Ir a "Mapa de Ubicaciones" y verificar que aparece el marcador

---

## 🗺️ Usar el Mapa de Ubicaciones

### Acceso:
Desde el menú principal → **"Mapa de Ubicaciones"** 🗺️

### Funciones:

1. **Filtrar por usuario**: Seleccionar usuario del dropdown
2. **Filtrar por fecha**: Establecer rango de fechas
3. **Filtrar por dispositivo**: PC o Móvil
4. **Ver estadísticas**: 
   - Total de ubicaciones
   - Tiempo promedio de permanencia
   - Dispositivos únicos
   - Distancia total recorrida

5. **Interactuar con el mapa**:
   - Hacer clic en marcadores para ver detalles
   - Ver ruta trazada entre ubicaciones
   - Zoom in/out con la rueda del mouse

6. **Lista de ubicaciones**:
   - Hacer clic en una ubicación para centrar el mapa
   - Ver detalles de cada visita

---

## 🎨 Colores de los Marcadores

- 🟢 **Verde**: Permanencia muy corta (< 5 min)
- 🔵 **Azul**: Permanencia corta (5-15 min)
- 🟠 **Naranja**: Permanencia media (15-30 min)
- 🔴 **Rojo**: Permanencia larga (30-60 min)
- 🟣 **Púrpura**: Permanencia muy larga (> 60 min)
- ⚪ **Gris**: En curso (aún no ha salido)

---

## ⚙️ Configuración Opcional

### Cambiar intervalo de actualización de GPS:

En `geolocation-tracker.js`, línea 8:

```javascript
this.updateInterval = 60000; // 60 segundos (default)
// Cambiar a:
this.updateInterval = 30000; // 30 segundos (más frecuente)
// O:
this.updateInterval = 120000; // 2 minutos (menos frecuente, ahorra batería)
```

### Cambiar distancia mínima para nueva ubicación:

En `geolocation-tracker.js`, línea 137:

```javascript
if (distance > 50) { // 50 metros (default)
// Cambiar a:
if (distance > 100) { // 100 metros (menos sensible)
```

---

## 🐛 Solución de Problemas

### ❌ Error: "Permiso de ubicación denegado"

**Solución:**
1. En Chrome: Configuración → Privacidad y seguridad → Configuración de sitios → Ubicación
2. Agregar tu sitio a "Permitidos"
3. Recargar la página

### ❌ Error: "Geolocalización no soportada"

**Solución:**
- Verificar que estás usando HTTPS (no HTTP)
- Actualizar el navegador a la última versión
- Probar en otro navegador

### ❌ El mapa no carga

**Solución:**
1. Verificar conexión a internet
2. Abrir consola (F12) y buscar errores
3. Verificar que `API_URL` en `config.js` es correcto
4. Verificar que los endpoints del backend están funcionando

### ❌ No aparecen ubicaciones en el mapa

**Solución:**
1. Verificar que hay datos en la tabla `auditoria_ubicaciones`:
```sql
SELECT COUNT(*) FROM auditoria_ubicaciones;
```
2. Verificar filtros de fecha (ampliar rango)
3. Verificar que el usuario tiene ubicaciones registradas

### ❌ GPS muy impreciso

**Solución:**
- En móvil: Activar "Alta precisión" en configuración de ubicación
- Salir al exterior (mejor señal GPS)
- Esperar unos segundos para que el GPS se calibre

---

## 📊 Consultas SQL Útiles

### Ver todas las ubicaciones:
```sql
SELECT * FROM v_analisis_ubicaciones 
ORDER BY timestamp_entrada DESC 
LIMIT 50;
```

### Ver resumen por usuario:
```sql
SELECT * FROM v_resumen_ubicaciones_usuario;
```

### Ver ubicaciones activas (sin salida):
```sql
SELECT * FROM auditoria_ubicaciones 
WHERE timestamp_salida IS NULL;
```

### Cerrar todas las sesiones abiertas:
```sql
UPDATE auditoria_ubicaciones 
SET timestamp_salida = CURRENT_TIMESTAMP 
WHERE timestamp_salida IS NULL;
```

### Estadísticas del día:
```sql
SELECT 
    COUNT(*) as total_ubicaciones,
    AVG(duracion_minutos) as promedio_minutos,
    SUM(duracion_minutos) as total_minutos
FROM auditoria_ubicaciones
WHERE DATE(timestamp_entrada) = CURRENT_DATE;
```

---

## ✅ Checklist de Verificación

- [ ] Script SQL ejecutado en Supabase
- [ ] Tabla `auditoria_ubicaciones` creada
- [ ] Funciones SQL creadas
- [ ] Endpoints de API implementados
- [ ] `API_URL` configurado correctamente
- [ ] Archivos JS cargados en `index.html`
- [ ] Menú "Mapa de Ubicaciones" visible
- [ ] Permisos de GPS funcionando en PC
- [ ] Permisos de GPS funcionando en móvil
- [ ] Mapa carga correctamente
- [ ] Filtros funcionan
- [ ] Estadísticas se calculan
- [ ] Marcadores aparecen en el mapa
- [ ] Popups muestran información correcta
- [ ] Lista de ubicaciones funciona

---

## 🎯 Próximos Pasos Recomendados

1. **Agregar notificaciones**: Avisar al usuario cuando se inicia/detiene el rastreo
2. **Exportar datos**: Permitir descargar historial de ubicaciones en CSV/PDF
3. **Alertas de geofencing**: Notificar si el usuario sale de un área específica
4. **Optimización de rutas**: Sugerir rutas óptimas basadas en historial
5. **Integración con inspecciones**: Validar que la ubicación GPS coincida con la dirección

---

## 📞 Soporte

Si tienes problemas:

1. Revisar la consola del navegador (F12)
2. Revisar logs del backend
3. Ejecutar consultas SQL de verificación
4. Revisar la documentación completa en `DOCUMENTACION_GEOLOCALIZACION.md`

---

**¡Listo! El sistema de geolocalización está funcionando.** 🎉

Para cualquier duda, consultar `DOCUMENTACION_GEOLOCALIZACION.md` para información detallada.
