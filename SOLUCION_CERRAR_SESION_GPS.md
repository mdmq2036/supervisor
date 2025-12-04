# 🔄 SOLUCIÓN: Cerrar Sesiones GPS al Hacer Logout

## 📋 Problema Identificado

Cuando un usuario cierra sesión y vuelve a iniciar, la ubicación GPS anterior se queda "pegada" porque:
1. La sesión GPS no se cierra correctamente
2. Las ubicaciones en tiempo real quedan marcadas como `activo = true`
3. El rastreo GPS local no se detiene

## ✅ Solución Implementada

He creado una solución completa que cierra correctamente las sesiones GPS:

### 1. Base de Datos (Supabase)

**Archivo:** `CREAR_FUNCION_CERRAR_SESION_GPS.sql`

**Funciones creadas:**
- `cerrar_sesion_gps_usuario(p_usuario_id)` - Cierra sesiones de un usuario específico
- `cerrar_todas_sesiones_gps()` - Cierra todas las sesiones activas (mantenimiento)

**Qué hace:**
- Marca `activo = false` en `ubicaciones_en_tiempo_real`
- Cierra sesiones abiertas en `auditoria_ubicaciones`
- Calcula duración de permanencia automáticamente

### 2. Backend (server.js)

**Endpoint nuevo:** `POST /api/ubicaciones/cerrar-sesion`

```javascript
// Cierra sesiones GPS de un usuario
app.post('/api/ubicaciones/cerrar-sesion', async (req, res) => {
    const { usuario_id } = req.body;
    await supabase.rpc('cerrar_sesion_gps_usuario', { p_usuario_id: usuario_id });
    res.json({ success: true });
});
```

### 3. Frontend (index.html)

**Función actualizada:** `handleLogout()`

Ahora hace:
1. ✅ Detiene rastreo GPS local (`GeolocationTracker.stopTracking()`)
2. ✅ Llama al endpoint para cerrar sesiones en servidor
3. ✅ Limpia localStorage
4. ✅ Vuelve a pantalla de login

---

## 🚀 Pasos para Implementar

### Paso 1: Ejecutar Script SQL en Supabase

1. Abre **Supabase SQL Editor**
2. Ejecuta el archivo: `CREAR_FUNCION_CERRAR_SESION_GPS.sql`
3. Verifica que aparezca: ✅ FUNCIONES PARA CERRAR SESIONES GPS CREADAS

### Paso 2: Actualizar GitHub y Desplegar

Los archivos ya están actualizados localmente:
- ✅ `server.js` - Endpoint `/api/ubicaciones/cerrar-sesion` agregado
- ✅ `index.html` - Función `handleLogout()` actualizada

```bash
# Hacer commit
git add server.js index.html CREAR_FUNCION_CERRAR_SESION_GPS.sql
git commit -m "fix: Cerrar sesiones GPS correctamente al hacer logout"

# Push a GitHub
git push origin main
```

### Paso 3: Ejecutar Script SQL en Producción

Después de que Render despliegue:
1. Abre Supabase de **producción**
2. Ejecuta el mismo script: `CREAR_FUNCION_CERRAR_SESION_GPS.sql`

### Paso 4: Probar

1. Inicia sesión en la aplicación
2. Permite GPS
3. Verifica que se registre tu ubicación
4. Haz clic en "Cerrar Sesión"
5. Vuelve a iniciar sesión
6. Verifica que se registre una **nueva** ubicación (no la anterior)

---

## 🔍 Verificación

### Ver sesiones activas:
```sql
SELECT 
    u.usuario_id,
    u.nombre,
    u.latitud,
    u.longitud,
    u.timestamp,
    u.activo
FROM ubicaciones_en_tiempo_real u
WHERE u.activo = true
ORDER BY u.timestamp DESC;
```

### Cerrar manualmente sesiones de un usuario:
```sql
SELECT cerrar_sesion_gps_usuario(1); -- Reemplaza 1 con el ID del usuario
```

### Cerrar TODAS las sesiones (mantenimiento):
```sql
SELECT * FROM cerrar_todas_sesiones_gps();
```

---

## 📊 Flujo Completo

### Al Iniciar Sesión:
1. Usuario ingresa credenciales
2. Se solicita permiso GPS
3. Se inicia rastreo GPS local (`GeolocationTracker.startTracking()`)
4. Se registra ubicación en `ubicaciones_en_tiempo_real` con `activo = true`
5. Se registra entrada en `auditoria_ubicaciones`

### Al Cerrar Sesión:
1. Usuario hace clic en "Cerrar Sesión"
2. Se detiene rastreo GPS local (`GeolocationTracker.stopTracking()`)
3. Se llama a `/api/ubicaciones/cerrar-sesion`
4. Se marca `activo = false` en `ubicaciones_en_tiempo_real`
5. Se cierra sesión en `auditoria_ubicaciones` (timestamp_salida)
6. Se limpia localStorage
7. Se vuelve a pantalla de login

### Al Volver a Iniciar Sesión:
1. Usuario ingresa credenciales nuevamente
2. Se solicita permiso GPS nuevamente
3. Se inicia **NUEVO** rastreo GPS
4. Se registra **NUEVA** ubicación (no la anterior)

---

## 🐛 Solución de Problemas

### Problema: La ubicación sigue "pegada" después de logout

**Solución:**
1. Verifica que ejecutaste el script SQL en Supabase
2. Verifica que el servidor se reinició después de actualizar `server.js`
3. Limpia caché del navegador (Ctrl+Shift+R)
4. Cierra todas las pestañas de la aplicación y vuelve a abrir

### Problema: Error "cerrar_sesion_gps_usuario does not exist"

**Solución:**
1. Ejecuta el script SQL en Supabase
2. Verifica que la función se creó:
   ```sql
   SELECT routine_name 
   FROM information_schema.routines
   WHERE routine_name = 'cerrar_sesion_gps_usuario';
   ```

### Problema: No se cierran las sesiones

**Solución:**
1. Abre consola del navegador (F12)
2. Verifica que aparezcan los mensajes:
   - ✅ Rastreo GPS local detenido
   - ✅ Sesiones GPS cerradas en servidor
   - ✅ Logout completado correctamente
3. Si no aparecen, verifica que `currentUser.id` existe

---

## ✅ Checklist de Implementación

- [ ] Ejecutar `CREAR_FUNCION_CERRAR_SESION_GPS.sql` en Supabase desarrollo
- [ ] Verificar que funciones se crearon correctamente
- [ ] Hacer commit de cambios (server.js, index.html)
- [ ] Push a GitHub
- [ ] Esperar despliegue en Render
- [ ] Ejecutar mismo script SQL en Supabase producción
- [ ] Probar logout/login en desarrollo
- [ ] Probar logout/login en producción
- [ ] Verificar que ubicaciones se actualizan correctamente

---

## 📝 Archivos Modificados

1. ✅ `CREAR_FUNCION_CERRAR_SESION_GPS.sql` (nuevo)
2. ✅ `server.js` (endpoint agregado)
3. ✅ `index.html` (handleLogout actualizado)

---

**Última actualización:** 2025-12-04 15:58
**Estado:** ✅ LISTO PARA IMPLEMENTAR
**Impacto:** Resuelve problema de ubicaciones "pegadas" al hacer logout
