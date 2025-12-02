# 🔐 INSTRUCCIONES DE SEGURIDAD - CONFIGURACIÓN RENDER

## ⚠️ IMPORTANTE: CONFIGURACIÓN DE VARIABLES DE ENTORNO

Este proyecto ha sido **actualizado para mayor seguridad**. Las credenciales ya NO están en el código fuente.

---

## 📋 PASOS PARA CONFIGURAR EN RENDER

### 1. Acceder al Dashboard de Render

1. Ve a [https://dashboard.render.com](https://dashboard.render.com)
2. Inicia sesión con tu cuenta
3. Selecciona tu servicio: **donet-supervision-system**

### 2. Configurar Variables de Entorno

1. En el menú lateral, click en **"Environment"**
2. Scroll down hasta la sección **"Environment Variables"**
3. Click en **"Add Environment Variable"**

### 3. Agregar las siguientes variables:

#### Variable 1: SUPABASE_URL
- **Key:** `SUPABASE_URL`
- **Value:** `https://bvqmaaxtaetebjsgdphj.supabase.co`
- Click **"Add"**

#### Variable 2: SUPABASE_ANON_KEY
- **Key:** `SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cW1hYXh0YWV0ZWJqc2dkcGhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNjAyMzEsImV4cCI6MjA3OTkzNjIzMX0.p2dgaWGlQcUsKJ8Y92mQzwyCs32tcKGGEAMh8d_F9ms`
- Click **"Add"**

#### Variable 3: APP_NAME (Opcional)
- **Key:** `APP_NAME`
- **Value:** `DONET`
- Click **"Add"**

#### Variable 4: ENVIRONMENT (Opcional)
- **Key:** `ENVIRONMENT`
- **Value:** `production`
- Click **"Add"**

### 4. Guardar y Re-Desplegar

1. Click en **"Save Changes"** en la parte superior
2. Render automáticamente re-desplegará tu aplicación
3. Espera 2-3 minutos para que se complete el despliegue

---

## 🔍 VERIFICAR QUE FUNCIONA

### Opción 1: Desde el navegador

1. Accede a tu aplicación: `https://donet-supervision-system.onrender.com`
2. Abre la **Consola del navegador** (F12)
3. Deberías ver:
   ```
   ✅ Credenciales obtenidas del servidor
   ✅ Supabase inicializado correctamente
   📊 Proyecto: bvqmaaxt...
   ```

### Opción 2: Revisar logs de Render

1. En el Dashboard de Render, click en **"Logs"**
2. Busca estas líneas:
   ```
   ✅ Cliente Supabase inicializado correctamente
   📊 Proyecto: bvqmaaxt...
   ✅ Servidor DONET corriendo
   ```

### ❌ Si ves este error:

```
❌ ERROR CRÍTICO: Variables de entorno no configuradas
```

**Solución:** Verifica que hayas agregado correctamente `SUPABASE_URL` y `SUPABASE_ANON_KEY` en Render.

---

## 🛡️ MEJORAS DE SEGURIDAD IMPLEMENTADAS

### ✅ Antes (INSEGURO):
```javascript
// ❌ Credenciales en el código fuente
const DEFAULT_SUPABASE_URL = 'https://...';
const DEFAULT_SUPABASE_KEY = 'eyJhbGci...';
```

### ✅ Ahora (SEGURO):
```javascript
// ✅ Credenciales desde variables de entorno
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
```

---

## 📁 ARCHIVOS MODIFICADOS PARA SEGURIDAD

| Archivo | Cambio |
|---------|--------|
| `server.js` | Eliminadas credenciales hardcodeadas |
| `config.js` | Ahora obtiene credenciales del servidor |
| `render.yaml` | Marcadas variables como `sync: false` |
| `.gitignore` | Protege archivo `.env` |

---

## 🔐 CONFIGURACIÓN LOCAL (.env)

Para desarrollo local, el archivo `.env` ya está configurado con las credenciales.

**NUNCA subas el archivo `.env` a GitHub** - Ya está protegido en `.gitignore`

```bash
# Verificar que .env está protegido
git status
# No debería aparecer .env en la lista
```

---

## 🚀 SIGUIENTE PASO: DESPLEGAR

Una vez configuradas las variables de entorno en Render:

```bash
# 1. Hacer commit de los cambios de seguridad
git add .
git commit -m "🔐 Mejoras de seguridad: eliminar credenciales hardcodeadas"

# 2. Subir a GitHub
git push origin main

# 3. Render automáticamente desplegará la nueva versión
```

---

## ✅ CHECKLIST FINAL

- [ ] Variables de entorno configuradas en Render
- [ ] Aplicación desplegada sin errores
- [ ] Logs muestran "✅ Cliente Supabase inicializado"
- [ ] Login funciona correctamente
- [ ] Mapa de ubicaciones carga sin errores

---

## 📞 SOPORTE

Si encuentras problemas:

1. **Revisar logs en Render Dashboard**
2. **Verificar que todas las variables estén configuradas**
3. **Asegurarse que los valores no tengan espacios extra**

---

**Fecha:** 2025-12-01
**Versión:** 2.0 - Seguridad Mejorada
**Estado:** ✅ Listo para producción segura
