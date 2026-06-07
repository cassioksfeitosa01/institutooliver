// 1. CARREGAMENTO DOS COMPONENTES (FETCH)

// --- MENU ---
const containerMenu = document.getElementById('menu-principal');
if (containerMenu) {
    fetch('/components/menu.html')
        .then(response => response.text())
        .then(data => {
            containerMenu.innerHTML = data;
            console.log("✅ Menu carregado!");
            inicializarLogicaMenu();
        })
        .catch(err => console.error("Erro no Menu:", err));
}

// --- DEPOIMENTOS ---
const containerDepoimentos = document.getElementById('depoimentos-principais');
if (containerDepoimentos) {
    fetch('/components/depoimentos.html')
        .then(response => response.text())
        .then(data => {
            containerDepoimentos.innerHTML = data;
            console.log("✅ Depoimentos carregados!");
        })
        .catch(err => console.error("Erro nos Depoimentos:", err));
}

// --- RODAPÉ ---
const containerRodape = document.getElementById('rodape-principal');
if (containerRodape) {
    fetch('/components/rodape.html')
        .then(response => response.text())
        .then(data => {
            containerRodape.innerHTML = data;
            console.log("✅ Rodapé carregado!");
        })
        .catch(err => console.error("Erro no Rodapé:", err));
}

// 4. LÓGICA DO MENU E BUSCA

function inicializarLogicaMenu() {
    const btnMenu = document.getElementById("btn-menu");
    const navLista = document.getElementById("nav-lista");
    const categorias = document.querySelectorAll(".menu-item-cat");

    // Lógica da Busca
    const todosOsLinks = Array.from(document.querySelectorAll(".nav-links a")).map(a => ({
        texto: a.innerText,
        link: a.href
    }));

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
        btnMenu.addEventListener("click", (e) => {
            e.stopPropagation();
            btnMenu.classList.toggle("active");
            navLista.classList.toggle("active");
        });

        categorias.forEach((cat) => {
            cat.addEventListener("click", (e) => {
                e.stopPropagation();
                const submenu = cat.nextElementSibling;
                if (submenu && submenu.classList.contains("submenu")) {
                    submenu.classList.toggle("open");
                }
            });
        });

        document.addEventListener("click", (e) => {
            if (!navLista.contains(e.target) && !btnMenu.contains(e.target)) {
                btnMenu.classList.remove("active");
                navLista.classList.remove("active");
            }
        });
    }
}

// LÓGICA DO SLIDER MANUAL (EMBUTIDO)

class VideoSliderSection {
    constructor(root) {
        this.root = root;
        this.currentIndex = 0;
        this.itemsPerView = this.getItemsPerView();

        this.prevBtn = root.querySelector('.prev-arrow');
        this.nextBtn = root.querySelector('.next-arrow');
        this.track = root.querySelector('.videos-track');
        this.dotsIndicator = root.querySelector('.dots-indicator');
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
        this.setupWindowResize();
        this.updateSlider();
    }

    setupWindowResize() {
        window.addEventListener('resize', () => {
            const newItemsPerView = this.getItemsPerView();
            if (newItemsPerView !== this.itemsPerView) {
                this.itemsPerView = newItemsPerView;
                this.currentIndex = 0;
                this.dotsIndicator.innerHTML = '';
                this.createDots();
                this.updateSlider();
            }
        });
    }

