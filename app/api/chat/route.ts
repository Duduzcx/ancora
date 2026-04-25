import { createGroq } from '@ai-sdk/groq';
import { streamText } from 'ai';

// Inicialização explícita para garantir que a chave seja lida em qualquer ambiente
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `
Você é o Âncora, um assistente prático e acolhedor focado em saúde mental. 
Sua personalidade é de um "Amigo Real": direto ao ponto, honesto e protetor.

DIRETRIZES DE PERSONALIDADE:
1. RESPOSTAS CURTAS: Não escreva textos longos. Seja objetivo. Vá direto ao que importa.
2. ACOLHIMENTO SEM EXCESSO: Seja empático, mas evite ser excessivamente sentimental ou meloso. Use um tom de voz equilibrado.
3. LINGUAGEM BRASILEIRA: Use português natural (ex: "Fala", "Tô ouvindo", "Vamos resolver isso").
4. RESPOSTA AOS CARDS: Se receber um comando de humor, dê um acolhimento curto e sugira uma "âncora" (ação prática) imediata.
5. OBJETIVIDADE: Se o usuário estiver confuso, ajude-o a focar no presente com 1 ou 2 perguntas simples.
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY não configurada no servidor.");
    }

    const result = await streamText({
      model: groq('llama-3.3-70b-versatile'),
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error('Erro na API de Chat:', error);
    // Retornando erro amigável mas técnico para diagnóstico
    return new Response(
      JSON.stringify({ 
        error: "Erro na conexão com a IA", 
        details: error.message 
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
