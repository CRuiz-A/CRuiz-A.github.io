// Configuración de Cloudflare Turnstile
// IMPORTANTE: Reemplaza estos valores con tus claves reales

const TURNSTILE_CONFIG = {
    // Site Key público de Cloudflare Turnstile
    // Obtén esta clave desde el dashboard de Cloudflare
    siteKey: '0x4AAAAAABnyQIvR42qq5_Ed', // REEMPLAZA con tu Site Key real
    
    // Endpoint de tu API backend
    // Este debe apuntar a tu servidor NestJS
    apiEndpoint: 'http://localhost:3001/api/validate-captcha', // REEMPLAZA con tu URL real
    
    // Configuraciones adicionales
    theme: 'auto', // 'light', 'dark', 'auto'
    size: 'normal', // 'normal', 'compact'
    language: 'es', // Código de idioma
    
    // Configuración de timeouts
    timeout: 30000, // 30 segundos
    retryDelay: 3000 // 3 segundos
};

// Exportar para uso en otros archivos
if (typeof window !== 'undefined') {
    window.TURNSTILE_CONFIG = TURNSTILE_CONFIG;
}
