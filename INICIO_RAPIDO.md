# ⚡ INICIO RÁPIDO - Sistema DONET

## 🎯 En 3 Pasos

### PASO 1: Configurar Base de Datos (5 min)

1. **Ir a Supabase**
   - [https://supabase.com](https://supabase.com)
   - Crear cuenta (gratis)
   - Crear nuevo proyecto

2. **Ejecutar Script SQL**
   - SQL Editor → New query
   - Abrir `SCRIPT_POSTGRESQL.sql`
   - Copiar TODO
   - Pegar en Supabase
   - Click en "Run" ▶️

3. **Obtener Credenciales**
   - Settings → API
   - Copiar "Project URL"
   - Copiar "anon public key"
   - Pegar en `config.js` (líneas 4-5)

### PASO 2: Preparar Aplicación (2 min)

1. **Logo**
   - Guardar logo DONET como `logo-donet.png`
   - En la misma carpeta que index.html

2. **Credenciales**
   ```javascript
   // Editar config.js
   const SUPABASE_CONFIG = {
       url: 'https://xxxxx.supabase.co',  // Tu URL
       anonKey: 'eyJ...'                   // Tu key
   };
   ```

### PASO 3: ¡Usar! (1 min)

1. **Abrir aplicación**
   - Doble click en `index.html`
   - O usar Live Server en VS Code

2. **Login**
   ```
   Usuario: admin
   Contraseña: admin123
   ```

3. **¡Listo!**
   - Cargar Excel → Menú → Carga Masiva
   - Registrar fotos → Menú → Registrar Inspección
   - Consultar datos → Menú → Consultar Registros

---

## 📁 Archivos del Proyecto

### Aplicación Web
```
index.html          ← Aplicación principal
styles.css          ← Estilos DONET
app.js              ← Lógica principal
config.js           ← ⚠️ CONFIGURAR AQUÍ
```

### Carga Masiva (NUEVO)
```
carga-masiva.html   ← Interfaz de carga
carga-masiva.js     ← Procesamiento Excel
```

### Base de Datos
```
SCRIPT_POSTGRESQL.sql  ← ⚠️ EJECUTAR EN SUPABASE
CONSULTAS_UTILES.sql   ← Consultas listas para usar
```

### Documentación
```
README.md                   ← Visión general
INSTRUCCIONES.md            ← Instalación detallada
GUIA_CARGA_MASIVA.md       ← Cómo usar carga masiva
INSTRUCCIONES_DBEAVER.md   ← Uso con DBeaver
RESUMEN_PROYECTO.md        ← Resumen completo
INICIO_RAPIDO.md           ← Este archivo
```

---

## 🚀 Carga Masiva Diaria

### Flujo Rápido
```
1. Recibir Excel del día
2. Abrir DONET
3. Login
4. Menú → Carga Masiva
5. Arrastrar archivo Excel
6. Click "Procesar"
7. Verificar resultados
8. ¡Listo! (2 minutos)
```

### Requisitos del Excel

**Campo OBLIGATORIO:**
- ✅ `Cuenta contrato` (no puede estar vacío)

**Campos opcionales:** (todos los demás)
- Instalación
- CLIENTE - DNI
- Dirección
- DISTRITO
- Etc. (27+ campos total)

### Validaciones Automáticas

El sistema automáticamente:
- ✅ Detecta duplicados (misma cuenta + día)
- ✅ Extrae coordenadas de UBICACIÓN
- ✅ Valida datos
- ✅ Genera reporte de errores
- ✅ Guarda historial

---

## 🔍 Uso Diario

### Mañana: Cargar Datos
```
Menú Principal
└── Carga Masiva
    ├── Arrastrar Excel
    ├── Procesar
    └── Verificar estadísticas
```

### Día: Agregar Fotos
```
Menú Principal
└── Registrar Inspección
    ├── Buscar por cuenta contrato
    ├── Subir 5 fotos
    ├── Completar observaciones
    └── Guardar
```

### Tarde: Consultar
```
Menú Principal
└── Consultar Registros
    ├── Filtrar por fecha/cuenta
    ├── Ver datos y fotos
    └── Exportar si es necesario
```

---

## 📊 Base de Datos

### Tablas Creadas

**`supervisores`** - Usuarios del sistema
```sql
SELECT * FROM supervisores;
```

**`inspecciones`** - Datos principales (27+ campos)
```sql
SELECT * FROM inspecciones
WHERE fecha_carga = CURRENT_DATE;
```

**`historial_cargas`** - Auditoría de cargas
```sql
SELECT * FROM historial_cargas
ORDER BY fecha_carga DESC;
```

**`registros_duplicados`** - Control de duplicados
```sql
SELECT * FROM registros_duplicados
WHERE DATE(fecha_deteccion) = CURRENT_DATE;
```

### Consultas Útiles

**Ver registros de hoy:**
```sql
SELECT cuenta_contrato, distrito, nombre_dni_inspector
FROM inspecciones
WHERE fecha_carga = CURRENT_DATE;
```

**Contar por distrito:**
```sql
SELECT distrito, COUNT(*) as total
FROM inspecciones
WHERE fecha_carga = CURRENT_DATE
GROUP BY distrito;
```

**Ver últimas cargas:**
```sql
SELECT * FROM historial_cargas
ORDER BY fecha_carga DESC
LIMIT 5;
```

Más consultas en → [CONSULTAS_UTILES.sql](CONSULTAS_UTILES.sql)

---

## ⚠️ Problemas Comunes

### "Error al iniciar sesión"
```
✅ Verificar usuario: admin
✅ Verificar contraseña: admin123
✅ Verificar config.js tiene credenciales correctas
```

### "Excel no se carga"
```
✅ Verificar formato: .xlsx o .xls
✅ Verificar columna "Cuenta contrato" existe
✅ Verificar cuenta contrato no está vacía
```

### "No se conecta a Supabase"
```
✅ Verificar internet
✅ Verificar credenciales en config.js
✅ Verificar proyecto Supabase activo
```

### "Muchos duplicados"
```
✅ Normal si cargas mismo archivo 2 veces
✅ El sistema los ignora automáticamente
✅ No se vuelven a insertar
```

---

## 🎓 Aprender Más

### Para Usuarios
1. [GUIA_CARGA_MASIVA.md](GUIA_CARGA_MASIVA.md) - Guía completa de carga masiva
2. [INSTRUCCIONES.md](INSTRUCCIONES.md) - Instalación paso a paso

### Para Administradores
1. [SCRIPT_POSTGRESQL.sql](SCRIPT_POSTGRESQL.sql) - Estructura de BD
2. [CONSULTAS_UTILES.sql](CONSULTAS_UTILES.sql) - 40+ consultas SQL
3. [INSTRUCCIONES_DBEAVER.md](INSTRUCCIONES_DBEAVER.md) - Uso con DBeaver

### Para Desarrolladores
1. [README.md](README.md) - Documentación técnica
2. [RESUMEN_PROYECTO.md](RESUMEN_PROYECTO.md) - Arquitectura completa

---

## 📞 Ayuda Rápida

### Orden de Resolución
1. Consultar esta guía
2. Revisar archivo específico (ver arriba)
3. Revisar consola navegador (F12)
4. Descargar reporte de errores
5. Contactar soporte

### Archivos de Ayuda por Tema

| Tema | Archivo |
|------|---------|
| Instalación | INSTRUCCIONES.md |
| Carga Excel | GUIA_CARGA_MASIVA.md |
| Base de datos | SCRIPT_POSTGRESQL.sql |
| DBeaver | INSTRUCCIONES_DBEAVER.md |
| Consultas SQL | CONSULTAS_UTILES.sql |
| Arquitectura | RESUMEN_PROYECTO.md |
| Este resumen | INICIO_RAPIDO.md |

---

## ✅ Checklist de Implementación

### Configuración Inicial
- [ ] Crear cuenta Supabase
- [ ] Ejecutar SCRIPT_POSTGRESQL.sql
- [ ] Configurar config.js con credenciales
- [ ] Guardar logo como logo-donet.png
- [ ] Probar login (admin/admin123)

### Primera Carga
- [ ] Abrir carga-masiva.html
- [ ] Cargar Excel de prueba
- [ ] Verificar estadísticas
- [ ] Revisar datos en Supabase

### Verificación
- [ ] Consultar registros cargados
- [ ] Registrar inspección con fotos
- [ ] Ver fotos en consulta
- [ ] Descargar reporte (si hay errores)

### Producción
- [ ] Crear usuarios reales
- [ ] Cambiar contraseñas
- [ ] Desplegar en servidor (Netlify/Vercel)
- [ ] Capacitar usuarios
- [ ] Documentar proceso interno

---

## 🎉 ¡Empezar Ahora!

```bash
# 1. Configurar Supabase (web)
https://supabase.com

# 2. Editar credenciales
Abrir config.js → Pegar URL y Key

# 3. Abrir aplicación
Doble click en index.html

# 4. Login
Usuario: admin
Contraseña: admin123

# 5. Cargar datos
Menú → Carga Masiva → Arrastrar Excel
```

---

## 📈 Próximos Pasos

1. ✅ Configurar sistema (hoy)
2. ✅ Cargar datos de prueba (hoy)
3. ✅ Capacitar usuarios (mañana)
4. ✅ Carga masiva diaria (desde mañana)
5. ✅ Monitoreo semanal (desde próxima semana)

---

**Sistema:** DONET - Gestión de Inspecciones
**Versión:** 1.0
**Estado:** ✅ LISTO PARA PRODUCCIÓN
**Tiempo de setup:** ~10 minutos
**Tiempo de carga diaria:** ~2 minutos

**© 2025 DONET - Sistema de Gestión de Inspecciones**
