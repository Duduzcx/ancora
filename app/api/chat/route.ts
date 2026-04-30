import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export async function GET() {
  return NextResponse.json({ status: "ONLINE" }, { headers: corsHeaders });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "API KEY Faltando" }, { status: 500, headers: corsHeaders });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // AJUSTE DE LOGICA: O Google exige que a conversa comece com 'user'
    // Vamos filtrar o histórico para garantir que ele comece corretamente
    let formattedHistory = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    // Se o primeiro for 'model', removemos ele do histórico para o Google não reclamar
    while (formattedHistory.length > 0 && formattedHistory[0].role !== 'user') {
      formattedHistory.shift();
    }

    // A última mensagem é o que você acabou de digitar
    const lastMessage = formattedHistory.pop()?.parts[0].text || "";

    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text }, { headers: corsHeaders });
  } catch (error: any) {
    console.error("ERRO GOOGLE:", error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
