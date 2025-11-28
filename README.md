# Lienzo Infinito (Infinite Canvas App)

Una aplicación web de lienzo infinito donde puedes dibujar, agregar texto, formas, imágenes y más. Construida con Next.js, TypeScript y Tailwind CSS.

## Características

- **Dibujo libre**: Dibuja con el mouse usando diferentes grosores de línea
- **Texto editable**: Agrega texto en cualquier parte del lienzo
- **Formas geométricas**: Dibuja rectángulos, círculos y líneas
- **Selector de colores**: Personaliza los colores de todos tus elementos
- **Carga de imágenes**: Arrastra y suelta imágenes en tu lienzo
- **Zoom y paneo**: Navega por el lienzo infinito con zoom (rueda del mouse) y paneo
- **Persistencia automática**: Todos tus dibujos se guardan automáticamente en localStorage
- **Exportar/Importar**: Guarda y carga tus trabajos como archivos JSON

## Cómo usar

### Instalación

```bash
npm install
```

### Ejecutar en modo desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Construir para producción

```bash
npm run build
npm start
```

## Herramientas disponibles

### Barra de herramientas superior

1. **Seleccionar** - Modo de selección (en desarrollo)
2. **Mover** - Arrastra el lienzo para moverte por él
3. **Dibujar** - Dibuja libremente con el mouse
4. **Texto** - Haz clic para agregar texto editable
5. **Rectángulo** - Dibuja rectángulos (arrastra para crear)
6. **Círculo** - Dibuja círculos (arrastra desde el centro)
7. **Línea** - Dibuja líneas rectas
8. **Imagen** - Carga imágenes desde tu computadora

### Controles adicionales

- **Selector de color**: Haz clic en el cuadro de color para abrir el selector
- **Grosor de línea**: Ajusta el grosor para dibujo libre y líneas
- **Relleno**: Activa/desactiva el relleno para rectángulos y círculos
- **Limpiar todo**: Borra todos los elementos del lienzo
- **Guardar**: Exporta tu trabajo como archivo JSON
- **Cargar**: Importa un trabajo previamente guardado

## Atajos de teclado

- **Rueda del mouse**: Zoom in/out
- **Ctrl + Click**: Mover el lienzo (alternativa a la herramienta Mover)
- **Enter**: Confirmar texto al escribir
- **Escape**: Cancelar edición de texto

## Tecnologías utilizadas

- **Next.js 16**: Framework de React con App Router
- **TypeScript**: Tipado estático para mayor seguridad
- **Tailwind CSS**: Estilos utilitarios
- **react-colorful**: Selector de colores
- **lucide-react**: Iconos modernos
- **Canvas API**: Renderizado de gráficos

## Estructura del proyecto

```
/app
  ├── page.tsx              # Página principal con lógica de estado
  └── globals.css           # Estilos globales
/components
  ├── InfiniteCanvas.tsx    # Componente principal del lienzo
  └── Toolbar.tsx           # Barra de herramientas
/types
  └── canvas.ts             # Tipos TypeScript para elementos del lienzo
```

## Persistencia de datos

La aplicación guarda automáticamente tu trabajo en el localStorage del navegador. Tus dibujos se restaurarán automáticamente cuando vuelvas a abrir la aplicación.

Para guardar permanentemente:
1. Usa el botón **Guardar** para exportar como JSON
2. Guarda el archivo en tu computadora
3. Usa el botón **Cargar** para importarlo nuevamente

## Próximas características (ideas)

- Selección y manipulación de elementos individuales
- Deshacer/Rehacer
- Capas
- Más formas (triángulos, polígonos, etc.)
- Exportar como imagen PNG/SVG
- Colaboración en tiempo real

## Licencia

MIT
