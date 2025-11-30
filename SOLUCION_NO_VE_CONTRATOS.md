# ❌ PROBLEMA: No se ven contratos asignados

## Fecha: 29 de Noviembre de 2025

---

## 🔍 **PROBLEMA IDENTIFICADO:**

En las capturas de pantalla se observa:
1. Dropdown "Cuenta Contrato" → Vacío (solo dice "Seleccione una cuenta contrato")
2. "Consultar Registros" → "No se encontraron registros"

**CAUSA:** No hay datos en la tabla `inspecciones` asignados al supervisor actual.

---

## ✅ **SOLUCIÓN PASO A PASO:**

### **PASO 1: Verificar Estado de la Base de Datos**

1. Abre: http://localhost:8000/verificar-datos.html

2. Click en **"Contar Inspecciones"**

3. Observa el resultado:
   - Si dice: `Total de inspecciones: 0` → No hay datos cargados
   - Si dice: `Total de inspecciones: 47` → Los datos existen pero no están asignados

4. Mira la sección "Por supervisor":
   ```json
   {
     "1": 47  // Todos asignados al supervisor ID 1 (demo)
   }
   ```
   o
   ```json
   {}  // Ningún supervisor asignado
   ```

---

### **PASO 2A: Si NO hay datos (Total: 0)**

**Necesitas cargar el Excel primero:**

1. Login con cualquier usuario (ej: `demo` / `demo123`)
2. Ir a **Carga Masiva**
3. Subir el archivo Excel (MULTIFAMILIAR.xlsx)
4. Click en **"Procesar y Cargar Datos"**
5. Esperar resultado: "Total: 47 | Exitosos: 47"

**Resultado:**
- Los 47 registros se asignan automáticamente al usuario que hizo la carga
- Si cargaste con `demo`, todos tienen `supervisor_id = 1`

---

### **PASO 2B: Si hay datos pero no asignados correctamente**

**Los datos existen pero están asignados a otro supervisor.**

Ejemplo: Si cargaste con `demo` (ID=1) pero ahora estás logueado con `carlos` (ID=3), Carlos no verá nada.

**Solución: Reasignar contratos**

#### **Opción 1: Usar Supabase SQL Editor**

1. Ir a: https://supabase.com
2. Login y seleccionar proyecto
3. Click en **SQL Editor**
4. Ejecutar:

```sql
-- Ver IDs de supervisores
SELECT id, usuario, nombre FROM supervisores ORDER BY id;

-- Ver asignaciones actuales
SELECT
    s.usuario,
    COUNT(i.id) as contratos
FROM supervisores s
LEFT JOIN inspecciones i ON s.id = i.supervisor_id
GROUP BY s.usuario
ORDER BY s.usuario;
```

5. **Asignar TODOS los contratos a Carlos:**

```sql
-- Cambiar el ID según corresponda (ver resultado del primer query)
UPDATE inspecciones SET supervisor_id = 3;  -- 3 es el ID de Carlos
```

6. **O asignar por distrito:**

```sql
-- Ver qué distritos hay
SELECT DISTINCT distrito FROM inspecciones ORDER BY distrito;

-- Asignar por distrito
UPDATE inspecciones
SET supervisor_id = 3  -- Carlos
WHERE UPPER(distrito) LIKE '%LIMA%';

UPDATE inspecciones
SET supervisor_id = 4  -- Wilmer
WHERE UPPER(distrito) LIKE '%CALLAO%';

-- Etc...
```

---

#### **Opción 2: Asignación Automática por Carga Masiva**

**RECOMENDADO: Cada supervisor carga su propio Excel**

1. **Preparar Excels separados:**
   - `CONTRATOS_CARLOS.xlsx` → Solo contratos de Carlos
   - `CONTRATOS_WILMER.xlsx` → Solo contratos de Wilmer
   - Etc.

2. **Carlos:**
   - Login: `carlos` / `43803239`
   - Carga Masiva → Subir `CONTRATOS_CARLOS.xlsx`
   - Sistema asigna automáticamente `supervisor_id = 3` a TODOS

3. **Wilmer:**
   - Logout de Carlos
   - Login: `wilmer` / `46298703`
   - Carga Masiva → Subir `CONTRATOS_WILMER.xlsx`
   - Sistema asigna automáticamente `supervisor_id = 4` a TODOS

---

### **PASO 3: Verificar que Funciona**

1. Login con el supervisor (ej: `carlos` / `43803239`)

2. Ir a **"Registrar Inspección"**

3. Abrir dropdown **"Cuenta Contrato"**
   - ✅ Debe mostrar las cuentas asignadas
   - ❌ Si sigue vacío → No hay contratos asignados a ese supervisor

4. Ir a **"Consultar Registros"**
   - ✅ Debe cargar automáticamente los registros
   - ❌ Si dice "No se encontraron registros" → No hay datos para ese supervisor

5. Abrir consola del navegador (F12):
   - Buscar mensaje: `"Se encontraron X registros para el supervisor Y"`
   - Si X = 0 → No hay asignaciones

---

## 🔧 **SCRIPT SQL RÁPIDO PARA SOLUCIONAR AHORA:**

