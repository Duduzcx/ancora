"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Lock, ShieldAlert, CheckCircle2, ShieldCheck, Key, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CofrePage() {
  const [text, setText] = useState('');
  const [isBurning, setIsBurning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const router = useRouter();

  const handleSave = () => {
    if (!text) return;
    setIsSaving(true);
    
    // Simula salvamento local
    localStorage.setItem('ancora_vault_latest', text);
    
    setTimeout(() => {
      setIsSaving(false);
      setShowSavedToast(true);
      setText(''); // O texto some para "dentro" do cofre
      
      // Pequeno delay para o usuário sentir o salvamento antes de fechar ou limpar
      setTimeout(() => {
        setShowSavedToast(false);
      }, 4000);
    }, 1500);
  };

  const handleBurn = () => {
    if (!text || isBurning) return;
    setIsBurning(true);
    setTimeout(() => {
      setText('');
      setIsBurning(false);
    }, 2000);
  };

  return (
    <div className="h-screen bg-slate-950 flex flex-col items-center justify-start relative overflow-hidden">
      
      {/* BACKGROUND DE PARTÍCULAS (DISCRETO) */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [-10, 10, -10],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{ duration: 3 + i, repeat: Infinity }}
            className="absolute w-px h-px bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]"
            style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
          />
        ))}
      </div>

      <AnimatePresence>
        {showSavedToast && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-3xl flex flex-col items-center justify-center text-center space-y-6 p-8"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1], rotate: [0, 10, 0] }}
              className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.2)]"
            >
              <ShieldCheck size={48} />
            </motion.div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">Segredo Guardado</h2>
              <p className="text-emerald-500/60 font-mono text-[10px] tracking-[0.4em] uppercase">
                A sete chaves. Aqui sua mente encontra solo firme.
              </p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSavedToast(false)}
              className="px-10 py-4 bg-white text-black font-black rounded-full text-xs uppercase tracking-widest mt-8"
            >
              Voltar ao Silêncio
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        animate={isBurning ? { x: [-3, 3, -3, 3, 0], y: [-2, 2, -2, 2, 0] } : {}}
        transition={{ duration: 0.1, repeat: 10 }}
        className="w-full flex flex-col p-6 md:p-12 lg:p-16 relative z-10 h-screen"
      >
        
        {/* INTERFACE TERMINAL */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 md:mb-12">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/')}
              className="p-3 border border-white/10 text-white/40 hover:text-white hover:border-white/30 rounded-2xl transition-all bg-white/5"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                <span className="text-xs font-mono tracking-[0.4em] text-emerald-500/60 uppercase font-black">
                  Terminal_Private_Vault
                </span>
              </div>
              <h1 className="text-white/20 text-[11px] font-mono uppercase tracking-[0.2em] mt-1">Status: Encrypted_Connection_Established</h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={isSaving || isBurning || !text}
              className="flex-1 md:flex-none px-8 py-4 bg-emerald-500 text-black rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(16,185,129,0.3)] disabled:opacity-20 flex items-center justify-center gap-2"
            >
              <Lock size={16} />
              {isSaving ? 'TRANCANDO...' : 'Selar Segredo'}
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBurn}
              disabled={isBurning || isSaving || !text}
              className="flex-1 md:flex-none px-8 py-4 border border-orange-500/30 text-orange-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-500/10 disabled:opacity-20 flex items-center justify-center gap-2"
            >
              <Flame size={16} />
              Queimar
            </motion.button>
          </div>
        </div>

        {/* ÁREA DE TEXTO */}
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.textarea
              key="terminal-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              spellCheck={false}
              autoFocus
              animate={isBurning ? { 
                color: ["#10b981", "#f97316", "#ef4444"],
                y: -150,
                filter: "blur(30px) drop-shadow(0 0 50px #ef4444)",
                opacity: 0,
                scale: 0.8
              } : (isSaving ? { 
                opacity: 0, 
                scale: 0.9, 
                filter: "blur(20px)",
                y: 50 
              } : { opacity: 1, scale: 1 })}
              transition={{ 
                duration: isSaving ? 1.5 : 2, 
                ease: "easeInOut" 
              }}
              placeholder="ESCREVA AQUI O QUE PESA EM SUA MENTE..."
              className={`
                w-full h-full bg-transparent font-mono text-lg md:text-2xl lg:text-4xl 
                outline-none resize-none leading-[1.2] tracking-tight
                placeholder:text-emerald-500/10 placeholder:text-lg md:placeholder:text-xl lg:placeholder:text-2xl
                scrollbar-hide
                ${isBurning || isSaving ? 'pointer-events-none' : 'text-emerald-500/80'}
              `}
            />
          </AnimatePresence>

          {/* Efeito Visual de Fogo */}
          {isBurning && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.4, 0], y: -300, scale: [1, 2, 4] }}
              transition={{ duration: 2.5 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <Flame size={300} className="text-orange-500/40 blur-[80px]" />
            </motion.div>
          )}
        </div>

        {/* FOOTER */}
        <div className="mt-4 mb-2 flex flex-col md:flex-row items-center gap-3 border-t border-white/10 pt-4">
          <div className="flex items-center gap-3">
            <Key size={14} className="text-emerald-500" />
            <p className="text-[10px] font-mono text-emerald-500 tracking-[0.4em] uppercase font-black">
              Criptografia Neural Ativa
            </p>
          </div>
          <div className="h-px flex-1 bg-white/5 hidden md:block" />
          <div className="flex flex-col items-end gap-0.5">
            <p className="text-xs font-black text-white tracking-[0.2em] uppercase italic">
              O que acontece na Âncora fica na Âncora.
            </p>
            <p className="text-[9px] font-mono text-emerald-500/40 tracking-[0.4em] uppercase font-black">
              Ninguém além de você lê o que está aqui.
            </p>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
