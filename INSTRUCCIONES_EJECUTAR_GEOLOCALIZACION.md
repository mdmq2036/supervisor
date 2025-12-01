# 🎯 INSTRUCCIONES PARA EJECUTAR - SISTEMA DE GEOLOCALIZACIÓN

## 📋 ORDEN DE EJECUCIÓN

Sigue estos pasos **EN ORDEN** para implementar el sistema completo:

---

## PASO 1: EJECUTAR SCRIPT SQL EN SUPABASE ⚡

### Instrucciones:

1. **Abrir Supabase Dashboard**
   - Ir a: https://app.supabase.com
   - Seleccionar tu proyecto

2. **Abrir SQL Editor**
   - En el menú lateral, hacer clic en **"SQL Editor"**
   - Hacer clic en **"New query"**

3. **Copiar el script**
   - Abrir el archivo: `AGREGAR_GEOLOCALIZACION.sql`
   - Seleccionar TODO el contenido (Ctrl+A)
   - Copiar (Ctrl+C)

4. **Pegar y ejecutar**
   - Pegar en el editor SQL de Supabase (Ctrl+V)
   - Hacer clic en el botón **"RUN"** (esquina inferior derecha)
   - Esperar a que termine (puede tomar 10-15 segundos)

5. **Verificar éxito**
   - Deberías ver el mensaje: ✅ SCRIPT DE GEOLOCALIZACIÓN EJECUTADO EXITOSAMENTE
   - Si hay errores, copiarlos y revisar

### ✅ Verificación:

Ejecutar esta consulta para confirmar:

```sql
-- Verificar que la tabla se creó
SELECT COUNT(*) FROM auditoria_ubicaciones;

-- Debería retornar 0 (tabla vacía pero existente)
```

---

## PASO 2: IMPLEMENTAR ENDPOINTS EN EL BACKEND 🔧

### Opción A: Si tienes backend Node.js/Express

1. **Copiar el archivo de ejemplo**
   ```bash
   # En la terminal, desde la carpeta del proyecto:
   cp api-ubicaciones-ejemplo.js backend/routes/ubicaciones.routes.js
   ```

2. **Editar tu archivo principal del backend** (app.js o server.js)
   
   Agregar estas líneas:
   ```javascript
   // Importar rutas de ubicaciones
   const ubicacionesRoutes = require('./routes/ubicaciones.routes');
   
   // Registrar rutas
   app.use('/api/ubicaciones', ubicacionesRoutes);
   app.use('/api/usuarios', ubicacionesRoutes); // Para el endpoint de usuarios
   ```

3. **Reiniciar el servidor**
   ```bash
   npm restart
   # o
   node server.js
   ```

### Opción B: Si usas otro framework

Implementar manualmente estos 4 endpoints usando `api-ubicaciones-ejemplo.js` como referencia:

1. `POST /api/ubicaciones/entrada`
2. `POST /api/ubicaciones/salida`
3. `GET /api/ubicaciones`
4. `GET /api/usuarios`

### ✅ Verificación:

Probar los endpoints con curl o Postman:

```bash
# Probar endpoint de usuarios (debe estar autenticado)
curl http://localhost:3000/api/usuarios \
  -H "Authorization: Bearer TU_TOKEN_AQUI"

# Debería retornar lista de usuarios
```

---

## PASO 3: VERIFICAR ARCHIVOS DEL FRONTEND ✅

Los siguientes archivos ya están creados y listos:

- ✅ `geolocation-tracker.js` - Módulo de geolocalización
- ✅ `mapa-ubicaciones.html` - Página del mapa
- ✅ `mapa-ubicaciones.js` - Script del mapa
- ✅ `index.html` - Modificado con enlace al mapa

### Verificar que están en su lugar:

```
c:\MARTIN\LUIGGY\
├── geolocation-tracker.js  ← Debe existir
├── mapa-ubicaciones.html   ← Debe existir
├── mapa-ubicaciones.js     ← Debe existir
└── index.html              ← Modificado
```

---

## PASO 4: CONFIGURAR API_URL 🌐

1. **Abrir el archivo `config.js`**

2. **Verificar que API_URL apunta a tu backend:**

   ```javascript
   const API_URL = 'http://localhost:3000'; // Para desarrollo local
   // O
   const API_URL = 'https://tu-backend.onrender.com'; // Para producción
   ```

3. **Guardar el archivo**

