# Instrucciones para Ejecutar el Script en DBeaver

## Opción 1: Ejecutar en Supabase (RECOMENDADO)

Supabase es más fácil y rápido. No necesitas DBeaver.

1. Ve a [https://supabase.com](https://supabase.com)
2. Abre tu proyecto
3. Ve a **SQL Editor** (menú lateral)
4. Haz clic en **New query**
5. Abre el archivo `SCRIPT_POSTGRESQL.sql`
6. Copia TODO el contenido
7. Pega en Supabase
8. Haz clic en **Run** (▶️)
9. ¡Listo!

---

## Opción 2: Usar DBeaver

### Paso 1: Instalar DBeaver

1. Descarga DBeaver desde: [https://dbeaver.io/download/](https://dbeaver.io/download/)
2. Instala la versión **Community Edition** (gratis)
3. Abre DBeaver

### Paso 2: Conectar a Supabase

#### A. Obtener Credenciales de Supabase

1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. Ve a **Settings** → **Database**
3. Busca la sección **Connection Info**
4. Copia estos datos:
   - **Host:** `db.xxxxxxxxxxxxx.supabase.co`
   - **Database:** `postgres`
   - **Port:** `5432`
   - **User:** `postgres`
   - **Password:** (la contraseña que pusiste al crear el proyecto)

#### B. Crear Conexión en DBeaver

1. En DBeaver, haz clic en el ícono de **New Database Connection** (enchufe con +)
2. Selecciona **PostgreSQL**
3. Haz clic en **Next**

4. Completa los datos:
   ```
   Host: db.xxxxxxxxxxxxx.supabase.co
   Port: 5432
   Database: postgres
   Username: postgres
   Password: [tu contraseña de Supabase]
   ```

5. Haz clic en **Test Connection**
   - Si es la primera vez, DBeaver descargará los drivers de PostgreSQL
   - Espera a que diga "Connected"

6. Haz clic en **Finish**

### Paso 3: Abrir el Script SQL

1. En DBeaver, haz clic derecho en tu conexión
2. Selecciona **SQL Editor** → **Open SQL Script**
3. Busca el archivo `SCRIPT_POSTGRESQL.sql`
4. Haz clic en **Open**

### Paso 4: Ejecutar el Script

**Opción A: Ejecutar TODO el script (recomendado)**

1. Haz clic derecho en el editor
2. Selecciona **Execute** → **Execute SQL Script**
3. O presiona `Ctrl + X`

**Opción B: Ejecutar paso a paso**

1. Selecciona una sección del script (ejemplo: CREATE TABLE supervisores)
2. Presiona `Ctrl + Enter`
3. Repite para cada sección

### Paso 5: Verificar las Tablas Creadas

1. En el panel izquierdo, expande tu conexión
2. Expande **postgres** → **Schemas** → **public** → **Tables**
3. Deberías ver:
   - ✅ `supervisores`
   - ✅ `inspecciones`
   - ✅ `historial_cargas`
   - ✅ `registros_duplicados`

4. Haz clic derecho en cualquier tabla → **View Data**
5. Deberías ver los datos de prueba

### Paso 6: Ejecutar Consultas de Prueba

Abre un nuevo SQL Script y prueba:

```sql
-- Ver todos los supervisores
SELECT * FROM supervisores;

-- Ver estructura de la tabla inspecciones
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'inspecciones'
ORDER BY ordinal_position;

-- Contar registros
SELECT
    'supervisores' as tabla,
    COUNT(*) as total
FROM supervisores
UNION ALL
SELECT
    'inspecciones' as tabla,
    COUNT(*) as total
FROM inspecciones;
```

---

## Solución de Problemas en DBeaver

### Error: "Connection refused"

**Problema:** No puede conectarse a Supabase
**Solución:**
1. Verifica que el host sea correcto (debe incluir `db.` al inicio)
2. Verifica que el puerto sea `5432`
3. Verifica tu conexión a internet
4. En Supabase, verifica que la IP pooling esté habilitado

### Error: "Authentication failed"

**Problema:** Contraseña incorrecta
**Solución:**
1. Ve a Supabase → Settings → Database
2. Haz clic en **Reset database password**
3. Copia la nueva contraseña
4. Actualiza la conexión en DBeaver

### Error: "SSL connection required"

**Problema:** Supabase requiere SSL
**Solución:**
1. En DBeaver, edita la conexión
2. Ve a la pestaña **SSL**
3. Selecciona **Use SSL**
4. SSL Mode: **require**
5. Guarda y reconecta

### Error: "No se pueden crear las tablas"

**Problema:** Las tablas ya existen
**Solución:**
1. Primero elimina las tablas existentes:
   ```sql
   DROP TABLE IF EXISTS registros_duplicados CASCADE;
   DROP TABLE IF EXISTS historial_cargas CASCADE;
   DROP TABLE IF EXISTS inspecciones CASCADE;
   DROP TABLE IF EXISTS supervisores CASCADE;
   ```
2. Luego ejecuta el script completo nuevamente

---

## Comandos Útiles en DBeaver

### Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| `Ctrl + Enter` | Ejecutar statement actual |
| `Ctrl + X` | Ejecutar script completo |
| `Ctrl + /` | Comentar/descomentar línea |
| `F5` | Refrescar datos |
| `Ctrl + F` | Buscar en el script |

### Ver Datos de una Tabla

1. Panel izquierdo → Tables → [nombre tabla]
2. Doble clic en la tabla
3. O: Click derecho → View Data

### Exportar Datos

1. Abre la tabla
2. Click derecho en los datos → Export Data
3. Selecciona formato (CSV, Excel, SQL, etc.)

### Importar Datos desde CSV

1. Click derecho en la tabla → Import Data
2. Selecciona el archivo CSV
3. Mapea las columnas
4. Importa

---

## Configuración Avanzada de DBeaver

### Habilitar Autocompletado

1. Menu → Window → Preferences
2. DBeaver → SQL Editor → Code Completion
3. Habilita todas las opciones

### Cambiar Tema Oscuro

1. Menu → Window → Preferences
2. General → Appearance
3. Theme: Dark

### Aumentar Memoria

Si trabajas con muchos datos:

1. Menu → Window → Preferences
2. DBeaver → Connections
3. Memory usage: Increase to 2048 MB

---

## Comparación: Supabase vs DBeaver

| Característica | Supabase | DBeaver |
|---------------|----------|---------|
| **Facilidad de uso** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Instalación** | No requiere | Requiere descarga |
| **Acceso remoto** | Desde cualquier lugar | Solo local |
| **Interfaz** | Web simple | Escritorio completa |
| **Velocidad** | Rápida | Depende de conexión |
| **Funciones avanzadas** | Limitadas | Muchas |
| **Recomendado para** | Uso diario | Administración avanzada |

**Recomendación:** Usa **Supabase** para el día a día. Usa **DBeaver** solo si necesitas funciones avanzadas.

---

## Alternativas a DBeaver

Si DBeaver no te funciona, puedes usar:

1. **pgAdmin** - [https://www.pgadmin.org/](https://www.pgadmin.org/)
   - Cliente oficial de PostgreSQL
   - Más ligero que DBeaver

2. **DataGrip** - [https://www.jetbrains.com/datagrip/](https://www.jetbrains.com/datagrip/)
   - Muy profesional
   - De pago (con trial gratis)

3. **TablePlus** - [https://tableplus.com/](https://tableplus.com/)
   - Interfaz moderna
   - Gratis con limitaciones

4. **Beekeeper Studio** - [https://www.beekeeperstudio.io/](https://www.beekeeperstudio.io/)
   - Open source
   - Interfaz limpia

---

## Script de Verificación Rápida

Copia y ejecuta esto para verificar que todo esté OK:

```sql
-- ========================================
-- VERIFICACIÓN RÁPIDA DEL SISTEMA
-- ========================================

-- 1. Ver todas las tablas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Contar registros en cada tabla
SELECT 'supervisores' as tabla, COUNT(*) as total FROM supervisores
UNION ALL
SELECT 'inspecciones' as tabla, COUNT(*) as total FROM inspecciones
UNION ALL
SELECT 'historial_cargas' as tabla, COUNT(*) as total FROM historial_cargas
UNION ALL
SELECT 'registros_duplicados' as tabla, COUNT(*) as total FROM registros_duplicados;

-- 3. Ver usuarios creados
SELECT id, usuario, nombre, activo FROM supervisores;

-- 4. Ver estructura de tabla inspecciones
SELECT
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'inspecciones'
ORDER BY ordinal_position;

-- 5. Ver índices creados
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ========================================
-- Si todo muestra resultados, ¡estás listo!
-- ========================================
```

---

**¿Necesitas ayuda?** Revisa primero:
1. Esta guía
2. El archivo `GUIA_CARGA_MASIVA.md`
3. El archivo `README.md`

**© 2025 DONET - Sistema de Gestión de Inspecciones**
