// Função para carregar o Menu
fetch('/menu.html')
    .then(response => {
        if (!response.ok) throw new Error('Não achei o arquivo menu.html');
        return response.text();
    })
    .then(data => {
        const container = document.getElementById('menu-principal');
        if (container) {
            container.innerHTML = data;
            console.log("✅ Menu carregado com sucesso!");
            // Agora que o menu existe, ativa os botões e a busca
            inicializarLogicaMenu();
        }
    })
    .catch(err => console.error("❌ Erro no Menu:", err));

// Função para carregar o Rodapé (Separada para não travar o menu)
fetch('/rodape.html')
    .then(response => {
        if (!response.ok) throw new Error('Não achei o arquivo rodape.html');
        return response.text();
    })
    .then(data => {
        const container = document.getElementById('rodape-principal');
        if (container) {
            container.innerHTML = data;
            console.log("✅ Rodapé carregado com sucesso!");
        }
    })
    .catch(err => console.error("❌ Erro no Rodapé:", err));

    // Função para carregar a seção do professor )

    fetch('/professor.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('secao-professor').innerHTML = data;
    });

// Toda a sua lógica de abrir, fechar e BUSCA
function inicializarLogicaMenu() {
    const btnMenu = document.getElementById("btn-menu");
    const navLista = document.getElementById("nav-lista");
    const categorias = document.querySelectorAll(".menu-item-cat");

    // --- LÓGICA DA BUSCA (Ajustada) ---
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

    // --- LÓGICA DE ABRIR/FECHAR ---
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