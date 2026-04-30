import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
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

    // FORÇANDO A VERSÃO V1 (PRODUÇÃO)
    const google = createGoogleGenerativeAI({
      baseURL: 'https://generativelanguage.googleapis.com/v1',
      apiKey: process.env.GEMINI_API_KEY,
    });

    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      messages: [
        { role: 'system', content: "Você é o Guarda-Farol, assistente do app Âncora. Seja breve e acolhedor." },
        ...messages,
      ],
    });

    return NextResponse.json({ text }, { headers: corsHeaders });
  } catch (error: any) {
    console.error("Erro na API:", error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
