/**
 * ============================================================
 * [REFATORAÇÃO] MOVIMENTO DE SETAS E DESLIZE - 2026
 * ============================================================

 
class SliderController {
    constructor(sliderContainer) {
        this.container = sliderContainer;
        this.track = sliderContainer.querySelector('.videos-track');
        this.items = sliderContainer.querySelectorAll('.video-item');
        this.prevBtn = sliderContainer.querySelector('.prev-arrow');
        this.nextBtn = sliderContainer.querySelector('.next-arrow');
        // Os dots estão FORA do slider-container, então usamos nextElementSibling
        this.dotsContainer = sliderContainer.nextElementSibling;
        this.currentIndex = 0;
        this.itemsPerView = this.getItemsPerView();
        this.isDragging = false;
        this.startX = 0;
        this.currentX = 0;
        this.dragThreshold = 50;
        this.init();
    }

    /**
     * Inicializa o slider
     */
    init() {
        this.createDots();
        this.attachEventListeners();
        this.updateSlider();
    }
    
    /**
     * Detecta quantos itens devem aparecer por vez
     */
    getItemsPerView() {
        const width = window.innerWidth;
        if (width < 768) return 1;
        if (width < 1200) return 2;
        return 4;
    }
    
    /**
     * Cria os indicadores (dots)
     */
    createDots() {
        this.dotsContainer.innerHTML = '';
        const totalDots = Math.ceil(this.items.length / this.itemsPerView);
        
        for (let i = 0; i < totalDots; i++) {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => this.goToSlide(i));
            this.dotsContainer.appendChild(dot);
        }
    }
    
    /**
     * Atualiza a posição do slider
     */
    updateSlider() {
        const itemWidth = 100 / this.itemsPerView;
        const offset = this.currentIndex * itemWidth;
        this.track.style.transform = `translateX(-${offset}%)`;
        
        this.updateDots();
        this.updateArrows();
    }
    
    /**
     * Atualiza os dots (indicadores)
     */
    updateDots() {
        const dots = this.dotsContainer.querySelectorAll('.dot');
        const activePage = Math.floor(this.currentIndex / this.itemsPerView);
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === activePage);
        });
    }
    
    /**
     * Atualiza o estado dos botões de seta
     */
    updateArrows() {
        const maxIndex = Math.max(0, this.items.length - this.itemsPerView);
        this.prevBtn.disabled = this.currentIndex === 0;
        this.nextBtn.disabled = this.currentIndex >= maxIndex;
    }
    
    /**
     * Vai para um slide específico
     */
    goToSlide(index) {
        const maxIndex = Math.max(0, this.items.length - this.itemsPerView);
        const target = index * this.itemsPerView;
        this.currentIndex = Math.max(0, Math.min(target, maxIndex));
        this.updateSlider();
    }
    
    /**
     * Move para o próximo slide
     */
    nextSlide() {
        const maxIndex = Math.max(0, this.items.length - this.itemsPerView);
        const nextIndex = Math.min(this.currentIndex + this.itemsPerView, maxIndex);
        if (nextIndex !== this.currentIndex) {
            this.currentIndex = nextIndex;
            this.updateSlider();
        }
    }
    
    /**
     * Move para o slide anterior
     */
    prevSlide() {
        const prevIndex = Math.max(this.currentIndex - this.itemsPerView, 0);
        if (prevIndex !== this.currentIndex) {
            this.currentIndex = prevIndex;
            this.updateSlider();
        }
    }
    
    /**
     * Anexa todos os event listeners
     */
    attachEventListeners() {
        // Setas
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());

        // Touch (dedo/swipe)
        this.track.addEventListener('touchstart', (e) => this.handleTouchStart(e), false);
        this.track.addEventListener('touchmove', (e) => this.handleTouchMove(e), false);
        this.track.addEventListener('touchend', (e) => this.handleTouchEnd(e), false);

        // Mouse (arrastar)
        this.track.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.track.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.track.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.track.addEventListener('mouseleave', (e) => this.handleMouseLeave(e));

        // Atualiza o slider ao redimensionar
        window.addEventListener('resize', () => {
            const newItemsPerView = this.getItemsPerView();
            if (newItemsPerView !== this.itemsPerView) {
                this.itemsPerView = newItemsPerView;
                this.currentIndex = 0;
                this.createDots();
                this.updateSlider();
            }
        });
    }
    
    /**
     * ========== EVENTOS DE TOQUE (TOUCH) ==========
     */
    handleTouchStart(e) {
        // ignore touch start se for sobre o overlay de play
        if (e.target && e.target.closest && e.target.closest('.play-overlay')) return;
        this.isDragging = true;
        this.startX = e.touches[0].clientX;
    }
    
    handleTouchMove(e) {
        if (!this.isDragging) return;
        this.currentX = e.touches[0].clientX;
    }
    
    handleTouchEnd(e) {
        if (!this.isDragging) return;
        this.isDragging = false;
        
        const diff = this.startX - this.currentX;
        
        // Deslizou para a esquerda (próximo)
        if (diff > this.dragThreshold) {
            this.nextSlide();
        }
        // Deslizou para a direita (anterior)
        else if (diff < -this.dragThreshold) {
            this.prevSlide();
        }
    }
    
    /**
     * ========== EVENTOS DE MOUSE (CLICK + ARRASTAR) ==========
     */
    handleMouseDown(e) {
        // ignore mousedown se for sobre o overlay de play
        if (e.target && e.target.closest && e.target.closest('.play-overlay')) return;
        this.isDragging = true;
        this.startX = e.clientX;
        this.track.style.cursor = 'grabbing';
    }
    
    handleMouseMove(e) {
        if (!this.isDragging) return;
        this.currentX = e.clientX;
    }
    
    handleMouseUp(e) {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.track.style.cursor = 'grab';
        
        const diff = this.startX - this.currentX;
        
        // Arrastou para a esquerda (próximo)
        if (diff > this.dragThreshold) {
            this.nextSlide();
        }
        // Arrastou para a direita (anterior)
        else if (diff < -this.dragThreshold) {
            this.prevSlide();
        }
    }
    
    handleMouseLeave(e) {
        if (this.isDragging) {
            this.isDragging = false;
            this.track.style.cursor = 'grab';
        }
    }
}

