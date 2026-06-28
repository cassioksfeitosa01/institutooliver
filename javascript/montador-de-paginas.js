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

        // Avisa o resto do arquivo (o slider, o menu, etc.) que já
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

// ── LIGHTBOX: ampliar foto de depoimento ───────────────────
// (bloco novo e isolado — escuta o mesmo evento "components:loaded"
//  do slider, mas não toca em nenhuma lógica do slider)

document.addEventListener('components:loaded', function () {

    const grid = document.querySelector('.mosaico-grid');
    if (!grid) return;

    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = '<span class="lightbox-fechar">&times;</span><img class="lightbox-img" src="" alt="">';
    document.body.appendChild(overlay);

    const imgGrande = overlay.querySelector('.lightbox-img');
    const btnFechar = overlay.querySelector('.lightbox-fechar');

    grid.querySelectorAll('img').forEach(img => {
        img.addEventListener('click', () => {
            imgGrande.src = img.src;
            overlay.classList.add('ativo');
        });
    });

    function fechar() {
        overlay.classList.remove('ativo');
        imgGrande.src = '';
    }

    btnFechar.addEventListener('click', fechar);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) fechar();
    });

});

// ── MENU HAMBÚRGUER: abrir/fechar painel, acordeão e busca ──
// (bloco novo — escuta o mesmo evento "components:loaded" porque
//  o menu inteiro só existe na página depois que o /components/menu.html
//  é injetado pelo bloco do topo deste arquivo)