---

## PASO 5: PROBAR EN EL NAVEGADOR 🧪

### Prueba 1: Verificar que el menú tiene la nueva opción

1. Abrir `index.html` en el navegador
2. Iniciar sesión con un usuario válido
3. Verificar que en el menú principal aparece: **🗺️ Mapa de Ubicaciones**

### Prueba 2: Acceder al mapa

1. Hacer clic en **"Mapa de Ubicaciones"**
2. El navegador pedirá permiso para acceder a la ubicación
3. Hacer clic en **"Permitir"**
4. Debería cargar el mapa

### Prueba 3: Verificar filtros

1. Seleccionar un rango de fechas
2. Hacer clic en **"Buscar"**
3. Si no hay datos, debería mostrar: "No se encontraron ubicaciones"

---

## PASO 6: PROBAR RASTREO DE UBICACIÓN 📍

### Método Manual (Recomendado para primera prueba):

1. **Abrir la consola del navegador** (F12)

2. **Ejecutar este código en la consola:**

   ```javascript
   // Obtener ID del usuario actual (ajustar según tu implementación)
   const userId = 1; // Cambiar por el ID real del usuario logueado
   
   // Iniciar rastreo
   GeolocationTracker.startTracking(userId, 'prueba', null)
     .then(result => {
       console.log('✅ Rastreo iniciado:', result);
     })
     .catch(error => {
       console.error('❌ Error:', error);
     });
   ```

3. **Esperar 5 segundos**

4. **Detener rastreo:**

   ```javascript
   GeolocationTracker.stopTracking()
     .then(() => {
       console.log('⏹️ Rastreo detenido');
     });
   ```

5. **Ir al mapa y verificar**
   - Ir a "Mapa de Ubicaciones"
   - Hacer clic en "Buscar"
   - Debería aparecer un marcador en tu ubicación actual

### Método Automático (Integrado con registro):

**Nota:** Esto requiere modificar `app.js` para integrar el rastreo automático.

Ver la sección "Integración con Registro" más abajo.

---

## PASO 7: VERIFICAR EN LA BASE DE DATOS 🗄️

1. **Ir a Supabase Dashboard**

2. **Abrir Table Editor**

3. **Seleccionar tabla `auditoria_ubicaciones`**

4. **Verificar que hay registros:**
   - Deberías ver al menos 1 registro de la prueba anterior
   - Verificar que tiene:
     - ✅ usuario_id
     - ✅ latitud y longitud
     - ✅ timestamp_entrada
     - ✅ timestamp_salida
     - ✅ duracion_minutos (calculado automáticamente)

---

## PASO 8: INTEGRACIÓN CON REGISTRO (OPCIONAL) 🔗

Para que el rastreo se active automáticamente al registrar una inspección:

### Modificar `app.js`:

Buscar la función que maneja el registro de inspecciones y agregar:

```javascript
// Al inicio de la función de registro
async function guardarInspeccion() {
    try {
        // Obtener datos del formulario
        const cuentaContrato = document.getElementById('cuentaContrato').value;
        const userId = getCurrentUserId(); // Tu función para obtener ID del usuario
        
        // NUEVO: Iniciar rastreo de ubicación
        let sessionId = null;
        try {
            const trackingResult = await GeolocationTracker.startTracking(
                userId, 
                'registro', 
                cuentaContrato
            );
            sessionId = trackingResult.sessionId;
            console.log('✅ Rastreo GPS iniciado');
        } catch (error) {
            console.warn('⚠️ No se pudo iniciar GPS:', error.message);
            // Continuar con el registro aunque falle el GPS
        }
        
        // ... resto del código de registro ...
        
        // Al finalizar el registro exitosamente:
        if (sessionId) {
            await GeolocationTracker.stopTracking();
            console.log('⏹️ Rastreo GPS detenido');
        }
        
    } catch (error) {
        console.error('Error al guardar:', error);
    }
}
```

---

## PASO 9: PROBAR EN DISPOSITIVO MÓVIL 📱

### Android:

1. **Habilitar GPS** en el dispositivo
2. **Abrir Chrome** en el móvil
3. **Acceder a la aplicación** (usar la IP local o URL de producción)
4. **Permitir ubicación** cuando se solicite
5. **Completar un registro**
6. **Verificar en el mapa** que aparece la ubicación

### iOS (iPhone/iPad):

