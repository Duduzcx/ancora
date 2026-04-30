// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Anchor, ArrowLeft, AlertCircle, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';
import ChatHistorySidebar from '@/components/ChatHistorySidebar';
import AnimatedBackground from '@/components/AnimatedBackground';

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

  // FUNÇÃO DE ENVIO MANUAL (Sem useChat para não travar no Android)
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setDebugError(null);

    try {
      const response = await fetch('https://ancura.netlify.app/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })) })
      });

      if (!response.ok) throw new Error("Falha no servidor");

      // Lógica simplificada de leitura da resposta
      const data = await response.text();
      // O streamText do Vercel manda uns prefixos (0: "texto"), vamos limpar se necessário
      const cleanContent = data.replace(/[0-9]:"/g, '').replace(/"/g, '').replace(/\\n/g, '\n');
      
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'assistant', content: cleanContent }]);
    } catch (err) {
      console.error("Erro no envio:", err);
      setDebugError("Não consegui falar com o servidor. Verifique sua internet.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    const initialize = async () => {
      if (chatId) {
        const { data: history } = await supabase
          .from('messages')
          .select('id, role, content')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true });

        if (history && history.length > 0) {
          setMessages(history.map(m => ({ id: m.id, role: m.role, content: m.content })));
        }
      } else if (messages.length === 0) {
        const pool = greetingPool[humor] || greetingPool.default;
        const randomGreeting = pool[Math.floor(Math.random() * pool.length)];
        setMessages([{ id: 'welcome', role: 'assistant', content: randomGreeting }]);
      }
    };
    initialize();
  }, [chatId, humor]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  if (!isMounted) return null;

  return (
    <main className="fixed inset-0 flex flex-col overflow-hidden bg-slate-50 z-10 lg:pl-72 overscroll-none">
      <AnimatedBackground subtle />
      <ChatHistorySidebar isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />

      <header className="h-20 shrink-0 flex items-center justify-between px-6 bg-[#fdfcf7]/40 backdrop-blur-xl border-b border-white/30 z-30 pt-[env(safe-area-inset-top)]">
        <div className="flex items-center gap-4">
          <Link href="/">
            <button className="p-2 bg-white/60 border border-white/40 rounded-2xl text-slate-900 shadow-sm transition-all active:scale-95">
              <ArrowLeft size={18} />
            </button>
          </Link>
          <div className="flex flex-col">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tighter leading-none">O Porto</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Conectado</p>
            </div>
          </div>
        </div>
        <button onClick={() => setIsHistoryOpen(true)} className="lg:hidden p-2 bg-white/60 border border-white/40 rounded-2xl text-slate-900 flex items-center gap-2">
          <Clock size={16} className="text-blue-600" />
          <span className="text-[9px] font-black uppercase tracking-wider">Histórico</span>
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 pb-24">
        <div className="max-w-3xl w-full mx-auto space-y-8">
          {messages.map((m) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[90%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${m.role === 'user' ? 'bg-slate-900 text-white' : 'bg-white text-blue-600 border border-white/50'}`}>
                  {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-4 rounded-[1.8rem] text-sm leading-relaxed shadow-lg border ${m.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none border-slate-800' : 'bg-white/80 text-slate-800 backdrop-blur-2xl border-white/60 rounded-tl-none'}`}>
                  {m.content}
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex justify-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center border border-white/50 shadow-lg animate-pulse"><Bot size={16} className="text-blue-600" /></div>
              <div className="bg-white/60 p-4 rounded-[1.8rem] rounded-tl-none border border-white/60 shadow-lg flex gap-1.5 items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          {debugError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600">
              <AlertCircle size={18} />
              <p className="text-xs font-bold">{debugError}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-none p-4 md:p-6 bg-[#fdfcf7] border-t border-slate-100 z-40 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex items-center gap-2 bg-slate-50 border border-slate-200 shadow-sm rounded-[2rem] p-1.5 focus-within:bg-white focus-within:ring-4 ring-slate-900/5 transition-all">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Diga algo para o Guarda-Farol..." className="flex-1 bg-transparent px-6 py-3 outline-none text-slate-800 text-sm font-bold placeholder:text-slate-400" />
          <button type="submit" disabled={!input.trim() || isLoading} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${input.trim() && !isLoading ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-300'}`}>
            <Send size={18} strokeWidth={2.5} />
          </button>
        </form>
      </div>
    </main>
  );
}

export default function PortoPage() {
  return <Suspense fallback={null}><PortoContent /></Suspense>;
}
