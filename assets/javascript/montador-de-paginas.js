
// INJETOR DE COMPONENTES — carrega HTML de /components/*.html

(function () {
    const CAMINHO_COMPONENTS = '/components/';

    async function carregarComponente(div) {
        const nome = div.getAttribute('data-component');
        if (!nome) return;

        try {
            const resposta = await fetch(`${CAMINHO_COMPONENTS}${nome}.html`);
            if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);

            div.innerHTML = await resposta.text();
            div.setAttribute('data-component-status', 'carregado');
        } catch (erro) {
            console.error(`Erro ao carregar componente "${nome}":`, erro);
            div.setAttribute('data-component-status', 'erro');
        }
    }

    async function carregarTodosComponentes() {
        const divs = document.querySelectorAll('[data-component]');
        await Promise.all(Array.from(divs).map(carregarComponente));

        // Avisa o resto do arquivo (o slider, lá embaixo) que já
        // pode procurar os elementos, porque eles já existem agora.
        document.dispatchEvent(new CustomEvent('components:loaded'));
    }

    document.addEventListener('DOMContentLoaded', carregarTodosComponentes);
})();


// ── SLIDER: setas + swipe de dedo ──────────────────────────
// (código original, sem nenhuma alteração — só passou a rodar
//  dentro do evento "components:loaded" em vez de direto, porque
//  os vídeos só existem na página depois que o componente carrega)

document.addEventListener('components:loaded', function () {

    document.querySelectorAll('.slider-wrapper').forEach(wrapper => {
        const track = wrapper.querySelector('.slider-track');
        const slides = Array.from(track.querySelectorAll('.slide'));
        const btnEsq = wrapper.querySelector('.seta-esq');
        const btnDir = wrapper.querySelector('.seta-dir');
        let atual = 0;

        function slidesPorVez() {
            if (window.innerWidth >= 1024) return 3;
            if (window.innerWidth >= 640) return 2;
            return 1;
        }

        function maxIndice() {
            return Math.max(0, slides.length - slidesPorVez());
        }

        function ir(indice) {
            atual = Math.max(0, Math.min(indice, maxIndice()));

            const slideEl = slides[0];
            if (!slideEl) return;

            const gap = 20;
            const largura = slideEl.offsetWidth + gap;
            track.style.transform = `translateX(-${atual * largura}px)`;

            document.querySelectorAll('.slider-section video').forEach(v => {
                v.pause();
                const btn = v.closest('.video-short-box')?.querySelector('.play-btn');
                if (btn) btn.style.opacity = '1';
            });

            atualizarSetas();
        }

        function atualizarSetas() {
            if (!btnEsq || !btnDir) return;
            btnEsq.style.opacity = atual === 0 ? '0.3' : '1';
            btnDir.style.opacity = atual >= maxIndice() ? '0.3' : '1';
            btnEsq.style.pointerEvents = atual === 0 ? 'none' : 'auto';
            btnDir.style.pointerEvents = atual >= maxIndice() ? 'none' : 'auto';
        }

        btnEsq.addEventListener('click', () => ir(atual - 1));
        btnDir.addEventListener('click', () => ir(atual + 1));

        let touchX = 0;
        track.addEventListener('touchstart', e => {
            touchX = e.touches[0].clientX;
        }, { passive: true });
        track.addEventListener('touchend', e => {
            const diff = touchX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 40) ir(diff > 0 ? atual + 1 : atual - 1);
        });

        wrapper.querySelectorAll('.video-short-box').forEach(box => {
            const video = box.querySelector('video');
            const btn = box.querySelector('.play-btn');

            box.addEventListener('click', (e) => {
                if (video.paused) {
                    document.querySelectorAll('.slider-section video').forEach(v => {
                        if (v !== video) {
                            v.pause();
                            const outroBtn = v.closest('.video-short-box')?.querySelector('.play-btn');
                            if (outroBtn) outroBtn.style.opacity = '1';
                        }
                    });

                    video.play();
                    btn.style.opacity = '0';
                } else {
                    video.pause();
                    btn.style.opacity = '1';
                }
            });

            video.addEventListener('ended', () => {
                btn.style.opacity = '1';
            });
        });

        window.addEventListener('resize', () => ir(0));
        atualizarSetas();
    });

});