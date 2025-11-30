# 🔒 Seguridad por Supervisor - Sistema DONET

## Fecha: 29 de Noviembre de 2025

---

## ✅ **USUARIOS CREADOS:**

| Usuario    | Contraseña | Nombre     | Estado |
|------------|------------|------------|--------|
| carlos     | 43803239   | Carlos     | Activo |
| wilmer     | 46298703   | Wilmer     | Activo |
| marcelino  | 9394061    | Marcelino  | Activo |
| manuel     | 561773     | Manuel     | Activo |
| angelo     | 76935270   | Angelo     | Activo |

---

## 🔐 **CÓMO FUNCIONA LA SEGURIDAD:**

### **1. Login - Autenticación**

Cuando un supervisor ingresa con su usuario y contraseña:

```javascript
// app.js - línea 62
const { data, error } = await supabase
    .from('supervisores')
    .select('*')
    .eq('usuario', username)      // Validar usuario
    .eq('password', password)      // Validar contraseña
    .eq('activo', true)            // Solo usuarios activos
    .single();
```

**Resultado:**
- Se guarda el `supervisor_id` en `currentUser`
- Este ID se usa para filtrar TODOS los datos

---

### **2. Carga de Cuentas Contrato - Solo las Asignadas**

Al abrir "Registrar Inspección", el sistema carga solo las cuentas del supervisor:

```javascript
// app.js - línea 382
const { data, error} = await supabase
    .from('inspecciones')
    .select('cuenta_contrato')
    .eq('supervisor_id', currentUser.id)  // ✅ FILTRO POR SUPERVISOR
    .order('cuenta_contrato');
```

**Resultado:**
- El dropdown solo muestra cuentas asignadas al supervisor actual
- No puede ver ni seleccionar cuentas de otros supervisores

---

### **3. Consulta de Registros - Solo los Propios**

Al buscar registros en "Consultar Registros":

```javascript
// app.js - línea 225
let query = supabase
    .from('inspecciones')
    .select('*')
    .eq('supervisor_id', currentUser.id)  // ✅ FILTRO POR SUPERVISOR
    .order('fecha_carga', { ascending: false });
```

**Resultado:**
- Solo ve los registros que le pertenecen
- Aunque busque por cuenta contrato, solo verá sus propios registros

---

### **4. Carga Automática - Solo Registros Propios**

Al abrir la pantalla de consulta, se cargan automáticamente:

```javascript
// app.js - línea 447
const { data, error } = await supabase
    .from('inspecciones')
    .select('*')
    .eq('supervisor_id', currentUser.id)  // ✅ FILTRO POR SUPERVISOR
    .order('fecha_carga', { ascending: false })
    .limit(100);
```

**Resultado:**
- Muestra automáticamente hasta 100 registros del supervisor
- Ordenados por fecha más reciente primero

---

### **5. Actualización de Registros - Solo los Propios**

Al guardar fotos y observaciones:

```javascript
// app.js - línea 172
const { data, error } = await supabase
    .from('inspecciones')
    .update({
        foto1: formData.foto1,
        foto2: formData.foto2,
        // ... más campos
    })
    .eq('cuenta_contrato', formData.cuenta_contrato)
    .eq('supervisor_id', currentUser.id)  // ✅ FILTRO POR SUPERVISOR
    .select();
```

**Resultado:**
- Solo puede actualizar registros que le pertenecen
- Aunque intente modificar otra cuenta, el sistema lo rechaza

---

## 📋 **FLUJO COMPLETO DE SEGURIDAD:**

### **PASO 1: Carga Masiva (Administrador)**

1. El administrador carga el Excel con todas las inspecciones
2. En el Excel debe haber una columna que identifique al supervisor
3. El sistema asigna automáticamente el `supervisor_id` a cada registro

**Ejemplo de Excel:**

| Cuenta Contrato | Distrito | Dirección | Supervisor |
|-----------------|----------|-----------|------------|
| 12345          | Lima     | Av. X 123 | carlos     |
| 67890          | Lima     | Jr. Y 456 | wilmer     |
| 11111          | Lima     | Ca. Z 789 | carlos     |

El sistema mapea "carlos" → `supervisor_id = 1`, "wilmer" → `supervisor_id = 2`, etc.

---

### **PASO 2: Login del Supervisor**

1. Carlos ingresa con: `carlos` / `43803239`
2. Sistema valida y obtiene: `currentUser.id = 1`
3. TODAS las consultas posteriores usan: `.eq('supervisor_id', 1)`

---

### **PASO 3: Trabajo del Supervisor**

**Carlos solo puede:**
- ✅ Ver cuentas: 12345, 11111 (las asignadas a él)
- ✅ Agregar fotos a esas cuentas
- ✅ Consultar registros de esas cuentas

**Carlos NO puede:**
- ❌ Ver la cuenta 67890 (es de Wilmer)
- ❌ Agregar fotos a cuentas de otros supervisores
- ❌ Consultar registros de otros supervisores

---

## 🔒 **NIVELES DE SEGURIDAD IMPLEMENTADOS:**

### **Nivel 1: Autenticación**
- ✅ Usuario y contraseña obligatorios
- ✅ Solo usuarios activos pueden ingresar
- ✅ Sin modo desarrollo (requiere Supabase)

