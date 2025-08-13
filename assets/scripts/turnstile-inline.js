(function(){
	function log(){ try{ console.log('[TurnstileInline]', ...arguments); }catch(_){} }
	function err(){ try{ console.warn('[TurnstileInline]', ...arguments); }catch(_){} }

	function renderInline(host){
		if (!window.TURNSTILE_CONFIG) { err('TURNSTILE_CONFIG missing'); return; }
		const compact = String(host.dataset.compact || '').toLowerCase() === 'true';
		const titleText = host.dataset.title || 'Verificación';

		const box = document.createElement('div');
		box.className = 'ts-inline-box';

		const header = document.createElement('div');
		header.className = 'ts-inline-header';
		header.textContent = titleText;

		const widgetWrap = document.createElement('div');
		widgetWrap.className = 'ts-inline-widget cf-turnstile-container';

		const widget = document.createElement('div');
		widget.className = 'cf-turnstile';
		widgetWrap.appendChild(widget);

		const status = document.createElement('div');
		status.className = 'ts-inline-status';
		status.textContent = 'Completa el CAPTCHA para continuar';

		box.appendChild(header);
		box.appendChild(widgetWrap);
		box.appendChild(status);

		host.innerHTML = '';
		host.appendChild(box);

		function onOk(){
			status.textContent = 'Verificando…';
			if (window.turnstileHandler) {
				window.turnstileHandler.ensureCaptchaPass()
					.then(()=>{ status.textContent = 'Acceso concedido'; })
					.catch(()=>{ status.textContent = 'No se pudo validar. Intenta de nuevo.'; });
			} else {
				status.textContent = 'Validado';
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
	}

	window.addEventListener('DOMContentLoaded', function(){
		log('scan');
		document.querySelectorAll('.ts-inline').forEach(renderInline);
	});
})();


