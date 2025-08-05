+++
title = "🛡️ Test de Turnstile - Franklin.jl"
hasmath = false
hascode = false
+++

# 🧪 Test de Integración Turnstile con Franklin.jl

Esta página demuestra la integración completa de Cloudflare Turnstile con Franklin.jl y la API de Nest.js.

{{insert turnstile.html}}

~~~
<div class="turnstile-form">
  <h2>📝 Formulario de Prueba</h2>
  <p><strong>Objetivo:</strong> Verificar que la integración Turnstile funciona correctamente entre Franklin.jl y la API de Nest.js.</p>
  
  <form id="franklin-turnstile-form">
    <div class="form-group">
      <label for="test-name">Nombre:</label>
      <input type="text" id="test-name" name="name" placeholder="Tu nombre" required>
    </div>
    
    <div class="form-group">
      <label for="test-email">Email:</label>
      <input type="email" id="test-email" name="email" placeholder="tu@email.com" required>
    </div>
    
    <div class="form-group">
      <label for="test-message">Mensaje:</label>
      <textarea id="test-message" name="message" rows="4" placeholder="Tu mensaje de prueba" required></textarea>
    </div>
    
    <div class="turnstile-container">
      <h3>🔒 Verificación de Seguridad</h3>
      <div class="cf-turnstile" 
           data-sitekey="{{turnstile_site_key}}"
           data-callback="onFranklinTurnstileSuccess"
           data-expired-callback="onFranklinTurnstileExpired"
           data-error-callback="onFranklinTurnstileError"></div>
    </div>
    
    <div id="franklin-message-container"></div>
    
    <button type="submit" class="submit-btn" id="franklin-submit-btn" disabled>
      📤 Enviar Formulario
    </button>
  </form>
</div>

<div class="turnstile-form" style="margin-top: 30px;">
  <h2>🔍 Información de Debug</h2>
  <div id="debug-info">
    <p><strong>Site Key:</strong> {{turnstile_site_key}}</p>
    <p><strong>Estado Turnstile:</strong> <span id="turnstile-status">Cargando...</span></p>
    <p><strong>API Endpoint:</strong> <span id="api-endpoint">Detectando...</span></p>
  </div>
</div>

<script>
// Variables globales para Franklin.jl + Turnstile
let franklinTurnstileToken = null;
const franklinSubmitBtn = document.getElementById('franklin-submit-btn');
const franklinMessageContainer = document.getElementById('franklin-message-container');

// Detectar entorno y configurar API URL
const apiUrl = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001/api/validate-captcha'
  : 'https://api-cruiz.vercel.app/validate-captcha';

// Actualizar información de debug
document.getElementById('api-endpoint').textContent = apiUrl;

// Callbacks de Turnstile para Franklin.jl
function onFranklinTurnstileSuccess(token) {
  console.log('✅ Franklin.jl - Turnstile completado exitosamente');
  franklinTurnstileToken = token;
  franklinSubmitBtn.disabled = false;
  document.getElementById('turnstile-status').textContent = '✅ Verificado';
  showFranklinMessage('CAPTCHA completado. Puedes enviar el formulario.', 'success');
}

function onFranklinTurnstileExpired() {
  console.log('⏰ Franklin.jl - Turnstile expirado');
  franklinTurnstileToken = null;
  franklinSubmitBtn.disabled = true;
  document.getElementById('turnstile-status').textContent = '⏰ Expirado';
  showFranklinMessage('CAPTCHA expirado. Por favor, completa el CAPTCHA nuevamente.', 'error');
}

function onFranklinTurnstileError() {
  console.log('❌ Franklin.jl - Error en Turnstile');
  franklinTurnstileToken = null;
  franklinSubmitBtn.disabled = true;
  document.getElementById('turnstile-status').textContent = '❌ Error';
  showFranklinMessage('Error en el CAPTCHA. Por favor, recarga la página.', 'error');
}

// Función para mostrar mensajes
function showFranklinMessage(message, type) {
  franklinMessageContainer.innerHTML = `<div class="message ${type}">${message}</div>`;
}

// Manejar el envío del formulario
document.getElementById('franklin-turnstile-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  
  if (!franklinTurnstileToken) {
    showFranklinMessage('❌ Por favor, completa el CAPTCHA antes de enviar.', 'error');
    return;
  }

  showFranklinMessage('🔄 Enviando formulario...', 'info');
  franklinSubmitBtn.disabled = true;

  // Recopilar datos del formulario
  const formData = {
    captchaToken: franklinTurnstileToken,
    name: document.getElementById('test-name').value,
    email: document.getElementById('test-email').value,
    message: document.getElementById('test-message').value,
    action: 'franklin_form_submit',
    timestamp: Date.now(),
    source: 'franklin.jl'
  };

  console.log('📤 Franklin.jl - Enviando datos:', formData);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    console.log('📥 Franklin.jl - Respuesta del servidor:', response.status);
    const result = await response.json();
    console.log('📄 Franklin.jl - Datos de respuesta:', result);

    if (response.ok && result.success) {
      showFranklinMessage(`✅ <strong>Éxito!</strong> ${result.message}`, 'success');
      // Limpiar formulario
      document.getElementById('franklin-turnstile-form').reset();
      franklinTurnstileToken = null;
      // Resetear Turnstile
      if (typeof turnstile !== 'undefined') {
        turnstile.reset();
      }
    } else {
      showFranklinMessage(`⚠️ <strong>Error de validación:</strong> ${result.message || 'Error desconocido'}`, 'error');
    }
  } catch (error) {
    console.error('💥 Franklin.jl - Error de red:', error);
    showFranklinMessage(`❌ <strong>Error de conexión:</strong> ${error.message}`, 'error');
  } finally {
    franklinSubmitBtn.disabled = false;
  }
});

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Franklin.jl - Página de prueba Turnstile cargada');
  document.getElementById('turnstile-status').textContent = '⏳ Esperando verificación';
});
</script>
~~~

## 📋 Información de la Integración

### ✅ Componentes Implementados

- **Franklin.jl**: Generador de sitios estáticos en Julia
- **Cloudflare Turnstile**: Sistema de CAPTCHA inteligente
- **Nest.js API**: Validación del lado servidor
- **Site Key**: `{{turnstile_site_key}}`

### 🔧 Características de la Prueba

1. **Detección automática de entorno** (desarrollo vs producción)
2. **Validación del lado cliente** antes del envío
3. **Validación del lado servidor** con la API de Nest.js
4. **Manejo completo de errores** y estados
5. **Logging detallado** para debugging
6. **Reseteo automático** del formulario tras éxito

### 🚀 URLs de la API

- **Desarrollo**: `http://localhost:3001/api/validate-captcha`
- **Producción**: `https://api-cruiz.vercel.app/validate-captcha`

### 🧪 Cómo Probar

1. Completa los campos del formulario
2. Resuelve el CAPTCHA de Turnstile
3. Envía el formulario
4. Verifica la respuesta de la API
5. Revisa la consola del navegador para logs detallados 