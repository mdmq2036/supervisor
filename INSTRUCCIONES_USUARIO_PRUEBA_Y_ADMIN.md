# 📋 INSTRUCCIONES PARA CONFIGURAR USUARIO DE PRUEBA Y PANEL DE ADMINISTRACIÓN

## ✅ Cambios Realizados

### 1. **Logo Actualizado** 🎨
- ✅ Se actualizó el logo DONET en todas las páginas
- ✅ Archivos actualizados: `logo-donet.png` y `LOGO.png`
- ✅ El logo ahora se muestra correctamente en:
  - Pantalla de login
  - Menú principal
  - Todas las pantallas del sistema
  - Panel de administración

### 2. **Sistema de Control de Dispositivos** 🔐
- ✅ Creado script SQL completo: `CREAR_USUARIO_PRUEBA_LIMITADO.sql`
- ✅ Usuario de prueba con límite de 5 dispositivos
- ✅ Sistema de bloqueo automático
- ✅ Panel de administración para gestión

### 3. **Panel de Administración** 🛡️
- ✅ Creada página: `admin.html`
- ✅ Acceso solo con credenciales de administrador
- ✅ Funcionalidades:
  - Ver todos los usuarios y sus dispositivos
  - Resetear dispositivos de usuarios
  - Bloquear/desbloquear dispositivos individuales
  - Estadísticas en tiempo real

---

## 🚀 PASOS PARA IMPLEMENTAR

### **PASO 1: Ejecutar el Script SQL en Supabase**

1. **Accede a tu proyecto de Supabase**
   - Ve a: https://supabase.com/dashboard
   - Selecciona tu proyecto

2. **Abre el SQL Editor**
   - En el menú lateral, haz clic en "SQL Editor"
   - Crea una nueva query

3. **Copia y pega el contenido del archivo**
   - Abre el archivo: `CREAR_USUARIO_PRUEBA_LIMITADO.sql`
   - Copia TODO el contenido
   - Pégalo en el SQL Editor de Supabase

4. **Ejecuta el script**
   - Haz clic en "Run" o presiona `Ctrl + Enter`
   - Espera a que se complete la ejecución
   - Verifica que no haya errores

5. **Verifica la creación**
   - Deberías ver un mensaje: "Script ejecutado exitosamente"
   - Se mostrarán los usuarios creados: `prueba` y `admin`

---

### **PASO 2: Verificar Credenciales**

#### **Usuario de Prueba** (Limitado a 5 dispositivos)
```
Usuario: prueba
Contraseña: prueba2025
Límite: 5 dispositivos únicos
Rol: inspector
```

**Características:**
- ✅ Puede acceder desde máximo 5 dispositivos diferentes (PC o celular)
- ✅ Después del 5to dispositivo, se bloquea automáticamente
- ✅ Puede ver TODOS los registros del sistema (no solo los suyos)
- ✅ Solo puede ser desbloqueado por un administrador

#### **Usuario Administrador**
```
Usuario: admin
Contraseña: admin2025
Rol: admin
```

**Características:**
- ✅ Acceso completo al panel de administración
- ✅ Puede ver todos los dispositivos de todos los usuarios
- ✅ Puede resetear dispositivos
- ✅ Puede bloquear/desbloquear dispositivos individuales

---

### **PASO 3: Acceder al Panel de Administración**

1. **URL del Panel**
   ```
   https://tu-dominio.com/admin.html
   ```
   
   O en desarrollo local:
   ```
   http://localhost:3000/admin.html
   ```

2. **Iniciar Sesión**
   - Usuario: `admin`
   - Contraseña: `admin2025`

3. **Funcionalidades Disponibles**
   - 📊 **Dashboard**: Estadísticas generales
   - 👥 **Gestión de Usuarios**: Ver todos los usuarios
   - 📱 **Control de Dispositivos**: Ver dispositivos por usuario
   - 🔄 **Resetear Dispositivos**: Eliminar todos los dispositivos de un usuario
   - 🔒 **Bloquear/Desbloquear**: Control individual de dispositivos

---

## 🔧 FUNCIONES SQL DISPONIBLES

### 1. **Verificar Acceso de Dispositivo**
```sql
SELECT check_device_access(user_id, 'device_fingerprint_aqui');
```

### 2. **Listar Dispositivos de un Usuario**
```sql
SELECT * FROM list_user_devices('prueba');
```

### 3. **Resetear Dispositivos (Solo Admin)**
```sql
SELECT reset_user_devices('prueba', 'admin');
```

### 4. **Bloquear/Desbloquear Dispositivo (Solo Admin)**
```sql
SELECT toggle_device_block(device_id, 'admin');
```

