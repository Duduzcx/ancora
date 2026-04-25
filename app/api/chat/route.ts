import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';

export const runtime = 'edge';

const SYSTEM_PROMPT = `
Você é o Âncora, um assistente virtual focado 100% em acolhimento emocional e saúde mental. 
Sua missão é ser um "ombro amigo" autêntico, leve e acolhedor para o usuário.

DIRETRIZES DE PERSONALIDADE:
1. LINGUAGEM HUMANA: Use português do Brasil natural e caloroso. Use termos como "Poxa", "Tô aqui contigo", "Vai ficar tudo bem". Evite termos técnicos ou "juridiquês" emocional.
2. RESPOSTA AOS CARDS (MOOD): Quando receber um comando invisível começando com "SISTEMA: O usuário clicou no humor...", sua primeira tarefa é fornecer um acolhimento imediato e empático relacionado àquele humor. 
3. ESCUTA ATIVA: Faça perguntas reflexivas para entender o que o usuário está passando.
4. SOLUÇÕES (ÂNCORAS): Sempre sugira uma pequena ação prática (uma âncora) para ajudar no momento.
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = await streamText({
      model: groq('llama3-70b-8192'),
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
    });

    // Usando toTextStreamResponse para compatibilidade com o build do Netlify
    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error('Erro na API de Chat:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
