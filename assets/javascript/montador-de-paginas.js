
// 1. CARREGAMENTO INTELIGENTE DE MÓDULOS (FETCH CONDICIONAL)

// --- MENU (Sempre carrega se houver a div) ---
const containerMenu = document.getElementById('menu-principal');
if (containerMenu) {
    fetch('/components/menu.html')
        .then(response => response.text())
        .then(data => {
            containerMenu.innerHTML = data;
            console.log("✅ Menu carregado!");
            inicializarLogicaMenu(); // Ativa a busca e os cliques do menu
        })
        .catch(err => console.error("Erro no Menu:", err));
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

// --- ESTEIRA DE VÍDEOS (Só carrega se a div existir na página) ---
const containerVideos = document.getElementById('secao-depoimentos');
if (containerVideos) {
    fetch('/components/depoimentos.html')
        .then(response => response.text())
        .then(data => {
            containerVideos.innerHTML = data;
            console.log("✅ Esteira de vídeos carregada apenas para esta página!");
            inicializarLogicaVideos(); // Ativa a pausa no play
        })
        .catch(err => console.error("Erro na Esteira:", err));
}


// 2. LÓGICA DOS VÍDEOS (Travar esteira ao dar Play)


function inicializarLogicaVideos() {
    const track = document.getElementById('trilho-videos');
    if (!track) return;

    const vids = track.querySelectorAll('video');

    vids.forEach(v => {
        v.addEventListener('play', () => {
            track.classList.add('pausada-total'); // Trava animação CSS
            vids.forEach(outro => {
                if (outro !== v) outro.pause(); // Pausa outros vídeos
            });
        });

        v.addEventListener('pause', () => track.classList.remove('pausada-total'));
        v.addEventListener('ended', () => track.classList.remove('pausada-total'));
    });
}

// 3. LÓGICA DO MENU E BUSCA 

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

    // Lógica de Abrir/Fechar Menu
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