### 5. **Ver Estadísticas**
```sql
SELECT * FROM device_statistics;
```

---

## 📊 ESTRUCTURA DE LA BASE DE DATOS

### **Tabla: device_access_control**
```
- id: INTEGER (Primary Key)
- user_id: INTEGER (Foreign Key → usuarios)
- device_fingerprint: TEXT (Identificador único del dispositivo)
- first_access: TIMESTAMP (Primer acceso)
- last_access: TIMESTAMP (Último acceso)
- access_count: INTEGER (Número de accesos)
- is_blocked: BOOLEAN (Estado de bloqueo)
```

### **Vista: device_statistics**
```
- username: Nombre de usuario
- nombre: Nombre completo
- total_devices: Total de dispositivos registrados
- blocked_devices: Dispositivos bloqueados
- last_device_access: Último acceso desde cualquier dispositivo
```

---

## 🧪 PRUEBAS RECOMENDADAS

### **Prueba 1: Usuario de Prueba**
1. Inicia sesión con `prueba` / `prueba2025` desde tu PC
2. Verifica que puedas acceder
3. Intenta acceder desde otros 4 dispositivos diferentes
4. En el 6to dispositivo, deberías ver un mensaje de bloqueo

### **Prueba 2: Panel de Administración**
1. Accede a `admin.html`
2. Inicia sesión con `admin` / `admin2025`
3. Verifica que puedas ver:
   - Estadísticas generales
   - Lista de usuarios
   - Dispositivos del usuario "prueba"
4. Prueba resetear los dispositivos del usuario "prueba"

### **Prueba 3: Bloqueo de Dispositivo**
1. Desde el panel de admin, ve a los dispositivos de "prueba"
2. Bloquea uno de los dispositivos
3. Intenta acceder desde ese dispositivo
4. Deberías ver un mensaje de "dispositivo bloqueado"

---

## 🔐 SEGURIDAD

### **Importante:**
- ⚠️ Las contraseñas están hasheadas con bcrypt (10 rounds)
- ⚠️ El panel de administración requiere autenticación
- ⚠️ Solo usuarios con rol "admin" pueden acceder al panel
- ⚠️ Los dispositivos se identifican por fingerprint único
- ⚠️ El sistema registra todos los accesos con timestamps

### **Recomendaciones:**
1. Cambia las contraseñas por defecto en producción
2. Implementa autenticación JWT para mayor seguridad
3. Habilita HTTPS en producción
4. Revisa regularmente los logs de acceso
5. Considera implementar 2FA para administradores

---

## 📝 NOTAS ADICIONALES

### **Generación de Nuevos Hashes**
Si necesitas crear nuevos usuarios con contraseñas hasheadas:

```bash
node generar-hashes.js
```

Luego actualiza el script SQL con los nuevos hashes.

### **Modificar Límite de Dispositivos**
Para cambiar el límite de 5 dispositivos, edita la función `check_device_access` en el script SQL:

```sql
IF v_device_count >= 5 THEN  -- Cambia este número
```

### **Acceso desde Render**
Una vez desplegado en Render, el panel de administración estará disponible en:
```
https://tu-app.onrender.com/admin.html
```

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### **Error: "Usuario no encontrado"**
- Verifica que ejecutaste el script SQL completo
- Revisa la tabla `usuarios` en Supabase

### **Error: "Función no existe"**
- Asegúrate de ejecutar TODO el script SQL
- Las funciones se crean en el mismo script

### **No puedo acceder al panel de admin**
- Verifica las credenciales: `admin` / `admin2025`
- Asegúrate de que el usuario tenga rol `admin`

### **El usuario "prueba" no se bloquea**
- Verifica que la función `check_device_access` esté creada
- Revisa los logs en la consola del navegador
- Asegúrate de que `device-fingerprint.js` esté cargado

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] Ejecutar script SQL en Supabase
- [ ] Verificar creación de usuarios (prueba y admin)
- [ ] Verificar creación de tabla `device_access_control`
- [ ] Verificar creación de funciones SQL
- [ ] Probar login con usuario "prueba"
- [ ] Probar acceso al panel de administración
- [ ] Hacer push a GitHub
- [ ] Verificar deploy en Render
- [ ] Probar en producción

---

## 📞 CONTACTO Y SOPORTE

Si tienes problemas con la implementación:
1. Revisa los logs en la consola del navegador (F12)
2. Verifica los logs de Supabase
3. Revisa el archivo `CREAR_USUARIO_PRUEBA_LIMITADO.sql`

---

**Fecha de creación:** 30 de Noviembre, 2025  
**Versión:** 1.0  
**Sistema:** DONET - Sistema de Gestión de Inspecciones
