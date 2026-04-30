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
      return NextResponse.json({ error: "FALTA CHAVE API" }, { status: 500, headers: corsHeaders });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // USANDO O NOME TÉCNICO COMPLETO
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

    let formattedHistory = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    // Garantindo que comece com usuário
    while (formattedHistory.length > 0 && formattedHistory[0].role !== 'user') {
      formattedHistory.shift();
    }

    const lastMessageObj = formattedHistory.pop();
    const lastMessage = lastMessageObj?.parts[0].text || "Olá";

    const chat = model.startChat({ history: formattedHistory });

    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text }, { headers: corsHeaders });
  } catch (error: any) {
    console.error("ERRO:", error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
