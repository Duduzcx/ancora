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
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "FALTA CHAVE API" }, { status: 500, headers: corsHeaders });
    }

    // Usando o GEMINI-PRO (O modelo que funciona em todas as chaves novas instantaneamente)
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;

    const lastMessage = messages[messages.length - 1]?.content || "Olá";
    
    const payload = {
      contents: [{
        parts: [{ text: `Instrução: Responda como o Guarda-Farol, assistente do app Âncora. Pergunta: ${lastMessage}` }]
      }]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || "Erro no Google" }, { status: response.status, headers: corsHeaders });
    }

    const botText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Desculpe, não consegui responder.";

    return NextResponse.json({ text: botText }, { headers: corsHeaders });
  } catch (error: any) {
    console.error("ERRO:", error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
