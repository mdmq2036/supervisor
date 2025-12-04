# ✅ INSTRUCCIONES FINALES - EJECUTAR SQL EN SUPABASE

## 🎯 OBJETIVO
Crear la tabla `ubicaciones_en_tiempo_real` para que el mapa funcione.

---

## ⚡ PASOS RÁPIDOS

### PASO 1: Abre Supabase
- URL: https://app.supabase.com
- Inicia sesión
- Selecciona proyecto: **bvqmaaxtaetebjsgdphj**

### PASO 2: Abre SQL Editor
- Menú izquierdo → **SQL Editor**
- Haz clic en **New Query**

### PASO 3: Copia el SQL PURO
Abre el archivo: **SQL_PURO_EJECUTAR.sql**

Copia TODO el contenido (sin números ni explicaciones)

### PASO 4: Pega en Supabase
- En el editor de Supabase, pega TODO
- Presiona **Ctrl+Enter** o haz clic en **Run**

### PASO 5: Espera
- Debe decir "Success" en verde
- Si hay error, revisa abajo

---

## ✅ VERIFICACIÓN

Una vez ejecutado, verifica que se creó:

```sql
SELECT * FROM information_schema.tables 
WHERE table_name = 'ubicaciones_en_tiempo_real';
```

Deberías ver **1 fila** con la tabla.

---

## 🚀 SIGUIENTE PASO

Una vez que el SQL se ejecute correctamente:

1. Ve a: https://dashboard.render.com
2. Selecciona: **supervisor**
3. Haz clic: **Manual Deploy** → **Deploy latest commit**
4. Espera a que termine (2-3 minutos)

---

## 🧪 PRUEBA FINAL

Abre: https://supervisor-svkg.onrender.com/mapa-ubicaciones.html

Deberías ver:
- ✅ Modal de GPS
- ✅ Mapa con ubicaciones
- ✅ Historial detallado

---

## ⚠️ SI HAY ERROR

**Error: "syntax error at or near..."**
- ✅ Solución: Asegúrate de copiar SOLO el SQL puro
- ✅ No copies números ni explicaciones
- ✅ Usa el archivo: **SQL_PURO_EJECUTAR.sql**

**Error: "Table already exists"**
- ✅ Es normal, significa que ya existe
- ✅ El SQL usa `IF NOT EXISTS`

**Error: "Permission denied"**
- ✅ Usa la cuenta propietaria del proyecto
- ✅ No una cuenta invitada

---

## 📝 CONTENIDO DEL SQL

El archivo **SQL_PURO_EJECUTAR.sql** contiene:

✅ Crear tabla `ubicaciones_en_tiempo_real`  
✅ Crear 4 índices  
✅ Crear vista `v_ubicaciones_tiempo_real`  
✅ Habilitar RLS  
✅ Crear 3 políticas de seguridad  
✅ Crear función de limpieza automática  
✅ Crear trigger para timestamps  

---

**¡Listo! Ejecuta el SQL y luego haz deploy en Render.**
