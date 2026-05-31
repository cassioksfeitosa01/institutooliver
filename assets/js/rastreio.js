// FIXME: Google Tag Manager Inteligente (Delay Load para subir nota no Google)
(function() {
    var gtmId = 'GTM-TDW8B7JB';
    var carregado = false;

    function dispararGTM() {
        if (carregado) return; // Garante que não carrega duas vezes
        carregado = true;

        // Código original do Google (agora dentro da função)
        (function (w, d, s, l, i) {
            w[l] = w[l] || []; w[l].push({
                'gtm.start':
                    new Date().getTime(), event: 'gtm.js'
            }); var f = d.getElementsByTagName(s)[0],
                j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : ''; j.async = true; j.src =
                    'https://www.googletagmanager.com/gtm.js?id=' + i + dl; f.parentNode.insertBefore(j, f);
        })(window, document, 'script', 'dataLayer', gtmId);

        console.log("🚀 Rastreio GTM ativado após interação!");
    }

    // GATILHOS: O Google só vai "acordar" se o usuário fizer uma dessas coisas:
    
    // 1. Se ele rolar a página
    window.addEventListener('scroll', dispararGTM, { passive: true });

    // 2. Se ele mexer o mouse
    window.addEventListener('mousemove', dispararGTM);

    // 3. Se ele tocar na tela (celular)
    window.addEventListener('touchstart', dispararGTM, { passive: true });

    // 4. Segurança: Se ele não fizer nada, carrega sozinho após 4 segundos
    // Isso garante que você não perca rastreio de ninguém
    setTimeout(dispararGTM, 4000);
})();