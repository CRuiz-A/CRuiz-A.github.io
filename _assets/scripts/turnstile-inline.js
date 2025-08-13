(function(){
	function log(){ try{ console.log('[TurnstileInline]', ...arguments); }catch(_){} }
	function err(){ try{ console.warn('[TurnstileInline]', ...arguments); }catch(_){} }

	function renderInline(host){
		if (!window.TURNSTILE_CONFIG) { err('TURNSTILE_CONFIG missing'); return; }
    const compact = String(host.dataset.compact || '').toLowerCase() === 'true';
    const titleText = host.dataset.title || '';
    const ctaText = host.dataset.ctaText || 'Probar API';
    const ctaEndpoint = host.dataset.ctaEndpoint || '/';
    const ctaMode = (host.dataset.ctaMode || 'fetch').toLowerCase();
    const ctaMethod = (host.dataset.ctaMethod || 'GET').toUpperCase();

		const box = document.createElement('div');
		box.className = 'ts-inline-box';

    if (titleText) {
        const header = document.createElement('div');
        header.className = 'ts-inline-header';
        header.textContent = titleText;
        box.appendChild(header);
    }

		const widgetWrap = document.createElement('div');
		widgetWrap.className = 'ts-inline-widget cf-turnstile-container';

		const widget = document.createElement('div');
		widget.className = 'cf-turnstile';
		widgetWrap.appendChild(widget);

		const status = document.createElement('div');
		status.className = 'ts-inline-status';
		status.textContent = 'Completa el CAPTCHA para continuar';

    box.appendChild(widgetWrap);
    box.appendChild(status);

    // CTA button (disabled until pass)
    const cta = document.createElement('button');
    cta.type = 'button';
    cta.className = 'btn btn-primary';
    cta.textContent = ctaText;
    cta.disabled = true;
    cta.style.marginTop = '8px';
    box.appendChild(cta);

		host.innerHTML = '';
		host.appendChild(box);

    function onOk(){
        status.textContent = '';
			if (window.turnstileHandler) {
				window.turnstileHandler.ensureCaptchaPass()
                .then(()=>{
                    const pass = window.turnstileHandler.getCaptchaPassToken();
                    if (pass) { try { localStorage.setItem('captchaPassToken', pass); } catch(_){} }
                    cta.disabled = false;
                })
					.catch(()=>{ status.textContent = 'No se pudo validar. Intenta de nuevo.'; });
			} else {
            cta.disabled = false;
			}
		}

		function onError(){ status.textContent = 'Error de widget. Recarga la página.'; }
		function onExpired(){ status.textContent = 'Expiró. Vuelve a completar.'; }

		if (typeof turnstile === 'undefined') {
			err('Turnstile API not ready');
			return;
		}

		turnstile.render(widget, {
			sitekey: TURNSTILE_CONFIG.siteKey,
			size: compact ? 'compact' : TURNSTILE_CONFIG.size,
			callback: function(token){
				log('token', token ? token.slice(0,12)+'…' : null);
				if (window.turnstileHandler) { window.turnstileHandler.onSuccess(token); }
				onOk();
			},
			'error-callback': onError,
			'expired-callback': onExpired,
		});

    // CTA behavior
    cta.addEventListener('click', async function(){
        const base = TURNSTILE_CONFIG.apiBase || '';
        const url = base.replace(/\/$/, '') + '/' + ctaEndpoint.replace(/^\//, '');
        const token = (window.turnstileHandler && window.turnstileHandler.getCaptchaPassToken()) || localStorage.getItem('captchaPassToken');
        if (ctaMode === 'redirect') {
            const u = new URL(url);
            if (token) u.searchParams.set('captcha', token);
            window.location.href = u.toString();
            return;
        }
        try {
            const res = await fetch(url, {
                method: ctaMethod,
                headers: Object.assign({ 'Accept': 'application/json' }, token ? { 'X-Captcha-Token': token } : {}),
            });
            const txt = await res.text();
            alert(`Status: ${res.status}\n\n${txt}`);
        } catch (e) {
            alert('Error llamando a la API: ' + e.message);
        }
    });
	}

	window.addEventListener('DOMContentLoaded', function(){
		log('scan');
		document.querySelectorAll('.ts-inline').forEach(renderInline);
	});
})();


