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

function PortoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const chatId = searchParams.get('chatId');
  const supabase = createClient();
  
  const [user, setUser] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, setMessages, isLoading, error } = useChat({
    api: '/api/chat',
    body: { chatId },
    onResponse: (response) => {
      const newChatId = response.headers.get('x-chat-id');
      if (newChatId && newChatId !== chatId) {
        router.replace(`/porto?chatId=${newChatId}`, { scroll: false });
      }
    }
  });

  useEffect(() => {
    setIsMounted(true);
    const initialize = async () => {
      // Busca usuário e mensagens em paralelo para maior velocidade
      const [userResponse, messagesResponse] = await Promise.all([
        supabase.auth.getUser(),
        chatId ? supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true }) : Promise.resolve({ data: [] })
      ]);

      const sessionUser = userResponse.data.user;
      setUser(sessionUser);

      const data = messagesResponse.data;
      if (data && data.length > 0) {
        setMessages(data.map(m => ({
          id: m.id,
          role: m.role as "user" | "assistant" | "system" | "data",
          content: m.content
        })));
      } else if (!chatId) {
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: 'Olá! Sou o Âncora, seu guia neste porto seguro. Como posso te ajudar hoje?'
          }
        ]);
      } else {
        setMessages([]);
      }
    };
    initialize();
  }, [chatId, supabase, setMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleCustomSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    handleSubmit(e);
  };

  if (!isMounted) return null;

  return (
    <main className="flex flex-col h-[100dvh] overflow-hidden bg-slate-50 relative z-10 pl-0 md:pl-[calc(16rem+18rem)] transition-all overscroll-none touch-pan-y">
      <AnimatedBackground subtle />
      
      {user && (
        <ChatHistorySidebar 
          isOpen={isHistoryOpen} 
          onClose={() => setIsHistoryOpen(false)} 
        />
      )}

      {/* Header - Fixo no topo */}
      <header className="h-20 shrink-0 flex items-center justify-between px-4 md:px-8 bg-white/40 backdrop-blur-xl border-b border-white/30 z-30">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('open-main-sidebar'))}
            className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl hover:scale-105 transition-transform"
          >
            <Menu size={18} />
          </button>

          <div className="flex flex-col sm:hidden">
            <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Acolhimento</span>
            <h2 className="text-xs font-black text-slate-900 tracking-tighter">O Porto</h2>
          </div>

          <Link href="/">
            <motion.button 
              whileHover={{ scale: 1.1, x: -2 }}
              whileTap={{ scale: 0.9 }}
              className="hidden sm:flex p-2.5 bg-white/60 border border-white/40 text-slate-900 rounded-2xl shadow-sm items-center justify-center group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            </motion.button>
          </Link>

          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="p-3 bg-white/60 border border-white/40 rounded-2xl text-slate-900 shadow-sm flex items-center gap-2"
          >
            <Clock size={18} />
            <span className="hidden xs:inline text-[9px] font-black uppercase tracking-widest">Histórico</span>
          </button>

          <div className="hidden sm:flex items-center gap-4">
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
          <div className="px-5 py-2.5 bg-white/60 border border-white/40 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 shadow-sm">
            <Sparkles size={12} className="text-blue-500" />
            Sincronizado
          </div>
        </div>
      </header>

      {/* Área de Mensagens - ÚNICA ÁREA SCROLLABLE */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar px-4 py-6 overscroll-contain"
      >
        <div className="max-w-3xl w-full mx-auto space-y-8 pb-10">
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
              <div className="bg-red-50/50 backdrop-blur-md text-red-600 px-6 py-3 rounded-2xl flex items-center gap-3 border border-red-200/50 text-xs font-black uppercase tracking-widest shadow-xl">
                <AlertCircle size={16} />
                Erro na conexão.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Formulário - FIXO NA BASE */}
      <form 
        onSubmit={handleCustomSubmit}
        className="flex-none p-4 pb-safe bg-white/40 backdrop-blur-xl border-t border-white/20 z-40"
      >
        <div className="max-w-3xl mx-auto flex gap-2">
          <div className="flex-1 flex items-center bg-white/70 border border-white/50 shadow-xl rounded-full p-1.5 transition-all focus-within:bg-white focus-within:ring-4 ring-slate-900/5">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Fale com o Âncora..."
              className="flex-1 bg-transparent px-5 py-3 outline-none text-slate-800 text-sm md:text-base font-bold placeholder:text-slate-400"
            />
          </div>
          <motion.button 
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!input.trim() || isLoading}
            className="p-4 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all shadow-xl disabled:opacity-10 flex items-center justify-center shrink-0"
          >
            <Send size={20} />
          </motion.button>
        </div>
      </form>
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
