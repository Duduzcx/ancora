"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Lock, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function CofrePage() {
  const [text, setText] = useState('');
  const [isBurning, setIsBurning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);

  const handleSave = () => {
    if (!text) return;
    setIsSaving(true);
    // Simula salvamento local
    localStorage.setItem('ancora_vault_latest', text);
    
    setTimeout(() => {
      setIsSaving(false);
      setShowSavedToast(true);
      setText(''); // A mensagem some após ser guardada
      setTimeout(() => setShowSavedToast(false), 3000);
    }, 1000);

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
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden">
      
      {/* Toast de Salvamento */}
      <AnimatePresence>
        {showSavedToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-12 left-1/2 -translate-x-1/2 px-6 py-3 bg-emerald-500 text-black font-black rounded-full flex items-center gap-3 shadow-[0_0_30px_rgba(16,185,129,0.4)] z-[110]"
          >
            <CheckCircle2 size={18} />
            PENSAMENTO GUARDADO NO COFRE
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        animate={isBurning ? { x: [-3, 3, -3, 3, 0], y: [-2, 2, -2, 2, 0] } : {}}
        transition={{ duration: 0.1, repeat: 10 }}
        className="w-full max-w-5xl h-full flex flex-col p-12"
      >
        
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <motion.div 
              animate={isSaving ? { scale: [1, 1.4, 1], rotate: [0, 180, 360] } : {}}
              className="w-8 h-8 flex items-center justify-center text-emerald-500/50"
            >
              <Lock size={20} />
            </motion.div>
            <span className="text-[10px] font-mono tracking-[0.4em] text-emerald-500/30 uppercase">
              Terminal_Cofre_V3.2
            </span>
          </div>

          <div className="flex gap-6">
            <button 
              onClick={handleSave}
              disabled={isSaving || !text}
              className="px-10 py-4 rounded-full border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-all uppercase tracking-widest text-xs font-black disabled:opacity-30"
            >
              {isSaving ? 'TRANCANDO...' : 'Guardar no Cofre'}
            </button>
            <button 
              onClick={handleBurn}
              disabled={isBurning || !text}
              className="px-10 py-4 rounded-full border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 hover:text-orange-300 hover:shadow-[0_0_20px_rgba(249,115,22,0.2)] transition-all uppercase tracking-widest text-xs font-black disabled:opacity-30"
            >
              Queimar Mensagem
            </button>
          </div>
        </div>

        <div className="flex-1 relative">
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
                filter: "blur(25px) drop-shadow(0 0 50px #ef4444)",
                opacity: 0,
                scale: 0.8
              } : (isSaving ? { opacity: 0.3, scale: 0.98 } : { opacity: 1, scale: 1 })}
              transition={{ 
                duration: 2, 
                ease: "easeOut" 
              }}
              placeholder="TRANSFIRA SEUS PENSAMENTOS PARA O TERMINAL..."
              className={`
                w-full h-full bg-transparent font-mono text-2xl md:text-5xl 
                outline-none resize-none leading-relaxed tracking-tighter
                placeholder:text-slate-500/40 scrollbar-hide
                ${isBurning || isSaving ? 'pointer-events-none' : 'text-emerald-400'}
              `}
            />
          </AnimatePresence>

          {isBurning && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0], y: -200, scale: [1, 2, 3] }}
              transition={{ duration: 2.5 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <Flame size={200} className="text-orange-600/30 blur-3xl" />
            </motion.div>
          )}
        </div>

        <div className="mt-12 flex items-center gap-4 border-t border-white/5 pt-8">
          <ShieldAlert size={14} className="text-emerald-500/40" />
          <p className="text-xs font-mono text-emerald-500/60 tracking-[0.3em] uppercase">
            O QUE ACONTECE NA ÂNCORA, FICA NA ÂNCORA.
          </p>
        </div>

      </motion.div>
    </div>
  );
}
