# 🔧 INSTRUCCIONES PARA CONFIGURAR LA BASE DE DATOS

## 📋 PROBLEMA ACTUAL
No puedes ingresar con los usuarios configurados porque:
1. Las tablas no están creadas en Supabase
2. Row Level Security (RLS) está bloqueando el acceso
3. Los usuarios no existen en la base de datos

---

## ✅ SOLUCIÓN - Opción 1: SUPABASE (Recomendado)

### Paso 1: Acceder a Supabase
1. Ve a: https://supabase.com
2. Inicia sesión en tu proyecto
3. Tu proyecto es: `bvqmaaxtaetebjsgdphj.supabase.co`

### Paso 2: Abrir SQL Editor
1. En el menú lateral izquierdo, haz clic en **"SQL Editor"**
2. Haz clic en **"New Query"**

### Paso 3: Ejecutar el Script
1. Abre el archivo: `SETUP_DATABASE.sql`
2. Copia TODO el contenido
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en **"Run"** o presiona **Ctrl + Enter**

### Paso 4: Verificar Resultados
Deberías ver:
```
✅ CONFIGURACIÓN COMPLETADA EXITOSAMENTE
✅ Usuarios creados: 3
✅ admin / admin123
✅ supervisor1 / pass123
✅ supervisor2 / pass456
✅ RLS deshabilitado
```

---

## ✅ SOLUCIÓN - Opción 2: DBEAVER

### Paso 1: Conectar a Supabase desde DBeaver
1. Abre DBeaver
2. Crea una nueva conexión PostgreSQL
3. Usa estos datos:
   - **Host:** `db.bvqmaaxtaetebjsgdphj.supabase.co`
   - **Puerto:** `5432`
   - **Database:** `postgres`
   - **Usuario:** `postgres`
   - **Contraseña:** [Tu contraseña de Supabase]

### Paso 2: Ejecutar Script
1. Abre el archivo `SETUP_DATABASE.sql` en DBeaver
2. Selecciona TODO el texto
3. Haz clic derecho → **Execute → Execute SQL Statement**
4. O presiona **Ctrl + Enter**

### Paso 3: Verificar
Ejecuta esta consulta:
```sql
SELECT * FROM supervisores;
```

Deberías ver los 3 usuarios.

---

## 🔍 SI YA TIENES LAS TABLAS CREADAS

Usa el script más simple: `VERIFICAR_Y_REPARAR.sql`

Este script:
- ✅ Verifica usuarios existentes
- ✅ Crea/actualiza usuarios faltantes
- ✅ Deshabilita RLS (problema principal)
- ✅ Elimina políticas que bloquean el acceso
- ✅ Muestra un resumen completo

---

## 📊 USUARIOS CONFIGURADOS

| Usuario | Contraseña | Nombre |
|---------|------------|--------|
| admin | admin123 | Administrador |
| supervisor1 | pass123 | Supervisor 1 |
| supervisor2 | pass456 | Supervisor 2 |

---

## 🚨 PROBLEMA MÁS COMÚN: RLS (Row Level Security)

El **Row Level Security** de PostgreSQL bloquea el acceso a las tablas.

### Verificar si RLS está causando problemas:
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('supervisores', 'registros_inspeccion');
```

Si `rowsecurity = true`, ejecuta:
```sql
ALTER TABLE supervisores DISABLE ROW LEVEL SECURITY;
ALTER TABLE registros_inspeccion DISABLE ROW LEVEL SECURITY;
```

---

## 🧪 DESPUÉS DE EJECUTAR EL SCRIPT

### 1. Verifica en Supabase:
   - Ve a **Table Editor**
   - Deberías ver las tablas: `supervisores` y `registros_inspeccion`
   - Haz clic en `supervisores` → Deberías ver 3 usuarios

### 2. Prueba el login en la aplicación:
   - Ve a: http://localhost:8000
   - Presiona **Ctrl + Shift + R** para limpiar caché
   - Intenta con: **admin** / **admin123**

### 3. Si sigue sin funcionar:
   - Presiona **F12** en el navegador
   - Ve a la pestaña **Console**
   - Copia los errores y dime qué dice

---

## 📝 ARCHIVOS CREADOS

| Archivo | Descripción |
|---------|-------------|
| `SETUP_DATABASE.sql` | Script completo de configuración inicial |
| `VERIFICAR_Y_REPARAR.sql` | Script rápido si ya tienes tablas |
| `SCRIPT_POSTGRESQL.sql` | Script completo del proyecto (alternativo) |
| `INSTRUCCIONES_BD.md` | Este archivo de instrucciones |

---

## 🆘 AYUDA ADICIONAL

### Error: "relation supervisores does not exist"
**Solución:** Ejecuta `SETUP_DATABASE.sql` completo

### Error: "new row violates row-level security policy"
**Solución:** Ejecuta:
```sql
ALTER TABLE supervisores DISABLE ROW LEVEL SECURITY;
```

### Error: "duplicate key value violates unique constraint"
**Solución:** Los usuarios ya existen. Usa `VERIFICAR_Y_REPARAR.sql`

### La aplicación dice "Usuario o contraseña incorrectos"
**Solución:**
1. Verifica que RLS esté deshabilitado
2. Verifica que los usuarios existan con: `SELECT * FROM supervisores;`
3. Prueba con cualquier usuario en modo desarrollo (debería funcionar)

---

## ✨ RESULTADO ESPERADO

Después de ejecutar el script correctamente:
- ✅ Tablas creadas: `supervisores`, `registros_inspeccion`
- ✅ 3 usuarios disponibles
- ✅ RLS deshabilitado
- ✅ Login funcionando en la aplicación
- ✅ Puedes registrar inspecciones
- ✅ Puedes consultar registros

---

**¿Necesitas ayuda?** Ejecuta el script y dime qué resultado obtienes.
