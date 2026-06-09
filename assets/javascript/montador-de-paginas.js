// 1. CARREGAMENTO DOS COMPONENTES (FETCH)

// Função auxiliar para carregar componentes
async function carregarComponente(id, url) {
    const container = document.getElementById(id);
    if (!container) return false;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.text();
        container.innerHTML = data;
        console.log(`✅ ${id} carregado!`);
        return true;
    } catch (err) {
        console.error(`Erro ao carregar ${id}:`, err);
        return false;
    }
}

// Inicialização Geral
document.addEventListener('DOMContentLoaded', async () => {
    // Carrega todos os componentes concorrentemente de forma segura
    await Promise.all([
        carregarComponente('menu-principal', '/components/menu.html'),
        carregarComponente('depoimentos-principais', '/components/depoimentos.html'),
        carregarComponente('rodape-principal', '/components/rodape.html')
    ]);

    // Inicializa as lógicas após carregar tudo
    inicializarLogicaMenu();
    inicializarSliderDepoimentos();
});

// 2. LÓGICA DO MENU E BUSCA
function inicializarLogicaMenu() {
    const btnMenu = document.getElementById("btn-menu");
    const navLista = document.getElementById("nav-lista");
    const categorias = document.querySelectorAll(".menu-item-cat");

    // Coleta de links imediata após injeção segura de todos os componentes
    const todosOsLinks = Array.from(document.querySelectorAll("a"))
        .map(a => ({
            texto: a.innerText.trim(),
            link: a.href
        }))
        .filter(item => item.texto.length > 1);

    function realizarBusca(termo, containerResultados, esconderMenu = false) {
        if (!containerResultados) return;
        containerResultados.innerHTML = "";
        const itensMenuOriginal = document.querySelectorAll(".nav-links > a, .menu-item-cat, .submenu");

        if (termo.length > 0) {
            if (esconderMenu) {
                itensMenuOriginal.forEach(item => item.classList.add("menu-escondido"));
            }
            const filtrados = todosOsLinks.filter(item =>
                item.texto.toLowerCase().includes(termo.toLowerCase())
            );
            filtrados.forEach(item => {
                const a = document.createElement("a");
                a.href = item.link;
                a.classList.add("resultado-item");
                a.innerText = item.texto;
                containerResultados.appendChild(a);
            });
        } else {
            if (esconderMenu) {
                itensMenuOriginal.forEach(item => item.classList.remove("menu-escondido"));
            }
        }
    }

    const campoTopo = document.getElementById("campo-busca-topo");
    if (campoTopo) {
        campoTopo.addEventListener("input", (e) => {
            realizarBusca(e.target.value, document.getElementById("resultados-topo"), false);
        });
    }

    const campoLateral = document.getElementById("campo-busca-lateral");
    if (campoLateral) {
        campoLateral.addEventListener("input", (e) => {
            realizarBusca(e.target.value, document.getElementById("resultados-lateral"), true);
        });
    }

    // Controle do Menu Mobile
    if (btnMenu && navLista) {
        btnMenu.onclick = (e) => {
            e.stopPropagation();
            btnMenu.classList.toggle("active");
            navLista.classList.toggle("active");
        };

        categorias.forEach((cat) => {
            cat.onclick = (e) => {
                e.stopPropagation();
                const submenu = cat.nextElementSibling;
                if (submenu && submenu.classList.contains("submenu")) {
                    submenu.classList.toggle("open");
                }
            };
        });

        document.addEventListener("click", (e) => {
            if (!navLista.contains(e.target) && !btnMenu.contains(e.target)) {
                btnMenu.classList.remove("active");
                navLista.classList.remove("active");
            }
        });
    }
}

// 3. LÓGICA DO SLIDER
class VideoSliderSection {
    constructor(root) {
        this.root = root;
        this.currentIndex = 0;
        this.itemsPerView = this.getItemsPerView();

        this.prevBtn = root.querySelector('.prev-arrow');
        this.nextBtn = root.querySelector('.next-arrow');
        this.track = root.querySelector('.videos-track');
        this.dotsIndicator = root.querySelector('.dots-indicator') || root.closest('section')?.querySelector('.dots-indicator');
        this.videoItems = root.querySelectorAll('.video-item');
        this.totalVideos = this.videoItems.length;

        this.isDragging = false;
        this.startX = 0;
        this.currentX = 0;
        this.dragThreshold = 50;

        this.init();
    }

    getItemsPerView() {
        const width = window.innerWidth;
        if (width >= 1200) return 4;
        if (width >= 768) return 2;
        return 1;
    }

