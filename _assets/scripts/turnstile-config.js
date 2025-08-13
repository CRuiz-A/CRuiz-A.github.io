// Configuración de Cloudflare Turnstile
// IMPORTANTE: Reemplaza estos valores con tus claves reales

const TURNSTILE_CONFIG = {
    // Site Key público de Cloudflare Turnstile
    // Esta es tu clave real de Cloudflare
    siteKey: '0x4AAAAAABnyQIvR42qq5_Ed',
    
    // Endpoint de tu API backend
    // Detecta automáticamente entre desarrollo y producción
    apiEndpoint: window.location.hostname === 'localhost' 
        ? 'http://localhost:3001/api/validate-captcha'
        : 'https://api-cruiz.vercel.app/api/validate-captcha',
    
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
