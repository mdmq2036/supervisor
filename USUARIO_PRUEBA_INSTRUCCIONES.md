# 🔐 USUARIO DE PRUEBA - Sistema DONET

## 📋 Información del Usuario

**Usuario:** `prueba`
**Contraseña:** `prueba2025`

---

## ✅ CARACTERÍSTICAS ESPECIALES

### 1. **Acceso Total** 📊
- ✅ Puede ver **TODOS** los registros de **TODOS** los supervisores
- ✅ Puede ver **TODAS** las cuentas contrato del sistema
- ✅ Puede registrar inspecciones en cualquier contrato
- ✅ Puede modificar registros existentes

### 2. **Límite de Logins por Dispositivo** 🔒
- ⚠️ **Máximo 5 logins por dispositivo**
- 🖥️ El sistema identifica el dispositivo mediante "fingerprint"
- 📱 Cada dispositivo (PC, móvil, tablet) tiene su propio contador
- 🚫 Después del 5to login, el dispositivo **se bloquea permanentemente**

### 3. **Sistema de Fingerprinting** 🔍

El sistema identifica un dispositivo único basándose en:

- Navegador y versión
- Sistema operativo
- Resolución de pantalla
- Zona horaria
- Plugins instalados
- Canvas fingerprinting
- WebGL fingerprinting
- Fuentes del sistema

**Importante:**
- Mismo PC + Mismo navegador = Mismo dispositivo
- Mismo PC + Diferente navegador = Dispositivo diferente
- Modo incógnito puede generar fingerprint diferente
- Limpiar caché NO cambia el fingerprint

---

## 🎯 CÓMO FUNCIONA

### **Primer Login:**
1. Usuario ingresa: `prueba` / `prueba2025`
2. Sistema genera fingerprint del dispositivo
3. Crea registro en BD con contador = 1
4. **Alerta:** "Quedan 4 logins disponibles"

### **Logins 2-3:**
- Contador incrementa
- Sistema funciona normal
- Sin alertas especiales

### **Login 4:**
- Contador = 4
- **Alerta:** "⚠️ ADVERTENCIA: Te quedan solo 1 login(s) disponibles en este dispositivo"

### **Login 5:**
- Contador = 5
- **Alerta:** "⚠️ ADVERTENCIA: Este fue tu último login disponible en este dispositivo. El dispositivo será bloqueado en el próximo intento"
- Sistema marca dispositivo como bloqueado

### **Intento 6:**
- 🚫 **BLOQUEADO**
- Mensaje: "Este dispositivo ha sido bloqueado después de 5 intentos de login"
- No puede volver a ingresar desde ese dispositivo

---

## 📱 EJEMPLOS DE USO

### **Escenario 1: Usuario con PC y Móvil**

**PC de escritorio (Chrome):**
- Login 1: ✅ OK (quedan 4)
- Login 2: ✅ OK (quedan 3)
- Login 3: ✅ OK (quedan 2)
- Login 4: ✅ OK (quedan 1)
- Login 5: ✅ OK (bloqueado)
- Login 6: ❌ BLOQUEADO

**Móvil (Safari):**
- Login 1: ✅ OK (quedan 4)
- Login 2: ✅ OK (quedan 3)
- ... puede hacer 5 logins más

**Total disponible:** 5 logins en PC + 5 logins en móvil = **10 logins**

### **Escenario 2: Múltiples Navegadores**

**Mismo PC:**
- Chrome: 5 logins ✅
- Firefox: 5 logins ✅
- Edge: 5 logins ✅
- Safari: 5 logins ✅

**Total disponible:** **20 logins** (5 por navegador)

---

## 🛡️ PERMISOS DEL USUARIO PRUEBA

### **✅ Puede:**
- Ver todos los contratos del sistema
- Ver todos los registros de todos los supervisores
- Registrar nuevas inspecciones
- Subir 5 fotos por inspección
- Agregar observaciones
- Modificar registros existentes
- Consultar registros con filtros

### **❌ NO Puede:**
- Hacer login ilimitado en un mismo dispositivo
- Cargar Excel masivo (solo admin)
- Crear otros usuarios
- Modificar configuración del sistema

---

## 💻 DIFERENCIAS CON OTROS USUARIOS

| Característica | Supervisores Normales | Usuario `prueba` |
|----------------|----------------------|------------------|
| **Registros visibles** | Solo los suyos | Todos |
| **Cuentas contrato** | Solo asignadas | Todas |
| **Límite de logins** | ❌ Ilimitados | ✅ 5 por dispositivo |
| **Tracking** | ❌ No | ✅ Sí |
| **Bloqueo** | ❌ No | ✅ Sí |

---

## 🔧 ADMINISTRACIÓN (Solo Admin)

### **Consultar Dispositivos Registrados:**

```sql
-- Ver todos los dispositivos del usuario prueba
SELECT
    device_fingerprint,
    login_count,
    blocked,
    first_login,
    last_login,
    user_agent
FROM device_tracking
WHERE usuario = 'prueba'
ORDER BY last_login DESC;
```

### **Resetear un Dispositivo:**

```sql
-- Desbloquear un dispositivo específico
UPDATE device_tracking
SET login_count = 0, blocked = false
WHERE usuario = 'prueba' AND device_fingerprint = 'FINGERPRINT_AQUI';
```

### **Resetear TODOS los Dispositivos:**

```sql
-- Resetear todos los dispositivos de prueba
UPDATE device_tracking
SET login_count = 0, blocked = false
WHERE usuario = 'prueba';
```

### **Eliminar Todos los Registros:**

