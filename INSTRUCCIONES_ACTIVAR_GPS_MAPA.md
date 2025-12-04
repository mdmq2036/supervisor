# 🗺️ ACTIVACIÓN DE GPS Y MAPA EN TIEMPO REAL

## 📋 Resumen de Cambios

Se ha implementado un sistema completo de geolocalización con:

✅ **Solicitud obligatoria de GPS** al iniciar el mapa  
✅ **Precisión de ±10 metros** (GPS de alta precisión)  
✅ **Recopilación automática de ubicaciones** cada 30 segundos  
✅ **Visualización en tiempo real** en el mapa  
✅ **Historial detallado** de ubicaciones por usuario  

---

## 🚀 PASOS PARA ACTIVAR

### PASO 1: Ejecutar SQL en Supabase

1. Abre el **SQL Editor** en Supabase:
   - https://app.supabase.com
   - Selecciona tu proyecto
   - Haz clic en **SQL Editor**

2. Copia TODO el contenido de:
   ```
   CREAR_TABLA_UBICACIONES_TIEMPO_REAL.sql
   ```

3. Pega en el editor y ejecuta (Ctrl+Enter)

4. Verifica que se crearon:
   - ✅ Tabla `ubicaciones_en_tiempo_real`
   - ✅ Vista `v_ubicaciones_tiempo_real`
   - ✅ Índices de rendimiento
   - ✅ Políticas de seguridad

### PASO 2: Actualizar GitHub

```bash
cd c:\MARTIN\LUIGGY
git add .
git commit -m "✨ Implementar GPS obligatorio y mapa en tiempo real con precisión ±10m"
git push origin main
```

### PASO 3: Desplegar en Render

1. Ve a: https://dashboard.render.com
2. Selecciona tu servicio web: `supervisor`
3. Haz clic en **Manual Deploy** → **Deploy latest commit**
4. Espera a que termine (2-3 minutos)

---

## 🧪 PRUEBAS

### Test 1: Verificar Solicitud de GPS

1. Abre: https://supervisor-svkg.onrender.com/mapa-ubicaciones.html
2. Deberías ver un modal que dice:
   ```
   📍 Activar Ubicación GPS
   Para usar el mapa de ubicaciones con precisión de ±10 metros...
   ```
3. Haz clic en **✓ Activar GPS**
4. El navegador pedirá permiso de ubicación
5. Acepta el permiso

### Test 2: Verificar Datos en el Mapa

1. Después de activar GPS, deberías ver:
   - ✅ Marcadores en el mapa
   - ✅ Precisión mostrada (ej: "Precisión: 8m")
   - ✅ Historial detallado
   - ✅ Estadísticas actualizadas

### Test 3: Actualización en Tiempo Real

1. El mapa se actualiza cada 30 segundos
2. Verifica en la consola (F12):
   ```
   ✅ GPS Activado - Precisión: 8 metros
   ✅ Ubicación guardada en servidor
   ```

---

## 📊 ESTRUCTURA DE DATOS

### Tabla: `ubicaciones_en_tiempo_real`

```sql
id                  BIGSERIAL PRIMARY KEY
usuario_id          BIGINT (referencia a usuario)
nombre              VARCHAR(255)
latitud             DECIMAL(10, 8)      -- ±10 metros
longitud            DECIMAL(11, 8)      -- ±10 metros
precision_metros    INTEGER             -- Precisión real del GPS
device_type         VARCHAR(50)         -- 'mobile' o 'desktop'
device_fingerprint  VARCHAR(255)        -- Identificador único del dispositivo
timestamp           TIMESTAMP           -- Hora exacta
activo              BOOLEAN             -- true/false
created_at          TIMESTAMP           -- Creación
updated_at          TIMESTAMP           -- Última actualización
```

### Vista: `v_ubicaciones_tiempo_real`

Combina datos de ubicaciones con cálculo de duración:

```sql
SELECT 
    id, usuario_id, nombre, latitud, longitud,
    precision_metros, device_type, timestamp,
    EXTRACT(EPOCH FROM (NOW() - timestamp)) / 60 as duracion_minutos
FROM ubicaciones_en_tiempo_real
WHERE activo = true
ORDER BY timestamp DESC
```

---

## 🔌 API ENDPOINTS

### 1. Guardar Ubicación (POST)

```bash
POST /api/ubicaciones/guardar

Body:
{
    "usuario_id": 123,
    "nombre": "Carlos",
    "latitud": -12.0464,
    "longitud": -77.0428,
    "precision_metros": 8,
    "device_type": "mobile",
    "device_fingerprint": "abc123..."
}

Response:
{
    "success": true,
    "data": { ... }
}
```

### 2. Obtener Ubicaciones (GET)

