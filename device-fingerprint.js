// ========================================
// DEVICE FINGERPRINT & LOGIN TRACKING
// ========================================
// Genera un fingerprint único del dispositivo basado en:
// - Navegador y versión
// - Sistema operativo
// - Resolución de pantalla
// - Zona horaria
// - Canvas fingerprinting
// - WebGL fingerprinting
// ========================================

class DeviceFingerprint {
    constructor() {
        this.fingerprint = null;
    }

    // Generar fingerprint único del dispositivo
    async generate() {
        const components = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            colorDepth: screen.colorDepth,
            deviceMemory: navigator.deviceMemory || 'unknown',
            hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
            screenResolution: `${screen.width}x${screen.height}`,
            availableScreenResolution: `${screen.availWidth}x${screen.availHeight}`,
            timezoneOffset: new Date().getTimezoneOffset(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            sessionStorage: !!window.sessionStorage,
            localStorage: !!window.localStorage,
            indexedDb: !!window.indexedDB,
            addBehavior: !!document.body.addBehavior,
            openDatabase: !!window.openDatabase,
            cpuClass: navigator.cpuClass || 'unknown',
            platform: navigator.platform,
            doNotTrack: navigator.doNotTrack || 'unknown',
            plugins: this.getPlugins(),
            canvas: await this.getCanvasFingerprint(),
            webgl: this.getWebGLFingerprint(),
            fonts: await this.getFonts()
        };

        // Crear hash del fingerprint
        const fingerprint = await this.hashComponents(components);
        this.fingerprint = fingerprint;
        return fingerprint;
    }

    // Obtener plugins del navegador
    getPlugins() {
        const plugins = [];
        for (let i = 0; i < navigator.plugins.length; i++) {
            const plugin = navigator.plugins[i];
            plugins.push({
                name: plugin.name,
                description: plugin.description,
                filename: plugin.filename
            });
        }
        return plugins;
    }

    // Canvas fingerprinting
    async getCanvasFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const text = 'DONET-Fingerprint-2025';

            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.textBaseline = 'alphabetic';
            ctx.fillStyle = '#f60';
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = '#069';
            ctx.fillText(text, 2, 15);
            ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
            ctx.fillText(text, 4, 17);

            return canvas.toDataURL();
        } catch (e) {
            return 'canvas-not-supported';
        }
    }

    // WebGL fingerprinting
    getWebGLFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

            if (!gl) return 'webgl-not-supported';

            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            return {
                vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
                renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
            };
        } catch (e) {
            return 'webgl-error';
        }
    }

    // Detectar fuentes instaladas
    async getFonts() {
        const baseFonts = ['monospace', 'sans-serif', 'serif'];
        const testFonts = [
            'Arial', 'Verdana', 'Times New Roman', 'Courier New',
            'Georgia', 'Palatino', 'Garamond', 'Comic Sans MS',
            'Trebuchet MS', 'Impact'
        ];

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const text = 'mmmmmmmmmmlli';

        context.font = '72px monospace';
        const baseWidth = context.measureText(text).width;

        const detectedFonts = [];
        for (const font of testFonts) {
            context.font = `72px ${font}, monospace`;
            const width = context.measureText(text).width;
            if (width !== baseWidth) {
                detectedFonts.push(font);
            }
        }

        return detectedFonts;
    }

    // Hash de componentes usando SHA-256
    async hashComponents(components) {
        const string = JSON.stringify(components);
        const buffer = new TextEncoder().encode(string);
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    // Obtener fingerprint (generar si no existe)
    async get() {
        if (!this.fingerprint) {
            await this.generate();
        }
        return this.fingerprint;
    }
}

// Clase para manejar el tracking de login
class LoginTracker {
    constructor(supabase) {
        this.supabase = supabase;
        this.fingerprinter = new DeviceFingerprint();
    }

