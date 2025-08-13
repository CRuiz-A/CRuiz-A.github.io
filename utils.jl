function hfun_bar(vname)
  val = Meta.parse(vname[1])
  return round(sqrt(val), digits=2)
end

# Inline Turnstile shortcode: {{turnstile_inline title="..." compact=true}}
function hfun_turnstile_inline(params)
  # params like ["title=Verificación", "compact=true"]
  title = "Verificación rápida"
  compact = "false"
  for p in params
    if occursin("title=", p)
      title = split(p, "=", limit=2)[2]
    elseif occursin("compact=", p)
      compact = split(p, "=", limit=2)[2]
    end
  end
  return """
  <div class=\"ts-inline\" data-title=\"$title\" data-compact=\"$compact\"></div>
  """
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
