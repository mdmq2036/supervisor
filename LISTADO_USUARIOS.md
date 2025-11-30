# 👥 LISTADO COMPLETO DE USUARIOS DEL SISTEMA DONET

**Fecha:** 30 de Noviembre de 2025

---

## 🔐 USUARIOS SUPERVISORES

Estos son los usuarios que pueden acceder al sistema para registrar inspecciones y consultar registros.

| # | Usuario | Contraseña | Nombre | Rol | Estado |
|---|---------|-----------|--------|-----|--------|
| 1 | `carlos` | `43803239` | Carlos | Supervisor | ✅ Activo |
| 2 | `wilmer` | `46298703` | Wilmer | Supervisor | ✅ Activo |
| 3 | `marcelino` | `9394061` | Marcelino | Supervisor | ✅ Activo |
| 4 | `manuel` | `561773` | Manuel | Supervisor | ✅ Activo |
| 5 | `angelo` | `76935270` | Angelo | Supervisor | ✅ Activo |

---

## 🔑 USUARIO ADMINISTRADOR

Este usuario tiene acceso a la función de **Carga Masiva** (importar Excel).

| # | Usuario | Contraseña | Rol | Estado |
|---|---------|-----------|-----|--------|
| 1 | `admin` | `admin2025` | Administrador | ✅ Activo |

---

## 📝 USUARIOS ALTERNATIVOS (Históricos)

Estos usuarios fueron utilizados en versiones anteriores del sistema.

| # | Usuario | Contraseña | Rol | Notas |
|---|---------|-----------|-----|-------|
| 1 | `demo` | `demo123` | Supervisor/Admin | Puede usarse para pruebas |
| 2 | `mdonet` | `mdonet123` | Supervisor/Admin | Puede usarse para pruebas |

---

## 🎯 CÓMO USAR

### **Para Supervisores (Registrar Inspecciones):**

1. Ir a: https://supervisor-ohtd.onrender.com
2. Seleccionar usuario (carlos, wilmer, marcelino, manuel o angelo)
3. Ingresar contraseña (DNI del supervisor)
4. Acceso a:
   - Registrar Inspección
   - Consultar Registros

**Ejemplo:**
```
Usuario: carlos
Contraseña: 43803239
```

### **Para Administrador (Carga Masiva):**

1. Ir a: https://supervisor-ohtd.onrender.com
2. Login con cualquier supervisor
3. Click en "Carga Masiva"
4. Se abrirá modal pidiendo credenciales de administrador
5. Ingresar:
   ```
   Usuario: admin
   Contraseña: admin2025
   ```
6. Acceso a carga-masiva.html para importar Excel

---

## 🔒 SEGURIDAD

### **Características de Seguridad:**

- ✅ Contraseñas almacenadas en Supabase PostgreSQL
- ✅ Cada supervisor solo ve sus propios registros
- ✅ Carga Masiva protegida con credenciales de administrador
- ✅ Variables de entorno protegidas en Render
- ✅ Filtrado por supervisor_id en todas las consultas

### **Notas de Seguridad:**

- Las contraseñas de supervisores son sus DNI
- El usuario admin tiene acceso a Carga Masiva
- Cada supervisor solo ve sus contratos asignados
- No hay acceso cruzado entre supervisores

---

## 📊 TABLA DE PERMISOS

| Función | Supervisores | Admin |
|---------|--------------|-------|
| Login | ✅ Sí | ✅ Sí |
| Registrar Inspección | ✅ Sí | ✅ Sí |
| Consultar Registros | ✅ Sí (solo suyos) | ✅ Sí (solo suyos) |
| Carga Masiva | ❌ No | ✅ Sí |
| Ver registros de otros | ❌ No | ❌ No |

---

## 🧪 PRUEBAS RECOMENDADAS

### **Test 1: Login Supervisor**
```
Usuario: carlos
Contraseña: 43803239
Resultado esperado: Acceso al menú principal
```

### **Test 2: Carga Masiva**
```
1. Login con cualquier supervisor
2. Click en "Carga Masiva"
3. Ingresar: admin / admin2025
4. Resultado esperado: Acceso a carga-masiva.html
```

### **Test 3: Privacidad**
```
1. Login: carlos / 43803239
2. Consultar registros (ver solo de carlos)
3. Logout
4. Login: wilmer / 46298703
5. Consultar registros (ver solo de wilmer)
6. Resultado esperado: Cada uno solo ve sus registros
```

---

## 📞 SOPORTE

Si necesitas:
- **Agregar nuevo usuario:** Ejecutar SQL en Supabase
- **Cambiar contraseña:** Actualizar tabla `supervisores`
- **Resetear acceso:** Contactar administrador

---

**© 2025 DONET - Sistema de Gestión de Inspecciones**
**Última actualización: 30/11/2025**