```sql
-- RESET COMPLETO (eliminar historial)
DELETE FROM device_tracking WHERE usuario = 'prueba';
```

### **Ver Estadísticas:**

```sql
SELECT
    COUNT(*) as total_dispositivos,
    SUM(CASE WHEN blocked THEN 1 ELSE 0 END) as bloqueados,
    SUM(CASE WHEN NOT blocked THEN 1 ELSE 0 END) as activos,
    SUM(login_count) as total_logins
FROM device_tracking
WHERE usuario = 'prueba';
```

---

## 🚀 INSTRUCCIONES DE CONFIGURACIÓN

### **PASO 1: Ejecutar SQL en Supabase**

```sql
-- Ejecutar el archivo CREAR_USUARIO_PRUEBA.sql
-- Este script crea:
-- 1. Tabla device_tracking
-- 2. Índices
-- 3. Usuario "prueba" en tabla supervisores
```

URL: https://supabase.com/dashboard/project/bvqmaaxtaetebjsgdphj/sql/new

### **PASO 2: Archivos del Frontend**

✅ Ya están en GitHub:
- `device-fingerprint.js` - Sistema de fingerprinting
- `app.js` - Modificado con lógica de tracking
- `index.html` - Incluye script de fingerprinting

### **PASO 3: Probar el Sistema**

1. Ir a: https://supervisor-ohtd.onrender.com
2. Login: `prueba` / `prueba2025`
3. ✅ Debe mostrar TODAS las cuentas contrato
4. ✅ Debe mostrar TODOS los registros
5. ✅ Debe mostrar alerta con logins restantes
6. Hacer logout y volver a hacer login 4 veces más
7. Al 6to intento: **BLOQUEADO**

---

## 📊 FLUJO COMPLETO

```
┌─────────────┐
│  Login #1   │ → Fingerprint generado → Registro en BD (count=1)
└─────────────┘                         ↓
                                  "Quedan 4 logins"
                                        ↓
┌─────────────┐                         ↓
│  Login #2   │ → Actualiza contador → count=2
└─────────────┘                         ↓
                                  "Quedan 3 logins"
                                        ↓
┌─────────────┐                         ↓
│  Login #3   │ → Actualiza contador → count=3
└─────────────┘                         ↓
                                  "Quedan 2 logins"
                                        ↓
┌─────────────┐                         ↓
│  Login #4   │ → Actualiza contador → count=4
└─────────────┘                         ↓
                           ⚠️ "ADVERTENCIA: Quedan 1 login"
                                        ↓
┌─────────────┐                         ↓
│  Login #5   │ → Actualiza contador → count=5, blocked=true
└─────────────┘                         ↓
                           ⚠️ "Este fue tu último login"
                                        ↓
┌─────────────┐                         ↓
│  Login #6   │ → Verificación → blocked=true
└─────────────┘                         ↓
                            🚫 "DISPOSITIVO BLOQUEADO"
```

---

## ⚙️ CONFIGURACIÓN TÉCNICA

### **Tabla device_tracking:**

```sql
CREATE TABLE device_tracking (
    id BIGSERIAL PRIMARY KEY,
    usuario VARCHAR(50) NOT NULL,
    device_fingerprint TEXT NOT NULL,
    login_count INTEGER DEFAULT 0,
    blocked BOOLEAN DEFAULT false,
    first_login TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP DEFAULT NOW(),
    user_agent TEXT,
    ip_address TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(usuario, device_fingerprint)
);
```

### **Índices:**

```sql
CREATE INDEX idx_device_tracking_usuario ON device_tracking(usuario);
CREATE INDEX idx_device_tracking_fingerprint ON device_tracking(device_fingerprint);
CREATE INDEX idx_device_tracking_blocked ON device_tracking(blocked);
```

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### **Problema: Bloqueado antes de 5 logins**
**Causa:** Fingerprint cambió (cambio de navegador, modo incógnito)
**Solución:** Cada fingerprint tiene su propio contador de 5

### **Problema: Necesito más logins**
**Solución 1:** Usar otro navegador (5 logins más)
**Solución 2:** Usar otro dispositivo (5 logins más)
**Solución 3:** Admin ejecuta SQL de reset

### **Problema: No ve todos los registros**
**Verificar:**
1. Usuario es exactamente "prueba" (case-sensitive)
2. SQL de usuario prueba ejecutado en Supabase
3. Logout y volver a hacer login

---

## 📝 NOTAS IMPORTANTES

1. **Security by Design:**
   - El fingerprint es SHA-256 hash
   - No se puede revertir
   - Cada componente suma a la unicidad

2. **Privacidad:**
   - No se almacena IP real
   - No se tracking de ubicación
   - Solo datos técnicos del navegador

3. **Limitaciones:**
   - VPN puede generar nuevo fingerprint
   - Actualización de navegador puede cambiar fingerprint
   - Extensiones del navegador afectan fingerprint

4. **Recomendaciones:**
   - Usar siempre el mismo navegador
   - No usar modo incógnito
   - No cambiar resolución de pantalla

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] SQL ejecutado en Supabase
- [ ] Tabla device_tracking creada
- [ ] Usuario "prueba" creado
- [ ] Frontend actualizado en GitHub
- [ ] Render desplegó cambios
- [ ] Probado login exitoso
- [ ] Probado bloqueo al 6to intento
- [ ] Verificado que ve todos los registros
- [ ] Verificado alertas de logins restantes

---

**© 2025 DONET - Sistema de Gestión de Inspecciones**
**Usuario de Prueba con Tracking Avanzado**
