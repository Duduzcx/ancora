"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Briefcase, Users, Heart, ArrowLeft, Send, Sparkles, Bot, User, Anchor } from 'lucide-react';
import { useChat } from '@ai-sdk/react';

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

  // Gatilho inicial da simulação
  useEffect(() => {
    if (selected && !hasStarted.current) {
      hasStarted.current = true;
      append({
        role: 'user',
        content: `SISTEMA: Iniciar Simulação Arena - ${selected.title}. ${selected.desc} Comece o diálogo como o personagem desafiador.`
      });
    }
  }, [selected, append]);

  // Scroll automático
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isMounted) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Anchor size={48} className="text-slate-900 animate-spin-slow" />
    </div>
  );

  const visibleMessages = messages.filter(m => !m.content.startsWith('SISTEMA:'));

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    handleSubmit(e);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 lg:p-16 flex flex-col items-center">
      <AnimatePresence mode="wait">
        {!selected ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-6xl w-full space-y-12"
          >
            <div className="text-center space-y-4 pt-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-emerald-400 rounded-full text-xs font-bold border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <Sword size={16} />
                SIMULADOR TÁTICO ATIVO
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter">A Arena</h1>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto font-bold">Selecione um cenário para iniciar a simulação neural e treinar suas habilidades sociais.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {scenarios.map((s) => (
                <motion.div
                  key={s.id}
                  whileHover={{ y: -10, scale: 1.02 }}
                  onClick={() => {
                    hasStarted.current = false;
                    setSelected(s);
                  }}
                  className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-10 rounded-[45px] cursor-pointer group transition-all hover:border-emerald-500/50 hover:shadow-[0_0_40px_rgba(16,185,129,0.2)]"
                >
                  <div className={`mb-6 p-5 rounded-3xl bg-slate-800 w-fit group-hover:bg-emerald-500 group-hover:text-white transition-all ${s.color}`}>
                    <s.icon size={36} />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3 tracking-tight">{s.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed font-bold opacity-80">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="chat"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-4xl w-full h-[85vh] bg-slate-900 border border-slate-800 rounded-[45px] shadow-2xl flex flex-col overflow-hidden relative"
          >
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 backdrop-blur-md z-10">
              <button 
                onClick={() => {
                  setSelected(null);
                  setMessages([]);
                  hasStarted.current = false;
                }}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
              >
                <div className="p-2 bg-slate-800 rounded-xl group-hover:bg-slate-700">
                  <ArrowLeft size={18} />
                </div>
                <span className="font-black text-xs tracking-widest uppercase">Encerrar</span>
              </button>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em]">{selected.title}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">IA EM SINCRONIA</p>
                </div>
                <div className={`p-3 bg-slate-800 rounded-2xl ${selected.color}`}>
                  <selected.icon size={24} />
                </div>
              </div>
            </div>

            <div 
              ref={scrollRef}
              className="flex-1 p-8 overflow-y-auto space-y-6 bg-slate-950/30 custom-scrollbar"
            >
              <AnimatePresence initial={false}>
                {visibleMessages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start gap-4 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`p-2 rounded-xl ${m.role === 'user' ? 'bg-emerald-500' : 'bg-slate-800'} text-white shadow-lg shrink-0 mt-1`}>
                        {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                      </div>
                      <div className={`
                        p-5 rounded-[2rem] text-sm md:text-base leading-relaxed font-bold
                        ${m.role === 'user' 
                          ? 'bg-emerald-500 text-white rounded-tr-none' 
                          : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'}
                      `}>
                        {m.content}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <div className="flex justify-start ml-12">
                  <div className="bg-slate-800/50 p-4 rounded-2xl flex gap-1">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 bg-slate-950/80 backdrop-blur-md">
              <form 
                onSubmit={handleCustomSubmit}
                className="flex gap-4 p-2 bg-slate-800 rounded-full border border-slate-700 shadow-2xl focus-within:border-emerald-500/50 transition-all"
              >
                <input 
                  type="text" 
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Responda ao desafio..."
                  className="flex-1 bg-transparent px-6 py-4 outline-none text-white font-bold placeholder:text-slate-500"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="bg-emerald-500 text-white p-5 rounded-full hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-30 disabled:grayscale"
                >
                  <Send size={22} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
