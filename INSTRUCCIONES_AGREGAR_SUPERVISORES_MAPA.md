# INSTRUCCIONES: Agregar Supervisores al Mapa de Ubicaciones GPS

## 📋 Resumen de Cambios

Se han realizado las siguientes modificaciones para que los **supervisores** también aparezcan en el mapa de ubicaciones GPS:

### 1. ✅ Cambios en el Backend (server.js)

**Archivo modificado:** `server.js`

El endpoint `/api/usuarios` ahora combina tanto usuarios regulares como supervisores:

```javascript
// Antes: Solo usuarios regulares
const { data, error } = await supabase
    .from('usuarios')
    .select('id, username, nombre')
    .order('nombre');

// Ahora: Usuarios + Supervisores
const { data: usuarios } = await supabase.from('usuarios')...
const { data: supervisores } = await supabase.from('supervisores')...
const usuariosCombinados = [...usuarios, ...supervisores];
```

**Resultado:** El filtro de usuarios en el mapa ahora muestra:
- Usuarios regulares: "Nombre Usuario"
- Supervisores: "Nombre Supervisor (Supervisor)"

---

### 2. 📊 Actualización de Vistas en la Base de Datos

**Archivo creado:** `ACTUALIZAR_VISTA_INCLUIR_SUPERVISORES.sql`

Este script actualiza dos vistas importantes:

#### Vista 1: `v_analisis_ubicaciones`
- Combina ubicaciones de usuarios y supervisores usando `UNION ALL`
- Agrega campo `tipo_usuario` para distinguir entre 'usuario' y 'supervisor'
- Mantiene toda la funcionalidad existente (clasificación de duración, etc.)

#### Vista 2: `v_ubicaciones_tiempo_real`
- Incluye ubicaciones en tiempo real de ambos tipos de usuarios
- Permite ver supervisores activos en el mapa
- Calcula duración de permanencia para ambos

---

## 🚀 Pasos para Implementar

### Paso 1: Actualizar la Base de Datos

1. Abre **Supabase SQL Editor**
2. Ejecuta el archivo: `ACTUALIZAR_VISTA_INCLUIR_SUPERVISORES.sql`
3. Verifica que las vistas se hayan actualizado correctamente

```sql
-- Verificar vistas actualizadas
SELECT COUNT(*) FROM v_analisis_ubicaciones;
SELECT COUNT(*) FROM v_ubicaciones_tiempo_real;
```

### Paso 2: Reiniciar el Servidor

```powershell
# Detener el servidor actual (Ctrl+C)
# Reiniciar el servidor
node server.js
```

### Paso 3: Probar en el Navegador

1. Abre el mapa de ubicaciones: `http://localhost:8000/mapa-ubicaciones.html`
2. Verifica que en el filtro "Usuario" aparezcan:
   - ✅ Usuarios regulares
   - ✅ Supervisores (marcados con "(Supervisor)")
3. Selecciona un supervisor y verifica que sus ubicaciones aparezcan en el mapa

---

## 🔍 Verificación de Funcionamiento

### Verificar que los supervisores aparecen en el filtro:

1. Abre el mapa de ubicaciones
2. Haz clic en el dropdown "Usuario"
3. Deberías ver algo como:
   ```
   Todos los usuarios
   Cris
   JP
   Luiggy (Supervisor)
   Rafa
   Rosa
   Rubén
   ```

### Verificar que las ubicaciones de supervisores se muestran:

1. Inicia sesión como supervisor
2. Permite el acceso al GPS cuando se solicite
3. Abre otra pestaña y ve al mapa de ubicaciones
4. Deberías ver el marcador del supervisor en el mapa

---

## 📝 Notas Importantes

1. **Compatibilidad hacia atrás:** Los cambios son compatibles con el código existente
2. **Rendimiento:** Las vistas usan `UNION ALL` para mejor rendimiento
3. **Seguridad:** Se mantienen las políticas RLS existentes
4. **Distinción visual:** Los supervisores se marcan con "(Supervisor)" en el filtro

---

## 🐛 Solución de Problemas

### Problema: No aparecen supervisores en el filtro

**Solución:**
1. Verifica que el servidor se haya reiniciado
2. Limpia la caché del navegador (Ctrl+Shift+R)
3. Verifica en consola del navegador si hay errores

### Problema: No se ven ubicaciones de supervisores en el mapa

**Solución:**
1. Verifica que las vistas se hayan actualizado en Supabase:
   ```sql
   SELECT * FROM v_ubicaciones_tiempo_real WHERE tipo_usuario = 'supervisor';
   ```
2. Asegúrate de que el supervisor haya permitido el acceso al GPS
3. Verifica que la ubicación se esté guardando:
   ```sql
   SELECT * FROM ubicaciones_en_tiempo_real ORDER BY timestamp DESC LIMIT 10;
   ```

### Problema: Error "No se pudieron obtener supervisores"

**Solución:**
1. Verifica que la tabla `supervisores` existe en Supabase
2. Verifica que tiene los campos: `id`, `username`, `nombre`
3. Si no existe, el sistema seguirá funcionando solo con usuarios regulares

---

## ✅ Checklist de Implementación

- [ ] Ejecutar script SQL en Supabase
- [ ] Reiniciar servidor Node.js
- [ ] Verificar filtro de usuarios incluye supervisores
- [ ] Probar inicio de sesión como supervisor
- [ ] Verificar ubicación de supervisor en mapa
- [ ] Verificar que usuarios regulares siguen funcionando
- [ ] Limpiar caché del navegador
- [ ] Probar en diferentes dispositivos (móvil y PC)

---

## 📊 Estructura de Datos

### Tabla: `ubicaciones_en_tiempo_real`
```
- id (BIGSERIAL)
- usuario_id (BIGINT) → Puede ser ID de usuario o supervisor
- nombre (VARCHAR)
- latitud (DECIMAL)
- longitud (DECIMAL)
- precision_metros (INTEGER)
- device_type (VARCHAR)
- timestamp (TIMESTAMP)
- activo (BOOLEAN)
```

### Vista: `v_ubicaciones_tiempo_real`
```
- Todos los campos anteriores +
- tipo_usuario ('usuario' | 'supervisor')
- username
- duracion_minutos
- actividad_realizada
```

---

## 🎯 Resultado Esperado

Después de implementar estos cambios:

1. ✅ Los supervisores aparecen en el filtro de usuarios del mapa
2. ✅ Las ubicaciones de supervisores se muestran en el mapa con marcadores
3. ✅ Se puede filtrar por supervisor específico
4. ✅ Los supervisores se distinguen visualmente con la etiqueta "(Supervisor)"
5. ✅ El sistema sigue funcionando normalmente para usuarios regulares

---

**Fecha de actualización:** 2025-12-04
**Versión:** 1.0
