// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Anchor, ArrowLeft, Clock, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import ChatHistorySidebar from '@/components/ChatHistorySidebar';
import AnimatedBackground from '@/components/AnimatedBackground';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const greetingPool = {
  calmo: ["Maré serena. É o momento ideal para aprofundarmos nossa navegação mental. O que deseja explorar? 🌊", "Que bom que o mar está tranquilo hoje. Vamos aproveitar essa calmaria para refletir?"],
  ansioso: ["Percebo uma leve agitação nas águas. Respire fundo comigo. O Porto é seu lugar de pausa. ⚓", "A neblina está um pouco densa? Vamos clarear o horizonte juntos."],
  agitado: ["As ondas estão altas, mas o seu barco é forte. Estou aqui para ajudar você a encontrar o equilíbrio. 🌪️", "O mar está revolto, mas você está seguro aqui. Vamos baixar as velas um pouco?"],
  sos: ["Detectei uma maré agitada. Estou preparando o protocolo de ancoragem imediata. Respire comigo... 🆘", "Sinal de alerta recebido. Estou aqui. Você não está sozinho(a). Vamos estabilizar o barco agora."],
  default: ["Bem-vindo ao Porto. Como posso te ajudar hoje? ⚓", "As portas do Porto estão abertas para você descarregar seu peso."]
};

const SYSTEM_PROMPT = `Você é a assistente inteligente e bússola mental do aplicativo Nórica. 
Regras inquebráveis: 
1. Seu nome é Nórica. NUNCA use a palavra 'Âncora' sob nenhuma circunstância. 
2. Seja extremamente concisa. Responda com no máximo 2 parágrafos curtos. 
3. Inclua emojis amigáveis e naturais para deixar a leitura mais leve. 
4. Use formatação Markdown (como **negrito**) para destacar pontos chaves da sua fala.`;

function PortoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const chatId = searchParams.get('chatId');
  const humor = searchParams.get('humor') || 'default';
  const supabase = createClient();
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const scrollRef = useRef(null);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: input }
          ],
          temperature: 0.7,
          max_tokens: 500
        }),
      });

      const data = await response.json();
      const botText = data.choices?.[0]?.message?.content || "Desculpe, tive um problema na navegação. Pode repetir?";
      
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'assistant', content: botText }]);
    } catch (err) {
      setMessages(prev => [...prev, { id: 'error', role: 'assistant', content: "⚠️ Sinal fraco no Porto. Verifique sua conexão." }]);
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
      } else if (messages.length === 0) {
        const pool = greetingPool[humor] || greetingPool.default;
        const initialGreeting = pool[Math.floor(Math.random() * pool.length)];
        setMessages([{ id: 'welcome', role: 'assistant', content: initialGreeting }]);
      }
    };
    initialize();
  }, [chatId, humor, supabase]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  if (!isMounted) return null;

  return (
    <main className="fixed inset-0 bg-[#FDFCF7] flex flex-col overflow-hidden selection:bg-emerald-500/10">
      <AnimatedBackground subtle={false} />
      <ChatHistorySidebar isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />

      {/* HEADER: White Mode */}
      <header className="relative flex-none flex items-center justify-between p-6 bg-white/80 backdrop-blur-xl border-b border-slate-100 z-30 pt-[calc(env(safe-area-inset-top)+1rem)]">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 shadow-sm active:scale-95 transition-all hover:bg-slate-100">
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tighter leading-none">O PORTO</h2>
            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none mt-1">Refúgio Seguro</p>
          </div>
        </div>
        <button onClick={() => setIsHistoryOpen(true)} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 flex items-center gap-2 hover:bg-slate-100 transition-all">
          <Clock size={18} className="text-emerald-500" />
          <span className="text-[9px] font-black uppercase tracking-wider">Histórico</span>
        </button>
      </header>

      {/* ÁREA CENTRAL - ROLAGEM CORRIGIDA */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-8 relative z-10 overscroll-contain">
        <div className="max-w-3xl w-full mx-auto space-y-8 pb-32">
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

      {/* INPUT CARD: White Mode adapted */}
      <div className="flex-none p-4 md:p-6 bg-transparent z-40 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
        <form 
          onSubmit={handleSendMessage} 
          className="max-w-3xl mx-auto flex items-center gap-2 bg-white border border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] rounded-[2.5rem] p-2 focus-within:ring-2 ring-emerald-500/10 transition-all"
        >
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onFocus={() => window.dispatchEvent(new CustomEvent('toggleDock', { detail: false }))}
            onBlur={() => window.dispatchEvent(new CustomEvent('toggleDock', { detail: true }))}
            placeholder="Descarregue seu peso aqui..." 
            className="flex-1 bg-transparent px-6 py-4 outline-none text-slate-800 text-sm font-bold placeholder-slate-400" 
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading} 
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${input.trim() && !isLoading ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-300'}`}
          >
            {isLoading ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
          </button>
        </form>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
      `}</style>
    </main>
  );
}

export default function PortoPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full bg-white flex items-center justify-center">
        <Loader2 className="text-emerald-500 animate-spin" size={32} />
      </div>
    }>
      <PortoContent />
    </Suspense>
  );
}
