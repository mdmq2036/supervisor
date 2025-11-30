# 🚀 INSTRUCCIONES RÁPIDAS - CREAR USUARIO PRUEBA

## ✅ CAMBIOS COMPLETADOS

1. ✅ **Logo actualizado** con la imagen correcta (logo grande DONET)
2. ✅ **Script SQL simple creado**: `EJECUTAR_AHORA_EN_SUPABASE.sql`
3. ✅ **Código actualizado en GitHub**
4. ✅ **Deploy automático en Render** (en progreso)

---

## 📋 EJECUTAR SCRIPT EN SUPABASE (3 PASOS)

### **PASO 1: Abrir Supabase**
1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. En el menú lateral, haz clic en **"SQL Editor"**

### **PASO 2: Copiar el Script**
1. Abre el archivo: `EJECUTAR_AHORA_EN_SUPABASE.sql`
2. Selecciona TODO el contenido (Ctrl + A)
3. Copia (Ctrl + C)

### **PASO 3: Ejecutar en Supabase**
1. En el SQL Editor de Supabase, pega el script (Ctrl + V)
2. Haz clic en el botón **"Run"** (o presiona Ctrl + Enter)
3. Espera a que termine la ejecución
4. Verifica que veas el mensaje: **"✅ SCRIPT EJECUTADO EXITOSAMENTE"**

---

## 🔐 CREDENCIALES CREADAS

### **Usuario de Prueba:**
```
Usuario: prueba
Contraseña: prueba2025
Límite: 5 dispositivos
```

### **Usuario Administrador:**
```
Usuario: admin
Contraseña: admin2025
Panel: /admin.html
```

---

## ✅ VERIFICAR QUE FUNCIONÓ

Después de ejecutar el script, verifica en Supabase:

1. **Tabla "usuarios" creada:**
   - Ve a: Table Editor → usuarios
   - Deberías ver 2 usuarios: "prueba" y "admin"

2. **Tabla "device_access_control" creada:**
   - Ve a: Table Editor → device_access_control
   - Estará vacía (se llenará cuando alguien haga login)

3. **Función creada:**
   - Ve a: Database → Functions
   - Deberías ver: `check_device_access`

---

## 🧪 PROBAR EL LOGIN

Una vez ejecutado el script:

1. **Espera 3-5 minutos** a que Render termine el deploy
2. **Accede a tu aplicación:**
   - URL: https://tu-app.onrender.com
3. **Inicia sesión:**
   - Usuario: `prueba`
   - Contraseña: `prueba2025`
4. **Deberías poder ingresar exitosamente**

---

## 📊 QUÉ HACE EL SCRIPT

El script `EJECUTAR_AHORA_EN_SUPABASE.sql` hace lo siguiente:

✅ Crea la tabla `usuarios` (si no existe)
✅ Elimina el usuario "prueba" si existe (evita duplicados)
✅ Crea el usuario "prueba" con contraseña hasheada
✅ Crea el usuario "admin" con contraseña hasheada
✅ Crea la tabla `device_access_control` para control de dispositivos
✅ Crea índices para mejorar el rendimiento
✅ Crea la función `check_device_access` para validar dispositivos
✅ Muestra un resumen de lo creado

---

## ⚠️ SI TIENES PROBLEMAS

### **Error: "relation usuarios already exists"**
✅ No hay problema, el script usa `CREATE TABLE IF NOT EXISTS`

### **Error: "duplicate key value"**
✅ No hay problema, el script elimina usuarios duplicados antes de crearlos

### **El usuario "prueba" no puede ingresar**
1. Verifica que ejecutaste el script en Supabase
2. Verifica que la tabla "usuarios" existe
3. Verifica que el usuario "prueba" está en la tabla
4. Espera a que Render termine el deploy (3-5 minutos)

### **El logo no se ve**
1. Espera a que Render termine el deploy
2. Limpia la caché del navegador (Ctrl + Shift + R)
3. Verifica que el archivo `logo-donet.png` esté en el repositorio

---

## 🎯 RESUMEN

### **LO QUE DEBES HACER AHORA:**

1. ✅ **Abrir Supabase SQL Editor**
2. ✅ **Copiar y pegar el contenido de:** `EJECUTAR_AHORA_EN_SUPABASE.sql`
3. ✅ **Hacer clic en "Run"**
4. ✅ **Esperar 3-5 minutos** a que Render termine el deploy
5. ✅ **Probar login** con usuario "prueba" / contraseña "prueba2025"

---

## 📞 ESTADO ACTUAL

```
✅ Logo actualizado en GitHub
✅ Código actualizado en GitHub
✅ Script SQL listo para ejecutar
⏳ Deploy en Render (en progreso - 3-5 minutos)
⏳ Ejecutar script en Supabase (PENDIENTE - HAZLO AHORA)
```

---

**¡EJECUTA EL SCRIPT AHORA EN SUPABASE Y PODRÁS INGRESAR CON EL USUARIO "PRUEBA"!**