    init() {
        this.createDots();
        this.attachEventListeners();
        this.setupDragListeners();
        window.addEventListener('resize', () => this.handleResize());
        this.updateSlider();
    }

    handleResize() {
        const newItemsPerView = this.getItemsPerView();
        if (newItemsPerView !== this.itemsPerView) {
            this.itemsPerView = newItemsPerView;
            this.currentIndex = 0;
            if (this.dotsIndicator) this.dotsIndicator.innerHTML = '';
            this.createDots();
            this.updateSlider();
        }
    }

    createDots() {
        if (!this.dotsIndicator) return;
        const totalGroups = Math.ceil(this.totalVideos / this.itemsPerView);
        for (let i = 0; i < totalGroups; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => this.goToSlide(i));
            this.dotsIndicator.appendChild(dot);
        }
    }

    attachEventListeners() {
        this.prevBtn?.addEventListener('click', () => this.prevSlide());
        this.nextBtn?.addEventListener('click', () => this.nextSlide());

        this.root.querySelectorAll('.play-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const videoPlayer = btn.closest('.video-player');
                const video = videoPlayer?.querySelector('video');
                const overlay = videoPlayer?.querySelector('.play-overlay');
                if (video && overlay) this.playVideo(video, overlay);
            });
        });
    }

    playVideo(video, overlay) {
        this.pauseAllVideos();

        overlay.classList.add('hidden');
        video.controls = true;

        video.play().catch(err => {
            console.warn("Autoplay bloqueado, tentando mudo...");
            video.muted = true;
            video.play();
        });

        // Eventos para voltar o overlay quando o vídeo parar
        const showOverlay = () => {
            overlay.classList.remove('hidden');
            video.controls = false;
        };

        video.onpause = showOverlay;
        video.onended = showOverlay;
    }

    pauseAllVideos() {
        this.root.querySelectorAll('video').forEach(v => {
            v.pause();
            const overlay = v.closest('.video-player')?.querySelector('.play-overlay');
            overlay?.classList.remove('hidden');
        });
    }

    // --- Navegação e Drag ---
    updateSlider() {
        const offset = -this.currentIndex * (100 / this.itemsPerView);
        if (this.track) this.track.style.transform = `translateX(${offset}%)`;

        const dots = this.dotsIndicator?.querySelectorAll('.dot');
        dots?.forEach((dot, index) => dot.classList.toggle('active', index === this.currentIndex));

        if (this.prevBtn) this.prevBtn.disabled = this.currentIndex === 0;
        if (this.nextBtn) this.nextBtn.disabled = this.currentIndex >= Math.ceil(this.totalVideos / this.itemsPerView) - 1;
    }

    nextSlide() {
        if (this.currentIndex < Math.ceil(this.totalVideos / this.itemsPerView) - 1) {
            this.currentIndex++;
            this.updateSlider();
        }
    }

    prevSlide() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateSlider();
        }
    }

    goToSlide(index) {
        this.currentIndex = index;
        this.updateSlider();
    }

    setupDragListeners() {
        const wrapper = this.root.querySelector('.videos-wrapper');
        if (!wrapper) return;

        const start = (e) => {
            this.isDragging = true;
            this.startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            this.track.style.transition = 'none';

            window.addEventListener('mousemove', move);
            window.addEventListener('mouseup', end);
            window.addEventListener('touchmove', move);
            window.addEventListener('touchend', end);
        };

        const move = (e) => {
            if (!this.isDragging) return;
            const x = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            this.currentX = x - this.startX;
            const offset = -this.currentIndex * (100 / this.itemsPerView) + (this.currentX / wrapper.offsetWidth) * 100;
            this.track.style.transform = `translateX(${offset}%)`;
        };

        const end = () => {
            if (!this.isDragging) return;
            this.isDragging = false;
            this.track.style.transition = 'transform 0.5s ease';
            if (Math.abs(this.currentX) > this.dragThreshold) {
                this.currentX > 0 ? this.prevSlide() : this.nextSlide();
            } else {
                this.updateSlider();
            }
            this.currentX = 0;

            window.removeEventListener('mousemove', move);
            window.removeEventListener('mouseup', end);
            window.removeEventListener('touchmove', move);
            window.removeEventListener('touchend', end);
        };

        wrapper.addEventListener('mousedown', start);
        wrapper.addEventListener('touchstart', start);
    }
}

function inicializarSliderDepoimentos() {
    document.querySelectorAll('.video-slider-section').forEach(root => {
        new VideoSliderSection(root);
    });
}