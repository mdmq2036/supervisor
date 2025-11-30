# 🔐 Configurar Variables de Entorno (.env)

## ¿Qué es el archivo .env?

El archivo `.env` es donde guardas tus **credenciales de Supabase de forma segura**, separadas del código. Esto permite:

✅ No compartir credenciales por error
✅ Diferentes configuraciones para desarrollo/producción
✅ Mayor seguridad
✅ Fácil actualización de credenciales

---

## 📝 Paso a Paso para Configurar

### **Paso 1: Obtener Credenciales de Supabase**

1. Ve a https://supabase.com
2. Inicia sesión
3. Abre tu proyecto **DONET**
4. Click en **Settings** (⚙️) en el menú izquierdo
5. Click en **API**
6. Copia estos dos valores:
   - **Project URL** (ejemplo: `https://abcdefg.supabase.co`)
   - **anon public** key (un texto largo que empieza con `eyJ...`)

### **Paso 2: Editar el archivo .env**

1. Abre el archivo **`.env`** con tu editor de texto (Notepad, VS Code, etc.)
2. Busca estas líneas:
   ```
   SUPABASE_URL=TU_SUPABASE_URL_AQUI
   SUPABASE_ANON_KEY=TU_SUPABASE_ANON_KEY_AQUI
   ```
3. Reemplaza con tus valores:
   ```
   SUPABASE_URL=https://abcdefg.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFz...
   ```
4. **Guarda el archivo** (Ctrl + S)

---

## ✅ Archivo .env Configurado Correctamente

Tu archivo `.env` debería verse así:

```env
# ========================================
# CONFIGURACIÓN DE SUPABASE - SISTEMA DONET
# ========================================

# URL de tu proyecto Supabase
SUPABASE_URL=https://abcdefg.supabase.co

# Clave pública anónima
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0...

# ========================================
# CONFIGURACIÓN OPCIONAL
# ========================================

APP_NAME=DONET
APP_VERSION=1.0
ENVIRONMENT=development
```

---

## 🚀 Cómo Usar (2 Opciones)

### **Opción 1: Solo con .env (Servidor Local Required)**

Si usas un servidor local (http-server, Python, etc.):

1. Edita el archivo `.env` con tus credenciales
2. Abre `index.html` desde el servidor local
3. Las credenciales se cargan automáticamente

**Nota:** Los navegadores modernos bloquean la carga de archivos `.env` desde `file://` por seguridad.

### **Opción 2: Usar config.js directamente**

Si abres `index.html` directamente (sin servidor):

1. Abre `config.js`
2. Edita directamente las credenciales:
   ```javascript
   const SUPABASE_CONFIG = {
       url: 'https://abcdefg.supabase.co',
       anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
   };
   ```
3. Guarda `config.js`
4. Abre `index.html`

---

## 🔒 Seguridad

### ⚠️ **IMPORTANTE - NO HACER:**

❌ No subas el archivo `.env` a GitHub
❌ No compartas el `.env` por email o chat
❌ No lo incluyas en capturas de pantalla
❌ No lo copies a repositorios públicos

### ✅ **RECOMENDACIONES:**

✅ El archivo `.gitignore` ya está configurado para ignorar `.env`
✅ Usa `.env.example` como plantilla (no tiene credenciales reales)
✅ Guarda tus credenciales en un gestor de contraseñas
✅ En producción, usa variables de entorno del hosting (Netlify, Vercel, etc.)

---

## 🧪 Verificar Configuración

### En el Navegador:

1. Abre `index.html`
2. Presiona **F12** para abrir Developer Tools
3. Ve a la pestaña **Console**
4. Deberías ver:
   ```
   ✅ Usando credenciales desde archivo .env
   ✅ Supabase inicializado correctamente
   📊 Proyecto: https://abcdefg.supabase.co
   ```

### Si ves errores:

**Error:** `⚠️ No se pudo cargar .env`
- **Solución:** Usa un servidor local o edita `config.js` directamente

**Error:** `❌ Configura tus credenciales de Supabase`
- **Solución:** Verifica que editaste `.env` o `config.js` correctamente

---

## 📂 Estructura de Archivos

```
c:\MARTIN\LUIGGY\
├── .env                    ← TUS CREDENCIALES (editar este)
├── .env.example            ← Plantilla de ejemplo
├── .gitignore              ← Protege .env de subirse a GitHub
├── config.js               ← Configuración (usa .env automáticamente)
├── env-loader.js           ← Carga el .env (no editar)
├── index.html              ← Aplicación principal
└── CONFIGURAR_ENV.md       ← Este archivo
```

---

## 🆘 Solución de Problemas

### Problema: "No puedo encontrar el archivo .env"

**En Windows:**
1. Abre el Explorador de archivos
2. Ve a `c:\MARTIN\LUIGGY\`
3. Click en **Vista** → Marcar **"Extensiones de nombre de archivo"**
4. Click en **Vista** → Marcar **"Elementos ocultos"**
5. Deberías ver el archivo `.env`

**Alternativa:** Usa VS Code o Notepad++ que muestran archivos ocultos.

### Problema: "Las credenciales no se cargan"

**Opción A:** Usa un servidor local
```bash
# Con Python
python -m http.server 8000

# Con Node.js
npx http-server -p 8000
```

**Opción B:** Edita `config.js` directamente (más simple)

### Problema: "Error de conexión con Supabase"

1. Verifica que copiaste la URL completa (con `https://`)
2. Verifica que copiaste la clave **anon/public** (no la service_role)
3. Verifica que no hay espacios al inicio o final
4. Verifica tu conexión a internet

---

## 🎯 Resumen Rápido

```
1️⃣ Ir a Supabase → Settings → API
2️⃣ Copiar Project URL y anon public key
3️⃣ Abrir .env
4️⃣ Pegar credenciales
5️⃣ Guardar
6️⃣ Abrir index.html
7️⃣ ¡Listo!
```

---

**© 2025 DONET - Sistema de Gestión de Inspecciones**
