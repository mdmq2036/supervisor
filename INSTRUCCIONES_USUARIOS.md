# 👥 INSTRUCCIONES - Creación de Usuarios

## Fecha: 29 de Noviembre de 2025

---

## ✅ **USUARIOS CREADOS:**

| Usuario    | Contraseña | Nombre     |
|------------|------------|------------|
| carlos     | 43803239   | Carlos     |
| wilmer     | 46298703   | Wilmer     |
| marcelino  | 9394061    | Marcelino  |
| manuel     | 561773     | Manuel     |
| angelo     | 76935270   | Angelo     |

---

## 📋 **PASO 1: EJECUTAR SCRIPT EN SUPABASE**

### **1.1 Abrir Supabase:**
1. Ir a: https://supabase.com
2. Login con tu cuenta
3. Seleccionar tu proyecto: **bvqmaaxtaetebjsgdphj**

### **1.2 Abrir SQL Editor:**
1. Click en el menú lateral: **SQL Editor**
2. Click en: **+ New query**

### **1.3 Copiar y Pegar el Script:**

```sql
-- CREAR USUARIOS SUPERVISORES
INSERT INTO supervisores (usuario, password, nombre, activo) VALUES
('carlos', '43803239', 'Carlos', true),
('wilmer', '46298703', 'Wilmer', true),
('marcelino', '9394061', 'Marcelino', true),
('manuel', '561773', 'Manuel', true),
('angelo', '76935270', 'Angelo', true);
```

### **1.4 Ejecutar:**
1. Click en el botón: **RUN** (o presiona Ctrl+Enter)
2. Esperar mensaje: **Success. No rows returned**

### **1.5 Verificar:**

```sql
SELECT * FROM supervisores ORDER BY usuario;
```

Deberías ver los 5 nuevos usuarios más los 2 anteriores (demo y mdonet).

---

## 🔐 **PASO 2: CÓMO FUNCIONA LA ASIGNACIÓN DE CONTRATOS**

### **Sistema Automático por Supervisor:**

Cuando un supervisor hace login y carga un Excel:

1. **Login:**
   - Usuario: `carlos`
   - Contraseña: `43803239`
   - Sistema guarda: `supervisor_id = 1`

2. **Carga Excel:**
   - Va a: "Carga Masiva"
   - Sube su Excel (ej: 50 contratos)
   - Sistema asigna automáticamente: `supervisor_id = 1` a **TODOS** los 50 contratos

3. **Trabajo Posterior:**
   - Carlos solo verá esos 50 contratos
   - Wilmer NO verá los contratos de Carlos
   - Cada supervisor solo ve sus propios contratos

---

## 📊 **PASO 3: FLUJO DE TRABAJO POR SUPERVISOR**

### **Supervisor: Carlos**

#### **3.1 Login:**
```
Usuario: carlos
Contraseña: 43803239
```

#### **3.2 Carga Masiva:**
1. Click en: **Carga Masiva**
2. Arrastrar o seleccionar: **MULTIFAMILIAR.xlsx** (o su archivo Excel)
3. Click en: **Procesar y Cargar Datos**
4. Esperar resultado:
   ```
   Total: 47 | Exitosos: 47 | Duplicados: 0 | Errores: 0
   ```

#### **3.3 Registrar Inspecciones:**
1. Click en: **Registrar Inspección**
2. Dropdown "Cuenta Contrato" muestra **solo** las 47 cuentas de Carlos
3. Seleccionar cuenta
4. Subir 5 fotos
5. Agregar observaciones
6. Guardar

#### **3.4 Consultar Registros:**
1. Click en: **Consultar Registros**
2. Sistema carga automáticamente las 47 inspecciones de Carlos
3. Puede filtrar por cuenta o fecha
4. Solo ve **sus propios** registros

---

### **Supervisor: Wilmer**

#### **3.1 Login:**
```
Usuario: wilmer
Contraseña: 46298703
```

#### **3.2 Carga Masiva:**
1. Click en: **Carga Masiva**
2. Sube **su propio Excel** (diferente al de Carlos)
3. Procesar datos
4. Todos los contratos se asignan a Wilmer

#### **3.3 Trabajo:**
- Wilmer solo ve sus contratos
- **NO** ve los 47 contratos de Carlos
- **NO** puede modificar datos de Carlos
- Completamente aislado

---

## 🔒 **SEGURIDAD IMPLEMENTADA:**

