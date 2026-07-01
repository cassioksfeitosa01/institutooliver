(function () {
  var gtmCarregado = false;

  function carregarGTM() {
    if (gtmCarregado) return;
    gtmCarregado = true;

    (function (w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l != 'dataLayer' ? '&l=' + l : '';
      j.async = true;
      j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', 'GTM-TDW8B7JB');

    eventos.forEach(function (evt) {
      window.removeEventListener(evt, carregarGTM);
    });
    clearTimeout(tempoLimite);
  }

  var eventos = ['mousemove', 'scroll', 'click', 'touchstart', 'keydown'];

  eventos.forEach(function (evt) {
    window.addEventListener(evt, carregarGTM, { passive: true, once: true });
  });

  // Se ninguém interagir, carrega mesmo assim depois de 5s
  // (importante pra não perder rastreamento de quem só fica parado lendo)
  var tempoLimite = setTimeout(carregarGTM, 5000);
})();