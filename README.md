# 🏢 Sistema de Gestión de Inspecciones DONET

Sistema web para gestión de inspecciones con supervisores, carga masiva desde Excel, registro fotográfico y consultas filtradas.

## 🚀 Características

- ✅ **Autenticación por supervisor** - Cada usuario solo ve sus datos
- 📊 **Carga masiva desde Excel** - Importación automática con validación
- 📸 **Registro fotográfico** - Hasta 5 fotos por inspección
- 🔍 **Consultas filtradas** - Búsqueda por cuenta, fecha y supervisor
- 🔐 **Seguridad** - Filtrado automático por supervisor_id
- 📱 **Responsive** - Diseño adaptable a móviles

## 🛠️ Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js + Express
- **Base de Datos**: PostgreSQL (Supabase)
- **Almacenamiento**: Supabase Storage
- **Despliegue**: Render

## 📋 Requisitos Previos

- Node.js >= 18.0.0
- Cuenta en Supabase
- Cuenta en Render (para despliegue)

## ⚙️ Configuración Local

### 1. Clonar el repositorio

\`\`\`bash
git clone https://github.com/mdmq2036/supervisor.git
cd supervisor
\`\`\`

### 2. Instalar dependencias

\`\`\`bash
npm install
\`\`\`

### 3. Configurar variables de entorno

\`\`\`bash
cp .env.example .env
\`\`\`

Edita \`.env\` con tus credenciales de Supabase.

### 4. Iniciar servidor

\`\`\`bash
npm start
\`\`\`

## 🌐 Despliegue en Render

1. Fork este repositorio
2. Crea un nuevo Web Service en Render
3. Conecta tu repositorio
4. Configura variables de entorno:
   - \`SUPABASE_URL\`
   - \`SUPABASE_ANON_KEY\`
   - \`ENVIRONMENT=production\`
5. Deploy automático

## 👥 Usuarios de Prueba

- **Admin**: mdonet / mdonet123
- **Demo**: demo / demo123
- **Supervisores**: carlos, wilmer, marcelino, manuel, angelo

## 🔒 Seguridad

NUNCA subas archivos \`.env\` a GitHub. Las credenciales se configuran mediante variables de entorno en Render.

## 📄 Licencia

© 2025 DONET - Sistema de Gestión de Inspecciones