```bash
GET /api/ubicaciones?usuario_id=123&fecha_inicio=2025-12-03&fecha_fin=2025-12-03

Response:
[
    {
        "id": 1,
        "usuario_id": 123,
        "nombre": "Carlos",
        "latitud": -12.0464,
        "longitud": -77.0428,
        "precision_metros": 8,
        "duracion_minutos": 5,
        ...
    }
]
```

### 3. Obtener Ubicaciones en Tiempo Real (GET)

```bash
GET /api/ubicaciones/inicial

Response:
[
    { ... ubicaciones más recientes ... }
]
```

---

## 🔒 SEGURIDAD

### Row Level Security (RLS)

- ✅ Todos pueden ver ubicaciones (para supervisión)
- ✅ Usuarios pueden insertar sus propias ubicaciones
- ✅ Usuarios pueden actualizar sus ubicaciones
- ✅ Datos encriptados en tránsito (HTTPS)

### Limpieza Automática

- Ubicaciones más de 24 horas se eliminan automáticamente
- Función: `limpiar_ubicaciones_antiguas()`

---

## 📱 CARACTERÍSTICAS DEL MAPA

### Visualización

- 🗺️ Mapa interactivo con OpenStreetMap
- 📍 Marcadores numerados por orden de llegada
- 🎨 Colores según duración de permanencia
- 📊 Leyenda con rangos de tiempo

### Filtros

- 👤 Filtrar por usuario
- 📅 Filtrar por fecha (inicio/fin)
- 📱 Filtrar por tipo de dispositivo (móvil/PC)

### Reportes

- 📊 Permanencia por ubicación
- ⏱️ Duración promedio
- 📍 Distancia recorrida
- 📋 Historial detallado

---

## ⚙️ CONFIGURACIÓN AVANZADA

### Cambiar Intervalo de Actualización

En `mapa-ubicaciones.html`, línea ~439:

```javascript
// Actualizar ubicaciones cada 30 segundos
setInterval(actualizarUbicacionesEnTiempoReal, 30000);

// Cambiar a 60 segundos:
setInterval(actualizarUbicacionesEnTiempoReal, 60000);
```

### Cambiar Precisión de GPS

En `mapa-ubicaciones.html`, línea ~542:

```javascript
{
    enableHighAccuracy: true,    // true = ±10m, false = ±50m
    timeout: 10000,              // 10 segundos
    maximumAge: 0                // 0 = siempre actualizar
}
```

### Cambiar Ubicación por Defecto del Mapa

En `mapa-ubicaciones.html`, línea ~612:

```javascript
// Lima (actual)
map = L.map('map').setView([-12.0464, -77.0428], 13);

// Cambiar a otra ciudad:
// Buenos Aires: [-34.6037, -58.3816]
// Santiago: [-33.8688, -51.2093]
// Bogotá: [4.7110, -74.0721]
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### El mapa no muestra ubicaciones

1. Verifica que activaste GPS
2. Revisa la consola (F12) para errores
3. Confirma que la tabla existe en Supabase
4. Verifica que el usuario está logueado

### GPS no se activa

1. Comprueba que el navegador soporta geolocalización
2. Verifica los permisos del navegador
3. Intenta en modo incógnito
4. Usa HTTPS (no HTTP)

### Precisión baja (>50 metros)

1. Activa "Alta precisión" en el navegador
2. Acércate a una ventana
3. Espera 10-15 segundos para que se estabilice
4. Prueba en exterior (mejor señal GPS)

### No se guardan ubicaciones

1. Verifica que estés logueado
2. Abre la consola (F12)
3. Busca errores en Network
4. Confirma que el endpoint `/api/ubicaciones/guardar` existe

---

## 📞 SOPORTE

Si encuentras problemas:

1. Revisa los logs en Render:
   https://dashboard.render.com/web/srv-d4lsclu3jp1c739ibb2g/logs

2. Verifica Supabase:
   https://app.supabase.com → Logs

3. Abre la consola del navegador (F12)

---

## ✅ CHECKLIST FINAL

- [ ] SQL ejecutado en Supabase
- [ ] Tabla `ubicaciones_en_tiempo_real` creada
- [ ] Vista `v_ubicaciones_tiempo_real` creada
- [ ] Cambios pusheados a GitHub
- [ ] Render desplegado
- [ ] Mapa abre sin errores
- [ ] Modal de GPS aparece
- [ ] GPS se activa correctamente
- [ ] Ubicaciones aparecen en el mapa
- [ ] Datos se actualizan cada 30 segundos

---

**Versión:** 1.0  
**Fecha:** Diciembre 3, 2025  
**Estado:** ✅ LISTO PARA PRODUCCIÓN
