"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Briefcase, Users, Heart, ArrowLeft, Send, Sparkles } from 'lucide-react';

const scenarios = [
  { id: 1, title: "Reunião de Feedback", desc: "Pratique como lidar com críticas construtivas e pedir aumento.", icon: Briefcase, color: "text-blue-400" },
  { id: 2, title: "Conflito Familiar", desc: "Resolva desentendimentos com comunicação não-violenta.", icon: Users, color: "text-emerald-400" },
  { id: 3, title: "Primeiro Encontro", desc: "Quebre o gelo e mantenha a autenticidade sob pressão.", icon: Heart, color: "text-rose-400" },
];

export default function ArenaPage() {
  const [selected, setSelected] = useState<null | typeof scenarios[0]>(null);

  return (
    <div className="min-h-screen p-8 md:p-16 flex flex-col items-center">
      <AnimatePresence mode="wait">
        {!selected ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-6xl w-full space-y-12"
          >
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-emerald-400 rounded-full text-xs font-bold border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <Sword size={16} />
                SIMULADOR TÁTICO ATIVO
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter">A Arena</h1>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto">Selecione um cenário para iniciar a simulação neural e treinar suas habilidades sociais.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {scenarios.map((s) => (
                <motion.div
                  key={s.id}
                  whileHover={{ y: -10, scale: 1.02 }}
                  onClick={() => setSelected(s)}
                  className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-8 rounded-[45px] cursor-pointer group transition-all hover:border-emerald-500/50 hover:shadow-[0_0_40px_rgba(16,185,129,0.2)]"
                >
                  <div className={`mb-6 p-4 rounded-3xl bg-slate-800 w-fit group-hover:bg-emerald-500 group-hover:text-white transition-all ${s.color}`}>
                    <s.icon size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{s.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="chat"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-4xl w-full h-[80vh] bg-slate-900 border border-slate-800 rounded-[45px] shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <button 
                onClick={() => setSelected(null)}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="font-bold text-sm">ENCERRAR SIMULAÇÃO</span>
              </button>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">{selected.title}</p>
                  <p className="text-[10px] text-slate-500">IA EM SINCRONIA</p>
                </div>
                <selected.icon size={24} className={selected.color} />
              </div>
            </div>

            <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-slate-950/30">
              <div className="flex justify-start">
                <div className="bg-slate-800 text-slate-200 p-6 rounded-3xl rounded-tl-none max-w-[80%] border border-slate-700">
                  <p className="text-lg italic font-light">"A simulação de {selected.title} começou. Eu serei seu interlocutor. Pode começar a falar quando estiver pronto."</p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-950/50">
              <div className="flex gap-4 p-2 bg-slate-800 rounded-full border border-slate-700">
                <input 
                  type="text" 
                  placeholder="Inicie o diálogo..."
                  className="flex-1 bg-transparent px-6 py-3 outline-none text-white font-medium"
                />
                <button className="bg-emerald-500 text-white p-4 rounded-full hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
                  <Sparkles size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
