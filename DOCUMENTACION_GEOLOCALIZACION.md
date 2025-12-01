# 🗺️ SISTEMA DE GEOLOCALIZACIÓN Y RASTREO DE TIEMPO DE PERMANENCIA

## 📋 Descripción General

Este módulo implementa un sistema completo de rastreo de ubicación GPS y tiempo de permanencia para el sistema DONET. Permite:

- ✅ Detectar automáticamente si el usuario está en PC o dispositivo móvil
- ✅ Activar GPS/geolocalización del navegador
- ✅ Registrar ubicaciones con timestamp de entrada y salida
- ✅ Calcular tiempo de permanencia en cada ubicación
- ✅ Visualizar ubicaciones en un mapa interactivo tipo Google Maps
- ✅ Generar reportes de auditoría con historial de ubicaciones

## 🗄️ Cambios en la Base de Datos

### Nueva Tabla: `auditoria_ubicaciones`

```sql
CREATE TABLE auditoria_ubicaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    device_fingerprint TEXT NOT NULL,
    device_type VARCHAR(50), -- 'mobile' o 'desktop'
    latitud DECIMAL(10, 8) NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL,
    precision_metros DECIMAL(10, 2),
    timestamp_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    timestamp_salida TIMESTAMP,
    duracion_minutos INTEGER,
    actividad_realizada VARCHAR(255),
    cuenta_contrato VARCHAR(100),
    ip_address VARCHAR(50),
    user_agent TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

### Nuevos Campos en `inspecciones`

```sql
ALTER TABLE inspecciones 
ADD COLUMN latitud_registro DECIMAL(10, 8),
ADD COLUMN longitud_registro DECIMAL(11, 8),
ADD COLUMN precision_gps DECIMAL(10, 2),
ADD COLUMN timestamp_gps TIMESTAMP;
```

### Funciones Creadas

1. **`calcular_duracion_permanencia()`**: Trigger que calcula automáticamente la duración cuando se registra la salida
2. **`registrar_entrada_ubicacion()`**: Función para registrar una nueva entrada de ubicación
3. **`registrar_salida_ubicacion()`**: Función para registrar la salida de una ubicación
4. **`obtener_historial_ubicaciones()`**: Función para consultar el historial de un usuario

### Vistas Creadas

1. **`v_analisis_ubicaciones`**: Vista con análisis completo de ubicaciones
2. **`v_resumen_ubicaciones_usuario`**: Resumen estadístico por usuario

## 📁 Archivos Creados

### 1. `AGREGAR_GEOLOCALIZACION.sql`
Script SQL para ejecutar en Supabase que crea todas las tablas, funciones y vistas necesarias.

**Instrucciones de ejecución:**
1. Abrir Supabase SQL Editor
2. Copiar y pegar el contenido del archivo
3. Ejecutar el script completo
4. Verificar que se crearon correctamente las tablas y funciones

### 2. `geolocation-tracker.js`
Módulo JavaScript que maneja toda la lógica de geolocalización:

**Características:**
- Detección automática de tipo de dispositivo (PC/móvil)
- Solicitud de permisos de geolocalización
- Monitoreo continuo de ubicación
- Cálculo de distancias entre puntos
- Registro automático de entradas y salidas
- Manejo de errores de GPS

**Uso básico:**
```javascript
// Iniciar rastreo
await GeolocationTracker.startTracking(userId, 'registro', cuentaContrato);

// Detener rastreo
await GeolocationTracker.stopTracking();

// Obtener historial
const historial = await GeolocationTracker.getLocationHistory(userId);
```

### 3. `mapa-ubicaciones.html`
Página web con mapa interactivo para visualizar ubicaciones.

**Características:**
- Mapa interactivo usando Leaflet (similar a Google Maps)
- Filtros por usuario, fecha y tipo de dispositivo
- Estadísticas en tiempo real
- Marcadores con colores según duración
- Popups informativos
- Lista de ubicaciones con scroll
- Diseño responsive

### 4. `mapa-ubicaciones.js`
Script JavaScript para el funcionamiento del mapa.

**Funcionalidades:**
- Carga de ubicaciones desde la API
- Renderizado de marcadores en el mapa
- Dibujo de rutas entre ubicaciones
- Cálculo de estadísticas
- Interacción con popups y lista

## 🔧 Integración con el Sistema Existente

### Modificaciones en `index.html`

1. **Nuevo menú**: Se agregó la tarjeta "Mapa de Ubicaciones" en el menú principal
2. **Script cargado**: Se incluyó `geolocation-tracker.js` en los scripts

### Flujo de Trabajo

```
1. Usuario inicia sesión
   ↓
