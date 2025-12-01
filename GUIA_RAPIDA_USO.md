# 🚀 GUÍA RÁPIDA DE USO - SISTEMA DONET

## 📱 ACCESO AL SISTEMA

### 1. Abrir el Sistema
```
URL: http://localhost:8000
```

### 2. Iniciar Sesión
```
Usuario:    admin
Contraseña: admin2025
```

**Otros usuarios disponibles:**
- `prueba` / `prueba2025` (ve todos los registros)
- `supervisor1` / `pass123` (solo sus registros)
- `supervisor2` / `pass456` (solo sus registros)

---

## 📊 MÓDULO DE REPORTES

### ¿Dónde está?
```
Login → Menú Principal → Clic en tarjeta "📊 Reportes"
```

### Paso 1: Seleccionar Periodo

**Opción A - Mes Completo:**
1. Clic en botón "📅 Mes Completo"
2. Seleccionar mes (Enero, Febrero, etc.)
3. Seleccionar año (2023, 2024, 2025)
4. Clic en "🔍 Buscar"

**Opción B - Rango Personalizado:**
1. Clic en botón "📆 Rango Personalizado"
2. Seleccionar "Fecha Inicio"
3. Seleccionar "Fecha Fin"
4. Clic en "🔍 Buscar"

### Paso 2: Ver Preview
- El sistema muestra una tabla con todos los registros encontrados
- Aparece contador: "X registros"
- Puedes hacer clic en "Ver" para detalles de cada registro

### Paso 3: Descargar Reporte

**Para Reporte Detallado:**
```
Clic en "📥 Descargar CSV Detallado"  →  Archivo .csv con todos los campos
Clic en "📥 Descargar PDF Detallado"  →  Documento .pdf profesional
```

**Para Reporte Resumido:**
```
Clic en "📥 Descargar CSV Resumido"  →  Archivo .csv consolidado
Clic en "📥 Descargar PDF Resumido"  →  Documento .pdf ejecutivo
```

### Paso 4: Compartir por WhatsApp

```
Clic en "💬 Compartir Detallado"  →  WhatsApp con info completa
Clic en "💬 Compartir Resumido"   →  WhatsApp con totales
```

**¿Qué pasa al compartir?**
1. Se abre WhatsApp automáticamente
2. El mensaje ya está escrito y formateado
3. Solo tienes que elegir contacto/grupo
4. Enviar

---

## 📝 REGISTRAR INSPECCIÓN

### ¿Dónde está?
```
Menú Principal → "📝 Registrar Inspección"
```

### Pasos:
1. **Seleccionar Cuenta Contrato** (lista desplegable)
2. **Seleccionar Fecha** (por defecto hoy)
3. **Escribir Observaciones** (opcional)
4. **Cargar Fotos** (hasta 5, opcional):
   - Clic en cada cuadro de foto
   - Seleccionar imagen
   - Se muestra preview
5. **Guardar**: Clic en "Guardar Registro"

---

## 🔍 CONSULTAR REGISTROS

### ¿Dónde está?
```
Menú Principal → "🔍 Consultar Registros"
```

### Opciones:

**Ver Todos:**
```
Clic en "Ver Todos"  →  Muestra últimos 100 registros
```

**Buscar Específico:**
1. Ingresar **Cuenta Contrato** (opcional)
2. Seleccionar **Fecha Inicio** (opcional)
3. Seleccionar **Fecha Fin** (opcional)
4. Clic en **"Buscar"**

### Resultados:
- Tarjetas con información completa
- Fotos visibles (clic para ampliar)
- Distrito, dirección, inspector
- Observaciones registradas

---

## 📤 CARGA MASIVA

### ¿Dónde está?
```
Menú Principal → "📤 Carga Masiva"
```

### ⚠️ Solo Admin:
1. Al hacer clic, pide credenciales de administrador
2. Ingresar: `admin` / `admin2025`
3. Se abre módulo de carga masiva
4. Seguir instrucciones en pantalla

---

## 💡 CONSEJOS ÚTILES

### Para Reportes:

**¿Cuándo usar Detallado?**
- Necesitas ver todos los campos
- Vas a analizar datos en Excel
- Requieres información completa

**¿Cuándo usar Resumido?**
- Solo necesitas totales
- Presentación ejecutiva
- Compartir rápido por WhatsApp

### Para CSV:
✅ Abrir con Excel, Google Sheets
✅ Editable y filtrable
✅ Importar a otros sistemas

### Para PDF:
✅ Imprimir directamente
✅ Compartir por email
✅ Archivo final no editable

### Para WhatsApp:
✅ Compartir con equipo
✅ Enviar a supervisores
✅ Backup rápido en chat

---

## 🎯 FLUJO DE TRABAJO RECOMENDADO

### Diario:
```
1. Login
2. Registrar Inspección → Cargar datos y fotos del día
3. Consultar Registros → Verificar que se guardó
```

### Semanal:
```
1. Reportes → Seleccionar semana
2. Descargar PDF Resumido
3. Compartir por WhatsApp con equipo
```

