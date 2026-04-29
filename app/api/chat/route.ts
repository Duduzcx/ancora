import { createGroq } from '@ai-sdk/groq';
import { streamText, generateText } from 'ai';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

// Headers que liberam o acesso total (Android/Capacitor/Web)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-chat-id',
  'Access-Control-Allow-Private-Network': 'true',
  'Access-Control-Expose-Headers': 'x-chat-id',
};

const SYSTEM_PROMPT = `
Você é o Guarda-Farol, a inteligência emocional do aplicativo Âncora. Seu objetivo é ser um porto seguro para os usuários. Sua personalidade é: calma, empática, levemente sábia e carismática.
Use metáforas náuticas sutis. Respostas curtas e reconfortantes.
`;

const ARENA_PROMPT = `
Você é o oponente no "Simulador de Diálogos" (A Arena). Faça roleplay de uma pessoa real em uma conversa difícil. Seja direto, use no máximo 3 frases e provoque uma reação.
`;

// 1. Função OPTIONS para o "preflight" do Android
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req: Request) {
  try {
    const { messages, chatId: reqChatId, type, scenario } = await req.json();
    let chatId = reqChatId;

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY não configurada no Netlify" },
        { status: 500, headers: corsHeaders }
      );
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Lógica de gravação e criação de chat (Porto)
    if (user && type !== 'arena') {
      const lastUserMessage = messages[messages.length - 1];
      if (!chatId && lastUserMessage.role === 'user') {
        const { data: newChat } = await supabase
          .from('chats')
          .insert({ user_id: user.id, title: "Nova Conversa" })
          .select()
          .single();
        if (newChat) chatId = newChat.id;
      }
      if (chatId && lastUserMessage.role === 'user') {
        await supabase.from('messages').insert({
          chat_id: chatId,
          role: 'user',
          content: lastUserMessage.content
        });
      }
    }

    const activePrompt = type === 'arena' 
      ? ARENA_PROMPT.replace('{SCENARIO}', scenario || 'Conversa difícil')
      : SYSTEM_PROMPT;

    // Usando o SDK da Vercel para manter o streaming (efeito de digitação)
    const result = await streamText({
      model: groq('llama-3.1-8b-instant'), // Modelo ultra-rápido para mobile
      messages: [
        { role: 'system', content: activePrompt },
        ...messages,
      ],
      onFinish: async (event) => {
        if (chatId && user && type !== 'arena') {
          await supabase.from('messages').insert({
            chat_id: chatId,
            role: 'assistant',
            content: event.text
          });
        }
      },
    });

    // Converte para resposta e injeta os headers de ouro
    const response = result.toDataStreamResponse();
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    if (chatId) {
      response.headers.set('x-chat-id', chatId);
    }

    return response;

  } catch (error: any) {
    console.error('Erro na IA:', error);
    return NextResponse.json(
      { error: "Erro na conexão", details: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
