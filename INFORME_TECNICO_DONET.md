# 📘 INFORME TÉCNICO DEL SISTEMA DE GESTIÓN "DONET"

**Fecha:** 30 de Noviembre, 2025  
**Versión del Sistema:** 1.0  
**Cliente:** DONET  
**Tipo de Aplicación:** Web App Progresiva (PWA) / Sistema de Gestión Empresarial

---

## 1. 🎯 RESUMEN EJECUTIVO

El sistema **DONET** es una aplicación web diseñada para la gestión integral de inspecciones de campo, control de personal y administración de activos. La plataforma permite a los supervisores registrar inspecciones con evidencia fotográfica, realizar cargas masivas de datos y consultar históricos, todo bajo un entorno seguro con control de acceso por roles y dispositivos.

El sistema se destaca por su interfaz moderna "Dark Mode" con efectos de neón (Glow UI), optimizada para dispositivos móviles (Mobile First) y escritorio.

---

## 2. 🏗️ ARQUITECTURA Y TECNOLOGÍAS

El sistema está construido sobre una arquitectura **Serverless** moderna, garantizando alta disponibilidad, escalabilidad y bajo costo de mantenimiento.

### **2.1 Frontend (Interfaz de Usuario)**
*   **Tecnologías:** HTML5, CSS3 (Vanilla con Variables CSS), JavaScript (ES6+).
*   **Diseño:** Responsive Design (adaptable a Móvil, Tablet y PC).
*   **Estilo Visual:** "Cyberpunk/Futuristic Dark UI" con efectos de desenfoque (backdrop-filter) y gradientes dinámicos.
*   **Librerías Clave:**
    *   `SheetJS (xlsx)`: Para procesamiento de archivos Excel en el navegador.
    *   `Supabase Client`: Para comunicación en tiempo real con la base de datos.
    *   `Device Fingerprint`: Para identificación única de dispositivos.

### **2.2 Backend & Base de Datos**
*   **Plataforma:** **Supabase** (Backend-as-a-Service).
*   **Base de Datos:** PostgreSQL 15+.
*   **Lógica de Negocio:**
    *   Funciones PostgreSQL (PL/pgSQL) para lógica compleja en base de datos.
    *   Triggers para automatización de estados.
    *   Políticas RLS (Row Level Security) para seguridad de datos.

### **2.3 Infraestructura y Despliegue**
*   **Hosting Frontend:** Render.com (Static Site Hosting).
*   **Control de Versiones:** Git / GitHub.
*   **Almacenamiento:** Supabase Storage (para fotografías de inspecciones).

---

## 3. 📦 MÓDULOS Y FUNCIONALIDADES

### **3.1 Módulo de Autenticación y Seguridad 🔐**
*   **Login Seguro:** Autenticación mediante credenciales encriptadas (bcrypt).
*   **Control de Dispositivos:**
    *   Sistema de "Huella Digital" (Fingerprint) para identificar dispositivos únicos.
    *   **Limitación de Accesos:** El usuario `prueba` tiene un límite estricto de 5 dispositivos únicos. Al intentar acceder desde un 6to dispositivo, el sistema bloquea el acceso automáticamente.
*   **Gestión de Roles:**
    *   `Admin`: Acceso total, panel de administración, carga masiva.
    *   `Inspector`: Registro de inspecciones y consultas básicas.

### **3.2 Módulo de Inspecciones 📝**
*   **Formulario Dinámico:** Registro de inspecciones asociado a "Cuentas Contrato".
*   **Evidencia Fotográfica:**
    *   Captura directa desde cámara o galería.
    *   Previsualización inmediata de imágenes.
    *   Compresión y subida optimizada a la nube.
*   **Validación:** Verificación de campos obligatorios y formatos de fecha.

### **3.3 Módulo de Carga Masiva 📤**
*   **Acceso Restringido:** Protegido con doble autenticación (requiere credenciales de administrador).
*   **Procesamiento Excel:** Importación de datos desde archivos `.xlsx`.
*   **Validación de Datos:** Verificación de estructura y tipos de datos antes de la inserción en base de datos.

### **3.4 Módulo de Consultas y Reportes 🔍**
*   **Filtros Avanzados:** Búsqueda por rango de fechas, cuenta contrato o supervisor.
*   **Visualización:** Tarjetas de resultados con detalles y galería de fotos.
*   **Histórico:** Acceso a registros pasados para auditoría.

### **3.5 Panel de Administración 🛡️**
*   **Dashboard:** Estadísticas en tiempo real (Usuarios activos, dispositivos bloqueados, total de inspecciones).
*   **Gestión de Usuarios:** Alta, baja y modificación de usuarios.
*   **Control de Dispositivos:**
    *   Ver dispositivos vinculados a cada usuario.
    *   Bloquear/Desbloquear dispositivos específicos remotamente.
    *   Resetear contadores de acceso.

---

## 4. 🗃️ ESTRUCTURA DE DATOS (MODELO E-R)

### **Tabla: `usuarios`**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL | Identificador único |
| `username` | VARCHAR | Nombre de usuario (login) |
| `password` | TEXT | Hash de contraseña (bcrypt) |
| `rol` | VARCHAR | 'admin' o 'inspector' |
| `activo` | BOOLEAN | Estado del usuario |

### **Tabla: `inspecciones`**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL | Identificador único |
| `supervisor_id` | INTEGER | FK a tabla usuarios/supervisores |
| `cuenta_contrato` | VARCHAR | Número de cuenta inspeccionada |
| `fecha` | DATE | Fecha de inspección |
| `observaciones` | TEXT | Notas del inspector |
| `fotos` | JSONB | Array de URLs de fotos |

### **Tabla: `device_access_control`**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `user_id` | INTEGER | FK a tabla usuarios |
| `device_fingerprint` | TEXT | Hash único del dispositivo |
| `access_count` | INTEGER | Contador de logins |
| `is_blocked` | BOOLEAN | Estado de bloqueo del dispositivo |

---

## 5. 🔒 PROTOCOLOS DE SEGURIDAD

1.  **Encriptación:** Todas las contraseñas se almacenan hasheadas (no texto plano).
2.  **HTTPS:** Comunicación encriptada SSL/TLS obligatoria.
3.  **Protección contra Fuerza Bruta:** Bloqueo de dispositivos y usuarios tras intentos fallidos o comportamiento anómalo.
4.  **Validación de Frontend y Backend:** Doble capa de validación de datos para prevenir inyecciones SQL y XSS.

---

## 6. ✅ CONCLUSIÓN

El sistema **DONET** representa una solución robusta y moderna para la gestión operativa. Su arquitectura desacoplada permite escalar fácilmente, mientras que su enfoque en la experiencia de usuario (UX) y seguridad garantiza una adopción rápida por parte del personal y la integridad de los datos corporativos.

---
**Elaborado por:** Equipo de Desarrollo DONET  
**Herramientas:** VS Code, Git, Supabase, Render.