### Mensual:
```
1. Reportes → Seleccionar mes completo
2. Descargar CSV Detallado → Guardar backup
3. Descargar PDF Detallado → Presentación
```

---

## 🚨 SOLUCIÓN DE PROBLEMAS

### No puedo iniciar sesión
```
✅ Verificar usuario y contraseña
✅ Probar con: admin / admin2025
✅ Limpiar caché del navegador (Ctrl+Shift+R)
```

### No aparecen cuentas para registrar
```
✅ Verificar que haya registros en base de datos
✅ Confirmar que eres supervisor asignado
✅ Usuario "prueba" ve todas las cuentas
```

### No se generan reportes
```
✅ Primero hacer clic en "Buscar"
✅ Verificar que haya datos en el periodo
✅ Revisar fechas seleccionadas
```

### No se descargan archivos
```
✅ Permitir descargas en navegador
✅ Verificar que generaste reporte primero
✅ Probar con otro navegador
```

### WhatsApp no se abre
```
✅ Tener WhatsApp instalado (móvil) o WhatsApp Web (PC)
✅ Permitir pop-ups en navegador
✅ Verificar conexión a internet
```

---

## 📊 ESTRUCTURA DE REPORTES

### CSV Detallado incluye:
```
✅ Fecha Carga           ✅ Distrito              ✅ Observaciones
✅ Cuenta Contrato       ✅ Dirección             ✅ Inspector
✅ Instalación           ✅ Teléfono              ✅ Ubicación
✅ Cliente DNI           ✅ Turno                 ✅ Empresa Instaladora
... y 20 campos más
```

### PDF Detallado muestra:
```
✅ Cabecera con logo DONET
✅ Fecha y usuario generador
✅ Total de registros
✅ Tabla profesional con:
   - Fecha, Cuenta, Distrito
   - Dirección, Inspector
   - Turno, Empresa
```

### Resumido agrupa por:
```
✅ Turno / Área
✅ Totales por categoría
✅ Gran total general
```

---

## 🎨 CARACTERÍSTICAS VISUALES

### Colores de Botones:
- **Cyan (#00d4ff)**: Botones principales (Buscar, Entrar)
- **Verde**: Descarga CSV
- **Rojo**: Descarga PDF
- **Verde WhatsApp**: Compartir
- **Gris**: Botones secundarios (Volver, Limpiar)

### Iconos:
- 📅 Mes completo
- 📆 Rango personalizado
- 🔍 Buscar
- 📥 Descargar
- 💬 WhatsApp
- 📝 Registrar
- 🔍 Consultar
- 📤 Carga masiva
- 📊 Reportes

---

## ⌨️ ATAJOS DE TECLADO

```
Enter      →  Enviar formulario de login
Esc        →  Cerrar modales
Ctrl+R     →  Recargar página
Ctrl+Shift+R  →  Recargar sin caché
```

---

## 📱 USO EN MÓVIL

### Recomendaciones:
1. Usar en orientación **vertical** para menús
2. Usar en orientación **horizontal** para tablas
3. Hacer **zoom** en PDFs si es necesario
4. Las fotos se pueden **ampliar** con un clic

### Mejor Experiencia:
- ✅ Chrome en Android
- ✅ Safari en iOS
- ✅ Conexión WiFi para cargar fotos
- ✅ Pantalla mínimo 5 pulgadas

---

## 🔒 SEGURIDAD Y PRIVACIDAD

### Datos Visibles:
- **Admin**: Ve todos los registros
- **Prueba**: Ve todos los registros (máx 5 dispositivos)
- **Supervisores**: Solo ven sus propios registros

### Al Compartir:
- ⚠️ WhatsApp comparte datos del reporte
- ⚠️ Verificar destinatario antes de enviar
- ⚠️ Los archivos descargados quedan en tu dispositivo

---

## ✅ CHECKLIST DIARIO

```
□ Iniciar sesión
□ Registrar inspecciones del día
□ Cargar fotografías de evidencia
□ Completar observaciones
□ Verificar que se guardaron
□ (Opcional) Generar reporte del día
□ Cerrar sesión al terminar
```

---

## 📞 CONTACTO Y SOPORTE

Para dudas técnicas:
- Consultar [MEJORAS_REALIZADAS.md](MEJORAS_REALIZADAS.md) (técnico)
- Consultar [RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md) (general)

Para problemas con base de datos:
- Consultar [INSTRUCCIONES_BD.md](INSTRUCCIONES_BD.md)

---

**Versión del Sistema:** 1.1.0
**Última actualización:** 2025-01-29

---

## 🎓 VIDEO TUTORIAL (Próximamente)

Se recomienda grabar un video tutorial mostrando:
1. Login al sistema
2. Navegación del menú
3. Registro de inspección
4. Generación de reportes
5. Descarga de archivos
6. Compartir por WhatsApp

Duración sugerida: 5-10 minutos

---

**¡Listo para usar el Sistema DONET! 🚀**
