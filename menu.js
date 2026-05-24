// FIXME: SCRIPT DO MENU: ABRE, FECHA, FAZ O "X" E CONTROLA OS SUBMENUS

document.addEventListener("DOMContentLoaded", () => {
    const btnMenu = document.getElementById("btn-menu");
    const navLista = document.getElementById("nav-lista");
    const categorias = document.querySelectorAll(".menu-item-cat");

    // 1. Abre e fecha o menu lateral
    btnMenu.addEventListener("click", (e) => {
        e.stopPropagation();
        btnMenu.classList.toggle("active");
        navLista.classList.toggle("active");
    });

    // 2. Abre e fecha subcategorias (Mãe e Filhas)
    categorias.forEach((cat) => {
        cat.addEventListener("click", (e) => {
            e.stopPropagation(); // IMPORTANTE: Não deixa o clique subir para o pai
            const submenu = cat.nextElementSibling;
            if (submenu && submenu.classList.contains("submenu")) {
                submenu.classList.toggle("open");
            }
        });
    });

    // 3. Fecha tudo se clicar fora
    document.addEventListener("click", (e) => {
        if (!navLista.contains(e.target) && !btnMenu.contains(e.target)) {
            btnMenu.classList.remove("active");
            navLista.classList.remove("active");
        }
        document.getElementById("resultados-topo").innerHTML = "";
    });

    // 4. Lógica de Busca (Para as duas buscas funcionarem)
    const todosOsLinks = Array.from(document.querySelectorAll(".nav-links a")).map(a => ({
        texto: a.innerText,
        link: a.href
    }));

    function realizarBusca(termo, containerResultados, esconderMenu = false) {
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

    document.getElementById("campo-busca-topo").addEventListener("input", (e) => {
        realizarBusca(e.target.value, document.getElementById("resultados-topo"), false);
    });

    document.getElementById("campo-busca-lateral").addEventListener("input", (e) => {
        realizarBusca(e.target.value, document.getElementById("resultados-lateral"), true);
    });
});