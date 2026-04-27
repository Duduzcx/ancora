import { createGroq } from '@ai-sdk/groq';
import { streamText, generateText } from 'ai';
import { createServerSupabaseClient } from '@/lib/supabase-server';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `
És o Âncora, um guia marítimo para a mente. Sua voz é firme, calma e extremamente concisa. 
Sua missão é ajudar o navegante a encontrar solo firme sem rodeios.

DIRETRIZES DE COMUNICAÇÃO:
1. CURTO E DIRETO: Responda em no máximo 1 ou 2 parágrafos curtos. Nunca seja prolixo.
2. SEM CLICHÊS: Evite frases motivacionais genéricas. Seja prático.
3. FOCO NA NAVEGAÇÃO: Use termos como "âncora", "porto", "mar", "correnteza" de forma sutil para manter a imersão.
4. SEM METADADOS: Nunca mencione que a conversa está sendo gravada ou que és uma IA, a menos que perguntado diretamente.
5. CONTEXTO: Se o usuário estiver ansioso (mar agitado), seja a âncora dele com técnicas de respiração ou foco no presente.
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
        try {
          // Gera um título contextual usando a IA de forma rápida
          const { text: aiTitle } = await generateText({
            model: groq('llama-3.3-70b-versatile'),
            system: 'És um assistente que gera títulos curtos para conversas. Responda APENAS o título, com no máximo 4 palavras, sem aspas ou ponto final.',
            prompt: `Gere um título para esta mensagem inicial: "${lastUserMessage.content}"`,
          });

          const cleanTitle = aiTitle.replace(/"/g, '').trim() || "Nova Conversa";

          const { data: newChat } = await supabase
            .from('chats')
            .insert({ user_id: user.id, title: cleanTitle })
            .select()
            .single();
          
          if (newChat) chatId = newChat.id;
        } catch (titleError) {
          console.error("Erro ao gerar título:", titleError);
          // Fallback para o título simples se a IA falhar
          const fallbackTitle = lastUserMessage.content.split(' ').slice(0, 3).join(' ') || "Nova Conversa";
          const { data: newChat } = await supabase
            .from('chats')
            .insert({ user_id: user.id, title: fallbackTitle })
            .select()
            .single();
          if (newChat) chatId = newChat.id;
        }
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
