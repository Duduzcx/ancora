"use client";

import React, { useEffect, useState } from 'react';
import { Plus, MessageSquare, Clock, ChevronRight, X } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import { useRouter, useSearchParams } from 'next/navigation';
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
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentChatId = searchParams.get('chatId');

  const fetchChats = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
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
  }, [currentChatId]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const handleNewChat = () => {
    router.push('/porto');
    fetchChats();
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

      <aside className={`
        w-72 h-[100dvh] fixed top-0 bg-white/20 backdrop-blur-2xl border-r border-white/30 p-4 flex flex-col z-[110] transition-all duration-500
        ${isOpen ? 'left-0' : '-left-full'}
        md:left-0
      `}>
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
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 w-full bg-white/10 animate-pulse rounded-full" />
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
                  className={`w-full text-left p-4 rounded-full flex items-center justify-between group transition-all ${
                    currentChatId === chat.id 
                      ? 'bg-slate-900 text-white shadow-lg border-none' 
                      : 'bg-white/40 text-slate-700 border border-white/40 hover:bg-white hover:text-slate-900 shadow-sm'}
                  `}
                >
                  <div className="flex items-center gap-3 overflow-hidden flex-1">
                    <MessageSquare size={16} className={currentChatId === chat.id ? 'text-white' : 'text-slate-500'} />
                    <span className="text-sm font-medium truncate">
                      {chat.title || 'Conversa sem título'}
                    </span>
                  </div>
                  <ChevronRight size={14} className={`shrink-0 transition-transform group-hover:translate-x-1 ${currentChatId === chat.id ? 'text-white/50' : 'text-slate-600'}`} />
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
      </aside>
    </>
  );
}
