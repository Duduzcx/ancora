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
      return NextResponse.json({ error: "API KEY Faltando no Netlify" }, { status: 500, headers: corsHeaders });
    }

    // USANDO O DRIVER OFICIAL DO GOOGLE (Solução Definitiva)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Formatando as mensagens para o padrão do Google
    const lastMessage = messages[messages.length - 1]?.content || "";
    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({
      history: history,
      generationConfig: { maxOutputTokens: 1000 },
    });

    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text }, { headers: corsHeaders });
  } catch (error: any) {
    console.error("ERRO CRÍTICO GOOGLE:", error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
