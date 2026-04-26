"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useChat } from '@ai-sdk/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, ShieldCheck, Sparkles, AlertCircle, ArrowLeft, Anchor } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import ChatSidebar from '@/components/ChatSidebar';
import Link from 'next/link';
import AnimatedBackground from '@/components/AnimatedBackground';

function PortoContent() {
  const searchParams = useSearchParams();
  const mood = searchParams.get('mood');
  const [chatId, setChatId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const hasAppendedInitial = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const { messages, input, handleInputChange, handleSubmit, setMessages, isLoading, error, append } = useChat({
    api: '/api/chat',
    onFinish: async (message) => {
      if (chatId && user) {
        await supabase.from('messages').insert({
          chat_id: chatId,
          role: 'assistant',
          content: message.content
        });
      }
    }
  });

  // 1. Efeito de Montagem, Auth e Recuperação de Memória (Guest)
  useEffect(() => {
    setIsMounted(true);
    
    const initialize = async () => {
      const { data: { user: sessionUser } } = await supabase.auth.getUser();
      setUser(sessionUser);

      // Se NÃO tiver usuário, tenta recuperar do localStorage
      if (!sessionUser) {
        const savedMessages = localStorage.getItem('ancora-guest-chat');
        if (savedMessages) {
          setMessages(JSON.parse(savedMessages));
          hasAppendedInitial.current = true; // Evita mandar boas-vindas de novo
        }
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase, setMessages]);

  // 2. Persistência de Memória (Guest)
  useEffect(() => {
    if (!user && messages.length > 0) {
      localStorage.setItem('ancora-guest-chat', JSON.stringify(messages));
    }
  }, [messages, user]);

  // 3. Efeito de Mensagem Inicial (Robusto)
  useEffect(() => {
    if (!isMounted || hasAppendedInitial.current || typeof append !== 'function') return;

    if (mood) {
      hasAppendedInitial.current = true;
      // Limpa mensagens anteriores se estiver entrando com um humor novo (Check-in)
      setMessages([]);
      
      const timer = setTimeout(() => {
        append({ 
          role: 'user', 
          content: `SISTEMA: O usuário clicou no humor "${mood}". Inicie um acolhimento caloroso, curto e empático focado neste estado de espírito.` 
        });
      }, 300);
      return () => clearTimeout(timer);
    } else if (messages.length === 0) {
      hasAppendedInitial.current = true;
      const welcomeMsg = {
        id: 'welcome',
        role: 'assistant' as const,
        content: "Fala! Sou o Âncora. Tô aqui pra te ouvir. Como você tá se sentindo agora?"
      };
      setMessages([welcomeMsg]);
    }
  }, [isMounted, mood, append, messages.length, setMessages]);

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input?.trim()) return;

    handleSubmit(e);

    if (user) {
      let currentChatId = chatId;
      if (!currentChatId) {
        // Gera um título limpo a partir da primeira mensagem
        const cleanTitle = input.trim().length > 30 
          ? input.trim().substring(0, 30) + "..." 
          : input.trim();

        const { data, error: chatError } = await supabase
          .from('chats')
          .insert({ 
            user_id: user.id, 
            title: cleanTitle || "Nova Conversa" 
          })
          .select()
          .single();
        
        if (data) {
          setChatId(data.id);
          currentChatId = data.id;
        }
      }

      if (currentChatId) {
        await supabase.from('messages').insert({
          chat_id: currentChatId,
          role: 'user',
          content: input
        });
      }
    }
  };

  const loadChat = async (id: string) => {
    if (!id) {
      setChatId(null);
      // Se limpar o chat logado, volta pro estado inicial ou recupera guest se existir
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: "Fala! Sou o Âncora. Tô aqui pra te ouvir. Como você tá se sentindo agora?"
        }
      ]);
      return;
    }
    setChatId(id);
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', id)
      .order('created_at', { ascending: true });
    if (data) {
      setMessages(data.map(m => ({ id: m.id, role: m.role, content: m.content })));
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isMounted) return null;

  const visibleMessages = messages.filter(m => !m.content.startsWith('SISTEMA:'));

  return (
    <div className="relative flex h-screen overflow-hidden bg-transparent">
      <AnimatedBackground subtle />
      <AnimatePresence>
        {user && (
          <motion.div 
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            className="h-full"
          >
            <ChatSidebar onSelectChat={loadChat} currentChatId={chatId || undefined} />
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col relative bg-transparent">
        <header className="p-6 border-b border-white/20 bg-white/40 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/">
              <motion.button 
                whileHover={{ scale: 1.1, x: -5 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center justify-center"
              >
                <ArrowLeft size={20} />
              </motion.button>
            </Link>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg">
                <Anchor size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">O Porto</h2>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles size={10} className="animate-pulse" />
                  Ambiente de Imersão
                </p>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white/60 px-4 py-2 rounded-full border border-white/40">
            <ShieldCheck size={14} className="text-emerald-500" />
            Foco Total no Acolhimento
          </div>
        </header>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-6"
        >
          <AnimatePresence initial={false}>
            {visibleMessages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-end gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`p-2 rounded-full ${m.role === 'user' ? 'bg-slate-900' : 'bg-blue-600'} text-white shadow-lg`}>
                    {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div className={`
                    p-5 rounded-[2.5rem] shadow-sm text-sm md:text-base leading-relaxed
                    ${m.role === 'user' 
                      ? 'bg-slate-900 text-white rounded-br-none shadow-xl' 
                      : 'bg-white/90 text-slate-800 backdrop-blur-md border border-white/50 rounded-bl-none'}
                  `}>
                    {m.content}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center"
            >
              <div className="bg-red-50 text-red-600 px-6 py-3 rounded-full flex items-center gap-3 border border-red-200 text-sm font-black">
                <AlertCircle size={16} />
                Houve um problema na conexão. Verifique sua internet ou a chave da API.
              </div>
            </motion.div>
          )}
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start ml-12"
            >
              <div className="bg-white/60 p-4 rounded-2xl flex gap-1">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </motion.div>
          )}
        </div>

        <footer className="p-8 bg-gradient-to-t from-slate-50 to-transparent">
          <form 
            onSubmit={handleCustomSubmit}
            className="max-w-4xl mx-auto flex items-center gap-3 p-2 bg-white/90 backdrop-blur-3xl border border-white/60 rounded-full shadow-2xl"
          >
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Fale o que estiver no seu coração..."
              className="flex-1 bg-transparent px-6 py-4 outline-none text-slate-800 text-lg font-medium"
            />
            <motion.button 
              type="submit"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9, rotate: -5 }}
              disabled={!input?.trim() || isLoading}
              className="p-5 bg-slate-900 text-white rounded-full hover:scale-105 transition-all shadow-xl disabled:opacity-30 flex items-center justify-center"
            >
              <Send size={24} />
            </motion.button>
          </form>
        </footer>
      </main>
    </div>
  );
}

export default function PortoPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Anchor size={48} className="text-slate-900 animate-spin-slow" />
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Iniciando o Porto...</p>
        </div>
      </div>
    }>
      <PortoContent />
    </Suspense>
  );
}
