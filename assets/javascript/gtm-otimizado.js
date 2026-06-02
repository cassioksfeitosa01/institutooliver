(function() {
    var gtmId = 'GTM-TDW8B7JB';
    var carregado = false;

    function dispararGTM() {
        if (carregado) return; 
        carregado = true;

        window.removeEventListener('scroll', dispararGTM);
        window.removeEventListener('mousemove', dispararGTM);
        window.removeEventListener('touchstart', dispararGTM);

        (function (w, d, s, l, i) {
            w[l] = w[l] || []; w[l].push({
                'gtm.start': new Date().getTime(), event: 'gtm.js'
            }); var f = d.getElementsByTagName(s)[0],
                j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : ''; j.async = true; j.src =
                    'https://www.googletagmanager.com/gtm.js?id=' + i + dl; f.parentNode.insertBefore(j, f);
        })(window, document, 'script', 'dataLayer', gtmId);

        console.log("🚀 GTM ativado!");
    }

    window.addEventListener('scroll', dispararGTM, { passive: true });
    window.addEventListener('mousemove', dispararGTM);
    window.addEventListener('touchstart', dispararGTM, { passive: true });

    setTimeout(dispararGTM, 3000); 
})();