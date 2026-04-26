"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Lock, ShieldCheck, Key, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CofrePage() {
  const [hasStarted, setHasStarted] = useState(false);
  const [text, setText] = useState('');
  const [isBurning, setIsBurning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const router = useRouter();

  const handleSave = () => {
    if (!text) return;
    setIsSaving(true);
    localStorage.setItem('ancora_vault_latest', text);
    
    setTimeout(() => {
      setIsSaving(false);
      setShowSavedToast(true);
      setText('');
      setTimeout(() => setShowSavedToast(false), 4000);
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
    <main className="flex flex-col h-[100dvh] overflow-hidden bg-slate-950 relative md:pl-64 transition-all">
      
      {/* BACKGROUND DE PARTÍCULAS (DISCRETO) */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
        {[...Array(15)].map((_, i) => (
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

      <AnimatePresence mode="wait">
        {!hasStarted ? (
          <motion.div 
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl flex items-center justify-center text-emerald-400 mb-8 shadow-2xl"
            >
              <Lock size={32} />
            </motion.div>
            <h2 className="text-4xl font-black text-white tracking-tighter mb-4 uppercase italic">O Cofre</h2>
            <p className="text-emerald-500/60 font-mono text-[10px] tracking-[0.3em] uppercase max-w-xs leading-relaxed mb-10">
              Espaço sagrado para o que não pode ser dito, apenas guardado.
            </p>
            <div className="flex flex-col gap-4 w-full max-w-xs">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setHasStarted(true)}
                className="w-full py-5 bg-white text-black font-black rounded-3xl text-xs uppercase tracking-widest shadow-xl"
              >
                Abrir Santuário
              </motion.button>
              <button 
                onClick={() => router.push('/')}
                className="text-white/40 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
              >
                Voltar ao Início
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="vault-content"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col p-6 md:p-12 relative z-10 overflow-hidden"
          >
            {/* Header Flex-none */}
            <div className="flex-none flex items-center gap-4 mb-8">
              <button 
                onClick={() => setHasStarted(false)}
                className="p-3 border border-white/10 text-white/40 hover:text-white rounded-2xl bg-white/5 transition-all"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                  <span className="text-[10px] font-mono tracking-[0.4em] text-emerald-500/60 uppercase font-black">
                    Santuário Ativo
                  </span>
                </div>
              </div>
            </div>

            {/* ÁREA DE TEXTO Flex-1 */}
            <div className="flex-1 relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.textarea
                  key="terminal-input"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  spellCheck={false}
                  animate={isBurning ? { 
                    color: ["#10b981", "#f97316", "#ef4444"],
                    y: -150,
                    filter: "blur(30px)",
                    opacity: 0,
                    scale: 0.8
                  } : (isSaving ? { 
                    opacity: 0, 
                    scale: 0.9, 
                    filter: "blur(20px)",
                    y: 50 
                  } : { opacity: 1, scale: 1 })}
                  transition={{ duration: 1.5 }}
                  placeholder="ESCREVA O QUE PESA EM SUA MENTE..."
                  className={`
                    w-full h-full bg-transparent font-mono text-xl md:text-3xl lg:text-4xl 
                    outline-none resize-none leading-relaxed tracking-tight
                    placeholder:text-emerald-500/20 scrollbar-hide
                    ${isBurning || isSaving ? 'pointer-events-none' : 'text-emerald-500/80'}
                  `}
                />
              </AnimatePresence>

              {isBurning && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.4, 0], y: -200, scale: [1, 2, 3] }}
                  transition={{ duration: 2 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <Flame size={200} className="text-orange-500/40 blur-[60px]" />
                </motion.div>
              )}
            </div>

            {/* BOTÕES Flex-none */}
            <div className="flex-none flex flex-col md:flex-row gap-4 pt-6 pb-safe border-t border-white/5">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={isSaving || isBurning || !text}
                className="flex-1 py-4.5 bg-emerald-500 text-black rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg disabled:opacity-20 flex items-center justify-center gap-2"
              >
                <Lock size={16} />
                {isSaving ? 'TRANCANDO...' : 'Selar Segredo'}
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBurn}
                disabled={isBurning || isSaving || !text}
                className="flex-1 py-4.5 border border-orange-500/30 text-orange-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-500/10 transition-all disabled:opacity-20 flex items-center justify-center gap-2"
              >
                <Flame size={16} />
                Queimar Tudo
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSavedToast && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center text-center p-8"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-400 mb-6 shadow-2xl"
            >
              <ShieldCheck size={40} />
            </motion.div>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase mb-2">Segredo Guardado</h2>
            <p className="text-emerald-500/60 font-mono text-[10px] tracking-[0.3em] uppercase mb-10">A sete chaves.</p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSavedToast(false)}
              className="px-12 py-5 bg-white text-black font-black rounded-3xl text-xs uppercase tracking-widest shadow-2xl"
            >
              Voltar ao Silêncio
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
