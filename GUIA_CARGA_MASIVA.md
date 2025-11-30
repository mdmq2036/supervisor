# Guía de Carga Masiva - Sistema DONET

## Tabla de Contenidos
1. [Introducción](#introducción)
2. [Configuración de la Base de Datos](#configuración-de-la-base-de-datos)
3. [Preparar el Archivo Excel](#preparar-el-archivo-excel)
4. [Realizar Carga Masiva](#realizar-carga-masiva)
5. [Manejo de Errores](#manejo-de-errores)
6. [Consultas Útiles](#consultas-útiles)

---

## Introducción

El módulo de **Carga Masiva** permite importar todos los registros del Excel de inspecciones a PostgreSQL de forma automática y rápida. Este proceso debe realizarse **diariamente** con los nuevos datos.

### Características

✅ Carga automática de todos los campos del Excel
✅ Detección de duplicados (misma cuenta contrato + fecha)
✅ Validación de datos en tiempo real
✅ Reporte de errores descargable
✅ Historial de cargas
✅ Estadísticas en tiempo real

---

## Configuración de la Base de Datos

### Paso 1: Ejecutar el Script SQL en Supabase

1. Abre tu proyecto en [Supabase](https://supabase.com)
2. Ve a **SQL Editor** en el menú lateral
3. Haz clic en **New query**
4. Abre el archivo `SCRIPT_POSTGRESQL.sql`
5. Copia **TODO** el contenido del script
6. Pega en el editor de Supabase
7. Haz clic en **Run** (▶️)

Deberías ver el mensaje: "Script ejecutado correctamente"

### Paso 2: Verificar las Tablas Creadas

Ejecuta esta consulta para verificar:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

Deberías ver estas tablas:
- ✅ `supervisores`
- ✅ `inspecciones`
- ✅ `historial_cargas`
- ✅ `registros_duplicados`

### Paso 3: Verificar Datos de Prueba

```sql
SELECT * FROM supervisores;
```

Deberías ver al menos 1 usuario: `admin`

---

## Preparar el Archivo Excel

### Estructura Requerida

El archivo Excel debe tener **EXACTAMENTE** estas columnas (en cualquier orden):

| Columna Excel | Tipo | Requerido |
|--------------|------|-----------|
| Instalación | Texto | No |
| **Cuenta contrato** | Texto | **SÍ (CLAVE)** |
| CLIENTE - DNI | Texto | No |
| Dirección de instalación - Distrito | Texto | No |
| DISTRITO | Texto | No |
| Teléfono local | Texto | No |
| TURNO | Texto | No |
| Puntos Corresponden Instalar | Número | No |
| HS | Texto | No |
| MEDIDOR | Texto | No |
| ORDEN DE ATENCIÓN | Texto | No |
| MONTANTE ENCUENTRO ACTIVO / PASIVO | Texto | No |
| ENCUENTRO RAMAL ECTOGAS | Texto | No |
| OBSERVACIONES | Texto | No |
| OBJETO EXACTO | Texto | No |
| NOMBRE Y DNI DEL INSPECTOR | Texto | No |
| UBICACIÓN | Texto | No |
| FISE UNICA | Texto | No |
| EMPRESA INSTALADORA | Texto | No |
| NUMERO DE MEDIDOR | Texto | No |
| NUMERO DE CONTADOR | Texto | No |
| HORARIO, COMENTARIO, RUSF DEL INSPECTO | Texto | No |
| CELULAR 1 | Texto | No |
| CELULAR 2 | Texto | No |
| CELULAR 3 | Texto | No |
| CELULAR 4 | Texto | No |
| APELLIDOS DEL INSPECTO | Texto | No |
| OBSERVACIONES  | Texto | No |
| NUMERO Y/O PISO | Texto | No |

### Validaciones Importantes

⚠️ **CAMPO CLAVE: Cuenta contrato**
- **NO PUEDE ESTAR VACÍO**
- Debe ser único por día (el sistema detecta duplicados)

⚠️ **UBICACIÓN**
- Debe estar en formato: `latitud,longitud`
- Ejemplo: `-12.0464,-77.0428`
- El sistema extrae automáticamente lat/long

⚠️ **PUNTOS**
- Si existe, debe ser un número entero
- Ejemplo: `2`, `3`, `5`

### Ejemplo de Registro Válido

```
Instalación: DONET
Cuenta contrato: 551089731
CLIENTE - DNI: VIOLETA CHAVEZ CONSUELO DE SALAZAR / DNI-25945458
Dirección: AV ALFREDO BENAVIDES 1150 Piso 1B Dpto. 1807 Urb. SAN ANTONIO NORTE
DISTRITO: MIRAFLORES
TURNO: TURNO 1
UBICACIÓN: -12.0464,-77.0428
EMPRESA INSTALADORA: DONISUGAS S.A.C
```

---

## Realizar Carga Masiva

### Paso a Paso

#### 1. Iniciar Sesión
- Abre el sistema DONET
- Ingresa con tu usuario y contraseña de supervisor
- Usuario de prueba: `admin` / `admin123`

#### 2. Acceder a Carga Masiva
- En el menú principal, haz clic en **"Carga Masiva"**
- Se abrirá la pantalla de importación

#### 3. Seleccionar Archivo
**Opción A: Arrastrar y soltar**
- Arrastra tu archivo Excel (.xlsx o .xls) al área indicada

**Opción B: Seleccionar manualmente**
- Haz clic en el área de carga
- Busca y selecciona tu archivo Excel

#### 4. Verificar Información
El sistema mostrará:
- ✅ Nombre del archivo
- ✅ Tamaño del archivo
- ✅ Número de filas detectadas

Ejemplo:
```
Nombre: MULTIFAMILIAR.xlsx
Tamaño: 2.5 MB
Filas detectadas: 150
```

#### 5. Procesar Datos
- Haz clic en el botón **"🚀 Procesar y Cargar Datos"**
- El sistema comenzará a procesar cada registro
- Verás una barra de progreso en tiempo real

#### 6. Monitorear el Proceso

Durante la carga verás:

**Estadísticas en tiempo real:**
```
Total de Registros: 150
Exitosos: 145
Duplicados: 3
Errores: 2
```

**Log de actividad:**
```
[10:30:15] 🚀 Iniciando proceso de carga masiva...
[10:30:16] ✓ Fila 1: 551089731
[10:30:17] ✓ Fila 2: 551036112
[10:30:18] ⚠ Fila 3: Duplicado - 551089731
[10:30:19] ✗ Fila 4: Cuenta contrato vacía
[10:30:20] ✓ Fila 5: 551105753
...
[10:32:45] ✓ Proceso completado en 150.23 segundos
```

#### 7. Revisar Resultados

Al finalizar:
- ✅ Verde: Registros cargados exitosamente
- ⚠️ Amarillo: Duplicados detectados (no se vuelven a cargar)
- ❌ Rojo: Errores (revisar reporte)

#### 8. Descargar Reporte de Errores (si hay)

Si hubo errores:
1. Haz clic en **"📥 Descargar Reporte de Errores"**
2. Se descargará un archivo CSV con:
   - Número de fila
   - Cuenta contrato
   - Descripción del error

Ejemplo del CSV:
```csv
Fila,Cuenta Contrato,Error
4,N/A,Cuenta contrato vacía
15,551089999,Formato de ubicación inválido
```

#### 9. Cargar Otro Archivo

- Haz clic en **"🔄 Limpiar y Cargar Otro Archivo"**
- Repite el proceso desde el paso 3

---

## Manejo de Errores

### Errores Comunes

#### 1. "Cuenta contrato vacía"

**Problema:** La celda de "Cuenta contrato" está vacía
**Solución:** Asegúrate de que TODAS las filas tengan un número de cuenta

```excel
❌ INCORRECTO:
Cuenta contrato: (vacío)

✅ CORRECTO:
Cuenta contrato: 551089731
```

#### 2. "Duplicado detectado"

**Problema:** Ya existe un registro con esa cuenta contrato en la misma fecha
**Solución:** Esto es normal. El sistema **no** vuelve a cargar duplicados

**¿Por qué?**
- Evita datos repetidos
- Si cargas el mismo archivo 2 veces el mismo día, solo se procesa 1 vez

**Nota:** Los duplicados se registran en la tabla `registros_duplicados` para auditoría

#### 3. "Error al leer el archivo"

**Problema:** El archivo Excel está corrupto o en formato incorrecto
**Solución:**
- Asegúrate de que sea .xlsx o .xls
- Abre el archivo en Excel y guárdalo nuevamente
- Verifica que no tenga contraseña

#### 4. "Error de conexión con Supabase"

**Problema:** No hay conexión con la base de datos
**Solución:**
- Verifica tu conexión a internet
- Revisa las credenciales en `config.js`
- Verifica que Supabase esté funcionando

---

## Consultas Útiles

### Ver Registros del Día

```sql
SELECT
    cuenta_contrato,
    distrito,
    nombre_dni_inspector,
    empresa_instaladora,
    fecha_carga
FROM inspecciones
WHERE fecha_carga = CURRENT_DATE
ORDER BY cuenta_contrato;
```

### Contar Registros por Fecha

```sql
SELECT
    fecha_carga,
    COUNT(*) as total_registros,
    COUNT(DISTINCT distrito) as total_distritos,
    COUNT(DISTINCT empresa_instaladora) as total_empresas
FROM inspecciones
GROUP BY fecha_carga
ORDER BY fecha_carga DESC;
```

### Ver Últimas Cargas Realizadas

```sql
SELECT
    h.*,
    s.nombre as supervisor_nombre
FROM historial_cargas h
LEFT JOIN supervisores s ON h.supervisor_id = s.id
ORDER BY h.fecha_carga DESC
LIMIT 10;
```

### Ver Duplicados Detectados Hoy

```sql
SELECT *
FROM registros_duplicados
WHERE DATE(fecha_deteccion) = CURRENT_DATE
ORDER BY fecha_deteccion DESC;
```

### Ver Registros por Inspector

```sql
SELECT
    nombre_dni_inspector,
    COUNT(*) as total_inspecciones,
    MIN(fecha_carga) as primera_inspeccion,
    MAX(fecha_carga) as ultima_inspeccion
FROM inspecciones
GROUP BY nombre_dni_inspector
ORDER BY total_inspecciones DESC;
```

### Ver Registros por Distrito

```sql
SELECT
    distrito,
    COUNT(*) as total,
    COUNT(DISTINCT fecha_carga) as dias_activos
FROM inspecciones
GROUP BY distrito
ORDER BY total DESC;
```

### Ver Registros con Coordenadas

```sql
SELECT
    cuenta_contrato,
    distrito,
    ubicacion,
    latitud,
    longitud
FROM inspecciones
WHERE latitud IS NOT NULL
  AND longitud IS NOT NULL
ORDER BY fecha_carga DESC
LIMIT 100;
```

### Estadísticas Generales

```sql
SELECT
    COUNT(*) as total_registros,
    COUNT(DISTINCT cuenta_contrato) as cuentas_unicas,
    COUNT(DISTINCT distrito) as distritos,
    COUNT(DISTINCT empresa_instaladora) as empresas,
    COUNT(DISTINCT nombre_dni_inspector) as inspectores,
    MIN(fecha_carga) as primera_carga,
    MAX(fecha_carga) as ultima_carga
FROM inspecciones;
```

### Eliminar Registros de un Día Específico (⚠️ CUIDADO)

```sql
-- SOLO usar si necesitas borrar datos de un día específico
DELETE FROM inspecciones
WHERE fecha_carga = '2025-01-28';

-- Verificar antes de borrar:
SELECT COUNT(*) FROM inspecciones
WHERE fecha_carga = '2025-01-28';
```

---

## Proceso Diario Recomendado

### Rutina Diaria de Carga

1. **Recibir el Excel del día**
   - Verifica que tenga la estructura correcta
   - Revisa que no haya cuentas vacías

2. **Iniciar sesión en DONET**
   - Usuario: tu usuario de supervisor
   - Contraseña: tu contraseña

3. **Cargar el archivo**
   - Menú Principal → Carga Masiva
   - Arrastrar archivo Excel
   - Procesar y Cargar Datos

4. **Verificar resultados**
   - Revisar estadísticas
   - Si hay errores, descargar reporte
   - Corregir errores en Excel y volver a cargar

5. **Consultar datos cargados**
   - Menú Principal → Consultar Registros
   - Filtrar por fecha de hoy
   - Verificar que todo esté correcto

6. **Completar inspecciones**
   - Para agregar fotos: Menú Principal → Registrar Inspección
   - Buscar por cuenta contrato
   - Agregar las 5 fotos

---

## Preguntas Frecuentes

### ¿Puedo cargar el mismo archivo varias veces?

Sí, pero los registros duplicados (misma cuenta + fecha) serán ignorados. Solo se cargarán los nuevos.

### ¿Qué pasa si tengo un error en una fila?

Esa fila específica no se carga, pero las demás sí. Descarga el reporte de errores, corrige y vuelve a cargar.

### ¿Puedo cargar archivos de días anteriores?

Sí, la fecha de carga será el día que ejecutes la importación, no la fecha del archivo.

### ¿Cuántos registros puedo cargar a la vez?

El sistema está optimizado para cargar miles de registros. Se han probado cargas de hasta 10,000 registros sin problemas.

### ¿Las fotos se cargan desde el Excel?

No, las fotos se agregan después usando el módulo "Registrar Inspección". El Excel solo carga los datos básicos.

### ¿Puedo ver quién cargó qué datos?

Sí, cada registro guarda el ID del supervisor que lo cargó. Usa la vista `v_inspecciones_completas`.

### ¿Cómo hago backup de los datos?

En Supabase, ve a Database → Backups. Puedes crear backups manuales o configurar backups automáticos diarios.

---

## Soporte Técnico

Si encuentras problemas:

1. **Revisa el log de actividad** en la pantalla de carga masiva
2. **Descarga el reporte de errores** si está disponible
3. **Consulta esta guía** para errores comunes
4. **Revisa la consola del navegador** (F12) para errores técnicos
5. **Contacta al administrador del sistema** si el problema persiste

---

## Changelog

### Versión 1.0 (2025-01-28)
- ✅ Carga masiva inicial
- ✅ Detección de duplicados
- ✅ Reporte de errores
- ✅ Historial de cargas
- ✅ Estadísticas en tiempo real

---

**© 2025 DONET - Sistema de Gestión de Inspecciones**
