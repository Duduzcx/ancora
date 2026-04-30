import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-chat-id',
  'Access-Control-Expose-Headers': 'x-chat-id',
};

const SYSTEM_PROMPT = "Você é o Guarda-Farol, a inteligência emocional do aplicativo Âncora. Responda de forma curta e empática.";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: Request) {
  console.log("[API] Recebendo requisição POST");
  
  try {
    const { messages, chatId: reqChatId, type } = await req.json();
    let chatId = reqChatId;

    if (!process.env.GEMINI_API_KEY) {
      console.error("[API] GEMINI_API_KEY ausente");
      return NextResponse.json(
        { error: "GEMINI_API_KEY não configurada no Netlify" },
        { status: 500, headers: corsHeaders }
      );
    }

    // Tenta usar o Supabase, mas NÃO TRAVA se falhar
    let user = null;
    try {
      const supabase = await createServerSupabaseClient();
      const { data } = await supabase.auth.getUser();
      user = data?.user;
    } catch (dbError) {
      console.warn("[API] Erro ao conectar com Supabase, seguindo apenas com IA", dbError);
    }

    const result = await streamText({
      model: google('gemini-1.5-flash') as any,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      onFinish: async (event) => {
        // Só tenta salvar se o usuário e o chat existirem
        if (chatId && user && type !== 'arena') {
          try {
            const supabase = await createServerSupabaseClient();
            await supabase.from('messages').insert({
              chat_id: chatId,
              role: 'assistant',
              content: event.text
            });
          } catch (saveError) {
            console.error("[API] Erro ao salvar resposta:", saveError);
          }
        }
      },
    });

    const response = result.toDataStreamResponse();
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;

  } catch (error: any) {
    console.error('[API] Erro Fatal:', error);
    return NextResponse.json(
      { error: "Erro na conexão", details: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
