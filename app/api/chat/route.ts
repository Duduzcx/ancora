import { createGroq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import { createServerSupabaseClient } from '@/lib/supabase-server';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `
És o Âncora, um assistente de saúde mental prático e acolhedor. 
Sua personalidade é de um "Amigo Real": direto ao ponto, honesto e protetor.

IMPORTANTE: As nossas conversas SÃO GRAVADAS de forma segura e privada no histórico do utilizador. 
Nunca digas que a conversa é temporária ou que não é guardada. 
O utilizador pode aceder a este histórico quando quiser na barra lateral.

MODOS DE OPERAÇÃO:
1. PORTO (Acolhimento): Seja empático, objetivo e sugira ações práticas.
2. ARENA (Simulação): Se o usuário disser "SISTEMA: Iniciar Simulação Arena", assuma o papel descrito.

DIRETRIZES GERAIS:
1. RESPOSTAS CURTAS: No máximo 2-3 parágrafos curtos.
2. LINGUAGEM BRASILEIRA: Use português natural.
3. OBJETIVIDADE: Foque no presente e em soluções.
`;

export async function POST(req: Request) {
  try {
    const { messages, chatId: reqChatId } = await req.json();
    let chatId = reqChatId;

    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY não configurada no servidor.");
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Lógica de gravação inicial (User Message)
    if (user) {
      const lastUserMessage = messages[messages.length - 1];
      
      // Se não houver chatId, cria o chat primeiro
      if (!chatId && lastUserMessage.role === 'user') {
        const title = lastUserMessage.content.split(' ').slice(0, 3).join(' ') || "Nova Conversa";
        const { data: newChat } = await supabase
          .from('chats')
          .insert({ user_id: user.id, title })
          .select()
          .single();
        
        if (newChat) chatId = newChat.id;
      }

      // Salva a mensagem do usuário
      if (chatId && lastUserMessage.role === 'user') {
        await supabase.from('messages').insert({
          chat_id: chatId,
          role: 'user',
          content: lastUserMessage.content
        });
      }
    }

    const result = await streamText({
      model: groq('llama-3.3-70b-versatile'),
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      onFinish: async (event) => {
        // Grava a resposta da IA no banco
        if (chatId && user) {
          await supabase.from('messages').insert({
            chat_id: chatId,
            role: 'assistant',
            content: event.text
          });
        }
      },
    });

    // Adiciona o chatId no header da resposta para o frontend saber o ID do chat recém-criado
    const response = result.toDataStreamResponse();
    if (chatId) {
      response.headers.set('x-chat-id', chatId);
    }
    
    return response;
  } catch (error: any) {
    console.error('Erro na API de Chat:', error);
    return new Response(
      JSON.stringify({ error: "Erro na conexão", details: error.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
