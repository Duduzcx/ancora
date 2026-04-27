"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Headphones } from 'lucide-react';
import useSound from 'use-sound';
import { useAudio } from '@/context/AudioContext';

export default function AudioPlayer() {
  const { isMuted, setIsMuted } = useAudio();
  
  const [playOcean, { stop, sound }] = useSound('/sounds/ocean-waves.mp3', {
    volume: 0.4,
    loop: true,
    interrupt: true,
  });

  useEffect(() => {
    if (!isMuted) {
      playOcean();
    } else {
      stop();
    }
    return () => stop();
  }, [isMuted, playOcean, stop]);

  return (
    <div className="fixed bottom-6 left-6 z-[200]">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsMuted(!isMuted)}
        className={`
          relative group p-4 rounded-2xl backdrop-blur-xl border shadow-2xl transition-all duration-500
          ${isMuted 
            ? 'bg-white/10 border-white/20 text-slate-400' 
            : 'bg-slate-900 border-slate-800 text-emerald-400'}
        `}
      >
        <AnimatePresence mode="wait">
          {isMuted ? (
            <motion.div
              key="muted"
              initial={{ opacity: 0, rotate: -20 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 20 }}
            >
              <VolumeX size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="unmuted"
              initial={{ opacity: 0, rotate: -20 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 20 }}
              className="relative"
            >
              <Volume2 size={24} />
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-emerald-500 rounded-full -z-10"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tooltip */}
        <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          <div className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-2xl">
            {isMuted ? 'Ativar Imersão' : 'Silenciar'}
          </div>
        </div>
      </motion.button>
    </div>
  );
}
