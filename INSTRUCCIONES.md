# Instrucciones de Instalación y Configuración

## Pasos Rápidos para Empezar

### 1. Preparar el Logo

1. Guarda el logo de DONET (que aparece en las imágenes adjuntas) como `logo-donet.png` en la carpeta del proyecto
2. El tamaño recomendado es 512x512 píxeles en formato PNG con fondo transparente

### 2. Configurar Supabase

#### A. Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Haz clic en "Start your project"
3. Crea una cuenta o inicia sesión
4. Crea un nuevo proyecto:
   - **Name:** DONET-Sistema
   - **Database Password:** (guarda esta contraseña en un lugar seguro)
   - **Region:** Selecciona la más cercana a tu ubicación
   - Haz clic en "Create new project"

#### B. Crear las Tablas

1. En tu proyecto de Supabase, ve al menú lateral y haz clic en "SQL Editor"
2. Haz clic en "New query"
3. Copia y pega el siguiente código SQL:

```sql
-- Tabla de supervisores
CREATE TABLE supervisores (
    id SERIAL PRIMARY KEY,
    usuario VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de registros de inspección
CREATE TABLE registros_inspeccion (
    id SERIAL PRIMARY KEY,
    supervisor_id INTEGER REFERENCES supervisores(id),
    cuenta_contrato VARCHAR(100) NOT NULL,
    fecha DATE NOT NULL,
    observacion1 TEXT,
    observacion2 TEXT,
    foto1 TEXT,
    foto2 TEXT,
    foto3 TEXT,
    foto4 TEXT,
    foto5 TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_registros_supervisor ON registros_inspeccion(supervisor_id);
CREATE INDEX idx_registros_cuenta ON registros_inspeccion(cuenta_contrato);
CREATE INDEX idx_registros_fecha ON registros_inspeccion(fecha);

-- Insertar usuario de prueba
INSERT INTO supervisores (usuario, password, nombre)
VALUES ('admin', 'admin123', 'Administrador');
```

4. Haz clic en "Run" para ejecutar el script
5. Deberías ver el mensaje "Success. No rows returned"

#### C. Obtener las Credenciales

1. En Supabase, ve a "Settings" (ícono de engranaje en el menú lateral)
2. Haz clic en "API"
3. Copia los siguientes valores:
   - **Project URL:** Algo como `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key:** Una clave larga que empieza con `eyJ...`

#### D. Configurar el Archivo config.js

1. Abre el archivo `config.js` en tu editor de código
2. Reemplaza las líneas 4 y 5:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://xxxxxxxxxxxxx.supabase.co',  // Pega tu Project URL aquí
    anonKey: 'eyJ...'  // Pega tu anon public key aquí
};
```

3. Guarda el archivo

### 3. Probar la Aplicación Localmente

#### Opción A: Usar Live Server (Recomendado)

1. Instala la extensión "Live Server" en Visual Studio Code
2. Haz clic derecho en `index.html`
3. Selecciona "Open with Live Server"
4. La aplicación se abrirá automáticamente en tu navegador

#### Opción B: Usar Python

```bash
# Python 3
python -m http.server 8000

# Luego abre en tu navegador:
# http://localhost:8000
```

#### Opción C: Abrir directamente

1. Navega a la carpeta del proyecto
2. Haz doble clic en `index.html`
3. Se abrirá en tu navegador por defecto

### 4. Iniciar Sesión

1. En la pantalla de login, ingresa:
   - **Usuario:** admin
   - **Contraseña:** admin123
2. Haz clic en "Entrar"
3. Deberías ver el menú principal

### 5. Probar las Funcionalidades

#### Registrar una Inspección:

1. Haz clic en "Registrar Inspección"
2. Completa los datos:
   - Cuenta Contrato: 12345
   - Fecha: (por defecto es hoy)
   - Observación 1: "Prueba de inspección"
   - Observación 2: "Todo funciona correctamente"
3. Carga 1 o más fotos (opcional)
4. Haz clic en "Guardar Registro"
5. Deberías ver un mensaje de confirmación

#### Consultar Registros:

1. Vuelve al menú principal
2. Haz clic en "Consultar Registros"
3. Puedes buscar por:
   - Cuenta Contrato
   - Rango de fechas
4. Haz clic en "Buscar"
5. Verás los registros guardados con sus fotos

