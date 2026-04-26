"use client";

import React, { useEffect, useState } from 'react';
import { Plus, MessageSquare, Clock, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface Chat {
  id: string;
  title: string;
  created_at: string;
}

export default function ChatHistorySidebar() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentChatId = searchParams.get('chatId');

  const fetchChats = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('chats')
        .select('id, title, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setChats(data);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchChats();

    // Opcional: Escutar mudanças em tempo real se necessário, mas o fetch inicial e navegação bastam por enquanto
  }, []);

  const handleNewChat = () => {
    router.push('/porto');
  };

  const handleSelectChat = (id: string) => {
    router.push(`/porto?chatId=${id}`);
  };

  return (
    <aside className="w-72 h-screen fixed left-0 md:left-64 top-0 bg-white/20 backdrop-blur-xl border-r border-white/30 p-4 flex flex-col z-20 transition-all">
      <button 
        onClick={handleNewChat}
        className="w-full mb-8 flex items-center justify-center gap-2 py-4 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black transition-all shadow-xl active:scale-95 group"
      >
        <Plus size={20} className="group-hover:rotate-90 transition-transform" />
        <span>Nova Conversa</span>
      </button>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500/60 mb-6 px-2 flex items-center gap-2">
          <Clock size={12} />
          Histórico Recente
        </h3>

        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 w-full bg-white/10 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : chats.length > 0 ? (
            chats.map((chat) => (
              <motion.button
                key={chat.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => handleSelectChat(chat.id)}
                className={`w-full text-left p-4 rounded-2xl flex items-center justify-between group transition-all ${
                  currentChatId === chat.id 
                    ? 'bg-white/50 shadow-sm text-slate-900 border border-white/40' 
                    : 'hover:bg-white/40 text-slate-700 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <MessageSquare size={16} className={currentChatId === chat.id ? 'text-emerald-400' : 'text-slate-400'} />
                  <span className="text-sm font-bold truncate">
                    {chat.title || 'Conversa sem título'}
                  </span>
                </div>
                <ChevronRight size={14} className={`transition-transform group-hover:translate-x-1 ${currentChatId === chat.id ? 'text-white' : 'text-slate-300'}`} />
              </motion.button>
            ))
          ) : (
            <div className="text-center py-12 px-6 bg-white/10 rounded-3xl border border-white/20">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                Nenhuma conversa encontrada.<br/>O mar está calmo hoje.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}
