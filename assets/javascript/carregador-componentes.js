// Procura a div com o ID 'rodape' na página
const caixaRodape = document.getElementById('rodape');

if (caixaRodape) {
    // A BARRA '/' ANTES DE COMPONENTS DIZ: "VOLTE PARA A RAIZ DO SITE E PROCURE DALI"
    fetch('/components/rodape.html')
        .then(resposta => resposta.text())
        .then(html => {
            // Injeta o código do rodapé direto dentro da div vazia
            caixaRodape.innerHTML = html;
        });
}
