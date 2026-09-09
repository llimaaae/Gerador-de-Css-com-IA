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

    const chaveApi = localStorage.getItem("groq_api_key");

    if (!chaveApi) {
        blocoCodigo.textContent = "API key não configurada.";
        return;
    }

    botao.textContent = "Gerando...";
    botao.disabled = true;

    try {
        const resposta = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${chaveApi}`
                },

                body: JSON.stringify({
                    model: "openai/gpt-oss-120b",

                    messages: [
                        {
                            role: "system",
                            content: `
Você é um gerador de HTML e CSS.

O usuário irá descrever algo que deseja criar.

Responda SOMENTE com código.

Não use Markdown.
Não use crases.
Não escreva explicações fora do código.

Primeiro escreva o <style>.
Depois escreva o HTML.

Crie um resultado visual completo e funcional.

Quando o pedido exigir uma imagem, use uma URL pública HTTPS válida em <img src="..."> ou em background-image. Nunca use caminhos locais inexistentes, como ./imagem.png.

Se o usuário pedir animação:
- use translateY para quicar;
- use rotate para girar;
- use @keyframes quando necessário.

Adicione comentários no código explicando as partes importantes.
                            `
                        },

                        {
                            role: "user",
                            content: textoUsuario
                        }
                    ],

                    temperature: 1,
                    max_completion_tokens: 2048,
                    top_p: 1,
                    stream: false,
                    reasoning_effort: "medium"
                })
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
            console.error(dados);
            blocoCodigo.textContent = "Não foi possível gerar o código.";
            return;
        }

        const codigoGerado =
            dados?.choices?.[0]?.message?.content;

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