# ⚡ EJECUTAR SQL EN SUPABASE - PASO A PASO

## 🎯 OBJETIVO

Crear la tabla `ubicaciones_en_tiempo_real` para que el mapa funcione correctamente.

---

## 📋 PASOS

### PASO 1: Abre Supabase

1. Ve a: https://app.supabase.com
2. Inicia sesión con tu cuenta
3. Selecciona el proyecto: **bvqmaaxtaetebjsgdphj**

### PASO 2: Abre SQL Editor

1. En el menú izquierdo, haz clic en **SQL Editor**
2. Haz clic en **New Query**

### PASO 3: Copia el SQL

Copia TODO esto:

```sql
-- ========================================
-- CREAR TABLA PARA UBICACIONES EN TIEMPO REAL
-- ========================================

-- 1. Crear tabla de ubicaciones en tiempo real
CREATE TABLE IF NOT EXISTS ubicaciones_en_tiempo_real (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    nombre VARCHAR(255),
    latitud DECIMAL(10, 8) NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL,
    precision_metros INTEGER DEFAULT 0,
    device_type VARCHAR(50) DEFAULT 'desktop',
    device_fingerprint VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_ubicaciones_usuario ON ubicaciones_en_tiempo_real(usuario_id);
CREATE INDEX IF NOT EXISTS idx_ubicaciones_timestamp ON ubicaciones_en_tiempo_real(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ubicaciones_activo ON ubicaciones_en_tiempo_real(activo);
CREATE INDEX IF NOT EXISTS idx_ubicaciones_device ON ubicaciones_en_tiempo_real(device_fingerprint);

-- 3. Crear vista para análisis de ubicaciones
CREATE OR REPLACE VIEW v_ubicaciones_tiempo_real AS
SELECT 
    u.id,
    u.usuario_id,
    u.nombre,
    u.latitud,
    u.longitud,
    u.precision_metros,
    u.device_type,
    u.device_fingerprint,
    u.timestamp as timestamp_entrada,
    u.activo,
    u.created_at,
    EXTRACT(EPOCH FROM (NOW() - u.timestamp)) / 60 as duracion_minutos,
    'Ubicación registrada' as actividad_realizada
FROM ubicaciones_en_tiempo_real u
WHERE u.activo = true
ORDER BY u.timestamp DESC;

-- 4. Habilitar RLS
ALTER TABLE ubicaciones_en_tiempo_real ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas de seguridad
DROP POLICY IF EXISTS "Todos pueden ver ubicaciones" ON ubicaciones_en_tiempo_real;
CREATE POLICY "Todos pueden ver ubicaciones" ON ubicaciones_en_tiempo_real
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuarios pueden insertar sus ubicaciones" ON ubicaciones_en_tiempo_real;
CREATE POLICY "Usuarios pueden insertar sus ubicaciones" ON ubicaciones_en_tiempo_real
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Usuarios pueden actualizar sus ubicaciones" ON ubicaciones_en_tiempo_real;
CREATE POLICY "Usuarios pueden actualizar sus ubicaciones" ON ubicaciones_en_tiempo_real
    FOR UPDATE USING (true);

-- 6. Crear función para limpiar ubicaciones antiguas
CREATE OR REPLACE FUNCTION limpiar_ubicaciones_antiguas()
RETURNS void AS $$
BEGIN
    DELETE FROM ubicaciones_en_tiempo_real
    WHERE timestamp < NOW() - INTERVAL '24 hours';
    
    RAISE NOTICE 'Ubicaciones antiguas eliminadas';
END;
$$ LANGUAGE plpgsql;

-- 7. Crear trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_updated_at ON ubicaciones_en_tiempo_real;
CREATE TRIGGER trigger_actualizar_updated_at
BEFORE UPDATE ON ubicaciones_en_tiempo_real
FOR EACH ROW
EXECUTE FUNCTION actualizar_updated_at();
```

### PASO 4: Pega en el Editor

1. En el SQL Editor, pega TODO el código anterior
2. Verifica que no haya errores de sintaxis

### PASO 5: Ejecuta

1. Presiona **Ctrl + Enter** o haz clic en **Run**
2. Espera a que termine (debe decir "Success")

### PASO 6: Verifica

Ejecuta esta consulta para verificar:

```sql
SELECT * FROM information_schema.tables 
WHERE table_name = 'ubicaciones_en_tiempo_real';
```

Deberías ver una fila con la tabla creada.

---

## ✅ VERIFICACIÓN FINAL

Ejecuta estas consultas para confirmar:

### 1. Ver estructura de tabla

```sql
SELECT * FROM information_schema.columns 
WHERE table_name = 'ubicaciones_en_tiempo_real'
ORDER BY ordinal_position;
```

Deberías ver 11 columnas.

### 2. Ver vista

```sql
SELECT * FROM v_ubicaciones_tiempo_real LIMIT 5;
```

Deberías ver la vista (aunque esté vacía al principio).

### 3. Ver índices

```sql
SELECT * FROM pg_indexes 
WHERE tablename = 'ubicaciones_en_tiempo_real';
```

Deberías ver 4 índices.

### 4. Ver políticas RLS

```sql
SELECT * FROM pg_policies 
WHERE tablename = 'ubicaciones_en_tiempo_real';
```

Deberías ver 3 políticas.

---

## 🚀 SIGUIENTE PASO

Una vez ejecutado el SQL:

1. Abre: https://supervisor-svkg.onrender.com/mapa-ubicaciones.html
2. Deberías ver el modal de GPS
3. Activa GPS
4. El mapa debería mostrar ubicaciones

---

## ⚠️ ERRORES COMUNES

### Error: "Table already exists"

**Solución:** Es normal si ya existe. El SQL usa `IF NOT EXISTS`.

### Error: "Permission denied"

**Solución:** Asegúrate de tener permisos en Supabase. Usa la cuenta del propietario del proyecto.

### Error: "Syntax error"

**Solución:** Verifica que copiaste TODO el SQL correctamente. No falten comillas ni punto y coma.

---

## 💡 NOTAS

- El SQL es idempotente (se puede ejecutar varias veces sin problemas)
- Las ubicaciones se limpian automáticamente después de 24 horas
- Los datos están encriptados en tránsito (HTTPS)
- RLS está habilitado para seguridad

---

**¿Necesitas ayuda?** Revisa los logs en Render o Supabase.
