<!--
Configuración global para Franklin.jl
-->
+++
author = "Cruiz"
mintoclevel = 2

# Define el prepath si el sitio está en un subdirectorio de GitHub Pages
prepath = "pages"

# Archivos o directorios que Franklin debe ignorar
ignore = ["node_modules/", "__site/"]

# Configuración del RSS (Requiere website_{title, descr, url})
generate_rss = true
website_title = "CRuiz Page"
website_descr = "Sitio web personal de CRuiz con Franklin.jl"
website_url   = "https://cruiz-a.github.io/pages/"
+++

<!--
Definiciones de comandos LaTeX globales para todo el sitio
-->
\newcommand{\marginnote}[2]{
    ~~~
    <label for="mn-!#1" class="margin-toggle">&#8853;</label>
    <input type="checkbox" id="mn-!#1" class="margin-toggle"/>
    <span class="marginnote">!#2</span>
    ~~~
}
\newcommand{\sidenote}[2]{
    ~~~
    <label for="sn-!#1" class="margin-toggle sidenote-number"></label>
    <input type="checkbox" id="sn-!#1" class="margin-toggle"/>
    <span class="sidenote" id="sn-!#1">!#2</span>
    ~~~
}
\newcommand{\R}{\mathbb{R}}
\newcommand{\scal}[1]{\langle #1 \rangle}