2. Sistema detecta tipo de dispositivo (PC/móvil)
   ↓
3. Al acceder a "Registrar Inspección":
   - Se solicita permiso de GPS
   - Se registra ubicación de entrada
   - Se inicia monitoreo continuo
   ↓
4. Durante el registro:
   - Se actualiza ubicación cada 60 segundos
   - Si se mueve >50 metros, se registra nueva ubicación
   ↓
5. Al salir o completar registro:
   - Se registra timestamp de salida
   - Se calcula duración automáticamente
   ↓
6. Visualización en mapa:
   - Ver todas las ubicaciones
   - Filtrar por fecha/usuario
   - Analizar tiempo de permanencia
```

## 📊 Endpoints de API Necesarios

Deberás crear estos endpoints en tu backend:

### 1. POST `/api/ubicaciones/entrada`
Registrar entrada de ubicación

**Request:**
```json
{
  "usuario_id": 1,
  "device_fingerprint": "abc123",
  "device_type": "mobile",
  "latitud": -12.0464,
  "longitud": -77.0428,
  "precision_metros": 10.5,
  "actividad_realizada": "registro",
  "cuenta_contrato": "12345678",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0..."
}
```

**Response:**
```json
{
  "success": true,
  "session_id": 123
}
```

### 2. POST `/api/ubicaciones/salida`
Registrar salida de ubicación

**Request:**
```json
{
  "session_id": 123
}
```

**Response:**
```json
{
  "success": true,
  "duracion_minutos": 45
}
```

### 3. GET `/api/ubicaciones`
Obtener historial de ubicaciones

**Query params:**
- `usuario_id` (opcional)
- `fecha_inicio` (opcional)
- `fecha_fin` (opcional)
- `device_type` (opcional)

**Response:**
```json
[
  {
    "id": 1,
    "usuario_id": 1,
    "nombre_usuario": "Juan Pérez",
    "device_type": "mobile",
    "latitud": -12.0464,
    "longitud": -77.0428,
    "precision_metros": 10.5,
    "timestamp_entrada": "2025-12-01T10:00:00Z",
    "timestamp_salida": "2025-12-01T10:45:00Z",
    "duracion_minutos": 45,
    "actividad_realizada": "registro",
    "cuenta_contrato": "12345678"
  }
]
```

### 4. GET `/api/usuarios`
Listar usuarios (para filtros)

**Response:**
```json
[
  {
    "id": 1,
    "username": "usuario1",
    "nombre": "Juan Pérez"
  }
]
```

## 🎨 Características del Mapa

### Colores de Marcadores
- 🔵 Azul: Permanencia corta (< 15 min)
- 🟠 Naranja: Permanencia media (15-30 min)
- 🔴 Rojo: Permanencia larga (30-60 min)
- 🟣 Púrpura: Permanencia muy larga (> 60 min)
- ⚪ Gris: En curso (sin salida registrada)

### Estadísticas Mostradas
1. **Total de Ubicaciones**: Cantidad total de registros
2. **Tiempo Promedio**: Promedio de permanencia en minutos
3. **Dispositivos Únicos**: Cantidad de dispositivos diferentes
4. **Distancia Total**: Suma de distancias entre ubicaciones

## 🔐 Permisos de Geolocalización

### En Navegadores de PC
1. El navegador solicitará permiso la primera vez
2. El usuario debe hacer clic en "Permitir"
3. El permiso se guarda para futuras visitas

### En Dispositivos Móviles
1. El navegador solicitará permiso de ubicación
2. El usuario debe permitir acceso a la ubicación
3. En algunos casos, también se debe habilitar GPS en el dispositivo

### Manejo de Errores
- **Permiso denegado**: Se muestra mensaje al usuario
- **GPS no disponible**: Se informa que la función no está disponible
- **Timeout**: Se reintenta la obtención de ubicación

## 📱 Compatibilidad

### Navegadores Soportados
- ✅ Chrome (PC y móvil)
- ✅ Firefox (PC y móvil)
- ✅ Safari (PC y móvil)
- ✅ Edge (PC)
- ✅ Opera (PC y móvil)

### Dispositivos
- ✅ PC con Windows/Mac/Linux
- ✅ Smartphones Android
- ✅ iPhones/iPads
- ✅ Tablets Android

## 🚀 Pasos para Implementación

### 1. Base de Datos
```bash
# Ejecutar en Supabase SQL Editor
AGREGAR_GEOLOCALIZACION.sql
```

### 2. Backend (Node.js/Express)
Crear los 4 endpoints mencionados anteriormente usando las funciones SQL creadas.

### 3. Frontend
Los archivos ya están listos y cargados en el sistema.

### 4. Pruebas
1. Iniciar sesión en el sistema
2. Ir a "Registrar Inspección"
3. Permitir acceso a ubicación cuando se solicite
4. Completar un registro
5. Ir a "Mapa de Ubicaciones"
6. Verificar que aparece el marcador en el mapa

## 📈 Casos de Uso

### 1. Auditoría de Trabajo en Campo
- Ver dónde estuvo cada trabajador social
- Verificar tiempo de permanencia en cada visita
- Validar que se visitaron las ubicaciones correctas

### 2. Optimización de Rutas
- Analizar rutas tomadas por los trabajadores
- Identificar patrones de desplazamiento
- Optimizar asignación de zonas

### 3. Reportes de Productividad
- Tiempo promedio por visita
- Cantidad de ubicaciones visitadas por día
- Distancia total recorrida

### 4. Verificación de Inspecciones
- Confirmar que la inspección se realizó en la ubicación correcta
- Validar coincidencia entre ubicación GPS y dirección registrada

## ⚠️ Consideraciones Importantes

### Privacidad
- Los usuarios deben ser informados del rastreo de ubicación
- Se debe obtener consentimiento explícito
- Los datos deben ser usados solo para fines laborales

### Precisión del GPS
- En interiores: 10-50 metros
- En exteriores: 5-10 metros
- Depende de la calidad de la señal GPS

### Consumo de Batería
- El rastreo continuo consume batería
- Se actualiza cada 60 segundos para optimizar consumo
- Se puede ajustar el intervalo según necesidades

### Datos Móviles
- El envío de ubicaciones consume datos
- Aproximadamente 1-2 KB por actualización
- Considerar para usuarios con planes limitados

## 🔧 Configuración Avanzada

### Ajustar Intervalo de Actualización
En `geolocation-tracker.js`, línea 8:
```javascript
this.updateInterval = 60000; // Cambiar a 30000 para 30 segundos
```

### Ajustar Distancia Mínima para Nueva Ubicación
En `geolocation-tracker.js`, línea 137:
```javascript
if (distance > 50) { // Cambiar a 100 para 100 metros
```

### Cambiar Precisión del GPS
En `geolocation-tracker.js`, línea 61:
```javascript
const options = {
    enableHighAccuracy: true, // Cambiar a false para menor precisión pero menor consumo
    timeout: 10000,
    maximumAge: 0
};
```

## 📞 Soporte

Para cualquier duda o problema con el sistema de geolocalización:
1. Revisar la consola del navegador (F12)
2. Verificar que los permisos de ubicación estén habilitados
3. Confirmar que el GPS del dispositivo esté activo
4. Revisar los logs de la base de datos

## ✅ Checklist de Implementación

- [ ] Ejecutar script SQL en Supabase
- [ ] Crear endpoints de API en el backend
- [ ] Probar geolocalización en PC
- [ ] Probar geolocalización en móvil
- [ ] Verificar que se registran ubicaciones
- [ ] Verificar cálculo de duración
- [ ] Probar visualización en mapa
- [ ] Probar filtros del mapa
- [ ] Verificar estadísticas
- [ ] Documentar para usuarios finales

---

**Fecha de creación**: 2025-12-01  
**Versión**: 1.0  
**Autor**: Sistema DONET - Módulo de Geolocalización
