"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useChat } from '@ai-sdk/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Anchor, ArrowLeft, MessageCircle, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase';
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatIdRef = useRef<string | null>(chatId);

  // Sincroniza a ref com o chatId da URL
  useEffect(() => {
    chatIdRef.current = chatId;
  }, [chatId]);

  const { messages, input, handleInputChange, handleSubmit, setMessages, isLoading, error, append } = useChat({
    api: '/api/chat',
    onFinish: async (message) => {
      // Salva a resposta do assistente no Supabase se houver um chat ativo
      if (chatIdRef.current && user) {
        await supabase.from('messages').insert({
          chat_id: chatIdRef.current,
          role: 'assistant',
          content: message.content
        });
      }
    }
  });

  // 1. Inicialização: Auth e Carregamento de Mensagens
  useEffect(() => {
    setIsMounted(true);
    const initialize = async () => {
      const { data: { user: sessionUser } } = await supabase.auth.getUser();
      setUser(sessionUser);

      if (chatId) {
        const { data, error: fetchError } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true });
        
        if (data) {
          setMessages(data.map(m => ({
            id: m.id,
            role: m.role,
            content: m.content
          })));
        }
      } else {
        // Chat vazio ou nova conversa
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: 'Olá! Sou o Âncora, seu guia neste porto seguro. Como posso te ajudar hoje?'
          }
        ]);
      }
    };
    initialize();
  }, [chatId, supabase, setMessages]);

  // 2. Scroll automático para o fundo
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // 3. Handler de envio customizado para persistência
  const handleCustomSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const messageContent = input.trim();
    if (!messageContent || isLoading) return;

    // Limpa o input manualmente para iniciar o append
    handleInputChange({ target: { value: '' } } as any);

    let currentChatId = chatId;

    if (user) {
      try {
        // Se não houver chatId, cria um novo chat
        if (!currentChatId) {
          const cleanTitle = messageContent.length > 40 
            ? messageContent.substring(0, 40) + "..." 
            : messageContent;

          const { data: newChat, error: chatError } = await supabase
            .from('chats')
            .insert({ 
              user_id: user.id, 
              title: cleanTitle || "Nova Conversa" 
            })
            .select()
            .single();
          
          if (chatError) throw chatError;
          
          if (newChat) {
            currentChatId = newChat.id;
            chatIdRef.current = newChat.id;
            // Atualiza a URL sem recarregar a página
            router.replace(`/porto?chatId=${newChat.id}`, { scroll: false });
          }
        }

        // Salva a mensagem do usuário no banco
        if (currentChatId) {
          await supabase.from('messages').insert({
            chat_id: currentChatId,
            role: 'user',
            content: messageContent
          });
        }
      } catch (err) {
        console.error("Erro ao persistir chat/mensagem:", err);
      }
    }

    // Dispara o stream da IA
    append({
      role: 'user',
      content: messageContent
    });
  };

  if (!isMounted) return null;

  return (
    <div className="flex h-screen w-full pl-0 md:pl-[calc(16rem+18rem)] relative z-10 bg-transparent transition-all">
      <AnimatedBackground subtle />
      
      {/* Sidebar de Histórico (Só aparece se logado) */}
      {user && <ChatHistorySidebar />}

      <main className="flex-1 flex flex-col h-screen relative overflow-hidden">
        {/* Header Superior com Glassmorphism */}
        <header className="h-20 shrink-0 flex items-center justify-between px-8 bg-white/40 backdrop-blur-xl border-b border-white/30 z-30">
          <div className="flex items-center gap-6">
            <Link href="/">
              <motion.button 
                whileHover={{ scale: 1.1, x: -2 }}
                whileTap={{ scale: 0.9 }}
                className="p-2.5 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center justify-center group"
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              </motion.button>
            </Link>

            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/20">
                <Anchor size={20} />
              </div>
              <div className="flex flex-col">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-tighter leading-none mb-1">O Porto</h2>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Acolhimento Ativo</p>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="px-5 py-2.5 bg-white/60 border border-white/40 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 shadow-sm">
              <Sparkles size={12} className="text-blue-500" />
              Interface Sincronizada
            </div>
          </div>
        </header>

        {/* Área de Mensagens Centralizada */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar"
        >
          <div className="max-w-3xl w-full mx-auto pb-32 pt-8 px-4 space-y-10">
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-5 max-w-[88%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl transition-transform hover:scale-110 ${
                      m.role === 'user' ? 'bg-slate-900 text-white' : 'bg-white text-blue-600 border border-white/50 backdrop-blur-xl'
                    }`}>
                      {m.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                    </div>
                    
                    <div className={`
                      relative p-5 rounded-[2rem] text-sm md:text-base leading-relaxed shadow-xl border
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start gap-5">
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center border border-white/50 shadow-xl backdrop-blur-xl">
                  <Bot size={20} className="text-blue-600" />
                </div>
                <div className="bg-white/60 backdrop-blur-2xl p-5 rounded-[2rem] rounded-tl-none border border-white/60 flex gap-1.5 items-center shadow-lg">
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
                  Erro na conexão. Tente novamente.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Formulário Flutuante Estilo Pílula */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 z-40">
          <form 
            onSubmit={handleCustomSubmit}
            className="group relative flex items-center bg-white/60 backdrop-blur-3xl border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-full p-2 flex gap-2 transition-all focus-within:bg-white/80 focus-within:border-white/60 focus-within:shadow-[0_20px_60px_rgba(0,0,0,0.15)] ring-slate-900/5 focus-within:ring-4"
          >
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Desabafe o que estiver no seu coração..."
              className="flex-1 bg-transparent px-6 py-4 outline-none text-slate-800 text-sm md:text-base font-bold placeholder:text-slate-400 placeholder:font-medium"
            />
            <motion.button 
              type="submit"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95, rotate: -5 }}
              disabled={!input.trim() || isLoading}
              className="p-4 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all shadow-2xl disabled:opacity-10 flex items-center justify-center group/btn"
            >
              <Send size={20} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
            </motion.button>
          </form>
          <div className="flex justify-center mt-3 gap-6">
             <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-60">Privacidade Total</p>
             <span className="text-[8px] text-slate-300">•</span>
             <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-60">Acolhimento Imediato</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PortoPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center gap-6">
        <Anchor size={48} className="text-slate-900 animate-bounce" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Preparando o Porto...</p>
      </div>
    }>
      <PortoContent />
    </Suspense>
  );
}
