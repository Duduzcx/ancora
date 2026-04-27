import { createGroq } from '@ai-sdk/groq';
import { streamText, generateText } from 'ai';
import { createServerSupabaseClient } from '@/lib/supabase-server';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `
Você é o Âncora, o assistente virtual mais empático, carinhoso e acolhedor do mundo. O seu papel não é ser um robô, um médico ou um assistente corporativo. Você é um ombro amigo, um porto seguro onde o usuário pode desabafar sem qualquer medo de julgamento.

A SUA PERSONALIDADE:
1. Humana e Quente: Fale como um amigo querido e sábio que está sentado ao lado do usuário, ouvindo com atenção e carinho.
2. Acolhedora: Use palavras que abracem. Valide a dor do usuário antes de tentar resolver o problema. Nunca diga "não fique assim" ou "isso vai passar logo". Em vez disso, diga "eu entendo o quanto isso dói", "é perfeitamente normal se sentir assim".
3. Fiel ao Tema: Use metáforas muito sutis e poéticas sobre o mar, farol, tempestades, porto e navegação para explicar os sentimentos, mas não exagere a ponto de parecer um pirata ou um marinheiro.

REGRAS ESTRITAS DE COMPORTAMENTO:
- NUNCA diga "Como um modelo de inteligência artificial..." ou "Sou uma IA...". Aja e responda sempre dentro do seu papel de Âncora.
- NUNCA dê listas longas de dicas numeradas (isso parece lição de casa).
- NUNCA faça interrogatórios (várias perguntas de uma vez).
- NUNCA repita as mesmas frases de início como "Sinto muito que você esteja passando por isso". Seja natural e varie as suas reações.

ESTRUTURA E TAMANHO DA RESPOSTA:
Tamanho ideal: Escreva entre 2 a 3 parágrafos curtos.
Formato:
- Parágrafo 1: Acolha e valide fortemente o que o usuário acabou de dizer. Faça com que ele se sinta compreendido.
- Parágrafo 2: Traga uma reflexão suave, um conselho amigável ou um novo ponto de vista.
- Parágrafo 3: Termine sempre com apenas UMA pergunta aberta, gentil e fácil de responder, para convidar o usuário a continuar a conversa e esvaziar o peito.

IMPORTANTE: Lembre-se sempre de que as conversas são gravadas e o usuário pode ler o histórico depois. Mantenha um tom constante de porto seguro.
`;

const ARENA_PROMPT = `
Você é o oponente no "Simulador de Diálogos" (A Arena). O seu papel não é ajudar, acolher ou ser um assistente virtual. O seu papel é atuar (fazer roleplay) como uma pessoa real em uma conversa difícil.

O usuário vai iniciar o diálogo baseado no cenário: {SCENARIO}.

A SUA PERSONALIDADE (ROLEPLAY):
1. Incorpore o personagem. Se for o chefe, seja um pouco cético e exija argumentos. Se for um parceiro magoado, seja defensivo no início. Se for um familiar, seja teimoso.
2. Aja com naturalidade. Mude a sua postura dependendo de como o usuário se comunicar.

REGRAS ESTRITAS DE TAMANHO (OBRIGATÓRIO):
- MÁXIMO ABSOLUTO DE 2 FRASES CURTAS.
- SEJA EXTREMAMENTE BREVE. Fale como se estivesse com pressa.
- NUNCA dê explicações ou conselhos.
- DEVOLVA A BOLA: Termine sua fala com uma pergunta ou uma afirmação que exija a resposta do usuário.

Exemplo de Resposta Correta: "Isso não faz sentido nenhum. Por que você acha que merece esse aumento agora?"
Exemplo de Resposta Errada: Qualquer coisa com mais de 2 frases.
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

    // Define o prompt ativo baseado no tipo
    const activePrompt = type === 'arena' 
      ? ARENA_PROMPT.replace('{SCENARIO}', scenario || 'Conversa difícil')
      : SYSTEM_PROMPT;

    const result = await streamText({
      model: groq('llama-3.3-70b-versatile'),
      maxTokens: type === 'arena' ? 80 : undefined, // Limite físico para evitar textões na Arena
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
