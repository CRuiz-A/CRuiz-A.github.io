# Configuración de Turnstile para Franklin.jl

## Configuración del Cliente (Frontend)

### 1. Variables de Entorno
Crea un archivo `.env` en la raíz de tu proyecto:

```bash
# Turnstile Configuration
TURNSTILE_SITE_KEY=tu_site_key_aqui
TURNSTILE_SECRET_KEY=tu_secret_key_aqui
TURNSTILE_ENABLED=true
```

### 2. Configuración en Franklin.jl

Agrega esto a tu `config.md`:

```markdown
+++
# ... otras configuraciones ...
turnstile_enabled = true
turnstile_site_key = "tu_site_key_aqui"
+++
```

### 3. Template HTML Mejorado

Crea un archivo `_layout/turnstile.html`:

```html
{{if turnstile_enabled}}
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
<style>
  .cf-turnstile {
    margin: 20px 0;
    display: flex;
    justify-content: center;
  }
  .turnstile-container {
    border: 1px solid #ddd;
    padding: 20px;
    border-radius: 8px;
    background: #f9f9f9;
  }
</style>
{{end}}
```

## Configuración del Servidor (Backend)

### 1. Dependencias Julia

Agrega estas dependencias a tu `Project.toml`:

```toml
[deps]
HTTP = "cd3eb016-35fb-5094-929b-558a96fad6f3"
JSON3 = "0f8b85d8-7281-11e9-16c2-39a2b8d10648"
```

### 2. Función de Validación

Crea un archivo `utils/turnstile.jl`:

```julia
using HTTP
using JSON3

function validate_turnstile(token::String, secret_key::String)
    # Implementación de validación (ver api_validation_example.jl)
end
```

## Implementación Segura

### ✅ Buenas Prácticas

1. **Nunca expongas tu secret key en el frontend**
2. **Siempre valida del lado servidor**
3. **Usa HTTPS en producción**
4. **Implementa rate limiting**
5. **Valida timestamps para prevenir replay attacks**

### ⚠️ Consideraciones de Seguridad

1. **Site Key**: Pública, segura de exponer
2. **Secret Key**: Privada, solo en el servidor
3. **Tokens**: Temporales, no reutilizables
4. **Validación**: Siempre en el servidor

## Ejemplo de Uso

### En tu página HTML:

```html
{{insert turnstile.html}}

<form id="contact-form">
  <input type="text" name="name" placeholder="Nombre" required>
  <input type="email" name="email" placeholder="Email" required>
  <textarea name="message" placeholder="Mensaje" required></textarea>
  
  {{if turnstile_enabled}}
  <div class="turnstile-container">
    <div class="cf-turnstile" data-sitekey="{{turnstile_site_key}}"></div>
  </div>
  {{end}}
  
  <button type="submit">Enviar</button>
</form>
```

### JavaScript para el manejo:

```javascript
document.getElementById('contact-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const token = turnstile.getResponse();
  if (!token) {
    alert('Por favor, completa el CAPTCHA');
    return;
  }
  
  const formData = new FormData(this);
  formData.append('cf-turnstile-response', token);
  
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      alert('Mensaje enviado exitosamente!');
    } else {
      alert('Error al enviar el mensaje');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error de conexión');
  }
});
```

## Testing

### Para desarrollo local:

1. Usa las claves de prueba de Cloudflare
2. Configura un endpoint de prueba
3. Verifica que la validación funcione

### Para producción:

1. Obtén claves reales de Cloudflare
2. Configura HTTPS
3. Implementa logging y monitoreo
4. Prueba con diferentes navegadores

## Recursos Adicionales

- [Documentación oficial de Turnstile](https://developers.cloudflare.com/turnstile/)
- [Franklin.jl Documentation](https://franklinjl.org/)
- [Julia HTTP.jl](https://github.com/JuliaWeb/HTTP.jl) 