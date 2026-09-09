/* 
    Variável - Pedacinho de memória
    que eu posso guardar o que eu quiser

    Função - Pedacinho de código QUE só EXECUTA
    Quando é chamado

    Algoritmo - Receita do Bolo
    Lógica de Programação -  Fazer o bolo

    // Algoritmo do nosso sistema
    // Lógica de programação

    [x] Saber quem é o botão
    [x] Saber quando o botão foi clicado
    [x] Saber quem é o textarea  
    [x] Pegar o que tem dentro dele
    [x] Enviar para a IA
    [x] Pegar a resposta da IA e colocar na tela 
    [/] Estilizar a resposta     

    // Ir no HTML e pegar o botão
    // HTML = document (documento)
    // Selecionar (querySelector)
    // Quem ? Botão
    // Apelido para o botão - classes(class) = .
    fetch - ferramenta do JS para se comunicar com o servidor
*/

// Descobri que é o botao
let botao = document.querySelector(".botao-gerar")
let modelo = "openai/gpt-oss-120b"

function limparRespostaIA(conteudo) {
    if (!conteudo) return ""

    return conteudo
        .replace(/```(?:html|css|xml)?/gi, "")
        .replace(/```/g, "")
        .trim()
}

function prepararPreview(codigo) {
    if (!codigo) return ""

    if (codigo.includes("<style>")) {
        return codigo.replace(/<\/style>/i, "html, body { margin: 0; min-height: 100%; height: 100%; } body { display: grid; place-items: center; } </style>")
    }

    return `
<style>
  html, body { margin: 0; height: 100%; }
  body { display: grid; place-items: center; }
</style>
${codigo}
`
}

function gerarFallback(textoUsuario) {
    let descricao = textoUsuario?.trim() || "botão animado"

    return `
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    display: grid;
    place-items: center;
    background: linear-gradient(135deg, #0f172a, #1e293b);
    font-family: Arial, sans-serif;
  }
  .card {
    width: min(420px, 85vw);
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(148, 163, 184, 0.3);
    border-radius: 18px;
    padding: 32px 24px;
    text-align: center;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  }
  h2 {
    margin: 0 0 12px;
    color: #f8fafc;
    font-size: 28px;
  }
  p {
    margin: 0 0 22px;
    color: #cbd5e1;
    font-size: 16px;
  }
  button {
    border: none;
    border-radius: 999px;
    padding: 14px 28px;
    background: linear-gradient(90deg, #2269c5, #075eff);
    color: white;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    animation: pulse 1.5s infinite;
  }
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
</style>
<div class="card">
  <h2>${descricao}</h2>
  <p>Preview gerado localmente</p>
  <button>Ver mais</button>
</div>
`
}

async function gerarCodigo() {
    let textoUsuario = document.querySelector(".caixa-texto").value
    let blocoCodigo = document.querySelector(".bloco-codigo")
    let resultadoCodigo = document.querySelector(".resultado-codigo")

    if (!textoUsuario.trim()) {
        document.querySelector(".caixa-texto").focus()
        return
    }

      let resultado = gerarFallback(textoUsuario)

    try {
        let resposta = await fetch("/api/gerar", {
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: modelo,
                messages: [
                    { role: "system", content: "Você é um gerador de código HTML e CSS.Você é um gerador de código HTML e CSS. Responda SOMENTE com código puro. NUNCA use crases, markdown ou explicações. Formato: primeiro <style> com o CSS, depois o HTML. Siga EXATAMENTE o que o usuário pedir. Se pedir algo quicando, use translateY no @keyframes. Se pedir algo girando, use rotate. Faca comentarios explicando tudo que foi feito alem de formatar o codigo." },
                    { role: "user", content: textoUsuario }
                ]
            })
        })

        if (!resposta.ok) {
            const texto = await resposta.text()
            console.error("Erro da Groq:", resposta.status, texto)
            return
        }

        let dados = await resposta.json()
        let conteudoApi = dados?.choices?.[0]?.message?.content

        if (conteudoApi) {
            resultado = limparRespostaIA(conteudoApi)
        }
    } catch (error) {
        console.error(error)
    }

    blocoCodigo.textContent = resultado
    resultadoCodigo.srcdoc = prepararPreview(resultado)
}

// ficar de olho no botao, quando clicado chamar o gerarCodigo
botao.addEventListener("click", gerarCodigo)



// vizinho curioso (addEventListener)
// adicionar ouvinte de eventos
