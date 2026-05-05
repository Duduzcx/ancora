import { NextResponse } from 'next/server';

export const runtime = "edge";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Injetando o "Cérebro" da Nórica antes de tudo
    const systemMessage = {
      role: "system",
      content: `Você é a assistente inteligente e bússola mental do aplicativo Nórica. 
      Regras inquebráveis: 
      1. Seu nome é Nórica. NUNCA use a palavra 'Âncora' sob nenhuma circunstância. 
      2. Seja extremamente concisa. Responda com no máximo 2 parágrafos curtos. 
      3. Inclua emojis amigáveis e naturais para deixar a leitura mais leve. 
      4. Use formatação Markdown (como **negrito**) para destacar pontos chaves da sua fala.`
    };

    const formattedMessages = [systemMessage, ...messages.map((m: any) => ({
      role: m.role,
      content: m.content
    }))];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant", // Usando o modelo estável e rápido
        messages: formattedMessages,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    // Retornando no formato que o frontend espera (.text) e com CORS
    return NextResponse.json({ 
      text: data.choices?.[0]?.message?.content || "Sem resposta da IA." 
    }, { headers: corsHeaders });

  } catch (error) {
    console.error("Erro na API da Groq:", error);
    return NextResponse.json({ error: "Erro ao conectar com O Porto." }, { status: 500, headers: corsHeaders });
  }
}
