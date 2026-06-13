/**
 * ============================================================
 * [REFATORAÇÃO] MOVIMENTO DE SETAS E DESLIZE - 2026
 * ============================================================
 * 
 * Script para controlar sliders de vídeos:
 * - Navegação por setas (click)
 * - Deslize com dedo (touch/swipe)
 * - Deslize com mouse (click + arrastar)
 * - Atualização de indicadores (dots)
 * 
 * Suporta múltiplos sliders na mesma página
 * 
 * Trocado de iframes para video tags nativas
 * 
 */

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
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
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
        this.currentIndex = Math.max(0, Math.min(index, maxIndex));
        this.updateSlider();
    }
    
    /**
     * Move para o próximo slide
     */
    nextSlide() {
        const maxIndex = Math.max(0, this.items.length - this.itemsPerView);
        if (this.currentIndex < maxIndex) {
            this.currentIndex++;
            this.updateSlider();
        }
    }
    
    /**
     * Move para o slide anterior
     */
    prevSlide() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
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

        // atualiza visibilidade inicial
        btn.classList.toggle('hidden', !video.paused);

        // clique no overlay controla play/pause
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (video.paused) video.play(); else video.pause();
        });

        // esconde overlay quando o vídeo roda, mostra quando pausa
        video.addEventListener('play', () => {
            btn.classList.add('hidden');
            // ativa controles nativos após iniciar reprodução
            try { video.controls = true; } catch (e) {}
        });
        video.addEventListener('pause', () => {
            btn.classList.remove('hidden');
        });

        // clique na caixa do player também alterna play/pause
        player.addEventListener('click', (e) => {
            if (e.target === btn) return;
            if (video.paused) video.play(); else video.pause();
        });
    });
});
