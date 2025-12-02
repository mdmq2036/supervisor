# ✅ SCRIPT CORREGIDO - LISTO PARA EJECUTAR

## 🎯 PROBLEMA SOLUCIONADO

El error que recibiste:
```
Error: Failed to run sql query: ERROR: 42P16: cannot change name of view column "username" to "usuario_id"
```

**Causa**: La vista `v_analisis_ubicaciones` ya existía con una estructura diferente.

**Solución**: Agregué `DROP VIEW IF EXISTS` antes de crear la vista.

---

## ✅ ARCHIVO CORRECTO PARA EJECUTAR

**Usa este archivo**: `SOLUCION_MAPA_UBICACIONES_COMPLETA_CORREGIDA.sql`

O también puedes usar: `SOLUCION_MAPA_UBICACIONES_COMPLETA.sql` (ya está actualizado)

---

## 📋 INSTRUCCIONES PARA EJECUTAR EN SUPABASE

### PASO 1: Abrir Supabase

1. Ir a: https://supabase.com/dashboard/project/bvqmaaxtaetebjsgdphj
2. Click en **"SQL Editor"** (menú lateral izquierdo)
3. Click en **"New query"**

### PASO 2: Copiar el Script

1. Abrir el archivo: **`SOLUCION_MAPA_UBICACIONES_COMPLETA_CORREGIDA.sql`**
2. Seleccionar TODO el contenido (Ctrl + A)
3. Copiar (Ctrl + C)

### PASO 3: Ejecutar en Supabase

1. Pegar el script en el SQL Editor de Supabase (Ctrl + V)
2. Click en el botón verde **"RUN"** ▶️
3. Esperar a que termine (puede tomar 5-10 segundos)

### PASO 4: Verificar el Resultado

Deberías ver al final de los resultados:

```
========================================
✅ CONFIGURACIÓN COMPLETADA
🗺️ El mapa ya debería mostrar las ubicaciones
========================================
```

Y también deberías ver una tabla con las últimas 5 ubicaciones:

| id | usuario | dispositivo | lat | lon | entrada | duracion_min | actividad |
|----|---------|-------------|-----|-----|---------|--------------|-----------|
| ... | Usuario de Prueba | mobile | -12.046374 | -77.042793 | ... | 15 | Inspección de campo |

---

## 🔍 VERIFICACIÓN ADICIONAL

Después de ejecutar el script, verifica que todo funciona ejecutando esta consulta:

```sql
-- Verificar que la vista existe y tiene datos
SELECT 
    COUNT(*) as total_ubicaciones,
    COUNT(DISTINCT usuario_id) as usuarios_unicos,
    MIN(timestamp_entrada) as primera_ubicacion,
    MAX(timestamp_entrada) as ultima_ubicacion
FROM v_analisis_ubicaciones;
```

**Resultado esperado**:
- `total_ubicaciones`: >= 5
- `usuarios_unicos`: >= 1
- `primera_ubicacion` y `ultima_ubicacion`: fechas recientes

---

## 🗺️ PROBAR EL MAPA

Una vez ejecutado el script en Supabase:

1. **Ir a la aplicación**:
   ```
   https://supervisor-swkg.onrender.com
   ```

2. **Login**:
   - Usuario: `prueba`
   - Contraseña: `prueba2025`

3. **Abrir el Mapa**:
   - Click en "Mapa de Ubicaciones" desde el menú

4. **Verificar**:
   - ✅ Deberías ver 5 marcadores en el mapa (Lima)
   - ✅ Estadísticas con números > 0
   - ✅ Lista de ubicaciones en la parte inferior
   - ✅ Líneas conectando los puntos

---

## 🐛 SI AÚN HAY PROBLEMAS

### Problema: "No se encontraron ubicaciones"

**Solución 1**: Limpiar filtros
1. En el mapa, click en "Limpiar"
2. Click en "Buscar"

**Solución 2**: Verificar datos en Supabase
```sql
SELECT * FROM auditoria_ubicaciones ORDER BY timestamp_entrada DESC;
```

Si no hay datos, ejecuta manualmente:
```sql
INSERT INTO auditoria_ubicaciones (usuario_id, device_fingerprint, device_type, latitud, longitud, precision_metros, actividad_realizada, timestamp_entrada, timestamp_salida, duracion_minutos)
SELECT 
    (SELECT id FROM usuarios WHERE username = 'prueba' LIMIT 1),
    'test-manual',
    'mobile',
    -12.046374,
    -77.042793,
    15.5,
    'Prueba manual',
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '45 minutes',
    15;
```

### Problema: Error al ejecutar el script

**Solución**: Ejecuta los comandos uno por uno:

1. Primero elimina la vista:
```sql
DROP VIEW IF EXISTS v_analisis_ubicaciones CASCADE;
```

2. Luego crea la vista nueva:
```sql
CREATE VIEW v_analisis_ubicaciones AS
SELECT 
    au.id,
    au.usuario_id,
    u.username,
    u.nombre,
    au.device_fingerprint,
    au.device_type,
    au.latitud,
    au.longitud,
    au.precision_metros,
    au.timestamp_entrada,
    au.timestamp_salida,
    au.duracion_minutos,
    au.actividad_realizada,
    au.cuenta_contrato,
    au.ip_address,
    CASE 
        WHEN au.duracion_minutos IS NULL THEN 'En curso'
        WHEN au.duracion_minutos < 5 THEN 'Muy corta'
        WHEN au.duracion_minutos < 15 THEN 'Corta'
        WHEN au.duracion_minutos < 30 THEN 'Media'
        WHEN au.duracion_minutos < 60 THEN 'Larga'
        ELSE 'Muy larga'
    END as clasificacion_duracion
FROM auditoria_ubicaciones au
JOIN usuarios u ON au.usuario_id = u.id
ORDER BY au.timestamp_entrada DESC;
```

---

## 📊 CAMBIOS REALIZADOS

### En el Script SQL:
- ✅ Agregado `DROP VIEW IF EXISTS v_analisis_ubicaciones CASCADE;`
- ✅ Cambiado `CREATE OR REPLACE VIEW` por `CREATE VIEW`
- ✅ Esto evita el error de cambio de nombre de columnas

### En GitHub:
- ✅ Actualizado `SOLUCION_MAPA_UBICACIONES_COMPLETA.sql`
- ✅ Creado `SOLUCION_MAPA_UBICACIONES_COMPLETA_CORREGIDA.sql`
- ✅ Push exitoso a GitHub

### En Render:
- ⏳ El deploy se activará automáticamente
- ⏳ Esperar 2-3 minutos para que termine

---

## 🎯 RESUMEN EN 3 PASOS

1. ✅ **Ejecutar** `SOLUCION_MAPA_UBICACIONES_COMPLETA_CORREGIDA.sql` en Supabase
2. ⏳ **Esperar** a que Render termine el deploy (automático)
3. 🗺️ **Probar** el mapa en https://supervisor-swkg.onrender.com

---

## 📞 SOPORTE

Si después de ejecutar el script correctamente el mapa aún no funciona:

1. Verifica en Supabase que hay datos:
   ```sql
   SELECT COUNT(*) FROM auditoria_ubicaciones;
   ```

2. Verifica la API:
   ```
   https://supervisor-swkg.onrender.com/api/ubicaciones/todas
   ```

3. Revisa la consola del navegador (F12) para ver errores

---

**Última actualización**: 2025-12-02 05:55 AM
**Status**: ✅ Script corregido y listo para ejecutar
**GitHub**: ✅ Actualizado
**Render**: ⏳ Desplegando automáticamente