/**
 * ========== INICIALIZAÇÃO ==========
 * Encontra todos os sliders na página e os inicializa
 */
document.addEventListener('DOMContentLoaded', () => {
    const sliderContainers = document.querySelectorAll('.slider-container');
    sliderContainers.forEach(sliderContainer => new SliderController(sliderContainer));
});

/* ============================================================
   Play overlay controller
   - garante play centralizado consistente
   - cria overlay se não existir
   - toggle play/pause no clique
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    const players = document.querySelectorAll('.video-player');
    players.forEach(player => {
        const video = player.querySelector('video');
        if (!video) return;
        // remove controles nativos até o usuário apertar play (evita overlay nativo)
        try { video.controls = false; } catch (e) {}

        // cria botão overlay se não existir
        let btn = player.querySelector('.play-overlay');
        if (!btn) {
            btn = document.createElement('button');
            btn.className = 'play-overlay';
            btn.setAttribute('aria-label', 'Play');
            btn.innerText = '▶';
            player.appendChild(btn);
        }
        // evita que mousedown/touchstart no botão propague para o track (previne swipe acidental)
        btn.addEventListener('mousedown', (ev) => { ev.stopPropagation(); });
        btn.addEventListener('touchstart', (ev) => { ev.stopPropagation(); });

        // determina se há fonte válida
        const sourceEl = video.querySelector('source');
        const src = (sourceEl && sourceEl.src) ? sourceEl.src.trim() : (video.currentSrc || video.src || '').trim();
        if (!src) {
            // sem vídeo disponível
            btn.innerText = 'Sem vídeo';
            btn.disabled = true;
            btn.classList.remove('hidden');
            return;
        }

        // remove controles nativos até o play (evita sobreposição dupla)
        try { video.controls = false; } catch (e) {}

        // estado inicial do overlay: mostra enquanto estiver pausado
        if (video.paused) btn.classList.remove('hidden'); else btn.classList.add('hidden');

        const showError = (message) => {
            btn.classList.remove('hidden');
            btn.innerText = 'Erro';
            btn.title = message;
            btn.disabled = true;
            try { video.controls = false; } catch (e) {}
        };

        // clique no overlay controla play/pause com tratamento de promise
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (btn.disabled) return;
            if (video.paused) {
                try { video.load(); } catch(e) {}
                const p = video.play();
                if (p && p.then) {
                    p.then(() => {
                        btn.classList.add('hidden');
                        try { video.controls = true; } catch (e) {}
                    }).catch(err => {
                        showError('Não foi possível reproduzir o vídeo');
                        console.warn('Play failed', err);
                    });
                } else {
                    btn.classList.add('hidden');
                    try { video.controls = true; } catch (e) {}
                }
            } else {
                video.pause();
            }
        });

        // esconde overlay quando o vídeo roda, mostra quando pausa
        video.addEventListener('play', () => { btn.classList.add('hidden'); try { video.controls = true; } catch(e){} });
        video.addEventListener('pause', () => { if (!btn.disabled) btn.classList.remove('hidden'); });

        // detectar erro de carregamento
        video.addEventListener('error', () => showError('Erro ao carregar o vídeo'));

        // quando houver quadro carregado, garante poster/capa visível
        video.addEventListener('canplay', () => {
            // some browsers may still show black; ensure poster removed so frame is visible
            // nothing extra necessário aqui, mas mantenha o manipulador para ajustes futuros
        });

        // clique na caixa do player também alterna play/pause (exceto quando clica no botão overlay)
        player.addEventListener('click', (e) => {
            if (e.target === btn || btn.disabled) return;
            if (video.paused) {
                try { video.load(); } catch(e) {}
                const p = video.play();
                if (p && p.then) {
                    p.then(() => { try { video.controls = true; } catch(e){} })
                     .catch(()=>{});
                }
            } else video.pause();
        });
    });
});
