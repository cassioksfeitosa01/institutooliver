
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


// --- DEPOIMENTOS (ESTEIRA AUTOMÁTICA COM SLIDER) ---
const containerDepoimentos = document.getElementById('secao-depoimentos');
if (containerDepoimentos) {
    fetch('/components/depoimentos.html')
        .then(response => response.text())
        .then(data => {
            containerDepoimentos.innerHTML = data;
            console.log("✅ Depoimentos carregados!");
            // Dispara a lógica do slider embutida abaixo
            inicializarLogicaEsteiraAutomatica();
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

// ==========================================
// LÓGICA DO SLIDER MANUAL (EMBUTIDO)
// ==========================================
function inicializarLogicaEsteiraAutomatica() {
    // Altere para id="wrapper-slider" no wrapper do seu HTML caso queira id próprio,
    // ou mantemos a classe padrão .slider-wrapper-manual para selecionar
    const wrapper = document.querySelector(".slider-wrapper-manual");
    const trilho = document.getElementById("trilho-slider");
    const btnPrev = document.getElementById("prev-btn");
    const btnNext = document.getElementById("next-btn");

    if (!wrapper || !trilho) return;

    // --- CONTROLE DAS SETAS ---
    function obterLarguraMovimento() {
        const card = trilho.querySelector(".card-short");
        return card ? card.offsetWidth + 16 : 300; // 16px é o espaçamento gap do CSS
    }

    if (btnNext) {
        btnNext.addEventListener("click", () => {
            wrapper.scrollBy({ left: obterLarguraMovimento(), behavior: "smooth" });
        });
    }

    if (btnPrev) {
        btnPrev.addEventListener("click", () => {
            wrapper.scrollBy({ left: -obterLarguraMovimento(), behavior: "smooth" });
        });
    }

    // --- CONTROLE DE TOQUE (TOUCH / MOUSE ARRASTAR) ---
    let isDown = false;
    let startX;
    let scrollLeft;

    // Eventos de Mouse (Desktop)
    wrapper.addEventListener("mousedown", (e) => {
        isDown = true;
        startX = e.pageX - wrapper.offsetLeft;
        scrollLeft = wrapper.scrollLeft;
    });

    wrapper.addEventListener("mouseleave", () => {
        isDown = false;
    });

    wrapper.addEventListener("mouseup", () => {
        isDown = false;
    });

    wrapper.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - wrapper.offsetLeft;
        const walk = (x - startX) * 1.5; 
        wrapper.scrollLeft = scrollLeft - walk;
    });

    // Eventos de Toque (Celular / Touchscreen)
    wrapper.addEventListener("touchstart", (e) => {
        startX = e.touches[0].pageX - wrapper.offsetLeft;
        scrollLeft = wrapper.scrollLeft;
    });

    wrapper.addEventListener("touchmove", (e) => {
        const x = e.touches[0].pageX - wrapper.offsetLeft;
        const walk = (x - startX) * 1.2;
        wrapper.scrollLeft = scrollLeft - walk;
    });
}


// ==========================================
// 4. LÓGICA DO MENU E BUSCA
// ==========================================

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