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
    <main className="flex flex-col h-[100dvh] w-full overflow-hidden bg-slate-950 relative md:pl-64 transition-all overscroll-none touch-pan-y">
      
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
            <div className="flex-1 min-h-0 relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.textarea
                  key="terminal-input"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  spellCheck={false}
                  animate={isBurning ? { 
                    color: ["#10b981", "#f97316", "#ef4444", "#333"],
                    y: -300,
                    filter: ["blur(0px)", "blur(10px)", "blur(40px)"],
                    opacity: 0,
                    scale: [1, 1.2, 0.5],
                    rotate: [0, 5, -5, 0]
                  } : (isSaving ? { 
                    opacity: 0, 
                    scale: 0.2, 
                    filter: "blur(20px)",
                    y: 200,
                    rotate: 180
                  } : { opacity: 1, scale: 1 })}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  placeholder="ESCREVA O QUE PESA EM SUA MENTE..."
                  className={`
                    w-full h-full bg-transparent font-mono text-xl md:text-3xl lg:text-4xl 
                    outline-none resize-none leading-relaxed tracking-tight
                    placeholder:text-emerald-500/20 scrollbar-hide
                    ${isBurning || isSaving ? 'pointer-events-none' : 'text-emerald-500/80'}
                  `}
                />
              </AnimatePresence>

              {/* Animação de Queimar Melhorada */}
              {isBurning && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 100, scale: 0 }}
                      animate={{ 
                        opacity: [0, 0.8, 0], 
                        y: [-100, -400 - (i * 20)], 
                        x: [(i - 6) * 30, (i - 6) * 60],
                        scale: [1, 3, 0],
                        rotate: i * 30
                      }}
                      transition={{ duration: 1.5, delay: i * 0.05 }}
                      className="absolute text-orange-500"
                    >
                      <Flame size={40 + (i * 10)} className="blur-[2px]" />
                    </motion.div>
                  ))}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 2 }}
                    className="absolute inset-0 bg-orange-500/20 blur-[100px]"
                  />
                </div>
              )}

              {/* Animação de Salvar Melhorada */}
              {isSaving && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <motion.div
                    initial={{ scale: 5, opacity: 0, rotate: -180 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ duration: 1, ease: "backOut" }}
                    className="text-emerald-500"
                  >
                    <ShieldCheck size={150} strokeWidth={1} />
                  </motion.div>
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                    transition={{ duration: 1 }}
                    className="absolute w-64 h-64 border-4 border-emerald-500 rounded-full"
                  />
                </div>
              )}
            </div>

            {/* BOTÕES Flex-none */}
            <div className="flex-none shrink-0 flex flex-col md:flex-row gap-3 pt-4 pb-6 border-t border-white/5 bg-slate-950/80 backdrop-blur-sm">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={isSaving || isBurning || !text}
                className="flex-1 py-3.5 bg-emerald-500 text-black rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg disabled:opacity-20 flex items-center justify-center gap-2"
              >
                <Lock size={14} />
                {isSaving ? 'SELANDO...' : 'Selar Segredo'}
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBurn}
                disabled={isBurning || isSaving || !text}
                className="flex-1 py-3.5 border border-orange-500/30 text-orange-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-500/10 transition-all disabled:opacity-20 flex items-center justify-center gap-2"
              >
                <Flame size={14} />
                {isBurning ? 'QUEIMANDO...' : 'Queimar Tudo'}
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
