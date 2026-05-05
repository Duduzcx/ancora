"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase-client';
import { MessageSquare, Plus, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Chat {
  id: string;
  title: string;
  created_at: string;
}

export default function ChatSidebar({ onSelectChat, currentChatId }: { onSelectChat: (id: string) => void, currentChatId?: string }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchChats = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const sessionUser = session?.user;
      setUser(sessionUser);
      
      let allChats: Chat[] = [];

      // 1. Carrega do Cache Local (Instantâneo)
      const localChats = JSON.parse(localStorage.getItem('norica-local-chats') || '[]');
      allChats = [...localChats];

      // 2. Carrega do Supabase (Se logado)
      if (sessionUser) {
        const { data } = await supabase
          .from('chats')
          .select('*')
          .eq('user_id', sessionUser.id)
          .order('created_at', { ascending: false });
        
        if (data) {
          // Merge Inteligente: Prefere dados do Supabase mas mantém locais novos
          const dbIds = new Set(data.map((c: any) => c.id));
          const onlyLocal = localChats.filter((lc: Chat) => !dbIds.has(lc.id));
          allChats = [...data, ...onlyLocal].sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        }
      }

      setChats(allChats);
    };
    fetchChats();
  }, [currentChatId]);

  const [user, setUser] = useState<any>(null);

  const handleNewChat = () => {
    if (!user) {
      localStorage.removeItem('norica-guest-chat');
    }
    onSelectChat('');
  };

  return (
    <div className="w-80 h-full flex flex-col bg-white/20 backdrop-blur-xl border-r border-white/20 p-6">
      <button 
        onClick={handleNewChat}
        className="w-full py-4 px-6 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all mb-8 shadow-xl"
      >
        <Plus size={18} />
        Nova Conversa
      </button>

      <div className="flex-1 overflow-y-auto space-y-6">
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
            <Clock size={12} />
            Recentes
          </h4>
          <div className="space-y-2">
            {user ? (
              chats.length > 0 ? chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className={`w-full text-left p-4 rounded-2xl flex items-center justify-between group transition-all ${currentChatId === chat.id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/30 hover:bg-white/50 text-slate-700'}`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <MessageSquare size={16} className={currentChatId === chat.id ? 'text-white' : 'text-emerald-500'} />
                    <span className="text-sm font-bold truncate">{chat.title}</span>
                  </div>
                  <ChevronRight size={14} className={`transition-transform group-hover:translate-x-1 ${currentChatId === chat.id ? 'text-white' : 'text-slate-300'}`} />
                </button>
              )) : (
                <div className="p-8 text-center border-2 border-dashed border-white/20 rounded-3xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nenhuma conversa encontrada</p>
                </div>
              )
            ) : (
              <div className="p-8 text-center bg-white/40 rounded-3xl border border-white/60">
                <p className="text-xs font-bold text-slate-600 mb-4 leading-relaxed">
                  Entre para salvar suas conversas e acessá-las de qualquer lugar.
                </p>
                <Link href="/auth">
                  <button className="w-full py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all">
                    Entrar Agora
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
