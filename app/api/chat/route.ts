import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export async function GET() {
  return NextResponse.json({ status: "ONLINE", model: "Gemini 1.5 Flash" }, { headers: corsHeaders });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Chave GEMINI_API_KEY faltando no Netlify" }, { status: 500, headers: corsHeaders });
    }

    const google = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const result = await streamText({
      model: google('gemini-1.5-flash'),
      messages: [
        { role: 'system', content: "Você é o Guarda-Farol, assistente do app Âncora. Seja breve e acolhedor." },
        ...messages,
      ],
    });

    return result.toTextStreamResponse({
      headers: corsHeaders
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
