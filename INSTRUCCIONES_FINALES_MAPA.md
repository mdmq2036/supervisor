# 🎯 INSTRUCCIONES FINALES - Activar Mapa de Ubicaciones

## ✅ ESTADO ACTUAL

Has ejecutado exitosamente el script de verificación y confirmaste:
- ✅ Vista `v_analisis_ubicaciones` existe
- ✅ Tabla `auditoria_ubicaciones` existe
- ⚠️ **0 ubicaciones** en la base de datos (por eso el mapa está vacío)

---

## 📍 PASO SIGUIENTE: Insertar Datos de Prueba

### 1. Abrir Supabase SQL Editor

```
https://supabase.com/dashboard/project/bvqmaaxtaetebjsgdphj/editor
```

### 2. Crear Nueva Query

Click en **"+ New query"**

### 3. Copiar y Pegar el Script

Abrir el archivo: **[DATOS_PRUEBA_UBICACIONES.sql](DATOS_PRUEBA_UBICACIONES.sql)**

Copiar **TODO el contenido** del archivo (líneas 1-186)

Pegarlo en Supabase SQL Editor

### 4. Ejecutar

Click en **"Run"** o presionar **Ctrl + Enter**

### 5. Verificar Resultado

Deberías ver al final:

```
✅ 5 ubicaciones de prueba insertadas correctamente
📍 Ubicaciones distribuidas en: San Isidro, Miraflores, Surco, La Molina, Ate
🗺️ Ahora puedes ver el mapa con datos reales
```

Y una tabla mostrando las 5 ubicaciones insertadas.

---

## 🗺️ VERIFICAR EN EL MAPA

### 1. Abrir la Aplicación

```
https://donet-supervision-system.onrender.com/mapa-ubicaciones.html
```

### 2. Configurar Filtros

- **Usuario:** Seleccionar "prueba" (o dejar en "Todos los usuarios")
- **Fecha Inicio:** Hoy (fecha actual)
- **Fecha Fin:** Hoy (fecha actual)
- **Tipo Dispositivo:** "Móvil" (o "Todos")

### 3. Click en "Buscar"

### 4. Resultado Esperado

Deberías ver:

✅ **Estadísticas:**
- **5 ubicaciones** (ícono de pin rojo)
- **Tiempo Promedio:** ~21 min (ícono de cronómetro)
- **1 Dispositivo Único** (ícono de móvil)
- **Distancia Total:** calculada automáticamente

✅ **Mapa:**
- 5 marcadores azules en Lima, Perú
- Distribuidos en: San Isidro, Miraflores, Surco, La Molina, Ate
- Al hacer click en cada marcador verás:
  - Dirección aproximada
  - Fecha y hora de entrada
  - Duración de permanencia
  - Actividad realizada
  - Cuenta/Contrato

✅ **Historial de Ubicaciones:**
- Lista con las 5 ubicaciones
- Detalles de cada una
- Clasificación de duración (Corta, Media, Larga)

---

## 📊 UBICACIONES DE PRUEBA INSERTADAS

| # | Distrito | Coordenadas | Actividad | Duración |
|---|----------|-------------|-----------|----------|
| 1 | San Isidro | -12.0897, -77.0282 | Inspección de medidor | 15 min |
| 2 | Miraflores | -12.1191, -77.0317 | Verificación instalación | 20 min |
| 3 | Surco | -12.1428, -77.0075 | Lectura de medidor | 25 min |
| 4 | La Molina | -12.0823, -76.9413 | Inspección técnica | 25 min |
| 5 | Ate | -12.0525, -76.9382 | Revisión instalación | En curso |

---

## 🚀 PRÓXIMOS PASOS

Una vez que veas las ubicaciones en el mapa:

### Opción A: Usar Datos Reales de GPS

1. **Iniciar sesión en la aplicación:**
   ```
   https://donet-supervision-system.onrender.com
   Usuario: prueba
   Contraseña: prueba2025
   ```

2. **Permitir GPS cuando aparezca el popup**

3. **Esperar 1-2 minutos**

4. **Ir al mapa nuevamente** y verás tu ubicación real agregada

### Opción B: Mantener Solo Datos de Prueba

Si prefieres mantener solo los datos de prueba y no usar GPS real:

1. Asegúrate de **NO permitir** el GPS cuando inicies sesión
2. O desactiva el rastreo GPS en la configuración del navegador

---

## 🔧 SI EL MAPA AÚN ESTÁ VACÍO

### Verificar en Supabase

Ejecuta esta consulta en Supabase SQL Editor:

```sql
SELECT COUNT(*) FROM auditoria_ubicaciones;
```

**Resultado esperado:** `5` (o el número de ubicaciones que insertaste)

**Si retorna 0:**
- El script de inserción no se ejecutó correctamente
- Verifica que no haya errores en rojo en Supabase
- Intenta ejecutar el script nuevamente

### Verificar la API

Abre esta URL en tu navegador:

```
https://donet-supervision-system.onrender.com/api/ubicaciones
```

**Resultado esperado:** JSON con array de 5 ubicaciones

**Si retorna "Not Found" o error:**
- El servidor de Render no está funcionando
- Verifica el estado en: https://dashboard.render.com/web/srv-d4lsclu3jp1c739ibb2g
- Espera a que diga "Live" (puede tardar 2-3 min después de un push)

### Verificar Consola del Navegador

1. Abrir el mapa: https://donet-supervision-system.onrender.com/mapa-ubicaciones.html
2. Presionar **F12** → Tab **"Console"**
3. Click en "Buscar"

**Buscar en consola:**
- ✅ `✅ 5 ubicaciones cargadas`
- ❌ Errores en rojo (copiar y reportar)

---

## ✅ CHECKLIST FINAL

Antes de reportar un problema, verifica:

- [ ] Script VERIFICAR_Y_CORREGIR_MAPA.sql ejecutado → `total_en_vista = 0` confirmado
- [ ] Script DATOS_PRUEBA_UBICACIONES.sql ejecutado → `5 ubicaciones insertadas`
- [ ] Consulta `SELECT COUNT(*) FROM auditoria_ubicaciones` retorna 5
- [ ] Vista `SELECT * FROM v_analisis_ubicaciones` muestra 5 filas
- [ ] API `/api/ubicaciones` retorna JSON con 5 ubicaciones
- [ ] Render dashboard muestra servicio "Live" (no "Building" o "Failed")
- [ ] Mapa carga sin errores en consola (F12)
- [ ] Filtros configurados correctamente (fecha de hoy, usuario "prueba")

---

## 📝 RESUMEN

1. ✅ **Vista creada** - VERIFICAR_Y_CORREGIR_MAPA.sql ejecutado
2. ⏳ **Insertar datos** - DATOS_PRUEBA_UBICACIONES.sql por ejecutar
3. ⏳ **Verificar mapa** - Abrir URL y buscar ubicaciones
4. ⏳ **Confirmar resultados** - 5 marcadores visibles

---

**Una vez que ejecutes el script de datos de prueba, el mapa debería mostrar las 5 ubicaciones inmediatamente.**

No necesitas actualizar GitHub ni Render - los datos se insertan directamente en Supabase y la aplicación los leerá automáticamente.
