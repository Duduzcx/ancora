"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useChat } from '@ai-sdk/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Anchor, ArrowLeft, AlertCircle, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';
import ChatHistorySidebar from '@/components/ChatHistorySidebar';
import AnimatedBackground from '@/components/AnimatedBackground';
import { getApiUrl } from '@/lib/api-utils';

function PortoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const chatId = searchParams.get('chatId');
  const humor = searchParams.get('humor');
  const supabase = createClient();
  
  const [user, setUser] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [debugError, setDebugError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // useChat configurado para ser o mais simples possível
  const { messages, input, handleInputChange, handleSubmit, setMessages, isLoading, error } = useChat({
    api: 'https://ancura.netlify.app/api/chat', // URL direta para não ter erro
    body: { chatId },
    onError: (err) => {
      console.error("Erro useChat:", err);
      setDebugError(err.message || JSON.stringify(err));
    }
  });

  useEffect(() => {
    setIsMounted(true);
    // Tenta carregar mensagens se tiver chatId
    const loadHistory = async () => {
      if (chatId) {
        const { data: history } = await supabase
          .from('messages')
          .select('id, role, content')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true });

        if (history) {
          setMessages(history.map(m => ({
            id: m.id,
            role: m.role as any,
            content: m.content
          })));
        }
      } else {
        // Mensagem inicial se for novo chat
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: 'Bem-vindo ao Porto. Sou o seu Guarda-Farol. Como está o seu mar hoje?'
        }]);
      }
    };
    loadHistory();
  }, [chatId, setMessages, supabase]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  if (!isMounted) return null;

  return (
    <main className="fixed inset-0 flex flex-col overflow-hidden bg-slate-50 z-10 lg:pl-72 overscroll-none">
      <AnimatedBackground subtle />
      
      <ChatHistorySidebar 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
      />

      <header className="h-20 shrink-0 flex items-center justify-between px-6 bg-[#fdfcf7]/40 backdrop-blur-xl border-b border-white/30 z-30 pt-[env(safe-area-inset-top)]">
        <div className="flex items-center gap-4">
          <Link href="/">
            <button className="p-2 bg-white/60 border border-white/40 rounded-2xl text-slate-900 shadow-sm flex items-center justify-center transition-all active:scale-[0.96]">
              <ArrowLeft size={18} />
            </button>
          </Link>
          <div className="flex flex-col">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tighter leading-none">O Porto</h2>
            <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest leading-tight">Conectado</p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsHistoryOpen(true)}
          className="lg:hidden p-2 bg-white/60 border border-white/40 rounded-2xl text-slate-900 flex items-center gap-2"
        >
          <Clock size={16} className="text-blue-600" />
          <span className="text-[9px] font-black uppercase tracking-wider">Histórico</span>
        </button>
      </header>

      {/* ÁREA DE MENSAGENS */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 pb-24"
      >
        <div className="max-w-3xl w-full mx-auto space-y-8">
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[90%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                  m.role === 'user' ? 'bg-slate-900 text-white' : 'bg-white text-blue-600 border border-white/50'
                }`}>
                  {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`
                  p-4 rounded-[1.8rem] text-sm leading-relaxed shadow-lg border
                  ${m.role === 'user' 
                    ? 'bg-slate-900 text-white rounded-tr-none border-slate-800' 
                    : 'bg-white/80 text-slate-800 backdrop-blur-2xl border-white/60 rounded-tl-none'}
                `}>
                  {m.content}
                </div>
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center border border-white/50 shadow-lg animate-pulse">
                <Bot size={16} className="text-blue-600" />
              </div>
              <div className="bg-white/60 p-4 rounded-[1.8rem] rounded-tl-none border border-white/60 shadow-lg flex gap-1.5 items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          {/* PAINEL DE DEBUG GIGANTE SE DER ERRO */}
          {(error || debugError) && (
            <div className="p-6 bg-red-50 border-2 border-red-200 rounded-[2rem] space-y-3">
              <div className="flex items-center gap-2 text-red-600 font-black uppercase text-xs">
                <AlertCircle size={20} />
                <span>Falha Crítica de Conexão</span>
              </div>
              <p className="text-[10px] text-red-500 font-mono bg-white p-4 rounded-xl border border-red-100 overflow-x-auto">
                {error?.message || debugError || "Erro desconhecido"}
              </p>
              <p className="text-[9px] text-slate-500 italic">
                Verifique se o seu celular tem internet e se a GEMINI_API_KEY está no Netlify.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-none p-4 bg-[#fdfcf7] border-t border-slate-100 z-40 pb-[calc(env(safe-area-inset-bottom)+1rem)] lg:pb-6">
        <form 
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto flex items-center gap-2 bg-slate-50 border border-slate-200 shadow-sm rounded-[2rem] p-1.5 focus-within:bg-white focus-within:ring-4 ring-slate-900/5 transition-all"
        >
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Diga algo para o Guarda-Farol..."
            className="flex-1 bg-transparent px-6 py-3 outline-none text-slate-800 text-sm font-bold placeholder:text-slate-400"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${
              input.trim() && !isLoading ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-300'
            }`}
          >
            <Send size={18} />
          </button>
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
