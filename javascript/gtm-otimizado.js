(function() {
    var gtmId = 'GTM-TDW8B7JB';
    var carregado = false;

    function dispararGTM() {
        if (carregado) return; 
        carregado = true;

        // Remove os ouvintes imediatamente
        window.removeEventListener('scroll', dispararGTM);
        window.removeEventListener('mousemove', dispararGTM);
        window.removeEventListener('touchstart', dispararGTM);

        // Usa requestIdleCallback para rodar o GTM quando o navegador estiver totalmente livre
        var executarScript = function() {
            (function (w, d, s, l, i) {
                w[l] = w[l] || []; w[l].push({
                    'gtm.start': new Date().getTime(), event: 'gtm.js'
                }); var f = d.getElementsByTagName(s)[0],
                    j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : ''; j.async = true; j.src =
                        'https://www.googletagmanager.com/gtm.js?id=' + i + dl; f.parentNode.insertBefore(j, f);
            })(window, document, 'script', 'dataLayer', gtmId);
            
            console.log("🚀 GTM ativado em segundo plano!");
        };

        if ('requestIdleCallback' in window) {
            requestIdleCallback(executarScript, { timeout: 2000 });
        } else {
            setTimeout(executarScript, 100);
        }
    }

    // Dispara apenas por ação real do usuário (removemos o setTimeout de 3 segundos antigo)
    window.addEventListener('scroll', dispararGTM, { passive: true });
    window.addEventListener('mousemove', dispararGTM);
    window.addEventListener('touchstart', dispararGTM, { passive: true });
})();
