export default async function handler(request, response) {
    if (request.method !== "POST") {
        return response.status(405).json({ error: "Método não permitido." });
    }

    const texto = request.body?.texto?.trim();

    if (!texto) {
        return response.status(400).json({ error: "Descreva o que deseja criar." });
    }

    if (!process.env.GROQ_API_KEY) {
        return response.status(500).json({ error: "A chave da API não foi configurada no servidor." });
    }

    try {
        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-120b",
                messages: [
                    {
                        role: "system",
                        content: "Você é um gerador de HTML e CSS. Responda somente com código puro, sem Markdown, crases ou explicações. Primeiro escreva o <style>, depois o HTML. Crie um resultado visual completo e funcional. Quando o pedido exigir imagem, use uma URL pública HTTPS válida. Use translateY para quicar, rotate para girar e @keyframes quando necessário."
                    },
                    { role: "user", content: texto }
                ],
                temperature: 1,
                max_completion_tokens: 2048,
                stream: false,
                reasoning_effort: "medium"
            })
        });

        const dados = await groqResponse.json();

        if (!groqResponse.ok) {
            console.error("Erro da Groq:", dados);
            return response.status(groqResponse.status).json({ error: "A IA não conseguiu gerar o código." });
        }

        return response.status(200).json({
            codigo: dados?.choices?.[0]?.message?.content || ""
        });
    } catch (error) {
        console.error("Erro no servidor:", error);
        return response.status(500).json({ error: "Erro interno ao falar com a IA." });
    }
}