## Crear Más Usuarios

Para crear más supervisores, ejecuta este SQL en Supabase:

```sql
INSERT INTO supervisores (usuario, password, nombre)
VALUES ('juanperez', 'pass123', 'Juan Pérez');

INSERT INTO supervisores (usuario, password, nombre)
VALUES ('marialopez', 'pass456', 'María López');
```

## Modo de Desarrollo (Sin Supabase)

Si aún no has configurado Supabase, la aplicación funcionará en modo de desarrollo:

- Podrás iniciar sesión con cualquier usuario/contraseña
- Los registros se mostrarán en la consola del navegador
- Aparecerán datos de ejemplo en las búsquedas

Esto es útil para probar el diseño antes de configurar la base de datos.

## Desplegar en Internet

### Opción 1: Netlify (Gratis y Fácil)

1. Ve a [https://netlify.com](https://netlify.com)
2. Arrastra la carpeta del proyecto a Netlify Drop
3. ¡Listo! Tu aplicación estará en línea

### Opción 2: Vercel (Gratis y Fácil)

1. Ve a [https://vercel.com](https://vercel.com)
2. Importa el proyecto desde GitHub
3. Despliega automáticamente

### Opción 3: GitHub Pages (Gratis)

1. Sube el proyecto a GitHub
2. Ve a Settings > Pages
3. Selecciona la rama main
4. Guarda y espera unos minutos

## Problemas Comunes y Soluciones

### ❌ "Error al iniciar sesión"

**Solución:** Verifica que:
- Las credenciales en `config.js` sean correctas
- Las tablas estén creadas en Supabase
- El usuario y contraseña sean correctos (admin/admin123)

### ❌ "No se guardan los registros"

**Solución:**
- Abre la consola del navegador (F12)
- Revisa si hay errores
- Verifica la conexión con Supabase

### ❌ "Las fotos no se cargan"

**Solución:**
- Usa imágenes de menos de 2MB
- Formatos permitidos: JPG, PNG, GIF
- Verifica permisos del navegador para archivos

### ❌ "El diseño se ve mal en el celular"

**Solución:**
- Limpia la caché del navegador
- Asegúrate de estar usando un navegador moderno
- Intenta en modo incógnito

## Personalización Avanzada

### Cambiar los Colores

Edita `styles.css`, líneas 8-12:

```css
:root {
    --primary-bg: #0a1628;      /* Fondo principal - azul oscuro */
    --secondary-bg: #162032;     /* Fondo secundario */
    --cyan: #00d4ff;             /* Color principal - cyan */
    --text-primary: #ffffff;     /* Color del texto */
}
```

### Agregar Más Campos al Formulario

1. En `index.html`, busca la sección "Información General"
2. Agrega un nuevo campo:

```html
<div class="form-group">
    <label>Nuevo Campo</label>
    <input type="text" id="nuevoCampo">
</div>
```

3. En Supabase, agrega la columna a la tabla:

```sql
ALTER TABLE registros_inspeccion
ADD COLUMN nuevo_campo TEXT;
```

4. En `app.js`, función `handleRegister()`, agrega:

```javascript
formData.nuevo_campo = document.getElementById('nuevoCampo').value;
```

## Seguridad para Producción

⚠️ **IMPORTANTE:** Antes de usar en producción:

1. **Cambiar las contraseñas** de los usuarios de prueba
2. **Habilitar HTTPS** (automático en Netlify/Vercel)
3. **Implementar hash de contraseñas** usando bcrypt
4. **Configurar Row Level Security** en Supabase
5. **Limitar tamaño de imágenes** para evitar problemas de almacenamiento

## Soporte

Si tienes problemas:

1. Revisa la consola del navegador (F12)
2. Verifica los logs de Supabase
3. Consulta el archivo README.md
4. Revisa la documentación de Supabase: [https://supabase.com/docs](https://supabase.com/docs)

## Próximos Pasos

Una vez que todo funcione:

1. ✅ Cambia las contraseñas por defecto
2. ✅ Crea usuarios reales para cada supervisor
3. ✅ Personaliza los campos según tus necesidades
4. ✅ Despliega en producción
5. ✅ Capacita a los usuarios finales

¡Listo! Tu aplicación DONET está funcionando. 🚀
