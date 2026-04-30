"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useChat } from '@ai-sdk/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Anchor, ArrowLeft, AlertCircle, Clock, Menu } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';
import ChatHistorySidebar from '@/components/ChatHistorySidebar';
import AnimatedBackground from '@/components/AnimatedBackground';
import { getApiUrl } from '@/lib/api-utils';

const greetingPool = {
  calmo: [
    "Que bom que o mar está tranquilo hoje. Quer aproveitar para organizar os pensamentos?",
    "Navegar em águas calmas é ótimo. Como você quer aproveitar a calmaria de hoje?",
    "O horizonte está limpo. Tem algo de bom que você queira compartilhar ou registrar aqui no Porto?"
  ],
  nebuloso: [
    "A neblina confunde mesmo a visão. Quer me contar o que está pesando para tentarmos clarear isso juntos?",
    "Dias nublados fazem parte da viagem. O que está deixando os seus pensamentos confusos hoje?",
    "É normal perder a direção às vezes. Vamos conversar para tentar dissipar essa neblina?"
  ],
  agitado: [
    "As ondas estão altas, mas o seu barco é forte. O que está causando essa tempestade agora?",
    "O mar está revolto, mas você está seguro aqui no Porto. Quer desabafar sobre o que está te estressando?",
    "Respire fundo. A tempestade vai passar. O que está te deixando tão ansioso hoje?"
  ],
  ajuda: [
    "Estou aqui. Você não está sozinho(a). Jogue a âncora e me diga: o que está acontecendo neste exato momento?",
    "Aqui é o seu porto seguro. Respire comigo. O que você está sentindo agora?",
    "Eu te ouço. Não precisa enfrentar esse mar sozinho(a). Me conta o que está doendo."
  ],
  default: [
    "Bem-vindo ao Porto. Este é o seu espaço seguro e sem julgamentos. Como posso te ajudar a navegar hoje?",
    "As portas do Porto estão abertas. O que você gostaria de conversar hoje?",
    "É muito bom ter você por aqui. Como estão as suas águas hoje?"
  ]
};

function PortoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const chatId = searchParams.get('chatId');
  const humor = searchParams.get('humor') as keyof typeof greetingPool;
  const supabase = createClient();
  
  const [user, setUser] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [initialMessageSet, setInitialMessageSet] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, setMessages, isLoading, error } = useChat({
    api: getApiUrl('/api/chat'),
    body: { chatId },
    // SOLUÇÃO NINJA: Usa o motor nativo do Capacitor para a chamada
    fetch: async (url, options) => {
      const { CapacitorHttp } = await import('@capacitor/core');
      const response = await CapacitorHttp.post({
        url: url.toString(),
        data: JSON.parse(options?.body as string),
        headers: { 'Content-Type': 'application/json' }
      });
      
      // Converte a resposta nativa de volta para o formato que o useChat entende
      return new Response(typeof response.data === 'string' ? response.data : JSON.stringify(response.data), {
        status: response.status,
        headers: new Headers(response.headers as any)
      });
    },
    onError: (err) => {
      console.error("[API-ERROR]", err);
      alert("ERRO FINAL DE CONEXÃO:\n" + JSON.stringify(err));
    },
    onResponse: (response) => {
      const newChatId = response.headers.get('x-chat-id');
      if (newChatId && newChatId !== chatId) {
        router.replace(`/porto?chatId=${newChatId}`, { scroll: false });
      }
    }
  });

  // Lógica de Sorteio e Hydration Safe
  useEffect(() => {
    if (isMounted && !initialMessageSet && messages.length === 0 && !chatId && !isHistoryLoading) {
      const pool = greetingPool[humor] || greetingPool.default;
      const randomGreeting = pool[Math.floor(Math.random() * pool.length)];
      
      setMessages([{ id: 'welcome-msg', role: 'assistant', content: randomGreeting }]);
      setInitialMessageSet(true);
    }
  }, [humor, messages.length, initialMessageSet, setMessages, isMounted, chatId, isHistoryLoading]);

  useEffect(() => {
    setIsMounted(true);
    const initialize = async () => {
      // Check de sessão ultrarrápido
      const { data: { session } } = await supabase.auth.getSession();
      const sessionUser = session?.user;
      
      if (sessionUser) {
        setUser(sessionUser);
        
        if (chatId) {
          setIsHistoryLoading(true);
          setMessages([]); // Limpa para evitar "pulo" de conteúdo antigo
          
          const { data: history } = await supabase
            .from('messages')
            .select('id, role, content')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: true });

          if (history && history.length > 0) {
            setMessages(history.map((m: any) => ({
              id: m.id,
              role: m.role as "user" | "assistant" | "system" | "data",
              content: m.content
            })));
          }
          setIsHistoryLoading(false);
        }
      }
    };
    initialize();
  }, [chatId, supabase, setMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleBlur = () => {
    setTimeout(() => {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
    }, 100);
  };

  const handleCustomSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    handleSubmit(e);
  };

  if (!isMounted) return null;

  return (
    <main className="fixed inset-0 flex flex-col overflow-hidden bg-slate-50 z-10 lg:pl-72 overscroll-none touch-pan-y">
      <AnimatedBackground subtle />
      
      <ChatHistorySidebar 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
      />

      {/* Header - Fixo no topo */}
      <header className="h-20 shrink-0 flex items-center justify-between px-6 bg-[#fdfcf7]/40 backdrop-blur-xl border-b border-white/30 z-30 pt-[env(safe-area-inset-top)]">
        <div className="flex items-center gap-4">
          <Link href="/">
            <button className="p-2 bg-white/60 border border-white/40 rounded-2xl text-slate-900 shadow-sm flex items-center justify-center hover:bg-white transition-all active:scale-[0.96]">
              <ArrowLeft size={18} />
            </button>
          </Link>
          <div className="flex flex-col sm:hidden">
            <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest leading-tight">Acolhimento</span>
            <h2 className="text-sm font-black text-slate-900 tracking-tighter leading-tight">O Porto</h2>
          </div>

          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="lg:hidden p-2 bg-white/60 border border-white/40 rounded-2xl text-slate-900 shadow-sm flex items-center gap-2 hover:bg-white transition-all active:scale-[0.96] ml-4"
          >
            <Clock size={16} className="text-blue-600" />
            <span className="text-[9px] font-black uppercase tracking-wider">Histórico</span>
          </button>



          <div className="hidden sm:flex items-center gap-4 ml-4">
            <div className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-lg">
              <Anchor size={20} />
            </div>
            <div className="flex flex-col">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-tighter leading-none mb-1">O Porto</h2>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Acolhimento</p>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          {user?.user_metadata?.birth_date && (
            <div className="px-5 py-2.5 bg-white/60 border border-white/40 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 shadow-sm">
              <Anchor size={12} className="text-blue-500" />
              Nasc.: {new Date(user.user_metadata.birth_date).toLocaleDateString('pt-BR')}
            </div>
          )}
          <div className="px-5 py-2.5 bg-white/60 border border-white/40 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 shadow-sm">
            <Sparkles size={12} className="text-blue-500" />
            Sincronizado
          </div>
        </div>
      </header>

      {/* Área de Mensagens - ÚNICA ÁREA SCROLLABLE */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar px-4 py-6 overscroll-contain pb-24"
      >
        <div className="max-w-3xl w-full mx-auto space-y-8">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 md:gap-5 max-w-[90%] md:max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 shadow-xl ${
                    m.role === 'user' ? 'bg-slate-900 text-white' : 'bg-white text-blue-600 border border-white/50 backdrop-blur-xl'
                  }`}>
                    {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  
                  <div className={`
                    relative p-4 md:p-5 rounded-[1.8rem] md:rounded-[2rem] text-sm md:text-base leading-relaxed shadow-lg border
                    ${m.role === 'user' 
                      ? 'bg-slate-900 text-white rounded-tr-none border-slate-800' 
                      : 'bg-white/80 text-slate-800 backdrop-blur-2xl border-white/60 rounded-tl-none'}
                  `}>
                    {m.content}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start gap-3 md:gap-5">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white flex items-center justify-center border border-white/50 shadow-xl backdrop-blur-xl">
                <Bot size={16} className="text-blue-600" />
              </div>
              <div className="bg-white/60 backdrop-blur-2xl p-4 md:p-5 rounded-[1.8rem] rounded-tl-none border border-white/60 flex gap-1.5 items-center shadow-lg">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </motion.div>
          )}

          {error && (
            <div className="flex justify-center">
              <div className="bg-red-50/50 backdrop-blur-md text-red-600 px-6 py-3 rounded-2xl flex flex-col items-center gap-2 border border-red-200/50 text-[10px] font-black uppercase tracking-widest shadow-xl">
                <div className="flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>Erro de Conexão</span>
                </div>
                <div className="text-[8px] opacity-70 lowercase font-mono">
                  {error.message || "Verifique sua internet ou servidor"}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Formulário - SEM GAPS NO FUNDO */}
      <div className="flex-none p-4 md:p-6 bg-[#fdfcf7] border-t border-slate-100 z-40 pb-[calc(env(safe-area-inset-bottom)+1rem)] lg:pb-6">
        <form 
          onSubmit={handleCustomSubmit}
          className="max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 shadow-sm rounded-[2rem] p-1.5 transition-all focus-within:bg-white focus-within:ring-4 ring-slate-900/5">
            <input
              value={input}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="Desabafe com o Âncora..."
              className="flex-1 bg-transparent px-6 py-3 outline-none text-slate-800 text-sm md:text-base font-bold placeholder:text-slate-400"
            />
            <motion.button 
              type="submit"
              whileHover={input.trim() && !isLoading ? { scale: 1.05 } : {}}
              whileTap={input.trim() && !isLoading ? { scale: 0.96 } : {}}
              disabled={!input.trim() || isLoading}
              className={`
                w-12 h-12 rounded-full transition-all flex items-center justify-center shrink-0 shadow-lg
                ${input.trim() && !isLoading 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-slate-100 text-slate-300 shadow-none'}
              `}
            >
              <Send size={18} strokeWidth={2.5} />
            </motion.button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function PortoPage() {
  return (
    <Suspense fallback={null}>
      <PortoContent />
    </Suspense>
  );
}
