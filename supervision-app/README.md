# Sistema de Supervisión

Aplicación web para registro y consulta de supervisiones con carga de fotografías y almacenamiento en Google Drive.

## Características

- ✅ Autenticación de supervisores
- ✅ Registro de supervisiones con 5 campos de datos
- ✅ Carga de hasta 5 fotografías por supervisión
- ✅ Almacenamiento de fotos en Google Drive (2TB)
- ✅ Consulta de supervisiones por fecha y cuenta/contrato
- ✅ Base de datos PostgreSQL en Supabase
- ✅ Diseño responsive (PC y móvil)
- ✅ Tema oscuro profesional

## Tecnologías

- React + Vite
- Supabase (PostgreSQL)
- Google Drive API
- React Router
- Lucide React (iconos)

## Instalación

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno:
   - Copiar `.env.example` a `.env`
   - Completar con las credenciales de Supabase y Google Drive

4. Ejecutar en desarrollo:
   ```bash
   npm run dev
   ```

## Configuración de Supabase

### Tabla: supervisores
```sql
CREATE TABLE supervisores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: supervisiones
```sql
CREATE TABLE supervisiones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supervisor_id UUID REFERENCES supervisores(id),
  cuenta_contrato VARCHAR(100) NOT NULL,
  observacion1 TEXT,
  observacion2 TEXT,
  cuenta_nueva VARCHAR(100),
  numero_medidor VARCHAR(100),
  fecha DATE NOT NULL,
  foto1_url TEXT,
  foto2_url TEXT,
  foto3_url TEXT,
  foto4_url TEXT,
  foto5_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Configuración de Google Drive

1. Crear un proyecto en Google Cloud Console
2. Habilitar Google Drive API
3. Crear credenciales (API Key)
4. Crear una carpeta en Google Drive para almacenar las fotos
5. Obtener el ID de la carpeta
6. Configurar las variables de entorno

## Estructura del Proyecto

```
src/
├── components/
│   ├── Login.jsx
│   ├── Header.jsx
│   └── PhotoUpload.jsx
├── pages/
│   ├── RegistroSupervision.jsx
│   └── ConsultaSupervision.jsx
├── config/
│   └── supabase.js
├── utils/
│   └── googleDrive.js
├── App.jsx
└── index.css
```

## Uso

1. **Login**: Ingresar con usuario y contraseña de supervisor
2. **Registro**: Completar formulario y cargar fotos
3. **Consulta**: Buscar supervisiones por fecha o cuenta/contrato
4. **Ver Detalles**: Visualizar datos completos y fotografías

## Licencia

Propietario
