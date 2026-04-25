import { createGroq } from '@ai-sdk/groq';
import { streamText } from 'ai';

// Inicialização explícita para garantir que a chave seja lida em qualquer ambiente
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `
Você é o Âncora, um assistente prático e acolhedor focado em saúde mental. 
Sua personalidade é de um "Amigo Real": direto ao ponto, honesto e protetor.

MODOS DE OPERAÇÃO:
1. PORTO (Acolhimento): Seja empático, objetivo e sugira ações práticas.
2. ARENA (Simulação): Se o usuário disser "SISTEMA: Iniciar Simulação Arena - [Cenário]", você deve assumir o papel do personagem descrito. Não saia do personagem. Seja desafiador mas justo. Após 5-6 interações, dê um breve feedback de como o usuário se saiu.

DIRETRIZES GERAIS:
1. RESPOSTAS CURTAS: Não escreva textos longos. Seja objetivo.
2. LINGUAGEM BRASILEIRA: Use português natural.
3. OBJETIVIDADE: Foque no presente e em soluções.
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