    createDots() {
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
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevSlide());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }
        this.setupPlayButtons();
    }

    setupPlayButtons() {
        this.root.querySelectorAll('.play-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const videoPlayer = btn.closest('.video-player');
                const video = videoPlayer.querySelector('video');
                const overlay = videoPlayer.querySelector('.play-overlay');
                // Pausar outros vídeos sem zerar o tempo
                this.root.querySelectorAll('video').forEach((v) => { if (v !== video) v.pause(); });
                this.playVideo(video, overlay);
            });
        });
    }

    setupDragListeners() {
        this.wrapper = this.root.querySelector('.videos-wrapper');
        if (!this.wrapper) return;

        this.wrapper.addEventListener('mousedown', (e) => this.startDrag(e));
        this.wrapper.addEventListener('mousemove', (e) => this.drag(e));
        this.wrapper.addEventListener('mouseup', () => this.endDrag());
        this.wrapper.addEventListener('mouseleave', () => this.endDrag());

        this.wrapper.addEventListener('touchstart', (e) => this.startDrag(e), false);
        this.wrapper.addEventListener('touchmove', (e) => this.drag(e), false);
        this.wrapper.addEventListener('touchend', () => this.endDrag(), false);

        this.wrapper.addEventListener('selectstart', (e) => {
            if (this.isDragging) e.preventDefault();
        });
    }

    startDrag(e) {
        this.isDragging = true;
        this.startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        this.track.style.transition = 'none';
    }

    drag(e) {
        if (!this.isDragging) return;
        const currentClientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        this.currentX = currentClientX - this.startX;

        const offset = -this.currentIndex * (100 / this.itemsPerView) + (this.currentX / this.wrapper.offsetWidth) * 100;
        this.track.style.transform = `translateX(${offset}%)`;
    }

    endDrag() {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';

        if (Math.abs(this.currentX) > this.dragThreshold) {
            if (this.currentX > 0) {
                this.prevSlide();
            } else {
                this.nextSlide();
            }
        } else {
            this.updateSlider();
        }
    }

    nextSlide() {
        const totalGroups = Math.ceil(this.totalVideos / this.itemsPerView);
        if (this.currentIndex < totalGroups - 1) {
            this.currentIndex++;
            this.pauseAllVideos();
            this.updateSlider();
        }
    }

    prevSlide() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.pauseAllVideos();
            this.updateSlider();
        }
    }

    goToSlide(index) {
        this.currentIndex = index;
        this.pauseAllVideos();
        this.updateSlider();
    }

    updateSlider() {
        const offset = -this.currentIndex * (100 / this.itemsPerView);
        this.track.style.transform = `translateX(${offset}%)`;

        this.root.querySelectorAll('.dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });

        const totalGroups = Math.ceil(this.totalVideos / this.itemsPerView);
        if (this.prevBtn) this.prevBtn.disabled = this.currentIndex === 0;
        if (this.nextBtn) this.nextBtn.disabled = this.currentIndex === totalGroups - 1;

        this.root.querySelectorAll('.play-overlay').forEach((overlay) => {
            overlay.classList.remove('hidden');
        });
    }

    playVideo(video, overlay) {
        if (!video) return;
        // Mostrar controles nativos ao reproduzir e esconder o overlay
        overlay.classList.add('hidden');
        video.controls = true;

        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    overlay.classList.add('hidden');
                })
                .catch((error) => console.warn('Erro ao tocar o vídeo:', error));
        }

        const pauseHandler = () => {
            overlay.classList.remove('hidden');
            try { video.controls = false; } catch(e) {}
        };

        const endHandler = () => {
            overlay.classList.remove('hidden');
            try { video.controls = false; } catch(e) {}
            try { video.currentTime = 0; } catch(e) {}
        };

        // Remover handlers antigos (se existirem) e definir os novos
        video.removeEventListener('pause', pauseHandler);
        video.removeEventListener('ended', endHandler);
        video.addEventListener('pause', pauseHandler);
        video.addEventListener('ended', endHandler);
    }

    pauseAllVideos() {
        this.root.querySelectorAll('video').forEach((video) => {
            video.pause();
            video.currentTime = 0;
        });

        this.root.querySelectorAll('.play-overlay').forEach((overlay) => {
            overlay.classList.remove('hidden');
        });
    }
}

let slidersInited = false;

function inicializarSliderDepoimentos() {
    if (slidersInited) return;
    slidersInited = true;

    document.querySelectorAll('.video-slider-section').forEach((root) => {
        new VideoSliderSection(root);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    inicializarSliderDepoimentos();
});