### ✅ **Cada Supervisor:**
- Solo ve sus propias cuentas contrato
- Solo puede agregar fotos a sus cuentas
- Solo consulta sus propios registros
- No puede acceder a datos de otros supervisores

### ❌ **NO Puede:**
- Ver cuentas de otros supervisores
- Modificar registros ajenos
- Buscar contratos que no le pertenecen
- Saltarse el filtro de seguridad

---

## 🧪 **PASO 4: PROBAR EL SISTEMA**

### **Prueba 1: Login Carlos**

1. Abrir: http://localhost:8000
2. Login:
   - Usuario: `carlos`
   - Contraseña: `43803239`
3. Resultado: ✅ Acceso concedido

---

### **Prueba 2: Carga de Excel por Carlos**

1. Menu → **Carga Masiva**
2. Subir archivo Excel (ej: 47 contratos)
3. Click: **Procesar y Cargar Datos**
4. Resultado: ✅ 47 registros cargados con `supervisor_id = (id de Carlos)`

---

### **Prueba 3: Registrar Inspección**

1. Menu → **Registrar Inspección**
2. Abrir dropdown "Cuenta Contrato"
3. Resultado: ✅ Solo muestra las 47 cuentas de Carlos

---

### **Prueba 4: Consultar Registros**

1. Menu → **Consultar Registros**
2. Resultado: ✅ Automáticamente carga las 47 inspecciones de Carlos

---

### **Prueba 5: Login Wilmer y Verificar Aislamiento**

1. Logout de Carlos
2. Login con Wilmer (`wilmer` / `46298703`)
3. Menu → **Consultar Registros**
4. Resultado: ✅ **NO** ve ningún registro (aún no ha cargado su Excel)
5. Cargar su propio Excel
6. Resultado: ✅ Solo ve sus propios contratos

---

## 📝 **RESUMEN EJECUTIVO:**

### **¿Cómo se asignan los contratos?**
- Automáticamente al cargar el Excel
- El sistema usa el `supervisor_id` del usuario que está logueado
- Cada carga masiva asigna todos los contratos a ese supervisor

### **¿Puede un supervisor ver contratos de otro?**
- ❌ **NO** - El sistema filtra automáticamente por `supervisor_id`

### **¿Qué pasa si dos supervisores cargan el mismo contrato?**
- Se crea un registro para cada supervisor
- Cada uno solo ve su propia versión
- Sistema detecta duplicados y los registra en tabla `registros_duplicados`

### **¿Cómo cambio un contrato de supervisor?**
- Opción 1: Ejecutar UPDATE en Supabase
  ```sql
  UPDATE inspecciones
  SET supervisor_id = 2  -- ID del nuevo supervisor
  WHERE cuenta_contrato = '12345';
  ```
- Opción 2: Eliminar y recargar desde el Excel correcto

---

## 🚀 **COMANDOS PARA EJECUTAR:**

### **Iniciar el Servidor:**
```bash
python -m http.server 8000
```

### **Abrir la Aplicación:**
```
http://localhost:8000
```

### **Verificar Datos en Supabase:**
```
http://localhost:8000/verificar-datos.html
```

---

## 📞 **CREDENCIALES DE ACCESO:**

### **Usuario Demo (Pruebas):**
```
Usuario: demo
Contraseña: demo123
```

### **Usuario Administrador:**
```
Usuario: mdonet
Contraseña: mdonet123
```

### **Usuarios Supervisores:**
```
carlos     → 43803239
wilmer     → 46298703
marcelino  → 9394061
manuel     → 561773
angelo     → 76935270
```

---

## ✅ **CHECKLIST DE IMPLEMENTACIÓN:**

- [x] Script SQL creado → `CREAR_USUARIOS.sql`
- [x] Documentación de seguridad → `SEGURIDAD_POR_SUPERVISOR.md`
- [ ] **PENDIENTE:** Ejecutar script en Supabase
- [ ] **PENDIENTE:** Probar login con cada usuario
- [ ] **PENDIENTE:** Verificar asignación automática de contratos

---

## 🎯 **PRÓXIMOS PASOS:**

1. **Ejecutar el script CREAR_USUARIOS.sql en Supabase**
2. **Verificar que los 5 usuarios fueron creados**
3. **Probar login con cada usuario**
4. **Cada supervisor debe cargar su propio Excel**
5. **Verificar que solo ven sus propios contratos**

---

**© 2025 DONET - Sistema de Gestión de Inspecciones**
**Sistema de Seguridad por Supervisor Implementado ✅**
