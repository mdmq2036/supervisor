# 🚀 Guía de Despliegue en Render

## ✅ CÓDIGO SUBIDO A GITHUB

Repositorio: https://github.com/mdmq2037-cloud/supervisores.git

---

## 📋 PASOS PARA DESPLEGAR EN RENDER

### **PASO 1: Acceder a Render**

1. Ve a: https://render.com
2. Inicia sesión con tu cuenta
3. Si no tienes cuenta, créala con GitHub (recomendado)

---

### **PASO 2: Crear Nuevo Web Service**

1. Click en **"New"** (botón azul arriba a la derecha)
2. Selecciona **"Web Service"**
3. Click en **"Connect a repository"**
4. Busca y selecciona: **mdmq2037-cloud/supervisores**
5. Click en **"Connect"**

---

### **PASO 3: Configurar el Servicio**

#### **Información Básica:**
- **Name**: `donet-supervision-system` (o el nombre que prefieras)
- **Region**: Selecciona la más cercana (ej: Oregon - US West)
- **Branch**: `main`
- **Root Directory**: Dejar vacío

#### **Build & Deploy:**
- **Runtime**: `Node`
- **Build Command**:
  ```bash
  npm install
  ```
- **Start Command**:
  ```bash
  npm start
  ```

#### **Plan:**
- Selecciona **Free** (para pruebas) o **Starter** (para producción)

---

### **PASO 4: Configurar Variables de Entorno** ⚠️ IMPORTANTE

En la sección **"Environment Variables"**, agrega las siguientes variables:

#### **Variables Requeridas:**

1. **SUPABASE_URL**
   ```
   https://bvqmaaxtaetebjsgdphj.supabase.co
   ```

2. **SUPABASE_ANON_KEY**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cW1hYXh0YWV0ZWJqc2dkcGhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNjAyMzEsImV4cCI6MjA3OTkzNjIzMX0.p2dgaWGlQcUsKJ8Y92mQzwyCs32tcKGGEAMh8d_F9ms
   ```

3. **APP_NAME**
   ```
   DONET
   ```

4. **APP_VERSION**
   ```
   1.0
   ```

5. **ENVIRONMENT**
   ```
   production
   ```

6. **PORT** (Render lo asigna automáticamente, pero puedes especificarlo)
   ```
   8000
   ```

#### **Cómo Agregar Variables:**
1. Click en **"Add Environment Variable"**
2. Ingresa **Key** (nombre de la variable)
3. Ingresa **Value** (valor de la variable)
4. Repite para cada variable

---

### **PASO 5: Desplegar** 🚀

1. Revisa que todo esté configurado correctamente
2. Click en **"Create Web Service"**
3. Render comenzará a:
   - Clonar el repositorio
   - Ejecutar `npm install`
   - Ejecutar `npm start`
   - Asignar una URL pública

**Tiempo estimado:** 2-5 minutos

---

### **PASO 6: Verificar Despliegue**

1. **Espera** a que el indicador cambie a "Live" (verde)
2. **Copia la URL** asignada (ej: `https://donet-supervision-system.onrender.com`)
3. **Abre la URL** en el navegador
4. **Verifica** que aparezca la pantalla de login

---

### **PASO 7: Probar la Aplicación**

#### **Login con Usuario Demo:**
```
Usuario: demo
Contraseña: demo123
```

#### **Verificar Funcionalidades:**
1. ✅ Login funciona
2. ✅ Menú principal se muestra
3. ✅ Carga masiva disponible
4. ✅ Registro de inspección disponible
5. ✅ Consulta de registros disponible

#### **Verificar Datos:**
Abre: `https://tu-app.onrender.com/verificar-datos.html`

Click en:
- ✅ Verificar Configuración
- ✅ Verificar Tablas
- ✅ Contar Inspecciones

---

## 🔒 SEGURIDAD

### ✅ **Implementado:**
- Variables de entorno en Render (no en código)
- Archivo `.env` excluido de Git
- Credenciales nunca en el repositorio
- Filtrado automático por supervisor

### ⚠️ **Nunca Hagas:**
- Subir archivo `.env` a GitHub
- Hardcodear credenciales en el código
- Compartir la ANON_KEY públicamente (aunque es pública, mejor protegerla)

