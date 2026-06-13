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
        this.dotsContainer = sliderContainer.querySelector('.dots-indicator');
        
        console.log('🎯 SliderController - Elementos encontrados:');
        console.log('  - Track:', this.track);
        console.log('  - Items:', this.items.length);
        console.log('  - Prev Button:', this.prevBtn);
        console.log('  - Next Button:', this.nextBtn);
        console.log('  - Dots Container:', this.dotsContainer);
        
        this.currentIndex = 0;
        this.itemsPerView = this.getItemsPerView();
        this.isDragging = false;
        this.startX = 0;
        this.currentX = 0;
        this.dragThreshold = 50;
        
        console.log(`  - Items Per View: ${this.itemsPerView}`);
        
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
        console.log(`➡️ nextSlide() - currentIndex: ${this.currentIndex}, maxIndex: ${maxIndex}`);
        if (this.currentIndex < maxIndex) {
            this.currentIndex++;
            console.log(`   → Movendo para índice ${this.currentIndex}`);
            this.updateSlider();
        } else {
            console.log('   ⛔ Já está no final!');
        }
    }
    
    /**
     * Move para o slide anterior
     */
    prevSlide() {
        console.log(`⬅️ prevSlide() - currentIndex: ${this.currentIndex}`);
        if (this.currentIndex > 0) {
            this.currentIndex--;
            console.log(`   → Movendo para índice ${this.currentIndex}`);
            this.updateSlider();
        } else {
            console.log('   ⛔ Já está no início!');
        }
    }
    
    /**
     * Anexa todos os event listeners
     */
    attachEventListeners() {
        console.log('🎧 Anexando event listeners...');
        
        // Setas
        this.prevBtn.addEventListener('click', () => {
            console.log('🖱️ Clicou em PREV');
            this.prevSlide();
        });
        this.nextBtn.addEventListener('click', () => {
            console.log('🖱️ Clicou em NEXT');
            this.nextSlide();
        });
        console.log('  ✅ Event listeners de setas anexados');
        
        // Touch (dedo/swipe)
        this.track.addEventListener('touchstart', (e) => this.handleTouchStart(e), false);
        this.track.addEventListener('touchmove', (e) => this.handleTouchMove(e), false);
        this.track.addEventListener('touchend', (e) => this.handleTouchEnd(e), false);
        console.log('  ✅ Event listeners de touch anexados');
        
        // Mouse (arrastar)
        this.track.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.track.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.track.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.track.addEventListener('mouseleave', (e) => this.handleMouseLeave(e));
        console.log('  ✅ Event listeners de mouse anexados');
        
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
        console.log('  ✅ Event listener de resize anexado');
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
    console.log('🚀 Iniciando SliderController...');
    const sliderContainers = document.querySelectorAll('.slider-container');
    console.log(`📦 Encontrados ${sliderContainers.length} slider(s)`);
    
    sliderContainers.forEach((sliderContainer, index) => {
        console.log(`⚙️ Inicializando slider ${index + 1}...`);
        new SliderController(sliderContainer);
    });
    console.log('✅ SliderController inicializado com sucesso!');
});