1. **Habilitar Servicios de Ubicación**:
   - Ajustes → Privacidad → Servicios de Ubicación → Activar
2. **Configurar Safari**:
   - Ajustes → Safari → Ubicación → Permitir
3. **Abrir Safari** y acceder a la aplicación
4. **Permitir ubicación** cuando se solicite
5. **Completar un registro**
6. **Verificar en el mapa**

---

## PASO 10: DESPLEGAR A PRODUCCIÓN 🚀

### Si usas Render.com:

1. **Hacer commit de los cambios:**
   ```bash
   git add .
   git commit -m "Agregar sistema de geolocalización"
   git push origin main
   ```

2. **Esperar el deploy automático** en Render

3. **Verificar en producción:**
   - Abrir la URL de producción
   - Probar el mapa de ubicaciones
   - Verificar que funciona el GPS

### Si usas otro servicio:

Seguir el proceso de deploy habitual de tu plataforma.

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### ❌ Error: "Tabla auditoria_ubicaciones no existe"

**Solución:**
- Volver al PASO 1 y ejecutar el script SQL nuevamente
- Verificar que no hubo errores en la ejecución

### ❌ Error: "Cannot read property 'startTracking' of undefined"

**Solución:**
- Verificar que `geolocation-tracker.js` está cargado en `index.html`
- Verificar que está ANTES de `app.js` en el orden de scripts
- Recargar la página (Ctrl+F5)

### ❌ Error: "Permiso de ubicación denegado"

**Solución:**
- En Chrome: Configuración → Privacidad → Configuración de sitios → Ubicación
- Agregar tu sitio a "Permitidos"
- Recargar la página

### ❌ Error: "API endpoint not found"

**Solución:**
- Verificar que el backend está corriendo
- Verificar que `API_URL` en `config.js` es correcto
- Verificar que los endpoints están registrados en el backend

### ❌ El mapa no carga

**Solución:**
- Verificar conexión a internet
- Abrir consola (F12) y buscar errores
- Verificar que Leaflet CSS y JS están cargando

### ❌ No aparecen ubicaciones en el mapa

**Solución:**
- Verificar que hay datos en la tabla:
  ```sql
  SELECT * FROM auditoria_ubicaciones;
  ```
- Ampliar el rango de fechas en los filtros
- Verificar que el usuario tiene ubicaciones registradas

---

## ✅ CHECKLIST DE VERIFICACIÓN FINAL

Marcar cada item al completarlo:

- [ ] Script SQL ejecutado en Supabase sin errores
- [ ] Tabla `auditoria_ubicaciones` existe
- [ ] Funciones SQL creadas correctamente
- [ ] Endpoints de API implementados en el backend
- [ ] Backend reiniciado y funcionando
- [ ] `API_URL` configurado correctamente en `config.js`
- [ ] Archivos JS y HTML en su lugar
- [ ] Menú principal muestra "Mapa de Ubicaciones"
- [ ] Mapa carga correctamente
- [ ] Permisos de GPS funcionan
- [ ] Rastreo manual funciona (prueba en consola)
- [ ] Se registran ubicaciones en la base de datos
- [ ] Marcadores aparecen en el mapa
- [ ] Filtros funcionan correctamente
- [ ] Estadísticas se calculan
- [ ] Probado en PC
- [ ] Probado en móvil
- [ ] Desplegado a producción (si aplica)

---

## 📞 SIGUIENTE PASO

Una vez completados todos los pasos:

1. **Probar con usuarios reales**
2. **Monitorear el uso** durante unos días
3. **Ajustar configuración** según necesidades (intervalo de actualización, distancia mínima, etc.)
4. **Capacitar a los usuarios** sobre el uso del mapa

---

## 📚 DOCUMENTACIÓN ADICIONAL

- **Documentación completa**: `DOCUMENTACION_GEOLOCALIZACION.md`
- **Guía rápida**: `GUIA_RAPIDA_GEOLOCALIZACION.md`
- **Resumen ejecutivo**: `RESUMEN_GEOLOCALIZACION.md`

---

## 🎉 ¡LISTO!

Si completaste todos los pasos, el sistema de geolocalización está **100% funcional**.

**Fecha de implementación**: _______________  
**Implementado por**: _______________  
**Estado**: [ ] En pruebas  [ ] En producción

---

**¿Necesitas ayuda?** Revisa la sección de solución de problemas o consulta la documentación completa.
