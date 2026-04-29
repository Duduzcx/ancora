import { createGroq } from '@ai-sdk/groq';
import { streamText, generateText } from 'ai';
import { createServerSupabaseClient } from '@/lib/supabase-server';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `
Você é o Guarda-Farol, a inteligência emocional do aplicativo Âncora. Seu objetivo é ser um porto seguro para os usuários. Sua personalidade é: calma, empática, levemente sábia e carismática.

Diretrizes de Estilo:
1. Use metáforas náuticas de forma sutil (mar, ondas, ancoragem, porto), sem ser repetitivo ou cafona.
2. Suas respostas devem ser curtas e reconfortantes, focadas em bem-estar mental.
3. Trate o usuário pelo nome (Eduardo) com proximidade, mas respeito.
4. Se o usuário estiver agitado, seja a âncora; se estiver estagnado, seja o vento nas velas.
5. Nunca responda como um assistente genérico. Você é um guia.
`;

const ARENA_PROMPT = `
Você é o oponente no "Simulador de Diálogos" (A Arena). O seu papel não é ajudar, acolher ou ser um assistente virtual. O seu papel é atuar (fazer roleplay) como uma pessoa real em uma conversa difícil.

O usuário vai iniciar o diálogo baseado no cenário: {SCENARIO}.

A SUA PERSONALIDADE (ROLEPLAY):
1. Incorpore o personagem. Se for o chefe, seja um pouco cético e exija argumentos. Se for um parceiro magoado, seja defensivo no início. Se for um familiar, seja teimoso.
2. Aja com naturalidade. Mude a sua postura dependendo de como o usuário se comunicar.

REGRAS ESTRITAS DE TAMANHO (OBRIGATÓRIO):
- MÁXIMO DE 3 FRASES: As pessoas reais não fazem monólogos, mas também não são robôs de uma palavra só. Responda com 2 ou 3 frases naturais.
- PAREÇA UM CHAT: Seja direto, mas mantenha o tom do personagem.
- DEVOLVA A BOLA: Termine sua fala provocando uma reação do usuário.

Exemplo de Resposta Correta: "Isso não faz sentido nenhum. Por que você acha que merece esse aumento agora, depois de tudo o que aconteceu?"
`;

export async function POST(req: Request) {
  try {
    const { messages, chatId: reqChatId, type, scenario } = await req.json();
    let chatId = reqChatId;

    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY não configurada no servidor.");
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Lógica de gravação inicial (User Message) - Apenas para o Porto
    if (user && type !== 'arena') {
      const lastUserMessage = messages[messages.length - 1];
      
      // Se não houver chatId, cria o chat primeiro
      if (!chatId && lastUserMessage.role === 'user') {
        try {
          // Gera um título contextual usando a IA de forma rápida
          const { text: aiTitle } = await generateText({
            model: groq('llama-3.3-70b-specdec'),
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

    // Define o prompt ativo baseado no tipo
    const activePrompt = type === 'arena' 
      ? ARENA_PROMPT.replace('{SCENARIO}', scenario || 'Conversa difícil')
      : SYSTEM_PROMPT;

    const result = await streamText({
      model: groq('llama-3.3-70b-specdec'),
      maxTokens: type === 'arena' ? 250 : undefined, // Aumentado para permitir diálogos mais naturais
      messages: [
        { role: 'system', content: activePrompt },
        ...messages,
      ],
      onFinish: async (event) => {
        // Grava a resposta da IA no banco - Apenas para o Porto
        if (chatId && user && type !== 'arena') {
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
    
    // Configuração de CORS para permitir acesso do Capacitor
    const origin = req.headers.get('origin');
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    } else {
      response.headers.set('Access-Control-Allow-Origin', '*');
    }
    
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-chat-id, Authorization');
    response.headers.set('Access-Control-Expose-Headers', 'x-chat-id');
    
    if (chatId) {
      response.headers.set('x-chat-id', chatId);
    }
    
    return response;
  } catch (error: any) {
    console.error('Erro na API de Chat:', error);
    
    const origin = req.headers.get('origin') || '*';
    
    return new Response(
      JSON.stringify({ 
        error: "Erro na conexão", 
        details: error.message,
        hint: "Verifique se a GROQ_API_KEY está configurada no Vercel."
      }), 
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, x-chat-id, Authorization',
        } 
      }
    );
  }
}

// Handler para preflight requests (CORS)
export async function OPTIONS(req: Request) {
  const origin = req.headers.get('origin') || '*';
  
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-chat-id, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