### **Si ya tienes los 47 registros cargados y quieres asignarlos:**

```sql
-- PASO 1: Ver IDs de supervisores
SELECT id, usuario FROM supervisores WHERE usuario IN ('carlos', 'wilmer', 'marcelino', 'manuel', 'angelo');

-- PASO 2: Asignar TODOS a Carlos (ejemplo)
UPDATE inspecciones SET supervisor_id = 3;  -- Cambiar 3 por el ID real de Carlos

-- PASO 3: Verificar
SELECT COUNT(*) as total FROM inspecciones WHERE supervisor_id = 3;
```

### **O distribuir equitativamente:**

```sql
-- Carlos: primeros 10 contratos
UPDATE inspecciones
SET supervisor_id = 3
WHERE id IN (SELECT id FROM inspecciones ORDER BY id LIMIT 10);

-- Wilmer: siguientes 10 contratos
UPDATE inspecciones
SET supervisor_id = 4
WHERE id IN (
    SELECT id FROM inspecciones
    WHERE supervisor_id IS NULL
    ORDER BY id LIMIT 10
);

-- Marcelino: siguientes 10 contratos
UPDATE inspecciones
SET supervisor_id = 5
WHERE id IN (
    SELECT id FROM inspecciones
    WHERE supervisor_id IS NULL
    ORDER BY id LIMIT 10
);

-- Manuel: siguientes 10 contratos
UPDATE inspecciones
SET supervisor_id = 6
WHERE id IN (
    SELECT id FROM inspecciones
    WHERE supervisor_id IS NULL
    ORDER BY id LIMIT 7
);

-- Angelo: el resto
UPDATE inspecciones
SET supervisor_id = 7
WHERE supervisor_id IS NULL;
```

---

## 📊 **VERIFICACIÓN FINAL:**

```sql
-- Debe mostrar contratos por cada supervisor
SELECT
    s.usuario,
    s.nombre,
    COUNT(i.id) as total_contratos
FROM supervisores s
LEFT JOIN inspecciones i ON s.id = i.supervisor_id
WHERE s.usuario IN ('carlos', 'wilmer', 'marcelino', 'manuel', 'angelo')
GROUP BY s.id, s.usuario, s.nombre
ORDER BY s.usuario;
```

**Resultado esperado:**
```
usuario   | nombre     | total_contratos
----------|------------|----------------
angelo    | Angelo     | 10
carlos    | Carlos     | 10
manuel    | Manuel     | 7
marcelino | Marcelino  | 10
wilmer    | Wilmer     | 10
```

---

## 🎯 **FLUJO RECOMENDADO:**

### **Para Producción:**

1. **Administrador carga Excel maestro:**
   - Login como `mdonet` / `mdonet123`
   - Carga TODO el Excel (47 registros)
   - Todos quedan asignados a `mdonet`

2. **Administrador reasigna en Supabase:**
   - Ejecuta script SQL para distribuir contratos
   - Asigna por distrito, zona, o manualmente

3. **Supervisores trabajan:**
   - Cada supervisor hace login
   - Solo ve sus contratos asignados
   - Agrega fotos y observaciones

---

### **Para Desarrollo/Pruebas:**

1. **Cada supervisor carga su propio Excel:**
   - Cada uno tiene un archivo Excel separado
   - Al cargar, se asigna automáticamente a él
   - No necesita reasignación manual

---

## 📁 **ARCHIVOS CREADOS:**

1. **[ASIGNAR_CONTRATOS_POR_SUPERVISOR.sql](ASIGNAR_CONTRATOS_POR_SUPERVISOR.sql)**
   - Script completo con todas las opciones de asignación
   - Descomenta las líneas que necesites

2. **[SOLUCION_NO_VE_CONTRATOS.md](SOLUCION_NO_VE_CONTRATOS.md)** (este archivo)
   - Guía paso a paso para solucionar el problema

---

## ✅ **CHECKLIST DE SOLUCIÓN:**

- [ ] Ejecutar: http://localhost:8000/verificar-datos.html
- [ ] Click en "Contar Inspecciones"
- [ ] Verificar si hay datos (Total > 0)
- [ ] Si NO hay datos → Cargar Excel desde Carga Masiva
- [ ] Si hay datos → Ejecutar script SQL para asignar
- [ ] Login con supervisor
- [ ] Verificar que dropdown muestra cuentas
- [ ] Verificar que "Consultar Registros" muestra datos

---

## 🆘 **SI AÚN NO FUNCIONA:**

1. Abre consola del navegador (F12)
2. Ve a "Consultar Registros"
3. Busca el mensaje en consola:
   ```
   Se encontraron X registros para el supervisor Y
   ```
4. Si X = 0:
   - Ve a Supabase
   - Ejecuta: `SELECT COUNT(*) FROM inspecciones WHERE supervisor_id = Y;`
   - Si retorna 0 → No hay contratos asignados a ese supervisor

5. Manda captura de:
   - Consola del navegador (mensaje de registros encontrados)
   - Resultado de: `SELECT supervisor_id, COUNT(*) FROM inspecciones GROUP BY supervisor_id;`

---

**© 2025 DONET - Sistema de Gestión de Inspecciones**
