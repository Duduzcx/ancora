"use client";

import React, { useEffect, useState } from 'react';
import { Plus, MessageSquare, Clock, ChevronRight, X, ArrowLeft, Anchor } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Chat {
  id: string;
  title: string;
  created_at: string;
}

interface ChatHistorySidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function ChatHistorySidebar({ isOpen, onClose }: ChatHistorySidebarProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentChatId = searchParams.get('chatId');

  const fetchChats = async () => {
    // Check de sessão rápido
    const { data: { session } } = await supabase.auth.getSession();
    const sessionUser = session?.user;
    setUser(sessionUser);

    if (sessionUser) {
      const { data } = await supabase
        .from('chats')
        .select('id, title, created_at')
        .eq('user_id', sessionUser.id)
        .order('created_at', { ascending: false });

      if (data) {
        setChats(data);
        // Prefetch das conversas para navegação instantânea
        data.slice(0, 5).forEach((chat: any) => {
          router.prefetch(`/porto?chatId=${chat.id}`);
        });
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchChats();
  }, []); // Carrega apenas uma vez no mount para poupar recursos

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      fetchChats(); // Refresh history when opening
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const handleNewChat = () => {
    // Ao navegar para /porto sem chatId, o useEffect no porto/page.tsx 
    // agora está configurado para resetar as mensagens.
    router.push('/porto');
    if (onClose) onClose();
  };

  const handleSelectChat = (id: string) => {
    router.push(`/porto?chatId=${id}`);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Overlay para Mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] md:hidden"
          />
        )}
      </AnimatePresence>

      <aside 
        className={`
          w-72 h-[100dvh] fixed top-0 left-0 bg-white lg:bg-slate-50 border-r border-slate-200 p-4 pt-[calc(env(safe-area-inset-top,44px)+2rem)] flex flex-col z-[110] transition-transform duration-500 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="flex items-center justify-between mb-8 px-2 md:hidden">
          <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Histórico</span>
          <button onClick={onClose} className="p-2 bg-slate-900/5 rounded-xl">
            <X size={18} />
          </button>
        </div>

        <button 
          onClick={handleNewChat}
          className="w-full mb-8 flex items-center justify-center gap-2 py-4 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-black transition-all shadow-xl active:scale-95 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" />
          <span>Nova Conversa</span>
        </button>

        <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500/60 mb-4 px-4 flex items-center gap-2">
            <Clock size={12} />
            Recentes
          </h3>

          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <div className="space-y-3 px-2">
                {[1, 2, 3, 4].map((i: number) => (
                  <div key={i} className="h-12 w-full bg-white/10 animate-pulse rounded-full" />
                ))}
              </div>
            ) : !user ? (
              <div className="p-8 text-center bg-slate-900/5 rounded-[2rem] border border-slate-900/5 mx-2">
                <div className="w-12 h-12 bg-slate-900 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Anchor size={20} />
                </div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-tighter mb-2">Suas Pérolas Estão Sumindo?</h4>
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed mb-6">
                  Crie uma conta gratuita para salvar suas conversas e nunca perder um insight importante.
                </p>
                <Link href="/auth">
                  <button className="w-full py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
                    Criar Conta Agora
                  </button>
                </Link>
              </div>
            ) : chats.length > 0 ? (
              chats.map((chat) => (
                  <motion.button
                  key={chat.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  onClick={() => handleSelectChat(chat.id)}
                  className={`w-full text-left p-5 rounded-[2.5rem] flex items-center justify-between group transition-all mb-2 ${
                    currentChatId === chat.id 
                      ? 'bg-slate-900 text-white shadow-2xl border-none scale-[1.02]' 
                      : 'bg-white text-slate-700 border border-slate-100 hover:bg-slate-50 hover:text-slate-900 shadow-sm'}
                  `}
                >
                  <div className="flex items-center gap-4 overflow-hidden flex-1">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${currentChatId === chat.id ? 'bg-white/10' : 'bg-slate-50'}`}>
                      <MessageSquare size={18} className={currentChatId === chat.id ? 'text-white' : 'text-emerald-500'} />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5">
                        {new Date(chat.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}, {new Date(chat.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-sm font-bold truncate">
                        {chat.title || 'Conversa sem título'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} className={`shrink-0 transition-transform group-hover:translate-x-1 ${currentChatId === chat.id ? 'text-white/30' : 'text-slate-300'}`} />
                </motion.button>
              ))
            ) : (
              <div className="text-center py-12 px-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                  Nenhuma conversa.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Botão de Voltar ao Início no Desktop */}
        <div className="mt-auto pt-4 border-t border-white/10 hidden lg:block">
          <Link href="/">
            <button 
              className="w-full flex items-center gap-3 px-6 py-4 text-slate-500 hover:text-slate-900 transition-colors font-black text-[10px] uppercase tracking-widest group"
            >
              <div className="p-2 bg-slate-900/5 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-all">
                <ArrowLeft size={16} />
              </div>
              Voltar ao Início
            </button>
          </Link>
        </div>
      </aside>
    </>
  );
}
