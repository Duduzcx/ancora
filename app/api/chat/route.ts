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
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "FALTA CHAVE GROQ" }, { status: 500, headers: corsHeaders });
    }

    // CONEXÃO COM O GROQ (LLAMA 3)
    const url = "https://api.groq.com/openai/v1/chat/completions";

    const payload = {
      model: "llama3-8b-8192",
      messages: [
        { role: "system", content: "Você é o Guarda-Farol, assistente acolhedor do app Âncora. Seja breve e responda em português." },
        ...messages.map((m: any) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content
        }))
      ],
      temperature: 0.7,
      max_tokens: 1024
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || "Erro no Groq" }, { status: response.status, headers: corsHeaders });
    }

    const botText = data.choices?.[0]?.message?.content || "O mar está calmo demais, tente novamente.";

    return NextResponse.json({ text: botText }, { headers: corsHeaders });
  } catch (error: any) {
    console.error("ERRO GROQ:", error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
