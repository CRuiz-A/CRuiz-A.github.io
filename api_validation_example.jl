# Ejemplo de validación de Turnstile para Franklin.jl
# Este archivo muestra cómo implementar la validación del lado servidor

using HTTP
using JSON3
using Base64

"""
Función para validar el token de Turnstile con Cloudflare
"""
function validate_turnstile_token(token::String, secret_key::String)
    try
        # URL de validación de Cloudflare Turnstile
        url = "https://challenges.cloudflare.com/turnstile/v0/siteverify"
        
        # Preparar los datos para enviar
        data = Dict(
            "secret" => secret_key,
            "response" => token
        )
        
        # Realizar la petición POST
        response = HTTP.post(
            url,
            ["Content-Type" => "application/x-www-form-urlencoded"],
            HTTP.escapeuri(data)
        )
        
        if response.status == 200
            result = JSON3.read(String(response.body))
            
            # Verificar si la validación fue exitosa
            if get(result, :success, false)
                return Dict(
                    "success" => true,
                    "challenge_ts" => get(result, :challenge_ts, nothing),
                    "hostname" => get(result, :hostname, nothing),
                    "action" => get(result, :action, nothing),
                    "cdata" => get(result, :cdata, nothing)
                )
            else
                return Dict(
                    "success" => false,
                    "error" => "Token validation failed",
                    "error_codes" => get(result, :error_codes, [])
                )
            end
        else
            return Dict(
                "success" => false,
                "error" => "HTTP error: $(response.status)"
            )
        end
        
    catch e
        return Dict(
            "success" => false,
            "error" => "Exception: $(e)"
        )
    end
end

"""
Ejemplo de endpoint para Franklin.jl
Este sería el código que ejecutarías en tu servidor
"""
function handle_captcha_validation(request)
    try
        # Obtener el token del request
        body = JSON3.read(String(request.body))
        token = get(body, "captchaToken", "")
        action = get(body, "action", "")
        timestamp = get(body, "timestamp", 0)
        
        # Validar que el token no esté vacío
        if isempty(token)
            return HTTP.Response(400, JSON3.write(Dict("success" => false, "error" => "Token missing")))
        end
        
        # Verificar que la petición no sea muy antigua (5 minutos)
        current_time = round(Int, time())
        if current_time - timestamp > 300
            return HTTP.Response(400, JSON3.write(Dict("success" => false, "error" => "Request too old")))
        end
        
        # Tu clave secreta de Turnstile (¡MANTÉNLA SEGURA!)
        secret_key = "TU_SECRET_KEY_AQUI"
        
        # Validar el token
        result = validate_turnstile_token(token, secret_key)
        
        if result["success"]
            # Token válido - puedes proceder con tu lógica de negocio
            return HTTP.Response(200, JSON3.write(Dict(
                "success" => true,
                "message" => "CAPTCHA validado exitosamente",
                "action" => action
            )))
        else
            return HTTP.Response(400, JSON3.write(Dict(
                "success" => false,
                "error" => get(result, "error", "Unknown error")
            )))
        end
        
    catch e
        return HTTP.Response(500, JSON3.write(Dict(
            "success" => false,
            "error" => "Server error: $(e)"
        )))
    end
end

# Ejemplo de configuración para Franklin.jl
# Agregar esto a tu configuración de Franklin

"""
Configuración recomendada para Franklin.jl con Turnstile:

1. Crear un archivo de configuración para las claves:
   config/turnstile.jl:
   
   const TURNSTILE_SITE_KEY = "tu_site_key_aqui"
   const TURNSTILE_SECRET_KEY = "tu_secret_key_aqui"
   
2. En tu archivo de configuración principal (config.md):
   
   +++
   # ... otras configuraciones ...
   turnstile_enabled = true
   +++
   
3. En tus templates HTML, puedes usar:
   
   {{if turnstile_enabled}}
   <div class="cf-turnstile" data-sitekey="{{TURNSTILE_SITE_KEY}}"></div>
   {{end}}
"""

# Ejemplo de middleware para Franklin.jl
"""
function franklin_middleware(request)
    # Verificar si la petición es para validar CAPTCHA
    if startswith(request.target, "/api/validate-captcha")
        return handle_captcha_validation(request)
    end
    
    # Continuar con el procesamiento normal de Franklin
    return nothing
end
"""

println("✅ Ejemplo de validación de Turnstile para Franklin.jl creado")
println("📝 Recuerda:")
println("   - Obtener tus claves reales de Cloudflare Turnstile")
println("   - Implementar la validación del lado servidor")
println("   - Mantener las claves secretas seguras")
println("   - Considerar rate limiting para prevenir abuso") 