    // Verificar si el dispositivo puede hacer login
    async canLogin(usuario) {
        const fingerprint = await this.fingerprinter.get();

        try {
            // Buscar registro del dispositivo
            const { data, error } = await this.supabase
                .from('device_tracking')
                .select('*')
                .eq('usuario', usuario)
                .eq('device_fingerprint', fingerprint)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error al verificar dispositivo:', error);
                return { allowed: false, message: 'Error al verificar dispositivo' };
            }

            // Si no existe registro, crear uno nuevo
            if (!data) {
                return {
                    allowed: true,
                    isNew: true,
                    remaining: 5,
                    message: 'Dispositivo nuevo registrado'
                };
            }

            // Verificar si está bloqueado
            if (data.blocked) {
                return {
                    allowed: false,
                    loginCount: data.login_count,
                    message: `Este dispositivo ha sido bloqueado después de ${data.login_count} intentos de login`
                };
            }

            // Verificar límite de logins
            if (data.login_count >= 5) {
                // Bloquear el dispositivo
                await this.supabase
                    .from('device_tracking')
                    .update({ blocked: true })
                    .eq('usuario', usuario)
                    .eq('device_fingerprint', fingerprint);

                return {
                    allowed: false,
                    loginCount: data.login_count,
                    message: 'Límite de 5 logins alcanzado. Dispositivo bloqueado.'
                };
            }

            return {
                allowed: true,
                loginCount: data.login_count,
                remaining: 5 - data.login_count,
                message: `Login permitido. Quedan ${5 - data.login_count} intentos`
            };

        } catch (error) {
            console.error('Error en canLogin:', error);
            return { allowed: false, message: 'Error al verificar dispositivo' };
        }
    }

    // Registrar un login exitoso
    async recordLogin(usuario) {
        const fingerprint = await this.fingerprinter.get();
        const userAgent = navigator.userAgent;

        try {
            // Intentar buscar registro existente
            const { data: existing } = await this.supabase
                .from('device_tracking')
                .select('*')
                .eq('usuario', usuario)
                .eq('device_fingerprint', fingerprint)
                .single();

            if (existing) {
                // Actualizar contador
                const newCount = existing.login_count + 1;
                const shouldBlock = newCount >= 5;

                const { error } = await this.supabase
                    .from('device_tracking')
                    .update({
                        login_count: newCount,
                        blocked: shouldBlock,
                        last_login: new Date().toISOString(),
                        user_agent: userAgent
                    })
                    .eq('usuario', usuario)
                    .eq('device_fingerprint', fingerprint);

                if (error) {
                    console.error('Error al actualizar tracking:', error);
                }

                return {
                    success: true,
                    loginCount: newCount,
                    remaining: 5 - newCount,
                    blocked: shouldBlock
                };
            } else {
                // Crear nuevo registro
                const { error } = await this.supabase
                    .from('device_tracking')
                    .insert({
                        usuario: usuario,
                        device_fingerprint: fingerprint,
                        login_count: 1,
                        blocked: false,
                        user_agent: userAgent,
                        first_login: new Date().toISOString(),
                        last_login: new Date().toISOString()
                    });

                if (error) {
                    console.error('Error al crear tracking:', error);
                }

                return {
                    success: true,
                    loginCount: 1,
                    remaining: 4,
                    blocked: false
                };
            }
        } catch (error) {
            console.error('Error en recordLogin:', error);
            return { success: false, message: 'Error al registrar login' };
        }
    }

    // Obtener información del dispositivo actual
    async getDeviceInfo(usuario) {
        const fingerprint = await this.fingerprinter.get();

        try {
            const { data, error } = await this.supabase
                .from('device_tracking')
                .select('*')
                .eq('usuario', usuario)
                .eq('device_fingerprint', fingerprint)
                .single();

            if (error) {
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error al obtener info del dispositivo:', error);
            return null;
        }
    }
}

// Exportar para uso global
window.DeviceFingerprint = DeviceFingerprint;
window.LoginTracker = LoginTracker;
