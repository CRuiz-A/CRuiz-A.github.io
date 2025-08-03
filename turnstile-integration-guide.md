# Guía de Integración: Cloudflare Turnstile con Franklin.jl

Esta guía explica cómo integrar el sistema de Turnstile que acabamos de configurar con tu sitio web de Franklin.jl.

## 📁 Archivos Creados

La implementación completa incluye:

```
├── contact.html                          # Formulario standalone
├── _css/turnstile-form.css              # Estilos del formulario
├── _assets/scripts/
│   ├── turnstile-config.js              # Configuración centralizada
│   ├── turnstile.js                     # Lógica de Turnstile
│   └── main.js                          # Manejo del formulario
└── turnstile-integration-guide.md       # Esta guía
```

## 🔧 Configuración Requerida

### 1. Actualizar Configuración

Edita `_assets/scripts/turnstile-config.js`:

```javascript
const TURNSTILE_CONFIG = {
    // REEMPLAZA con tu Site Key real de Cloudflare
    siteKey: 'TU_SITE_KEY_REAL',
    
    // REEMPLAZA con la URL real de tu API backend
    apiEndpoint: 'https://tu-backend-real.vercel.app/api/validate-captcha',
    
    theme: 'auto',
    size: 'normal',
    language: 'es'
};
```

### 2. Obtener Claves de Cloudflare

1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navega a **Turnstile**
3. Crea un nuevo sitio con:
   - **Domain:** `tu-usuario.github.io` (o tu dominio personalizado)
   - **Widget mode:** Managed

## 🌐 Integración con Franklin.jl

### Opción 1: Página Standalone

Usa `contact.html` directamente como una página independiente en tu sitio.

### Opción 2: Integrar en página existente de Franklin

Crea un archivo Markdown (ej: `contact.md`) con:

```markdown
# Contacto

~~~
<link rel="stylesheet" href="_css/turnstile-form.css">
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>

<div class="container">
    <h1>Formulario de Contacto</h1>
    
    <form id="contactForm" class="contact-form">
        <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required>
        </div>
        
        <div class="form-group">
            <label for="message">Mensaje:</label>
            <textarea id="message" name="message" rows="4" required></textarea>
        </div>
        
        <div class="form-group">
            <div class="cf-turnstile" 
                 data-sitekey="TU_SITE_KEY_AQUI"
                 data-callback="onTurnstileSuccess"
                 data-error-callback="onTurnstileError"
                 data-expired-callback="onTurnstileExpired">
            </div>
        </div>
        
        <button type="submit" id="submitBtn" disabled>
            <span id="submitText">Enviar</span>
            <span id="submitLoader" class="loader" style="display: none;"></span>
        </button>
    </form>
    
    <div id="messageContainer" class="message-container"></div>
</div>

<script src="_assets/scripts/turnstile-config.js"></script>
<script src="_assets/scripts/turnstile.js"></script>
<script src="_assets/scripts/main.js"></script>
~~~
```

### Opción 3: Incluir en Layout Global

En `_layout/foot.html`, agrega:

```html
<!-- Solo cargar en páginas que necesiten Turnstile -->
{{if hasmath}}
<script src="_assets/scripts/turnstile-config.js"></script>
<script src="_assets/scripts/turnstile.js"></script>
<script src="_assets/scripts/main.js"></script>
{{end}}
```

## 🎨 Personalización de Estilos

Los estilos están en `_css/turnstile-form.css`. Puedes:

1. **Integrar con tu CSS existente:** Copia las reglas a `_css/franklin.css`
2. **Personalizar colores:** Modifica las variables de color
3. **Responsive:** Los estilos ya incluyen diseño responsive

Ejemplo de personalización:

```css
/* En _css/franklin.css */
.contact-form {
    /* Tu personalización */
}

.cf-turnstile {
    /* Personalizar el widget de Turnstile */
}
```

## 🚀 Deploy en GitHub Pages

1. **Commit los archivos:**
```bash
git add .
git commit -m "Add Cloudflare Turnstile integration"
git push
```

2. **Verificar GitHub Pages:**
   - Ve a Settings > Pages
   - Asegúrate de que esté habilitado

3. **Configurar dominio en Cloudflare:**
   - Si usas dominio personalizado, actualiza la configuración de Turnstile

## 🧪 Testing

### Pruebas Locales

```bash
# Ejecutar Franklin en modo desarrollo
julia
julia> using Franklin
julia> serve()
```

Visita `http://localhost:8000/contact.html`

### Verificaciones

✅ **Widget carga correctamente**
✅ **Botón se habilita al completar CAPTCHA**
✅ **Formulario envía datos al backend**
✅ **Mensajes de error/éxito funcionan**
✅ **Responsive design funciona**

## 🔒 Seguridad

- ✅ Site Key es público (seguro exponer en frontend)
- ⚠️ NUNCA expongas el Secret Key en el frontend
- ✅ Validación real ocurre en el backend
- ✅ Token expira automáticamente

## 🐛 Troubleshooting

### Problemas Comunes

1. **Widget no carga:**
   - Verificar Site Key correcto
   - Verificar dominio configurado en Cloudflare

2. **Error de CORS:**
   - Verificar configuración del backend
   - Verificar headers de la API

3. **Token inválido:**
   - Verificar Secret Key en el backend
   - Verificar que no haya expirado

4. **Estilos no se aplican:**
   - Verificar ruta a CSS
   - Verificar que Franklin compile correctamente

### Debug

Activar logs en la consola del navegador:

```javascript
// En turnstile-config.js, agregar:
const TURNSTILE_CONFIG = {
    // ... configuración existente
    debug: true
};
```

## 📚 Recursos

- [Documentación Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/)
- [Franklin.jl Docs](https://franklinjl.org/)
- [Tu backend NestJS con Turnstile](tu-url-backend)

---

**¡Implementación completada!** 🎉 

Tu sitio ahora tiene protección CAPTCHA avanzada con Cloudflare Turnstile integrada de forma elegante y funcional.