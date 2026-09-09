const botao = document.querySelector(".botao-gerar");
const caixaTexto = document.querySelector(".caixa-texto");
const blocoCodigo = document.querySelector(".bloco-codigo");
const preview = document.querySelector(".resultado-codigo");

const modelo = "openai/gpt-oss-120b";

function limparCodigo(codigo) {
    return codigo
        .replace(/```html/gi, "")
        .replace(/```css/gi, "")
        .replace(/```xml/gi, "")
        .replace(/```/g, "")
        .trim();
}

function prepararPreview(codigo) {
    if (!codigo) return "";

    if (codigo.includes("<style>")) {
        return codigo.replace(
            "</style>",
            `
            html, body {
                margin: 0;
                width: 100%;
                height: 100%;
            }

            body {
                display: grid;
                place-items: center;
            }
            </style>
            `
        );
    }

    return `
        <style>
            html, body {
                margin: 0;
                width: 100%;
                height: 100%;
            }

            body {
                display: grid;
                place-items: center;
            }
        </style>

        ${codigo}
    `;
}

async function gerarCodigo() {
    const textoUsuario = caixaTexto.value.trim();

    if (!textoUsuario) {
        caixaTexto.focus();
        return;
    }

    botao.textContent = "Gerando...";
    botao.disabled = true;

    try {
        const resposta = await fetch(
            "/api/generate",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    texto: textoUsuario
                })
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
            console.error(dados);
            blocoCodigo.textContent = dados?.error || "Não foi possível gerar o código.";
            return;
        }

        const codigoGerado = dados?.codigo;

        if (!codigoGerado) {
            blocoCodigo.textContent = "Nenhum código foi gerado.";
            return;
        }

        const codigoLimpo = limparCodigo(codigoGerado);

        blocoCodigo.textContent = codigoLimpo;

        preview.srcdoc = prepararPreview(codigoLimpo);

    } catch (erro) {
        console.error(erro);
        blocoCodigo.textContent = "Erro ao gerar o código.";
    }

    botao.textContent = "Gerar código";
    botao.disabled = false;
}

botao.addEventListener("click", gerarCodigo);