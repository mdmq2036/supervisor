# 🧹 LIMPIAR HISTORIAL DE UBICACIONES - GUÍA SEGURA

## 📅 Fecha: Diciembre 3, 2025

---

## ⚠️ IMPORTANTE

**Este proceso es SEGURO porque:**
- ✅ Solo elimina DATOS, no toca la estructura
- ✅ Mantiene todas las tablas intactas
- ✅ No afecta configuración ni RLS
- ✅ No malogra nada
- ✅ Puedes volver a usar el sistema normalmente

---

## 🚀 PASOS PARA LIMPIAR

### PASO 1: Abre Supabase
- URL: https://app.supabase.com
- Inicia sesión
- Selecciona proyecto: **bvqmaaxtaetebjsgdphj**

### PASO 2: Abre SQL Editor
- Menú izquierdo → **SQL Editor**
- Haz clic en **New Query**

### PASO 3: Copia el SQL
Abre el archivo: **LIMPIAR_HISTORIAL_UBICACIONES.sql**

Copia TODO el contenido

### PASO 4: Pega en Supabase
- En el editor de Supabase, pega TODO
- Presiona **Ctrl+Enter** o haz clic en **Run**

### PASO 5: Verifica
Deberías ver:
```
Total ubicaciones_en_tiempo_real: 0
Total ubicaciones_gps: 0
```

---

## ✅ QUÉ HACE ESTE SCRIPT

```sql
DELETE FROM ubicaciones_en_tiempo_real;
```
Elimina todos los registros de ubicaciones en tiempo real

```sql
DELETE FROM ubicaciones_gps;
```
Elimina todos los registros de ubicaciones GPS

```sql
ALTER SEQUENCE ubicaciones_en_tiempo_real_id_seq RESTART WITH 1;
ALTER SEQUENCE ubicaciones_gps_id_seq RESTART WITH 1;
```
Reinicia los contadores de IDs desde 1

```sql
SELECT COUNT(*) FROM ubicaciones_en_tiempo_real;
SELECT COUNT(*) FROM ubicaciones_gps;
```
Verifica que está vacío

---

## ✅ QUÉ NO TOCA

- ✅ Estructura de tablas (columnas, tipos)
- ✅ Índices
- ✅ Vistas (v_ubicaciones_tiempo_real, v_analisis_ubicaciones)
- ✅ Políticas RLS
- ✅ Funciones
- ✅ Triggers
- ✅ Usuarios y permisos
- ✅ Configuración de la aplicación

---

## 🔄 DESPUÉS DE LIMPIAR

### El sistema sigue funcionando normalmente:

1. **Usuarios pueden ingresar** → ✅ Login funciona
2. **GPS se solicita** → ✅ Modal de GPS aparece
3. **Ubicaciones se guardan** → ✅ Nuevas ubicaciones se registran
4. **Mapa funciona** → ✅ Muestra nuevas ubicaciones
5. **Historial comienza desde cero** → ✅ Datos limpios

---

## 📊 VERIFICACIÓN

### En Supabase:

```sql
-- Ver si está vacío
SELECT * FROM ubicaciones_en_tiempo_real LIMIT 10;
-- Resultado: 0 filas

SELECT * FROM ubicaciones_gps LIMIT 10;
-- Resultado: 0 filas
```

### En la Aplicación:

1. Abre: https://supervisor-svkg.onrender.com/mapa-ubicaciones.html
2. El mapa estará vacío (sin marcadores)
3. Ingresa nuevamente
4. Activa GPS
5. Deberías ver nuevos marcadores

---

## ⚡ ALTERNATIVA: Limpiar Solo UN Usuario

Si quieres limpiar solo un usuario específico:

```sql
-- Limpiar solo usuario con ID 2 (admin)
DELETE FROM ubicaciones_en_tiempo_real 
WHERE usuario_id = 2;

DELETE FROM ubicaciones_gps 
WHERE supervisor_id = 2;
```

---

## 🆘 SI ALGO SALE MAL

**Si ves error:**
- El script es idempotente (seguro de ejecutar múltiples veces)
- Puedes ejecutarlo de nuevo sin problemas
- No afecta nada

**Si necesitas recuperar datos:**
- Supabase tiene backups automáticos
- Contacta al soporte de Supabase

---

## 📝 CHECKLIST

- [ ] Abriste Supabase
- [ ] Abriste SQL Editor
- [ ] Copiaste el SQL
- [ ] Pegaste en Supabase
- [ ] Ejecutaste (Ctrl+Enter)
- [ ] Viste resultado: 0 filas
- [ ] Verificaste que el sistema sigue funcionando

---

**Estado:** ✅ SEGURO DE EJECUTAR  
**Riesgo:** ⭐ BAJO (solo elimina datos)  
**Reversible:** ⭐⭐ MEDIO (Supabase tiene backups)  
**Fecha:** Diciembre 3, 2025
