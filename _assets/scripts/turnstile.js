// Usar configuración desde turnstile-config.js

class TurnstileHandler {
    constructor() {
        this.token = null;
        this.captchaPassToken = null;
        this.widgetId = null;
        this.submitBtn = document.getElementById('submitBtn') || null;
        this.messageContainer = document.getElementById('messageContainer') || null;
        
        this.init();
    }

    init() {
        // Esperar a que Turnstile esté listo
        if (typeof turnstile !== 'undefined') {
            this.renderWidget();
        } else {
            window.addEventListener('load', () => {
                setTimeout(() => this.renderWidget(), 1000);
            });
        }
    }

    renderWidget() {
        const widget = document.querySelector('.cf-turnstile');
        if (widget && typeof turnstile !== 'undefined') {
            // Limpiar cualquier widget existente
            widget.innerHTML = '';
            
            this.widgetId = turnstile.render('.cf-turnstile', {
                sitekey: TURNSTILE_CONFIG.siteKey,
                callback: (token) => this.onSuccess(token),
                'error-callback': () => this.onError(),
                'expired-callback': () => this.onExpired()
            });
        }
    }

    onSuccess(token) {
        this.token = token;
        if (this.submitBtn) this.submitBtn.disabled = false;
        this.showMessage('CAPTCHA verificado correctamente', 'success');
        console.log('Turnstile token generado:', token.substring(0, 20) + '...');
        // Intercambiar automáticamente por captcha pass
        this.exchangeForCaptchaPass().catch(() => {
            this.showMessage('No se pudo obtener el pase de captcha. Intenta de nuevo.', 'error');
        });
    }

    onError() {
        this.token = null;
        if (this.submitBtn) this.submitBtn.disabled = true;
        this.showMessage('Error al cargar el CAPTCHA. Recarga la página.', 'error');
        console.error('Error en Turnstile');
    }

    onExpired() {
        this.token = null;
        if (this.submitBtn) this.submitBtn.disabled = true;
        this.showMessage('El CAPTCHA ha expirado. Complétalo nuevamente.', 'warning');
        console.warn('Token de Turnstile expirado');
    }

    getToken() {
        return this.token;
    }

    getCaptchaPassToken() {
        return this.captchaPassToken || localStorage.getItem('captchaPassToken') || null;
    }

    async ensureCaptchaPass(maxWaitMs = (window.TURNSTILE_CONFIG?.timeout || 30000)) {
        // If we already have a pass, return it
        const existing = this.getCaptchaPassToken();
        if (existing) return existing;

        const start = Date.now();
        let exchanged = false;
        while (Date.now() - start < maxWaitMs) {
            // Try to read token from widget if not set yet
            if (!this.token && typeof turnstile !== 'undefined' && this.widgetId !== null) {
                try {
                    const resp = turnstile.getResponse(this.widgetId);
                    if (resp) {
                        this.token = resp;
                    }
                } catch (_) {}
            }

            if (this.token && !exchanged) {
                try {
                    await this.exchangeForCaptchaPass();
                    const pass = this.getCaptchaPassToken();
                    if (pass) return pass;
                    exchanged = true; // avoid hammering
                } catch (_) {
                    // will retry until timeout
                }
            }

            await new Promise(r => setTimeout(r, 200));
            const pass = this.getCaptchaPassToken();
            if (pass) return pass;
        }
        throw new Error('Completa el CAPTCHA para continuar');
    }

    async exchangeForCaptchaPass() {
        if (!this.token) {
            if (typeof turnstile !== 'undefined' && this.widgetId !== null) {
                try {
                    const resp = turnstile.getResponse(this.widgetId);
                    if (resp) {
                        this.token = resp;
                    }
                } catch (_) {}
            }
            if (!this.token) return null;
        }
        try {
            const response = await fetch(TURNSTILE_CONFIG.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ captchaToken: this.token, action: 'static_site', timestamp: Date.now() })
            });
            const result = await response.json();
            if (response.ok && result.success && result.captchaPassToken) {
                this.captchaPassToken = result.captchaPassToken;
                localStorage.setItem('captchaPassToken', this.captchaPassToken);
                this.showMessage('Pase de captcha obtenido', 'success');
                return this.captchaPassToken;
            } else {
                this.captchaPassToken = null;
                localStorage.removeItem('captchaPassToken');
                throw new Error(result.message || 'Intercambio de captcha fallido');
            }
        } catch (e) {
            console.error('Error intercambiando pase captcha:', e);
            this.captchaPassToken = null;
            localStorage.removeItem('captchaPassToken');
            throw e;
        }
    }

    reset() {
        if (this.widgetId !== null && typeof turnstile !== 'undefined') {
            turnstile.reset(this.widgetId);
        }
        this.token = null;
        this.captchaPassToken = null;
        if (this.submitBtn) this.submitBtn.disabled = true;
    }

    showMessage(message, type) {
        if (!this.messageContainer) {
            console[type === 'error' ? 'error' : 'log'](message);
            return;
        }
        this.messageContainer.innerHTML = `<div class="message ${type}">${message}</div>`;
        setTimeout(() => {
            this.messageContainer.innerHTML = '';
        }, 5000);
    }
}

// Callbacks globales (requeridos por Turnstile)
let turnstileHandler;

function onTurnstileSuccess(token) {
    if (turnstileHandler) {
        turnstileHandler.onSuccess(token);
    }
}

function onTurnstileError() {
    if (turnstileHandler) {
        turnstileHandler.onError();
    }
}

function onTurnstileExpired() {
    if (turnstileHandler) {
        turnstileHandler.onExpired();
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    turnstileHandler = new TurnstileHandler();
});

// Helper reutilizable para llamadas a API con pase de captcha
async function fetchWithCaptcha(input, init = {}) {
    if (window.turnstileHandler) {
        try { await window.turnstileHandler.ensureCaptchaPass(); } catch (_) {}
    }
    const captchaPassToken = turnstileHandler?.getCaptchaPassToken() || localStorage.getItem('captchaPassToken');
    const headers = new Headers(init.headers || {});
    if (captchaPassToken) {
        headers.set('X-Captcha-Token', captchaPassToken);
    }
    return fetch(input, { ...init, headers });
}