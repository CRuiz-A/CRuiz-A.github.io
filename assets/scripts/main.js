class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.submitText = document.getElementById('submitText');
        this.submitLoader = document.getElementById('submitLoader');
        this.messageContainer = document.getElementById('messageContainer');
        
        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        // Verificar que tenemos el token de Turnstile
        const captchaToken = turnstileHandler?.getToken();
        if (!captchaToken) {
            this.showMessage('Por favor, completa el CAPTCHA antes de enviar.', 'error');
            return;
        }

        // Mostrar estado de carga
        this.setLoading(true);

        // Recopilar datos del formulario
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);
        data.captchaToken = captchaToken; // Campo requerido por el backend

        try {
            const response = await fetch(TURNSTILE_CONFIG.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            if (response.ok && result.success) {
                this.showMessage('¡Formulario enviado exitosamente!', 'success');
                this.resetForm();
            } else {
                this.showMessage(result.message || 'Error al procesar el formulario', 'error');
                this.resetCaptcha();
            }
        } catch (error) {
            console.error('Error al enviar formulario:', error);
            this.showMessage('Error de conexión. Inténtalo de nuevo.', 'error');
            this.resetCaptcha();
        } finally {
            this.setLoading(false);
        }
    }

    setLoading(isLoading) {
        this.submitBtn.disabled = isLoading;
        this.submitText.style.display = isLoading ? 'none' : 'inline';
        this.submitLoader.style.display = isLoading ? 'inline-block' : 'none';
    }

    showMessage(message, type) {
        this.messageContainer.innerHTML = `<div class="message ${type}">${message}</div>`;
        
        // Auto-ocultar después de 5 segundos
        setTimeout(() => {
            this.messageContainer.innerHTML = '';
        }, 5000);
    }

    resetForm() {
        this.form.reset();
        this.resetCaptcha();
    }

    resetCaptcha() {
        if (turnstileHandler) {
            turnstileHandler.reset();
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    new ContactForm();
});