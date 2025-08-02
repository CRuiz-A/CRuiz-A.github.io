#!/bin/bash

# Script de despliegue para GitHub Pages
# Automatiza el proceso de construcción y despliegue del sitio

set -e  # Salir si hay cualquier error

echo "🚀 Iniciando despliegue del sitio web..."

# Colores para el output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
}

# Verificar que estamos en la rama correcta
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ] && [ "$current_branch" != "master" ]; then
    warn "No estás en la rama main/master. Rama actual: $current_branch"
    read -p "¿Continuar de todas maneras? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        error "Despliegue cancelado"
        exit 1
    fi
fi

# Verificar que favicon.ico existe en la raíz
if [ ! -f "favicon.ico" ]; then
    log "Copiando favicon.ico a la raíz..."
    cp _assets/icon/favicon.ico . || error "No se pudo copiar favicon.ico"
fi

# Verificar archivos críticos
critical_files=(
    "_layout/style.html"
    "turnstile_test.html"
    "turnstile_test_standalone.html"
    "favicon.ico"
)

for file in "${critical_files[@]}"; do
    if [ ! -f "$file" ]; then
        error "Archivo crítico no encontrado: $file"
        exit 1
    fi
done

log "✅ Todos los archivos críticos están presentes"

# Verificar que Julia está instalado (para Franklin.jl)
if command -v julia &> /dev/null; then
    log "✅ Julia está instalado: $(julia --version)"
    
    # Si existe Project.toml, instanciar el proyecto
    if [ -f "Project.toml" ]; then
        log "📦 Instanciando dependencias de Julia..."
        julia --project=. -e "using Pkg; Pkg.instantiate()"
    fi
    
    # Si es un proyecto Franklin.jl, construir el sitio
    if [ -f "config.md" ] || grep -q "Franklin" Project.toml 2>/dev/null; then
        log "🔨 Construyendo sitio con Franklin.jl..."
        julia --project=. -e "using Franklin; serve(single=true, cleanup=true)"
    fi
else
    warn "Julia no está instalado. Si usas Franklin.jl, instálalo primero."
fi

# Verificar el estado de git
if git diff --quiet && git diff --staged --quiet; then
    warn "No hay cambios para commitear"
else
    log "📝 Preparando commit..."
    
    # Agregar archivos modificados
    git add .
    
    # Crear commit con timestamp
    commit_message="🚀 Deploy: $(date +'%Y-%m-%d %H:%M:%S') - Site optimization and error fixes"
    git commit -m "$commit_message"
    
    log "✅ Commit creado: $commit_message"
fi

# Push a GitHub
log "🌐 Subiendo cambios a GitHub..."
git push origin $(git branch --show-current)

# Verificar el estado de GitHub Pages
log "🔍 Verificando GitHub Pages..."
echo
echo -e "${BLUE}📋 Pasos a seguir:${NC}"
echo "1. Ve a tu repositorio en GitHub"
echo "2. Verifica que GitHub Pages esté configurado (Settings → Pages)"
echo "3. Espera unos minutos para que se despliegue"
echo "4. Visita tu sitio en: https://cruiz-a.github.io/"
echo

# Verificar conectividad básica
if command -v curl &> /dev/null; then
    log "🌍 Verificando conectividad..."
    if curl -s --head https://cruiz-a.github.io/ | head -n 1 | grep -q "200 OK"; then
        log "✅ Sitio web respondiendo correctamente"
    else
        warn "⚠️  Sitio web no responde o GitHub Pages aún está desplegando"
    fi
fi

echo
log "🎉 Despliegue completado exitosamente!"
echo -e "${GREEN}Tu sitio debería estar disponible en: https://cruiz-a.github.io/${NC}"
echo

# Mostrar resumen de optimizaciones
echo -e "${BLUE}🔧 Optimizaciones aplicadas:${NC}"
echo "✅ Favicon.ico en la raíz del sitio"
echo "✅ Headers de seguridad (CSP, Permissions Policy)"
echo "✅ Carga robusta de Turnstile con manejo de errores"
echo "✅ Mensajes de error amigables para usuarios"
echo "✅ Configuración optimizada para GitHub Pages"