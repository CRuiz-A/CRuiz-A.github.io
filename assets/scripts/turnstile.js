// Usar configuración desde turnstile-config.js

class TurnstileHandler {
    constructor() {
        this.token = null;
        this.widgetId = null;
        this.submitBtn = document.getElementById('submitBtn');
        this.messageContainer = document.getElementById('messageContainer');
        
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
        this.submitBtn.disabled = false;
        this.showMessage('CAPTCHA verificado correctamente', 'success');
        console.log('Turnstile token generado:', token.substring(0, 20) + '...');
    }

    onError() {
        this.token = null;
        this.submitBtn.disabled = true;
        this.showMessage('Error al cargar el CAPTCHA. Recarga la página.', 'error');
        console.error('Error en Turnstile');
    }

    onExpired() {
        this.token = null;
        this.submitBtn.disabled = true;
        this.showMessage('El CAPTCHA ha expirado. Complétalo nuevamente.', 'warning');
        console.warn('Token de Turnstile expirado');
    }

    getToken() {
        return this.token;
    }

    reset() {
        if (this.widgetId !== null && typeof turnstile !== 'undefined') {
            turnstile.reset(this.widgetId);
        }
        this.token = null;
        this.submitBtn.disabled = true;
    }

    showMessage(message, type) {
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