document.addEventListener('components:loaded', function () {

    const menuPanel = document.getElementById('menuPanel');
    if (!menuPanel) return; // esta página não tem o componente do menu, então não faz nada

    /* ---------- Abrir / fechar o painel (hambúrguer -> X) ---------- */
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const overlay = document.getElementById('overlay');
    const closeMenuBtn = document.getElementById('closeMenuBtn');

    function toggleMenu() {
        hamburgerBtn.classList.toggle('active');
        menuPanel.classList.toggle('active');
        overlay.classList.toggle('active');
    }

    function fecharMenu() {
        hamburgerBtn.classList.remove('active');
        menuPanel.classList.remove('active');
        overlay.classList.remove('active');
    }

    hamburgerBtn.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', fecharMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', fecharMenu);

    /* ---------- Acordeão: abre/fecha qualquer categoria ao clicar ---------- */
    // Pega TODOS os ".menu-item" que têm uma "div.item-label" clicável
    // (ou seja: que NÃO são link <a> — esses têm filhos pra abrir/fechar)
    const todasCategorias = menuPanel.querySelectorAll('.menu-item');

    todasCategorias.forEach(item => {
        const label = item.querySelector(':scope > .item-label');
        const submenu = item.querySelector(':scope > .submenu');

        // Se o label for uma tag <a>, é link direto — não tem o que abrir/fechar
        if (!submenu || label.tagName === 'A') return;

        label.addEventListener('click', () => {
            const estaAberto = item.classList.contains('open');
            item.classList.toggle('open');
            submenu.style.maxHeight = estaAberto ? null : submenu.scrollHeight + 'px';

            // Se algum pai estava aberto, recalcula a altura dele também,
            // porque o filho cresceu/diminuiu (efeito em cascata)
            let pai = item.parentElement.closest('.menu-item');
            while (pai) {
                const submenuPai = pai.querySelector(':scope > .submenu');
                if (pai.classList.contains('open') && submenuPai) {
                    submenuPai.style.maxHeight = submenuPai.scrollHeight + 'px';
                }
                pai = pai.parentElement.closest('.menu-item');
            }
        });
    });

    /* ---------- Busca dentro do menu ---------- */
    const searchInput = document.getElementById('menuSearchInput');
    const clearBtn = document.getElementById('clearSearchBtn');
    const searchCount = document.getElementById('searchCount');
    const noResults = document.getElementById('noResults');

    // Lista plana com todos os itens, pra busca não precisar
    // varrer a árvore inteira toda vez
    const todosOsItens = Array.from(todasCategorias).map(item => {
        const label = item.querySelector(':scope > .item-label');
        const labelTextEl = label.querySelector('.label-text');
        return {
            item,
            labelTextEl,
            textoOriginal: labelTextEl.textContent,
            submenu: item.querySelector(':scope > .submenu')
        };
    });

    function normalizar(str) {
        return str
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    }

    function destacar(el, textoOriginal, queryNormalizada) {
        if (!queryNormalizada) {
            el.textContent = textoOriginal;
            return;
        }
        const textoNormalizado = normalizar(textoOriginal);
        const idx = textoNormalizado.indexOf(queryNormalizada);
        if (idx === -1) {
            el.textContent = textoOriginal;
            return;
        }
        const antes = textoOriginal.slice(0, idx);
        const trecho = textoOriginal.slice(idx, idx + queryNormalizada.length);
        const depois = textoOriginal.slice(idx + queryNormalizada.length);

        el.innerHTML = '';
        el.append(document.createTextNode(antes));
        const marcado = document.createElement('mark');
        marcado.className = 'hl';
        marcado.textContent = trecho;
        el.appendChild(marcado);
        el.append(document.createTextNode(depois));
    }

    function abrirAncestrais(item) {
        let pai = item.parentElement.closest('.menu-item');
        while (pai) {
            pai.classList.add('open');
            const submenuPai = pai.querySelector(':scope > .submenu');
            if (submenuPai) submenuPai.style.maxHeight = submenuPai.scrollHeight + 'px';
            pai = pai.parentElement.closest('.menu-item');
        }
    }

    function fecharTudo() {
        todosOsItens.forEach(({ item, submenu }) => {
            item.classList.remove('open');
            if (submenu) submenu.style.maxHeight = null;
        });
    }

    function executarBusca() {
        const query = normalizar(searchInput.value.trim());
        clearBtn.classList.toggle('show', query.length > 0);

        if (!query) {
            todosOsItens.forEach(({ item, labelTextEl, textoOriginal }) => {
                item.classList.remove('hidden-by-search');
                destacar(labelTextEl, textoOriginal, '');
            });
            fecharTudo();
            searchCount.classList.remove('show');
            noResults.classList.remove('show');
            return;
        }

        let totalEncontrados = 0;
        const itensParaMostrar = new Set();

        todosOsItens.forEach(({ item, textoOriginal }) => {
            if (normalizar(textoOriginal).includes(query)) {
                totalEncontrados++;
                itensParaMostrar.add(item);

                let pai = item.parentElement.closest('.menu-item');
                while (pai) {
                    itensParaMostrar.add(pai);
                    pai = pai.parentElement.closest('.menu-item');
                }
            }
        });

        todosOsItens.forEach(({ item, labelTextEl, textoOriginal }) => {
            const textoNormalizado = normalizar(textoOriginal);
            if (itensParaMostrar.has(item)) {
                item.classList.remove('hidden-by-search');
                destacar(labelTextEl, textoOriginal, textoNormalizado.includes(query) ? query : '');
            } else {
                item.classList.add('hidden-by-search');
            }
        });

        fecharTudo();
        todosOsItens.forEach(({ item, textoOriginal, submenu }) => {
            if (normalizar(textoOriginal).includes(query)) {
                abrirAncestrais(item);
                if (submenu) {
                    item.classList.add('open');
                    submenu.style.maxHeight = submenu.scrollHeight + 'px';
                }
            }
        });

        searchCount.textContent = `${totalEncontrados} resultado${totalEncontrados === 1 ? '' : 's'} encontrado${totalEncontrados === 1 ? '' : 's'}`;
        searchCount.classList.add('show');
        noResults.classList.toggle('show', totalEncontrados === 0);
    }

    searchInput.addEventListener('input', executarBusca);
    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        executarBusca();
        searchInput.focus();
    });

});