"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import { MessageSquare, Plus, Clock, ChevronRight } from 'lucide-react';

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
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('chats')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (data) setChats(data);
      }
    };
    fetchChats();
  }, [currentChatId]);

  return (
    <div className="w-80 h-full flex flex-col bg-white/20 backdrop-blur-xl border-r border-white/20 p-6 hidden lg:flex">
      <button 
        onClick={() => onSelectChat('')}
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
            {chats.map((chat) => (
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
