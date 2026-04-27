"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Briefcase, Users, Heart, ArrowLeft, Send, Bot, User, Anchor, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useChat } from '@ai-sdk/react';
import AnimatedBackground from '@/components/AnimatedBackground';

const scenarios = [
  { id: 1, title: "Reunião de Feedback", desc: "Pratique como lidar com críticas construtivas e pedir aumento.", icon: Briefcase, color: "text-blue-400" },
  { id: 2, title: "Conflito Familiar", desc: "Resolva desentendimentos com comunicação não-violenta.", icon: Users, color: "text-emerald-400" },
  { id: 3, title: "Primeiro Encontro", desc: "Quebre o gelo e mantenha a autenticidade sob pressão.", icon: Heart, color: "text-rose-400" },
];

export default function ArenaPage() {
  const [selected, setSelected] = useState<null | typeof scenarios[0]>(null);
  const [isMounted, setIsMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);
  
  const { messages, input, handleInputChange, handleSubmit, setMessages, append, isLoading } = useChat({
    api: '/api/chat',
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (selected && !hasStarted.current) {
      hasStarted.current = true;
      append({
        role: 'user',
        content: `SISTEMA: Iniciar Simulação Arena - ${selected.title}. ${selected.desc} Comece o diálogo como o personagem desafiador.`
      });
    }
  }, [selected, append]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  if (!isMounted) return null;

  const visibleMessages = messages.filter(m => !m.content.startsWith('SISTEMA:'));

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    handleSubmit(e);
  };

  return (
    <main className="flex flex-col h-[100dvh] w-full overflow-hidden bg-slate-50 relative z-10 transition-all overscroll-none touch-pan-y">
      <AnimatedBackground subtle />
      <AnimatePresence mode="wait">
        {!selected ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 overflow-y-auto w-full custom-scrollbar overscroll-contain"
          >
            {/* Header Arena */}
            <div className="flex-none p-4 md:p-8 flex items-center justify-between z-50">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('open-main-sidebar'))}
                  className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl hover:scale-105 transition-transform"
                >
                  <Menu size={20} />
                </button>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Treinamento</span>
                  <h2 className="text-xl font-black text-slate-900 tracking-tighter">A Arena</h2>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center max-w-6xl mx-auto px-6 py-12 md:p-12 lg:p-16 space-y-12 w-full">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-emerald-400 rounded-full text-xs font-bold border border-emerald-500/20 shadow-lg">
                  <Sword size={16} />
                  SIMULADOR TÁTICO
                </div>
                <h1 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter">Prepare sua voz.</h1>
                <p className="text-slate-500 text-lg max-w-2xl mx-auto font-bold">Selecione um cenário para treinar suas habilidades sociais em um ambiente seguro.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {scenarios.map((s) => (
                  <motion.div
                    key={s.id}
                    whileHover={{ y: -5, scale: 1.02 }}
                    onClick={() => {
                      hasStarted.current = false;
                      setSelected(s);
                    }}
                    className="bg-white border border-slate-200 p-8 rounded-[40px] cursor-pointer group transition-all hover:border-emerald-500/50 shadow-xl hover:shadow-2xl"
                  >
                    <div className={`mb-6 p-4 rounded-2xl bg-slate-50 w-fit group-hover:bg-emerald-500 group-hover:text-white transition-all ${s.color}`}>
                      <s.icon size={28} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">{s.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed font-bold">{s.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="chat"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col overflow-hidden w-full max-w-4xl mx-auto md:p-4"
          >
            {/* Header Simulação */}
            <div className="flex-none p-4 md:p-6 border-b border-slate-200/50 flex items-center justify-between bg-white/40 backdrop-blur-xl md:rounded-t-[40px] z-30">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('open-main-sidebar'))}
                  className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl hover:scale-105 transition-transform"
                >
                  <Menu size={18} />
                </button>
                <Link href="/">
                  <button className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors group ml-2">
                    <div className="p-2 bg-white border border-slate-200 rounded-xl group-hover:bg-slate-50 shadow-sm">
                      <ArrowLeft size={18} />
                    </div>
                    <span className="hidden sm:inline font-black text-[10px] tracking-widest uppercase">Início</span>
                  </button>
                </Link>
                <button 
                  onClick={() => {
                    setSelected(null);
                    setMessages([]);
                    hasStarted.current = false;
                  }}
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors group ml-2"
                >
                  <div className="p-2 bg-white border border-slate-200 rounded-xl group-hover:bg-slate-50 shadow-sm">
                    <X size={18} />
                  </div>
                  <span className="hidden xs:inline font-black text-[10px] tracking-widest uppercase">Sair</span>
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{selected.title}</p>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest leading-none">Simulação Neural</p>
                </div>
                <div className={`p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm ${selected.color}`}>
                  <selected.icon size={18} />
                </div>
              </div>
            </div>

            {/* Mensagens Scrollable */}
            <div 
              ref={scrollRef}
              className="flex-1 p-4 md:p-8 overflow-y-auto space-y-6 custom-scrollbar overscroll-contain bg-slate-50/50"
            >
              <AnimatePresence initial={false}>
                {visibleMessages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start gap-3 md:gap-4 max-w-[90%] md:max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                        m.role === 'user' ? 'bg-slate-900 text-white' : 'bg-white text-emerald-600 border border-white'
                      }`}>
                        {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                      </div>
                      <div className={`
                        p-4 md:p-5 rounded-[1.8rem] md:rounded-[2rem] text-sm md:text-base leading-relaxed shadow-lg
                        ${m.role === 'user' 
                          ? 'bg-slate-900 text-white rounded-tr-none' 
                          : 'bg-white/80 text-slate-800 backdrop-blur-xl border border-white/60 rounded-tl-none'}
                      `}>
                        {m.content}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <div className="flex justify-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white border border-white flex items-center justify-center shadow-lg">
                    <Bot size={14} className="text-emerald-600" />
                  </div>
                  <div className="bg-white/60 backdrop-blur-xl p-3 rounded-[1.5rem] rounded-tl-none border border-white shadow-sm flex gap-1 items-center">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Fixo */}
            <div className="flex-none p-4 md:p-6 bg-white border-t border-slate-100 md:rounded-b-[40px] z-40">
              <form 
                onSubmit={handleCustomSubmit}
                className="max-w-3xl mx-auto"
              >
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 shadow-sm rounded-[2rem] p-1.5 transition-all focus-within:bg-white focus-within:ring-4 ring-slate-900/5">
                  <input 
                    type="text" 
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Sua resposta..."
                    className="flex-1 bg-transparent px-6 py-3 outline-none text-slate-800 font-bold text-sm md:text-base placeholder:text-slate-400"
                  />
                  <motion.button 
                    type="submit"
                    whileHover={input.trim() && !isLoading ? { scale: 1.05 } : {}}
                    whileTap={input.trim() && !isLoading ? { scale: 0.95 } : {}}
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
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
