(function(){
    console.log('[TurnstileWidget] bootstrap');
    if (!window.TURNSTILE_CONFIG) {
        console.warn('[TurnstileWidget] TURNSTILE_CONFIG not found');
        return;
    }
    if (!TURNSTILE_CONFIG.widgetEnabled) {
        console.log('[TurnstileWidget] widget disabled via config');
        return;
    }

	function createEl(tag, attrs = {}, children = []) {
		const el = document.createElement(tag);
		Object.entries(attrs).forEach(([k,v]) => {
			if (k === 'class') el.className = v; else if (k === 'style') Object.assign(el.style, v); else el.setAttribute(k, v);
		});
		children.forEach(c => el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
		return el;
	}

    function mountWidget() {
        console.log('[TurnstileWidget] mount');
        const positionClass = TURNSTILE_CONFIG.widgetPosition === 'left' ? 'left' : '';
        const offsetY = TURNSTILE_CONFIG.widgetOffsetY || 120;
        const styleKind = TURNSTILE_CONFIG.widgetStyle || 'default';

		const fab = createEl('button', { class: `turnstile-fab ${positionClass}`, type: 'button' }, [
			createEl('span', {}, ['Verificar acceso'])
		]);

        const extra = styleKind === 'slide-left-center' ? 'slide-left-center' : '';
        const panel = createEl('div', { class: `turnstile-panel ${positionClass} ${extra}` });
		panel.style.setProperty('--ts-offset-y', offsetY + 'px');
		panel.appendChild(createEl('div', { class: 'turnstile-panel-header' }, [
			createEl('strong', {}, ['¿Eres humano?']),
			createEl('button', { class: 'turnstile-close', type: 'button', 'aria-label': 'Cerrar' }, ['×'])
		]));
		panel.appendChild(createEl('div', { class: 'cf-turnstile' }));
		panel.appendChild(createEl('div', { id: 'turnstileWidgetMsg' }));

        function openPanel() { console.log('[TurnstileWidget] open'); panel.classList.add('open'); renderTurnstile(); }
        function closePanel() { console.log('[TurnstileWidget] close'); panel.classList.remove('open'); }

		fab.addEventListener('click', openPanel);
		panel.querySelector('.turnstile-close').addEventListener('click', closePanel);

        const placement = TURNSTILE_CONFIG.widgetPlacement || 'floating';
        const toc = document.querySelector('.franklin-toc');
        if (placement === 'toc' && toc) {
            console.log('[TurnstileWidget] injecting into TOC');
            const tocBox = document.createElement('div');
            tocBox.className = 'turnstile-toc';
            const header = document.createElement('div');
            header.className = 'turnstile-toc-header';
            const title = document.createElement('strong');
            title.textContent = 'Verificación';
            const toggle = document.createElement('button');
            toggle.className = 'toggle';
            toggle.type = 'button';
            toggle.textContent = 'Abrir';
            toggle.addEventListener('click', () => {
                if (panel.classList.contains('open')) { closePanel(); toggle.textContent='Abrir'; }
                else { openPanel(); toggle.textContent='Cerrar'; }
            });
            header.appendChild(title);
            header.appendChild(toggle);
            tocBox.appendChild(header);
            tocBox.appendChild(panel);
            toc.parentNode.insertBefore(tocBox, toc.nextSibling);
        } else if (placement === 'right-fixed') {
            console.log('[TurnstileWidget] right-fixed near TOC');
            const fixedBox = document.createElement('div');
            fixedBox.className = 'turnstile-right-fixed';
            const h = document.createElement('div');
            h.className = 'turnstile-toc-header';
            const title = document.createElement('strong');
            title.textContent = 'Verificación';
            const toggle = document.createElement('button');
            toggle.className = 'toggle';
            toggle.type = 'button';
            toggle.textContent = 'Abrir';
            toggle.addEventListener('click', () => {
                if (panel.classList.contains('open')) { closePanel(); toggle.textContent='Abrir'; }
                else { openPanel(); toggle.textContent='Cerrar'; }
            });
            h.appendChild(title);
            h.appendChild(toggle);
            fixedBox.appendChild(h);
            fixedBox.appendChild(panel);

            document.body.appendChild(fixedBox);
            openPanel(); // open by default in fixed mode
        } else {
            if (TURNSTILE_CONFIG.widgetShowHandle && styleKind === 'slide-left-center') {
                const handle = document.createElement('div');
                handle.className = 'turnstile-handle';
                handle.title = 'Verificar acceso';
                handle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-shield"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>';
                handle.addEventListener('click', openPanel);
                document.body.appendChild(handle);
            } else {
                document.body.appendChild(fab);
            }
            document.body.appendChild(panel);
        }

		if (TURNSTILE_CONFIG.widgetAutoOpen) openPanel();

        function renderTurnstile(){
            if (typeof turnstile === 'undefined') {
                console.warn('[TurnstileWidget] turnstile api not ready');
                return;
            }
			const container = panel.querySelector('.cf-turnstile');
			container.innerHTML='';
			turnstile.render(container, {
				sitekey: TURNSTILE_CONFIG.siteKey,
				callback: async function(token){
                    console.log('[TurnstileWidget] callback token received');
					try{
						if (window.turnstileHandler) {
							// set token and trade for pass
							window.turnstileHandler.onSuccess(token);
							await window.turnstileHandler.ensureCaptchaPass();
							displayMsg('Acceso concedido', 'success');
							setTimeout(closePanel, 800);
						} else {
							displayMsg('Handler no disponible', 'error');
						}
					}catch(e){
						displayMsg('No se pudo obtener el pase', 'error');
					}
				},
				'theme': TURNSTILE_CONFIG.theme,
				'size': TURNSTILE_CONFIG.size,
			});
		}

		function displayMsg(msg, type){
			const box = document.getElementById('turnstileWidgetMsg');
			if(!box) return;
			box.textContent = msg;
			box.style.color = type === 'error' ? '#b21e1e' : '#137333';
		}
	}

    function ensureAssets(){
		if (!document.querySelector('link[href*="turnstile-widget.css"]')) {
			const link = document.createElement('link');
			link.rel='stylesheet';
			link.href='/assets/_css/turnstile-widget.css';
			document.head.appendChild(link);
		}
	}

    window.addEventListener('DOMContentLoaded', function(){
        console.log('[TurnstileWidget] DOMContentLoaded');
		ensureAssets();
		mountWidget();
	});
})();