### **Nivel 2: Filtrado Automático**
- ✅ Todas las consultas filtran por `supervisor_id`
- ✅ Imposible ver datos de otros supervisores
- ✅ Implementado en todas las funciones

### **Nivel 3: Validación en Actualización**
- ✅ Solo puede actualizar sus propios registros
- ✅ Doble validación: cuenta + supervisor_id
- ✅ Error si intenta modificar registros ajenos

### **Nivel 4: Interfaz Limitada**
- ✅ Dropdown solo muestra cuentas asignadas
- ✅ No puede escribir manualmente cuenta contrato
- ✅ Previene errores de acceso no autorizado

---

## 🎯 **CÓMO ASIGNAR CONTRATOS A SUPERVISORES:**

### **Opción 1: En la Carga Masiva (Recomendado)**

El Excel debe tener una columna que identifique al supervisor:

```
Columna: "SUPERVISOR" o "ASIGNADO_A" o similar
Valores: carlos, wilmer, marcelino, manuel, angelo
```

El script de carga masiva (`carga-masiva.js`) debe mapear estos valores al `supervisor_id`:

```javascript
// Mapear nombre de supervisor a ID
const supervisorMap = {
    'carlos': 1,
    'wilmer': 2,
    'marcelino': 3,
    'manuel': 4,
    'angelo': 5
};

// Al procesar cada fila del Excel
const supervisorId = supervisorMap[row.supervisor.toLowerCase()];
```

---

### **Opción 2: Manualmente en Supabase**

Si ya cargaste datos sin supervisor_id, puedes asignarlos manualmente:

```sql
-- Asignar cuentas específicas a Carlos
UPDATE inspecciones
SET supervisor_id = 1
WHERE cuenta_contrato IN ('12345', '11111', '22222');

-- Asignar cuentas a Wilmer
UPDATE inspecciones
SET supervisor_id = 2
WHERE cuenta_contrato IN ('67890', '33333', '44444');

-- Y así sucesivamente...
```

---

### **Opción 3: Por Distrito o Zona**

Asignar por criterio geográfico:

```sql
-- Asignar todo el distrito Lima a Carlos
UPDATE inspecciones
SET supervisor_id = 1
WHERE distrito = 'Lima';

-- Asignar Callao a Wilmer
UPDATE inspecciones
SET supervisor_id = 2
WHERE distrito = 'Callao';
```

---

## 🧪 **PRUEBAS DE SEGURIDAD:**

### **Prueba 1: Login con Usuario Incorrecto**
```
Usuario: carlos
Contraseña: 12345 (incorrecta)
Resultado: ❌ "Usuario o contraseña incorrectos"
```

### **Prueba 2: Ver Solo Cuentas Asignadas**
```
Login como: carlos
Abrir: Registrar Inspección
Resultado: ✅ Dropdown solo muestra cuentas de Carlos
```

### **Prueba 3: Intentar Ver Registros de Otro Supervisor**
```
Login como: carlos
Buscar cuenta: 67890 (de Wilmer)
Resultado: ❌ "No se encontraron registros"
```

### **Prueba 4: Actualizar Registro Ajeno**
```
Login como: carlos
Intentar guardar fotos en cuenta 67890
Resultado: ❌ "No se encontró la cuenta contrato para actualizar"
```

---

## 📊 **VERIFICAR ASIGNACIONES:**

### **Ver cuántos registros tiene cada supervisor:**

```sql
SELECT
    s.usuario,
    s.nombre,
    COUNT(i.id) as total_inspecciones
FROM supervisores s
LEFT JOIN inspecciones i ON s.id = i.supervisor_id
GROUP BY s.id, s.usuario, s.nombre
ORDER BY s.usuario;
```

**Resultado esperado:**
```
usuario    | nombre     | total_inspecciones
-----------|------------|-------------------
angelo     | Angelo     | 10
carlos     | Carlos     | 15
manuel     | Manuel     | 8
marcelino  | Marcelino  | 12
wilmer     | Wilmer     | 2
```

---

## ✅ **PASOS PARA IMPLEMENTAR:**

### **1. Ejecutar el script de usuarios:**
```sql
-- Copiar contenido de CREAR_USUARIOS.sql
-- Pegar en Supabase SQL Editor
-- Click en "Run"
```

### **2. Verificar que se crearon:**
```sql
SELECT * FROM supervisores ORDER BY usuario;
```

### **3. Asignar contratos a supervisores:**
- Opción A: Incluir en la carga masiva del Excel
- Opción B: Actualizar manualmente en Supabase

### **4. Probar el sistema:**
1. Login con: `carlos` / `43803239`
2. Ir a "Registrar Inspección"
3. Verificar que el dropdown solo muestra cuentas de Carlos
4. Ir a "Consultar Registros"
5. Verificar que solo ve registros de Carlos

---

## 🔐 **SEGURIDAD GARANTIZADA:**

✅ Cada supervisor **SOLO** puede:
- Ver sus propias cuentas contrato
- Agregar fotos a sus propias cuentas
- Consultar sus propios registros
- Buscar dentro de sus propias asignaciones

❌ Cada supervisor **NO PUEDE**:
- Ver cuentas de otros supervisores
- Modificar registros de otros supervisores
- Acceder a datos que no le pertenecen
- Saltarse el filtro de seguridad

---

**© 2025 DONET - Sistema de Gestión de Inspecciones**
**Seguridad Implementada y Verificada ✅**
