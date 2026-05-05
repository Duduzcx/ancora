// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Anchor, ArrowLeft, AlertCircle, Clock, Activity, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';
import ChatHistorySidebar from '@/components/ChatHistorySidebar';
import AnimatedBackground from '@/components/AnimatedBackground';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const greetingPool = {
  calmo: ["Que bom que o mar está tranquilo hoje.", "Navegar em águas calmas é ótimo.", "O horizonte está limpo."],
  nebuloso: ["A neblina confunde mesmo a visão.", "Dias nublados fazem parte da viagem.", "É normal perder a direção às vezes."],
  agitado: ["As ondas estão altas, mas o seu barco é forte.", "O mar está revolto, mas você está seguro aqui.", "Respire fundo. A tempestade vai passar."],
  ajuda: ["Estou aqui. Você não está sozinho(a).", "Aqui é o seu porto seguro.", "Eu te ouço."],
  default: ["Bem-vindo ao Porto. Como posso te ajudar?", "As portas do Porto estão abertas.", "É muito bom ter você por aqui."]
};

function PortoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const chatId = searchParams.get('chatId');
  const humor = searchParams.get('humor') || 'default';
  const supabase = createClient();
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [debugError, setDebugError] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const scrollRef = useRef(null);

  // TESTE DE CONEXÃO (Botão de Pânico)
  const runDiagnostics = async () => {
    setDebugError("Testando conexão...");
    try {
      const response = await fetch('https://ancura.netlify.app/api/chat');
      const data = await response.json();
      setDebugError(`Status: ${response.status} | Resposta: ${JSON.stringify(data)}`);
    } catch (err) {
      setDebugError(`ERRO: ${err.message || JSON.stringify(err)}`);
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setDebugError(null);

    try {
      const { CapacitorHttp } = await import('@capacitor/core');
      const response = await CapacitorHttp.post({
        url: 'https://ancura.netlify.app/api/chat',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        data: { 
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })) 
        }
      });

      if (response.status < 200 || response.status >= 300) {
        setDebugError(`Erro ${response.status}: ${JSON.stringify(response.data)}`);
        return;
      }

      const botText = response.data?.text || "Sem resposta da IA.";
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'assistant', content: botText }]);
    } catch (err) {
      console.error("ERRO_CHAT_CAPACITOR:", err);
      setDebugError(`FALHA NATIVA: ${err.message || JSON.stringify(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    const initialize = async () => {
      if (chatId) {
        const { data: history } = await supabase.from('messages').select('id, role, content').eq('chat_id', chatId).order('created_at', { ascending: true });
        if (history?.length > 0) setMessages(history.map(m => ({ id: m.id, role: m.role, content: m.content })));
      } else if (messages.length === 0 && humor && humor !== 'default') {
        // Trigger initial AI engagement - calming tone
        setIsLoading(true);
        try {
          const { CapacitorHttp } = await import('@capacitor/core');
          const response = await CapacitorHttp.post({
            url: 'https://ancura.netlify.app/api/chat',
            headers: { 'Content-Type': 'application/json' },
            data: { 
              type: 'porto',
              messages: [
                { role: 'system', content: 'Você é a assistente inteligente e bússola mental do aplicativo Nórica. Regras inquebráveis: 1. Seu nome é Nórica. NUNCA use a palavra \'Âncora\'. 2. Seja extremamente concisa. Responda com no máximo 2 parágrafos curtos. 3. Inclua emojis amigáveis e naturais para deixar a leitura mais leve. 4. Use formatação Markdown (como negrito) para destacar pontos chaves da sua fala.' },
                { role: 'user', content: `[CONTEXTO: Acabei de clicar no card "${humor}" pois não estou me sentindo bem. Por favor, me acolha de forma breve e me convide a conversar.]` }
              ]
            }
          });
          const botText = response.data?.text || "Olá, sinta o balanço calmo do Porto. Estou aqui com você. Quer me contar o que está sentindo?";
          setMessages([{ id: 'welcome', role: 'assistant', content: botText }]);
        } catch (e) {
          const pool = greetingPool[humor] || greetingPool.default;
          setMessages([{ id: 'welcome', role: 'assistant', content: pool[Math.floor(Math.random() * pool.length)] }]);
        } finally {
          setIsLoading(false);
        }
      } else if (messages.length === 0) {
        const pool = greetingPool.default;
        setMessages([{ id: 'welcome', role: 'assistant', content: pool[Math.floor(Math.random() * pool.length)] }]);
      }
    };
    initialize();
  }, [chatId, humor]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  if (!isMounted) return null;

  return (
    <main className="min-h-screen bg-transparent relative flex flex-col overflow-x-hidden z-10 pb-32">
      <AnimatedBackground subtle />
      <ChatHistorySidebar isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />

      <header className="flex-none flex items-center justify-between p-6 bg-white/40 backdrop-blur-xl border-b border-slate-100 z-30 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-900 shadow-sm active:scale-95">
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tighter leading-none">O PORTO</h2>
            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none mt-1">Santuário de Acolhimento</p>
          </div>
        </div>
        <button onClick={() => setIsHistoryOpen(true)} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-900 flex items-center gap-2">
          <Clock size={18} className="text-emerald-500" />
          <span className="text-[9px] font-black uppercase tracking-wider">Histórico</span>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-3xl w-full mx-auto space-y-8">
          {messages.map((m) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[90%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${m.role === 'user' ? 'bg-slate-900 text-white' : 'bg-white text-emerald-500 border border-slate-100'}`}>
                  {m.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className={`p-5 rounded-[2rem] text-sm leading-relaxed shadow-xl border ${m.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none border-slate-800' : 'bg-white text-slate-800 border-slate-100 rounded-tl-none'}`}>
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                      strong: ({node, ...props}) => <b className="font-black text-emerald-500" {...props} />,
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex justify-start gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center">
                <Bot size={20} className="text-emerald-500" />
              </div>
              <div className="bg-white p-5 rounded-[2rem] rounded-tl-none border border-slate-100 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-4 p-4 md:p-6 z-40">
        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex items-center gap-2 bg-white border border-slate-200 shadow-xl rounded-full p-2 focus-within:ring-4 ring-emerald-500/5 transition-all">
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onFocus={() => window.dispatchEvent(new CustomEvent('toggleDock', { detail: false }))}
            onBlur={() => window.dispatchEvent(new CustomEvent('toggleDock', { detail: true }))}
            placeholder="Descarregue seu peso aqui..." 
            className="flex-1 bg-transparent px-6 py-3 outline-none text-slate-800 text-sm font-bold" 
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading} 
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${input.trim() && !isLoading ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-300'}`}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </main>
  );
}

export default function PortoPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full bg-slate-50 flex items-center justify-center">
        <Loader2 className="text-emerald-500 animate-spin" size={32} />
      </div>
    }>
      <PortoContent />
    </Suspense>
  );
}