---

## 🔄 ACTUALIZACIONES AUTOMÁTICAS

Render está configurado para **Auto-Deploy**:

1. Haces cambios en tu código local
2. Ejecutas:
   ```bash
   git add .
   git commit -m "Descripción del cambio"
   git push origin main
   ```
3. Render detecta el cambio automáticamente
4. Redespliega la aplicación (2-5 minutos)

---

## 🐛 TROUBLESHOOTING

### **Error: Application failed to respond**

1. Revisa los **Logs** en Render Dashboard
2. Verifica que las variables de entorno estén configuradas
3. Asegúrate de que `npm start` ejecuta `server.js`

**Logs en Render:**
- Click en tu servicio
- Click en **"Logs"** (menú lateral)
- Busca errores en rojo

---

### **Error 500 - Internal Server Error**

1. Verifica variables de entorno:
   ```
   SUPABASE_URL ✅
   SUPABASE_ANON_KEY ✅
   ```
2. Abre `/api/config` para verificar que responde:
   ```
   https://tu-app.onrender.com/api/config
   ```

---

### **No se cargan los datos**

1. Abre `/verificar-datos.html`
2. Click en "Verificar Tablas"
3. Si dice "Could not find table", ejecuta el script SQL en Supabase

---

### **Cambios no se reflejan**

1. Verifica que hiciste `git push`
2. Ve a Render Dashboard → **"Events"**
3. Verifica que el deploy se completó (checkmark verde)
4. Limpia caché del navegador (Ctrl + Shift + R)

---

## 📊 MONITOREO

### **Ver Logs en Tiempo Real:**
1. Render Dashboard → Tu servicio
2. Click en **"Logs"**
3. Los logs se actualizan en vivo

### **Métricas:**
1. Render Dashboard → Tu servicio
2. Click en **"Metrics"**
3. Ve:
   - CPU usage
   - Memory usage
   - Request count
   - Response time

---

## 🎯 PRÓXIMOS PASOS

### **1. Configurar Dominio Personalizado (Opcional)**

1. Render Dashboard → Tu servicio
2. Click en **"Settings"**
3. Scroll a **"Custom Domain"**
4. Agrega tu dominio (ej: `supervision.donet.com`)
5. Configura DNS según instrucciones de Render

### **2. Habilitar HTTPS**

Render proporciona HTTPS automáticamente con Let's Encrypt (gratis).

### **3. Configurar Notificaciones**

1. Render Dashboard → Tu servicio
2. **"Settings"** → **"Notifications"**
3. Agrega email o Slack para alertas de deploy

---

## 📝 COMANDOS ÚTILES

### **Ver URL del deploy:**
```bash
cd /c/MARTIN/LUIGGY
git remote -v
```

### **Hacer nuevo deploy:**
```bash
cd /c/MARTIN/LUIGGY
git add .
git commit -m "Actualización: [descripción]"
git push origin main
```

### **Ver status de Git:**
```bash
cd /c/MARTIN/LUIGGY
git status
```

---

## ✅ CHECKLIST DE DESPLIEGUE

- [ ] Código subido a GitHub
- [ ] Render Web Service creado
- [ ] Variables de entorno configuradas
- [ ] Deploy completado (estado "Live")
- [ ] URL asignada y funcionando
- [ ] Login funciona
- [ ] Base de datos conectada
- [ ] Script SQL ejecutado en Supabase
- [ ] Usuarios creados
- [ ] Carga masiva probada
- [ ] Consultas funcionando

---

## 🆘 SOPORTE

### **Si necesitas ayuda:**

1. **Logs de Render:**
   - Render Dashboard → Logs
   - Copia los últimos 50 líneas

2. **Logs de Supabase:**
   - Supabase Dashboard → Logs
   - Busca errores

3. **Verificación Local:**
   ```bash
   cd /c/MARTIN/LUIGGY
   npm install
   npm start
   ```
   Abre: http://localhost:8000

---

## 🎉 ¡LISTO!

Tu aplicación DONET está desplegada en:
**https://tu-app.onrender.com**

Comparte esta URL con tus supervisores para que accedan al sistema.

---

**© 2025 DONET - Sistema de Gestión de Inspecciones**
**Desplegado con ❤️ en Render**
