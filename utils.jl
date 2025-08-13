function hfun_bar(vname)
  val = Meta.parse(vname[1])
  return round(sqrt(val), digits=2)
end

# Inline Turnstile shortcode: {{turnstile_inline title="..." compact=true}}
function hfun_turnstile_inline(params)
  # params like ["title=Verificación", "compact=true", "cta_text=Probar API", "cta_endpoint=/", "cta_mode=fetch", "cta_method=GET"]
  # defaults
  title = "Verificación rápida"
  compact = "false"
  cta_text = "Probar API"
  cta_endpoint = "/"
  cta_mode = "fetch"  # fetch | redirect
  cta_method = "GET"

  for p in params
    if occursin("=", p)
      parts = split(p, "=", limit=2)
      key = parts[1]
      val = parts[2]
      if key == "title"
        title = val
      elseif key == "compact"
        compact = val
      elseif key == "cta_text"
        cta_text = val
      elseif key == "cta_endpoint"
        cta_endpoint = val
      elseif key == "cta_mode"
        cta_mode = val
      elseif key == "cta_method"
        cta_method = val
      end
    end
  end

  return """
  <div class=\"ts-inline\"
       data-title=\"$title\"
       data-compact=\"$compact\"
       data-cta-text=\"$cta_text\"
       data-cta-endpoint=\"$cta_endpoint\"
       data-cta-mode=\"$cta_mode\"
       data-cta-method=\"$cta_method\"></div>
  """
end

# Toggle tag for enabling/disabling turnstile on a page: {{turnstile_enable}} / {{turnstile_disable}}
# Toggle tag for enabling/disabling turnstile on a page: {{turnstile_enable}} / {{turnstile_disable}}
function hfun_turnstile_enable(_)
  setpagevar("turnstile_enabled", true)
  return ""
end

function hfun_turnstile_disable(_)
  setpagevar("turnstile_enabled", false)
  return ""
end

# Toggle Giscus comments: {{giscus_enable}} / {{giscus_disable}}
function hfun_giscus_enable(_)
  setpagevar("giscus_enabled", true)
  return ""
end

function hfun_giscus_disable(_)
  setpagevar("giscus_enabled", false)
  return ""
end

function hfun_m1fill(vname)
  var = vname[1]
  return pagevar("index", var)
end

function lx_baz(com, _)
  # keep this first line
  brace_content = Franklin.content(com.braces[1]) # input string
  # do whatever you want here
  return uppercase(brace_content)
end
